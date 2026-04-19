import { expect } from "chai";
import { ethers } from "hardhat";

describe("WorldBankReserve — Tier 1 unit tests", () => {
  async function deploy() {
    const [governor, outsider, nationalBank, depositor, altBank] = await ethers.getSigners();
    const WorldBank = await ethers.getContractFactory("WorldBankReserve");
    const wb = await WorldBank.deploy(governor.address);
    await wb.waitForDeployment();
    return { wb, governor, outsider, nationalBank, depositor, altBank };
  }

  it("accepts direct deposits via fallback receive()", async () => {
    const { wb, depositor } = await deploy();
    await depositor.sendTransaction({
      to: await wb.getAddress(),
      value: ethers.parseEther("5"),
    });
    expect(await wb.reserveBalance()).to.equal(ethers.parseEther("5"));
    expect(await wb.totalDeposits()).to.equal(ethers.parseEther("5"));
  });

  it("emits DepositReceived on deposit()", async () => {
    const { wb, depositor } = await deploy();
    await expect(wb.connect(depositor).deposit({ value: ethers.parseEther("3") }))
      .to.emit(wb, "DepositReceived")
      .withArgs(depositor.address, ethers.parseEther("3"));
  });

  it("rejects zero-value deposits", async () => {
    const { wb, depositor } = await deploy();
    await expect(
      wb.connect(depositor).deposit({ value: 0 })
    ).to.be.revertedWith("zero deposit");
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
    const { wb, governor, nationalBank, depositor } = await deploy();
    await depositor.sendTransaction({
      to: await wb.getAddress(),
      value: ethers.parseEther("100"),
    });
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");

    const before = await ethers.provider.getBalance(nationalBank.address);
    await wb.connect(governor).allocate(nationalBank.address, ethers.parseEther("40"));
    const after = await ethers.provider.getBalance(nationalBank.address);

    expect(after - before).to.equal(ethers.parseEther("40"));
    expect(await wb.reserveBalance()).to.equal(ethers.parseEther("60"));
    expect(await wb.totalAllocated()).to.equal(ethers.parseEther("40"));
  });

  it("refuses to allocate more than the reserve balance", async () => {
    const { wb, governor, nationalBank } = await deploy();
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await expect(
      wb.connect(governor).allocate(nationalBank.address, ethers.parseEther("1"))
    ).to.be.revertedWith("reserve insufficient");
  });

  it("refuses to allocate to an unregistered bank", async () => {
    const { wb, governor, altBank, depositor } = await deploy();
    await depositor.sendTransaction({
      to: await wb.getAddress(),
      value: ethers.parseEther("10"),
    });
    await expect(
      wb.connect(governor).allocate(altBank.address, ethers.parseEther("1"))
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
    const { wb, governor, nationalBank, depositor } = await deploy();
    await depositor.sendTransaction({
      to: await wb.getAddress(),
      value: ethers.parseEther("20"),
    });
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");

    await wb.connect(governor).pause();
    await expect(
      wb.connect(governor).allocate(nationalBank.address, ethers.parseEther("5"))
    ).to.be.reverted; // Pausable: paused

    await wb.connect(governor).unpause();
    await expect(
      wb.connect(governor).allocate(nationalBank.address, ethers.parseEther("5"))
    ).to.not.be.reverted;
  });

  it("emergency withdraw only works while paused and only for the governor", async () => {
    const { wb, governor, outsider, depositor } = await deploy();
    await depositor.sendTransaction({
      to: await wb.getAddress(),
      value: ethers.parseEther("10"),
    });

    // Not paused yet → revert
    await expect(
      wb.connect(governor).emergencyWithdraw(governor.address, ethers.parseEther("1"))
    ).to.be.reverted;

    await wb.connect(governor).pause();

    // Non-governor cannot call even when paused
    await expect(
      wb.connect(outsider).emergencyWithdraw(outsider.address, ethers.parseEther("1"))
    ).to.be.reverted;

    await expect(
      wb.connect(governor).emergencyWithdraw(governor.address, ethers.parseEther("3"))
    )
      .to.emit(wb, "EmergencyWithdrawal")
      .withArgs(governor.address, ethers.parseEther("3"));
    expect(await wb.reserveBalance()).to.equal(ethers.parseEther("7"));
  });

  it("records repayments from a registered national bank and updates totals", async () => {
    const { wb, governor, nationalBank, depositor } = await deploy();
    await depositor.sendTransaction({
      to: await wb.getAddress(),
      value: ethers.parseEther("100"),
    });
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await wb.connect(governor).allocate(nationalBank.address, ethers.parseEther("50"));

    await expect(
      wb.connect(nationalBank).recordRepayment(ethers.parseEther("20"), {
        value: ethers.parseEther("22"), // 20 principal + 2 interest
      })
    )
      .to.emit(wb, "RepaymentRecorded")
      .withArgs(nationalBank.address, ethers.parseEther("20"), ethers.parseEther("2"));

    const acc = await wb.nationalBanks(nationalBank.address);
    expect(acc.outstanding).to.equal(ethers.parseEther("30"));
    expect(acc.repaid).to.equal(ethers.parseEther("20"));
    expect(await wb.totalRepaid()).to.equal(ethers.parseEther("20"));
  });

  it("systemStats returns consistent aggregate values", async () => {
    const { wb, governor, nationalBank, depositor } = await deploy();
    await depositor.sendTransaction({
      to: await wb.getAddress(),
      value: ethers.parseEther("100"),
    });
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await wb.connect(governor).allocate(nationalBank.address, ethers.parseEther("40"));

    const [balance, deposits, allocated, repaid, bankCount] = await wb.systemStats();
    expect(balance).to.equal(ethers.parseEther("60"));
    expect(deposits).to.equal(ethers.parseEther("100"));
    expect(allocated).to.equal(ethers.parseEther("40"));
    expect(repaid).to.equal(0);
    expect(bankCount).to.equal(1);
  });

  it("revokes a bank only when it has no outstanding principal", async () => {
    const { wb, governor, nationalBank, depositor } = await deploy();
    await depositor.sendTransaction({
      to: await wb.getAddress(),
      value: ethers.parseEther("10"),
    });
    await wb.connect(governor).registerNationalBank(nationalBank.address, "NB", "BD");
    await wb.connect(governor).allocate(nationalBank.address, ethers.parseEther("5"));

    await expect(wb.connect(governor).revokeNationalBank(nationalBank.address))
      .to.be.revertedWith("outstanding loan");

    await wb.connect(nationalBank).recordRepayment(ethers.parseEther("5"), {
      value: ethers.parseEther("5"),
    });
    await expect(wb.connect(governor).revokeNationalBank(nationalBank.address))
      .to.emit(wb, "NationalBankRevoked")
      .withArgs(nationalBank.address);
  });
});
