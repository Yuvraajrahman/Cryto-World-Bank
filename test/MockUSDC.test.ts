import { expect } from "chai";
import { ethers } from "hardhat";

describe("MockUSDC", () => {
  it("mints 6-decimal tokens to recipients", async () => {
    const [minter, user] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy(minter.address);
    await usdc.waitForDeployment();

    expect(await usdc.decimals()).to.equal(6);

    await usdc.connect(minter).mint(user.address, 1_000_000n); // 1.0 mUSDC
    expect(await usdc.balanceOf(user.address)).to.equal(1_000_000n);
  });

  it("rejects mint from non-minter", async () => {
    const [minter, outsider] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy(minter.address);
    await usdc.waitForDeployment();

    await expect(
      usdc.connect(outsider).mint(outsider.address, 100n),
    ).to.be.revertedWith("not minter");
  });
});
