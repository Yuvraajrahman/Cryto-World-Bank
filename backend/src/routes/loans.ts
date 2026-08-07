import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import {
  buildInstallmentSchedule,
  computeBorrowingLimits,
  db,
  findBankById,
  findUserById,
  Loan,
} from "../store/db";
import { DEFAULT_MAX_LTV_BPS } from "../lib/rates";

export const loansRouter = Router();

// ---------- Read paths ----------

loansRouter.get("/mine", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const loans = db.state.loans
    .filter((l) => l.borrowerId === user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({ loans });
});

// Unified queue:
//  - APPROVER / LOCAL_BANK_ADMIN → pending BORROWER requests to their local bank
//  - NATIONAL_BANK_ADMIN → pending LOCAL_FROM_NATIONAL requests funded by their NB
//  - OWNER → pending NATIONAL_FROM_WORLD requests
loansRouter.get("/queue", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  let loans: Loan[] = [];
  if (user.role === "APPROVER" || user.role === "LOCAL_BANK_ADMIN") {
    loans = db.state.loans.filter(
      (l) =>
        l.kind === "BORROWER" &&
        l.status === "PENDING" &&
        l.lenderBankId === user.bankId,
    );
  } else if (user.role === "NATIONAL_BANK_ADMIN") {
    loans = db.state.loans.filter(
      (l) =>
        l.status === "PENDING" &&
        l.lenderBankId === user.bankId &&
        (l.kind === "LOCAL_FROM_NATIONAL" || l.kind === "BORROWER"),
    );
  } else if (user.role === "OWNER" || user.role === "DEV_ADMIN") {
    loans = db.state.loans.filter(
      (l) =>
        l.status === "PENDING" &&
        (l.kind === "NATIONAL_FROM_WORLD" ||
          (l.kind === "BORROWER" && findBankById(l.lenderBankId)?.tier === "WORLD")),
    );
  }
  res.json({ loans });
});

loansRouter.get("/bank/:bankId", requireAuth, (req, res) => {
  const bank = findBankById(String(req.params.bankId));
  if (!bank) {
    res.status(404).json({ error: "bank_not_found" });
    return;
  }
  const status = String(req.query.status || "").toUpperCase();
  let loans = db.state.loans.filter((l) => l.lenderBankId === bank.id);
  if (status) loans = loans.filter((l) => l.status === status);
  loans = loans.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({
    loans,
    unit: "USDC",
    summary: {
      pending: loans.filter((l) => l.status === "PENDING" || l.status === "INFO_REQUESTED").length,
      active: loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED").length,
      activeValueUsdc: loans
        .filter((l) => l.status === "ACTIVE" || l.status === "APPROVED")
        .reduce((s, l) => s + l.amount, 0),
    },
  });
});

/**
 * Lenders available for the signed-in role (categorized).
 * Clients: LOCAL + NATIONAL only (never WORLD).
 * Local staff: parent NATIONAL.
 * National admin: WORLD.
 */
