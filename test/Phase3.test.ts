import { expect } from "chai";
import { ethers } from "hardhat";
import { commitAndRevealRisk } from "./helpers/riskOracle";
import { usdc } from "./helpers/usdc";

describe("Phase III — risk oracle", () => {
  async function deploy() {
    const [governor, approver, borrower, funder] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy(governor.address);
    await mockUsdc.waitForDeployment();

    const National = await ethers.getContractFactory("NationalBank");
    const nb = await National.deploy(governor.address, governor.address, "NB", "BD");
    await nb.waitForDeployment();
    await nb.connect(governor).setUsdc(await mockUsdc.getAddress());

    const Local = await ethers.getContractFactory("LocalBank");
    const lb = await Local.deploy(
      governor.address,
      await nb.getAddress(),
      await mockUsdc.getAddress(),
      "LB",
      "Dhaka",
    );
    await lb.waitForDeployment();
    const ctrl = await ethers.getContractAt("LoanController", await lb.loanController());

    await mockUsdc.mint(funder.address, usdc("50"));
    await mockUsdc.connect(funder).transfer(await ctrl.getAddress(), usdc("50"));

    await lb.connect(governor).grantRiskOracle(approver.address);
    await lb.connect(governor).addApprover(approver.address);
    return { lb, ctrl, mockUsdc, governor, approver, borrower };
  }

  it("blocks approveLoan until risk score is revealed", async () => {
    const { lb, ctrl, approver, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("2"), 6, "phase3");
    await expect(lb.connect(approver).approveLoan(1)).to.be.revertedWith("risk not revealed");
    await commitAndRevealRisk(ctrl, approver, 1, 2000);
    expect(await ctrl.isRiskScoreRevealed(1)).to.equal(true);
    await lb.connect(approver).approveLoan(1);
    expect((await lb.loans(1)).status).to.equal(3);
  });

  it("rejects reveal with wrong salt", async () => {
    const { lb, ctrl, approver, borrower } = await deploy();
    await lb.connect(borrower).requestLoan(usdc("1"), 6, "x");
    const salt = ethers.randomBytes(32);
    const commitHash = ethers.keccak256(
      ethers.solidityPacked(["uint16", "bytes32"], [3000, salt]),
    );
    await ctrl.connect(approver).commitRiskScore(1, commitHash);
    const badSalt = ethers.randomBytes(32);
    await expect(ctrl.connect(approver).revealRiskScore(1, 3000, badSalt)).to.be.revertedWith(
      "commit mismatch",
    );
  });
});
