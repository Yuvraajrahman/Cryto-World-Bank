/**
 * Live 4-tier capital / loan / risk model for the visual stress lab.
 * Mirrors off-chain sim rules (reserve floors + kinked APR) for instant slider feedback.
 */

export function borrowAprFromUtilization(utilizationBps, params) {
  const kink = params.kinkBps ?? 8000;
  const u = Math.min(Math.max(utilizationBps, 0), 10000);
  if (u <= kink) {
    return params.baseRateBps + Math.floor((params.slope1Bps * u) / kink);
  }
  const excess = u - kink;
  const span = Math.max(1, 10000 - kink);
  return params.baseRateBps + params.slope1Bps + Math.floor((params.slope2Bps * excess) / span);
}

/**
 * @param {object} sliders
 * @param {number} sliders.totalCapitalUsdc
 * @param {number} sliders.worldDeployPct 0–100  fraction of world not held as reserve (capped by 1-minReserve)
 * @param {number} sliders.nationalReservePct 0–100
 * @param {number} sliders.localReservePct 0–100
 * @param {number} sliders.loanDemandPct 0–100  share of local lending pool that is lent
 * @param {number} sliders.upwardSurplusPct 0–100  idle local surplus parked upward (reduces lendable)
 * @param {object} rateConfig simulation config rates
 */
