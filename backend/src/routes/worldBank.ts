import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth, isSuperAdmin } from "../middleware/auth";
import { db, findBankById, type Bank } from "../store/db";
import { localOpsDb } from "../store/localOps";
import { nationalOpsDb } from "../store/nationalOps";
import { worldOpsDb, MULTISIG_THRESHOLD } from "../store/worldOps";

export const worldBankRouter = Router();

worldBankRouter.use(requireAuth);

function isSigner(wallet: string) {
  const w = wallet.toLowerCase();
  return worldOpsDb.state.signers.some((s) => s.wallet.toLowerCase() === w);
}

function requireOwner(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const user = (req as AuthedRequest).user;
  if (!user || (user.role !== "OWNER" && !isSuperAdmin(user.role))) {
    res.status(403).json({ error: "forbidden", required: ["OWNER"] });
    return;
  }
  next();
}

function requireOwnerOrSigner(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) {
  const user = (req as AuthedRequest).user;
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (user.role === "OWNER" || isSuperAdmin(user.role) || isSigner(user.wallet)) {
    next();
    return;
  }
  res.status(403).json({ error: "forbidden", required: ["OWNER", "multisig_signer"] });
}

function capitalMetrics(bank: Bank, minReserveRatio: number) {
  const reserve = bank.reserve ?? 0;
  const allocated = Math.max(bank.totalAllocated || 0, reserve + (bank.totalLent ?? 0), 1);
  const reserveRatio = allocated > 0 ? reserve / allocated : 1;
  const minReserveEth = allocated * minReserveRatio;
  return {
    allocatedEth: allocated,
    reserveEth: reserve,
    lentEth: bank.totalLent ?? 0,
    availableEth: Math.max(0, reserve),
    availableToAllocateEth: Math.max(0, reserve - minReserveEth),
    reserveRatio,
    minReserveRatio,
    nearMinimum: reserveRatio < minReserveRatio + 0.05,
  };
}

function enrichNational(nb: Bank, minRatio: number) {
  const locals = db.state.banks.filter((b) => b.tier === "LOCAL" && b.parentBankId === nb.id);
  const metrics = capitalMetrics(nb, minRatio);
  return {
    ...nb,
    status: nb.status || "ACTIVE",
    capital: metrics,
    localBankCount: locals.length,
    localNearMin: locals.some((lb) => capitalMetrics(lb, minRatio).nearMinimum),
  };
}

/** 39 — World Bank Dashboard */
worldBankRouter.get("/dashboard", requireOwner, (_req, res) => {
  const world = findBankById("bank_world") || db.state.banks.find((b) => b.tier === "WORLD");
  if (!world) {
    res.status(404).json({ error: "world_bank_missing" });
    return;
  }
  const minRatio = worldOpsDb.state.globalParams.minReserveRatio;
  const capital = capitalMetrics(world, minRatio);
  const nationals = db.state.banks
    .filter((b) => b.tier === "NATIONAL")
    .map((nb) => enrichNational(nb, minRatio));
  const allLoans = db.state.loans.filter((l) => l.kind === "BORROWER");
  const active = allLoans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
  const defaulted = allLoans.filter((l) => l.status === "DEFAULTED");
  const pendingMsig = worldOpsDb.state.multisigTxs.filter((t) => t.status === "PENDING").length;
  const pendingGov = worldOpsDb.state.proposals.filter(
    (p) => p.status === "VOTING" || p.status === "PASSED_TIMELOCK",
  ).length;
  const worldSars = localOpsDb.state.amlAlerts.filter((a) => a.status === "ESCALATED_WORLD").length;
  const anyNear =
    capital.nearMinimum || nationals.some((n) => n.capital.nearMinimum || n.localNearMin);

  res.json({
    bank: world,
    capital,
    globalParams: worldOpsDb.state.globalParams,
    nationalBanks: nationals,
    system: {
      nationalCount: nationals.length,
      localCount: db.state.banks.filter((b) => b.tier === "LOCAL").length,
      activeLoanCount: active.length,
      activeLoanValueEth: active.reduce((s, l) => s + l.amount, 0),
      defaultRate: allLoans.length ? defaulted.length / allLoans.length : 0,
      tvlEth: world.reserve + world.totalAllocated,
    },
    queues: {
      multisigPending: pendingMsig,
      governancePending: pendingGov,
      sarWorld: worldSars,
    },
    warnings: { cascadeNearMinimum: anyNear },
  });
});

