/**
 * Hierarchical capital cascade: World $1B → push 70% → Nationals → Locals → Clients.
 *
 * - World retains 30% buffer.
 * - Each bank tier retains minReserveRatio (default 15%) of what it receives.
 * - Locals lend ~targetUtilization of their pool to clients (random principals).
 *
 * Used by `scripts/seed-capital-cascade.ts`.
 */
import type { PrismaClient, RiskTier } from "@prisma/client";
import { upsertInstitutionCapital } from "./institutionCapital";
import { PASSPORT_TIERS } from "../lib/rates";

export type CapitalCascadeParams = {
  worldReserveUsdc?: number;
  distributeRatio?: number;
  minReserveRatio?: number;
  targetUtilization?: number;
  seed?: number;
  clientLoanMinUsdc?: number;
  clientLoanMaxUsdc?: number;
  /** Create Prisma Loan + LoanRequest rows (slower). Default true. */
  createLoanRecords?: boolean;
  /** Create installment schedule rows. Default false for seed speed. */
  createInstallments?: boolean;
  /** Delete prior cascade-tagged loans before seeding. Default true. */
  resetCascadeLoans?: boolean;
  /** Zero all InstitutionCapital before redistribute. Default true. */
  resetCapital?: boolean;
};

export type CapitalCascadeSummary = {
  worldId: string;
  worldReserveUsdc: number;
  distributedUsdc: number;
  retainedAtWorldUsdc: number;
  nationalCount: number;
  localCount: number;
  clientLoansCreated: number;
  clientBookUsdc: number;
  nationalReserveUsdc: number;
  localReserveUsdc: number;
  localAllocatedUsdc: number;
  localLentUsdc: number;
  meanNationalShareUsdc: number;
  meanLocalShareUsdc: number;
  meanClientLoanUsdc: number;
  minNationalShareUsdc: number;
  maxNationalShareUsdc: number;
  minLocalShareUsdc: number;
  maxLocalShareUsdc: number;
};

const CASCADE_PURPOSE_PREFIX = "Capital cascade seed";

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function weight(rand: () => number): number {
  return rand() + 0.1; // U(0.1, 1.1)
}

function normalizeShares(weights: number[], total: number): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  return weights.map((w) => (total * w) / sum);
}

/** Retail caps for cascade seed — tight enough for demo, loose enough to hit ~50% util with ~20 clients/local. */
function retailCapUsdc(tier: RiskTier | null | undefined, score: number | null | undefined): number {
  const s = score ?? 320;
  const name = (tier || "SILVER").toString().toUpperCase();
  const soft: Record<string, number> = {
    BRONZE: 6_000,
    SILVER: 15_000,
    GOLD: 25_000,
    PLATINUM: 25_000,
    DIAMOND: 25_000,
  };
  const passport = PASSPORT_TIERS.find(
    (t) => t.name.toUpperCase() === name || (s >= t.minScore && s <= t.maxScore),
  );
  const softCap = soft[name] ?? soft.SILVER!;
  const hard = passport?.maxLoanUsdc ?? 50_000;
  return Math.min(softCap, hard, 25_000);
}

function usdcWei(amount: number): string {
  return Math.round(amount * 1_000_000).toString();
}

