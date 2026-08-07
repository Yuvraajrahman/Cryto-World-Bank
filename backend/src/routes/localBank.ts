import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import {
  computeBorrowingLimits,
  db,
  findBankById,
  findUserById,
} from "../store/db";
import { localOpsDb, type AmlAlert, type BankStaffRecord } from "../store/localOps";
import { nationalOpsDb } from "../store/nationalOps";
import { getPrisma } from "../db/prisma";
import { findUserByIdPg, updateUserPg, writeAudit } from "../db/users";
import { applyAccountFreeze } from "../chain/freezeClient";
import { borrowAprFromUtilization, KINK_BPS } from "../lib/rates";
import { ethers } from "ethers";
import { config } from "../config";
import { getChainProvider } from "../chain/provider";
import { hydrateBankCapitalFromPrisma } from "../db/banksSync";

export const localBankRouter = Router();

const APPROVAL_QUEUE_STATUSES = new Set(["PENDING", "INFO_REQUESTED"]);

const adminOnly = ["LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"] as const;

localBankRouter.use(
  requireAuth,
  requireRoles("APPROVER", "LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER", "DEV_ADMIN"),
);

function bankIdFor(user: { bankId?: string; role: string }) {
  return user.bankId || "bank_lb_dhaka";
}

function enrichLoan(loan: (typeof db.state.loans)[0]) {
  const borrower = loan.borrowerId ? findUserById(loan.borrowerId) : null;
  const ageMs = Date.now() - new Date(loan.createdAt).getTime();
  const riskReady = Boolean(loan.riskScore != null || (loan as { oracleRevealed?: boolean }).oracleRevealed);
  const heuristicScore =
    loan.riskScore ??
    (loan.amount < 0.1 ? 0.22 : loan.amount < 0.5 ? 0.38 : loan.amount < 2 ? 0.55 : 0.7);
  return {
    ...loan,
    borrower: borrower
      ? {
          id: borrower.id,
          displayName: borrower.displayName,
          wallet: borrower.wallet,
          kyc1Status: borrower.kyc1Status,
          kyc2Status: borrower.kyc2Status,
        }
      : null,
    riskReady,
    compositeRisk: heuristicScore,
    riskBand: heuristicScore < 0.35 ? "low" : heuristicScore < 0.65 ? "medium" : "high",
    hoursInQueue: Math.round(ageMs / 3_600_000),
    loanType: loan.loanType || loan.category || (loan.collateralEth ? "collateral" : "credit"),
  };
}

