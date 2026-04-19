import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import {
  computeBorrowingLimits,
  db,
  findBankById,
  findUserById,
} from "../store/db";

export const profileRouter = Router();

profileRouter.get("/", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
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
    limits = computeBorrowingLimits(user.id);
  }

  res.json({
    user,
    bank,
    parentBank,
    limits,
    transactions: txs,
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
  });
});

const updateSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  email: z.string().email().max(200).optional(),
  country: z.string().min(2).max(64).optional(),
});

profileRouter.put("/", requireAuth, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = updateSchema.parse(req.body);
    Object.assign(user, body);
    res.json({ ok: true, user });
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

// Lightweight user lookup used by chat screens to hydrate participants.
profileRouter.get("/users/:id", requireAuth, (req, res) => {
  const u = findUserById(String(req.params.id));
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
