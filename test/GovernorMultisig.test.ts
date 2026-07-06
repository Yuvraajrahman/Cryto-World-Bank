import { expect } from "chai";
import { ethers } from "hardhat";

describe("GovernorMultisig2of3", () => {
  it("requires two confirmations before execute", async () => {
    const [o0, o1, o2, outsider] = await ethers.getSigners();
    const Multisig = await ethers.getContractFactory("GovernorMultisig2of3");
    const ms = await Multisig.deploy(o0.address, o1.address, o2.address);

    const WorldBank = await ethers.getContractFactory("WorldBankReserve");
    const wb = await WorldBank.deploy(o0.address);
    const GOVERNOR_ROLE = await wb.GOVERNOR_ROLE();
    await wb.connect(o0).grantRole(GOVERNOR_ROLE, await ms.getAddress());

    const data = wb.interface.encodeFunctionData("pause", []);
    const opId = await ms.operationId(await wb.getAddress(), data);

    await ms.connect(o0).confirm(opId);
    await expect(ms.connect(o0).execute(await wb.getAddress(), data, opId)).to.be.revertedWith(
      "need 2 confirmations",
    );

    await ms.connect(o1).confirm(opId);
    await expect(ms.connect(o0).execute(await wb.getAddress(), data, opId)).to.not.be.reverted;
    expect(await wb.paused()).to.equal(true);
  });

  it("rejects non-owners", async () => {
    const [o0, o1, o2, outsider] = await ethers.getSigners();
    const Multisig = await ethers.getContractFactory("GovernorMultisig2of3");
    const ms = await Multisig.deploy(o0.address, o1.address, o2.address);
    const opId = ethers.id("test");
    await expect(ms.connect(outsider).confirm(opId)).to.be.revertedWith("not owner");
  });
});