loansRouter.get("/lenders", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const minR = 0.15;

  function enrich(b: (typeof db.state.banks)[0]) {
    const allocated = Math.max(b.totalAllocated || 0, b.reserve + (b.totalLent || 0), 1);
    const availableToLend = Math.max(0, b.reserve - allocated * minR);
    const activeLoans = db.state.loans.filter(
      (l) => l.lenderBankId === b.id && (l.status === "ACTIVE" || l.status === "APPROVED"),
    );
    return {
      id: b.id,
      name: b.name,
      tier: b.tier,
      jurisdiction: b.jurisdiction,
      city: b.city,
      parentBankId: b.parentBankId,
      reserveUsdc: b.reserve,
      totalLentUsdc: b.totalLent,
      availableToLendUsdc: availableToLend,
      lendingPoolUsdc: b.reserve,
      activeLoanCount: activeLoans.length,
      activeLoanValueUsdc: activeLoans.reduce((s, l) => s + l.amount, 0),
      aprBps: b.aprBps,
      status: b.status || "ACTIVE",
    };
  }

  if (user.role === "BORROWER") {
    const locals = db.state.banks.filter((b) => b.tier === "LOCAL" && (b.status || "ACTIVE") === "ACTIVE");
    const nationals = db.state.banks.filter(
      (b) => b.tier === "NATIONAL" && (b.status || "ACTIVE") === "ACTIVE",
    );
    res.json({
      unit: "USDC",
      requesterRole: user.role,
      allowedTiers: ["LOCAL", "NATIONAL"],
      note: "Clients may only request from Local or National banks — not World Bank.",
      categories: {
        LOCAL: locals.map(enrich),
        NATIONAL: nationals.map(enrich),
        WORLD: [],
      },
    });
    return;
  }

  if (user.role === "LOCAL_BANK_ADMIN" || user.role === "APPROVER") {
    const lb = user.bankId ? findBankById(user.bankId) : null;
    const parent = lb?.parentBankId ? findBankById(lb.parentBankId) : null;
    res.json({
      unit: "USDC",
      requesterRole: user.role,
      allowedTiers: ["NATIONAL"],
      note: "Local banks request liquidity from their parent National bank.",
      categories: {
        LOCAL: [],
        NATIONAL: parent ? [enrich(parent)] : [],
        WORLD: [],
      },
      requesterBank: lb ? enrich(lb) : null,
    });
    return;
  }

  if (user.role === "NATIONAL_BANK_ADMIN") {
    const world = db.state.banks.find((b) => b.tier === "WORLD");
    const nb = user.bankId ? findBankById(user.bankId) : null;
    res.json({
      unit: "USDC",
      requesterRole: user.role,
      allowedTiers: ["WORLD"],
      note: "National banks request liquidity from World Bank.",
      categories: {
        LOCAL: [],
        NATIONAL: [],
        WORLD: world ? [enrich(world)] : [],
      },
      requesterBank: nb ? enrich(nb) : null,
    });
    return;
  }

  res.status(403).json({
    error: "forbidden",
    message: "World Bank does not request loans downward; clients cannot borrow from World.",
  });
});

loansRouter.get("/:id", requireAuth, (req, res) => {
  const loan = db.state.loans.find((l) => l.id === req.params.id);
  if (!loan) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const user = (req as AuthedRequest).user!;
  const isOwner = loan.borrowerId === user.id;
  const isStaff =
    user.role === "OWNER" ||
    user.role === "APPROVER" ||
    user.role === "LOCAL_BANK_ADMIN" ||
    user.role === "NATIONAL_BANK_ADMIN";
  if (!isOwner && !isStaff) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const borrower = loan.borrowerId ? findUserById(loan.borrowerId) : null;
  const bank = findBankById(loan.lenderBankId);
  const requesterBank = loan.bankRequesterId ? findBankById(loan.bankRequesterId) : null;
  const transactions = db.state.transactions
    .filter((t) => t.loanId === loan.id)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  res.json({ loan, borrower, bank, requesterBank, transactions });
});

// ---------- Create: borrower loan request ----------

const loanCreateSchema = z.object({
  amount: z.number().positive().max(1_000_000_000),
  termMonths: z.number().int().min(1).max(60),
  installmentCount: z.number().int().min(1).max(60).optional(),
  purpose: z.string().min(5).max(500),
  /** Preferred: lender bank id (LOCAL or NATIONAL for clients). */
  lenderBankId: z.string().min(1).optional(),
  /** Legacy alias — same as lenderBankId. */
  localBankId: z.string().min(1).optional(),
  category: z.string().max(60).optional(),
  loanType: z.enum(["collateral", "credit"]).default("credit"),
  collateralEth: z.number().nonnegative().max(10_000).optional(),
  ltvBps: z.number().int().min(1).max(10_000).optional(),
  /** When true, skip approval (dev only). Default false for staged approval flow. */
  autoActivate: z.boolean().optional().default(false),
});

loansRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (user.role !== "BORROWER") {
      res.status(403).json({ error: "not_a_borrower" });
      return;
    }
    if (user.frozen) {
      res.status(403).json({ error: "account_frozen" });
      return;
    }
    const body = loanCreateSchema.parse(req.body);
    const lenderId = body.lenderBankId || body.localBankId;
    if (!lenderId) {
      res.status(400).json({ error: "lender_required" });
      return;
    }
    const bank = findBankById(lenderId);
    // Clients may borrow from Local or National — never World
    if (!bank || (bank.tier !== "LOCAL" && bank.tier !== "NATIONAL")) {
      res.status(400).json({
        error: "invalid_bank",
        message: "Select a Local or National bank. Clients cannot borrow directly from World Bank.",
      });
      return;
    }
    if ((bank.status || "ACTIVE") === "PAUSED") {
      res.status(400).json({ error: "bank_paused" });
      return;
    }

    if (body.loanType === "collateral") {
      const collateral = body.collateralEth ?? 0;
      if (collateral <= 0) {
        res.status(400).json({ error: "collateral_required" });
        return;
      }
      const ltvBps = body.ltvBps ?? DEFAULT_MAX_LTV_BPS;
      const maxBorrow = (collateral * ltvBps) / 10_000;
      if (body.amount > maxBorrow + 1e-9) {
        res.status(400).json({ error: "exceeds_ltv", maxBorrow, ltvBps });
        return;
      }
    }

    const existingPending = db.state.loans.find(
      (l) =>
        l.borrowerId === user.id &&
        l.lenderBankId === bank.id &&
        l.status === "PENDING",
    );
    if (existingPending) {
      res.status(400).json({ error: "existing_pending_request_to_bank" });
      return;
    }

    const limits = computeBorrowingLimits(user.id);
    if (body.amount > limits.sixMonth.remaining) {
      res.status(400).json({ error: "exceeds_six_month_limit", limits });
      return;
    }
    if (body.amount > limits.oneYear.remaining) {
      res.status(400).json({ error: "exceeds_one_year_limit", limits });
      return;
    }
    if (limits.activeLoanCount >= limits.maxActiveLoans) {
      res.status(400).json({ error: "active_loan_cap", limits });
      return;
    }
    if (body.amount > bank.reserve) {
      res.status(400).json({ error: "insufficient_bank_reserve", reserveUsdc: bank.reserve });
      return;
    }

    const installmentCount = body.installmentCount ?? body.termMonths;
    const gasCostEth = Number((0.002 + Math.random() * 0.003).toFixed(5));
    const shouldActivate = body.autoActivate === true;

    const loan: Loan = {
      id: db.uid("loan"),
      kind: "BORROWER",
      borrowerId: user.id,
      lenderBankId: bank.id,
      amount: body.amount,
      purpose: body.purpose,
      category: body.category ?? (body.loanType === "collateral" ? "Collateral" : "Credit"),
      loanType: body.loanType,
      collateralEth: body.collateralEth,
      ltvBps: body.ltvBps,
      aprBps: bank.aprBps,
      termMonths: body.termMonths,
      status: "PENDING",
      isInstallment: true,
      installments: [],
      gasCostEth,
      createdAt: db.nowIso(),
      txHash: `0x${crypto.randomBytes(16).toString("hex")}`,
      riskScore: body.loanType === "credit" ? 0.22 + Math.random() * 0.2 : 0.15 + Math.random() * 0.15,
    };

    if (shouldActivate) {
      loan.installments = buildInstallmentSchedule(loan.amount, loan.termMonths, installmentCount);
      loan.deadline = loan.installments[loan.installments.length - 1]?.dueDate;
      loan.status = "ACTIVE";
      loan.approvedAt = db.nowIso();
      loan.approvedBy = "system_auto";
      bank.reserve -= loan.amount;
      bank.totalLent += loan.amount;
      user.totalBorrowedLifetime += loan.amount;
      user.isFirstTime = false;
      db.state.transactions.push({
        id: db.uid("tx"),
        type: "LOAN_APPROVED",
        userId: user.id,
        bankId: bank.id,
        loanId: loan.id,
        amount: loan.amount,
        at: db.nowIso(),
        txHash: loan.txHash,
        note: "Auto-activated (dev)",
      });
      db.state.transactions.push({
        id: db.uid("tx"),
        type: "LOAN_DISBURSED",
        userId: user.id,
        bankId: bank.id,
        loanId: loan.id,
        amount: loan.amount,
        at: db.nowIso(),
        txHash: loan.txHash,
      });
      try {
        const { persistBankCapital } = await import("../db/banksSync");
        await persistBankCapital(bank.id);
      } catch {
        /* best-effort */
      }
    }

    db.state.loans.push(loan);
    db.save();

    try {
      const { createNotification } = await import("../db/notifications");
      await createNotification({
        userId: user.id,
        category: "loan",
        title: shouldActivate ? "Loan disbursed" : "Loan request submitted",
        body: shouldActivate
          ? `Your ${loan.amount} USDC ${loan.loanType} loan is active.`
          : `Your ${loan.amount} USDC request to ${bank.name} is pending review.`,
        href: `/app/loans/${loan.id}`,
      });
      if (!shouldActivate) {
        const staff = db.state.users.filter((u) => {
          if (u.bankId !== bank.id) return false;
          if (bank.tier === "NATIONAL") return u.role === "NATIONAL_BANK_ADMIN";
          return u.role === "LOCAL_BANK_ADMIN" || u.role === "APPROVER";
        });
        await Promise.all(
          staff.map((s) =>
            createNotification({
              userId: s.id,
              category: "loan",
              title: bank.tier === "NATIONAL" ? "Client loan request" : "Loan request",
              body: `${user.displayName || "Client"} requested ${loan.amount} USDC (${loan.loanType}).`,
              href:
                bank.tier === "NATIONAL"
                  ? `/bank/national/approvals/${loan.id}`
                  : `/bank/local/approvals/${loan.id}`,
            }),
          ),
        );
      }
    } catch {
      /* notifications optional if DB down */
    }

    res.status(201).json({ ok: true, loan, unit: "USDC", lender: { id: bank.id, tier: bank.tier, name: bank.name } });
  } catch (err) {
    next(err);
  }
});

