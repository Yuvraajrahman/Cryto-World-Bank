import type {
  AccountIntent,
  KycSubmissionStatus,
  Prisma,
  User as PrismaUser,
  UserRole,
} from "@prisma/client";
import { requirePrisma } from "./prisma";
import {
  findUserById,
  findUserByWallet,
  type AccountIntent as MemAccountIntent,
  type KycStatus,
  type User,
  type UserRole as MemUserRole,
  db,
} from "../store/db";

export type AppUser = User;

function iso(d: Date | null | undefined): string | undefined {
  return d ? d.toISOString() : undefined;
}

function dateOnly(d: Date | null | undefined): string | undefined {
  if (!d) return undefined;
  return d.toISOString().slice(0, 10);
}

/** Map Prisma User → API / memory User shape used by routes. */
export function toAppUser(row: PrismaUser): AppUser {
  const consent =
    row.consentRisk != null && row.consentData != null && row.consentAgent != null
      ? {
          risk: Boolean(row.consentRisk),
          data: Boolean(row.consentData),
          agent: Boolean(row.consentAgent),
          consentedAt: iso(row.consentedAt) ?? new Date().toISOString(),
        }
      : undefined;

  return {
    id: row.id,
    wallet: row.wallet,
    displayName: row.displayName ?? `${row.wallet.slice(0, 6)}…${row.wallet.slice(-4)}`,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    country: row.country ?? undefined,
    dateOfBirth: dateOnly(row.dateOfBirth),
    accountType: row.accountType as MemAccountIntent,
    role: row.role as MemUserRole,
    bankId: row.bankId ?? undefined,
    consecutivePaidLoans: row.consecutivePaidLoans,
    totalBorrowedLifetime: row.totalBorrowedLifetime,
    isFirstTime: row.isFirstTime,
    monthlyIncomeUsd: row.monthlyIncomeUsd ?? undefined,
    kyc1Status: row.kyc1Status as KycStatus,
    kyc1: {
      idFrontName: row.kyc1IdFrontName ?? undefined,
      idBackName: row.kyc1IdBackName ?? undefined,
      selfieName: row.kyc1SelfieName ?? undefined,
      docHash: row.kyc1DocHash ?? undefined,
      submittedAt: iso(row.kyc1SubmittedAt),
      rejectionReason: row.kyc1RejectionReason ?? undefined,
    },
    kyc2Status: row.kyc2Status as KycStatus,
    kyc2Skipped: row.kyc2Skipped,
    kyc2: {
      addressDocName: row.kyc2AddressDocName ?? undefined,
      incomeDocName: row.kyc2IncomeDocName ?? undefined,
      docHash: row.kyc2DocHash ?? undefined,
      submittedAt: iso(row.kyc2SubmittedAt),
      rejectionReason: row.kyc2RejectionReason ?? undefined,
    },
    consent,
    onboardingComplete: row.onboardingComplete,
    notificationPrefs:
      row.notificationPrefs && typeof row.notificationPrefs === "object"
        ? (row.notificationPrefs as Record<string, unknown>)
        : undefined,
    createdAt: iso(row.createdAt) ?? new Date().toISOString(),
  };
}

/** Keep legacy in-memory store in sync so loans/banks routes still resolve users by id. */
export function mirrorUserToMemory(user: AppUser): AppUser {
  const byId = findUserById(user.id);
  if (byId) {
    Object.assign(byId, user);
    db.save();
    return byId;
  }
  const byWallet = findUserByWallet(user.wallet);
  if (byWallet) {
    // Prefer Postgres id as source of truth for JWT subjects.
    const idx = db.state.users.findIndex((u) => u.id === byWallet.id);
    if (idx >= 0) {
      db.state.users[idx] = { ...user };
      db.save();
      return db.state.users[idx]!;
    }
  }
  db.state.users.push({ ...user });
  db.save();
  return user;
}

export async function findUserByIdPg(id: string): Promise<AppUser | null> {
  const prisma = requirePrisma();
  const row = await prisma.user.findUnique({ where: { id } });
  if (!row) return null;
  const app = toAppUser(row);
  mirrorUserToMemory(app);
  return app;
}

export async function findUserByWalletPg(wallet: string): Promise<AppUser | null> {
  const prisma = requirePrisma();
  const row = await prisma.user.findUnique({
    where: { wallet: wallet.toLowerCase() },
  });
  if (!row) return null;
  const app = toAppUser(row);
  mirrorUserToMemory(app);
  return app;
}

export async function upsertUserByWalletPg(
  wallet: string,
  overrides: {
    role?: MemUserRole;
    displayName?: string;
    email?: string;
    bankId?: string;
  } = {},
): Promise<AppUser> {
  const prisma = requirePrisma();
  const normalized = wallet.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { wallet: normalized } });
  if (existing) {
    const data: Prisma.UserUpdateInput = {};
    if (overrides.role) data.role = overrides.role as UserRole;
    if (overrides.displayName) data.displayName = overrides.displayName;
    if (overrides.email) data.email = overrides.email;
    if (overrides.bankId !== undefined) data.bankId = overrides.bankId;
    const row =
      Object.keys(data).length > 0
        ? await prisma.user.update({ where: { id: existing.id }, data })
        : existing;
    const app = toAppUser(row);
    mirrorUserToMemory(app);
    return app;
  }

  const row = await prisma.user.create({
    data: {
      wallet: normalized,
      displayName:
        overrides.displayName ?? `${normalized.slice(0, 6)}…${normalized.slice(-4)}`,
      role: (overrides.role ?? "BORROWER") as UserRole,
      email: overrides.email,
      bankId: overrides.bankId,
      isFirstTime: true,
      onboardingComplete: false,
    },
  });
  const app = toAppUser(row);
  mirrorUserToMemory(app);
  return app;
}

export async function updateUserPg(
  id: string,
  data: Prisma.UserUpdateInput,
): Promise<AppUser> {
  const prisma = requirePrisma();
  const row = await prisma.user.update({ where: { id }, data });
  const app = toAppUser(row);
  mirrorUserToMemory(app);
  return app;
}

export async function isEmailTakenPg(email: string, excludeUserId: string): Promise<boolean> {
  const prisma = requirePrisma();
  const row = await prisma.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      NOT: { id: excludeUserId },
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function writeAudit(
  eventType: string,
  actorId: string | undefined,
  payload: Prisma.InputJsonValue,
): Promise<void> {
  const prisma = requirePrisma();
  await prisma.auditLog.create({
    data: {
      eventType,
      actorId,
      actorType: actorId ? "USER" : undefined,
      payload,
    },
  });
}

export type { AccountIntent, KycSubmissionStatus };
