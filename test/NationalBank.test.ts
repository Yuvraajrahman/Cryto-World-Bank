import { expect } from "chai";
import { ethers } from "hardhat";

describe("NationalBank — Tier 2 unit tests", () => {
  async function deploy() {
    const [governor, outsider, localBank, borrower, other] = await ethers.getSigners();
    const WorldBank = await ethers.getContractFactory("WorldBankReserve");
    const wb = await WorldBank.deploy(governor.address);

    const National = await ethers.getContractFactory("NationalBank");
    const nb = await National.deploy(
      governor.address,
      await wb.getAddress(),
      "Bangladesh National Bank",
      "Bangladesh"
    );

    // Fund the national bank directly so tests can allocate without routing
    // through the world bank (covered elsewhere).
    await other.sendTransaction({ to: await nb.getAddress(), value: ethers.parseEther("50") });

    return { wb, nb, governor, outsider, localBank, borrower, other };
  }

  it("stores the world-bank parent and name/jurisdiction on deploy", async () => {
    const { wb, nb } = await deploy();
    expect(await nb.worldBank()).to.equal(await wb.getAddress());
    expect(await nb.name()).to.equal("Bangladesh National Bank");
    expect(await nb.jurisdiction()).to.equal("Bangladesh");
  });

  it("only governor can register a local bank", async () => {
    const { nb, outsider, localBank } = await deploy();
    await expect(
      nb.connect(outsider).registerLocalBank(localBank.address, "LB", "Dhaka")
    ).to.be.reverted;
  });

  it("cannot register same local bank twice", async () => {
    const { nb, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");
    await expect(
      nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka")
    ).to.be.revertedWith("already registered");
  });

  it("allocates capital and updates allocated/outstanding totals", async () => {
    const { nb, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");

    const before = await ethers.provider.getBalance(localBank.address);
    await nb.connect(governor).allocate(localBank.address, ethers.parseEther("10"));
    const after = await ethers.provider.getBalance(localBank.address);

    expect(after - before).to.equal(ethers.parseEther("10"));
    const acc = await nb.localBanks(localBank.address);
    expect(acc.allocated).to.equal(ethers.parseEther("10"));
    expect(acc.outstanding).to.equal(ethers.parseEther("10"));
    expect(await nb.totalAllocated()).to.equal(ethers.parseEther("10"));
  });

  it("refuses to allocate to an unregistered local bank", async () => {
    const { nb, governor, other } = await deploy();
    await expect(
      nb.connect(governor).allocate(other.address, ethers.parseEther("1"))
    ).to.be.revertedWith("not a local bank");
  });

  it("enforces APR safety cap and emits LendingAprUpdated on change", async () => {
    const { nb, governor } = await deploy();
    await expect(nb.connect(governor).setLendingApr(10_000)).to.be.revertedWith(
      "apr too high"
    );
    await expect(nb.connect(governor).setLendingApr(700))
      .to.emit(nb, "LendingAprUpdated")
      .withArgs(500, 700);
  });

  it("pause() blocks allocate but views still work", async () => {
    const { nb, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");
    await nb.connect(governor).pause();
    await expect(
      nb.connect(governor).allocate(localBank.address, ethers.parseEther("1"))
    ).to.be.reverted;
    const [balance] = await nb.bankStats();
    expect(balance).to.equal(ethers.parseEther("50"));
  });

  it("records a repayment from the local bank and trims outstanding", async () => {
    const { nb, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");
    await nb.connect(governor).allocate(localBank.address, ethers.parseEther("20"));

    await expect(
      nb.connect(localBank).recordRepayment(ethers.parseEther("8"), {
        value: ethers.parseEther("9"),
      })
    )
      .to.emit(nb, "RepaymentRecorded")
      .withArgs(localBank.address, ethers.parseEther("8"), ethers.parseEther("1"));

    const acc = await nb.localBanks(localBank.address);
    expect(acc.outstanding).to.equal(ethers.parseEther("12"));
    expect(acc.repaid).to.equal(ethers.parseEther("8"));
  });

  it("rejects repayment whose value is below the stated principal", async () => {
    const { nb, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");
    await nb.connect(governor).allocate(localBank.address, ethers.parseEther("5"));

    await expect(
      nb.connect(localBank).recordRepayment(ethers.parseEther("3"), {
        value: ethers.parseEther("2"),
      })
    ).to.be.revertedWith("insufficient value");
  });

  it("refuses repayments from a non-registered caller", async () => {
    const { nb, other } = await deploy();
    await expect(
      nb.connect(other).recordRepayment(ethers.parseEther("1"), {
        value: ethers.parseEther("1"),
      })
    ).to.be.reverted;
  });

  it("listLocalBanks enumerates all registrations", async () => {
    const { nb, governor, localBank, other } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB1", "Dhaka");
    await nb.connect(governor).registerLocalBank(other.address, "LB2", "Chittagong");
    const list = await nb.listLocalBanks();
    expect(list).to.include(localBank.address);
    expect(list).to.include(other.address);
  });
});
