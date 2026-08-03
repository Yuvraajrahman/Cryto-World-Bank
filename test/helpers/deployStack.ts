import { ethers } from "hardhat";
import { usdc } from "./usdc";

export type DeployedStack = {
  mockUsdc: Awaited<ReturnType<typeof deployMockUsdc>>;
  worldBank: Awaited<ReturnType<typeof ethers.getContractAt>>;
  national: Awaited<ReturnType<typeof ethers.getContractAt>>;
  local: Awaited<ReturnType<typeof ethers.getContractAt>>;
  controller: Awaited<ReturnType<typeof ethers.getContractAt>>;
};

async function deployMockUsdc(minter: Awaited<ReturnType<typeof ethers.getSigners>>[0]) {
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const token = await MockUSDC.deploy(minter.address);
  await token.waitForDeployment();
  return token;
}

/** Deploy World → National → Local with MockUSDC wired on all capital paths. */
export async function deployUsdcStack(opts?: {
  worldGov?: Awaited<ReturnType<typeof ethers.getSigners>>[0];
  nationalGov?: Awaited<ReturnType<typeof ethers.getSigners>>[0];
  localGov?: Awaited<ReturnType<typeof ethers.getSigners>>[0];
}) {
  const [defaultWorldGov, defaultNationalGov, defaultLocalGov] = await ethers.getSigners();
  const worldGov = opts?.worldGov ?? defaultWorldGov;
  const nationalGov = opts?.nationalGov ?? defaultNationalGov;
  const localGov = opts?.localGov ?? defaultLocalGov;

  const mockUsdc = await deployMockUsdc(worldGov);

  const WorldBank = await ethers.getContractFactory("WorldBankReserve");
  const worldBank = await WorldBank.deploy(worldGov.address);
  await worldBank.waitForDeployment();
  await worldBank.connect(worldGov).setUsdc(await mockUsdc.getAddress());

  const National = await ethers.getContractFactory("NationalBank");
  const national = await National.deploy(
    nationalGov.address,
    await worldBank.getAddress(),
    "NB",
    "BD",
  );
  await national.waitForDeployment();
  await national.connect(nationalGov).setUsdc(await mockUsdc.getAddress());

  const Local = await ethers.getContractFactory("LocalBank");
  const local = await Local.deploy(
    localGov.address,
    await national.getAddress(),
    await mockUsdc.getAddress(),
    "LB",
    "Dhaka",
  );
  await local.waitForDeployment();
  const controllerAddr = await local.loanController();
  const controller = await ethers.getContractAt("LoanController", controllerAddr);

  return { mockUsdc, worldBank, national, local, controller, worldGov, nationalGov, localGov };
}

/** Mint USDC to depositor, deposit into World Bank, allocate down to Local loan pool. */
export async function fundLoanPool(
  stack: Awaited<ReturnType<typeof deployUsdcStack>>,
  depositor: Awaited<ReturnType<typeof ethers.getSigners>>[0],
  worldGov: Awaited<ReturnType<typeof ethers.getSigners>>[0],
  nationalGov: Awaited<ReturnType<typeof ethers.getSigners>>[0],
  amounts: { deposit: string; toNational: string; toLocal: string },
) {
  const { mockUsdc, worldBank, national, local } = stack;
  const depositAmt = usdc(amounts.deposit);
  const toNational = usdc(amounts.toNational);
  const toLocal = usdc(amounts.toLocal);

  await mockUsdc.mint(depositor.address, depositAmt);
  await mockUsdc.connect(depositor).approve(await worldBank.getAddress(), depositAmt);
  await worldBank.connect(depositor).deposit(depositAmt);

  await worldBank.connect(worldGov).registerNationalBank(await national.getAddress(), "NB", "BD");
  await worldBank.connect(worldGov).allocate(await national.getAddress(), toNational);

  await national.connect(nationalGov).registerLocalBank(await local.getAddress(), "LB", "Dhaka");
  await national.connect(nationalGov).allocate(await local.getAddress(), toLocal);
  await local.syncCapitalToLoanPool();
}

export { usdc };
