/**
 * TEMPORARY developer admin API — remove before production.
 * Mounted at /api/dev-admin. Requires DEV_ADMIN and non-production NODE_ENV.
 */
import { Router } from "express";
import { z } from "zod";
import type { UserRole as PrismaUserRole } from "@prisma/client";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import { db, findBankById, type UserRole } from "../store/db";
import { localOpsDb } from "../store/localOps";
import { requirePrisma } from "../db/prisma";
import {
  findUserByIdPg,
  toAppUser,
  updateUserPg,
  upsertUserByWalletPg,
  writeAudit,
} from "../db/users";

export const devAdminRouter = Router();

function blockProduction(_req: unknown, res: import("express").Response, next: import("express").NextFunction) {
  if (process.env.NODE_ENV === "production") {
    res.status(404).end();
    return;
  }
  next();
}

devAdminRouter.use(blockProduction);
devAdminRouter.use(requireAuth);
devAdminRouter.use(requireRoles("DEV_ADMIN"));

const ROLES = [
  "OWNER",
  "NATIONAL_BANK_ADMIN",
  "LOCAL_BANK_ADMIN",
  "APPROVER",
  "BORROWER",
  "REGULATOR",
  "DEV_ADMIN",
] as const;

function buildInstallmentSchedule(amount: number, termMonths: number) {
  const per = Number((amount / termMonths).toFixed(6));
  return Array.from({ length: termMonths }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i + 1);
    return {
      index: i + 1,
      amount: per,
      dueDate: d.toISOString(),
      paid: false,
    };
  });
}

// ---------- Overview ----------