/** 40 — National Bank registration & management */
worldBankRouter.get("/national-banks", requireOwner, (_req, res) => {
  const minRatio = worldOpsDb.state.globalParams.minReserveRatio;
  const banks = db.state.banks
    .filter((b) => b.tier === "NATIONAL")
    .map((nb) => enrichNational(nb, minRatio));
  res.json({ banks });
});

const registerNationalSchema = z.object({
  name: z.string().min(2).max(120),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  jurisdiction: z.string().min(2).max(120),
  reserve: z.number().min(0).optional(),
  aprBps: z.number().int().min(0).max(5000).optional(),
  requireMultisig: z.boolean().optional(),
});

worldBankRouter.post("/national-banks", requireOwner, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = registerNationalSchema.parse(req.body);
    const dup = db.state.banks.find(
      (b) => b.walletAddress.toLowerCase() === body.walletAddress.toLowerCase(),
    );
    if (dup) {
      res.status(400).json({ error: "already_registered", bankId: dup.id });
      return;
    }

    if (body.requireMultisig !== false) {
      const tx = {
        id: worldOpsDb.uid("msig"),
        title: `Register National Bank: ${body.name}`,
        description: `${body.jurisdiction} · ${body.walletAddress}`,
        action: "REGISTER_NATIONAL" as const,
        payload: { ...body },
        status: "PENDING" as const,
        createdAt: worldOpsDb.nowIso(),
        createdBy: user.id,
        signatures: isSigner(user.wallet) ? [user.wallet] : [],
      };
      worldOpsDb.state.multisigTxs.unshift(tx);
      worldOpsDb.save();
      res.status(202).json({
        ok: true,
        pendingMultisig: true,
        tx,
        message: "Registration queued for 2-of-3 multisig confirmation.",
      });
      return;
    }

    const world = db.state.banks.find((b) => b.tier === "WORLD")!;
    const id = db.uid("bank_nb");
    const bank: Bank = {
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
      aprBps: body.aprBps ?? 500,
      status: "ACTIVE",
      createdAt: db.nowIso(),
    };
    db.state.banks.push(bank);
    db.save();
    nationalOpsDb.paramsFor(id);
    nationalOpsDb.save();
    res.status(201).json({ ok: true, bank, auditId: `NB_REGISTER_${id}` });
  } catch (err) {
    next(err);
  }
});

worldBankRouter.post("/national-banks/:id/pause", requireOwner, (req, res) => {
  const nb = findBankById(String(req.params.id));
  if (!nb || nb.tier !== "NATIONAL") {
    res.status(404).json({ error: "not_found" });
    return;
  }
  nb.status = "PAUSED";
  db.save();
  res.json({ ok: true, bank: nb, auditId: `NB_PAUSE_${nb.id}` });
});

worldBankRouter.post("/national-banks/:id/unpause", requireOwner, (req, res) => {
  const nb = findBankById(String(req.params.id));
  if (!nb || nb.tier !== "NATIONAL") {
    res.status(404).json({ error: "not_found" });
    return;
  }
  nb.status = "ACTIVE";
  db.save();
  res.json({ ok: true, bank: nb, auditId: `NB_UNPAUSE_${nb.id}` });
});

const editNationalSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  aprBps: z.number().int().min(0).max(5000).optional(),
});

worldBankRouter.post("/national-banks/:id/params", requireOwner, (req, res, next) => {
  try {
    const nb = findBankById(String(req.params.id));
    if (!nb || nb.tier !== "NATIONAL") {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const body = editNationalSchema.parse(req.body);
    if (body.name) nb.name = body.name;
    if (body.aprBps != null) nb.aprBps = body.aprBps;
    db.save();
    res.json({ ok: true, bank: nb, auditId: `NB_PARAMS_${nb.id}` });
  } catch (err) {
    next(err);
  }
});

/** Direct capital allocation World → National (also available via multisig execute) */
const allocateSchema = z.object({
  toBankId: z.string().min(1),
  amount: z.number().positive().max(1_000_000_000),
  note: z.string().max(500).optional(),
});

worldBankRouter.post("/capital/allocate", requireOwner, async (req, res, next) => {
  try {
    const body = allocateSchema.parse(req.body);
    const from = db.state.banks.find((b) => b.tier === "WORLD")!;
    const to = findBankById(body.toBankId);
    if (!to || to.tier !== "NATIONAL") {
      res.status(400).json({ error: "invalid_national_bank" });
      return;
    }
    if ((to.status || "ACTIVE") === "PAUSED") {
      res.status(400).json({ error: "national_bank_paused" });
      return;
    }
    const minRatio = worldOpsDb.state.globalParams.minReserveRatio;
    const metrics = capitalMetrics(from, minRatio);
    if (body.amount > metrics.availableToAllocateEth + 1e-9) {
      res.status(400).json({
        error: "breaches_reserve_ratio",
        message: `Would breach ${minRatio * 100}% global minimum. Available: ${metrics.availableToAllocateEth.toFixed(4)} USDC.`,
        availableToAllocateEth: metrics.availableToAllocateEth,
        unit: "USDC",
      });
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
      note: body.note || `World allocation to ${to.name}`,
      at: db.nowIso(),
    });
    db.save();
    try {
      const { persistBankCapital } = await import("../db/banksSync");
      await persistBankCapital(from.id);
      await persistBankCapital(to.id);
    } catch {
      /* best-effort Prisma mirror */
    }
    res.json({
      ok: true,
      unit: "USDC",
      from,
      to,
      capital: capitalMetrics(from, minRatio),
      auditId: `WALLOC_${to.id}`,
    });
  } catch (err) {
    next(err);
  }
});

