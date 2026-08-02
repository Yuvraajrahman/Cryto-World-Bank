/** Block explorer URLs for retail tx/address links (demo-friendly). */

const EXPLORERS = {
  1: "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io",
  80002: "https://amoy.polygonscan.com",
  31337: null, // Hardhat — no public explorer
};

export function explorerBase(chainId) {
  if (chainId == null) return EXPLORERS[11155111];
  return EXPLORERS[Number(chainId)] ?? EXPLORERS[11155111];
}

export function explorerTxUrl(chainId, hash) {
  if (!hash || typeof hash !== "string") return null;
  const base = explorerBase(chainId);
  if (!base) return null;
  const h = hash.startsWith("0x") ? hash : `0x${hash}`;
  return `${base}/tx/${h}`;
}

export function explorerAddressUrl(chainId, address) {
  if (!address || typeof address !== "string") return null;
  const base = explorerBase(chainId);
  if (!base) return null;
  return `${base}/address/${address}`;
}

export function networkLabel(chainId) {
  const id = Number(chainId);
  if (id === 1) return "Ethereum";
  if (id === 11155111) return "Sepolia";
  if (id === 80002) return "Polygon Amoy";
  if (id === 31337) return "Hardhat";
  return chainId != null ? `Chain ${chainId}` : "Unknown";
}

/** Preferred retail chains for wrong-network warnings. */
export const PREFERRED_CHAIN_IDS = [11155111, 31337, 80002];

export function isPreferredChain(chainId) {
  return PREFERRED_CHAIN_IDS.includes(Number(chainId));
}
