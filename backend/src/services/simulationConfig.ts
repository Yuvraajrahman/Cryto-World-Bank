/**
 * Runtime simulation config — single source for Phase 2 runs and Phase 2B admin panel.
 * Persisted in Postgres (SimulationConfig table; Docker local or Neon).
 */
import crypto from "node:crypto";
import { requirePrisma } from "../db/prisma";
import {
  KINK_BPS,
  PASSPORT_TIERS,
  type KinkedRateParams,
} from "../lib/rates";

export type TierModifiers = Record<string, number>;

export type SimulationConfigSnapshot = {
  baseRateBps: number;
  slope1Bps: number;
  slope2Bps: number;
  kinkBps: number;
  minReserveRatio: number;
  tierModifiers: TierModifiers;
};

const DEFAULT_TIER_MODIFIERS: TierModifiers = Object.fromEntries(
  PASSPORT_TIERS.map((t) => [t.name.toUpperCase(), t.rateModifierBps]),
);

export const DEFAULT_SIMULATION_CONFIG: SimulationConfigSnapshot = {
  baseRateBps: 300,
  slope1Bps: 500,
  slope2Bps: 7500,
  kinkBps: KINK_BPS,
  minReserveRatio: 0.15,
  tierModifiers: DEFAULT_TIER_MODIFIERS,
};

function rowToSnapshot(row: {
  baseRateBps: number;
  slope1Bps: number;
  slope2Bps: number;
  kinkBps: number;
  minReserveRatio: number;
  tierModifiersJson: unknown;
}): SimulationConfigSnapshot {
  const mods =
    row.tierModifiersJson && typeof row.tierModifiersJson === "object"
      ? (row.tierModifiersJson as TierModifiers)
      : DEFAULT_TIER_MODIFIERS;
  return {
    baseRateBps: row.baseRateBps,
    slope1Bps: row.slope1Bps,
    slope2Bps: row.slope2Bps,
    kinkBps: row.kinkBps,
    minReserveRatio: row.minReserveRatio,
    tierModifiers: mods,
  };
}

export function configToRateParams(c: SimulationConfigSnapshot): KinkedRateParams {
  return {
    baseRateBps: c.baseRateBps,
    slope1Bps: c.slope1Bps,
    slope2Bps: c.slope2Bps,
    kinkBps: c.kinkBps,
  };
}

/** Ensure default row exists (safe on bootstrap / first API call). */
export async function ensureSimulationConfig(): Promise<void> {
  const prisma = requirePrisma();
  await prisma.simulationConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      baseRateBps: DEFAULT_SIMULATION_CONFIG.baseRateBps,
      slope1Bps: DEFAULT_SIMULATION_CONFIG.slope1Bps,
      slope2Bps: DEFAULT_SIMULATION_CONFIG.slope2Bps,
      kinkBps: DEFAULT_SIMULATION_CONFIG.kinkBps,
      minReserveRatio: DEFAULT_SIMULATION_CONFIG.minReserveRatio,
      tierModifiersJson: DEFAULT_TIER_MODIFIERS,
    },
    update: {},
  });
}

export async function getSimulationConfig(): Promise<SimulationConfigSnapshot> {
  const prisma = requirePrisma();
  await ensureSimulationConfig();
  const row = await prisma.simulationConfig.findUniqueOrThrow({ where: { id: "default" } });
  return rowToSnapshot(row);
}

export async function updateSimulationConfig(
  patch: Partial<SimulationConfigSnapshot>,
  opts: { changedBy?: string; note?: string } = {},
): Promise<{ config: SimulationConfigSnapshot; changes: Array<{ field: string; from: unknown; to: unknown }> }> {
  const prisma = requirePrisma();
  await ensureSimulationConfig();
  const prev = await prisma.simulationConfig.findUniqueOrThrow({ where: { id: "default" } });
  const prevSnap = rowToSnapshot(prev);

  const next: SimulationConfigSnapshot = {
    ...prevSnap,
    ...patch,
    tierModifiers: patch.tierModifiers ?? prevSnap.tierModifiers,
  };

  const changes: Array<{ field: string; from: unknown; to: unknown }> = [];
  const scalarFields = [
    "baseRateBps",
    "slope1Bps",
    "slope2Bps",
    "kinkBps",
    "minReserveRatio",
  ] as const;

  for (const f of scalarFields) {
    if (patch[f] != null && patch[f] !== prevSnap[f]) {
      changes.push({ field: f, from: prevSnap[f], to: patch[f] });
    }
  }
  if (patch.tierModifiers) {
    changes.push({
      field: "tierModifiers",
      from: prevSnap.tierModifiers,
      to: patch.tierModifiers,
    });
  }

  await prisma.simulationConfig.update({
    where: { id: "default" },
    data: {
      baseRateBps: next.baseRateBps,
      slope1Bps: next.slope1Bps,
      slope2Bps: next.slope2Bps,
      kinkBps: next.kinkBps,
      minReserveRatio: next.minReserveRatio,
      tierModifiersJson: next.tierModifiers,
      updatedBy: opts.changedBy,
    },
  });

  for (const c of changes) {
    await prisma.simulationConfigHistory.create({
      data: {
        id: `scfg_${crypto.randomBytes(6).toString("hex")}`,
        configId: "default",
        field: c.field,
        fromValue: c.from as object,
        toValue: c.to as object,
        changedBy: opts.changedBy,
        note: opts.note,
      },
    });
  }

  return { config: next, changes };
}

export async function getSimulationConfigHistory(limit = 20) {
  const prisma = requirePrisma();
  return prisma.simulationConfigHistory.findMany({
    where: { configId: "default" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function revertSimulationConfigField(
  historyId: string,
  changedBy?: string,
): Promise<SimulationConfigSnapshot | null> {
  const prisma = requirePrisma();
  const entry = await prisma.simulationConfigHistory.findUnique({ where: { id: historyId } });
  if (!entry) return null;

  const patch: Partial<SimulationConfigSnapshot> = {};
  if (entry.field === "tierModifiers") {
    patch.tierModifiers = entry.fromValue as TierModifiers;
  } else if (
    entry.field === "baseRateBps" ||
    entry.field === "slope1Bps" ||
    entry.field === "slope2Bps" ||
    entry.field === "kinkBps" ||
    entry.field === "minReserveRatio"
  ) {
    patch[entry.field] = entry.fromValue as number;
  } else {
    return null;
  }

  const { config } = await updateSimulationConfig(patch, {
    changedBy,
    note: `Revert ${entry.field} from history ${historyId}`,
  });
  return config;
}
