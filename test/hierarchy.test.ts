import { expect } from "chai";
import { ethers } from "hardhat";
import { commitAndRevealRisk } from "./helpers/riskOracle";
import { deployUsdcStack, fundLoanPool, usdc } from "./helpers/deployStack";

describe("Crypto World Bank — four-tier hierarchy", () => {
  async function deployFixture() {
    const [governor, nationalGov, localGov, approver, borrower, depositor] =
      await ethers.getSigners();

    const stack = await deployUsdcStack({
      worldGov: governor,
      nationalGov,
      localGov,
    });

    return { ...stack, governor, nationalGov, localGov, approver, borrower, depositor };
  }

  async function wireApprover(
    local: Awaited<ReturnType<typeof deployFixture>>["local"],
    localGov: Awaited<ReturnType<typeof deployFixture>>["localGov"],
    approver: Awaited<ReturnType<typeof deployFixture>>["approver"],
  ) {
    await local.connect(localGov).addApprover(approver.address);
    await local.connect(localGov).grantRiskOracle(approver.address);
  }

  it("accepts deposits into the reserve", async () => {
    const { worldBank, mockUsdc, depositor } = await deployFixture();
    const amt = usdc("10");
    await mockUsdc.mint(depositor.address, amt);
    await mockUsdc.connect(depositor).approve(await worldBank.getAddress(), amt);
    await worldBank.connect(depositor).deposit(amt);
    expect(await worldBank.reserveBalance()).to.equal(amt);
    expect(await worldBank.totalDeposits()).to.equal(amt);
  });

  it("allocates capital down the hierarchy", async () => {
    const { worldBank, national, local, controller, mockUsdc, governor, nationalGov, depositor } =
      await deployFixture();

    await fundLoanPool(
      { mockUsdc, worldBank, national, local, controller },
      depositor,
      governor,
      nationalGov,
      { deposit: "100", toNational: "50", toLocal: "25" },
    );

    expect(await mockUsdc.balanceOf(await controller.getAddress())).to.equal(usdc("25"));
  });

  it("full loan lifecycle: request → approve → repay", async () => {
    const {
      worldBank,
      national,
      local,
      controller,
      mockUsdc,
      governor,
      nationalGov,
      localGov,
      approver,
      borrower,
      depositor,
    } = await deployFixture();

    await fundLoanPool(
      { mockUsdc, worldBank, national, local, controller },
      depositor,
      governor,
      nationalGov,
      { deposit: "100", toNational: "50", toLocal: "25" },
    );

    await wireApprover(local, localGov, approver);
    await local.connect(borrower).requestLoan(usdc("5"), 6, "working capital");
    await commitAndRevealRisk(controller, approver, 1);
    await local.connect(approver).approveLoan(1);

    const loan = await local.loans(1);
    expect(loan.status).to.equal(3);
    expect(loan.installmentCount).to.equal(1);

    await mockUsdc.connect(borrower).approve(await controller.getAddress(), loan.totalOwed);
    const interestDue = loan.totalOwed - loan.principal;
    if (interestDue > 0n) {
      await mockUsdc.mint(borrower.address, interestDue);
    }
    await local.connect(borrower).payInstallment(1, loan.totalOwed);

    const updated = await local.loans(1);
    expect(updated.status).to.equal(4);
  });
});