// ---------- Approve ----------

const approveSchema = z.object({
  termMonths: z.number().int().min(1).max(60).optional(),
  note: z.string().max(500).optional(),
});

loansRouter.post(
  "/:id/approve",
  requireAuth,
  requireRoles("APPROVER", "LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER", "DEV_ADMIN"),
  async (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const loan = db.state.loans.find((l) => l.id === req.params.id);
      if (!loan) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      if (loan.status !== "PENDING" && loan.status !== "INFO_REQUESTED") {
        res.status(400).json({ error: "not_pending" });
        return;
      }
      const body = approveSchema.parse(req.body ?? {});

      const lenderBank = findBankById(loan.lenderBankId);
      if (!lenderBank) {
        res.status(500).json({ error: "lender_bank_missing" });
        return;
      }

      const isSuper = user.role === "OWNER" || user.role === "DEV_ADMIN";
      if (loan.kind === "BORROWER") {
        const okLocal =
          (user.role === "APPROVER" || user.role === "LOCAL_BANK_ADMIN") &&
          user.bankId === lenderBank.id &&
          lenderBank.tier === "LOCAL";
        const okNational =
          user.role === "NATIONAL_BANK_ADMIN" &&
          user.bankId === lenderBank.id &&
          lenderBank.tier === "NATIONAL";
        if (!okLocal && !okNational && !isSuper) {
          res.status(403).json({ error: "forbidden" });
          return;
        }
      }
      if (loan.kind === "LOCAL_FROM_NATIONAL") {
        if (
          !(user.role === "NATIONAL_BANK_ADMIN" && user.bankId === lenderBank.id) &&
          !isSuper
        ) {
          res.status(403).json({ error: "forbidden" });
          return;
        }
      }
      if (loan.kind === "NATIONAL_FROM_WORLD") {
        if (user.role !== "OWNER" && user.role !== "DEV_ADMIN") {
          res.status(403).json({ error: "forbidden" });
          return;
        }
      }

      if (loan.amount > lenderBank.reserve) {
        res.status(400).json({
          error: "insufficient_reserve",
          reserveUsdc: lenderBank.reserve,
          requiredUsdc: loan.amount,
        });
        return;
      }

      const termMonths = body.termMonths ?? loan.termMonths;
      loan.termMonths = termMonths;
      if (loan.isInstallment) {
        loan.installments = buildInstallmentSchedule(
          loan.amount,
          termMonths,
          loan.installments?.length || termMonths,
        );
        loan.deadline = loan.installments[loan.installments.length - 1].dueDate;
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() + termMonths);
        loan.deadline = d.toISOString();
      }
      loan.status = "ACTIVE";
      loan.approvedBy = user.id;
      loan.approvedAt = db.nowIso();

      lenderBank.reserve -= loan.amount;
      lenderBank.totalLent += loan.amount;

      if (loan.kind === "BORROWER" && loan.borrowerId) {
        const borrower = findUserById(loan.borrowerId);
        if (borrower) {
          borrower.totalBorrowedLifetime += loan.amount;
          borrower.isFirstTime = false;
        }
      } else if (loan.bankRequesterId) {
        const requester = findBankById(loan.bankRequesterId);
        if (requester) {
          requester.reserve += loan.amount;
        }
      }

      db.state.transactions.push({
        id: db.uid("tx"),
        type: "LOAN_APPROVED",
        userId: loan.borrowerId,
        bankId: loan.lenderBankId,
        loanId: loan.id,
        amount: loan.amount,
        at: db.nowIso(),
        txHash: loan.txHash,
        note: body.note,
      });
      db.state.transactions.push({
        id: db.uid("tx"),
        type: "LOAN_DISBURSED",
        userId: loan.borrowerId,
        bankId: loan.lenderBankId,
        loanId: loan.id,
        amount: loan.amount,
        at: db.nowIso(),
        txHash: loan.txHash,
      });
      db.save();

      try {
        const { persistBankCapital } = await import("../db/banksSync");
        await persistBankCapital(lenderBank.id);
        if (loan.bankRequesterId) await persistBankCapital(loan.bankRequesterId);
      } catch {
        /* best-effort PG sync */
      }

      res.json({
        ok: true,
        unit: "USDC",
        loan,
        lenderReserveUsdc: lenderBank.reserve,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ---------- Reject ----------

const rejectSchema = z.object({
  reason: z.string().min(3).max(500),
});

loansRouter.post(
  "/:id/reject",
  requireAuth,
  requireRoles("APPROVER", "LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"),
  (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const loan = db.state.loans.find((l) => l.id === req.params.id);
      if (!loan) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      if (loan.status !== "PENDING" && loan.status !== "INFO_REQUESTED") {
        res.status(400).json({ error: "not_pending" });
        return;
      }
      const body = rejectSchema.parse(req.body ?? {});
      loan.status = "REJECTED";
      loan.rejectedBy = user.id;
      loan.rejectedAt = db.nowIso();
      loan.rejectionReason = body.reason;
      res.json({ ok: true, loan });
    } catch (err) {
      next(err);
    }
  },
);

// ---------- Installment payment ----------

loansRouter.post("/:id/installments/:idx/pay", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const loan = db.state.loans.find((l) => l.id === req.params.id);
    if (!loan) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (loan.borrowerId !== user.id) {
      res.status(403).json({ error: "not_your_loan" });
      return;
    }
    const idx = Number(req.params.idx);
    const installment = loan.installments.find((i) => i.index === idx);
    if (!installment) {
      res.status(404).json({ error: "installment_not_found" });
      return;
    }
    if (installment.paid) {
      res.status(400).json({ error: "already_paid" });
      return;
    }
    installment.paid = true;
    installment.paidAt = db.nowIso();
    installment.txHash = `0x${crypto.randomBytes(16).toString("hex")}`;

    const bank = findBankById(loan.lenderBankId);
    if (bank) {
      bank.reserve += installment.amount;
      bank.totalRepaid += installment.amount;
    }

    db.state.transactions.push({
      id: db.uid("tx"),
      type: "INSTALLMENT_PAID",
      userId: user.id,
      bankId: loan.lenderBankId,
      loanId: loan.id,
      amount: installment.amount,
      at: db.nowIso(),
      txHash: installment.txHash,
      note: `Installment #${idx}`,
    });

    if (loan.installments.every((i) => i.paid)) {
      loan.status = "REPAID";
      loan.repaidAt = db.nowIso();
      user.consecutivePaidLoans += 1;
    }

    db.save();

    try {
      const { createNotification } = await import("../db/notifications");
      await createNotification({
        userId: user.id,
        category: "payment",
        title: "Installment paid",
        body: `Paid installment #${idx} (${installment.amount} ETH) on loan ${loan.id}.`,
        href: `/app/loans/${loan.id}`,
      });
    } catch {
      /* optional */
    }

    res.json({ ok: true, installment, loan });
  } catch (err) {
    next(err);
  }
});

