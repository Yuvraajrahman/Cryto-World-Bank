#!/usr/bin/env npx tsx
/**
 * CLI entry for Phase 2 economy simulation (same service as Dev Admin API).
 *
 * Usage:
 *   cd backend && npm run db:simulate
 *   cd backend && npm run db:simulate -- --capital 1000000000 --seed 99
 */
import "dotenv/config";
import { simulateEconomy } from "../src/services/simulateEconomy";
import { ensureSimulationConfig } from "../src/services/simulationConfig";

function arg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1]!;
  return fallback;
}

async function main() {
  await ensureSimulationConfig();
  const totalCapitalUsdc = Number(arg("capital", "100000000"));
  const seed = Number(arg("seed", "42"));
  const clientMultiplier = Number(arg("clients", "1"));

  console.log(`\n▸ Running economy simulation`);
  console.log(`  Capital: ${totalCapitalUsdc.toLocaleString()} USDC`);
  console.log(`  Seed: ${seed}\n`);

  const { summary, verification } = await simulateEconomy({
    totalCapitalUsdc,
    seed,
    clientMultiplier,
    triggeredBy: "cli",
  });

  console.log("Summary:", {
    runId: summary.runId,
    loans: summary.loansCreated,
    paid: summary.installmentsPaid,
    late: summary.installmentsLate,
    peakUtil: `${(summary.maxUtilizationBps / 100).toFixed(1)}%`,
  });
  console.log("\nVerification:", verification.pass ? "PASS" : "REVIEW");
  for (const c of verification.checks) {
    console.log(`  ${c.pass ? "✓" : "✗"} ${c.label}: ${c.detail}`);
  }
  console.log("");
  process.exit(verification.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
