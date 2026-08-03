/**
 * Shared off-chain rate/tier math — mirrors on-chain CreditPassport + kinked LoanController.
 * Single source for API previews and national ops (Phase 1 #23 / shared-rate-source).
 */

/** Credit tiers aligned with contracts/CreditPassport.sol (score bands + USDC limits). */
export const PASSPORT_TIERS = [
  { tier: 0, name: "Bronze", minScore: 0, maxScore: 299, maxLoanUsdc: 50_000, maxTermMonths: 6, rateModifierBps: 0 },
  { tier: 1, name: "Silver", minScore: 300, maxScore: 549, maxLoanUsdc: 250_000, maxTermMonths: 12, rateModifierBps: -25 },
  { tier: 2, name: "Gold", minScore: 550, maxScore: 749, maxLoanUsdc: 1_000_000, maxTermMonths: 24, rateModifierBps: -50 },
  { tier: 3, name: "Platinum", minScore: 750, maxScore: 899, maxLoanUsdc: 5_000_000, maxTermMonths: 36, rateModifierBps: -100 },
  { tier: 4, name: "Diamond", minScore: 900, maxScore: 1000, maxLoanUsdc: 25_000_000, maxTermMonths: 36, rateModifierBps: -200 },
] as const;

export const DEFAULT_MAX_LTV_BPS = 5000;

export const KINK_BPS = 8000;

export interface KinkedRateParams {
  baseRateBps: number;
  slope1Bps: number;
  slope2Bps: number;
  kinkBps?: number;
}

/** Borrow APR (bps) from utilization — matches LoanController.borrowAprBps(). */
export function borrowAprFromUtilization(
  utilizationBps: number,
  params: KinkedRateParams
): number {
  const kink = params.kinkBps ?? KINK_BPS;
  const u = Math.min(Math.max(utilizationBps, 0), 10000);
  if (u <= kink) {
    return params.baseRateBps + Math.floor((params.slope1Bps * u) / kink);
  }
  const excess = u - kink;
  const span = 10000 - kink;
  return (
    params.baseRateBps +
    params.slope1Bps +
    Math.floor((params.slope2Bps * excess) / span)
  );
}

export function tierForScore(score: number): (typeof PASSPORT_TIERS)[number] {
  const s = Math.min(Math.max(Math.floor(score), 0), 1000);
  for (let i = PASSPORT_TIERS.length - 1; i >= 0; i--) {
    if (s >= PASSPORT_TIERS[i].minScore) return PASSPORT_TIERS[i];
  }
  return PASSPORT_TIERS[0];
}

/** Max collateral-backed principal at LTV (matches LoanController maxLtvBps default 5000). */
export function maxPrincipalAtLtv(collateralUsdc: number, maxLtvBps = DEFAULT_MAX_LTV_BPS): number {
  return Math.floor((collateralUsdc * maxLtvBps) / 10000);
}
