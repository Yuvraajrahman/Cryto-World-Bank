/**
 * Live UI↔backend consistency smoke against a running API (default :4000).
 * Usage: npx tsx scripts/smoke-ui-backend.ts
 */
import "dotenv/config";

const BASE = process.env.API_BASE || "http://127.0.0.1:4000";

type Check = { name: string; ok: boolean; detail?: string };

async function login(userId: string): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/dev-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: "0x0000000000000000000000000000000000000000",
      userId,
    }),
  });
  if (!res.ok) throw new Error(`login ${userId}: ${res.status} ${await res.text()}`);
  const body = (await res.json()) as { token: string };
  return body.token;
}

async function req(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    /* empty */
  }
  return { status: res.status, json };
}

function expectStatus(name: string, status: number, want: number | number[]): Check {
  const ok = Array.isArray(want) ? want.includes(status) : status === want;
  return { name, ok, detail: ok ? `HTTP ${status}` : `expected ${want}, got ${status}` };
}

function expectKeys(name: string, obj: Record<string, unknown>, keys: string[]): Check {
  const missing = keys.filter((k) => !(k in obj));
  return {
    name,
    ok: missing.length === 0,
    detail: missing.length ? `missing ${missing.join(", ")}` : "shape ok",
  };
}

async function main() {
  const checks: Check[] = [];
  console.log(`Smoke against ${BASE}\n`);

  // --- Client (BORROWER) deposits surface ---
  const borrower = await login("usr_borrower_demo");
  {
    const sum = await req(borrower, "GET", "/api/deposits/summary");
    checks.push(expectStatus("client deposits summary", sum.status, 200));
    checks.push(
      expectKeys("summary fields", sum.json, [
        "checkingUsdc",
        "fiatUsd",
        "ethBalance",
        "fx",
        "vaultEth",
      ]),
    );

    const conv = await req(borrower, "POST", "/api/deposits/convert/usd-to-usdc", {
      amountUsd: 5,
    });
    checks.push(expectStatus("USD→USDC convert", conv.status, [201, 400]));

    const fx = await req(borrower, "POST", "/api/deposits/fx/swap", {
      side: "USDC_TO_ETH",
      amount: 1,
    });
    checks.push(expectStatus("retail FX swap", fx.status, [201, 400]));

    const st = await req(borrower, "GET", "/api/deposits/statement");
    checks.push(expectStatus("account statement", st.status, 200));
    checks.push(expectKeys("statement fields", st.json, ["balances", "entries", "account"]));

    const groups = await req(borrower, "GET", "/api/groups/mine");
    checks.push(expectStatus("groups mine", groups.status, 200));

    const lenders = await req(borrower, "GET", "/api/loans/lenders");
    checks.push(expectStatus("loan lenders", lenders.status, 200));
  }

  // --- Local admin facilities + treasury ---
  const lb = await login("usr_lb_admin_dhaka");
  {
    const fac = await req(lb, "GET", "/api/facilities/overview");
    checks.push(expectStatus("local facilities overview", fac.status, 200));
    checks.push(
      expectKeys("facilities fields", fac.json, [
        "me",
        "peers",
        "parent",
        "interbank",
        "upward",
        "tenors",
      ]),
    );
    const me = fac.json.me as { tier?: string } | undefined;
    checks.push({
      name: "local facilities actor tier",
      ok: me?.tier === "LOCAL",
      detail: `tier=${me?.tier}`,
    });

    const tre = await req(lb, "GET", "/api/treasury/overview");
    checks.push(expectStatus("local treasury overview", tre.status, 200));
    checks.push(expectKeys("treasury fields", tre.json, ["me", "counterparties"]));

    const dash = await req(lb, "GET", "/api/local-bank/dashboard");
    checks.push(expectStatus("local dashboard", dash.status, 200));
  }

  // --- Approver must be denied facilities/treasury (UI guard matches API) ---
  const approver = await login("usr_approver_dhaka");
  {
    const fac = await req(approver, "GET", "/api/facilities/overview");
    checks.push(expectStatus("approver denied facilities", fac.status, 403));
    const tre = await req(approver, "GET", "/api/treasury/overview");
    checks.push(expectStatus("approver denied treasury", tre.status, 403));
    const dash = await req(approver, "GET", "/api/local-bank/dashboard");
    checks.push(expectStatus("approver local dashboard ok", dash.status, 200));
  }

  // --- National ---
  const nb = await login("usr_nb_admin_bd");
  {
    const fac = await req(nb, "GET", "/api/facilities/overview");
    checks.push(expectStatus("national facilities", fac.status, 200));
    const me = fac.json.me as { tier?: string } | undefined;
    checks.push({
      name: "national facilities actor tier",
      ok: me?.tier === "NATIONAL",
      detail: `tier=${me?.tier}`,
    });
    const cap = await req(nb, "GET", "/api/national-bank/capital");
    checks.push(expectStatus("national capital", cap.status, 200));
    const dash = await req(nb, "GET", "/api/national-bank/dashboard");
    checks.push(expectStatus("national dashboard", dash.status, 200));
  }

  // --- World ---
  const world = await login("usr_governor");
  {
    const fac = await req(world, "GET", "/api/facilities/overview");
    checks.push(expectStatus("world facilities", fac.status, 200));
    const me = fac.json.me as { tier?: string } | undefined;
    checks.push({
      name: "world facilities actor tier",
      ok: me?.tier === "WORLD",
      detail: `tier=${me?.tier}`,
    });
    const tre = await req(world, "GET", "/api/treasury/overview");
    checks.push(expectStatus("world treasury", tre.status, 200));
    const dash = await req(world, "GET", "/api/world-bank/dashboard");
    checks.push(expectStatus("world dashboard", dash.status, 200));
  }

  // --- Frontend route sanity (Vite) ---
  try {
    const fe = await fetch("http://127.0.0.1:5173/");
    checks.push(expectStatus("frontend home", fe.status, 200));
  } catch (err) {
    checks.push({ name: "frontend home", ok: false, detail: String(err) });
  }

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  }
  console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
