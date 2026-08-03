import { ethers } from "hardhat";

/** MockUSDC uses 6 decimals — use this instead of parseEther in lending tests. */
export function usdc(amount: string | number): bigint {
  return ethers.parseUnits(String(amount), 6);
}

/** Mint MockUSDC to `to` and approve `spender` (defaults to same address). */
export async function fundUsdc(
  mockUsdc: { mint: (to: string, amount: bigint) => Promise<unknown>; approve: (spender: string, amount: bigint) => Promise<unknown> },
  minter: { getAddress: () => Promise<string> },
  to: { getAddress: () => Promise<string> },
  amount: bigint,
  spender?: string,
) {
  const toAddr = await to.getAddress();
  await mockUsdc.mint(toAddr, amount);
  const spenderAddr = spender ?? toAddr;
  await mockUsdc.approve(spenderAddr, amount);
}
