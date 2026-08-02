/**
 * Installment schedule preview (matches backend buildInstallmentSchedule interest model used in RequestLoan).
 */

export function previewSchedule({
  principal,
  termMonths,
  aprBps,
}) {
  const apr = (aprBps ?? 800) / 10_000;
  const interest = (principal * apr * termMonths) / 12;
  const total = principal + interest;
  const monthly = termMonths > 0 ? total / termMonths : 0;
  const rows = Array.from({ length: termMonths }, (_, i) => {
    const due = new Date();
    due.setMonth(due.getMonth() + i + 1);
    return {
      index: i + 1,
      amount: Number(monthly.toFixed(6)),
      dueDate: due.toISOString(),
    };
  });
  return { interest, total, monthly, rows };
}

export function maxBorrowFromLtv(collateralEth, ltvBps = 5000) {
  return (Number(collateralEth) || 0) * ((ltvBps || 5000) / 10_000);
}

/** Illustrative pool utilization for kinked-rate display (80% kink). */
export function illustrativeUtilization(lent, reserve) {
  const denom = (lent || 0) + (reserve || 0);
  if (denom <= 0) return 0.42;
  return Math.min(0.95, Math.max(0.05, lent / denom));
}

export function rateAtUtilization(util, baseAprBps = 800) {
  const kink = 0.8;
  if (util <= kink) {
    return Math.round(baseAprBps * (0.85 + util * 0.2));
  }
  const over = (util - kink) / (1 - kink);
  return Math.round(baseAprBps * (1.05 + over * 0.8));
}

export const TIER_CAPS_USD = {
  BRONZE: 50,
  SILVER: 500,
  GOLD: 2500,
  PLATINUM: 10000,
  DIAMOND: 25000,
};

export const TIER_APR_DISCOUNT_BPS = {
  BRONZE: 0,
  SILVER: 25,
  GOLD: 50,
  PLATINUM: 100,
  DIAMOND: 200,
};

export function formatEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  if (v >= 100) return `${v.toFixed(1)} ETH`;
  if (v >= 1) return `${v.toFixed(3)} ETH`;
  return `${v.toFixed(4)} ETH`;
}

export function loanLifecycleLabel(status) {
  switch (status) {
    case "PENDING":
      return "Under review";
    case "APPROVED":
      return "Approved";
    case "ACTIVE":
      return "Active / disbursed";
    case "REPAID":
      return "Completed";
    case "REJECTED":
      return "Rejected";
    case "DEFAULTED":
      return "Defaulted";
    default:
      return status || "—";
  }
}

export const LIFECYCLE_STEPS = [
  "PENDING",
  "APPROVED",
  "ACTIVE",
  "REPAID",
];
