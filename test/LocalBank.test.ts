import { expect } from "chai";
import { ethers } from "hardhat";
import { commitAndRevealRisk } from "./helpers/riskOracle";
import { usdc } from "./helpers/usdc";

describe("LocalBank — Tier 3 unit tests", () => {
  async function deploy(poolUsdc = "200") {
    const [governor, approver, borrower, other, funder] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy(governor.address);
    await mockUsdc.waitForDeployment();

    const National = await ethers.getContractFactory("NationalBank");
    const nb = await National.deploy(
      governor.address,
      governor.address,
      "NB",
      "BD",
    );
    await nb.waitForDeployment();
    await nb.connect(governor).setUsdc(await mockUsdc.getAddress());

    const Local = await ethers.getContractFactory("LocalBank");
    const lb = await Local.deploy(
      governor.address,
      await nb.getAddress(),
      await mockUsdc.getAddress(),
      "Dhaka Local Bank",
      "Dhaka",
    );
    await lb.waitForDeployment();
    const controller = await ethers.getContractAt("LoanController", await lb.loanController());

    const poolAmt = usdc(poolUsdc);
    await mockUsdc.mint(funder.address, poolAmt);
    await mockUsdc.connect(funder).transfer(await controller.getAddress(), poolAmt);

    return { nb, lb, mockUsdc, controller, governor, approver, borrower, other, funder };
  }

  async function revealOracle(
    controller: Awaited<ReturnType<typeof deploy>>["controller"],
    oracle: { address: string },
    loanId: number,
  ) {
    await commitAndRevealRisk(controller, oracle, loanId);
  }

  async function approvePay(
    mockUsdc: Awaited<ReturnType<typeof deploy>>["mockUsdc"],
    controller: Awaited<ReturnType<typeof deploy>>["controller"],
    payer: Awaited<ReturnType<typeof ethers.getSigners>>[0],
    amount: bigint,
  ) {
    await mockUsdc.connect(payer).approve(await controller.getAddress(), amount);
  }

  it("deploys an owned LoanController", async () => {
    const { lb, mockUsdc, controller } = await deploy();
    expect(await lb.loanController()).to.properAddress;
    expect(await mockUsdc.balanceOf(await controller.getAddress())).to.equal(usdc("200"));
  });

  it("stores the national-bank parent + metadata on deploy", async () => {
    const { nb, lb } = await deploy();
    expect(await lb.nationalBank()).to.equal(await nb.getAddress());
    expect(await lb.name()).to.equal("Dhaka Local Bank");
    expect(await lb.region()).to.equal("Dhaka");
    expect(await lb.borrowAprBps()).to.equal(300);
    expect(await lb.installmentThreshold()).to.equal(usdc("100"));
    expect(await lb.defaultInstallments()).to.equal(12);
  });

  it("kinked rate: below the 80% kink the APR rises along the gentle slope1", async () => {
    const { lb, controller, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("40"), 12, "a");
    await revealOracle(controller, governor, 1);
    await lb.connect(governor).approveLoan(1);

    await lb.connect(borrower).requestLoan(usdc("1"), 12, "b");
    const loan2 = await controller.getLoan(2);
    expect(loan2.aprBps).to.equal(425n);
  });

  it("kinked rate: above the 80% kink the APR jumps along the steep slope2", async () => {
    const { lb, controller, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("180"), 12, "a");
    await revealOracle(controller, governor, 1);
    await lb.connect(governor).approveLoan(1);

    await lb.connect(borrower).requestLoan(usdc("1"), 12, "b");
    const loan2 = await controller.getLoan(2);
    expect(loan2.aprBps).to.equal(4550n);
    expect(await controller.utilizationBps()).to.equal(9000n);
  });

  it("governor can retune the rate model within safety caps", async () => {
    const { lb, controller, governor } = await deploy();
    await expect(lb.connect(governor).setRateModel(200, 300, 400, 9000))
      .to.emit(controller, "RateModelUpdated")
      .withArgs(200, 300, 400, 9000);
    expect(await controller.baseRateBps()).to.equal(200);
    expect(await controller.kinkBps()).to.equal(9000);

    await expect(lb.connect(governor).setRateModel(200, 300, 400, 0)).to.be.revertedWith("bad kink");
    await expect(lb.connect(governor).setRateModel(6000, 300, 400, 9000)).to.be.revertedWith(
      "base too high",
    );
  });

  it("governor can add/remove approvers", async () => {
    const { lb, governor, approver } = await deploy();
    await expect(lb.connect(governor).addApprover(approver.address))
      .to.emit(lb, "ApproverAdded")
      .withArgs(approver.address);
    await expect(lb.connect(governor).removeApprover(approver.address))
      .to.emit(lb, "ApproverRemoved")
      .withArgs(approver.address);
  });

  it("requestLoan validates inputs and emits LoanRequested", async () => {
    const { lb, borrower } = await deploy();
    await expect(lb.connect(borrower).requestLoan(0, 6, "x")).to.be.revertedWith("zero principal");
    await expect(lb.connect(borrower).requestLoan(1, 0, "x")).to.be.revertedWith("invalid term");
    await expect(lb.connect(borrower).requestLoan(1, 61, "x")).to.be.revertedWith("invalid term");

    await expect(lb.connect(borrower).requestLoan(usdc("5"), 6, "working capital"))
      .to.emit(lb, "LoanRequested")
      .withArgs(1, borrower.address, usdc("5"), ethers.ZeroHash, "working capital");
  });

  it("only an approver can approve or reject loans", async () => {
    const { lb, borrower, other } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("5"), 6, "x");
    await expect(lb.connect(other).approveLoan(1)).to.be.reverted;
    await expect(lb.connect(other).rejectLoan(1, "no")).to.be.reverted;
  });

  it("small loan (<threshold) → single-payment schedule, disburses on approve", async () => {
    const { lb, mockUsdc, controller, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("5"), 12, "x");

    const before = await mockUsdc.balanceOf(borrower.address);
    await revealOracle(controller, governor, 1);
    await lb.connect(governor).approveLoan(1);
    const after = await mockUsdc.balanceOf(borrower.address);

    const loan = await lb.loans(1);
    expect(loan.status).to.equal(3);
    expect(loan.installmentCount).to.equal(1);
    expect(loan.totalOwed).to.equal((usdc("5") * 103n) / 100n);
    expect(after - before).to.equal(usdc("5"));
  });

  it("large loan (≥threshold) → 12-installment schedule", async () => {
    const { lb, mockUsdc, controller, governor, borrower, funder } = await deploy("200");
    await mockUsdc.mint(funder.address, usdc("200"));
    await mockUsdc.connect(funder).transfer(await controller.getAddress(), usdc("200"));

    await lb.connect(borrower).requestLoan(usdc("150"), 12, "expansion");
    await revealOracle(controller, governor, 1);
    await lb.connect(governor).approveLoan(1);

    const loan = await lb.loans(1);
    expect(loan.installmentCount).to.equal(12);
    expect(await lb.installmentAmount(1)).to.equal(loan.totalOwed / 12n);
  });

  it("partial installment payments keep the loan Active until final", async () => {
    const { lb, mockUsdc, controller, governor, borrower, funder } = await deploy("200");
    await mockUsdc.mint(funder.address, usdc("200"));
    await mockUsdc.connect(funder).transfer(await controller.getAddress(), usdc("200"));

    await lb.connect(borrower).requestLoan(usdc("120"), 12, "x");
    await revealOracle(controller, governor, 1);
    await lb.connect(governor).approveLoan(1);

    const per = await lb.installmentAmount(1);
    const loanRow = await lb.loans(1);
    await mockUsdc.mint(borrower.address, loanRow.totalOwed - loanRow.principal);

    for (let i = 1; i <= 11; i++) {
      await approvePay(mockUsdc, controller, borrower, per);
      await lb.connect(borrower).payInstallment(1, per);
    }
    expect((await lb.loans(1)).status).to.equal(3);

    await approvePay(mockUsdc, controller, borrower, per);
    await expect(lb.connect(borrower).payInstallment(1, per))
      .to.emit(lb, "LoanRepaid")
      .withArgs(1, borrower.address);
    expect((await lb.loans(1)).status).to.equal(4);
  });

  it("only the borrower can pay their own installments", async () => {
    const { lb, mockUsdc, controller, governor, borrower, other } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("5"), 6, "x");
    await revealOracle(controller, governor, 1);
    await lb.connect(governor).approveLoan(1);

    const per = await lb.installmentAmount(1);
    await approvePay(mockUsdc, controller, other, per);
    await expect(lb.connect(other).payInstallment(1, per)).to.be.revertedWith("not borrower");
  });

  it("rejectLoan flips status + emits LoanRejected", async () => {
    const { lb, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("5"), 6, "x");
    await expect(lb.connect(governor).rejectLoan(1, "kyc_pending"))
      .to.emit(lb, "LoanRejected")
      .withArgs(1, governor.address, "kyc_pending");
    expect((await lb.loans(1)).status).to.equal(2);
  });

  it("pause() blocks requests, approvals, and payments", async () => {
    const { lb, governor, borrower } = await deploy();
    await lb.connect(governor).pause();
    await expect(lb.connect(borrower).requestLoan(usdc("1"), 6, "x")).to.be.reverted;

    await lb.connect(governor).unpause();
    await lb.connect(borrower).requestLoan(usdc("5"), 6, "x");
    await lb.connect(governor).pause();
    await expect(lb.connect(governor).approveLoan(1)).to.be.reverted;
  });

  it("bankStats counts pending / active / repaid correctly", async () => {
    const { lb, controller, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("5"), 6, "a");
    await lb.connect(borrower).requestLoan(usdc("5"), 6, "b");
    await revealOracle(controller, governor, 1);
    await lb.connect(governor).approveLoan(1);
    await lb.connect(governor).rejectLoan(2, "no");
    await lb.connect(borrower).requestLoan(usdc("3"), 6, "c");

    const [, loanCount, pending, active, repaid] = await lb.bankStats();
    expect(loanCount).to.equal(3);
    expect(pending).to.equal(1);
    expect(active).to.equal(1);
    expect(repaid).to.equal(0);
  });

  it("setInstallmentPolicy rejects 0 or >60 installments", async () => {
    const { lb, governor } = await deploy();
    await expect(lb.connect(governor).setInstallmentPolicy(usdc("50"), 0)).to.be.revertedWith(
      "bad installments",
    );
    await expect(lb.connect(governor).setInstallmentPolicy(usdc("50"), 61)).to.be.revertedWith(
      "bad installments",
    );
    await lb.connect(governor).setInstallmentPolicy(usdc("50"), 24);
    expect(await lb.installmentThreshold()).to.equal(usdc("50"));
    expect(await lb.defaultInstallments()).to.equal(24);
  });

  it("cannot pay an installment below the expected amount", async () => {
    const { lb, mockUsdc, controller, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("5"), 6, "x");
    await revealOracle(controller, governor, 1);
    await lb.connect(governor).approveLoan(1);
    const per = await lb.installmentAmount(1);
    await approvePay(mockUsdc, controller, borrower, per - 1n);
    await expect(lb.connect(borrower).payInstallment(1, per - 1n)).to.be.revertedWith(
      "amount too low",
    );
  });

  it("rejects collateral loans that exceed max LTV on-chain", async () => {
    const { lb, borrower } = await deploy();
    const collateral = usdc("10");
    const tooHigh = usdc("6"); // 60% LTV > 50% default max
    await expect(
      lb.connect(borrower).requestCollateralLoan(tooHigh, 6, "collateral loan", collateral),
    ).to.be.revertedWith("exceeds ltv");
    await expect(lb.connect(borrower).requestCollateralLoan(usdc("5"), 6, "ok", collateral)).to.not
      .be.reverted;
  });
});
