/**
 * Phase I demonstration readiness check.
 * Runs the full on-chain flow: deposit → allocate → allocate → loan → approve → repay.
 *
 * Usage: npx hardhat run scripts/verify-phase1.ts --network localhost
 */
import { ethers, network } from "hardhat";
import * as fs from "fs";
import { getDeploymentPersonas, manifestPathForNetwork } from "./deployment-signers";
import { commitAndRevealRisk } from "../test/helpers/riskOracle";

type Manifest = {
  contracts: {
    WorldBankReserve: string;
    NationalBank: string;
    LocalBank: string;
    LoanController: string;
    MockUSDC: string;
    GovernorMultisig2of3?: string;
  };
};

const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

function pass(name: string, detail: string) {
  checks.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}: ${detail}`);
}

function fail(name: string, detail: string) {
  checks.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}: ${detail}`);
}

async function main() {
  console.log("\n▸ Phase I demonstration verification\n");

  const manifestPath = manifestPathForNetwork(network.name);
  if (!fs.existsSync(manifestPath)) {
    fail("Deployment manifest", `Missing ${manifestPath} — run npm run phase${network.name === "sepolia" ? "2:sepolia" : "1:local"}`);
    printSummary();
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
  const { WorldBankReserve, NationalBank, LocalBank, LoanController, MockUSDC, GovernorMultisig2of3 } =
    manifest.contracts;

  pass("Deployment manifest", `WorldBank=${WorldBankReserve.slice(0, 10)}…`);

  if (LoanController) {
    pass("LoanController in manifest", LoanController.slice(0, 10) + "…");
  } else {
    fail("LoanController in manifest", "missing");
  }

  if (GovernorMultisig2of3) {
    pass("GovernorMultisig2of3 deployed", GovernorMultisig2of3.slice(0, 10) + "…");
  }

  const personas = await getDeploymentPersonas();
  const { worldGov, nationalGov, approver, borrower1: borrower } = personas;

  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const isLocal = chainId === 31337;
  const eth = (localAmt: string, testnetAmt: string) =>
    ethers.parseEther(isLocal ? localAmt : testnetAmt);

  const world = await ethers.getContractAt("WorldBankReserve", WorldBankReserve);
  const national = await ethers.getContractAt("NationalBank", NationalBank);
  const local = await ethers.getContractAt("LocalBank", LocalBank);
  const controller = await ethers.getContractAt("LoanController", LoanController);
  const usdc = await ethers.getContractAt("MockUSDC", MockUSDC);

  const usdcSupply = await usdc.totalSupply();
  pass("MockUSDC deployed", `totalSupply=${usdcSupply.toString()}`);

  // 1. Deposit
  await (await world.connect(worldGov).deposit({ value: eth("1.0", "0.15") })).wait();
  const reserveAfterDeposit = await world.reserveBalance();
  if (reserveAfterDeposit >= eth("1.0", "0.15")) {
    pass("Deposit to World Bank", `${ethers.formatEther(reserveAfterDeposit)} ETH in reserve`);
  } else {
    fail("Deposit to World Bank", `reserve=${ethers.formatEther(reserveAfterDeposit)}`);
  }

  // 2. World → National
  await (
    await world.connect(worldGov).allocate(NationalBank, eth("0.4", "0.06"))
  ).wait();
  const nbBal = await ethers.provider.getBalance(NationalBank);
  if (nbBal >= eth("0.4", "0.06")) {
    pass("World → National allocate", `${ethers.formatEther(nbBal)} ETH at NationalBank`);
  } else {
    fail("World → National allocate", `balance=${ethers.formatEther(nbBal)}`);
  }

  // 3. National → Local (forwards to LoanController)
  await (
    await national.connect(nationalGov).allocate(LocalBank, eth("0.2", "0.03"))
  ).wait();
  const controllerBal = await ethers.provider.getBalance(LoanController);
  if (controllerBal >= eth("0.2", "0.03")) {
    pass("National → Local allocate", `${ethers.formatEther(controllerBal)} ETH in LoanController pool`);
  } else {
    fail("National → Local allocate", `loanPool=${ethers.formatEther(controllerBal)}`);
  }

  // 4. Borrower requests loan
  const principal = eth("0.05", "0.02");
  await (
    await local.connect(borrower).requestLoan(principal, 6, "Phase I demo loan")
  ).wait();
  const loanId = 1n;
  const pending = await local.loans(loanId);
  if (Number(pending.status) === 0) {
    pass("Loan request", `loan #${loanId} pending for ${borrower.address.slice(0, 10)}…`);
  } else {
    fail("Loan request", `status=${pending.status}`);
  }

  // 5. Approver approves (after oracle commit–reveal)
  await commitAndRevealRisk(controller, approver, loanId);
  await (await local.connect(approver).approveLoan(loanId)).wait();
  const active = await local.loans(loanId);
  if (Number(active.status) === 3) {
    pass("Loan approval", `loan active, totalOwed=${ethers.formatEther(active.totalOwed)} ETH`);
  } else {
    fail("Loan approval", `status=${active.status}`);
  }

  // 6. Borrower repays (single installment)
  const owed = active.totalOwed;
  await (
    await local.connect(borrower).payInstallment(loanId, { value: owed })
  ).wait();
  const repaid = await local.loans(loanId);
  if (Number(repaid.status) === 4) {
    pass("Loan repayment", `loan #${loanId} repaid`);
  } else {
    fail("Loan repayment", `status=${repaid.status}`);
  }

  const stats = await local.bankStats();
  pass(
    "Local bank stats",
    `loanPool=${ethers.formatEther(stats[0])} ETH, repaid loans=${stats[4]}`,
  );

  printSummary();
  if (checks.some((c) => !c.ok)) process.exit(1);
}

function printSummary() {
  const passed = checks.filter((c) => c.ok).length;
  const total = checks.length;
  console.log(`\n▸ Result: ${passed}/${total} checks passed`);
  if (passed === total) {
    console.log(`  Phase I is READY for ${network.name} demonstration.\n`);
  } else {
    console.log("  Phase I is NOT ready — fix failures above.\n");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
