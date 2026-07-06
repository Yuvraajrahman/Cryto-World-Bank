import { expect } from "chai";
import { ethers } from "hardhat";

describe("Phase II — core banking extensions", () => {
  async function deployStack() {
    const [worldGov, nationalGov, localGov, approver, borrower, borrower2] =
      await ethers.getSigners();

    const WorldBank = await ethers.getContractFactory("WorldBankReserve");
    const worldBank = await WorldBank.deploy(worldGov.address);

    const National = await ethers.getContractFactory("NationalBank");
    const national = await National.deploy(
      nationalGov.address,
      await worldBank.getAddress(),
      "NB",
      "BD",
    );

    const Local = await ethers.getContractFactory("LocalBank");
    const local = await Local.deploy(
      localGov.address,
      await national.getAddress(),
      "LB",
      "Dhaka",
    );

    const Passport = await ethers.getContractFactory("CreditPassport");
    const passport = await Passport.deploy(localGov.address);

    const loanController = await local.loanController();
    await passport.connect(localGov).grantLoanHook(loanController);
    await passport.connect(localGov).grantIssuer(await local.getAddress());
    await local.connect(localGov).linkCreditPassport(await passport.getAddress());

    await worldBank.connect(worldGov).registerNationalBank(await national.getAddress(), "NB", "BD");
    await national.connect(nationalGov).registerLocalBank(await local.getAddress(), "LB", "Dhaka");
    await local.connect(localGov).addApprover(approver.address);
    await local.connect(localGov).registerClient(borrower.address);
    await local.connect(localGov).registerClient(borrower2.address);

    await worldGov.sendTransaction({ to: await worldBank.getAddress(), value: ethers.parseEther("50") });
    await worldBank.connect(worldGov).allocate(await national.getAddress(), ethers.parseEther("20"));
    await national.connect(nationalGov).allocate(await local.getAddress(), ethers.parseEther("10"));

    return {
      worldBank,
      national,
      local,
      passport,
      worldGov,
      nationalGov,
      localGov,
      approver,
      borrower,
      borrower2,
    };
  }

  it("reverts loan request when principal exceeds Credit Passport tier limit", async () => {
    const { local, borrower } = await deployStack();
    await expect(
      local.connect(borrower).requestLoan(ethers.parseEther("1"), 6, "too big"),
    ).to.be.revertedWith("limit exceeded");
  });

  it("approves loan within passport limit and upgrades score on repay", async () => {
    const { local, approver, borrower, passport } = await deployStack();
    await local.connect(borrower).requestLoan(ethers.parseEther("0.04"), 6, "ok");
    await local.connect(approver).approveLoan(1);
    const loan = await local.loans(1);
    const per = await local.installmentAmount(1);
    await local.connect(borrower).payInstallment(1, { value: per });
    const score = await passport.getScore(borrower.address);
    expect(score.creditScore).to.equal(325);
  });

  it("records upward deposit from national bank governor to world reserve", async () => {
    const { worldBank, nationalGov, worldGov } = await deployStack();
    const Upward = await ethers.getContractFactory("UpwardDepositFacility");
    const upward = await Upward.deploy(worldGov.address);
    await upward.registerDepositor(nationalGov.address);

    const before = await ethers.provider.getBalance(await worldBank.getAddress());
    await upward.connect(nationalGov).depositUpward(await worldBank.getAddress(), {
      value: ethers.parseEther("1"),
    });
    const after = await ethers.provider.getBalance(await worldBank.getAddress());
    expect(after - before).to.equal(ethers.parseEther("1"));
  });

  it("creates group lending pool with unanimous consent", async () => {
    const { local, localGov, borrower, borrower2 } = await deployStack();
    const Group = await ethers.getContractFactory("GroupLendingPool");
    const group = await Group.deploy(localGov.address);
    await group.connect(localGov).createGroup(await local.getAddress());
    const groupId = 1n;
    await group.connect(localGov).addMember(groupId, borrower.address);
    await group.connect(localGov).addMember(groupId, borrower2.address);
    await group.connect(borrower).recordConsent(groupId);
    await group.connect(borrower2).recordConsent(groupId);
    expect(await group.isGroupReady(groupId)).to.equal(true);
  });

  it("supports interbank same-tier borrow and repay", async () => {
    const { nationalGov, borrower, borrower2 } = await deployStack();
    const IBLP = await ethers.getContractFactory("InterBankLendingPool");
    const iblp = await IBLP.deploy(nationalGov.address, "IBLP_NB");
    await iblp.connect(nationalGov).registerBorrower(nationalGov.address);
    await iblp.connect(nationalGov).registerBorrower(borrower2.address);
    const principal = ethers.parseEther("1");
    await iblp.connect(nationalGov).borrow(borrower2.address, principal, 7, { value: principal });
    const interest = (principal * 400n * 7n) / (10000n * 365n);
    await iblp.connect(borrower2).repay(1, { value: principal + interest });
  });

  it("freezes account and blocks new loan requests", async () => {
    const { local, localGov, borrower } = await deployStack();
    await local.connect(localGov).freezeAccount(borrower.address);
    await expect(
      local.connect(borrower).requestLoan(ethers.parseEther("0.01"), 6, "x"),
    ).to.be.revertedWith("account frozen");
  });
});
