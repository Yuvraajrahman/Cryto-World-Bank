/**
 * Super Admin console API — permanent platform administrator (DEV_ADMIN).
 * Mounted at /api/dev-admin. Requires DEV_ADMIN (or Super Admin bypass in requireRoles).
 */
import { Router } from "express";
import { z } from "zod";
import type { UserRole as PrismaUserRole, Prisma } from "@prisma/client";
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
import { persistBankCapital, syncBanksFromPrisma } from "../db/banksSync";
import {
  getSimulationConfig,
  updateSimulationConfig,
  getSimulationConfigHistory,
  revertSimulationConfigField,
} from "../services/simulationConfig";
import {
  simulateEconomy,
  startSimulationAsync,
  getLatestSimulationRun,
  getSimulationRun,
  listSimulationRuns,
  runContrastSimulations,
} from "../services/simulateEconomy";
import { optimizeSimulationConfig } from "../services/optimizeSimulation";
import { PASSPORT_TIERS } from "../lib/rates";

export const devAdminRouter = Router();

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
    const banks = db.state.banks;
    const loans = db.state.loans;
    const amlOpen = localOpsDb.state.amlAlerts.filter((a) => a.status === "OPEN").length;
    const [userTotal, roleGroups, kyc1Pending, kyc2Pending] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.user.count({ where: { kyc1Status: "PENDING" } }),
      prisma.user.count({ where: { kyc2Status: "PENDING" } }),
    ]);
    const byRole = ROLES.reduce(
      (acc, r) => {
        acc[r] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );
    for (const g of roleGroups) {
      byRole[g.role] = g._count._all;
    }
    const pendingLoans = loans.filter((l) => l.status === "PENDING").length;
    const world = banks.find((b) => b.tier === "WORLD");
    const activeLoans = loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");

    res.json({
      users: {
        total: userTotal,
        byRole,
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
        kycPending: kyc1Pending + kyc2Pending,
        amlOpen,
        pendingLoans,
        staff: localOpsDb.state.staff.length,
      },
      capital: {
        worldReserveEth: world?.reserve ?? 0,
        worldAllocatedEth: world?.totalAllocated ?? 0,
        totalLentEth: banks.reduce((s, b) => s + b.totalLent, 0),
        unit: "USDC",
        worldReserveUsdc: world?.reserve ?? 0,
        worldAllocatedUsdc: world?.totalAllocated ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

/** Sync memory banks from Prisma (after testing seed). */
devAdminRouter.post("/banks/sync", async (_req, res, next) => {
  try {
    const result = await syncBanksFromPrisma();
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * Super Admin: allocate World reserve to any National / Local / Client.
 * Amounts are USDC units (testing phase).
 */
const allocateAnyoneSchema = z.object({
  toType: z.enum(["NATIONAL", "LOCAL", "CLIENT"]),
  toId: z.string().min(1),
  amount: z.number().positive().max(1_000_000_000),
  note: z.string().max(500).optional(),
});

devAdminRouter.post("/allocate", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = allocateAnyoneSchema.parse(req.body);
    const world = db.state.banks.find((b) => b.tier === "WORLD");
    if (!world) {
      res.status(500).json({ error: "world_missing" });
      return;
    }
    if (world.reserve < body.amount) {
      res.status(400).json({
        error: "insufficient_reserve",
        worldReserveUsdc: world.reserve,
      });
      return;
    }

    if (body.toType === "CLIENT") {
      const prisma = requirePrisma();
      let user = await findUserByIdPg(body.toId);
      if (!user) {
        const row = await prisma.user.findFirst({
          where: {
            OR: [
              { loginId: { equals: body.toId, mode: "insensitive" } },
              { id: body.toId },
            ],
          },
        });
        user = row ? toAppUser(row) : null;
      }
      if (!user || user.role !== "BORROWER") {
        res.status(404).json({ error: "client_not_found" });
        return;
      }
      world.reserve -= body.amount;
      world.totalAllocated += body.amount;
      db.state.transactions.push({
        id: db.uid("tx"),
        type: "DEPOSIT",
        userId: user.id,
        bankId: world.id,
        amount: body.amount,
        note: body.note || `Super Admin allocation to client ${user.loginId || user.id}`,
        at: db.nowIso(),
      });
      db.save();
      await persistBankCapital(world.id);
      await writeAudit("DEV_ADMIN_ALLOCATE", actor.id, {
        toType: "CLIENT",
        toId: user.id,
        amountUsdc: body.amount,
      });
      res.json({
        ok: true,
        unit: "USDC",
        from: world,
        client: user,
        amount: body.amount,
      });
      return;
    }

    const to = findBankById(body.toId);
    if (!to || to.tier !== body.toType) {
      res.status(404).json({ error: "bank_not_found" });
      return;
    }
    world.reserve -= body.amount;
    world.totalAllocated += body.amount;
    to.reserve += body.amount;
    db.state.transactions.push({
      id: db.uid("tx"),
      type: "ALLOCATION",
      bankId: world.id,
      amount: body.amount,
      note: body.note || `Super Admin allocation to ${to.name}`,
      at: db.nowIso(),
    });
    db.save();
    await persistBankCapital(world.id);
    await persistBankCapital(to.id);
    await writeAudit("DEV_ADMIN_ALLOCATE", actor.id, {
      toType: body.toType,
      toId: to.id,
      amountUsdc: body.amount,
    });
    res.json({ ok: true, unit: "USDC", from: world, to, amount: body.amount });
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
    const take = Math.min(Number(req.query.limit) || 100, 500);
    const where: Record<string, unknown> = {};
    if (role && ROLES.includes(role as (typeof ROLES)[number])) {
      where.role = role;
    }
    if (q) {
      where.OR = [
        { wallet: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { loginId: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } },
      ];
    }
    const rows = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
    });
    res.json({ users: rows.map(toAppUser), limit: take });
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

// ---------- Phase 2 / 2B: Economy simulation ----------

const simulationRunSchema = z.object({
  totalCapitalUsdc: z.number().positive().max(1_000_000_000).optional(),
  seed: z.number().int().optional(),
  clientMultiplier: z.number().min(0.1).max(2).optional(),
  simulatedDays: z.number().int().min(30).max(3650).optional(),
  sampleNationals: z.number().int().min(1).max(15).optional(),
  sampleLocalsPerNational: z.number().int().min(1).max(10).optional(),
  clientsPerLocal: z.number().int().min(1).max(12).optional(),
  resetSample: z.boolean().optional(),
  /** When true, return { runId } immediately and finish in background (poll GET /runs/:id). */
  async: z.boolean().optional(),
});

const simulationConfigSchema = z.object({
  baseRateBps: z.number().int().min(0).max(5000).optional(),
  slope1Bps: z.number().int().min(0).max(5000).optional(),
  slope2Bps: z.number().int().min(0).max(10_000).optional(),
  kinkBps: z.number().int().min(1000).max(10_000).optional(),
  minReserveRatio: z.number().min(0.05).max(0.5).optional(),
  tierModifiers: z.record(z.string(), z.number()).optional(),
  note: z.string().max(500).optional(),
});

devAdminRouter.get("/simulation/config", async (_req, res, next) => {
  try {
    const config = await getSimulationConfig();
    const history = await getSimulationConfigHistory(20);
    res.json({
      config,
      history,
      passportTiers: PASSPORT_TIERS.map((t) => ({
        name: t.name,
        minScore: t.minScore,
        maxScore: t.maxScore,
        maxLoanUsdc: t.maxLoanUsdc,
        rateModifierBps: t.rateModifierBps,
      })),
    });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.patch("/simulation/config", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = simulationConfigSchema.parse(req.body);
    const patch: Record<string, unknown> = {};
    if (body.baseRateBps != null) patch.baseRateBps = body.baseRateBps;
    if (body.slope1Bps != null) patch.slope1Bps = body.slope1Bps;
    if (body.slope2Bps != null) patch.slope2Bps = body.slope2Bps;
    if (body.kinkBps != null) patch.kinkBps = body.kinkBps;
    if (body.minReserveRatio != null) patch.minReserveRatio = body.minReserveRatio;
    if (body.tierModifiers != null) patch.tierModifiers = body.tierModifiers;
    const { config, changes } = await updateSimulationConfig(
      patch as Partial<import("../services/simulationConfig").SimulationConfigSnapshot>,
      {
        changedBy: actor.id,
        note: body.note,
      },
    );
    await writeAudit("SIMULATION_CONFIG_UPDATE", actor.id, {
      changes,
    } as Prisma.InputJsonValue);
    res.json({ ok: true, config, changes });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.post("/simulation/config/revert/:historyId", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const config = await revertSimulationConfigField(req.params.historyId, actor.id);
    if (!config) {
      res.status(404).json({ error: "history_not_found" });
      return;
    }
    await writeAudit("SIMULATION_CONFIG_REVERT", actor.id, { historyId: req.params.historyId });
    res.json({ ok: true, config });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.post("/simulation/run", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = simulationRunSchema.parse(req.body ?? {});
    const { async: runAsync, ...simParams } = body;

    if (runAsync) {
      const { runId } = await startSimulationAsync({
        ...simParams,
        resetSample: simParams.resetSample ?? true,
        triggeredBy: actor.id,
      });
      await writeAudit("SIMULATION_RUN", actor.id, {
        runId,
        async: true,
        totalCapitalUsdc: simParams.totalCapitalUsdc ?? 100_000_000,
        seed: simParams.seed ?? 42,
      });
      res.status(202).json({ runId, status: "RUNNING" });
      return;
    }

    const result = await simulateEconomy({
      ...simParams,
      resetSample: simParams.resetSample ?? true,
      triggeredBy: actor.id,
    });
    await writeAudit("SIMULATION_RUN", actor.id, {
      runId: result.summary.runId,
      totalCapitalUsdc: result.summary.totalCapitalUsdc,
      seed: result.summary.seed,
      pass: result.verification.pass,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

devAdminRouter.post("/simulation/contrast", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = z
      .object({ randomSeed: z.number().int().optional() })
      .parse(req.body ?? {});
    const result = await runContrastSimulations({
      triggeredBy: actor.id,
      randomSeed: body.randomSeed,
    });
    await writeAudit("SIMULATION_CONTRAST", actor.id, {
      random100M: result.random100M.summary.runId,
      optimized1B: result.optimized1B.summary.runId,
      randomPass: result.random100M.verification.pass,
      optimizedPass: result.optimized1B.verification.pass,
    } as Prisma.InputJsonValue);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

devAdminRouter.get("/simulation/runs", async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const runs = await listSimulationRuns(limit);
    res.json({ runs });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.get("/simulation/runs/latest", async (_req, res, next) => {
  try {
    const run = await getLatestSimulationRun();
    if (!run) {
      res.status(404).json({ error: "no_runs" });
      return;
    }
    res.json({ run });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.get("/simulation/runs/:id", async (req, res, next) => {
  try {
    const run = await getSimulationRun(req.params.id);
    if (!run) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ run });
  } catch (err) {
    next(err);
  }
});

devAdminRouter.post("/simulation/optimize", async (req, res, next) => {
  try {
    const body = z
      .object({ targetCapitalUsdc: z.number().positive().max(1_000_000_000).default(1_000_000_000) })
      .parse(req.body ?? {});
    const current = await getSimulationConfig();
    const result = optimizeSimulationConfig(current, body.targetCapitalUsdc);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

devAdminRouter.post("/simulation/optimize/apply", async (req, res, next) => {
  try {
    const actor = (req as AuthedRequest).user!;
    const body = z
      .object({
        targetCapitalUsdc: z.number().positive().max(1_000_000_000).default(1_000_000_000),
        note: z.string().max(500).optional(),
      })
      .parse(req.body ?? {});
    const preview = optimizeSimulationConfig(await getSimulationConfig(), body.targetCapitalUsdc);
    const { config, changes } = await updateSimulationConfig(preview.optimized, {
      changedBy: actor.id,
      note: body.note ?? `Optimized for ${body.targetCapitalUsdc} USDC`,
    });
    await writeAudit(
      "SIMULATION_OPTIMIZE_APPLY",
      actor.id,
      {
        targetCapitalUsdc: body.targetCapitalUsdc,
        changes,
      } as unknown as Prisma.InputJsonValue,
    );
    res.json({ ok: true, config, preview, changes });
  } catch (err) {
    next(err);
  }
});
