import { expect } from "chai";
import { ethers } from "hardhat";
import { commitAndRevealRisk } from "./helpers/riskOracle";
import { deployUsdcStack, fundLoanPool, usdc } from "./helpers/deployStack";

describe("Phase II — core banking extensions", () => {
  async function deployStack() {
    const [worldGov, nationalGov, localGov, approver, borrower, borrower2, depositor] =
      await ethers.getSigners();

    const stack = await deployUsdcStack({ worldGov, nationalGov, localGov });
    const { worldBank, national, local, controller, mockUsdc } = stack;

    const Passport = await ethers.getContractFactory("CreditPassport");
    const passport = await Passport.deploy(localGov.address);

    await passport.connect(localGov).grantLoanHook(await controller.getAddress());
    await passport.connect(localGov).grantIssuer(await local.getAddress());
    await local.connect(localGov).linkCreditPassport(await passport.getAddress());

    await local.connect(localGov).addApprover(approver.address);
    await local.connect(localGov).grantRiskOracle(approver.address);
    await local.connect(localGov).registerClient(borrower.address);
    await local.connect(localGov).registerClient(borrower2.address);

    await fundLoanPool(stack, depositor, worldGov, nationalGov, {
      deposit: "50",
      toNational: "20",
      toLocal: "10",
    });

    return {
      ...stack,
      passport,
      worldGov,
      nationalGov,
      localGov,
      approver,
      borrower,
      borrower2,
      depositor,
    };
  }

  it("reverts loan request when principal exceeds Credit Passport tier limit", async () => {
    const { local, borrower } = await deployStack();
    await expect(local.connect(borrower).requestLoan(usdc("1"), 6, "too big")).to.be.revertedWith(
      "limit exceeded",
    );
  });

  it("approves loan within passport limit and upgrades score on repay", async () => {
    const { local, approver, borrower, passport, controller, mockUsdc } = await deployStack();
    await local.connect(borrower).requestLoan(usdc("0.04"), 6, "ok");
    await commitAndRevealRisk(controller, approver, 1);
    await local.connect(approver).approveLoan(1);
    const per = await local.installmentAmount(1);
    const loanRow = await local.loans(1);
    const interestDue = loanRow.totalOwed - loanRow.principal;
    if (interestDue > 0n) {
      await mockUsdc.mint(borrower.address, interestDue);
    }
    await mockUsdc.connect(borrower).approve(await controller.getAddress(), per);
    await local.connect(borrower).payInstallment(1, per);
    const score = await passport.getScore(borrower.address);
    expect(score.creditScore).to.equal(325);
  });

  it("records upward deposit from national bank governor to parent tier", async () => {
    const { national, nationalGov, worldGov } = await deployStack();
    const Upward = await ethers.getContractFactory("UpwardDepositFacility");
    const upward = await Upward.deploy(worldGov.address);
    await upward.registerDepositor(nationalGov.address);

    const before = await ethers.provider.getBalance(await national.getAddress());
    await upward.connect(nationalGov).depositUpward(await national.getAddress(), {
      value: ethers.parseEther("1"),
    });
    const after = await ethers.provider.getBalance(await national.getAddress());
    expect(after - before).to.equal(ethers.parseEther("1"));
  });

  it("creates group lending pool with unanimous consent", async () => {
    const { local, localGov, borrower, borrower2 } = await deployStack();
    const [, , , , , , borrower3] = await ethers.getSigners();
    const Group = await ethers.getContractFactory("GroupLendingPool");
    const group = await Group.deploy(localGov.address);
    await group.connect(localGov).createGroup(await local.getAddress());
    const groupId = 1n;
    await group.connect(localGov).addMember(groupId, borrower.address);
    await group.connect(localGov).addMember(groupId, borrower2.address);
    await group.connect(localGov).addMember(groupId, borrower3.address);
    await group.connect(borrower).recordConsent(groupId);
    await group.connect(borrower2).recordConsent(groupId);
    await group.connect(borrower3).recordConsent(groupId);
    expect(await group.isGroupReady(groupId)).to.equal(true);
  });

  it("supports interbank same-tier borrow and repay", async () => {
    const { nationalGov, borrower2 } = await deployStack();
    const IBLP = await ethers.getContractFactory("InterBankLendingPool");
    const iblp = await IBLP.deploy(nationalGov.address, "IBLP_NB");
    await iblp.connect(nationalGov).registerBorrower(nationalGov.address);
    await iblp.connect(nationalGov).registerBorrower(borrower2.address);
    const principal = ethers.parseEther("1");
    await iblp.connect(nationalGov).borrow(borrower2.address, principal, 7, { value: principal });
    const interest = (principal * 400n * 7n) / (10000n * 365n);
    await iblp.connect(borrower2).repay(1, { value: principal + interest });
  });

  it("caps the interbank rate at r_downward - delta once a downward rate source is wired", async () => {
    const { national, nationalGov, borrower2 } = await deployStack();
    expect(await national.downwardRateBps()).to.equal(500n);

    const IBLP = await ethers.getContractFactory("InterBankLendingPool");
    const iblp = await IBLP.deploy(nationalGov.address, "IBLP_NB");
    await iblp.connect(nationalGov).registerBorrower(nationalGov.address);
    await iblp.connect(nationalGov).registerBorrower(borrower2.address);

    await iblp.connect(nationalGov).setBorrowRate(450);
    expect(await iblp.effectiveBorrowRateBps()).to.equal(450n);

    await iblp.connect(nationalGov).setDownwardRateSource(await national.getAddress());
    expect(await iblp.effectiveBorrowRateBps()).to.equal(400n);

    const principal = ethers.parseEther("1");
    await expect(
      iblp.connect(nationalGov).borrow(borrower2.address, principal, 7, { value: principal }),
    )
      .to.emit(iblp, "IBLPBorrowed")
      .withArgs(1n, nationalGov.address, borrower2.address, principal, 7n, 400n);
  });

  it("caps the upward-deposit yield strictly below r_down - delta once wired", async () => {
    const { national, nationalGov, worldGov } = await deployStack();
    const Upward = await ethers.getContractFactory("UpwardDepositFacility");
    const upward = await Upward.deploy(worldGov.address);
    await upward.registerDepositor(nationalGov.address);

    await upward.connect(worldGov).setDownwardRateSource(await national.getAddress());
    expect(await upward.effectiveDepositRateBps()).to.equal(150n);

    await upward.connect(worldGov).setDepositRate(1000);
    expect(await upward.effectiveDepositRateBps()).to.equal(399n);

    await worldGov.sendTransaction({ to: await upward.getAddress(), value: ethers.parseEther("1") });

    const principal = ethers.parseEther("1");
    await upward.connect(nationalGov).depositUpward(await national.getAddress(), { value: principal });

    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    const withdrawAmount = (principal * 2000n) / 10000n;
    const before = await ethers.provider.getBalance(nationalGov.address);
    const tx = await upward.connect(nationalGov).withdrawUpward(1, withdrawAmount);
    const receipt = await tx.wait();
    const gasCost = receipt!.gasUsed * receipt!.gasPrice;
    const after = await ethers.provider.getBalance(nationalGov.address);

    const expectedInterest = (withdrawAmount * 399n * 365n) / (10000n * 365n);
    expect(after - before + gasCost).to.equal(withdrawAmount + expectedInterest);
  });

  it("freezes account and blocks new loan requests", async () => {
    const { local, localGov, borrower } = await deployStack();
    await local.connect(localGov).freezeAccount(borrower.address);
    await expect(local.connect(borrower).requestLoan(usdc("0.01"), 6, "x")).to.be.revertedWith(
      "account frozen",
    );
  });
});
