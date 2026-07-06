import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import { ethers } from "ethers";

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const DEPLOY_MNEMONIC = process.env.SEPOLIA_MNEMONIC ?? process.env.DEPLOY_MNEMONIC ?? "";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
const AMOY_RPC_URL =
  process.env.AMOY_RPC_URL ?? "https://rpc-amoy.polygon.technology";

function networkAccounts(): string[] {
  if (PRIVATE_KEY) {
    return [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`];
  }
  if (DEPLOY_MNEMONIC) {
    const w = ethers.HDNodeWallet.fromPhrase(DEPLOY_MNEMONIC);
    return [w.privateKey];
  }
  return [];
}

const accounts = networkAccounts();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: { chainId: 31337 },
    localhost: { url: "http://127.0.0.1:8545", chainId: 31337 },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts,
      chainId: 11155111,
    },
    amoy: {
      url: AMOY_RPC_URL,
      accounts,
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY ?? "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY ?? "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