/** 29 — Local Bank Dashboard */
localBankRouter.get("/dashboard", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const bankId = bankIdFor(user);
    await hydrateBankCapitalFromPrisma(bankId).catch(() => null);
    const bank = findBankById(bankId);
    const book = db.state.loans.filter((l) => l.lenderBankId === bankId && l.kind === "BORROWER");
    const active = book.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
    const pending = book.filter((l) => APPROVAL_QUEUE_STATUSES.has(l.status));
    const delinquent = active.filter((l) =>
      (l.installments || []).some((i) => !i.paid && new Date(i.dueDate) < new Date()),
    );
    const incomePending = db.state.incomeProofs.filter((p) => p.status === "PENDING").length;
    const amlOpen = localOpsDb.state.amlAlerts.filter(
      (a) => a.bankId === bankId && a.status === "OPEN",
    ).length;

    let kycPending = 0;
    let clientRows: Array<{
      id: string;
      loginId?: string | null;
      displayName?: string | null;
      wallet?: string | null;
      kyc1Status?: string | null;
      kyc2Status?: string | null;
      country?: string | null;
    }> = [];
    try {
      const prisma = getPrisma();
      if (prisma) {
        kycPending = await prisma.user.count({
          where: {
            role: "BORROWER",
            bankId,
            OR: [{ kyc1Status: "PENDING" }, { kyc2Status: "PENDING" }],
          },
        });
        clientRows = await prisma.user.findMany({
          where: { role: "BORROWER", bankId },
          orderBy: [{ loginId: "asc" }, { displayName: "asc" }],
          take: 200,
          select: {
            id: true,
            loginId: true,
            displayName: true,
            wallet: true,
            kyc1Status: true,
            kyc2Status: true,
            country: true,
          },
        });
      }
    } catch {
      /* optional */
    }

    // Fallback: in-memory users tied to this local bank
    if (clientRows.length === 0) {
      clientRows = db.state.users
        .filter((u) => u.role === "BORROWER" && u.bankId === bankId)
        .map((u) => ({
          id: u.id,
          loginId: u.loginId,
          displayName: u.displayName,
          wallet: u.wallet,
          kyc1Status: u.kyc1Status,
          kyc2Status: u.kyc2Status,
          country: u.country,
        }));
    }

    const reserve = bank?.reserve ?? 0;
    const allocated = Math.max(
      bank?.totalAllocated || 0,
      reserve + (bank?.totalLent ?? 0),
      1,
    );
    const reserveRatio = allocated > 0 ? reserve / allocated : 1;

    const clients = clientRows.map((u) => {
      const loans = book.filter((l) => l.borrowerId === u.id);
      const activeLoans = loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
      const pendingLoans = loans.filter((l) => APPROVAL_QUEUE_STATUSES.has(l.status));
      const outstanding = activeLoans.reduce((s, l) => s + (l.amount || 0), 0);
      const kyc =
        u.kyc2Status === "APPROVED" || u.kyc1Status === "APPROVED"
          ? "APPROVED"
          : u.kyc1Status === "PENDING" || u.kyc2Status === "PENDING"
            ? "PENDING"
            : u.kyc1Status || "NOT_STARTED";
      return {
        id: u.id,
        loginId: u.loginId || undefined,
        name: u.displayName || u.loginId || u.id,
        wallet: u.wallet || undefined,
        country: u.country || undefined,
        kyc1Status: u.kyc1Status,
        kyc2Status: u.kyc2Status,
        kycStatus: kyc,
        activeLoanCount: activeLoans.length,
        pendingLoanCount: pendingLoans.length,
        outstandingUsdc: outstanding,
        status: activeLoans.length ? "ACTIVE" : pendingLoans.length ? "PENDING" : "INACTIVE",
      };
    });

    res.json({
      bank,
      unit: "USDC",
      capital: {
        allocatedEth: allocated,
        reserveEth: reserve,
        lentEth: bank?.totalLent ?? 0,
        availableEth: Math.max(0, reserve),
        reserveUsdc: reserve,
        allocatedUsdc: allocated,
        availableUsdc: Math.max(0, reserve),
        reserveRatio,
        minReserveRatio: 0.15,
        nearMinimum: reserveRatio < 0.2,
      },
      loanBook: {
        activeCount: active.length,
        activeValueEth: active.reduce((s, l) => s + l.amount, 0),
        activeValueUsdc: active.reduce((s, l) => s + l.amount, 0),
        delinquencyRate: active.length ? delinquent.length / active.length : 0,
        upcomingMaturities: active
          .filter((l) => l.deadline)
          .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)))
          .slice(0, 5)
          .map((l) => ({ id: l.id, amount: l.amount, deadline: l.deadline })),
      },
      queues: {
        approvalsPending: pending.length,
        incomePending,
        amlOpen,
        kycPending,
      },
      clients: {
        activeCount: clients.filter((c) => c.status === "ACTIVE").length,
        totalCount: clients.length,
        list: clients,
      },
    });
  } catch (err) {
    next(err);
  }
});

/** Branch / national client roster for Local Bank operators / Lab.
 *  ?scope=branch (default) — this local bank only
 *  ?scope=national — all local banks under the same National parent
 *  ?q= — server-side search on loginId / name / wallet
 */