/** 41 — Multisig console */
worldBankRouter.get("/multisig", requireOwnerOrSigner, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const world = db.state.banks.find((b) => b.tier === "WORLD")!;
  const minRatio = worldOpsDb.state.globalParams.minReserveRatio;
  const capital = capitalMetrics(world, minRatio);
  const byNb = db.state.banks
    .filter((b) => b.tier === "NATIONAL")
    .map((nb) => ({
      id: nb.id,
      name: nb.name,
      reserveEth: nb.reserve,
      allocatedEth: nb.totalAllocated,
    }));
  const pending = worldOpsDb.state.multisigTxs.filter((t) => t.status === "PENDING");
  const history = worldOpsDb.state.multisigTxs
    .filter((t) => t.status !== "PENDING")
    .sort((a, b) => (b.executedAt || b.createdAt).localeCompare(a.executedAt || a.createdAt));

  res.json({
    threshold: worldOpsDb.state.threshold || MULTISIG_THRESHOLD,
    signerCount: worldOpsDb.state.signers.length,
    signers: worldOpsDb.state.signers,
    viewerIsSigner: isSigner(user.wallet),
    reserve: {
      totalEth: capital.allocatedEth,
      availableEth: capital.availableEth,
      availableToAllocateEth: capital.availableToAllocateEth,
      byNationalBank: byNb,
    },
    pending,
    history,
  });
});

const proposeSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(3).max(500),
  action: z.enum(["ALLOCATE_CAPITAL", "REGISTER_NATIONAL", "PAUSE_NATIONAL", "SET_PARAM", "CUSTOM"]),
  payload: z.record(z.string(), z.unknown()).default({}),
});

worldBankRouter.post("/multisig/propose", requireOwnerOrSigner, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (!isSigner(user.wallet)) {
      res.status(403).json({ error: "not_a_signer" });
      return;
    }
    const body = proposeSchema.parse(req.body);
    const tx = {
      id: worldOpsDb.uid("msig"),
      title: body.title,
      description: body.description,
      action: body.action,
      payload: body.payload,
      status: "PENDING" as const,
      createdAt: worldOpsDb.nowIso(),
      createdBy: user.id,
      signatures: [user.wallet],
    };
    worldOpsDb.state.multisigTxs.unshift(tx);
    worldOpsDb.save();
    res.status(201).json({ ok: true, tx });
  } catch (err) {
    next(err);
  }
});

