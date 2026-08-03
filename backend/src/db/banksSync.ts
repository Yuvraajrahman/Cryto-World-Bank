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

  // Preserve non-bank memory state; replace bank list from Postgres.
  db.state.banks = banks;
  db.save();
  return { count: banks.length };
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
