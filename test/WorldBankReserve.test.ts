import { expect } from "chai";
import { ethers } from "hardhat";
import { usdc } from "./helpers/usdc";

describe("WorldBankReserve — Tier 1 unit tests", () => {
  async function deploy() {
    const [governor, outsider, nationalBank, depositor, altBank] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy(governor.address);
    await mockUsdc.waitForDeployment();

    const WorldBank = await ethers.getContractFactory("WorldBankReserve");
    const wb = await WorldBank.deploy(governor.address);
    await wb.waitForDeployment();
    await wb.connect(governor).setUsdc(await mockUsdc.getAddress());

    return { wb, mockUsdc, governor, outsider, nationalBank, depositor, altBank };
  }

  async function mintDeposit(
    mockUsdc: Awaited<ReturnType<typeof deploy>>["mockUsdc"],
    wb: Awaited<ReturnType<typeof deploy>>["wb"],
    from: Awaited<ReturnType<typeof ethers.getSigners>>[0],
    amount: bigint,
  ) {
    await mockUsdc.mint(from.address, amount);
    await mockUsdc.connect(from).approve(await wb.getAddress(), amount);
    await wb.connect(from).deposit(amount);
  }

  it("accepts MockUSDC deposits", async () => {
    const { wb, mockUsdc, depositor } = await deploy();
    const amt = usdc("5");
    await mintDeposit(mockUsdc, wb, depositor, amt);
    expect(await wb.reserveBalance()).to.equal(amt);
    expect(await wb.totalDeposits()).to.equal(amt);
  });

  it("emits DepositReceived on deposit()", async () => {
    const { wb, mockUsdc, depositor } = await deploy();
    const amt = usdc("3");
    await mockUsdc.mint(depositor.address, amt);
    await mockUsdc.connect(depositor).approve(await wb.getAddress(), amt);
    await expect(wb.connect(depositor).deposit(amt))
      .to.emit(wb, "DepositReceived")
      .withArgs(depositor.address, amt);
  });

  it("rejects zero-value deposits", async () => {
    const { wb, depositor } = await deploy();
    await expect(wb.connect(depositor).deposit(0)).to.be.revertedWith("zero deposit");
  });

  it("only governor can register a national bank", async () => {
    const { wb, outsider, nationalBank } = await deploy();
    await expect(
      wb.connect(outsider).registerNationalBank(nationalBank.address, "NB", "BD")
    ).to.be.reverted;
  });

  it("cannot register the same bank twice", async () => {
    const { wb, governor, nationalBank } = await deploy();
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await expect(
      wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD")
    ).to.be.revertedWith("already registered");
  });

  it("rejects the zero address when registering", async () => {
    const { wb, governor } = await deploy();
    await expect(
      wb.connect(governor).registerNationalBank(ethers.ZeroAddress, "NB", "BD")
    ).to.be.revertedWith("zero address");
  });

  it("allocates capital to a registered bank and decrements reserve balance", async () => {
    const { wb, mockUsdc, governor, nationalBank, depositor } = await deploy();
    await mintDeposit(mockUsdc, wb, depositor, usdc("100"));
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");

    const before = await mockUsdc.balanceOf(nationalBank.address);
    await wb.connect(governor).allocate(nationalBank.address, usdc("40"));
    const after = await mockUsdc.balanceOf(nationalBank.address);

    expect(after - before).to.equal(usdc("40"));
    expect(await wb.reserveBalance()).to.equal(usdc("60"));
    expect(await wb.totalAllocated()).to.equal(usdc("40"));
  });

  it("allocateCapital alias matches allocate", async () => {
    const { wb, mockUsdc, governor, nationalBank, depositor } = await deploy();
    await mintDeposit(mockUsdc, wb, depositor, usdc("10"));
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await wb.connect(governor).allocateCapital(nationalBank.address, usdc("3"));
    expect(await wb.totalAllocated()).to.equal(usdc("3"));
  });

  it("refuses to allocate more than the reserve balance", async () => {
    const { wb, governor, nationalBank } = await deploy();
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await expect(
      wb.connect(governor).allocate(nationalBank.address, usdc("1"))
    ).to.be.revertedWith("reserve insufficient");
  });

  it("refuses to allocate below the minimum reserve ratio (15% default)", async () => {
    const { wb, mockUsdc, governor, nationalBank, depositor } = await deploy();
    await mintDeposit(mockUsdc, wb, depositor, usdc("100"));
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");

    await expect(
      wb.connect(governor).allocate(nationalBank.address, usdc("90"))
    ).to.be.revertedWith("breaches reserve ratio");

    await expect(
      wb.connect(governor).allocate(nationalBank.address, usdc("84"))
    ).to.not.be.reverted;
  });

  it("governor can adjust the minimum reserve ratio within the 50% safety cap", async () => {
    const { wb, governor } = await deploy();
    await expect(wb.connect(governor).setMinReserveRatio(6000)).to.be.revertedWith(
      "ratio too high"
    );
    await expect(wb.connect(governor).setMinReserveRatio(2000))
      .to.emit(wb, "MinReserveRatioUpdated")
      .withArgs(1500, 2000);
    expect(await wb.minReserveRatioBps()).to.equal(2000);
  });

  it("refuses to allocate to an unregistered bank", async () => {
    const { wb, mockUsdc, governor, altBank, depositor } = await deploy();
    await mintDeposit(mockUsdc, wb, depositor, usdc("10"));
    await expect(
      wb.connect(governor).allocate(altBank.address, usdc("1"))
    ).to.be.revertedWith("not a national bank");
  });

  it("enforces APR safety cap (≤50%)", async () => {
    const { wb, governor } = await deploy();
    await expect(wb.connect(governor).setLendingApr(6000)).to.be.revertedWith(
      "apr too high"
    );
    await wb.connect(governor).setLendingApr(400);
    expect(await wb.lendingAprBps()).to.equal(400);
  });

  it("pause() blocks allocation and unpause() restores it", async () => {
    const { wb, mockUsdc, governor, nationalBank, depositor } = await deploy();
    await mintDeposit(mockUsdc, wb, depositor, usdc("20"));
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");

    await wb.connect(governor).pause();
    await expect(
      wb.connect(governor).allocate(nationalBank.address, usdc("5"))
    ).to.be.reverted;

    await wb.connect(governor).unpause();
    await expect(
      wb.connect(governor).allocate(nationalBank.address, usdc("5"))
    ).to.not.be.reverted;
  });

  it("emergency withdraw only works while paused and only for the governor", async () => {
    const { wb, mockUsdc, governor, outsider, depositor } = await deploy();
    await mintDeposit(mockUsdc, wb, depositor, usdc("10"));

    await expect(
      wb.connect(governor).emergencyWithdraw(governor.address, usdc("1"))
    ).to.be.reverted;

    await wb.connect(governor).pause();

    await expect(
      wb.connect(outsider).emergencyWithdraw(outsider.address, usdc("1"))
    ).to.be.reverted;

    await expect(
      wb.connect(governor).emergencyWithdraw(governor.address, usdc("3"))
    )
      .to.emit(wb, "EmergencyWithdrawal")
      .withArgs(governor.address, usdc("3"));
    expect(await wb.reserveBalance()).to.equal(usdc("7"));
  });

  it("records repayments from a registered national bank and updates totals", async () => {
    const { wb, mockUsdc, governor, nationalBank, depositor } = await deploy();
    await mintDeposit(mockUsdc, wb, depositor, usdc("100"));
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await wb.connect(governor).allocate(nationalBank.address, usdc("50"));

    const principal = usdc("20");
    const totalPaid = usdc("22");
    await mockUsdc.mint(nationalBank.address, totalPaid);
    await mockUsdc.connect(nationalBank).approve(await wb.getAddress(), totalPaid);

    await expect(wb.connect(nationalBank).recordRepayment(principal, totalPaid))
      .to.emit(wb, "RepaymentRecorded")
      .withArgs(nationalBank.address, principal, usdc("2"));

    const acc = await wb.nationalBanks(nationalBank.address);
    expect(acc.outstanding).to.equal(usdc("30"));
    expect(acc.repaid).to.equal(usdc("20"));
    expect(await wb.totalRepaid()).to.equal(usdc("20"));
  });

  it("systemStats returns consistent aggregate values", async () => {
    const { wb, mockUsdc, governor, nationalBank, depositor } = await deploy();
    await mintDeposit(mockUsdc, wb, depositor, usdc("100"));
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await wb.connect(governor).allocate(nationalBank.address, usdc("40"));

    const [balance, deposits, allocated, repaid, bankCount] = await wb.systemStats();
    expect(balance).to.equal(usdc("60"));
    expect(deposits).to.equal(usdc("100"));
    expect(allocated).to.equal(usdc("40"));
    expect(repaid).to.equal(0);
    expect(bankCount).to.equal(1);
  });

  it("revokes a bank only when it has no outstanding principal", async () => {
    const { wb, mockUsdc, governor, nationalBank, depositor } = await deploy();
    await mintDeposit(mockUsdc, wb, depositor, usdc("10"));
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await wb.connect(governor).allocate(nationalBank.address, usdc("5"));

    await expect(wb.connect(governor).revokeNationalBank(nationalBank.address))
      .to.be.revertedWith("outstanding loan");

    const totalPaid = usdc("5");
    await mockUsdc.mint(nationalBank.address, totalPaid);
    await mockUsdc.connect(nationalBank).approve(await wb.getAddress(), totalPaid);
    await wb.connect(nationalBank).recordRepayment(usdc("5"), totalPaid);

    await expect(wb.connect(governor).revokeNationalBank(nationalBank.address))
      .to.emit(wb, "NationalBankRevoked")
      .withArgs(nationalBank.address);
  });
});
