/**
 * Phase 2 economy simulator — callable service (CLI + Dev Admin API).
 * Uses Neon institutions/borrowers; persists capital + run history to Postgres.
 */
import crypto from "node:crypto";
import type { RiskTier } from "@prisma/client";
import { requirePrisma } from "../db/prisma";
import { syncBanksFromPrisma, persistBankCapital } from "../db/banksSync";
import { upsertInstitutionCapital, adjustInstitutionCapital } from "./institutionCapital";
import { borrowAprFromUtilization, tierForScore, PASSPORT_TIERS } from "../lib/rates";
import {
  configToRateParams,
  getSimulationConfig,
  type SimulationConfigSnapshot,
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
  if (!world) throw new Error("No WORLD institution in Neon — run db:seed:testing first.");
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
  totalRepaidUsdc: number;
  aggregateBalancesUsdc: number;
  maxUtilizationBps: number;
  configKinkBps: number;
  tierSnapshots: TierSnapshot[];
  sampleInstitutionIds: string[];
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
  return row.maxLoanUsdc / 1_000_000;
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
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
  const sampleNationals = Math.min(10, Math.max(1, params.sampleNationals ?? 5));
  const sampleLocalsPerNational = Math.min(8, Math.max(1, params.sampleLocalsPerNational ?? 3));
  const clientsPerLocal = Math.min(
    10,
    Math.max(1, Math.round((params.clientsPerLocal ?? 4) * clientMultiplier)),
  );

  const rand = mulberry32(seed);
  const runId = `sim_${crypto.randomBytes(6).toString("hex")}`;
  const startedAt = new Date();

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

  try {
    const worldId = await resolveWorldInstitutionId(prisma);
    const nationals = await prisma.institution.findMany({
      where: { institutionType: "NATIONAL", id: { not: worldId } },
      include: { capital: true, nationalBank: true },
      take: 200,
    });
    const sampledNationals = shuffle(nationals, rand).slice(0, sampleNationals);

    const touchedIds = new Set<string>([worldId]);
    let loansCreated = 0;
    let installmentsPaid = 0;
    let installmentsLate = 0;
    let netInterestUsdc = 0;
    let totalRepaidUsdc = 0;
    let maxUtilizationBps = 0;

    // Inject capital at World Bank
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

      await adjustInstitutionCapital(prisma, worldId, {
        reserveEth: -nbShare,
        allocatedEth: nbShare,
      });

      const locals = await prisma.institution.findMany({
        where: {
          institutionType: "LOCAL",
          localBank: { parentNationalBankId: nb.id },
        },
        include: { capital: true, localBank: true },
        take: 50,
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
          reserveEth: lbShare * 0.01,
        });

        const borrowers = await prisma.borrower.findMany({
          where: { registeredLocalBankId: lb.id },
          include: { creditPassport: true },
          take: 100,
        });
        const picked = shuffle(borrowers, rand).slice(0, clientsPerLocal);

        let lbLent = 0;
        for (const borrower of picked) {
          if (lbLent >= lbPool * 0.85) break;

          const score = borrower.creditPassport?.creditScore ?? 320;
          const tier = borrower.creditPassport?.riskTier ?? "SILVER";
          const maxLoan = maxLoanUsdcForTier(tier, score);
          const principal = Math.min(maxLoan, lbPool * (0.05 + rand() * 0.15));
          if (principal < 0.01) continue;

          const termMonths = Math.min(24, 6 + Math.floor(rand() * 12));
          const aprBps = borrowAprFromUtilization(
            Math.min(9900, Math.floor(((lbLent + principal) / Math.max(lbPool, 1)) * 10_000)),
            rateParams,
          );

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
          for (let k = 0; k < termMonths; k++) {
            const due = new Date();
            due.setDate(due.getDate() + (k + 1) * 30);
            const daysUntilDue = (k + 1) * 30;
            const payProb = daysUntilDue <= simulatedDays ? 0.35 + rand() * 0.45 : 0;
            const paid = rand() < payProb;
            if (paid) {
              installmentsPaid += 1;
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
          netInterestUsdc += interest * (installmentsPaid / termMonths);

          lbLent += principal;
          loansCreated += 1;
        }

        const utilizationBps = Math.floor((lbLent / Math.max(lbPool, 1)) * 10_000);
        maxUtilizationBps = Math.max(maxUtilizationBps, utilizationBps);

        const lbRow = await prisma.institutionCapital.findFirst({ where: { institutionId: lb.id } });
        if (lbRow) {
          await prisma.institutionCapital.update({
            where: { id: lbRow.id },
            data: {
              lentEth: lbLent,
              allocatedEth: lbPool - lbLent,
              activeLoanCount: picked.length,
              syncedAt: new Date(),
            },
          });
        }
      }
    }

    // Interbank + upward sample flows
    let interbankLoans = 0;
    if (sampledNationals.length >= 2) {
      const pairs = Math.min(3, sampledNationals.length - 1);
      for (let p = 0; p < pairs; p++) {
        const lender = sampledNationals[p]!;
        const borrower = sampledNationals[p + 1]!;
        const amount = 50_000 + rand() * 200_000;
        await prisma.interbankLoanRecord.create({
          data: {
            lenderId: lender.id,
            borrowerId: borrower.id,
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
      if (!lb.id.startsWith("bank_lb")) continue;
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
      totalRepaidUsdc,
      aggregateBalancesUsdc,
      maxUtilizationBps,
      configKinkBps: config.kinkBps,
      tierSnapshots,
      sampleInstitutionIds: [...touchedIds],
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

export async function getLatestSimulationRun() {
  const prisma = requirePrisma();
  return prisma.simulationRun.findFirst({
    orderBy: { startedAt: "desc" },
  });
}

export async function getSimulationRun(id: string) {
  const prisma = requirePrisma();
  return prisma.simulationRun.findUnique({ where: { id } });
}
