import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const net = network.name;
  console.log(`\n▸ Deploying Crypto World Bank contracts on '${net}'`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log(`  Balance : ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Tier 1 — World Bank Reserve
  const WorldBank = await ethers.getContractFactory("WorldBankReserve");
  const worldBank = await WorldBank.deploy(deployer.address);
  await worldBank.waitForDeployment();
  const worldBankAddr = await worldBank.getAddress();
  console.log(`  ✓ WorldBankReserve  → ${worldBankAddr}`);

  // Tier 2 — National Bank
  const National = await ethers.getContractFactory("NationalBank");
  const national = await National.deploy(
    deployer.address,
    worldBankAddr,
    "Bangladesh National Bank",
    "Bangladesh"
  );
  await national.waitForDeployment();
  const nationalAddr = await national.getAddress();
  console.log(`  ✓ NationalBank      → ${nationalAddr}`);

  // Tier 3 — Local Bank
  const Local = await ethers.getContractFactory("LocalBank");
  const local = await Local.deploy(
    deployer.address,
    nationalAddr,
    "Dhaka Local Bank",
    "Dhaka Metropolitan"
  );
  await local.waitForDeployment();
  const localAddr = await local.getAddress();
  console.log(`  ✓ LocalBank         → ${localAddr}`);

  // Register tiers
  await (await worldBank.registerNationalBank(nationalAddr, "Bangladesh National Bank", "Bangladesh")).wait();
  await (await national.registerLocalBank(localAddr, "Dhaka Local Bank", "Dhaka Metropolitan")).wait();
  console.log("  ✓ Tiers registered in parent contracts");

  // Write deployment artifact
  const out = {
    network: net,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      WorldBankReserve: worldBankAddr,
      NationalBank: nationalAddr,
      LocalBank: localAddr,
    },
  };
  const file = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`\n  Deployment info written to ${file}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
