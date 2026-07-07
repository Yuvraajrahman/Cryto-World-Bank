/**
 * Phase III (Gate G3) verification — ML oracle, commit–reveal, agent safety.
 */
import { ethers, network } from "hardhat";
import * as fs from "fs";
import { getDeploymentPersonas, manifestPathForNetwork } from "./deployment-signers";
import { commitAndRevealRisk } from "../test/helpers/riskOracle";

const checks: Array<{ name: string; ok: boolean }> = [];

function pass(name: string, detail: string) {
  checks.push({ name, ok: true });
  console.log(`  ✓ ${name}: ${detail}`);
}

function fail(name: string, detail: string) {
  checks.push({ name, ok: false });
  console.log(`  ✗ ${name}: ${detail}`);
}

async function main() {
  console.log("\n▸ Phase III demonstration verification\n");

  const manifestPath = manifestPathForNetwork(network.name);
  if (!fs.existsSync(manifestPath)) {
    fail("Manifest", "run npm run phase3:local");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    contracts: Record<string, string>;
  };
  const c = manifest.contracts;
  const controller = await ethers.getContractAt("LoanController", c.LoanController);
  const local = await ethers.getContractAt("LocalBank", c.LocalBank);
  const personas = await getDeploymentPersonas();
  const { approver, borrower1: borrower } = personas;

  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const isLocal = chainId === 31337;
  const eth = (localAmt: string, testnetAmt: string) =>
    ethers.parseEther(isLocal ? localAmt : testnetAmt);

  const poolBal = await ethers.provider.getBalance(c.LoanController);
  if (poolBal < eth("0.04", "0.04")) {
    fail("Loan pool", "insufficient ETH — run phase2:local first");
    process.exit(1);
  }
  pass("Loan pool ready", `${ethers.formatEther(poolBal)} ETH`);

  const loanId = await controller.nextLoanId();
  await (await local.connect(borrower).requestLoan(eth("0.03", "0.02"), 6, "phase3 oracle")).wait();

  try {
    await local.connect(approver).approveLoan.staticCall(loanId);
    fail("Oracle gate", "approve should revert without reveal");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("risk not revealed")) {
      pass("Oracle gate", "approveLoan blocked until SCORE_REVEALED");
    } else {
      fail("Oracle gate", msg.slice(0, 80));
    }
  }

  await commitAndRevealRisk(controller, approver, loanId);
  const revealed = await controller.isRiskScoreRevealed(loanId);
  if (revealed) pass("Commit–reveal", `scoreBps=${await controller.revealedRiskBps(loanId)}`);
  else fail("Commit–reveal", "not revealed");

  await (await local.connect(approver).approveLoan(loanId)).wait();
  const loan = await local.loans(loanId);
  if (Number(loan.status) === 3) pass("Approve after oracle", "loan Active");
  else fail("Approve after oracle", `status=${loan.status}`);

  const mlUrl = process.env.ML_SERVICE_URL ?? "http://localhost:8000";
  try {
    const r = await fetch(`${mlUrl}/v1/score`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        wallet: borrower.address,
        principal_eth: 0.03,
        term_months: 6,
      }),
    });
    if (r.ok) {
      const data = (await r.json()) as { risk_score?: number; model?: string };
      pass("ML /v1/score", `risk=${data.risk_score} model=${data.model}`);
    } else {
      fail("ML /v1/score", `HTTP ${r.status} — start ml-service for full G3`);
    }
  } catch {
    fail("ML /v1/score", "unreachable — run npm run ml:dev");
  }

  const passed = checks.filter((x) => x.ok).length;
  const total = checks.length;
  console.log(`\n▸ Result: ${passed}/${total} checks passed`);
  if (passed === total) {
    console.log(`  Phase III is READY for ${network.name} demonstration (Gate G3).\n`);
  } else {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
