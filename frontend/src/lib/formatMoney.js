/** Display helpers for testing-phase capital (USDC units; legacy *Eth field names). */

export function formatUsdc(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B USDC`;
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M USDC`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1)}K USDC`;
  if (abs >= 1) return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`;
  if (abs === 0) return "0 USDC";
  return `${v.toFixed(4)} USDC`;
}

/** @deprecated Use formatUsdc — balances are USDC in the testing phase. */
export function formatEth(n) {
  return formatUsdc(n);
}