// Single-payment repayment (for non-installment loans)
loansRouter.post("/:id/repay", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const loan = db.state.loans.find((l) => l.id === req.params.id);
  if (!loan) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (loan.borrowerId !== user.id) {
    res.status(403).json({ error: "not_your_loan" });
    return;
  }
  if (loan.isInstallment) {
    res.status(400).json({ error: "use_installment_payment" });
    return;
  }
  if (loan.status !== "ACTIVE" && loan.status !== "APPROVED") {
    res.status(400).json({ error: "not_active" });
    return;
  }
  loan.status = "REPAID";
  loan.repaidAt = db.nowIso();
  user.consecutivePaidLoans += 1;
  const bank = findBankById(loan.lenderBankId);
  if (bank) {
    bank.reserve += loan.amount;
    bank.totalRepaid += loan.amount;
  }
  db.state.transactions.push({
    id: db.uid("tx"),
    type: "LOAN_REPAID",
    userId: user.id,
    bankId: loan.lenderBankId,
    loanId: loan.id,
    amount: loan.amount,
    at: db.nowIso(),
    txHash: `0x${crypto.randomBytes(16).toString("hex")}`,
  });
  res.json({ ok: true, loan });
});

/** Settle remaining balance (Lab / testing) — marks installment or bullet loans REPAID. */
loansRouter.post("/:id/settle", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const loan = db.state.loans.find((l) => l.id === req.params.id);
  if (!loan) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (loan.borrowerId !== user.id && user.role !== "DEV_ADMIN" && user.role !== "OWNER") {
    res.status(403).json({ error: "not_your_loan" });
    return;
  }
  if (loan.status !== "ACTIVE" && loan.status !== "APPROVED" && loan.status !== "PENDING") {
    res.status(400).json({ error: "not_active", status: loan.status });
    return;
  }
  const wasActive = loan.status === "ACTIVE" || loan.status === "APPROVED";
  if (loan.installments?.length) {
    for (const inst of loan.installments) {
      if (!inst.paid) {
        inst.paid = true;
        inst.paidAt = db.nowIso();
      }
    }
  }
  const refund = wasActive ? loan.amount : 0;
  loan.status = "REPAID";
  loan.repaidAt = db.nowIso();
  if (wasActive) {
    user.consecutivePaidLoans += 1;
    const bank = findBankById(loan.lenderBankId);
    if (bank && refund > 0) {
      bank.reserve += refund;
      bank.totalRepaid += refund;
    }
  }
  db.state.transactions.push({
    id: db.uid("tx"),
    type: "LOAN_REPAID",
    userId: loan.borrowerId,
    bankId: loan.lenderBankId,
    loanId: loan.id,
    amount: loan.amount,
    note: "Settled in Lab",
    at: db.nowIso(),
    txHash: `0x${crypto.randomBytes(16).toString("hex")}`,
  });
  db.save();
  res.json({ ok: true, loan });
});