worldBankRouter.post("/multisig/:id/sign", requireOwnerOrSigner, (req, res) => {
  const user = (req as AuthedRequest).user!;
  if (!isSigner(user.wallet)) {
    res.status(403).json({ error: "not_a_signer" });
    return;
  }
  const tx = worldOpsDb.state.multisigTxs.find((t) => t.id === req.params.id);
  if (!tx || tx.status !== "PENDING") {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const w = user.wallet;
  if (!tx.signatures.some((s) => s.toLowerCase() === w.toLowerCase())) {
    tx.signatures.push(w);
    worldOpsDb.save();
  }
  res.json({
    ok: true,
    tx,
    ready: tx.signatures.length >= (worldOpsDb.state.threshold || MULTISIG_THRESHOLD),
  });
});

function executeMultisigAction(tx: (typeof worldOpsDb.state.multisigTxs)[0], actorId: string) {
  if (tx.action === "ALLOCATE_CAPITAL") {
    const amount = Number(tx.payload.amount);
    const toBankId = String(tx.payload.toBankId || "");
    const from = db.state.banks.find((b) => b.tier === "WORLD")!;
    const to = findBankById(toBankId);
    if (!to || to.tier !== "NATIONAL" || !Number.isFinite(amount) || amount <= 0) {
      return { error: "invalid_allocate_payload" as const };
    }
    const minRatio = worldOpsDb.state.globalParams.minReserveRatio;
    const metrics = capitalMetrics(from, minRatio);
    if (amount > metrics.availableToAllocateEth + 1e-9) {
      return { error: "breaches_reserve_ratio" as const };
    }
    from.reserve -= amount;
    from.totalAllocated += amount;
    to.reserve += amount;
    db.state.transactions.push({
      id: db.uid("tx"),
      type: "ALLOCATION",
      bankId: from.id,
      amount,
      note: `Multisig ${tx.id}: ${tx.title}`,
      at: db.nowIso(),
    });
    db.save();
  } else if (tx.action === "REGISTER_NATIONAL") {
    const name = String(tx.payload.name || "");
    const walletAddress = String(tx.payload.walletAddress || "");
    const jurisdiction = String(tx.payload.jurisdiction || "");
    if (!name || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return { error: "invalid_register_payload" as const };
    }
    if (db.state.banks.some((b) => b.walletAddress.toLowerCase() === walletAddress.toLowerCase())) {
      return { error: "already_registered" as const };
    }
    const world = db.state.banks.find((b) => b.tier === "WORLD")!;
    const id = db.uid("bank_nb");
    db.state.banks.push({
      id,
      tier: "NATIONAL",
      name,
      walletAddress,
      jurisdiction,
      parentBankId: world.id,
      reserve: Number(tx.payload.reserve) || 0,
      totalAllocated: 0,
      totalLent: 0,
      totalRepaid: 0,
      aprBps: Number(tx.payload.aprBps) || 500,
      status: "ACTIVE",
      createdAt: db.nowIso(),
    });
    db.save();
    nationalOpsDb.paramsFor(id);
    nationalOpsDb.save();
  } else if (tx.action === "PAUSE_NATIONAL") {
    const nb = findBankById(String(tx.payload.bankId || ""));
    if (!nb || nb.tier !== "NATIONAL") return { error: "not_found" as const };
    nb.status = "PAUSED";
    db.save();
  } else if (tx.action === "SET_PARAM") {
    const field = String(tx.payload.field || "");
    const value = Number(tx.payload.value);
    if (field === "worldAprBps" && Number.isFinite(value)) {
      worldOpsDb.state.globalParams.worldAprBps = value;
      const world = db.state.banks.find((b) => b.tier === "WORLD");
      if (world) world.aprBps = value;
      db.save();
    } else if (field === "minReserveRatio" && Number.isFinite(value)) {
      worldOpsDb.state.globalParams.minReserveRatio = value;
    }
  }
  tx.status = "EXECUTED";
  tx.executedAt = worldOpsDb.nowIso();
  tx.executedBy = actorId;
  worldOpsDb.save();
  return { ok: true as const };
}

worldBankRouter.post("/multisig/:id/execute", requireOwnerOrSigner, (req, res) => {
  const user = (req as AuthedRequest).user!;
  if (!isSigner(user.wallet)) {
    res.status(403).json({ error: "not_a_signer" });
    return;
  }
  const tx = worldOpsDb.state.multisigTxs.find((t) => t.id === req.params.id);
  if (!tx || tx.status !== "PENDING") {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const need = worldOpsDb.state.threshold || MULTISIG_THRESHOLD;
  if (tx.signatures.length < need) {
    res.status(400).json({
      error: "insufficient_signatures",
      have: tx.signatures.length,
      need,
    });
    return;
  }
  const result = executeMultisigAction(tx, user.id);
  if ("error" in result) {
    res.status(400).json(result);
    return;
  }
  res.json({ ok: true, tx, auditId: `MSIG_EXEC_${tx.id}` });
});

/** 42 — Governance */
worldBankRouter.get("/governance", requireOwner, (_req, res) => {
  const proposals = [...worldOpsDb.state.proposals].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  // Advance voting → timelock when window ended
  const now = Date.now();
  for (const p of proposals) {
    if (p.status === "VOTING" && new Date(p.votingEndsAt).getTime() < now) {
      const passed = p.votesFor.length > p.votesAgainst.length;
      if (passed) {
        p.status = "PASSED_TIMELOCK";
        p.timelockEndsAt = p.timelockEndsAt || worldOpsDb.daysFromNow(2);
      } else {
        p.status = "DEFEATED";
      }
      worldOpsDb.save();
    }
  }
  res.json({
    proposals,
    globalParams: worldOpsDb.state.globalParams,
    votersNote: "Demo: OWNER and multisig signers may vote. Production uses on-chain governor roles.",
  });
});

const proposalSchema = z.object({
  title: z.string().min(5).max(160),
  parameter: z.string().min(2).max(80),
  currentValue: z.string().min(1).max(80),
  proposedValue: z.string().min(1).max(80),
  justification: z.string().min(5).max(500),
  votingDays: z.number().int().min(1).max(30).optional(),
});

worldBankRouter.post("/governance", requireOwner, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = proposalSchema.parse(req.body);
    const p = {
      id: worldOpsDb.uid("gov"),
      title: body.title,
      parameter: body.parameter,
      currentValue: body.currentValue,
      proposedValue: body.proposedValue,
      justification: body.justification,
      status: "VOTING" as const,
      createdAt: worldOpsDb.nowIso(),
      createdBy: user.id,
      votingEndsAt: worldOpsDb.daysFromNow(body.votingDays ?? 5),
      votesFor: [user.id],
      votesAgainst: [] as string[],
    };
    worldOpsDb.state.proposals.unshift(p);
    worldOpsDb.save();
    res.status(201).json({ ok: true, proposal: p });
  } catch (err) {
    next(err);
  }
});

