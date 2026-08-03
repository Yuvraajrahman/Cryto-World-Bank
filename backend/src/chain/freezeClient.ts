import { ethers } from "ethers";
import { config } from "../config";
import { db, findUserById } from "../store/db";
import { getChainProvider } from "./provider";

const FREEZE_ABI = ["function freezeAccount(address client) external"];

/** Freeze a client wallet on LocalBank when CHAIN_OPERATOR_PRIVATE_KEY is configured. */
export async function freezeClientOnChain(wallet: string): Promise<string | null> {
  const pk = process.env.CHAIN_OPERATOR_PRIVATE_KEY;
  const localBank = config.contracts.localBank;
  const provider = getChainProvider();
  if (!pk || !localBank || !provider) return null;

  try {
    const signer = new ethers.Wallet(pk, provider);
    const lb = new ethers.Contract(localBank, FREEZE_ABI, signer);
    const tx = await lb.freezeAccount(wallet);
    const receipt = await tx.wait();
    return receipt?.hash ?? tx.hash;
  } catch {
    return null;
  }
}

export function freezeUserOffChain(userId: string): boolean {
  const user = findUserById(userId);
  if (!user) return false;
  user.frozen = true;
  db.save();
  return true;
}

async function applyAccountFreeze(userId: string, wallet: string) {
  freezeUserOffChain(userId);
  const txHash = await freezeClientOnChain(wallet);
  return { frozen: true, chainTxHash: txHash };
}

export { applyAccountFreeze };