devAdminRouter.get("/overview", async (_req, res, next) => {
  try {
    const prisma = requirePrisma();
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    const banks = db.state.banks;
    const loans = db.state.loans;
    const amlOpen = localOpsDb.state.amlAlerts.filter((a) => a.status === "OPEN").length;
    const kycPending = users.filter(
      (u) => u.kyc1Status === "PENDING" || u.kyc2Status === "PENDING",
    ).length;
    const pendingLoans = loans.filter((l) => l.status === "PENDING").length;
    const world = banks.find((b) => b.tier === "WORLD");
    const activeLoans = loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");

    res.json({
      users: {
        total: users.length,
        byRole: ROLES.reduce(
          (acc, r) => {
            acc[r] = users.filter((u) => u.role === r).length;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      banks: {
        world: banks.filter((b) => b.tier === "WORLD").length,
        national: banks.filter((b) => b.tier === "NATIONAL").length,
        local: banks.filter((b) => b.tier === "LOCAL").length,
      },
      loans: {
        total: loans.length,
        pending: pendingLoans,
        active: activeLoans.length,
        outstandingEth: activeLoans.reduce((s, l) => s + l.amount, 0),
      },
      queues: {
        kycPending,
        amlOpen,
        pendingLoans,
        staff: localOpsDb.state.staff.length,
      },
      capital: {
        worldReserveEth: world?.reserve ?? 0,
        worldAllocatedEth: world?.totalAllocated ?? 0,
        totalLentEth: banks.reduce((s, b) => s + b.totalLent, 0),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Users ----------

devAdminRouter.get("/users", async (req, res, next) => {
  try {
    const prisma = requirePrisma();
    const q = String(req.query.q || "").trim().toLowerCase();
    const role = String(req.query.role || "").trim();
    let rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    if (role && ROLES.includes(role as (typeof ROLES)[number])) {
      rows = rows.filter((u) => u.role === role);
    }
    if (q) {
      rows = rows.filter(
        (u) =>
          u.wallet.toLowerCase().includes(q) ||
          (u.displayName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      );
    }
    res.json({ users: rows.map(toAppUser) });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.get("/users/:id", async (req, res, next) => {
  try {
    const user = await findUserByIdPg(req.params.id);
    if (!user) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const loans = db.state.loans.filter((l) => l.borrowerId === user.id);
    res.json({ user, loans });
  } catch (err) {
    next(err);
  }
});

const patchUserSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  email: z.string().email().optional().nullable(),
  role: z.enum(ROLES).optional(),
  bankId: z.string().optional().nullable(),
  kyc1Status: z.enum(["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"]).optional(),
  kyc2Status: z.enum(["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"]).optional(),
  onboardingComplete: z.boolean().optional(),
  isFirstTime: z.boolean().optional(),
  country: z.string().max(80).optional().nullable(),
});

devAdminRouter.patch("/users/:id", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = patchUserSchema.parse(req.body ?? {});
    const existing = await findUserByIdPg(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (existing.id === actor.id && body.role && body.role !== "DEV_ADMIN") {
      res.status(400).json({ error: "cannot_demote_self" });
      return;
    }
    const data: Record<string, unknown> = {};
    if (body.displayName !== undefined) data.displayName = body.displayName;
    if (body.email !== undefined) data.email = body.email;
    if (body.role !== undefined) data.role = body.role as PrismaUserRole;
    if (body.bankId !== undefined) data.bankId = body.bankId;
    if (body.kyc1Status !== undefined) data.kyc1Status = body.kyc1Status;
    if (body.kyc2Status !== undefined) data.kyc2Status = body.kyc2Status;
    if (body.onboardingComplete !== undefined) data.onboardingComplete = body.onboardingComplete;
    if (body.isFirstTime !== undefined) data.isFirstTime = body.isFirstTime;
    if (body.country !== undefined) data.country = body.country;

    const user = await updateUserPg(req.params.id, data);
    await writeAudit("DEV_ADMIN_USER_PATCH", actor.id, {
      userId: user.id,
      patch: body,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.delete("/users/:id", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const id = req.params.id;
    if (id === actor.id) {
      res.status(400).json({ error: "cannot_delete_self" });
      return;
    }
    const existing = await findUserByIdPg(id);
    if (!existing) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const prisma = requirePrisma();
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.updateMany({ where: { actorId: id }, data: { actorId: null } });
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.chatMessage.deleteMany({
        where: { OR: [{ senderId: id }, { receiverId: id }] },
      });
      await tx.incomeVerification.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });
    db.state.users = db.state.users.filter((u) => u.id !== id);
    db.state.loans = db.state.loans.filter((l) => l.borrowerId !== id);
    db.save();
    localOpsDb.state.staff = localOpsDb.state.staff.filter((s) => s.userId !== id);
    localOpsDb.state.amlAlerts = localOpsDb.state.amlAlerts.filter((a) => a.clientUserId !== id);
    localOpsDb.save();
    await writeAudit("DEV_ADMIN_USER_DELETE", actor.id, { userId: id, wallet: existing.wallet });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const createUserSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{6,64}$/),
  displayName: z.string().min(1).max(120),
  role: z.enum(ROLES).default("BORROWER"),
  email: z.string().email().optional(),
  bankId: z.string().optional(),
});

devAdminRouter.post("/users", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = createUserSchema.parse(req.body);
    const user = await upsertUserByWalletPg(body.wallet, {
      role: body.role as UserRole,
      displayName: body.displayName,
      email: body.email,
      bankId: body.bankId,
    });
    await writeAudit("DEV_ADMIN_USER_CREATE", actor.id, { userId: user.id, role: user.role });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

// ---------- Banks ----------

devAdminRouter.get("/banks", (_req, res) => {
  const banks = db.state.banks;
  res.json({
    worldBank: banks.find((b) => b.tier === "WORLD") ?? null,
    nationalBanks: banks.filter((b) => b.tier === "NATIONAL"),
    localBanks: banks.filter((b) => b.tier === "LOCAL"),
    banks,
  });
});

const createNationalSchema = z.object({
  name: z.string().min(2).max(120),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{6,64}$/),
  jurisdiction: z.string().min(2).max(120),
  reserve: z.number().min(0).optional(),
});

devAdminRouter.post("/banks/national", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = createNationalSchema.parse(req.body);
    const world = db.state.banks.find((b) => b.tier === "WORLD");
    if (!world) {
      res.status(500).json({ error: "world_missing" });
      return;
    }
    const id = db.uid("bank_nb");
    const bank = {
      id,
      tier: "NATIONAL" as const,
      name: body.name,
      walletAddress: body.walletAddress,
      jurisdiction: body.jurisdiction,
      parentBankId: world.id,
      reserve: body.reserve ?? 0,
      totalAllocated: 0,
      totalLent: 0,
      totalRepaid: 0,
      aprBps: 500,
      status: "ACTIVE" as const,
      createdAt: db.nowIso(),
    };
    db.state.banks.push(bank);
    db.save();
    await writeAudit("DEV_ADMIN_BANK_CREATE", actor.id, { bankId: id, tier: "NATIONAL" });
    res.status(201).json({ bank });
  } catch (err) {
    next(err);
  }
});

const createLocalSchema = z.object({
  name: z.string().min(2).max(120),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{6,64}$/),
  jurisdiction: z.string().min(2).max(120),
  city: z.string().min(2).max(120),
  parentBankId: z.string().min(1),
  reserve: z.number().min(0).optional(),
});

devAdminRouter.post("/banks/local", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = createLocalSchema.parse(req.body);
    const parent = findBankById(body.parentBankId);
    if (!parent || parent.tier !== "NATIONAL") {
      res.status(400).json({ error: "invalid_parent" });
      return;
    }
    const id = db.uid("bank_lb");
    const bank = {
      id,
      tier: "LOCAL" as const,
      name: body.name,
      walletAddress: body.walletAddress,
      jurisdiction: body.jurisdiction,
      city: body.city,
      parentBankId: parent.id,
      reserve: body.reserve ?? 0,
      totalAllocated: 0,
      totalLent: 0,
      totalRepaid: 0,
      aprBps: parent.aprBps || 800,
      status: "ACTIVE" as const,
      createdAt: db.nowIso(),
    };
    db.state.banks.push(bank);
    db.save();
    await writeAudit("DEV_ADMIN_BANK_CREATE", actor.id, { bankId: id, tier: "LOCAL" });
    res.status(201).json({ bank });
  } catch (err) {
    next(err);
  }
});

const patchBankSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  reserve: z.number().min(0).optional(),
  aprBps: z.number().int().min(0).max(5000).optional(),
  status: z.enum(["ACTIVE", "PAUSED"]).optional(),
  jurisdiction: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
});

devAdminRouter.patch("/banks/:id", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const bank = findBankById(req.params.id);
    if (!bank) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const body = patchBankSchema.parse(req.body ?? {});
    if (body.name !== undefined) bank.name = body.name;
    if (body.reserve !== undefined) bank.reserve = body.reserve;
    if (body.aprBps !== undefined) bank.aprBps = body.aprBps;
    if (body.status !== undefined) bank.status = body.status;
    if (body.jurisdiction !== undefined) bank.jurisdiction = body.jurisdiction;
    if (body.city !== undefined) bank.city = body.city;
    db.save();
    await writeAudit("DEV_ADMIN_BANK_PATCH", actor.id, { bankId: bank.id, patch: body });
    res.json({ bank });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.delete("/banks/:id", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const bank = findBankById(req.params.id);
    if (!bank) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (bank.tier === "WORLD") {
      res.status(400).json({ error: "cannot_delete_world" });
      return;
    }
    const children = db.state.banks.filter((b) => b.parentBankId === bank.id);
    if (children.length > 0) {
      res.status(400).json({ error: "has_children", children: children.map((c) => c.id) });
      return;
    }
    db.state.banks = db.state.banks.filter((b) => b.id !== bank.id);
    db.state.loans = db.state.loans.filter((l) => l.lenderBankId !== bank.id);
    db.save();
    localOpsDb.state.staff = localOpsDb.state.staff.filter((s) => s.bankId !== bank.id);
    localOpsDb.state.amlAlerts = localOpsDb.state.amlAlerts.filter((a) => a.bankId !== bank.id);
    localOpsDb.save();
    await writeAudit("DEV_ADMIN_BANK_DELETE", actor.id, { bankId: bank.id, tier: bank.tier });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Loans ----------

devAdminRouter.get("/loans", (req, res) => {
  const status = String(req.query.status || "").trim();
  const bankId = String(req.query.bankId || "").trim();
  const borrowerId = String(req.query.borrowerId || "").trim();
  let loans = [...db.state.loans];
  if (status) loans = loans.filter((l) => l.status === status);
  if (bankId) loans = loans.filter((l) => l.lenderBankId === bankId);
  if (borrowerId) loans = loans.filter((l) => l.borrowerId === borrowerId);
  loans.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json({ loans });
});

devAdminRouter.post("/loans/:id/approve", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const loan = db.state.loans.find((l) => l.id === req.params.id);
    if (!loan) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (loan.status !== "PENDING") {
      res.status(400).json({ error: "not_pending" });
      return;
    }
    const lenderBank = findBankById(loan.lenderBankId);
    if (!lenderBank) {
      res.status(500).json({ error: "lender_bank_missing" });
      return;
    }
    if (loan.amount > lenderBank.reserve) {
      res.status(400).json({ error: "insufficient_reserve" });
      return;
    }
    const termMonths = loan.termMonths || 12;
    if (loan.isInstallment) {
      loan.installments = buildInstallmentSchedule(loan.amount, termMonths);
      loan.deadline = loan.installments[loan.installments.length - 1]?.dueDate;
    }
    loan.status = "ACTIVE";
    loan.approvedBy = actor.id;
    loan.approvedAt = db.nowIso();
    lenderBank.reserve -= loan.amount;
    lenderBank.totalLent += loan.amount;
    db.save();
    await writeAudit("DEV_ADMIN_LOAN_APPROVE", actor.id, { loanId: loan.id });
    res.json({ loan });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.post("/loans/:id/reject", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const loan = db.state.loans.find((l) => l.id === req.params.id);
    if (!loan) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (loan.status !== "PENDING") {
      res.status(400).json({ error: "not_pending" });
      return;
    }
    const reason = String((req.body || {}).reason || "Rejected by DEV_ADMIN");
    loan.status = "REJECTED";
    loan.rejectedBy = actor.id;
    loan.rejectedAt = db.nowIso();
    loan.rejectionReason = reason;
    db.save();
    await writeAudit("DEV_ADMIN_LOAN_REJECT", actor.id, { loanId: loan.id, reason });
    res.json({ loan });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.delete("/loans/:id", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const idx = db.state.loans.findIndex((l) => l.id === req.params.id);
    if (idx < 0) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const [removed] = db.state.loans.splice(idx, 1);
    db.save();
    await writeAudit("DEV_ADMIN_LOAN_DELETE", actor.id, { loanId: removed?.id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Ops ----------

devAdminRouter.get("/kyc-queue", async (_req, res, next) => {
  try {
    const prisma = requirePrisma();
    const rows = await prisma.user.findMany({
      where: {
        OR: [{ kyc1Status: "PENDING" }, { kyc2Status: "PENDING" }],
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ items: rows.map(toAppUser) });
  } catch (err) {
    next(err);
  }
});

const forceKycSchema = z.object({
  kyc1Status: z.enum(["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"]).optional(),
  kyc2Status: z.enum(["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"]).optional(),
});

devAdminRouter.post("/kyc/:userId/force-status", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = forceKycSchema.parse(req.body ?? {});
    const data: Record<string, unknown> = {};
    if (body.kyc1Status) data.kyc1Status = body.kyc1Status;
    if (body.kyc2Status) data.kyc2Status = body.kyc2Status;
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "empty_patch" });
      return;
    }
    const user = await updateUserPg(req.params.userId, data);
    await writeAudit("DEV_ADMIN_KYC_FORCE", actor.id, { userId: user.id, ...body });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.get("/aml", (_req, res) => {
  res.json({ alerts: localOpsDb.state.amlAlerts });
});

devAdminRouter.post("/aml/:id/dismiss", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const alert = localOpsDb.state.amlAlerts.find((a) => a.id === req.params.id);
    if (!alert) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    alert.status = "DISMISSED";
    alert.resolvedAt = localOpsDb.nowIso();
    alert.resolvedBy = actor.id;
    alert.resolutionNote = String((req.body || {}).note || "Dismissed by DEV_ADMIN");
    localOpsDb.save();
    await writeAudit("DEV_ADMIN_AML_DISMISS", actor.id, { alertId: alert.id });
    res.json({ alert });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.get("/staff", (_req, res) => {
  res.json({ staff: localOpsDb.state.staff });
});
