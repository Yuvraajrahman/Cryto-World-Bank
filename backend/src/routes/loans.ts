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
        l.kind === "LOCAL_FROM_NATIONAL" &&
        l.status === "PENDING" &&
        l.lenderBankId === user.bankId,
    );
  } else if (user.role === "OWNER") {
    loans = db.state.loans.filter(
      (l) => l.kind === "NATIONAL_FROM_WORLD" && l.status === "PENDING",
    );
  }
  res.json({ loans });
});

// Lists loans for a bank (lent/funded). Restricted to bank staff or owner.
loansRouter.get("/bank/:bankId", requireAuth, (req, res) => {
  const bank = findBankById(String(req.params.bankId));
  if (!bank) {
    res.status(404).json({ error: "bank_not_found" });
    return;
  }
  const loans = db.state.loans
    .filter((l) => l.lenderBankId === bank.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({ loans });
});

loansRouter.get("/:id", requireAuth, (req, res) => {
  const loan = db.state.loans.find((l) => l.id === req.params.id);
  if (!loan) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const borrower = loan.borrowerId ? findUserById(loan.borrowerId) : null;
  const bank = findBankById(loan.lenderBankId);
  const requesterBank = loan.bankRequesterId ? findBankById(loan.bankRequesterId) : null;
  res.json({ loan, borrower, bank, requesterBank });
});

// ---------- Create: borrower loan request ----------

const loanCreateSchema = z.object({
  amount: z.number().positive().max(500),
  termMonths: z.number().int().min(1).max(60),
  purpose: z.string().min(5).max(500),
  localBankId: z.string().min(1),
  category: z.string().max(60).optional(),
});

loansRouter.post("/", requireAuth, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (user.role !== "BORROWER") {
      res.status(403).json({ error: "not_a_borrower" });
      return;
    }
    const body = loanCreateSchema.parse(req.body);
    const bank = findBankById(body.localBankId);
    if (!bank || bank.tier !== "LOCAL") {
      res.status(400).json({ error: "invalid_bank" });
      return;
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
      res.status(400).json({ error: "insufficient_bank_reserve" });
      return;
    }
    if (user.isFirstTime) {
      const proof = db.state.incomeProofs
        .filter((p) => p.userId === user.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
      if (!proof) {
        res.status(400).json({ error: "income_proof_required" });
        return;
      }
    }

    const isInstallment = body.amount >= 100;
    const gasCostEth = Number((0.002 + Math.random() * 0.003).toFixed(5));
    const loan: Loan = {
      id: db.uid("loan"),
      kind: "BORROWER",
      borrowerId: user.id,
      lenderBankId: bank.id,
      amount: body.amount,
      purpose: body.purpose,
      category: body.category,
      aprBps: bank.aprBps,
      termMonths: body.termMonths,
      status: "PENDING",
      isInstallment,
      installments: [],
      gasCostEth,
      createdAt: db.nowIso(),
      txHash: `0x${crypto.randomBytes(16).toString("hex")}`,
    };
    db.state.loans.push(loan);
    res.status(201).json({ ok: true, loan });
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
  requireRoles("APPROVER", "LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"),
  (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const loan = db.state.loans.find((l) => l.id === req.params.id);
      if (!loan) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      if (loan.status !== "PENDING") {
        res.status(400).json({ error: "not_pending" });
        return;
      }
      const body = approveSchema.parse(req.body ?? {});

      // Role-vs-loan kind authorization
      const lenderBank = findBankById(loan.lenderBankId);
      if (!lenderBank) {
        res.status(500).json({ error: "lender_bank_missing" });
        return;
      }
      if (loan.kind === "BORROWER") {
        if (
          !(
            user.role === "APPROVER" ||
            user.role === "LOCAL_BANK_ADMIN"
          ) ||
          user.bankId !== lenderBank.id
        ) {
          res.status(403).json({ error: "forbidden" });
          return;
        }
      }
      if (loan.kind === "LOCAL_FROM_NATIONAL") {
        if (user.role !== "NATIONAL_BANK_ADMIN" || user.bankId !== lenderBank.id) {
          res.status(403).json({ error: "forbidden" });
          return;
        }
      }
      if (loan.kind === "NATIONAL_FROM_WORLD") {
        if (user.role !== "OWNER") {
          res.status(403).json({ error: "forbidden" });
          return;
        }
      }

      if (loan.amount > lenderBank.reserve) {
        res.status(400).json({ error: "insufficient_reserve" });
        return;
      }

      const termMonths = body.termMonths ?? loan.termMonths;
      loan.termMonths = termMonths;
      if (loan.isInstallment) {
        loan.installments = buildInstallmentSchedule(loan.amount, termMonths);
        loan.deadline = loan.installments[loan.installments.length - 1].dueDate;
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() + termMonths);
        loan.deadline = d.toISOString();
      }
      loan.status = "ACTIVE";
      loan.approvedBy = user.id;
      loan.approvedAt = db.nowIso();

      // Fund movement
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

      res.json({ ok: true, loan });
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
      if (loan.status !== "PENDING") {
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

loansRouter.post("/:id/installments/:idx/pay", requireAuth, (req, res) => {
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

  // If all paid, mark REPAID and tick consecutive count.
  if (loan.installments.every((i) => i.paid)) {
    loan.status = "REPAID";
    loan.repaidAt = db.nowIso();
    user.consecutivePaidLoans += 1;
  }

  res.json({ ok: true, installment, loan });
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

// ---------- Inter-bank hierarchical requests ----------

const bankBorrowSchema = z.object({
  amount: z.number().positive().max(5000),
  purpose: z.string().min(5).max(500),
  termMonths: z.number().int().min(1).max(60),
});

// LB → NB : a local bank admin borrows from its national bank
loansRouter.post(
  "/bank-request/local-from-national",
  requireAuth,
  requireRoles("LOCAL_BANK_ADMIN"),
  (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const body = bankBorrowSchema.parse(req.body);
      const lb = user.bankId ? findBankById(user.bankId) : null;
      if (!lb || !lb.parentBankId) {
        res.status(400).json({ error: "no_parent_bank" });
        return;
      }
      const loan: Loan = {
        id: db.uid("loan_lbnb"),
        kind: "LOCAL_FROM_NATIONAL",
        bankRequesterId: lb.id,
        lenderBankId: lb.parentBankId,
        amount: body.amount,
        purpose: body.purpose,
        aprBps: 500,
        termMonths: body.termMonths,
        status: "PENDING",
        isInstallment: body.amount >= 100,
        installments: [],
        createdAt: db.nowIso(),
      };
      db.state.loans.push(loan);
      res.status(201).json({ ok: true, loan });
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
      const loan: Loan = {
        id: db.uid("loan_nbwb"),
        kind: "NATIONAL_FROM_WORLD",
        bankRequesterId: nb.id,
        lenderBankId: world.id,
        amount: body.amount,
        purpose: body.purpose,
        aprBps: 300,
        termMonths: body.termMonths,
        status: "PENDING",
        isInstallment: body.amount >= 100,
        installments: [],
        createdAt: db.nowIso(),
      };
      db.state.loans.push(loan);
      res.status(201).json({ ok: true, loan });
    } catch (err) {
      next(err);
    }
  },
);