function shuffleInPlace<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export async function runCapitalCascade(
  prisma: PrismaClient,
  params: CapitalCascadeParams = {},
): Promise<CapitalCascadeSummary> {
  const worldReserveUsdc = params.worldReserveUsdc ?? 1_000_000_000;
  const distributeRatio = params.distributeRatio ?? 0.7;
  const minReserveRatio = params.minReserveRatio ?? 0.15;
  const targetUtilization = params.targetUtilization ?? 0.5;
  const seed = params.seed ?? 42;
  const clientLoanMinUsdc = params.clientLoanMinUsdc ?? 500;
  const clientLoanMaxUsdc = params.clientLoanMaxUsdc ?? 25_000;
  const createLoanRecords = params.createLoanRecords !== false;
  const createInstallments = params.createInstallments === true;
  const resetCascadeLoans = params.resetCascadeLoans !== false;
  const resetCapital = params.resetCapital !== false;

  const rand = mulberry32(seed);
  const distributedUsdc = worldReserveUsdc * distributeRatio;
  const retainedAtWorldUsdc = worldReserveUsdc - distributedUsdc;

  const world = await prisma.institution.findFirst({
    where: { institutionType: "WORLD" },
  });
  if (!world) {
    throw new Error("No WORLD institution — run npm run db:seed:testing first.");
  }

  const nationals = await prisma.institution.findMany({
    where: { institutionType: "NATIONAL" },
    include: { localBank: false, nationalBank: true },
    orderBy: { name: "asc" },
  });
  if (nationals.length === 0) {
    throw new Error("No NATIONAL institutions — run npm run db:seed:testing first.");
  }

  if (resetCascadeLoans) {
    const oldReqs = await prisma.loanRequest.findMany({
      where: { purpose: { startsWith: CASCADE_PURPOSE_PREFIX } },
      select: { id: true },
    });
    if (oldReqs.length) {
      const ids = oldReqs.map((r) => r.id);
      const loans = await prisma.loan.findMany({
        where: { requestId: { in: ids } },
        select: { id: true },
      });
      const loanIds = loans.map((l) => l.id);
      if (loanIds.length) {
        await prisma.installment.deleteMany({ where: { loanId: { in: loanIds } } });
        await prisma.loan.deleteMany({ where: { id: { in: loanIds } } });
      }
      await prisma.loanRequest.deleteMany({ where: { id: { in: ids } } });
    }
  }

  if (resetCapital) {
    await prisma.institutionCapital.deleteMany({});
  }

  await upsertInstitutionCapital(prisma, world.id, {
    reserveEth: retainedAtWorldUsdc,
    allocatedEth: distributedUsdc,
    lentEth: 0,
    repaidEth: 0,
    activeLoanCount: 0,
  });

  const nbWeights = nationals.map(() => weight(rand));
  const nbShares = normalizeShares(nbWeights, distributedUsdc);

  let nationalReserveUsdc = 0;
  let localReserveUsdc = 0;
  let localAllocatedUsdc = 0;
  let localLentUsdc = 0;
  let localCount = 0;
  let clientLoansCreated = 0;
  let clientBookUsdc = 0;
  let minNational = Infinity;
  let maxNational = 0;
  let minLocal = Infinity;
  let maxLocal = 0;

  for (let i = 0; i < nationals.length; i++) {
    const nb = nationals[i]!;
    const nbShare = nbShares[i]!;
    minNational = Math.min(minNational, nbShare);
    maxNational = Math.max(maxNational, nbShare);

    const nbReserve = nbShare * minReserveRatio;
    const nbDeployable = nbShare - nbReserve;
    nationalReserveUsdc += nbReserve;

    const locals = await prisma.institution.findMany({
      where: {
        institutionType: "LOCAL",
        localBank: { parentNationalBankId: nb.id },
      },
      orderBy: { name: "asc" },
    });

    if (locals.length === 0) {
      // No children — park deployable as allocated at national
      await upsertInstitutionCapital(prisma, nb.id, {
        reserveEth: nbReserve,
        allocatedEth: nbDeployable,
        lentEth: 0,
        repaidEth: 0,
        activeLoanCount: 0,
      });
      continue;
    }

    const lbWeights = locals.map(() => weight(rand));
    const lbShares = normalizeShares(lbWeights, nbDeployable);

    await upsertInstitutionCapital(prisma, nb.id, {
      reserveEth: nbReserve,
      allocatedEth: 0,
      lentEth: 0,
      repaidEth: 0,
      activeLoanCount: 0,
    });

    for (let j = 0; j < locals.length; j++) {
      const lb = locals[j]!;
      const lbShare = lbShares[j]!;
      localCount += 1;
      minLocal = Math.min(minLocal, lbShare);
      maxLocal = Math.max(maxLocal, lbShare);

      const lbReserve = lbShare * minReserveRatio;
      const lbPool = lbShare - lbReserve;
      const targetLent = lbPool * targetUtilization;

      localReserveUsdc += lbReserve;

      const borrowers = await prisma.borrower.findMany({
        where: { registeredLocalBankId: lb.id },
        include: { creditPassport: true },
      });
      shuffleInPlace(borrowers, rand);

      let lbLent = 0;
      const loanBatch: Array<{
        borrowerId: string;
        principal: number;
        termMonths: number;
        aprBps: number;
      }> = [];

      if (borrowers.length > 0 && targetLent >= clientLoanMinUsdc * 0.5) {
        // Random weights across clients, then scale to fill ~targetUtilization of pool
        // (clipped by per-tier retail caps so we hit the book target when clients exist).
        const caps = borrowers.map((b) => {
          const score = b.creditPassport?.creditScore ?? 300 + Math.floor(rand() * 400);
          const tier = (b.creditPassport?.riskTier ?? "SILVER") as RiskTier;
          return Math.min(clientLoanMaxUsdc, retailCapUsdc(tier, score));
        });
        const raw = borrowers.map(() => weight(rand));
        const rawSum = raw.reduce((a, b) => a + b, 0) || 1;
        let proposed = raw.map((w, idx) =>
          Math.min(caps[idx]!, (targetLent * w) / rawSum),
        );
        // Drop tiny crumbs
        proposed = proposed.map((p) => (p < clientLoanMinUsdc * 0.4 ? 0 : p));
        let propSum = proposed.reduce((a, b) => a + b, 0);
        if (propSum > 0 && propSum < targetLent) {
          // Top-up proportionally up to caps
          const room = proposed.map((p, idx) => Math.max(0, caps[idx]! - p));
          let roomSum = room.reduce((a, b) => a + b, 0);
          let need = Math.min(targetLent - propSum, roomSum);
          if (roomSum > 0 && need > 0) {
            proposed = proposed.map((p, idx) => {
              const add = (need * room[idx]!) / roomSum;
              return p + add;
            });
          }
        } else if (propSum > targetLent) {
          const scale = targetLent / propSum;
          proposed = proposed.map((p) => p * scale);
        }

        for (let bi = 0; bi < borrowers.length; bi++) {
          const principal = proposed[bi]!;
          if (principal < clientLoanMinUsdc * 0.4) continue;
          const termMonths = 6 + Math.floor(rand() * 12);
          const utilBps = Math.floor(((lbLent + principal) / Math.max(lbPool, 1)) * 10_000);
          const aprBps = 800 + Math.floor((utilBps / 10000) * 400);
          loanBatch.push({
            borrowerId: borrowers[bi]!.id,
            principal,
            termMonths,
            aprBps,
          });
          lbLent += principal;
        }
      }

      if (createLoanRecords && loanBatch.length) {
        const CHUNK = 100;
        for (let c = 0; c < loanBatch.length; c += CHUNK) {
          const chunk = loanBatch.slice(c, c + CHUNK);
          const reqs = await prisma.loanRequest.createManyAndReturn({
            data: chunk.map((item) => ({
              borrowerId: item.borrowerId,
              localBankId: lb.id,
              principalWei: usdcWei(item.principal),
              termMonths: item.termMonths,
              purpose: `${CASCADE_PURPOSE_PREFIX} (seed ${seed})`,
              status: "DISBURSED" as const,
              docHash: `cascade_${seed}_${lb.id}_${item.borrowerId}_${item.principal.toFixed(2)}`,
            })),
          });
          const loans = await prisma.loan.createManyAndReturn({
            data: reqs.map((req, idx) => ({
              requestId: req.id,
              borrowerId: chunk[idx]!.borrowerId,
              localBankId: lb.id,
              principalWei: usdcWei(chunk[idx]!.principal),
              aprBps: chunk[idx]!.aprBps,
              termMonths: chunk[idx]!.termMonths,
              status: "ACTIVE" as const,
            })),
          });
          if (createInstallments) {
            const installmentRows = [];
            for (let li = 0; li < loans.length; li++) {
              const item = chunk[li]!;
              const loan = loans[li]!;
              const per = item.principal / item.termMonths;
              for (let k = 0; k < item.termMonths; k++) {
                const due = new Date();
                due.setDate(due.getDate() + (k + 1) * 30);
                installmentRows.push({
                  loanId: loan.id,
                  index: k + 1,
                  amountWei: usdcWei(per),
                  dueDate: due,
                  paid: false,
                });
              }
            }
            for (let i = 0; i < installmentRows.length; i += 500) {
              await prisma.installment.createMany({ data: installmentRows.slice(i, i + 500) });
            }
          }
        }
      }

      clientLoansCreated += loanBatch.length;
      clientBookUsdc += lbLent;
      localLentUsdc += lbLent;
      const remainingPool = Math.max(0, lbPool - lbLent);
      localAllocatedUsdc += remainingPool;

      await upsertInstitutionCapital(prisma, lb.id, {
        reserveEth: lbReserve,
        allocatedEth: remainingPool,
        lentEth: lbLent,
        repaidEth: 0,
        activeLoanCount: loanBatch.length,
      });
    }
  }

  // Ensure any locals missed (orphans) get a tiny zero capital row
  const orphanLocals = await prisma.institution.findMany({
    where: {
      institutionType: "LOCAL",
      capital: null,
    },
    select: { id: true },
  });
  for (const o of orphanLocals) {
    await upsertInstitutionCapital(prisma, o.id, {
      reserveEth: 0,
      allocatedEth: 0,
      lentEth: 0,
      repaidEth: 0,
      activeLoanCount: 0,
    });
  }

  return {
    worldId: world.id,
    worldReserveUsdc,
    distributedUsdc,
    retainedAtWorldUsdc,
    nationalCount: nationals.length,
    localCount,
    clientLoansCreated,
    clientBookUsdc,
    nationalReserveUsdc,
    localReserveUsdc,
    localAllocatedUsdc,
    localLentUsdc,
    meanNationalShareUsdc: distributedUsdc / nationals.length,
    meanLocalShareUsdc: localCount ? (distributedUsdc * (1 - minReserveRatio)) / localCount : 0,
    meanClientLoanUsdc: clientLoansCreated ? clientBookUsdc / clientLoansCreated : 0,
    minNationalShareUsdc: Number.isFinite(minNational) ? minNational : 0,
    maxNationalShareUsdc: maxNational,
    minLocalShareUsdc: Number.isFinite(minLocal) ? minLocal : 0,
    maxLocalShareUsdc: maxLocal,
  };
}
