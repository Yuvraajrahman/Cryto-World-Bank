/**
 * Phase 2 economy simulator — callable service (CLI + Dev Admin API).
 * Off-chain Postgres simulation with contract-rule parity (reserve ratio, kinked rates, tier limits).
 * Does not call Hardhat allocateCapital for every bank — durable writes go to Docker Postgres / Neon.
 */
import crypto from "node:crypto";
import type { RiskTier } from "@prisma/client";
import { requirePrisma } from "../db/prisma";
import { syncBanksFromPrisma, persistBankCapital } from "../db/banksSync";
import { upsertInstitutionCapital, adjustInstitutionCapital } from "./institutionCapital";
import {
  applyTierModifier,
  borrowAprFromUtilization,
  PASSPORT_TIERS,
  splitNetInterest,
  tierForScore,
} from "../lib/rates";
import {
  configToRateParams,
  getSimulationConfig,
} from "./simulationConfig";
import { verifySimulationRun, type SimulationVerification } from "./verifySimulation";

const WORLD_ID_FALLBACK = "bank_world";

async function resolveWorldInstitutionId(prisma: ReturnType<typeof requirePrisma>): Promise<string> {
  const byId = await prisma.institution.findUnique({ where: { id: WORLD_ID_FALLBACK } });
  if (byId) return byId.id;
  const world = await prisma.institution.findFirst({
    where: { institutionType: "WORLD" },
    orderBy: { createdAt: "asc" },
  });
  if (!world) {
    throw new Error("No WORLD institution in Postgres — run npm run db:seed:testing first.");
  }
  return world.id;
}

export type SimulateEconomyParams = {
  totalCapitalUsdc?: number;
  seed?: number;
  clientMultiplier?: number;
  simulatedDays?: number;
  sampleNationals?: number;
  sampleLocalsPerNational?: number;
  clientsPerLocal?: number;
  /** Delete prior sim-tagged loans / interbank / upward rows before writing. */
  resetSample?: boolean;
  /** If set, reuse this SimulationRun id (already RUNNING). */
  runId?: string;
  triggeredBy?: string;
};

export type TierSnapshot = {
  institutionId: string;
  name: string;
  tier: string;
  reserveUsdc: number;
  allocatedUsdc: number;
  lentUsdc: number;
  repaidUsdc: number;
  reserveRatio: number;
  utilizationBps: number;
};

