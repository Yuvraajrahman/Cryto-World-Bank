/**
 * Sync in-memory allocation banks from Prisma Institution + InstitutionCapital.
 * Keeps Super Admin / World / National allocate APIs truthful after testing seed.
 */
import { requirePrisma } from "./prisma";
import { db, type Bank, type BankTier } from "../store/db";

function walletFor(id: string, onChain: string | null | undefined): string {
  if (onChain && /^0x[a-fA-F0-9]{40}$/i.test(onChain)) return onChain.toLowerCase();
  // Deterministic placeholder wallet from institution id
  const hex = Buffer.from(id).toString("hex").padEnd(40, "0").slice(0, 40);
  return `0x${hex}`;
}

/**
 * Prefer testing-world seed institutions over legacy demo duplicates.
 * Example: bank_nb_bangladesh (+ 8 locals) wins over bank_nb_bd (+ 2 legacy locals).
 */
export function canonicalizeBanks(banks: Bank[]): Bank[] {
  const ids = new Set(banks.map((b) => b.id));
  let list = banks;

  // Explicit legacy → canonical pairs from older prisma/seed.ts vs seed-testing-world.ts
  if (ids.has("bank_nb_bangladesh") && ids.has("bank_nb_bd")) {
    list = list.filter((b) => b.id !== "bank_nb_bd" && b.parentBankId !== "bank_nb_bd");
  }

  // Deduplicate remaining nationals that share the same jurisdiction name
  const nationals = list.filter((b) => b.tier === "NATIONAL");
  const nonNationals = list.filter((b) => b.tier !== "NATIONAL");
  const groups = new Map<string, Bank[]>();
  for (const n of nationals) {
    const key = String(n.jurisdiction || n.name || n.id)
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(n);
  }

  const keptNationals: Bank[] = [];
  const droppedNationalIds = new Set<string>();
  for (const group of groups.values()) {
    if (group.length === 1) {
      keptNationals.push(group[0]);
      continue;
    }
    const ranked = group
      .map((n) => {
        const childCount = list.filter((b) => b.parentBankId === n.id).length;
        const preferCanonicalName = /_[a-z]{3,}$/i.test(n.id) && !/_bd$/i.test(n.id) ? 1 : 0;
        const preferLongId = n.id.length;
        return {
          n,
          score: preferCanonicalName * 1_000_000 + childCount * 10_000 + (n.reserve || 0) + preferLongId,
        };
      })
      .sort((a, b) => b.score - a.score);
    keptNationals.push(ranked[0].n);
    for (const loser of ranked.slice(1)) droppedNationalIds.add(loser.n.id);
  }

  const keptOthers = nonNationals.filter(
    (b) => !(b.tier === "LOCAL" && b.parentBankId && droppedNationalIds.has(b.parentBankId)),
  );

  return [...keptOthers.filter((b) => b.tier === "WORLD"), ...keptNationals, ...keptOthers.filter((b) => b.tier === "LOCAL")];
}

export async function syncBanksFromPrisma(): Promise<{ count: number }> {
  const prisma = requirePrisma();
  const rows = await prisma.institution.findMany({
    include: {
      capital: true,
      nationalBank: true,
      localBank: true,
      worldBank: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const banks: Bank[] = rows.map((inst) => {
    const tier = inst.institutionType as BankTier;
    let parentBankId: string | undefined;
    let jurisdiction: string | undefined;
    let city: string | undefined;
    let aprBps = 500;

    if (tier === "NATIONAL" && inst.nationalBank) {
      parentBankId = inst.nationalBank.parentWorldBankId;
      jurisdiction = inst.nationalBank.jurisdiction ?? undefined;
      aprBps = inst.nationalBank.lendingAprBps;
    } else if (tier === "LOCAL" && inst.localBank) {
      parentBankId = inst.localBank.parentNationalBankId;
      city = inst.localBank.region ?? undefined;
      jurisdiction = inst.countryCode ?? undefined;
      aprBps = inst.localBank.borrowAprBps;
    } else if (tier === "WORLD" && inst.worldBank) {
      aprBps = inst.worldBank.lendingAprBps;
      jurisdiction = "Global";
    }

    const cap = inst.capital;
    return {
      id: inst.id,
      tier,
      name: inst.name,
      walletAddress: walletFor(inst.id, inst.onChainAddress),
      jurisdiction,
      city,
      parentBankId,
      // Testing phase: reserveEth field stores USDC units
      reserve: cap?.reserveEth ?? 0,
      totalAllocated: cap?.allocatedEth ?? 0,
      totalLent: cap?.lentEth ?? 0,
      totalRepaid: cap?.repaidEth ?? 0,
      aprBps,
      status: "ACTIVE",
      createdAt: inst.createdAt.toISOString(),
    };
  });

  if (banks.length === 0) return { count: 0 };

  // Preserve non-bank memory state; replace bank list from Postgres (canonicalized).
  db.state.banks = canonicalizeBanks(banks);
  db.save();
  return { count: db.state.banks.length };
}

/** Persist a single bank's capital back to Prisma (after allocate). */
export async function persistBankCapital(bankId: string): Promise<void> {
  const bank = db.state.banks.find((b) => b.id === bankId);
  if (!bank) return;
  const prisma = requirePrisma();
  const exists = await prisma.institution.findUnique({
    where: { id: bankId },
    select: { id: true },
  });
  if (!exists) {
    throw new Error(
      `Cannot persist capital: institution ${bankId} is missing in Postgres. Re-sync banks or re-seed.`,
    );
  }
  await prisma.institutionCapital.upsert({
    where: { institutionId: bankId },
    update: {
      reserveEth: bank.reserve,
      allocatedEth: bank.totalAllocated,
      lentEth: bank.totalLent,
      repaidEth: bank.totalRepaid,
      syncedAt: new Date(),
    },
    create: {
      institutionId: bankId,
      reserveEth: bank.reserve,
      allocatedEth: bank.totalAllocated,
      lentEth: bank.totalLent,
      repaidEth: bank.totalRepaid,
      syncedAt: new Date(),
    },
  });
}

/** Pull one bank's capital from Postgres into memory (dashboard source of truth). */
export async function hydrateBankCapitalFromPrisma(bankId: string): Promise<Bank | null> {
  const bank = db.state.banks.find((b) => b.id === bankId);
  if (!bank) return null;
  const prisma = requirePrisma();
  const cap = await prisma.institutionCapital.findUnique({
    where: { institutionId: bankId },
  });
  if (!cap) return bank;
  bank.reserve = cap.reserveEth ?? 0;
  bank.totalAllocated = cap.allocatedEth ?? 0;
  bank.totalLent = cap.lentEth ?? 0;
  bank.totalRepaid = cap.repaidEth ?? 0;
  db.save();
  return bank;
}
