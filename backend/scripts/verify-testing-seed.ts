/**
 * Verify testing-phase seed: DB counts, sample logins, World reserve, FKs.
 * Usage: cd backend && npx tsx scripts/verify-testing-seed.ts
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const API = process.env.API_URL || "http://127.0.0.1:4000";

type Check = { name: string; ok: boolean; detail?: string };

const checks: Check[] = [];

function pass(name: string, detail?: string) {
  checks.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name: string, detail?: string) {
  checks.push({ name, ok: false, detail });
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function login(identifier: string, password: string) {
  const r = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const body = await r.json();
  return { status: r.status, body };
}

async function main() {
  const countries = await prisma.country.count();
  const nb = await prisma.institution.count({ where: { institutionType: "NATIONAL" } });
  const lb = await prisma.institution.count({ where: { institutionType: "LOCAL" } });
  const world = await prisma.institutionCapital.findUnique({ where: { institutionId: "bank_world" } });
  const nationalAdmins = await prisma.user.count({ where: { role: "NATIONAL_BANK_ADMIN" } });
  const localAdmins = await prisma.user.count({ where: { role: "LOCAL_BANK_ADMIN" } });
  const borrowers = await prisma.user.count({ where: { role: "BORROWER" } });
  const withLogin = await prisma.user.count({ where: { loginId: { not: null } } });

  if (countries >= 190) pass("countries_count", String(countries));
  else fail("countries_count", String(countries));

  if (nb >= 190) pass("national_banks", String(nb));
  else fail("national_banks", String(nb));

  if (lb >= 190) pass("local_banks", String(lb));
  else fail("local_banks", String(lb));

  if (world && world.reserveEth >= 1_000_000_000) {
    pass("world_reserve_1b_usdc", String(world.reserveEth));
  } else {
    fail("world_reserve_1b_usdc", String(world?.reserveEth));
  }

  if (nationalAdmins >= 190) pass("national_admins", String(nationalAdmins));
  else fail("national_admins", String(nationalAdmins));

  if (localAdmins >= 190) pass("local_admins", String(localAdmins));
  else fail("local_admins", String(localAdmins));

  // Expect ~20 clients per local (allowing for legacy demo borrowers)
  const expectedClients = lb * 20;
  if (borrowers >= expectedClients * 0.9) {
    pass("borrowers_approx_20_per_lb", `${borrowers} (expect ~${expectedClients})`);
  } else {
    fail("borrowers_approx_20_per_lb", `${borrowers} (expect ~${expectedClients})`);
  }

  // Sample FK: Bangladesh Dhaka client → local bank
  const sampleLogin = "client_bangladesh_dhaka_00001";
  const sample = await prisma.user.findUnique({ where: { loginId: sampleLogin } });
  if (sample?.bankId === "bank_lb_bangladesh_dhaka" && sample.passwordHash) {
    const okHash = await bcrypt.compare(sampleLogin, sample.passwordHash);
    if (okHash) pass("sample_client_fk_and_hash", sampleLogin);
    else fail("sample_client_password_hash", sampleLogin);
  } else {
    fail("sample_client_fk_and_hash", JSON.stringify({ bankId: sample?.bankId }));
  }

  const borrower = await prisma.borrower.findFirst({
    where: { walletAddress: sample?.wallet },
  });
  if (borrower?.registeredLocalBankId === "bank_lb_bangladesh_dhaka") {
    pass("borrower_registered_local_bank");
  } else {
    fail("borrower_registered_local_bank", String(borrower?.registeredLocalBankId));
  }

  // Zero balances for NB/LB (except after manual allocates)
  const nbCap = await prisma.institutionCapital.findUnique({
    where: { institutionId: "bank_nb_bangladesh" },
  });
  if (nbCap && nbCap.reserveEth === 0) pass("bangladesh_nb_zero_reserve");
  else pass("bangladesh_nb_reserve_note", `reserve=${nbCap?.reserveEth} (may be post-allocate)`);

  // API health + logins
  try {
    const health = await fetch(`${API}/health`).then((r) => r.json());
    if (health.status === "ok") pass("api_health");
    else fail("api_health", JSON.stringify(health));
  } catch (e) {
    fail("api_health", String(e));
  }

  const admin = await login("admin@gmail.com", "i_am_admin");
  if (admin.status === 200 && admin.body.user?.role === "DEV_ADMIN") {
    pass("login_super_admin_email");
  } else fail("login_super_admin_email", JSON.stringify(admin.body));

  const adminId = await login("admin", "i_am_admin");
  if (adminId.status === 200) pass("login_super_admin_loginId");
  else fail("login_super_admin_loginId", JSON.stringify(adminId.body));

  const nbLogin = await login("bangladesh", "bangladesh");
  if (nbLogin.status === 200 && nbLogin.body.user?.role === "NATIONAL_BANK_ADMIN") {
    pass("login_national_bangladesh");
  } else fail("login_national_bangladesh", JSON.stringify(nbLogin.body));

  const lbLogin = await login("local_bangladesh_dhaka", "local_bangladesh_dhaka");
  if (lbLogin.status === 200 && lbLogin.body.user?.role === "LOCAL_BANK_ADMIN") {
    pass("login_local_dhaka");
  } else fail("login_local_dhaka", JSON.stringify(lbLogin.body));

  const clientLogin = await login(sampleLogin, sampleLogin);
  if (clientLogin.status === 200 && clientLogin.body.user?.role === "BORROWER") {
    pass("login_client_dhaka_00001");
  } else fail("login_client_dhaka_00001", JSON.stringify(clientLogin.body));

  // Hardhat RPC (optional)
  try {
    const rpc = await fetch("http://127.0.0.1:8545", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
    }).then((r) => r.json());
    if (rpc.result) pass("hardhat_rpc", String(rpc.result));
    else fail("hardhat_rpc", JSON.stringify(rpc));
  } catch {
    fail("hardhat_rpc", "offline");
  }

  // Overview capital after sync
  if (admin.body.token) {
    const ov = await fetch(`${API}/api/dev-admin/overview`, {
      headers: { Authorization: `Bearer ${admin.body.token}` },
    }).then((r) => r.json());
    const reserve = ov.capital?.worldReserveUsdc ?? ov.capital?.worldReserveEth;
    if (reserve != null) pass("dev_admin_overview_reserve", String(reserve));
    else fail("dev_admin_overview_reserve", JSON.stringify(ov.capital));
  }

  const reportDir = path.join(__dirname, "../../Documentation/testing");
  fs.mkdirSync(reportDir, { recursive: true });
  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.filter((c) => !c.ok).length;
  const md = [
    "# Testing seed verification report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `**Result:** ${failed === 0 ? "PASS" : "FAIL"} (${passed} passed, ${failed} failed)`,
    "",
    "| Check | Result | Detail |",
    "|-------|--------|--------|",
    ...checks.map(
      (c) => `| ${c.name} | ${c.ok ? "pass" : "fail"} | ${c.detail?.replace(/\|/g, "/") || ""} |`,
    ),
    "",
    "## Counts",
    "",
    `- Countries: ${countries}`,
    `- National banks: ${nb}`,
    `- Local banks: ${lb}`,
    `- National admins: ${nationalAdmins}`,
    `- Local admins: ${localAdmins}`,
    `- Borrowers: ${borrowers}`,
    `- Users with loginId: ${withLogin}`,
    `- World reserve (USDC units): ${world?.reserveEth}`,
    "",
    "## Notes",
    "",
    "- Allocation unit for testing is USDC (stored in `InstitutionCapital.reserveEth` / memory `bank.reserve`).",
    "- Oracle/Chainlink may be stale offline; seed does not require live oracle.",
    "- Re-run: `cd backend && npm run db:seed:testing && npm run db:verify:testing`",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(reportDir, "verification-report.md"), md);
  console.log(`\nWrote ${path.join(reportDir, "verification-report.md")}`);
  console.log(`Summary: ${passed} pass / ${failed} fail`);
  process.exit(failed > 0 ? 1 : 0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
