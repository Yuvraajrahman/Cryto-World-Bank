import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("Deploying WorldBankReserve...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const WorldBankReserve = await ethers.getContractFactory("WorldBankReserve");
  const worldBank = await WorldBankReserve.deploy();

  await worldBank.waitForDeployment();
  const address = await worldBank.getAddress();

  console.log("WorldBankReserve deployed to:", address);
  console.log("Admin (owner):", deployer.address);

  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    contractAddress: address,
    adminAddress: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment info saved to deployment-info.json");
  console.log("\nCopy the contract address to frontend/src/config/contracts.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
