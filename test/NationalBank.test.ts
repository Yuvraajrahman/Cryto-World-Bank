import { expect } from "chai";
import { ethers } from "hardhat";
import { usdc } from "./helpers/usdc";

describe("NationalBank — Tier 2 unit tests", () => {
  async function deploy() {
    const [governor, outsider, localBank, borrower, other] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy(governor.address);
    await mockUsdc.waitForDeployment();

    const WorldBank = await ethers.getContractFactory("WorldBankReserve");
    const wb = await WorldBank.deploy(governor.address);
    await wb.waitForDeployment();
    await wb.connect(governor).setUsdc(await mockUsdc.getAddress());

    const National = await ethers.getContractFactory("NationalBank");
    const nb = await National.deploy(
      governor.address,
      await wb.getAddress(),
      "Bangladesh National Bank",
      "Bangladesh"
    );
    await nb.waitForDeployment();
    await nb.connect(governor).setUsdc(await mockUsdc.getAddress());

    await mockUsdc.mint(governor.address, usdc("50"));
    await mockUsdc.connect(governor).transfer(await nb.getAddress(), usdc("50"));

    return { wb, nb, mockUsdc, governor, outsider, localBank, borrower, other };
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
    const { nb, mockUsdc, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");

    const before = await mockUsdc.balanceOf(localBank.address);
    await nb.connect(governor).allocate(localBank.address, usdc("10"));
    const after = await mockUsdc.balanceOf(localBank.address);

    expect(after - before).to.equal(usdc("10"));
    const acc = await nb.localBanks(localBank.address);
    expect(acc.allocated).to.equal(usdc("10"));
    expect(acc.outstanding).to.equal(usdc("10"));
    expect(await nb.totalAllocated()).to.equal(usdc("10"));
  });

  it("refuses to allocate below the minimum reserve ratio (15% default)", async () => {
    const { nb, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");

    await expect(
      nb.connect(governor).allocate(localBank.address, usdc("45"))
    ).to.be.revertedWith("breaches reserve ratio");

    await expect(
      nb.connect(governor).allocate(localBank.address, usdc("40"))
    ).to.not.be.reverted;
  });

  it("refuses to allocate to an unregistered local bank", async () => {
    const { nb, governor, other } = await deploy();
    await expect(
      nb.connect(governor).allocate(other.address, usdc("1"))
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
    const { nb, mockUsdc, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");
    await nb.connect(governor).pause();
    await expect(
      nb.connect(governor).allocate(localBank.address, usdc("1"))
    ).to.be.reverted;
    const [balance] = await nb.bankStats();
    expect(balance).to.equal(usdc("50"));
  });

  it("records a repayment from the local bank and trims outstanding", async () => {
    const { nb, mockUsdc, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");
    await nb.connect(governor).allocate(localBank.address, usdc("20"));

    const principal = usdc("8");
    const totalPaid = usdc("9");
    await mockUsdc.mint(localBank.address, totalPaid);
    await mockUsdc.connect(localBank).approve(await nb.getAddress(), totalPaid);

    await expect(nb.connect(localBank).recordRepayment(principal, totalPaid))
      .to.emit(nb, "RepaymentRecorded")
      .withArgs(localBank.address, principal, usdc("1"));

    const acc = await nb.localBanks(localBank.address);
    expect(acc.outstanding).to.equal(usdc("12"));
    expect(acc.repaid).to.equal(usdc("8"));
  });

  it("rejects repayment whose value is below the stated principal", async () => {
    const { nb, mockUsdc, governor, localBank } = await deploy();
    await nb.connect(governor).registerLocalBank(localBank.address, "LB", "Dhaka");
    await nb.connect(governor).allocate(localBank.address, usdc("5"));

    await mockUsdc.mint(localBank.address, usdc("2"));
    await mockUsdc.connect(localBank).approve(await nb.getAddress(), usdc("2"));

    await expect(
      nb.connect(localBank).recordRepayment(usdc("3"), usdc("2"))
    ).to.be.revertedWith("insufficient payment");
  });

  it("refuses repayments from a non-registered caller", async () => {
    const { nb, mockUsdc, other } = await deploy();
    await mockUsdc.mint(other.address, usdc("1"));
    await mockUsdc.connect(other).approve(await nb.getAddress(), usdc("1"));
    await expect(
      nb.connect(other).recordRepayment(usdc("1"), usdc("1"))
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

  it("requestUpstreamCapital forwards to World Bank as registered national bank", async () => {
    const { wb, nb, governor } = await deploy();
    await wb.connect(governor).registerNationalBank(await nb.getAddress(), "NB", "BD");

    await expect(nb.connect(governor).requestUpstreamCapital(usdc("2")))
      .to.emit(wb, "CapitalRequested")
      .withArgs(await nb.getAddress(), usdc("2"), 1n);

    const req = await wb.capitalRequests(1);
    expect(req.open).to.equal(true);
    expect(req.amount).to.equal(usdc("2"));
  });
});
