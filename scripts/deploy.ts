import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { getDeploymentPersonas } from "./deployment-signers";

type DeploymentManifest = {
  network: string;
  chainId: number;
  deployer: string;
  deployedAt: string;
  contracts: {
    WorldBankReserve: string;
    NationalBank: string;
    LocalBank: string;
    LoanController: string;
    MockUSDC: string;
    CreditPassport: string;
    UpwardDepositFacility: string;
    SavingsVault: string;
    GroupLendingPool: string;
    InterBankLendingPool: string;
    GovernorMultisig2of3?: string;
  };
  accounts: Array<{
    index: number;
    address: string;
    role: string;
    label: string;
  }>;
};

async function main() {
  const personas = await getDeploymentPersonas();
  const { worldGov, nationalGov, localGov, approver, borrower1, borrower2, multisigOwner2 } =
    personas;

  const net = network.name;
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const isLocal = chainId === 31337;

  /** On testnets, fund persona wallets from account #0 so role-gated txs can succeed. */
  async function waitWalletReady(wallet: typeof worldGov) {
    if (isLocal) return;
    for (let i = 0; i < 30; i++) {
      const latest = await ethers.provider.getTransactionCount(wallet.address, "latest");
      const pending = await ethers.provider.getTransactionCount(wallet.address, "pending");
      if (pending === latest) return;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  async function ensureFunded(
    wallet: typeof worldGov,
    label: string,
    min = ethers.parseEther("0.08"),
  ) {
    if (isLocal) return;
    await waitWalletReady(wallet);
    let bal = await ethers.provider.getBalance(wallet.address);
    if (bal >= min) return;
    const topUp = min - bal + ethers.parseEther("0.01");
    const tx = await worldGov.sendTransaction({ to: wallet.address, value: topUp });
    await tx.wait();
    await waitWalletReady(wallet);
    bal = await ethers.provider.getBalance(wallet.address);
    if (bal < min) {
      throw new Error(`Failed to fund ${label} (${wallet.address})`);
    }
    console.log(`  ✓ Funded ${label} (+${ethers.formatEther(topUp)} ETH)`);
  }

  async function fundPersonasIfNeeded() {
    if (isLocal) return;
    for (const [label, wallet] of [
      ["National Gov", nationalGov],
      ["Local Gov", localGov],
      ["Approver", approver],
      ["Borrower 1", borrower1],
      ["Borrower 2", borrower2],
    ] as const) {
      await ensureFunded(wallet, label);
    }
  }

  console.log(`\n▸ Deploying Crypto World Bank contracts on '${net}' (Phase I + II)`);
  console.log(`  World Gov   : ${worldGov.address}`);
  console.log(`  National Gov: ${nationalGov.address}`);
  console.log(`  Local Gov   : ${localGov.address}`);
  console.log(`  Approver    : ${approver.address}\n`);

  await fundPersonasIfNeeded();

  const gasPayer = worldGov;
  const tx = <T extends { connect(s: typeof worldGov): T }>(factory: T, persona: typeof worldGov) =>
    factory.connect(isLocal ? persona : gasPayer);

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUsdc = await MockUSDC.connect(worldGov).deploy(worldGov.address);
  await mockUsdc.waitForDeployment();
  const mockUsdcAddr = await mockUsdc.getAddress();
  console.log(`  ✓ MockUSDC              → ${mockUsdcAddr}`);

  const Multisig = await ethers.getContractFactory("GovernorMultisig2of3");
  const multisig = await Multisig.connect(worldGov).deploy(
    worldGov.address,
    nationalGov.address,
    multisigOwner2.address,
  );
  await multisig.waitForDeployment();
  const multisigAddr = await multisig.getAddress();
  console.log(`  ✓ GovernorMultisig2of3  → ${multisigAddr}`);

  const WorldBank = await ethers.getContractFactory("WorldBankReserve");
  const worldBank = await WorldBank.connect(worldGov).deploy(worldGov.address);
  await worldBank.waitForDeployment();
  const worldBankAddr = await worldBank.getAddress();
  await (await worldBank.connect(worldGov).setUsdc(mockUsdcAddr)).wait();
  console.log(`  ✓ WorldBankReserve      → ${worldBankAddr}`);

  const GOVERNOR_ROLE = await worldBank.GOVERNOR_ROLE();
  await (await worldBank.connect(worldGov).grantRole(GOVERNOR_ROLE, multisigAddr)).wait();

  const National = await ethers.getContractFactory("NationalBank");
  const national = await tx(National, nationalGov).deploy(
    nationalGov.address,
    worldBankAddr,
    "Bangladesh National Bank",
    "Bangladesh",
  );
  await national.waitForDeployment();
  const nationalAddr = await national.getAddress();
  await (await national.connect(nationalGov).setUsdc(mockUsdcAddr)).wait();
  console.log(`  ✓ NationalBank          → ${nationalAddr}`);

  const Local = await ethers.getContractFactory("LocalBank");
  const local = await tx(Local, localGov).deploy(
    localGov.address,
    nationalAddr,
    mockUsdcAddr,
    "Dhaka Local Bank",
    "Dhaka Metropolitan",
  );
  await local.waitForDeployment();
  const localAddr = await local.getAddress();
  const loanControllerAddr = await local.loanController();
  console.log(`  ✓ LocalBank             → ${localAddr}`);
  console.log(`  ✓ LoanController        → ${loanControllerAddr}`);

  const Passport = await ethers.getContractFactory("CreditPassport");
  const passport = await tx(Passport, localGov).deploy(localGov.address);
  await passport.waitForDeployment();
  const passportAddr = await passport.getAddress();
  await ensureFunded(localGov, "Local Gov");
  await (await passport.connect(localGov).grantLoanHook(loanControllerAddr)).wait();
  await (await passport.connect(localGov).grantIssuer(localAddr)).wait();
  await ensureFunded(localGov, "Local Gov");
  await (await local.connect(localGov).linkCreditPassport(passportAddr)).wait();
  console.log(`  ✓ CreditPassport        → ${passportAddr}`);

  const Upward = await ethers.getContractFactory("UpwardDepositFacility");
  const upward = await Upward.connect(worldGov).deploy(worldGov.address);
  await upward.waitForDeployment();
  const upwardAddr = await upward.getAddress();
  await (await upward.connect(worldGov).registerDepositor(nationalAddr)).wait();
  await (await upward.connect(worldGov).registerDepositor(localAddr)).wait();
  await (await upward.connect(worldGov).registerDepositor(nationalGov.address)).wait();
  await (await upward.connect(worldGov).registerDepositor(localGov.address)).wait();
  // Wire the rate-spread constraint (r_up < r_down - delta) to the National
  // Bank's downward lending rate — this demo instance is shared across the
  // National→World deposit path, which is the primary flow exercised here.
  await (await upward.connect(worldGov).setDownwardRateSource(nationalAddr)).wait();
  console.log(`  ✓ UpwardDepositFacility → ${upwardAddr}`);

  const Savings = await ethers.getContractFactory("SavingsVault");
  const savings = await tx(Savings, localGov).deploy(localGov.address, mockUsdcAddr, false);
  await savings.waitForDeployment();
  const savingsAddr = await savings.getAddress();
  console.log(`  ✓ SavingsVault          → ${savingsAddr}`);

  const Group = await ethers.getContractFactory("GroupLendingPool");
  const group = await tx(Group, localGov).deploy(localGov.address);
  await group.waitForDeployment();
  const groupAddr = await group.getAddress();
  console.log(`  ✓ GroupLendingPool      → ${groupAddr}`);

  const IBLP = await ethers.getContractFactory("InterBankLendingPool");
  const iblp = await tx(IBLP, nationalGov).deploy(nationalGov.address, "IBLP_NB");
  await iblp.waitForDeployment();
  const iblpAddr = await iblp.getAddress();
  await ensureFunded(nationalGov, "National Gov");
  await (await iblp.connect(nationalGov).registerBorrower(nationalAddr)).wait();
  await (await iblp.connect(nationalGov).registerBorrower(localAddr)).wait();
  // Wire the rate-spread constraint (r_IB <= r_downward - delta) to the
  // National Bank's downward lending rate, since this pool is tagged IBLP_NB.
  await (await iblp.connect(nationalGov).setDownwardRateSource(nationalAddr)).wait();
  console.log(`  ✓ InterBankLendingPool  → ${iblpAddr}`);

  await (
    await worldBank
      .connect(worldGov)
      .registerNationalBank(nationalAddr, "Bangladesh National Bank", "Bangladesh")
  ).wait();
  await ensureFunded(nationalGov, "National Gov");
  await (
    await national
      .connect(nationalGov)
      .registerLocalBank(localAddr, "Dhaka Local Bank", "Dhaka Metropolitan")
  ).wait();
  console.log("  ✓ Tiers registered in parent contracts");

  await ensureFunded(localGov, "Local Gov");
  await (await local.connect(localGov).addApprover(approver.address)).wait();
  await (await local.connect(localGov).registerClient(borrower1.address)).wait();
  await (await local.connect(localGov).registerClient(borrower2.address)).wait();

  const controller = await ethers.getContractAt("LoanController", loanControllerAddr);
  await (await local.connect(localGov).grantRiskOracle(approver.address)).wait();
  console.log(`  ✓ Oracle role granted to approver`);
  console.log(`  ✓ Approver + borrowers registered`);

  await (await mockUsdc.connect(worldGov).mint(worldGov.address, 100_000n * 1_000_000n)).wait();
  console.log("  ✓ Minted 100,000 mUSDC to world governor");

  const seedUsdc = process.env.SEED_RESERVE_USDC ?? (isLocal ? "2000000" : "500000"); // 2M / 0.5M mUSDC
  const seedDeposit = BigInt(seedUsdc);
  if (seedDeposit > 0n) {
    await (await mockUsdc.connect(worldGov).mint(worldGov.address, seedDeposit)).wait();
    await (await mockUsdc.connect(worldGov).approve(worldBankAddr, seedDeposit)).wait();
    await (await worldBank.connect(worldGov).deposit(seedDeposit)).wait();
    console.log(`  ✓ Seeded World Bank reserve with ${seedDeposit.toString()} mUSDC units`);
  }

  const manifest: DeploymentManifest = {
    network: net,
    chainId,
    deployer: worldGov.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      WorldBankReserve: worldBankAddr,
      NationalBank: nationalAddr,
      LocalBank: localAddr,
      LoanController: loanControllerAddr,
      MockUSDC: mockUsdcAddr,
      CreditPassport: passportAddr,
      UpwardDepositFacility: upwardAddr,
      SavingsVault: savingsAddr,
      GroupLendingPool: groupAddr,
      InterBankLendingPool: iblpAddr,
      GovernorMultisig2of3: multisigAddr,
    },
    accounts: personas.addresses,
  };

  const outDir = path.join(__dirname, "..", "deployments", "testnet");
  fs.mkdirSync(outDir, { recursive: true });

  const manifestFile = path.join(outDir, `${net}.json`);
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

  const legacyFile = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(legacyFile, JSON.stringify(manifest, null, 2));

  console.log(`\n  Manifest written to ${manifestFile}`);
  console.log(`  Run: npm run sync:env ${net}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