export function computeVisualEconomy(sliders, rateConfig) {
  const total = Math.max(0, Number(sliders.totalCapitalUsdc) || 0);
  const minR = Math.max(0.05, Math.min(0.5, Number(rateConfig?.minReserveRatio) ?? 0.15));
  const kinkBps = Number(rateConfig?.kinkBps) || 8000;

  const maxDeploy = 1 - minR;
  const worldDeploy = Math.min(maxDeploy, Math.max(0, (sliders.worldDeployPct ?? 85) / 100));
  const nbReserve = Math.max(minR, Math.min(0.6, (sliders.nationalReservePct ?? 15) / 100));
  const lbReserve = Math.max(minR, Math.min(0.6, (sliders.localReservePct ?? 15) / 100));
  const demand = Math.max(0, Math.min(1.2, (sliders.loanDemandPct ?? 70) / 100));
  const upward = Math.max(0, Math.min(0.5, (sliders.upwardSurplusPct ?? 5) / 100));

  const worldReserve = total * (1 - worldDeploy);
  const toNationals = total * worldDeploy;

  const nationalReserve = toNationals * nbReserve;
  const toLocals = toNationals * (1 - nbReserve);

  const localReserve = toLocals * lbReserve;
  const localPoolGross = toLocals * (1 - lbReserve);
  const upwardParked = localPoolGross * upward;
  const localPool = Math.max(0, localPoolGross - upwardParked);

  const loanDemand = localPool * demand;
  const loansOutstanding = Math.min(loanDemand, localPool);
  const fundingGap = Math.max(0, loanDemand - localPool);
  const idleSurplus = Math.max(0, localPool - loansOutstanding);

  const utilBps =
    localPool > 0 ? Math.min(10000, Math.floor((loansOutstanding / localPool) * 10000)) : 0;
  const aprBps = borrowAprFromUtilization(utilBps, {
    baseRateBps: Number(rateConfig?.baseRateBps) || 300,
    slope1Bps: Number(rateConfig?.slope1Bps) || 500,
    slope2Bps: Number(rateConfig?.slope2Bps) || 7500,
    kinkBps,
  });
  const kinkTriggered = utilBps > kinkBps;

  const worldReserveRatio = total > 0 ? worldReserve / total : 1;
  const nbReserveRatio = toNationals > 0 ? nationalReserve / toNationals : 1;
  const lbReserveRatio = toLocals > 0 ? localReserve / toLocals : 1;

  function riskFor({ reserveRatio, util = 0, gap = 0, kink = false, thinSurplus = false }) {
    if (gap > 0 || reserveRatio + 1e-9 < minR || kink) return "stress";
    if (util > kinkBps * 0.85 || thinSurplus || reserveRatio < minR + 0.03) return "watch";
    return "stable";
  }

  const thinSurplus = localPool > 0 && idleSurplus / localPool < 0.08 && demand > 0.75;

  const tiers = [
    {
      id: "world",
      label: "World Bank",
      subtitle: "Reserve & downward allocation",
      reserve: worldReserve,
      allocated: toNationals,
      lent: 0,
      capacity: toNationals,
      utilBps: 0,
      reserveRatio: worldReserveRatio,
      risk: riskFor({ reserveRatio: worldReserveRatio, gap: fundingGap > 0 && worldDeploy >= maxDeploy ? fundingGap : 0 }),
      notes: [
        `Holds ${(worldReserveRatio * 100).toFixed(1)}% reserve`,
        `Can send ${fmt(toNationals)} to nationals`,
      ],
    },
    {
      id: "national",
      label: "National banks",
      subtitle: "Aggregate sample",
      reserve: nationalReserve,
      allocated: toLocals,
      lent: 0,
      capacity: toLocals,
      utilBps: 0,
      reserveRatio: nbReserveRatio,
      risk: riskFor({ reserveRatio: nbReserveRatio }),
      notes: [
        `Reserve floor ${(nbReserve * 100).toFixed(0)}%`,
        `Pass-through ${fmt(toLocals)} to locals`,
      ],
    },
    {
      id: "local",
      label: "Local banks",
      subtitle: "Lending pool",
      reserve: localReserve,
      allocated: idleSurplus,
      lent: loansOutstanding,
      capacity: localPool,
      utilBps,
      reserveRatio: lbReserveRatio,
      risk: riskFor({
        reserveRatio: lbReserveRatio,
        util: utilBps,
        gap: fundingGap,
        kink: kinkTriggered,
        thinSurplus,
      }),
      notes: [
        `Utilization ${(utilBps / 100).toFixed(1)}% (kink ${(kinkBps / 100).toFixed(0)}%)`,
        kinkTriggered ? "Kinked rate zone active" : `Borrow APR ~${(aprBps / 100).toFixed(2)}%`,
        upwardParked > 0 ? `Upward surplus parked ${fmt(upwardParked)}` : "Upward park low",
      ],
    },
    {
      id: "clients",
      label: "Clients",
      subtitle: "Loan book",
      reserve: 0,
      allocated: 0,
      lent: loansOutstanding,
      capacity: localPool,
      utilBps,
      reserveRatio: 1,
      risk: riskFor({
        reserveRatio: 1,
        util: utilBps,
        gap: fundingGap,
        kink: kinkTriggered,
      }),
      notes: [
        `Loans ${fmt(loansOutstanding)}`,
        fundingGap > 0 ? `Funding gap ${fmt(fundingGap)} — need more capital` : "Demand covered by pool",
      ],
    },
  ];

  const alerts = [];
  if (kinkTriggered) {
    alerts.push({
      level: "stress",
      text: `Local utilization ${(utilBps / 100).toFixed(1)}% exceeds kink ${(kinkBps / 100).toFixed(0)}% — slope2 rates apply.`,
    });
  }
  if (fundingGap > 0) {
    alerts.push({
      level: "stress",
      text: `Loan demand exceeds pool by ${fmt(fundingGap)} — raise World deploy or cut demand.`,
    });
  }
  if (worldReserveRatio + 1e-9 < minR) {
    alerts.push({ level: "stress", text: "World reserve below minimum ratio." });
  }
  if (thinSurplus) {
    alerts.push({
      level: "watch",
      text: "Local idle surplus is thin — little buffer if demand spikes.",
    });
  }
  if (upward > 0.2 && demand > 0.8) {
    alerts.push({
      level: "watch",
      text: "High upward parking while demand is high — surplus not available for loans.",
    });
  }
  if (alerts.length === 0) {
    alerts.push({ level: "stable", text: "System looks stable under this slider configuration." });
  }

  return {
    total,
    minR,
    kinkBps,
    aprBps,
    utilBps,
    kinkTriggered,
    fundingGap,
    idleSurplus,
    upwardParked,
    loansOutstanding,
    localPool,
    tiers,
    alerts,
    systemRisk: tiers.some((t) => t.risk === "stress")
      ? "stress"
      : tiers.some((t) => t.risk === "watch")
        ? "watch"
        : "stable",
  };
}

function fmt(n) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

export { fmt as formatCompactUsdc };
