/**
 * One-time import of legacy JSON deposit/facilities stores into Postgres.
 * Safe to re-run: skips users/rows that already exist.
 */
import fs from "node:fs";
import path from "node:path";
import { getPrisma, requirePrisma } from "../db/prisma";

const DATA_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", ".data")
    : path.join(process.cwd(), ".data");

export async function importLegacyDepositsJson(): Promise<{
  accounts: number;
  ledger: number;
  fds: number;
}> {
  const prisma = getPrisma();
  if (!prisma) return { accounts: 0, ledger: 0, fds: 0 };
  const file = path.join(DATA_DIR, "deposits.json");
  if (!fs.existsSync(file)) return { accounts: 0, ledger: 0, fds: 0 };

  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as {
    vaultBalances?: Record<string, number>;
    checkingBalances?: Record<string, number>;
    ethBalances?: Record<string, number>;
    fiatUsdBalances?: Record<string, number>;
    fixedDeposits?: Array<{
      id: string;
      userId: string;
      principal: number;
      termDays: number;
      aprBps: number;
      openedAt: string;
      maturesAt: string;
      status: string;
      penaltyBps: number;
    }>;
    ledger?: Array<{
      id: string;
      userId: string;
      kind: string;
      amount: number;
      note?: string;
      counterparty?: string;
      txHash?: string;
      at: string;
    }>;
  };

  const userIds = new Set<string>([
    ...Object.keys(raw.vaultBalances || {}),
    ...Object.keys(raw.checkingBalances || {}),
    ...Object.keys(raw.ethBalances || {}),
    ...Object.keys(raw.fiatUsdBalances || {}),
  ]);

  let accounts = 0;
  for (const userId of userIds) {
    const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!exists) continue;
    const existing = await prisma.clientDepositAccount.findUnique({ where: { userId } });
    if (existing) continue;
    await prisma.clientDepositAccount.create({
      data: {
        userId,
        vaultUsdc: raw.vaultBalances?.[userId] ?? 0,
        checkingUsdc: raw.checkingBalances?.[userId] ?? 250,
        ethBalance: raw.ethBalances?.[userId] ?? 0.05,
        fiatUsd: raw.fiatUsdBalances?.[userId] ?? 500,
      },
    });
    accounts += 1;
  }

  let ledger = 0;
  for (const e of raw.ledger || []) {
    const exists = await prisma.clientDepositLedger.findUnique({ where: { id: e.id } });
    if (exists) continue;
    const userOk = await prisma.user.findUnique({ where: { id: e.userId }, select: { id: true } });
    if (!userOk) continue;
    await prisma.clientDepositLedger.create({
      data: {
        id: e.id,
        userId: e.userId,
        kind: e.kind,
        amount: e.amount,
        note: e.note,
        counterparty: e.counterparty,
        txHash: e.txHash,
        createdAt: new Date(e.at),
      },
    });
    ledger += 1;
  }

  let fds = 0;
  for (const f of raw.fixedDeposits || []) {
    const exists = await prisma.clientFixedDeposit.findUnique({ where: { id: f.id } });
    if (exists) continue;
    const userOk = await prisma.user.findUnique({ where: { id: f.userId }, select: { id: true } });
    if (!userOk) continue;
    await prisma.clientFixedDeposit.create({
      data: {
        id: f.id,
        userId: f.userId,
        principal: f.principal,
        termDays: f.termDays,
        aprBps: f.aprBps,
        openedAt: new Date(f.openedAt),
        maturesAt: new Date(f.maturesAt),
        status: f.status,
        penaltyBps: f.penaltyBps,
      },
    });
    fds += 1;
  }

  return { accounts, ledger, fds };
}

export async function importLegacyFacilitiesJson(): Promise<{
  interbank: number;
  upward: number;
}> {
  const prisma = getPrisma();
  if (!prisma) return { interbank: 0, upward: 0 };
  const file = path.join(DATA_DIR, "facilities-ops.json");
  if (!fs.existsSync(file)) return { interbank: 0, upward: 0 };

  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as {
    interbankLoans?: Array<{
      id: string;
      borrowerBankId: string;
      lenderBankId: string;
      amountUsdc: number;
      tenorDays: number;
      aprBps: number;
      status: string;
      createdAt: string;
      createdBy: string;
      fundedAt?: string;
      repaidAt?: string;
      dueAt?: string;
      note?: string;
    }>;
    upwardDeposits?: Array<{
      id: string;
      fromBankId: string;
      toBankId: string;
      amountUsdc: number;
      createdAt: string;
      createdBy: string;
      note?: string;
    }>;
  };

  let interbank = 0;
  for (const l of raw.interbankLoans || []) {
    const exists = await prisma.opsInterbankLoan.findUnique({ where: { id: l.id } });
    if (exists) continue;
    await prisma.opsInterbankLoan.create({
      data: {
        id: l.id,
        borrowerBankId: l.borrowerBankId,
        lenderBankId: l.lenderBankId,
        amountUsdc: l.amountUsdc,
        tenorDays: l.tenorDays,
        aprBps: l.aprBps,
        status: l.status,
        createdBy: l.createdBy,
        note: l.note,
        fundedAt: l.fundedAt ? new Date(l.fundedAt) : null,
        repaidAt: l.repaidAt ? new Date(l.repaidAt) : null,
        dueAt: l.dueAt ? new Date(l.dueAt) : null,
        createdAt: new Date(l.createdAt),
      },
    });
    interbank += 1;
  }

  let upward = 0;
  for (const d of raw.upwardDeposits || []) {
    const exists = await prisma.opsUpwardDeposit.findUnique({ where: { id: d.id } });
    if (exists) continue;
    await prisma.opsUpwardDeposit.create({
      data: {
        id: d.id,
        fromBankId: d.fromBankId,
        toBankId: d.toBankId,
        amountUsdc: d.amountUsdc,
        createdBy: d.createdBy,
        note: d.note,
        createdAt: new Date(d.createdAt),
      },
    });
    upward += 1;
  }

  return { interbank, upward };
}

export async function importLegacyJsonStores(): Promise<void> {
  requirePrisma();
  const dep = await importLegacyDepositsJson();
  const fac = await importLegacyFacilitiesJson();
  if (dep.accounts || dep.ledger || dep.fds || fac.interbank || fac.upward) {
    // eslint-disable-next-line no-console
    console.info(
      `[migrate] imported deposits accounts=${dep.accounts} ledger=${dep.ledger} fds=${dep.fds}; facilities ib=${fac.interbank} up=${fac.upward}`,
    );
  }
}
