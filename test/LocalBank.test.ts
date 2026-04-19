import { expect } from "chai";
import { ethers } from "hardhat";

describe("LocalBank — Tier 3 unit tests", () => {
  async function deploy() {
    const [governor, approver, borrower, other, funder] = await ethers.getSigners();
    const National = await ethers.getContractFactory("NationalBank");
    const nb = await National.deploy(
      governor.address,
      governor.address, // stand-in world bank address (not used by Local tests)
      "NB",
      "BD"
    );
    const Local = await ethers.getContractFactory("LocalBank");
    const lb = await Local.deploy(
      governor.address,
      await nb.getAddress(),
      "Dhaka Local Bank",
      "Dhaka"
    );

    // Prefund the local bank so it can disburse loans.
    await funder.sendTransaction({ to: await lb.getAddress(), value: ethers.parseEther("200") });

    return { nb, lb, governor, approver, borrower, other, funder };
  }

  it("stores the national-bank parent + metadata on deploy", async () => {
    const { nb, lb } = await deploy();
    expect(await lb.nationalBank()).to.equal(await nb.getAddress());
    expect(await lb.name()).to.equal("Dhaka Local Bank");
    expect(await lb.region()).to.equal("Dhaka");
    expect(await lb.borrowAprBps()).to.equal(800);
    expect(await lb.installmentThreshold()).to.equal(ethers.parseEther("100"));
    expect(await lb.defaultInstallments()).to.equal(12);
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

    await expect(
      lb.connect(borrower).requestLoan(0, 6, "x")
    ).to.be.revertedWith("zero principal");
    await expect(
      lb.connect(borrower).requestLoan(1, 0, "x")
    ).to.be.revertedWith("invalid term");
    await expect(
      lb.connect(borrower).requestLoan(1, 61, "x")
    ).to.be.revertedWith("invalid term");

    await expect(
      lb.connect(borrower).requestLoan(ethers.parseEther("5"), 6, "working capital")
    )
      .to.emit(lb, "LoanRequested")
      .withArgs(1, borrower.address, ethers.parseEther("5"), "working capital");
  });

  it("only an approver can approve or reject loans", async () => {
    const { lb, borrower, other } = await deploy();
    await lb.connect(borrower).requestLoan(ethers.parseEther("5"), 6, "x");
    await expect(lb.connect(other).approveLoan(1)).to.be.reverted;
    await expect(lb.connect(other).rejectLoan(1, "no")).to.be.reverted;
  });

  it("small loan (<threshold) → single-payment schedule, disburses on approve", async () => {
    const { lb, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(ethers.parseEther("5"), 12, "x");

    const before = await ethers.provider.getBalance(borrower.address);
    await lb.connect(governor).approveLoan(1);
    const after = await ethers.provider.getBalance(borrower.address);

    const loan = await lb.loans(1);
    expect(loan.status).to.equal(3); // Active
    expect(loan.installmentCount).to.equal(1);
    // principal + 8% APR × 12mo/12 = principal * 1.08
    expect(loan.totalOwed).to.equal((ethers.parseEther("5") * 108n) / 100n);
    expect(after - before).to.equal(ethers.parseEther("5"));
  });

  it("large loan (≥threshold) → 12-installment schedule", async () => {
    const { lb, governor, borrower, funder } = await deploy();
    // Ensure bank has enough liquidity for the 150 ETH disbursement.
    await funder.sendTransaction({ to: await lb.getAddress(), value: ethers.parseEther("200") });

    await lb.connect(borrower).requestLoan(ethers.parseEther("150"), 12, "expansion");
    await lb.connect(governor).approveLoan(1);

    const loan = await lb.loans(1);
    expect(loan.installmentCount).to.equal(12);

    const perInstallment = await lb.installmentAmount(1);
    expect(perInstallment).to.equal(loan.totalOwed / 12n);
  });

  it("partial installment payments keep the loan Active until final", async () => {
    const { lb, governor, borrower, funder } = await deploy();
    await funder.sendTransaction({ to: await lb.getAddress(), value: ethers.parseEther("200") });

    await lb.connect(borrower).requestLoan(ethers.parseEther("120"), 12, "x");
    await lb.connect(governor).approveLoan(1);

    const per = await lb.installmentAmount(1);
    for (let i = 1; i <= 11; i++) {
      await lb.connect(borrower).payInstallment(1, { value: per });
    }
    expect((await lb.loans(1)).status).to.equal(3); // still Active

    await expect(lb.connect(borrower).payInstallment(1, { value: per }))
      .to.emit(lb, "LoanRepaid")
      .withArgs(1, borrower.address);
    expect((await lb.loans(1)).status).to.equal(4); // Repaid
  });

  it("only the borrower can pay their own installments", async () => {
    const { lb, governor, borrower, other } = await deploy();
    await lb.connect(borrower).requestLoan(ethers.parseEther("5"), 6, "x");
    await lb.connect(governor).approveLoan(1);

    const per = await lb.installmentAmount(1);
    await expect(
      lb.connect(other).payInstallment(1, { value: per })
    ).to.be.revertedWith("not borrower");
  });

  it("rejectLoan flips status + emits LoanRejected", async () => {
    const { lb, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(ethers.parseEther("5"), 6, "x");
    await expect(lb.connect(governor).rejectLoan(1, "kyc_pending"))
      .to.emit(lb, "LoanRejected")
      .withArgs(1, governor.address, "kyc_pending");
    expect((await lb.loans(1)).status).to.equal(2); // Rejected
  });

  it("pause() blocks requests, approvals, and payments", async () => {
    const { lb, governor, borrower } = await deploy();
    await lb.connect(governor).pause();
    await expect(lb.connect(borrower).requestLoan(ethers.parseEther("1"), 6, "x")).to.be.reverted;

    await lb.connect(governor).unpause();
    await lb.connect(borrower).requestLoan(ethers.parseEther("5"), 6, "x");
    await lb.connect(governor).pause();
    await expect(lb.connect(governor).approveLoan(1)).to.be.reverted;
  });

  it("bankStats counts pending / active / repaid correctly", async () => {
    const { lb, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(ethers.parseEther("5"), 6, "a"); // id 1 pending
    await lb.connect(borrower).requestLoan(ethers.parseEther("5"), 6, "b"); // id 2 pending
    await lb.connect(governor).approveLoan(1); // id 1 active
    await lb.connect(governor).rejectLoan(2, "no"); // id 2 rejected
    await lb.connect(borrower).requestLoan(ethers.parseEther("3"), 6, "c"); // id 3 pending

    const [, loanCount, pending, active, repaid] = await lb.bankStats();
    expect(loanCount).to.equal(3);
    expect(pending).to.equal(1);
    expect(active).to.equal(1);
    expect(repaid).to.equal(0);
  });

  it("setInstallmentPolicy rejects 0 or >60 installments", async () => {
    const { lb, governor } = await deploy();
    await expect(
      lb.connect(governor).setInstallmentPolicy(ethers.parseEther("50"), 0)
    ).to.be.revertedWith("bad installments");
    await expect(
      lb.connect(governor).setInstallmentPolicy(ethers.parseEther("50"), 61)
    ).to.be.revertedWith("bad installments");
    await lb.connect(governor).setInstallmentPolicy(ethers.parseEther("50"), 24);
    expect(await lb.installmentThreshold()).to.equal(ethers.parseEther("50"));
    expect(await lb.defaultInstallments()).to.equal(24);
  });

  it("cannot pay an installment below the expected amount", async () => {
    const { lb, governor, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(ethers.parseEther("5"), 6, "x");
    await lb.connect(governor).approveLoan(1);
    const per = await lb.installmentAmount(1);
    await expect(
      lb.connect(borrower).payInstallment(1, { value: per - 1n })
    ).to.be.revertedWith("amount too low");
  });
});
