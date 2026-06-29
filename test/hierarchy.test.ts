import { expect } from "chai";
import { ethers } from "hardhat";

describe("Crypto World Bank — four-tier hierarchy", () => {
  async function deployFixture() {
    const [governor, nationalGov, localGov, approver, borrower, depositor] =
      await ethers.getSigners();

    const WorldBank = await ethers.getContractFactory("WorldBankReserve");
    const worldBank = await WorldBank.deploy(governor.address);

    const National = await ethers.getContractFactory("NationalBank");
    const national = await National.deploy(
      nationalGov.address,
      await worldBank.getAddress(),
      "NB",
      "BD"
    );

    const Local = await ethers.getContractFactory("LocalBank");
    const local = await Local.deploy(
      localGov.address,
      await national.getAddress(),
      "LB",
      "Dhaka"
    );

    return { worldBank, national, local, governor, nationalGov, localGov, approver, borrower, depositor };
  }

  it("accepts deposits into the reserve", async () => {
    const { worldBank, depositor } = await deployFixture();
    await depositor.sendTransaction({ to: await worldBank.getAddress(), value: ethers.parseEther("10") });
    expect(await worldBank.reserveBalance()).to.equal(ethers.parseEther("10"));
    expect(await worldBank.totalDeposits()).to.equal(ethers.parseEther("10"));
  });

  it("allocates capital down the hierarchy", async () => {
    const { worldBank, national, local, governor, nationalGov, depositor } = await deployFixture();

    await depositor.sendTransaction({ to: await worldBank.getAddress(), value: ethers.parseEther("100") });

    await worldBank.connect(governor).registerNationalBank(await national.getAddress(), "NB", "BD");
    await worldBank.connect(governor).allocate(await national.getAddress(), ethers.parseEther("50"));

    await national.connect(nationalGov).registerLocalBank(await local.getAddress(), "LB", "Dhaka");
    await national.connect(nationalGov).allocate(await local.getAddress(), ethers.parseEther("25"));

    expect(await ethers.provider.getBalance(await local.getAddress())).to.equal(ethers.parseEther("25"));
  });

  it("full loan lifecycle: request → approve → repay", async () => {
    const { worldBank, national, local, governor, nationalGov, localGov, borrower, depositor } =
      await deployFixture();

    await depositor.sendTransaction({ to: await worldBank.getAddress(), value: ethers.parseEther("100") });
    await worldBank.connect(governor).registerNationalBank(await national.getAddress(), "NB", "BD");
    await worldBank.connect(governor).allocate(await national.getAddress(), ethers.parseEther("50"));
    await national.connect(nationalGov).registerLocalBank(await local.getAddress(), "LB", "Dhaka");
    await national.connect(nationalGov).allocate(await local.getAddress(), ethers.parseEther("25"));

    await local.connect(borrower).requestLoan(ethers.parseEther("5"), 6, "working capital");
    await local.connect(localGov).approveLoan(1);

    const loan = await local.loans(1);
    expect(loan.status).to.equal(3); // Active
    expect(loan.installmentCount).to.equal(1); // below threshold → single payment

    await local.connect(borrower).payInstallment(1, { value: loan.totalOwed });
    const updated = await local.loans(1);
    expect(updated.status).to.equal(4); // Repaid
  });
});