export type SimulationRunSummary = {
  runId: string;
  seed: number;
  totalCapitalUsdc: number;
  loansCreated: number;
  installmentsPaid: number;
  installmentsLate: number;
  interbankLoans: number;
  upwardDeposits: number;
  netInterestUsdc: number;
  interestToDepositors: number;
  interestToInsurance: number;
  interestToProtocol: number;
  totalRepaidUsdc: number;
  aggregateBalancesUsdc: number;
  maxUtilizationBps: number;
  configKinkBps: number;
  tierSnapshots: TierSnapshot[];
  sampleInstitutionIds: string[];
  mode: "postgres_offchain";
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function usdcWei(amount: number): string {
  return Math.round(amount * 1_000_000).toString();
}

function maxLoanUsdcForTier(tier: RiskTier, score: number): number {
  const name = tier.charAt(0) + tier.slice(1).toLowerCase();
  const row = PASSPORT_TIERS.find((t) => t.name === name) ?? tierForScore(score);
  // PASSPORT_TIERS.maxLoanUsdc is already whole USDC (e.g. 50_000), not micro-units
  return row.maxLoanUsdc;
}

function tierModifierBps(
  tier: RiskTier,
  score: number,
  configMods: Record<string, number>,
): number {
  const name = (tier.charAt(0) + tier.slice(1).toLowerCase()) as string;
  const key = name.toUpperCase();
  if (configMods[key] != null) return configMods[key]!;
  return (PASSPORT_TIERS.find((t) => t.name === name) ?? tierForScore(score)).rateModifierBps;
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Remove prior simulator-tagged rows so re-runs stay idempotent. */
async function resetSimTaggedData(prisma: ReturnType<typeof requirePrisma>): Promise<void> {
  const simRequests = await prisma.loanRequest.findMany({
    where: { docHash: { startsWith: "sim_" } },
    select: { id: true },
  });
  const requestIds = simRequests.map((r) => r.id);
  if (requestIds.length > 0) {
    const loans = await prisma.loan.findMany({
      where: { requestId: { in: requestIds } },
      select: { id: true },
    });
    const loanIds = loans.map((l) => l.id);
    if (loanIds.length > 0) {
      await prisma.installment.deleteMany({ where: { loanId: { in: loanIds } } });
      await prisma.loan.deleteMany({ where: { id: { in: loanIds } } });
    }
    await prisma.loanRequest.deleteMany({ where: { id: { in: requestIds } } });
  }
  await prisma.upwardDepositRecord.deleteMany({
    where: { onChainTxHash: { startsWith: "sim_upward_" } },
  });
  // Interbank rows from sim have no tag — leave historical; new sample still creates a few
}

export async function simulateEconomy(
  params: SimulateEconomyParams = {},
): Promise<{ summary: SimulationRunSummary; verification: SimulationVerification }> {
  const prisma = requirePrisma();
  const config = await getSimulationConfig();
  const rateParams = configToRateParams(config);

  const totalCapitalUsdc = params.totalCapitalUsdc ?? 100_000_000;
  const seed = params.seed ?? 42;
  const clientMultiplier = Math.min(2, Math.max(0.1, params.clientMultiplier ?? 1));
  const simulatedDays = params.simulatedDays ?? 365;
  // Raised defaults for local demo (still capped for ~60s Mac runs)
  const sampleNationals = Math.min(15, Math.max(1, params.sampleNationals ?? 8));
  const sampleLocalsPerNational = Math.min(10, Math.max(1, params.sampleLocalsPerNational ?? 4));
  const clientsPerLocal = Math.min(
    12,
    Math.max(1, Math.round((params.clientsPerLocal ?? 6) * clientMultiplier)),
  );
  const resetSample = params.resetSample !== false;

  const rand = mulberry32(seed);
  const runId = params.runId ?? `sim_${crypto.randomBytes(6).toString("hex")}`;
  const startedAt = new Date();

  if (!params.runId) {
    await prisma.simulationRun.create({
      data: {
        id: runId,
        seed,
        totalCapitalUsdc,
        clientMultiplier,
        simulatedDays,
        sampleNationals,
        sampleLocalsPerNational,
        clientsPerLocal,
        status: "RUNNING",
        configSnapshotJson: config as object,
        triggeredBy: params.triggeredBy,
        startedAt,
      },
    });
  } else {
    await prisma.simulationRun.update({
      where: { id: runId },
      data: {
        status: "RUNNING",
        seed,
        totalCapitalUsdc,
        clientMultiplier,
        simulatedDays,
        sampleNationals,
        sampleLocalsPerNational,
        clientsPerLocal,
        configSnapshotJson: config as object,
        triggeredBy: params.triggeredBy,
        startedAt,
      },
    });
  }

  try {
    if (resetSample) {
      await resetSimTaggedData(prisma);
    }

    const worldId = await resolveWorldInstitutionId(prisma);
    const nationals = await prisma.institution.findMany({
      where: { institutionType: "NATIONAL", id: { not: worldId } },
      include: { capital: true, nationalBank: true },
      take: 250,
    });
    const sampledNationals = shuffle(nationals, rand).slice(0, sampleNationals);

    const touchedIds = new Set<string>([worldId]);
    let loansCreated = 0;
    let installmentsPaid = 0;
    let installmentsLate = 0;
    let netInterestUsdc = 0;
    let totalRepaidUsdc = 0;
    let maxUtilizationBps = 0;

    await upsertInstitutionCapital(prisma, worldId, {
      reserveEth: totalCapitalUsdc,
      allocatedEth: 0,
      lentEth: 0,
      repaidEth: 0,
    });

    const deployableWorld = totalCapitalUsdc * (1 - config.minReserveRatio);
    const nationalWeights = sampledNationals.map(() => rand() + 0.1);
    const weightSum = nationalWeights.reduce((a, b) => a + b, 0);

    for (let i = 0; i < sampledNationals.length; i++) {
      const nb = sampledNationals[i]!;
      const nbShare = (deployableWorld * nationalWeights[i]!) / weightSum;
      touchedIds.add(nb.id);

      const nbReserve = nbShare * config.minReserveRatio;
      const nbDeployable = nbShare - nbReserve;

      await upsertInstitutionCapital(prisma, nb.id, {
        reserveEth: nbReserve,
        allocatedEth: nbDeployable,
        lentEth: 0,
        repaidEth: 0,
      });

      // Move capital down the hierarchy (do not keep it on the parent as allocated)
      await adjustInstitutionCapital(prisma, worldId, {
        reserveEth: -nbShare,
      });

      const locals = await prisma.institution.findMany({
        where: {
          institutionType: "LOCAL",
          localBank: { parentNationalBankId: nb.id },
        },
        include: { capital: true, localBank: true },
        take: 80,
      });
      const sampledLocals = shuffle(locals, rand).slice(0, sampleLocalsPerNational);

      const localWeights = sampledLocals.map(() => rand() + 0.1);
      const localSum = localWeights.reduce((a, b) => a + b, 0) || 1;

      for (let j = 0; j < sampledLocals.length; j++) {
        const lb = sampledLocals[j]!;
        const lbShare = (nbDeployable * localWeights[j]!) / localSum;
        touchedIds.add(lb.id);

        const lbReserve = lbShare * config.minReserveRatio;
        const lbPool = lbShare - lbReserve;

        await upsertInstitutionCapital(prisma, lb.id, {
          reserveEth: lbReserve,
          allocatedEth: lbPool,
          lentEth: 0,
          repaidEth: 0,
        });

        await adjustInstitutionCapital(prisma, nb.id, {
          allocatedEth: -lbShare,
        });

        const borrowers = await prisma.borrower.findMany({
          where: { registeredLocalBankId: lb.id },
          include: { creditPassport: true },
          take: 120,
        });
        const picked = shuffle(borrowers, rand).slice(0, clientsPerLocal);

        let lbLent = 0;
        let localPaidCount = 0;
        for (const borrower of picked) {
          if (lbLent >= lbPool * 0.85) break;

          const score = borrower.creditPassport?.creditScore ?? 320;
          const tier = borrower.creditPassport?.riskTier ?? "SILVER";
          const maxLoan = maxLoanUsdcForTier(tier, score);
          const principal = Math.min(maxLoan, lbPool * (0.05 + rand() * 0.15));
          if (principal < 0.01) continue;

          const termMonths = Math.min(24, 6 + Math.floor(rand() * 12));
          const utilBps = Math.min(
            9900,
            Math.floor(((lbLent + principal) / Math.max(lbPool, 1)) * 10_000),
          );
          const baseApr = borrowAprFromUtilization(utilBps, rateParams);
          const mod = tierModifierBps(tier, score, config.tierModifiers);
          const aprBps = applyTierModifier(baseApr, mod);

          const req = await prisma.loanRequest.create({
            data: {
              borrowerId: borrower.id,
              localBankId: lb.id,
              principalWei: usdcWei(principal),
              termMonths,
              purpose: `Simulated loan (seed ${seed})`,
              status: "DISBURSED",
              docHash: `sim_${runId}_${borrower.id}`,
            },
          });

          const loan = await prisma.loan.create({
            data: {
              requestId: req.id,
              borrowerId: borrower.id,
              localBankId: lb.id,
              principalWei: usdcWei(principal),
              aprBps,
              termMonths,
              status: "ACTIVE",
            },
          });

          const perInstallment = principal / termMonths;
          const installments = [];
          let paidThisLoan = 0;
          for (let k = 0; k < termMonths; k++) {
            const due = new Date();
            due.setDate(due.getDate() + (k + 1) * 30);
            const daysUntilDue = (k + 1) * 30;
            const payProb = daysUntilDue <= simulatedDays ? 0.35 + rand() * 0.45 : 0;
            const paid = rand() < payProb;
            if (paid) {
              installmentsPaid += 1;
              paidThisLoan += 1;
              totalRepaidUsdc += perInstallment;
            } else if (daysUntilDue <= simulatedDays) {
              installmentsLate += 1;
            }
            installments.push({
              loanId: loan.id,
              index: k + 1,
              amountWei: usdcWei(perInstallment),
              dueDate: due,
              paid,
              paidAt: paid ? due : null,
            });
          }
          await prisma.installment.createMany({ data: installments });

          const interest = (principal * aprBps * termMonths) / (10000 * 12);
          netInterestUsdc += interest * (paidThisLoan / Math.max(termMonths, 1));
          localPaidCount += paidThisLoan;

          lbLent += principal;
          loansCreated += 1;
        }
        void localPaidCount;

        const utilizationBps = Math.floor((lbLent / Math.max(lbPool, 1)) * 10_000);
        maxUtilizationBps = Math.max(maxUtilizationBps, utilizationBps);

        const lbRow = await prisma.institutionCapital.findFirst({ where: { institutionId: lb.id } });
        if (lbRow) {
          await prisma.institutionCapital.update({
            where: { id: lbRow.id },
            data: {
              lentEth: lbLent,
              allocatedEth: Math.max(0, lbPool - lbLent),
              activeLoanCount: picked.length,
              syncedAt: new Date(),
            },
          });
        }
      }
    }

    let interbankLoans = 0;
    if (sampledNationals.length >= 2) {
      const pairs = Math.min(3, sampledNationals.length - 1);
      for (let p = 0; p < pairs; p++) {
        const lender = sampledNationals[p]!;
        const borrowerNb = sampledNationals[p + 1]!;
        const amount = 50_000 + rand() * 200_000;
        await prisma.interbankLoanRecord.create({
          data: {
            lenderId: lender.id,
            borrowerId: borrowerNb.id,
            principalWei: usdcWei(amount),
            tenorDays: 7 + Math.floor(rand() * 30),
            status: rand() > 0.3 ? "REPAID" : "ACTIVE",
          },
        });
        interbankLoans += 1;
      }
    }

    let upwardDeposits = 0;
    const localSample = await prisma.institution.findMany({
      where: { institutionType: "LOCAL", id: { in: [...touchedIds] } },
      take: 5,
    });
    for (const lb of localSample) {
      const parent = await prisma.localBank.findUnique({ where: { institutionId: lb.id } });
      if (!parent) continue;
      const amount = 10_000 + rand() * 50_000;
      await prisma.upwardDepositRecord.create({
        data: {
          depositorId: lb.id,
          parentId: parent.parentNationalBankId,
          amountWei: usdcWei(amount),
          onChainTxHash: `sim_upward_${runId}_${lb.id}`,
        },
      });
      upwardDeposits += 1;
    }

    await syncBanksFromPrisma();
    for (const id of touchedIds) {
      await persistBankCapital(id);
    }

    const caps = await prisma.institutionCapital.findMany({
      where: { institutionId: { in: [...touchedIds] } },
      include: { institution: true },
    });

    const tierSnapshots: TierSnapshot[] = caps.map((c) => {
      const base = c.reserveEth + c.allocatedEth + c.lentEth;
      const reserveRatio = base > 0 ? c.reserveEth / base : 1;
      const utilizationBps = base > 0 ? Math.floor((c.lentEth / base) * 10_000) : 0;
      return {
        institutionId: c.institutionId,
        name: c.institution.name,
        tier: c.institution.institutionType,
        reserveUsdc: c.reserveEth,
        allocatedUsdc: c.allocatedEth,
        lentUsdc: c.lentEth,
        repaidUsdc: c.repaidEth,
        reserveRatio,
        utilizationBps,
      };
    });

    const aggregateBalancesUsdc = tierSnapshots.reduce(
      (s, t) => s + t.reserveUsdc + t.allocatedUsdc + t.lentUsdc,
      0,
    );

    const interestSplit = splitNetInterest(netInterestUsdc);

    const summary: SimulationRunSummary = {
      runId,
      seed,
      totalCapitalUsdc,
      loansCreated,
      installmentsPaid,
      installmentsLate,
      interbankLoans,
      upwardDeposits,
      netInterestUsdc,
      ...interestSplit,
      totalRepaidUsdc,
      aggregateBalancesUsdc,
      maxUtilizationBps,
      configKinkBps: config.kinkBps,
      tierSnapshots,
      sampleInstitutionIds: [...touchedIds],
      mode: "postgres_offchain",
    };

    const verification = verifySimulationRun(summary, config.minReserveRatio);

    await prisma.simulationRun.update({
      where: { id: runId },
      data: {
        status: "COMPLETED",
        summaryJson: summary as object,
        verificationJson: verification as object,
        completedAt: new Date(),
      },
    });

    return { summary, verification };
  } catch (err) {
    await prisma.simulationRun.update({
      where: { id: runId },
      data: {
        status: "FAILED",
        summaryJson: { error: String(err) },
        completedAt: new Date(),
      },
    });
    throw err;
  }
}

/**
 * Create a RUNNING row and execute simulation in the background (for UI polling).
 */
export async function startSimulationAsync(
  params: SimulateEconomyParams = {},
): Promise<{ runId: string }> {
  const prisma = requirePrisma();
  const config = await getSimulationConfig();
  const runId = `sim_${crypto.randomBytes(6).toString("hex")}`;
  const totalCapitalUsdc = params.totalCapitalUsdc ?? 100_000_000;
  const seed = params.seed ?? 42;
  const clientMultiplier = Math.min(2, Math.max(0.1, params.clientMultiplier ?? 1));
  const simulatedDays = params.simulatedDays ?? 365;
  const sampleNationals = Math.min(15, Math.max(1, params.sampleNationals ?? 8));
  const sampleLocalsPerNational = Math.min(10, Math.max(1, params.sampleLocalsPerNational ?? 4));
  const clientsPerLocal = Math.min(
    12,
    Math.max(1, Math.round((params.clientsPerLocal ?? 6) * clientMultiplier)),
  );

  await prisma.simulationRun.create({
    data: {
      id: runId,
      seed,
      totalCapitalUsdc,
      clientMultiplier,
      simulatedDays,
      sampleNationals,
      sampleLocalsPerNational,
      clientsPerLocal,
      status: "RUNNING",
      configSnapshotJson: config as object,
      triggeredBy: params.triggeredBy,
      startedAt: new Date(),
    },
  });

  void simulateEconomy({ ...params, runId }).catch(() => {
    /* status FAILED persisted inside simulateEconomy */
  });

  return { runId };
}

/** Sequential 100M random vs 1B optimized contrast (Phase 3 light). */
export async function runContrastSimulations(opts: {
  triggeredBy?: string;
  randomSeed?: number;
}): Promise<{
  random100M: { summary: SimulationRunSummary; verification: SimulationVerification };
  optimized1B: { summary: SimulationRunSummary; verification: SimulationVerification };
}> {
  const seed = opts.randomSeed ?? Math.floor(Math.random() * 99_999);
  const random100M = await simulateEconomy({
    totalCapitalUsdc: 100_000_000,
    seed,
    resetSample: true,
    triggeredBy: opts.triggeredBy,
    sampleNationals: 8,
    sampleLocalsPerNational: 4,
    clientsPerLocal: 6,
  });

  const { optimizeSimulationConfig } = await import("./optimizeSimulation");
  const { updateSimulationConfig, getSimulationConfig } = await import("./simulationConfig");
  const current = await getSimulationConfig();
  const preview = optimizeSimulationConfig(current, 1_000_000_000);
  await updateSimulationConfig(preview.optimized, {
    changedBy: opts.triggeredBy,
    note: "Contrast run: apply optimized config for 1B",
  });

  const optimized1B = await simulateEconomy({
    totalCapitalUsdc: 1_000_000_000,
    seed: seed + 1,
    resetSample: true,
    triggeredBy: opts.triggeredBy,
    sampleNationals: 8,
    sampleLocalsPerNational: 4,
    clientsPerLocal: 6,
  });

  return { random100M, optimized1B };
}

export async function getLatestSimulationRun() {
  const prisma = requirePrisma();
  return prisma.simulationRun.findFirst({
    orderBy: { startedAt: "desc" },
  });
}

export async function listSimulationRuns(limit = 10) {
  const prisma = requirePrisma();
  return prisma.simulationRun.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}

export async function getSimulationRun(id: string) {
  const prisma = requirePrisma();
  return prisma.simulationRun.findUnique({ where: { id } });
}
