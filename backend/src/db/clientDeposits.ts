/**
 * Client deposits — Postgres source of truth (checking / vault / FD / FX / convert).
 */
import crypto from "node:crypto";
import type { ClientDepositAccount, ClientDepositLedger, ClientFixedDeposit } from "@prisma/client";
import { requirePrisma } from "./prisma";

export type DepositLedgerKind =
  | "VAULT_DEPOSIT"
  | "VAULT_WITHDRAW"
  | "FD_OPEN"
  | "FD_MATURE"
  | "FD_EARLY"
  | "CHECK_SEND"
  | "CHECK_RECV"
  | "USD_TO_USDC"
  | "FX_USDC_TO_ETH"
  | "FX_ETH_TO_USDC";

export const VAULT_APY_BPS = 420;
export const YIELD_SPLIT = {
  depositorBps: 7000,
  insuranceBps: 2000,
  protocolBps: 1000,
} as const;
export const FD_TERMS: Array<{ termDays: number; aprBps: number }> = [
  { termDays: 30, aprBps: 500 },
  { termDays: 90, aprBps: 650 },
  { termDays: 180, aprBps: 800 },
  { termDays: 365, aprBps: 950 },
];
export const EARLY_PENALTY_BPS = 200;
export const RESERVE_RATIO_BPS = 2500;
export const RESERVE_MIN_BPS = 2000;
export const RESERVE_RATIO_OK =
  process.env.DEPOSITS_RESERVE_OK !== "false" && RESERVE_RATIO_BPS >= RESERVE_MIN_BPS;

export const USD_USDC_RATE = 1;
export const CLIENT_FX_USDC_PER_ETH = 3200;
export const CLIENT_FX_SPREAD_BPS = 30;

export function estimateAccruedYield(principal: number): number {
  if (principal <= 0) return 0;
  return (principal * VAULT_APY_BPS) / (10_000 * 12);
}

