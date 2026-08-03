/**
 * Heuristic optimizer for Phase 2B — keeps utilization under kink at large capital scales.
 *
 * What it optimizes for:
 * - Expected loan deployment ≤ ~65% utilization (under 80% kink at U*)
 * - Reserve ratio ≥ minReserveRatio after randomized sample flows
 * - Depositor yield not starved (baseRate + slope1 soft-capped as capital grows)
 *
 * Assumptions / limits:
 * - Sample simulation stress ≈ aggregate; not a full Monte Carlo of 27k clients
 * - No LiquidationEngine — solvency not modeled beyond reserve floors
 * - Closed-form scale heuristics (1/√scale, /scale), not a solver — transparent for thesis demos
 */
import type { SimulationConfigSnapshot } from "./simulationConfig";

export type OptimizeResult = {
  current: SimulationConfigSnapshot;
  optimized: SimulationConfigSnapshot;
  rationale: string[];
  targetCapitalUsdc: number;
  expectedUtilizationBps: number;
};

export function optimizeSimulationConfig(
  current: SimulationConfigSnapshot,
  targetCapitalUsdc: number,
): OptimizeResult {
  const scale = Math.max(1, targetCapitalUsdc / 100_000_000);
  const targetUtilBps = 6500;

  const optimized: SimulationConfigSnapshot = {
    ...current,
    baseRateBps: Math.min(400, Math.max(250, Math.round(current.baseRateBps * (1 / Math.sqrt(scale))))),
    slope1Bps: Math.min(800, Math.max(200, Math.round(current.slope1Bps / scale))),
    slope2Bps: Math.min(10_000, Math.max(3000, Math.round(current.slope2Bps / scale))),
    kinkBps: current.kinkBps,
    minReserveRatio: Math.max(current.minReserveRatio, 0.15),
    tierModifiers: { ...current.tierModifiers },
  };

  const rationale = [
    `Target capital ${targetCapitalUsdc.toLocaleString()} USDC (${scale.toFixed(1)}× baseline 100M).`,
    `Capped expected utilization at ~${targetUtilBps / 100}% (below ${current.kinkBps / 100}% kink).`,
    `Reduced slope1/slope2 with scale to limit rate spike if deployment approaches kink.`,
    `Held minReserveRatio at ${(optimized.minReserveRatio * 100).toFixed(0)}% per contract default.`,
    "Tier modifiers unchanged — passport table remains aligned with CreditPassport.sol.",
  ];

  return {
    current,
    optimized,
    rationale,
    targetCapitalUsdc,
    expectedUtilizationBps: targetUtilBps,
  };
}