// ---------- Inter-bank hierarchical requests ----------

const bankBorrowSchema = z.object({
  amount: z.number().positive().max(1_000_000_000),
  purpose: z.string().min(5).max(500),
  termMonths: z.number().int().min(1).max(60),
  installmentCount: z.number().int().min(1).max(60).optional(),
  lenderBankId: z.string().min(1).optional(),
});

// LB → NB : a local bank admin borrows from its national bank
loansRouter.post(
  "/bank-request/local-from-national",
  requireAuth,
  requireRoles("LOCAL_BANK_ADMIN", "APPROVER"),
  (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const body = bankBorrowSchema.parse(req.body);
      const lb = user.bankId ? findBankById(user.bankId) : null;
      if (!lb || !lb.parentBankId) {
        res.status(400).json({ error: "no_parent_bank" });
        return;
      }
      const lenderId = body.lenderBankId || lb.parentBankId;
      const lender = findBankById(lenderId);
      if (!lender || lender.tier !== "NATIONAL" || lender.id !== lb.parentBankId) {
        res.status(400).json({ error: "invalid_lender", message: "Must request from parent National bank." });
        return;
      }
      if (body.amount > lender.reserve) {
        res.status(400).json({ error: "insufficient_bank_reserve", reserveUsdc: lender.reserve });
        return;
      }
      const count = body.installmentCount ?? body.termMonths;
      const loan: Loan = {
        id: db.uid("loan_lbnb"),
        kind: "LOCAL_FROM_NATIONAL",
        bankRequesterId: lb.id,
        lenderBankId: lender.id,
        amount: body.amount,
        purpose: body.purpose,
        aprBps: lender.aprBps || 500,
        termMonths: body.termMonths,
        status: "PENDING",
        isInstallment: true,
        installments: Array.from({ length: count }, (_, i) => ({
          index: i + 1,
          amount: 0,
          dueDate: "",
          paid: false,
        })),
        createdAt: db.nowIso(),
      };
      db.state.loans.push(loan);
      db.save();
      res.status(201).json({ ok: true, loan, unit: "USDC" });
    } catch (err) {
      next(err);
    }
  },
);

