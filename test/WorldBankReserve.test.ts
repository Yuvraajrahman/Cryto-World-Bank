import { expect } from "chai";
import { ethers } from "hardhat";
import { WorldBankReserve } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("WorldBankReserve", function () {
  let worldBank: WorldBankReserve;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [admin, user1, user2] = await ethers.getSigners();

    const WorldBankReserveFactory = await ethers.getContractFactory("WorldBankReserve");
    worldBank = await WorldBankReserveFactory.deploy();
    await worldBank.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await worldBank.owner()).to.equal(admin.address);
    });

    it("Should initialize with zero reserve", async function () {
      expect(await worldBank.getTotalReserve()).to.equal(0);
    });
  });

  describe("Deposits", function () {
    it("Should accept deposits", async function () {
      const depositAmount = ethers.parseEther("1.0");

      await expect(
        worldBank.connect(user1).depositToReserve({ value: depositAmount })
      ).to.emit(worldBank, "ReserveDeposited");

      expect(await worldBank.getTotalReserve()).to.equal(depositAmount);
      expect(await worldBank.getUserDeposits(user1.address)).to.equal(depositAmount);
    });

    it("Should track user deposits", async function () {
      const depositAmount = ethers.parseEther("2.0");

      await worldBank.connect(user1).depositToReserve({ value: depositAmount });

      expect(await worldBank.getUserDeposits(user1.address)).to.equal(depositAmount);
    });

    it("Should reject zero deposits", async function () {
      await expect(
        worldBank.connect(user1).depositToReserve({ value: 0 })
      ).to.be.revertedWith("Deposit amount must be greater than 0");
    });
  });

  describe("Loan Requests", function () {
    beforeEach(async function () {
      await worldBank.connect(admin).depositToReserve({
        value: ethers.parseEther("10.0"),
      });
    });

    it("Should allow users to request loans", async function () {
      const loanAmount = ethers.parseEther("1.0");
      const purpose = "Education expenses";

      await expect(
        worldBank.connect(user1).requestLoan(loanAmount, purpose)
      )
        .to.emit(worldBank, "LoanRequested")
        .withArgs(1, user1.address, loanAmount, purpose);
    });

    it("Should reject loan requests exceeding reserve", async function () {
      const loanAmount = ethers.parseEther("20.0");

      await expect(
        worldBank.connect(user1).requestLoan(loanAmount, "Too much")
      ).to.be.revertedWith("Insufficient reserve balance");
    });

    it("Should reject empty purpose", async function () {
      const loanAmount = ethers.parseEther("1.0");

      await expect(
        worldBank.connect(user1).requestLoan(loanAmount, "")
      ).to.be.revertedWith("Purpose cannot be empty");
    });
  });

  describe("Loan Approval", function () {
    beforeEach(async function () {
      await worldBank.connect(admin).depositToReserve({
        value: ethers.parseEther("10.0"),
      });
      await worldBank.connect(user1).requestLoan(
        ethers.parseEther("2.0"),
        "Business loan"
      );
    });

    it("Should allow admin to approve loans", async function () {
      await expect(worldBank.connect(admin).approveLoan(1))
        .to.emit(worldBank, "LoanApproved")
        .withArgs(1, user1.address, ethers.parseEther("2.0"));
    });

    it("Should transfer funds on approval", async function () {
      const balanceBefore = await ethers.provider.getBalance(user1.address);

      await worldBank.connect(admin).approveLoan(1);

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("2.0"));
    });

    it("Should not allow non-admin to approve", async function () {
      await expect(
        worldBank.connect(user2).approveLoan(1)
      ).to.be.revertedWithCustomError(worldBank, "OwnableUnauthorizedAccount");
    });
  });

  describe("Statistics", function () {
    it("Should return correct statistics", async function () {
      await worldBank.connect(admin).depositToReserve({
        value: ethers.parseEther("5.0"),
      });
      await worldBank.connect(user1).requestLoan(
        ethers.parseEther("1.0"),
        "Test"
      );

      const stats = await worldBank.getStats();
      expect(stats._totalReserve).to.equal(ethers.parseEther("5.0"));
      expect(stats._totalLoans).to.equal(1);
      expect(stats._pendingLoans).to.equal(1);
    });
  });
});
