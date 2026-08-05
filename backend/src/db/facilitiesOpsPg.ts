/**
 * Interbank + upward facilities — Postgres source of truth (paper #40–41).
 */
import crypto from "node:crypto";
import type { OpsInterbankLoan, OpsUpwardDeposit } from "@prisma/client";
import { requirePrisma } from "./prisma";

export type InterbankTenorDays = 1 | 7 | 30;

export type InterbankLoan = {
  id: string;
  borrowerBankId: string;
  lenderBankId: string;
  amountUsdc: number;
  tenorDays: InterbankTenorDays;
  aprBps: number;
  status: "REQUESTED" | "ACTIVE" | "REPAID" | "REJECTED" | "DEFAULTED" | string;
  createdAt: string;
  createdBy: string;
  fundedAt?: string;
  repaidAt?: string;
  dueAt?: string;
  note?: string;
};

export type UpwardDeposit = {
  id: string;
  fromBankId: string;
  toBankId: string;
  amountUsdc: number;
  createdAt: string;
  createdBy: string;
  note?: string;
};

export function interbankAprBps(tenor: InterbankTenorDays): number {
  if (tenor === 1) return 200;
  if (tenor === 7) return 350;
  return 550;
}

function uid(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function toIb(row: OpsInterbankLoan): InterbankLoan {
  return {
    id: row.id,
    borrowerBankId: row.borrowerBankId,
    lenderBankId: row.lenderBankId,
    amountUsdc: row.amountUsdc,
    tenorDays: row.tenorDays as InterbankTenorDays,
    aprBps: row.aprBps,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    fundedAt: row.fundedAt?.toISOString(),
    repaidAt: row.repaidAt?.toISOString(),
    dueAt: row.dueAt?.toISOString(),
    note: row.note ?? undefined,
  };
}

function toUp(row: OpsUpwardDeposit): UpwardDeposit {
  return {
    id: row.id,
    fromBankId: row.fromBankId,
    toBankId: row.toBankId,
    amountUsdc: row.amountUsdc,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    note: row.note ?? undefined,
  };
}

export async function listInterbankForBank(bankId: string): Promise<InterbankLoan[]> {
  const prisma = requirePrisma();
  const rows = await prisma.opsInterbankLoan.findMany({
    where: {
      OR: [{ borrowerBankId: bankId }, { lenderBankId: bankId }],
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toIb);
}

export async function listUpwardForBank(bankId: string): Promise<UpwardDeposit[]> {
  const prisma = requirePrisma();
  const rows = await prisma.opsUpwardDeposit.findMany({
    where: {
      OR: [{ fromBankId: bankId }, { toBankId: bankId }],
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toUp);
}

export async function createInterbankLoan(input: {
  borrowerBankId: string;
  lenderBankId: string;
  amountUsdc: number;
  tenorDays: InterbankTenorDays;
  aprBps: number;
  createdBy: string;
  note?: string;
}): Promise<InterbankLoan> {
  const prisma = requirePrisma();
  const row = await prisma.opsInterbankLoan.create({
    data: {
      id: uid("ibl"),
      borrowerBankId: input.borrowerBankId,
      lenderBankId: input.lenderBankId,
      amountUsdc: input.amountUsdc,
      tenorDays: input.tenorDays,
      aprBps: input.aprBps,
      status: "REQUESTED",
      createdBy: input.createdBy,
      note: input.note,
    },
  });
  return toIb(row);
}

export async function findInterbankLoan(id: string): Promise<InterbankLoan | null> {
  const prisma = requirePrisma();
  const row = await prisma.opsInterbankLoan.findUnique({ where: { id } });
  return row ? toIb(row) : null;
}

export async function updateInterbankLoan(
  id: string,
  patch: {
    status?: string;
    fundedAt?: Date | null;
    repaidAt?: Date | null;
    dueAt?: Date | null;
  },
): Promise<InterbankLoan> {
  const prisma = requirePrisma();
  const row = await prisma.opsInterbankLoan.update({
    where: { id },
    data: {
      ...(patch.status != null ? { status: patch.status } : {}),
      ...(patch.fundedAt !== undefined ? { fundedAt: patch.fundedAt } : {}),
      ...(patch.repaidAt !== undefined ? { repaidAt: patch.repaidAt } : {}),
      ...(patch.dueAt !== undefined ? { dueAt: patch.dueAt } : {}),
    },
  });
  return toIb(row);
}

export async function createUpwardDeposit(input: {
  fromBankId: string;
  toBankId: string;
  amountUsdc: number;
  createdBy: string;
  note?: string;
}): Promise<UpwardDeposit> {
  const prisma = requirePrisma();
  const row = await prisma.opsUpwardDeposit.create({
    data: {
      id: uid("up"),
      fromBankId: input.fromBankId,
      toBankId: input.toBankId,
      amountUsdc: input.amountUsdc,
      createdBy: input.createdBy,
      note: input.note,
    },
  });
  return toUp(row);
}

export async function resetFacilitiesPg(): Promise<void> {
  const prisma = requirePrisma();
  await prisma.opsInterbankLoan.deleteMany({});
  await prisma.opsUpwardDeposit.deleteMany({});
}
