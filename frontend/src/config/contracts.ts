/**
 * Contract configuration.
 * After deploying, run: npx hardhat run scripts/copy-abi.ts (or manually update)
 * and set CONTRACT_ADDRESS to your deployed contract address.
 */
export const CONTRACT_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as `0x${string}`);

/** UviCoin ERC-20 token - set VITE_UVICOIN_ADDRESS after deploying */
export const UVICOIN_ADDRESS =
  (import.meta.env.VITE_UVICOIN_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as `0x${string}`);

export const SUPPORTED_CHAIN_IDS = [80001, 11155111]; // Mumbai, Sepolia
