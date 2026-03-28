import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("Deploying UviCoin...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH/MATIC");

  const UviCoin = await ethers.getContractFactory("UviCoin");
  const uvicoin = await UviCoin.deploy();

  await uvicoin.waitForDeployment();
  const address = await uvicoin.getAddress();

  const totalSupply = await uvicoin.totalSupply();
  console.log("\nUviCoin deployed to:", address);
  console.log("Total supply:", ethers.formatEther(totalSupply), "UVI");
  console.log("Owner:", deployer.address);

  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    uvicoinAddress: address,
    ownerAddress: deployer.address,
    totalSupply: totalSupply.toString(),
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "uvicoin-deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment info saved to uvicoin-deployment.json");
  console.log("\nAdd to frontend .env: VITE_UVICOIN_ADDRESS=" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
