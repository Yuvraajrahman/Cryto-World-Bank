#!/usr/bin/env npx tsx
/**
 * Seed World $1B USDC and cascade 70% → Nationals → Locals → Clients.
 *
 * Prerequisites:
 *   npm run db:seed:testing
 *
 * Usage:
 *   cd backend && npm run db:seed:capital
 *   npm run db:seed:capital -- --seed 99 --no-loans
 *   npm run db:seed:capital -- --util 0.45 --installments
 *
 * Flags:
 *   --seed N           RNG seed (default 42)
 *   --capital N        World reserve USDC (default 1000000000)
 *   --distribute R     Fraction pushed down (default 0.7)
 *   --reserve R        Min reserve ratio per bank (default 0.15)
 *   --util R           Target local loan utilization (default 0.5)
 *   --no-loans         Only set InstitutionCapital (no Loan rows)
 *   --installments     Also create installment schedules
 *   --keep-loans       Do not delete prior cascade loans
 *   --keep-capital     Do not wipe InstitutionCapital first
 *   --sync-memory      Sync Prisma capital into backend/.data/state.json banks
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { runCapitalCascade } from "../src/services/capitalCascade";

const prisma = new PrismaClient();

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function arg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1] && !process.argv[idx + 1]!.startsWith("--")) {
    return process.argv[idx + 1]!;
  }
  return fallback;
}

function usd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

async function syncMemoryBanks() {
  const { syncBanksFromPrisma } = await import("../src/db/banksSync");
  const r = await syncBanksFromPrisma();
  console.log(`  Synced ${r.count} banks into memory/.data/state.json`);
}

async function writeReport(
  summary: Awaited<ReturnType<typeof runCapitalCascade>>,
  outDir: string,
) {
  fs.mkdirSync(outDir, { recursive: true });

  const nationals = await prisma.$queryRawUnsafe<
    Array<{ name: string; reserve: number; allocated: number; lent: number }>
  >(`
    SELECT i.name,
           COALESCE(c."reserveEth", 0) AS reserve,
           COALESCE(c."allocatedEth", 0) AS allocated,
           COALESCE(c."lentEth", 0) AS lent
    FROM "Institution" i
    LEFT JOIN "InstitutionCapital" c ON c."institutionId" = i.id
    WHERE i."institutionType" = 'NATIONAL'
    ORDER BY i.name
  `);

  const locals = await prisma.$queryRawUnsafe<
    Array<{
      nation: string;
      local_name: string;
      region: string | null;
      reserve: number;
      allocated: number;
      lent: number;
      active_loans: number;
    }>
  >(`
    SELECT nb.name AS nation,
           i.name AS local_name,
           lb.region AS region,
           COALESCE(c."reserveEth", 0) AS reserve,
           COALESCE(c."allocatedEth", 0) AS allocated,
           COALESCE(c."lentEth", 0) AS lent,
           COALESCE(c."activeLoanCount", 0) AS active_loans
    FROM "Institution" i
    JOIN "LocalBank" lb ON lb."institutionId" = i.id
    JOIN "Institution" nb ON nb.id = lb."parentNationalBankId"
    LEFT JOIN "InstitutionCapital" c ON c."institutionId" = i.id
    WHERE i."institutionType" = 'LOCAL'
    ORDER BY nb.name, i.name
  `);

  const natCsv = [
    "nation,reserve_usdc,allocated_usdc,lent_usdc,total_usdc",
    ...nationals.map(
      (r) =>
        `${JSON.stringify(r.name)},${r.reserve},${r.allocated},${r.lent},${Number(r.reserve) + Number(r.allocated) + Number(r.lent)}`,
    ),
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "capital_nationals.csv"), natCsv + "\n");

  const locCsv = [
    "nation,local_bank,region,reserve_usdc,allocated_usdc,lent_usdc,active_loans,total_usdc",
    ...locals.map(
      (r) =>
        `${JSON.stringify(r.nation)},${JSON.stringify(r.local_name)},${JSON.stringify(r.region || "")},${r.reserve},${r.allocated},${r.lent},${r.active_loans},${Number(r.reserve) + Number(r.allocated) + Number(r.lent)}`,
    ),
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "capital_locals.csv"), locCsv + "\n");

  const md = [
    "# Capital cascade report",
    "",
    `- World reserve (initial): ${usd(summary.worldReserveUsdc)}`,
    `- Distributed (70%): ${usd(summary.distributedUsdc)}`,
    `- Retained at World: ${usd(summary.retainedAtWorldUsdc)}`,
    `- Nationals: ${summary.nationalCount} · mean share ${usd(summary.meanNationalShareUsdc)} · range ${usd(summary.minNationalShareUsdc)} – ${usd(summary.maxNationalShareUsdc)}`,
    `- Locals: ${summary.localCount} · mean share ${usd(summary.meanLocalShareUsdc)} · range ${usd(summary.minLocalShareUsdc)} – ${usd(summary.maxLocalShareUsdc)}`,
    `- National reserves: ${usd(summary.nationalReserveUsdc)}`,
    `- Local reserves: ${usd(summary.localReserveUsdc)}`,
    `- Local unused pool (allocated): ${usd(summary.localAllocatedUsdc)}`,
    `- Client loan book (lent): ${usd(summary.localLentUsdc)}`,
    `- Client loans created: ${summary.clientLoansCreated} · mean ${usd(summary.meanClientLoanUsdc)}`,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "capital_cascade_report.md"), md);
}

async function main() {
  const seed = Number(arg("seed", "42"));
  const capital = Number(arg("capital", "1000000000"));
  const distribute = Number(arg("distribute", "0.7"));
  const reserve = Number(arg("reserve", "0.15"));
  const util = Number(arg("util", "0.5"));

  console.log("\n▸ Capital cascade seed");
  console.log(`  World: ${usd(capital)} · distribute ${(distribute * 100).toFixed(0)}% · reserve floor ${(reserve * 100).toFixed(0)}% · util ${(util * 100).toFixed(0)}%`);
  console.log(`  Seed: ${seed} · loans: ${flag("no-loans") ? "off" : "on"} · installments: ${flag("installments") ? "on" : "off"}\n`);

  const t0 = Date.now();
  const summary = await runCapitalCascade(prisma, {
    worldReserveUsdc: capital,
    distributeRatio: distribute,
    minReserveRatio: reserve,
    targetUtilization: util,
    seed,
    createLoanRecords: !flag("no-loans"),
    createInstallments: flag("installments"),
    resetCascadeLoans: !flag("keep-loans"),
    resetCapital: !flag("keep-capital"),
  });

  const outDir = path.join(process.cwd(), ".data");
  await writeReport(summary, outDir);

  if (flag("sync-memory") || process.env.SYNC_MEMORY === "1") {
    await syncMemoryBanks();
  }

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("Summary");
  console.log(`  World retained:     ${usd(summary.retainedAtWorldUsdc)}`);
  console.log(`  Distributed:        ${usd(summary.distributedUsdc)}`);
  console.log(`  Nationals:          ${summary.nationalCount}  mean ${usd(summary.meanNationalShareUsdc)}  [${usd(summary.minNationalShareUsdc)} … ${usd(summary.maxNationalShareUsdc)}]`);
  console.log(`  Locals:             ${summary.localCount}  mean ${usd(summary.meanLocalShareUsdc)}  [${usd(summary.minLocalShareUsdc)} … ${usd(summary.maxLocalShareUsdc)}]`);
  console.log(`  NB reserves:        ${usd(summary.nationalReserveUsdc)}`);
  console.log(`  LB reserves:        ${usd(summary.localReserveUsdc)}`);
  console.log(`  LB unused pool:     ${usd(summary.localAllocatedUsdc)}`);
  console.log(`  Client loan book:   ${usd(summary.localLentUsdc)}  (${summary.clientLoansCreated} loans, mean ${usd(summary.meanClientLoanUsdc)})`);
  console.log(`\n  Reports → backend/.data/capital_*.csv + capital_cascade_report.md`);
  console.log(`  Done in ${sec}s\n`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
