import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import {
  computeBorrowingLimits,
  db,
  findBankById,
  findUserById,
} from "../store/db";
import {
  findUserByIdPg,
  isEmailTakenPg,
  updateUserPg,
  type AppUser,
} from "../db/users";
import { countUnread } from "../db/notifications";
import { getPrisma } from "../db/prisma";
import { ensureDepositAccount, listFixedDeposits } from "../db/clientDeposits";

export const profileRouter = Router();

const defaultPrefs = {
  email: true,
  push: false,
  inApp: true,
  categories: {
    loan: true,
    kyc: true,
    payment: true,
    agent: true,
    chat: true,
    system: true,
  },
};

function serializeUser(user: AppUser) {
  return {
    ...user,
    notificationPrefs: user.notificationPrefs ?? defaultPrefs,
  };
}

async function profilePayload(user: AppUser) {
  const bank = user.bankId ? findBankById(user.bankId) : null;
  const parentBank = bank?.parentBankId ? findBankById(bank.parentBankId) : null;

  const incomeProof =
    db.state.incomeProofs
      .filter((p) => p.userId === user.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] ?? null;

  const txs = db.state.transactions
    .filter((t) => t.userId === user.id)
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 25);

  let limits = null;
  if (user.role === "BORROWER") {
    try {
      limits = computeBorrowingLimits(user.id);
    } catch {
      limits = null;
    }
  }

  let unreadCount = 0;
  try {
    unreadCount = await countUnread(user.id);
  } catch {
    unreadCount = 0;
  }

  return {
    user: serializeUser(user),
    bank,
    parentBank,
    limits,
    transactions: txs,
    unreadCount,
    incomeVerification: incomeProof
      ? {
          status: incomeProof.status,
          fileName: incomeProof.fileName,
          monthlyIncomeUsd: incomeProof.monthlyIncomeUsd ?? null,
          reviewedAt: incomeProof.reviewedAt,
          notes: incomeProof.notes,
          createdAt: incomeProof.createdAt,
        }
      : { status: "UNSUBMITTED" },
  };
}

profileRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const sessionUser = (req as AuthedRequest).user!;
    const user = (await findUserByIdPg(sessionUser.id)) ?? sessionUser;
    res.json(await profilePayload(user));
  } catch (err) {
    next(err);
  }
});

/** Retail client home aggregate (Section C). */
profileRouter.get("/home", requireAuth, async (req, res, next) => {
  try {
    const sessionUser = (req as AuthedRequest).user!;
    const user = (await findUserByIdPg(sessionUser.id)) ?? sessionUser;
    const base = await profilePayload(user);

    const loans = db.state.loans.filter((l) => l.borrowerId === user.id);
    const active = loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
    const outstanding = active.reduce((acc, l) => {
      const unpaid = l.installments
        .filter((i) => !i.paid)
        .reduce((s, i) => s + i.amount, 0);
      return acc + (unpaid > 0 ? unpaid : l.amount);
    }, 0);

    let nextPayment: { dueDate: string; amount: number; loanId: string } | null = null;
    for (const loan of active) {
      for (const inst of loan.installments) {
        if (inst.paid) continue;
        if (!nextPayment || inst.dueDate < nextPayment.dueDate) {
          nextPayment = { dueDate: inst.dueDate, amount: inst.amount, loanId: loan.id };
        }
      }
    }

    let credit: {
      creditScore?: number;
      riskTier?: string;
      available?: boolean;
    } = { available: false };
    try {
      const prisma = getPrisma();
      if (prisma) {
        const borrower = await prisma.borrower.findUnique({
          where: { walletAddress: user.wallet.toLowerCase() },
          include: { creditPassport: true },
        });
        if (borrower?.creditPassport) {
          credit = {
            available: true,
            creditScore: borrower.creditPassport.creditScore,
            riskTier: borrower.creditPassport.riskTier,
          };
        }
      }
    } catch {
      /* optional */
    }

    res.json({
      ...base,
      loans: {
        activeCount: active.length,
        outstandingEth: outstanding,
        nextPayment,
        totalLifetime: loans.length,
      },
      savings: await (async () => {
        try {
          const acct = await ensureDepositAccount(user.id);
          const fds = await listFixedDeposits(user.id);
          const activeFd = fds.filter(
            (f) => f.status === "ACTIVE" || f.status === "MATURED",
          );
          return {
            vaultEth: acct.vaultUsdc,
            fixedDepositEth: activeFd.reduce((s, f) => s + f.principal, 0),
            checkingEth: acct.checkingUsdc,
            stub: false,
          };
        } catch {
          return {
            vaultEth: 0,
            fixedDepositEth: 0,
            checkingEth: 0,
            stub: true,
          };
        }
      })(),
      credit,
      kyc: {
        kyc1Status: user.kyc1Status ?? "NOT_STARTED",
        kyc2Status: user.kyc2Status ?? "NOT_STARTED",
        kyc2Skipped: Boolean(user.kyc2Skipped),
        onboardingComplete: Boolean(user.onboardingComplete),
      },
    });
  } catch (err) {
    next(err);
  }
});

const prefsSchema = z
  .object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    inApp: z.boolean().optional(),
    categories: z
      .object({
        loan: z.boolean().optional(),
        kyc: z.boolean().optional(),
        payment: z.boolean().optional(),
        agent: z.boolean().optional(),
        chat: z.boolean().optional(),
        system: z.boolean().optional(),
      })
      .optional(),
  })
  .passthrough();

const updateSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().min(8).max(32).optional(),
  country: z.string().min(2).max(64).optional(),
  notificationPrefs: prefsSchema.optional(),
});

profileRouter.put("/", requireAuth, async (req, res, next) => {
  try {
    const sessionUser = (req as AuthedRequest).user!;
    const body = updateSchema.parse(req.body);

    if (body.email) {
      const taken = await isEmailTakenPg(body.email.trim().toLowerCase(), sessionUser.id);
      if (taken) {
        res.status(409).json({ error: "duplicate_email", message: "Email already registered" });
        return;
      }
    }

    const updated = await updateUserPg(sessionUser.id, {
      ...(body.displayName !== undefined ? { displayName: body.displayName.trim() } : {}),
      ...(body.email !== undefined ? { email: body.email.trim().toLowerCase() } : {}),
      ...(body.phone !== undefined ? { phone: body.phone.trim() } : {}),
      ...(body.country !== undefined ? { country: body.country.trim() } : {}),
      ...(body.notificationPrefs !== undefined
        ? {
            notificationPrefs: body.notificationPrefs as Prisma.InputJsonValue,
          }
        : {}),
      ...(body.displayName || body.email || body.country || body.phone
        ? { isFirstTime: false }
        : {}),
    });

    (req as AuthedRequest).user = updated;
    res.json({ ok: true, user: serializeUser(updated) });
  } catch (err) {
    next(err);
  }
});

profileRouter.get("/limits", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  if (user.role !== "BORROWER") {
    res.status(400).json({ error: "not_a_borrower" });
    return;
  }
  res.json(computeBorrowingLimits(user.id));
});

profileRouter.get("/users/:id", requireAuth, async (req, res) => {
  const id = String(req.params.id);
  const fromPg = await findUserByIdPg(id);
  const u = fromPg ?? findUserById(id);
  if (!u) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({
    id: u.id,
    displayName: u.displayName,
    wallet: u.wallet,
    role: u.role,
    bankId: u.bankId,
  });
});