function uid(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export type DepositAccountView = {
  vaultUsdc: number;
  checkingUsdc: number;
  ethBalance: number;
  fiatUsd: number;
};

export type LedgerView = {
  id: string;
  userId: string;
  kind: string;
  amount: number;
  note?: string;
  counterparty?: string;
  txHash?: string;
  at: string;
};

export type FixedDepositView = {
  id: string;
  userId: string;
  principal: number;
  termDays: number;
  aprBps: number;
  openedAt: string;
  maturesAt: string;
  status: string;
  penaltyBps: number;
};

function toLedger(row: ClientDepositLedger): LedgerView {
  return {
    id: row.id,
    userId: row.userId,
    kind: row.kind,
    amount: row.amount,
    note: row.note ?? undefined,
    counterparty: row.counterparty ?? undefined,
    txHash: row.txHash ?? undefined,
    at: row.createdAt.toISOString(),
  };
}

function toFd(row: ClientFixedDeposit): FixedDepositView {
  return {
    id: row.id,
    userId: row.userId,
    principal: row.principal,
    termDays: row.termDays,
    aprBps: row.aprBps,
    openedAt: row.openedAt.toISOString(),
    maturesAt: row.maturesAt.toISOString(),
    status: row.status,
    penaltyBps: row.penaltyBps,
  };
}

function toAccount(row: ClientDepositAccount): DepositAccountView {
  return {
    vaultUsdc: row.vaultUsdc,
    checkingUsdc: row.checkingUsdc,
    ethBalance: row.ethBalance,
    fiatUsd: row.fiatUsd,
  };
}

/** Ensure a deposit account row exists (demo starter balances on create). */
export async function ensureDepositAccount(userId: string): Promise<DepositAccountView> {
  const prisma = requirePrisma();
  const row = await prisma.clientDepositAccount.upsert({
    where: { userId },
    create: {
      userId,
      vaultUsdc: 0,
      checkingUsdc: 250,
      ethBalance: 0.05,
      fiatUsd: 500,
    },
    update: {},
  });
  return toAccount(row);
}

export async function getDepositAccount(userId: string): Promise<DepositAccountView> {
  return ensureDepositAccount(userId);
}

export async function updateDepositAccount(
  userId: string,
  patch: Partial<DepositAccountView>,
): Promise<DepositAccountView> {
  const prisma = requirePrisma();
  await ensureDepositAccount(userId);
  const row = await prisma.clientDepositAccount.update({
    where: { userId },
    data: {
      ...(patch.vaultUsdc != null ? { vaultUsdc: patch.vaultUsdc } : {}),
      ...(patch.checkingUsdc != null ? { checkingUsdc: patch.checkingUsdc } : {}),
      ...(patch.ethBalance != null ? { ethBalance: patch.ethBalance } : {}),
      ...(patch.fiatUsd != null ? { fiatUsd: patch.fiatUsd } : {}),
    },
  });
  return toAccount(row);
}

export async function pushDepositLedger(entry: {
  userId: string;
  kind: DepositLedgerKind | string;
  amount: number;
  note?: string;
  counterparty?: string;
  txHash?: string;
}): Promise<LedgerView> {
  const prisma = requirePrisma();
  const row = await prisma.clientDepositLedger.create({
    data: {
      id: uid("dep"),
      userId: entry.userId,
      kind: entry.kind,
      amount: entry.amount,
      note: entry.note,
      counterparty: entry.counterparty,
      txHash: entry.txHash ?? `0x${crypto.randomBytes(16).toString("hex")}`,
    },
  });
  return toLedger(row);
}

export async function listDepositLedger(
  userId: string,
  opts?: { kindPrefix?: string; limit?: number },
): Promise<LedgerView[]> {
  const prisma = requirePrisma();
  const limit = opts?.limit ?? 100;
  const rows = await prisma.clientDepositLedger.findMany({
    where: {
      userId,
      ...(opts?.kindPrefix
        ? { kind: { startsWith: opts.kindPrefix } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toLedger);
}

export async function listFixedDeposits(userId: string): Promise<FixedDepositView[]> {
  const prisma = requirePrisma();
  const rows = await prisma.clientFixedDeposit.findMany({
    where: { userId },
    orderBy: { openedAt: "desc" },
  });
  return rows.map(toFd);
}

export async function createFixedDeposit(input: {
  userId: string;
  principal: number;
  termDays: number;
  aprBps: number;
  penaltyBps?: number;
}): Promise<FixedDepositView> {
  const prisma = requirePrisma();
  const openedAt = new Date();
  const maturesAt = new Date(openedAt);
  maturesAt.setDate(maturesAt.getDate() + input.termDays);
  const row = await prisma.clientFixedDeposit.create({
    data: {
      id: uid("fd"),
      userId: input.userId,
      principal: input.principal,
      termDays: input.termDays,
      aprBps: input.aprBps,
      openedAt,
      maturesAt,
      status: "ACTIVE",
      penaltyBps: input.penaltyBps ?? EARLY_PENALTY_BPS,
    },
  });
  return toFd(row);
}

export async function findFixedDeposit(
  id: string,
  userId: string,
): Promise<FixedDepositView | null> {
  const prisma = requirePrisma();
  const row = await prisma.clientFixedDeposit.findFirst({ where: { id, userId } });
  return row ? toFd(row) : null;
}

export async function updateFixedDepositStatus(
  id: string,
  status: string,
): Promise<FixedDepositView> {
  const prisma = requirePrisma();
  const row = await prisma.clientFixedDeposit.update({
    where: { id },
    data: { status },
  });
  return toFd(row);
}

/** Wipe deposit tables (tests). */
export async function resetClientDepositsPg(): Promise<void> {
  const prisma = requirePrisma();
  await prisma.clientDepositLedger.deleteMany({});
  await prisma.clientFixedDeposit.deleteMany({});
  await prisma.clientDepositAccount.deleteMany({});
}