const voteSchema = z.object({
  support: z.boolean(),
});

worldBankRouter.post("/governance/:id/vote", requireOwner, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = voteSchema.parse(req.body);
    const p = worldOpsDb.state.proposals.find((x) => x.id === req.params.id);
    if (!p || p.status !== "VOTING") {
      res.status(404).json({ error: "not_votable" });
      return;
    }
    if (new Date(p.votingEndsAt).getTime() < Date.now()) {
      res.status(400).json({ error: "voting_closed" });
      return;
    }
    p.votesFor = p.votesFor.filter((id) => id !== user.id);
    p.votesAgainst = p.votesAgainst.filter((id) => id !== user.id);
    if (body.support) p.votesFor.push(user.id);
    else p.votesAgainst.push(user.id);
    worldOpsDb.save();
    res.json({ ok: true, proposal: p });
  } catch (err) {
    next(err);
  }
});

worldBankRouter.post("/governance/:id/execute", requireOwner, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const p = worldOpsDb.state.proposals.find((x) => x.id === req.params.id);
  if (!p) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (p.status === "VOTING" && new Date(p.votingEndsAt).getTime() < Date.now()) {
    if (p.votesFor.length > p.votesAgainst.length) {
      p.status = "PASSED_TIMELOCK";
      p.timelockEndsAt = p.timelockEndsAt || worldOpsDb.daysFromNow(2);
      worldOpsDb.save();
    } else {
      p.status = "DEFEATED";
      worldOpsDb.save();
      res.status(400).json({ error: "defeated" });
      return;
    }
  }
  if (p.status !== "PASSED_TIMELOCK") {
    res.status(400).json({ error: "not_ready", status: p.status });
    return;
  }
  if (p.timelockEndsAt && new Date(p.timelockEndsAt).getTime() > Date.now()) {
    res.status(400).json({
      error: "timelock_active",
      timelockEndsAt: p.timelockEndsAt,
    });
    return;
  }

  if (p.parameter === "minReserveRatio") {
    worldOpsDb.state.globalParams.minReserveRatio = Number(p.proposedValue);
  } else if (p.parameter === "worldAprBps") {
    const v = Number(p.proposedValue);
    worldOpsDb.state.globalParams.worldAprBps = v;
    const world = db.state.banks.find((b) => b.tier === "WORLD");
    if (world) {
      world.aprBps = v;
      db.save();
    }
  }

  p.status = "EXECUTED";
  p.executedAt = worldOpsDb.nowIso();
  worldOpsDb.save();
  res.json({
    ok: true,
    proposal: p,
    globalParams: worldOpsDb.state.globalParams,
    auditId: `GOV_EXEC_${p.id}`,
    executedBy: user.id,
  });
});

/** World-level SAR queue (escalated from National) */
worldBankRouter.get("/sar", requireOwner, (req, res) => {
  const status = String(req.query.status || "ESCALATED_WORLD");
  let alerts = localOpsDb.state.amlAlerts.filter((a) =>
    ["ESCALATED_WORLD", "CLOSED"].includes(a.status),
  );
  if (status !== "all") alerts = alerts.filter((a) => a.status === status);
  res.json({
    alerts: alerts.map((a) => ({
      ...a,
      sarRef: a.sarRef || `WB-SAR-${a.id.toUpperCase()}`,
      localBank: findBankById(a.bankId)
        ? { id: a.bankId, name: findBankById(a.bankId)!.name }
        : null,
    })),
  });
});
