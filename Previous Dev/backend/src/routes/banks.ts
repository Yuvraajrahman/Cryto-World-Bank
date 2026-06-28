import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import { db, findBankById } from "../store/db";

export const banksRouter = Router();

banksRouter.get("/", (_req, res) => {
  const banks = db.state.banks;
  const world = banks.find((b) => b.tier === "WORLD") ?? null;
  res.json({
    worldBank: world,
    nationalBanks: banks.filter((b) => b.tier === "NATIONAL"),
    localBanks: banks.filter((b) => b.tier === "LOCAL"),
  });
});

banksRouter.get("/tree", (_req, res) => {
  const banks = db.state.banks;
  const world = banks.find((b) => b.tier === "WORLD")!;
  type BankNode = (typeof banks)[number] & { children: BankNode[] };
  const children = (parentId: string): BankNode[] =>
    banks
      .filter((b) => b.parentBankId === parentId)
      .map((b): BankNode => ({ ...b, children: children(b.id) }));
  res.json({ ...world, children: children(world.id) });
});

banksRouter.get("/stats", (_req, res) => {
  const banks = db.state.banks;
  const loans = db.state.loans;
  const totalDeposits = banks
    .filter((b) => b.tier === "WORLD")
    .reduce((acc, b) => acc + b.reserve + b.totalAllocated, 0);
  const totalAllocated = banks
    .filter((b) => b.tier === "WORLD")
    .reduce((acc, b) => acc + b.totalAllocated, 0);
  const totalLent = banks.reduce((acc, b) => acc + b.totalLent, 0);
  const totalRepaid = banks.reduce((acc, b) => acc + b.totalRepaid, 0);
  const activeLoans = loans.filter(
    (l) => l.status === "APPROVED" || l.status === "ACTIVE",
  ).length;
  const borrowerCount = db.state.users.filter((u) => u.role === "BORROWER").length;

  res.json({
    totalDeposits,
    totalAllocated,
    totalLent,
    totalRepaid,
    activeLoans,
    borrowerCount,
    tiers: {
      world: banks.filter((b) => b.tier === "WORLD").length,
      national: banks.filter((b) => b.tier === "NATIONAL").length,
      local: banks.filter((b) => b.tier === "LOCAL").length,
    },
  });
});

banksRouter.get("/my", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  if (!user.bankId) {
    res.json({ bank: null });
    return;
  }
  const bank = findBankById(user.bankId);
  res.json({ bank });
});

const registerNationalSchema = z.object({
  name: z.string().min(2).max(120),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{6,64}$/),
  jurisdiction: z.string().min(2).max(120),
  reserve: z.number().min(0).optional(),
});

banksRouter.post(
  "/register-national",
  requireAuth,
  requireRoles("OWNER"),
  (req, res, next) => {
    try {
      const body = registerNationalSchema.parse(req.body);
      const world = db.state.banks.find((b) => b.tier === "WORLD")!;
      const id = db.uid("bank_nb");
      db.state.banks.push({
        id,
        tier: "NATIONAL",
        name: body.name,
        walletAddress: body.walletAddress,
        jurisdiction: body.jurisdiction,
        parentBankId: world.id,
        reserve: body.reserve ?? 0,
        totalAllocated: 0,
        totalLent: 0,
        totalRepaid: 0,
        aprBps: 500,
        createdAt: db.nowIso(),
      });
      res.status(201).json({ ok: true, bank: db.state.banks.at(-1) });
    } catch (err) {
      next(err);
    }
  },
);

const registerLocalSchema = z.object({
  name: z.string().min(2).max(120),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{6,64}$/),
  jurisdiction: z.string().min(2).max(120),
  city: z.string().min(2).max(120),
  parentBankId: z.string().min(1),
  reserve: z.number().min(0).optional(),
});

banksRouter.post(
  "/register-local",
  requireAuth,
  requireRoles("OWNER", "NATIONAL_BANK_ADMIN"),
  (req, res, next) => {
    try {
      const body = registerLocalSchema.parse(req.body);
      const parent = findBankById(body.parentBankId);
      if (!parent || parent.tier !== "NATIONAL") {
        res.status(400).json({ error: "invalid_parent" });
        return;
      }
      const user = (req as AuthedRequest).user!;
      if (user.role === "NATIONAL_BANK_ADMIN" && user.bankId !== parent.id) {
        res.status(403).json({ error: "not_your_national_bank" });
        return;
      }
      const id = db.uid("bank_lb");
      db.state.banks.push({
        id,
        tier: "LOCAL",
        name: body.name,
        walletAddress: body.walletAddress,
        jurisdiction: body.jurisdiction,
        city: body.city,
        parentBankId: parent.id,
        reserve: body.reserve ?? 0,
        totalAllocated: 0,
        totalLent: 0,
        totalRepaid: 0,
        aprBps: 800,
        createdAt: db.nowIso(),
      });
      res.status(201).json({ ok: true, bank: db.state.banks.at(-1) });
    } catch (err) {
      next(err);
    }
  },
);

const allocateSchema = z.object({
  fromBankId: z.string().min(1),
  toBankId: z.string().min(1),
  amount: z.number().positive(),
});

banksRouter.post(
  "/allocate",
  requireAuth,
  requireRoles("OWNER", "NATIONAL_BANK_ADMIN"),
  (req, res, next) => {
    try {
      const body = allocateSchema.parse(req.body);
      const from = findBankById(body.fromBankId);
      const to = findBankById(body.toBankId);
      if (!from || !to) {
        res.status(404).json({ error: "bank_not_found" });
        return;
      }
      const user = (req as AuthedRequest).user!;
      if (user.role === "NATIONAL_BANK_ADMIN" && user.bankId !== from.id) {
        res.status(403).json({ error: "not_your_national_bank" });
        return;
      }
      if (from.reserve < body.amount) {
        res.status(400).json({ error: "insufficient_reserve" });
        return;
      }
      from.reserve -= body.amount;
      from.totalAllocated += body.amount;
      to.reserve += body.amount;
      db.state.transactions.push({
        id: db.uid("tx"),
        type: "ALLOCATION",
        bankId: from.id,
        amount: body.amount,
        note: `Allocation to ${to.name}`,
        at: db.nowIso(),
      });
      res.json({ ok: true, from, to });
    } catch (err) {
      next(err);
    }
  },
);

banksRouter.get("/audit-log", requireAuth, (_req, res) => {
  const allocations = db.state.transactions
    .filter((t) => t.type === "ALLOCATION")
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  res.json({ entries: allocations });
});
