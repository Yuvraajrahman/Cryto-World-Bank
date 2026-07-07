/**
 * Phase II (Gate G2) verification — borrowing limits, upward deposit, passport, loan E2E.
 */
import { ethers, network } from "hardhat";
import * as fs from "fs";
import { getDeploymentPersonas, manifestPathForNetwork } from "./deployment-signers";
import { commitAndRevealRisk } from "../test/helpers/riskOracle";

type Manifest = {
  contracts: Record<string, string>;
};

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
  console.log("\n▸ Phase II demonstration verification\n");

  const manifestPath = manifestPathForNetwork(network.name);
  if (!fs.existsSync(manifestPath)) {
    fail("Manifest", `run npm run phase2:${network.name === "localhost" ? "local" : network.name}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
  const c = manifest.contracts;

  for (const key of [
    "CreditPassport",
    "UpwardDepositFacility",
    "SavingsVault",
    "GroupLendingPool",
    "InterBankLendingPool",
  ]) {
    if (c[key]) pass(`${key} deployed`, c[key].slice(0, 10) + "…");
    else fail(`${key} deployed`, "missing");
  }

  const personas = await getDeploymentPersonas();
  const { worldGov, nationalGov, localGov, approver, borrower1: borrower } = personas;

  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const isLocal = chainId === 31337;
  const eth = (localAmt: string, testnetAmt: string) =>
    ethers.parseEther(isLocal ? localAmt : testnetAmt);

  const local = await ethers.getContractAt("LocalBank", c.LocalBank);
  const controller = await ethers.getContractAt("LoanController", c.LoanController);
  const passport = await ethers.getContractAt("CreditPassport", c.CreditPassport);
  const upward = await ethers.getContractAt("UpwardDepositFacility", c.UpwardDepositFacility);
  const world = await ethers.getContractAt("WorldBankReserve", c.WorldBankReserve);
  const national = await ethers.getContractAt("NationalBank", c.NationalBank);

  const stats = await local.bankStats();
  const poolBal = stats[0];
  const minPool = eth("0.04", "0.04");
  if (poolBal < minPool) {
    const depositAmt = eth("5", "0.03");
    const govBal = await ethers.provider.getBalance(worldGov.address);
    if (govBal < depositAmt + ethers.parseEther("0.01")) {
      fail("Loan pool funding", `need ${ethers.formatEther(depositAmt)} ETH; fund ${worldGov.address}`);
      process.exit(1);
    }
    await (await world.connect(worldGov).deposit({ value: depositAmt })).wait();
    await (await world.connect(worldGov).allocate(c.NationalBank, eth("2", "0.015"))).wait();
    await (await national.connect(nationalGov).allocate(c.LocalBank, eth("1", "0.01"))).wait();
    pass("Loan pool funded", "deposited + allocated for phase2 loan");
  } else {
    pass("Loan pool ready", `${ethers.formatEther(poolBal)} ETH available`);
  }

  const canBorrowLarge = await passport.canBorrow(borrower.address, ethers.parseEther("1"));
  if (!canBorrowLarge) {
    pass("Borrowing limit enforced", "1 ETH exceeds Silver-tier cap");
  } else {
    fail("Borrowing limit enforced", "expected revert path");
  }

  try {
    await local.connect(borrower).requestLoan.staticCall(ethers.parseEther("1"), 6, "too big");
    fail("On-chain limit revert", "request should fail");
  } catch {
    pass("On-chain limit revert", "requestLoan reverts above passport cap");
  }

  const loanId = await controller.nextLoanId();
  await (await local.connect(borrower).requestLoan(ethers.parseEther("0.04"), 6, "phase2")).wait();
  await commitAndRevealRisk(controller, approver, loanId);
  await (await local.connect(approver).approveLoan(loanId)).wait();
  const loan = await local.loans(loanId);
  if (Number(loan.status) === 3) pass("Loan approved", "status Active");
  else fail("Loan approved", `status=${loan.status}`);

  const per = await local.installmentAmount(loanId);
  await (await local.connect(borrower).payInstallment(loanId, { value: per })).wait();
  const repaid = await local.loans(loanId);
  if (Number(repaid.status) === 4) pass("Installment repaid", "loan Repaid");
  else fail("Installment repaid", `status=${repaid.status}`);

  const before = await world.reserveBalance();
  await (
    await upward.connect(nationalGov).depositUpward(c.WorldBankReserve, {
      value: eth("0.1", "0.02"),
    })
  ).wait();
  const after = await world.reserveBalance();
  if (after > before) pass("Upward deposit", "+0.1 ETH to World reserve");
  else fail("Upward deposit", "no balance change");

  const group = await ethers.getContractAt("GroupLendingPool", c.GroupLendingPool);
  await (await group.connect(localGov).createGroup(c.LocalBank)).wait();
  pass("GroupLendingPool", "group #1 created");

  const passed = checks.filter((x) => x.ok).length;
  const total = checks.length;
  console.log(`\n▸ Result: ${passed}/${total} checks passed`);
  if (passed === total) {
    console.log(`  Phase II is READY for ${network.name} demonstration (Gate G2).\n`);
  } else {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