localBankRouter.get("/clients", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const bankId = bankIdFor(user);
    const scope = String(req.query.scope || "branch").toLowerCase();
    const q = String(req.query.q || "").trim().toLowerCase();

    const mine = findBankById(bankId);
    let bankIds = [bankId];
    if (scope === "national" || scope === "country" || scope === "all") {
      const parentId = mine?.parentBankId;
      if (parentId) {
        bankIds = db.state.banks
          .filter((b) => b.tier === "LOCAL" && b.parentBankId === parentId)
          .map((b) => b.id);
        if (!bankIds.includes(bankId)) bankIds.push(bankId);
      }
    }
    const bankNameById = new Map(
      db.state.banks.filter((b) => bankIds.includes(b.id)).map((b) => [b.id, b.name || b.id]),
    );

    const book = db.state.loans.filter(
      (l) => l.kind === "BORROWER" && l.lenderBankId && bankIds.includes(l.lenderBankId),
    );

    type Row = {
      id: string;
      loginId?: string | null;
      displayName?: string | null;
      wallet?: string | null;
      bankId?: string | null;
      kyc1Status?: string | null;
      kyc2Status?: string | null;
      country?: string | null;
    };
    let rows: Row[] = [];
    try {
      const prisma = getPrisma();
      if (prisma) {
        rows = await prisma.user.findMany({
          where: { role: "BORROWER", bankId: { in: bankIds } },
          orderBy: [{ loginId: "asc" }, { displayName: "asc" }],
          take: 5000,
          select: {
            id: true,
            loginId: true,
            displayName: true,
            wallet: true,
            bankId: true,
            kyc1Status: true,
            kyc2Status: true,
            country: true,
          },
        });
      }
    } catch {
      /* optional */
    }
    if (rows.length === 0) {
      rows = db.state.users
        .filter((u) => u.role === "BORROWER" && u.bankId && bankIds.includes(u.bankId))
        .map((u) => ({
          id: u.id,
          loginId: u.loginId,
          displayName: u.displayName,
          wallet: u.wallet,
          bankId: u.bankId,
          kyc1Status: u.kyc1Status,
          kyc2Status: u.kyc2Status,
          country: u.country,
        }));
    }

    if (q) {
      rows = rows.filter((u) => {
        const hay = `${u.loginId || ""} ${u.displayName || ""} ${u.wallet || ""} ${u.id} ${u.bankId || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    const clients = rows.map((u) => {
      const loans = book.filter((l) => l.borrowerId === u.id);
      const activeLoans = loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
      const pendingLoans = loans.filter((l) => APPROVAL_QUEUE_STATUSES.has(l.status));
      const outstanding = activeLoans.reduce((s, l) => s + (l.amount || 0), 0);
      const kyc =
        u.kyc2Status === "APPROVED" || u.kyc1Status === "APPROVED"
          ? "APPROVED"
          : u.kyc1Status === "PENDING" || u.kyc2Status === "PENDING"
            ? "PENDING"
            : u.kyc1Status || "NOT_STARTED";
      const clientBankId = u.bankId || bankId;
      return {
        id: u.id,
        loginId: u.loginId || undefined,
        name: u.displayName || u.loginId || u.id,
        wallet: u.wallet || undefined,
        country: u.country || undefined,
        bankId: clientBankId,
        bankName: bankNameById.get(clientBankId) || clientBankId,
        kycStatus: kyc,
        activeLoanCount: activeLoans.length,
        pendingLoanCount: pendingLoans.length,
        outstandingUsdc: outstanding,
        status: activeLoans.length ? "ACTIVE" : pendingLoans.length ? "PENDING" : "INACTIVE",
      };
    });

    res.json({
      bankId,
      scope: scope === "national" || scope === "country" || scope === "all" ? "national" : "branch",
      bankIds,
      totalCount: clients.length,
      clients,
      unit: "USDC",
    });
  } catch (err) {
    next(err);
  }
});

/** 30 — Approval queue */
localBankRouter.get("/approvals", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const bankId = bankIdFor(user);
  const sort = String(req.query.sort || "oldest");
  const type = String(req.query.type || "all");
  let loans = db.state.loans
    .filter(
      (l) =>
        l.kind === "BORROWER" &&
        APPROVAL_QUEUE_STATUSES.has(l.status) &&
        (user.role === "OWNER" || user.role === "NATIONAL_BANK_ADMIN" || l.lenderBankId === bankId),
    )
    .map(enrichLoan);

  if (type === "ready") loans = loans.filter((l) => l.riskReady || l.compositeRisk != null);
  if (type === "awaiting_ml") loans = loans.filter((l) => !l.riskReady && l.amount >= 1);
  if (type !== "all" && type !== "ready" && type !== "awaiting_ml") {
    loans = loans.filter((l) => String(l.loanType).toLowerCase().includes(type.toLowerCase()));
  }

  loans.sort((a, b) => {
    if (sort === "risk") return b.compositeRisk - a.compositeRisk;
    if (sort === "amount") return b.amount - a.amount;
    return a.createdAt.localeCompare(b.createdAt);
  });

  res.json({
    loans,
    buckets: {
      ready: loans.filter((l) => l.riskReady || l.amount < 1).length,
      awaitingMl: loans.filter((l) => !l.riskReady && l.amount >= 1).length,
    },
  });
});

/** 31 — Authority brief for retail JSON loan */
localBankRouter.get("/approvals/:loanId", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const loan = db.state.loans.find((l) => l.id === req.params.loanId);
  if (!loan) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const bankId = bankIdFor(user);
  if (
    loan.lenderBankId !== bankId &&
    user.role !== "OWNER" &&
    user.role !== "NATIONAL_BANK_ADMIN"
  ) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  const enriched = enrichLoan(loan);
  const borrower = loan.borrowerId ? findUserById(loan.borrowerId) : null;
  const limits = loan.borrowerId ? computeBorrowingLimits(loan.borrowerId) : null;
  const history = loan.borrowerId
    ? db.state.loans.filter((l) => l.borrowerId === loan.borrowerId).slice(0, 8)
    : [];

  const riskScore = enriched.compositeRisk;
  const shap = [
    { feature: "Requested principal", direction: riskScore > 0.5 ? "raises" : "lowers", magnitude: 0.18 },
    { feature: "Term length", direction: loan.termMonths > 12 ? "raises" : "neutral", magnitude: 0.09 },
    { feature: "Prior repayments", direction: "lowers", magnitude: 0.14 },
    { feature: "KYC completeness", direction: borrower?.kyc1Status === "APPROVED" ? "lowers" : "raises", magnitude: 0.11 },
    { feature: "Collateral cover", direction: loan.collateralEth ? "lowers" : "raises", magnitude: 0.16 },
  ];

  const fraudProb = Math.min(0.45, riskScore * 0.5);
  const anomalyFlag = riskScore > 0.7;

  res.json({
    loan: enriched,
    borrower,
    limits,
    history,
    authorityBrief: {
      headline:
        riskScore < 0.35
          ? "Low risk — approve if limits OK"
          : riskScore < 0.65
            ? "Medium risk — review carefully"
            : "Elevated risk — strong rationale required",
      recommendation: riskScore < 0.35 ? "APPROVE" : riskScore < 0.65 ? "REVIEW" : "REJECT",
      riskScore,
      interpretation:
        riskScore < 0.35
          ? "Composite score is in the low band. Standard collateral/credit policy applies."
          : riskScore < 0.65
            ? "Score sits mid-band. Check KYC, passport, and limit headroom before deciding."
            : "Score is elevated. Prefer reject or request more info unless collateral strongly covers.",
      shap,
      randomForestFraudProb: fraudProb,
      isolationForestAnomaly: anomalyFlag,
      auditRef: `LOAN_RISK_ASSESSMENT_${loan.id}`,
      disclaimer: "Demo brief — wire FastAPI /v1/brief for live RF+IF+SHAP.",
    },
  });
});

const requestInfoSchema = z.object({
  message: z.string().min(3).max(500),
});

localBankRouter.post("/approvals/:loanId/request-info", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const loan = db.state.loans.find((l) => l.id === req.params.loanId);
  if (!loan || loan.status !== "PENDING") {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const body = requestInfoSchema.parse(req.body);
  loan.status = "INFO_REQUESTED";
  loan.notes = `${loan.notes || ""}\n[INFO REQUESTED ${localOpsDb.nowIso()} by ${user.id}] ${body.message}`.trim();
  db.save();
  res.json({ ok: true, loan });
});

/** 32 — KYC + income review queue */
localBankRouter.get("/kyc-queue", async (req, res) => {
  const income = db.state.incomeProofs
    .filter((p) => p.status === "PENDING")
    .map(({ contentBase64, ...rest }) => {
      const borrower = findUserById(rest.userId);
      return {
        id: rest.id,
        kind: "INCOME" as const,
        documentType: "income_proof",
        status: rest.status,
        createdAt: rest.createdAt,
        fileName: rest.fileName,
        mimeType: rest.mimeType,
        applicant: borrower
          ? { id: borrower.id, displayName: borrower.displayName, wallet: borrower.wallet }
          : null,
      };
    });

  let kyc: Array<Record<string, unknown>> = [];
  try {
    const prisma = getPrisma();
    if (prisma) {
      const users = await prisma.user.findMany({
        where: {
          role: "BORROWER",
          OR: [{ kyc1Status: "PENDING" }, { kyc2Status: "PENDING" }],
        },
        take: 40,
      });
      kyc = users.flatMap((u) => {
        const rows = [];
        if (u.kyc1Status === "PENDING") {
          rows.push({
            id: `kyc1_${u.id}`,
            kind: "KYC1",
            documentType: "kyc_level_1",
            status: "PENDING",
            createdAt: u.updatedAt?.toISOString?.() || u.createdAt.toISOString(),
            applicant: { id: u.id, displayName: u.displayName, wallet: u.wallet },
            userId: u.id,
            level: 1,
          });
        }
        if (u.kyc2Status === "PENDING") {
          rows.push({
            id: `kyc2_${u.id}`,
            kind: "KYC2",
            documentType: "kyc_level_2",
            status: "PENDING",
            createdAt: u.updatedAt?.toISOString?.() || u.createdAt.toISOString(),
            applicant: { id: u.id, displayName: u.displayName, wallet: u.wallet },
            userId: u.id,
            level: 2,
          });
        }
        return rows;
      });
    }
  } catch {
    /* optional */
  }

  res.json({ items: [...kyc, ...income].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))) });
});

const kycReviewSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().max(500).optional(),
  escalateAml: z.boolean().optional(),
});

localBankRouter.post("/kyc-queue/:id/review", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = kycReviewSchema.parse(req.body);
    const id = String(req.params.id);

    if (id.startsWith("kyc1_") || id.startsWith("kyc2_")) {
      const userId = id.replace(/^kyc[12]_/, "");
      const level = id.startsWith("kyc1_") ? 1 : 2;
      const patch =
        level === 1
          ? { kyc1Status: body.decision }
          : { kyc2Status: body.decision };
      await updateUserPg(userId, patch as never);
      if (body.escalateAml) {
        const target = (await findUserByIdPg(userId)) || findUserById(userId);
        if (target) {
          const alert: AmlAlert = {
            id: localOpsDb.uid("aml"),
            bankId: bankIdFor(user),
            clientUserId: target.id,
            clientName: target.displayName,
            clientWallet: target.wallet,
            anomalyScore: 0.7,
            reason: `Escalated from KYC review: ${body.reason || "flagged by operator"}`,
            status: "OPEN",
            createdAt: localOpsDb.nowIso(),
          };
          localOpsDb.state.amlAlerts.unshift(alert);
          localOpsDb.save();
        }
      }
      res.json({ ok: true, kind: level === 1 ? "KYC1" : "KYC2", decision: body.decision });
      return;
    }

    const proof = db.state.incomeProofs.find((p) => p.id === id);
    if (!proof) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (proof.status !== "PENDING") {
      res.status(400).json({
        error: "already_reviewed",
        reviewedBy: proof.reviewedBy,
        reviewedAt: proof.reviewedAt,
      });
      return;
    }
    proof.status = body.decision;
    proof.reviewedBy = user.id;
    proof.reviewedAt = localOpsDb.nowIso();
    proof.notes = body.reason;
    if (body.escalateAml) {
      const target = findUserById(proof.userId);
      if (target) {
        localOpsDb.state.amlAlerts.unshift({
          id: localOpsDb.uid("aml"),
          bankId: bankIdFor(user),
          clientUserId: target.id,
          clientName: target.displayName,
          clientWallet: target.wallet,
          anomalyScore: 0.75,
          reason: `Escalated from income doc review: ${body.reason || "suspected fraud"}`,
          status: "OPEN",
          createdAt: localOpsDb.nowIso(),
        });
        localOpsDb.save();
      }
    }
    res.json({ ok: true, kind: "INCOME", proof: { ...proof, contentBase64: undefined } });
  } catch (err) {
    next(err);
  }
});

/** 33 — Staff management */
localBankRouter.get("/staff", requireRoles(...adminOnly), (req, res) => {
  const user = (req as AuthedRequest).user!;
  const bankId = bankIdFor(user);
  const staff = localOpsDb.state.staff.filter((s) => s.bankId === bankId);
  res.json({ staff });
});

const staffSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  displayName: z.string().min(2).max(80),
  role: z.enum(["APPROVER", "LOCAL_BANK_ADMIN"]),
});

localBankRouter.post("/staff", requireRoles(...adminOnly), (req, res) => {
  const user = (req as AuthedRequest).user!;
  const bankId = bankIdFor(user);
  const body = staffSchema.parse(req.body);
  const exists = localOpsDb.state.staff.find(
    (s) => s.bankId === bankId && s.wallet.toLowerCase() === body.wallet.toLowerCase(),
  );
  if (exists) {
    res.status(400).json({ error: "already_on_staff" });
    return;
  }
  const row: BankStaffRecord = {
    id: localOpsDb.uid("staff"),
    bankId,
    userId: `usr_${body.wallet.slice(2, 10)}`,
    displayName: body.displayName,
    wallet: body.wallet,
    role: body.role,
    status: "ACTIVE",
    addedAt: localOpsDb.nowIso(),
  };
  localOpsDb.state.staff.push(row);
  localOpsDb.save();
  void writeAudit("RBAC_STAFF_ADDED", user.id, {
    staffId: row.id,
    bankId,
    role: row.role,
    wallet: row.wallet,
  });
  res.status(201).json({ ok: true, staff: row });
});

localBankRouter.post("/staff/:id/suspend", requireRoles(...adminOnly), (req, res) => {
  const user = (req as AuthedRequest).user!;
  const bankId = bankIdFor(user);
  const row = localOpsDb.state.staff.find((s) => s.id === req.params.id && s.bankId === bankId);
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (row.role === "APPROVER") {
    const activeApprovers = localOpsDb.state.staff.filter(
      (s) => s.bankId === bankId && s.role === "APPROVER" && s.status === "ACTIVE",
    );
    if (activeApprovers.length <= 1 && row.status === "ACTIVE") {
      res.status(400).json({ error: "last_approver", message: "Branch must keep at least one active approver." });
      return;
    }
  }
  row.status = "SUSPENDED";
  row.suspendedAt = localOpsDb.nowIso();
  localOpsDb.save();
  void writeAudit("RBAC_STAFF_SUSPENDED", user.id, {
    staffId: row.id,
    bankId,
    role: row.role,
    wallet: row.wallet,
  });
  res.json({ ok: true, staff: row });
});

localBankRouter.post("/staff/:id/activate", requireRoles(...adminOnly), (req, res) => {
  const user = (req as AuthedRequest).user!;
  const bankId = bankIdFor(user);
  const row = localOpsDb.state.staff.find((s) => s.id === req.params.id && s.bankId === bankId);
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  row.status = "ACTIVE";
  row.suspendedAt = undefined;
  localOpsDb.save();
  void writeAudit("RBAC_STAFF_ACTIVATED", user.id, {
    staffId: row.id,
    bankId,
    role: row.role,
    wallet: row.wallet,
  });
  res.json({ ok: true, staff: row });
});

/** 34 — AML alerts */
localBankRouter.get("/aml", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const bankId = bankIdFor(user);
  const status = String(req.query.status || "OPEN");
  let alerts = localOpsDb.state.amlAlerts.filter((a) => a.bankId === bankId);
  if (status !== "all") alerts = alerts.filter((a) => a.status === status);
  res.json({ alerts });
});

localBankRouter.get("/aml/:id", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const alert = localOpsDb.state.amlAlerts.find((a) => a.id === req.params.id);
  if (!alert || alert.bankId !== bankIdFor(user)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const clientLoans = db.state.loans.filter((l) => l.borrowerId === alert.clientUserId).slice(0, 10);
  res.json({
    alert,
    clientHistory: clientLoans,
    model: {
      isolationForestScore: alert.anomalyScore,
      flag: alert.anomalyScore >= 0.7,
      reason: alert.reason,
    },
  });
});

const amlActionSchema = z.object({
  reason: z.string().min(3).max(500),
});

localBankRouter.post("/aml/:id/dismiss", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const body = amlActionSchema.parse(req.body);
  const alert = localOpsDb.state.amlAlerts.find((a) => a.id === req.params.id);
  if (!alert || alert.bankId !== bankIdFor(user)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  alert.status = "DISMISSED";
  alert.resolvedAt = localOpsDb.nowIso();
  alert.resolvedBy = user.id;
  alert.resolutionNote = body.reason;
  localOpsDb.save();
  res.json({ ok: true, alert, auditId: `AML_DISMISS_${alert.id}` });
});

localBankRouter.post("/aml/:id/escalate", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const body = amlActionSchema.parse(req.body);
  const alert = localOpsDb.state.amlAlerts.find((a) => a.id === req.params.id);
  if (!alert || alert.bankId !== bankIdFor(user)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  alert.status = "ESCALATED";
  alert.resolvedAt = localOpsDb.nowIso();
  alert.resolvedBy = user.id;
  alert.resolutionNote = `SAR draft: ${body.reason}`;
  alert.sarRef = `SAR-${alert.id.toUpperCase()}`;
  localOpsDb.save();
  res.json({
    ok: true,
    alert,
    sarRef: alert.sarRef,
    auditId: `AML_ESCALATE_${alert.id}`,
  });
});

localBankRouter.post("/aml/:id/freeze", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = amlActionSchema.parse(req.body);
    const alert = localOpsDb.state.amlAlerts.find((a) => a.id === req.params.id);
    if (!alert || alert.bankId !== bankIdFor(user)) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    alert.status = "FROZEN";
    alert.resolvedAt = localOpsDb.nowIso();
    alert.resolvedBy = user.id;
    alert.resolutionNote = body.reason;
    localOpsDb.save();
    const freeze = await applyAccountFreeze(alert.clientUserId, alert.clientWallet);
    res.json({
      ok: true,
      alert,
      auditId: `AML_FREEZE_${alert.id}`,
      accountFreeze: freeze,
    });
  } catch (err) {
    next(err);
  }
});

/** Local → National capital request (feeds National capital-allocation queue) */
const capitalRequestSchema = z.object({
  amount: z.number().positive().max(10_000),
  reason: z.string().min(5).max(500),
});

localBankRouter.post(
  "/capital-request",
  requireRoles("LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"),
  (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const body = capitalRequestSchema.parse(req.body);
      const lbId = bankIdFor(user);
      const lb = findBankById(lbId);
      if (!lb || lb.tier !== "LOCAL" || !lb.parentBankId) {
        res.status(400).json({ error: "not_a_local_bank" });
        return;
      }
      const row = {
        id: nationalOpsDb.uid("creq"),
        fromBankId: lb.id,
        fromBankName: lb.name,
        toBankId: lb.parentBankId,
        amount: body.amount,
        reason: body.reason,
        status: "OPEN" as const,
        createdAt: nationalOpsDb.nowIso(),
      };
      nationalOpsDb.state.capitalRequests.unshift(row);
      nationalOpsDb.save();
      res.status(201).json({ ok: true, request: row });
    } catch (err) {
      next(err);
    }
  },
);

const LOAN_CTRL_READ_ABI = [
  "function baseRateBps() view returns (uint256)",
  "function slope1Bps() view returns (uint256)",
  "function slope2Bps() view returns (uint256)",
  "function kinkBps() view returns (uint256)",
  "function maxLtvBps() view returns (uint256)",
];

const LOCAL_GOV_ABI = [
  "function setRateModel(uint256,uint256,uint256,uint256) external",
  "function setMaxLtvBps(uint256) external",
];

async function readLoanRateModel(): Promise<{
  baseRateBps: number;
  slope1Bps: number;
  slope2Bps: number;
  kinkBps: number;
  maxLtvBps: number;
}> {
  const defaults = {
    baseRateBps: 300,
    slope1Bps: 500,
    slope2Bps: 7500,
    kinkBps: KINK_BPS,
    maxLtvBps: 5000,
  };
  const provider = getChainProvider();
  const controller = config.contracts.loanController;
  if (!provider || !controller) return defaults;
  try {
    const c = new ethers.Contract(controller, LOAN_CTRL_READ_ABI, provider);
    const [baseRateBps, slope1Bps, slope2Bps, kinkBps, maxLtvBps] = await Promise.all([
      c.baseRateBps(),
      c.slope1Bps(),
      c.slope2Bps(),
      c.kinkBps(),
      c.maxLtvBps(),
    ]);
    return {
      baseRateBps: Number(baseRateBps),
      slope1Bps: Number(slope1Bps),
      slope2Bps: Number(slope2Bps),
      kinkBps: Number(kinkBps),
      maxLtvBps: Number(maxLtvBps),
    };
  } catch {
    return defaults;
  }
}

/** Local Bank lending rate model (Tier 3 authority — plan I tier-authority UI). */
localBankRouter.get(
  "/lending-settings",
  requireRoles("LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"),
  async (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const bankId = bankIdFor(user);
      const bank = findBankById(bankId);
      const rateModel = await readLoanRateModel();
      res.json({
        bank,
        rateModel,
        previews: {
          at50UtilBps: borrowAprFromUtilization(5000, rateModel),
          atKinkBps: borrowAprFromUtilization(rateModel.kinkBps, rateModel),
          at100UtilBps: borrowAprFromUtilization(10_000, rateModel),
        },
        governanceNote:
          "Demo: Local governor may adjust kinked borrow APR and max LTV. Production routes via multisig / timelock.",
      });
    } catch (err) {
      next(err);
    }
  },
);

const lendingSettingsSchema = z.object({
  baseRateBps: z.number().int().min(0).max(5000),
  slope1Bps: z.number().int().min(0).max(5000),
  slope2Bps: z.number().int().min(0).max(5000),
  kinkBps: z.number().int().min(1000).max(10_000).optional(),
  maxLtvBps: z.number().int().min(1000).max(10_000).optional(),
  note: z.string().max(500).optional(),
});

localBankRouter.post(
  "/lending-settings",
  requireRoles("LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"),
  async (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const body = lendingSettingsSchema.parse(req.body);
      const bankId = bankIdFor(user);
      const bank = findBankById(bankId);
      if (!bank) {
        res.status(404).json({ error: "bank_not_found" });
        return;
      }

      const kink = body.kinkBps ?? KINK_BPS;
      bank.aprBps = body.baseRateBps;
      db.save();

      let chainTxHash: string | null = null;
      const pk = process.env.CHAIN_OPERATOR_PRIVATE_KEY;
      const localAddr = config.contracts.localBank;
      const provider = getChainProvider();
      if (pk && localAddr && provider) {
        const signer = new ethers.Wallet(pk, provider);
        const lb = new ethers.Contract(localAddr, LOCAL_GOV_ABI, signer);
        const tx = await lb.setRateModel(body.baseRateBps, body.slope1Bps, body.slope2Bps, kink);
        await tx.wait();
        if (body.maxLtvBps != null) {
          const ltvTx = await lb.setMaxLtvBps(body.maxLtvBps);
          await ltvTx.wait();
        }
        chainTxHash = tx.hash;
      }

      const rateModel = {
        baseRateBps: body.baseRateBps,
        slope1Bps: body.slope1Bps,
        slope2Bps: body.slope2Bps,
        kinkBps: kink,
        maxLtvBps: body.maxLtvBps ?? 5000,
      };

      res.json({
        ok: true,
        rateModel,
        chainTxHash,
        note: body.note,
        changedBy: user.id,
        governanceNote:
          "Parameter change recorded. On-chain update requires CHAIN_OPERATOR_PRIVATE_KEY in demo env.",
      });
    } catch (err) {
      next(err);
    }
  },
);