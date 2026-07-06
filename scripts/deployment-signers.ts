/**
 * Resolves the six demo personas for deploy/verify scripts.
 *
 * Localhost: Hardhat accounts #0–#5 from the node.
 * Sepolia/Amoy: derive from SEPOLIA_MNEMONIC (or DEPLOY_MNEMONIC) — use the
 * standard Hardhat test mnemonic and fund accounts 0–5 from a Sepolia faucet.
 *
 * Alternative: set PRIVATE_KEY for account #0 plus SEPOLIA_ACCOUNT_1_PRIVATE_KEY … _5.
 */
import { ethers, network } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { HARDHAT_ACCOUNTS } from "../shared/hardhat-accounts.ts";

export type DeploymentPersonas = {
  worldGov: HardhatEthersSigner | ethers.Wallet;
  nationalGov: HardhatEthersSigner | ethers.Wallet;
  localGov: HardhatEthersSigner | ethers.Wallet;
  approver: HardhatEthersSigner | ethers.Wallet;
  borrower1: HardhatEthersSigner | ethers.Wallet;
  borrower2: HardhatEthersSigner | ethers.Wallet;
  multisigOwner2: HardhatEthersSigner | ethers.Wallet;
  addresses: Array<{
    index: number;
    address: string;
    role: string;
    label: string;
  }>;
};

function walletFromMnemonic(mnemonic: string, index: number, provider: ethers.Provider) {
  const hd = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, `m/44'/60'/0'/0/${index}`);
  return new ethers.Wallet(hd.privateKey, provider);
}

function walletFromKey(key: string, provider: ethers.Provider) {
  const k = key.startsWith("0x") ? key : `0x${key}`;
  return new ethers.Wallet(k, provider);
}

export async function getDeploymentPersonas(): Promise<DeploymentPersonas> {
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const isLocal = chainId === 31337;

  if (isLocal) {
    const signers = await ethers.getSigners();
    return {
      worldGov: signers[0],
      nationalGov: signers[1],
      localGov: signers[2],
      approver: signers[3],
      borrower1: signers[4],
      borrower2: signers[5],
      multisigOwner2: signers[4],
      addresses: HARDHAT_ACCOUNTS.map((a) => ({
        index: a.index,
        address: a.address,
        role: a.role,
        label: a.label,
      })),
    };
  }

  const provider = ethers.provider;
  const mnemonic = process.env.SEPOLIA_MNEMONIC ?? process.env.DEPLOY_MNEMONIC;

  if (mnemonic) {
    const wallets = [0, 1, 2, 3, 4, 5].map((i) => walletFromMnemonic(mnemonic, i, provider));
    return {
      worldGov: wallets[0],
      nationalGov: wallets[1],
      localGov: wallets[2],
      approver: wallets[3],
      borrower1: wallets[4],
      borrower2: wallets[5],
      multisigOwner2: wallets[4],
      addresses: HARDHAT_ACCOUNTS.map((a, i) => ({
        index: a.index,
        address: wallets[i].address as `0x${string}`,
        role: a.role,
        label: a.label,
      })),
    };
  }

  const pk0 = process.env.PRIVATE_KEY;
  if (!pk0) {
    throw new Error(
      "Sepolia deploy requires SEPOLIA_MNEMONIC (recommended) or PRIVATE_KEY + SEPOLIA_ACCOUNT_1_PRIVATE_KEY … _5.\n" +
        "See Documentation/SEPOLIA.md",
    );
  }

  const keys = [
    pk0,
    process.env.SEPOLIA_ACCOUNT_1_PRIVATE_KEY ?? pk0,
    process.env.SEPOLIA_ACCOUNT_2_PRIVATE_KEY ?? pk0,
    process.env.SEPOLIA_ACCOUNT_3_PRIVATE_KEY ?? pk0,
    process.env.SEPOLIA_ACCOUNT_4_PRIVATE_KEY ?? pk0,
    process.env.SEPOLIA_ACCOUNT_5_PRIVATE_KEY ?? pk0,
  ];

  const wallets = keys.map((k) => walletFromKey(k, provider));
  const sameWallet = keys.every((k) => k === pk0);

  if (sameWallet) {
    console.warn(
      "  ⚠ Using a single PRIVATE_KEY for all personas — fine for deploy smoke test, not for multi-wallet UI demo.",
    );
  }

  return {
    worldGov: wallets[0],
    nationalGov: wallets[1],
    localGov: wallets[2],
    approver: wallets[3],
    borrower1: wallets[4],
    borrower2: wallets[5],
    multisigOwner2: wallets[4],
    addresses: HARDHAT_ACCOUNTS.map((a, i) => ({
      index: a.index,
      address: wallets[i].address,
      role: a.role,
      label: a.label,
    })),
  };
}

export function manifestPathForNetwork(net = network.name): string {
  const path = require("path") as typeof import("path");
  return path.join(__dirname, "..", "deployments", "testnet", `${net}.json`);
}