// NB → WB : a national bank admin borrows from the world bank
loansRouter.post(
  "/bank-request/national-from-world",
  requireAuth,
  requireRoles("NATIONAL_BANK_ADMIN"),
  (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const body = bankBorrowSchema.parse(req.body);
      const nb = user.bankId ? findBankById(user.bankId) : null;
      const world = db.state.banks.find((b) => b.tier === "WORLD");
      if (!nb || !world) {
        res.status(400).json({ error: "not_a_national_bank" });
        return;
      }
      if (body.lenderBankId && body.lenderBankId !== world.id) {
        res.status(400).json({ error: "invalid_lender", message: "National banks may only request from World Bank." });
        return;
      }
      if (body.amount > world.reserve) {
        res.status(400).json({ error: "insufficient_bank_reserve", reserveUsdc: world.reserve });
        return;
      }
      const count = body.installmentCount ?? body.termMonths;
      const loan: Loan = {
        id: db.uid("loan_nbwb"),
        kind: "NATIONAL_FROM_WORLD",
        bankRequesterId: nb.id,
        lenderBankId: world.id,
        amount: body.amount,
        purpose: body.purpose,
        aprBps: world.aprBps || 300,
        termMonths: body.termMonths,
        status: "PENDING",
        isInstallment: true,
        installments: Array.from({ length: count }, (_, i) => ({
          index: i + 1,
          amount: 0,
          dueDate: "",
          paid: false,
        })),
        createdAt: db.nowIso(),
      };
      db.state.loans.push(loan);
      db.save();
      res.status(201).json({ ok: true, loan, unit: "USDC" });
    } catch (err) {
      next(err);
    }
  },
);
