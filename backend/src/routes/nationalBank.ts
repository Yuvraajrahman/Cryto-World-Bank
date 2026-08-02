import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import { db, findBankById, type Bank } from "../store/db";
import { localOpsDb } from "../store/localOps";
import { nationalOpsDb } from "../store/nationalOps";

export const nationalBankRouter = Router();

nationalBankRouter.use(requireAuth, requireRoles("NATIONAL_BANK_ADMIN", "OWNER"));

function nationalIdFor(user: { bankId?: string; role: string }) {
  if (user.role === "OWNER") return user.bankId || "bank_nb_bd";
  return user.bankId || "bank_nb_bd";
}

function childLocals(nationalId: string): Bank[] {
  return db.state.banks.filter((b) => b.tier === "LOCAL" && b.parentBankId === nationalId);
}

function capitalMetrics(bank: Bank, minReserveRatio: number) {
  const reserve = bank.reserve ?? 0;
  const allocated = Math.max(bank.totalAllocated || 0, reserve + (bank.totalLent ?? 0), 1);
  const reserveRatio = allocated > 0 ? reserve / allocated : 1;
  const minReserveEth = allocated * minReserveRatio;
  const availableToAllocate = Math.max(0, reserve - minReserveEth);
  return {
    allocatedEth: allocated,
    reserveEth: reserve,
    lentEth: bank.totalLent ?? 0,
    availableEth: Math.max(0, reserve),
    availableToAllocateEth: availableToAllocate,
    reserveRatio,
    minReserveRatio,
    nearMinimum: reserveRatio < minReserveRatio + 0.05,
  };
}

function enrichLocal(lb: Bank, minRatio: number) {
  const book = db.state.loans.filter((l) => l.lenderBankId === lb.id && l.kind === "BORROWER");
  const active = book.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
  const metrics = capitalMetrics(lb, minRatio);
  return {
    ...lb,
    status: lb.status || "ACTIVE",
    capital: metrics,
    loanBook: {
      activeCount: active.length,
      activeValueEth: active.reduce((s, l) => s + l.amount, 0),
    },
    utilization:
      metrics.allocatedEth > 0
        ? Math.min(1, (lb.totalLent || 0) / Math.max(metrics.allocatedEth, 1))
        : 0,
  };
}

/** 35 — National Bank Dashboard */
nationalBankRouter.get("/dashboard", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const nationalId = nationalIdFor(user);
  const bank = findBankById(nationalId);
  if (!bank || bank.tier !== "NATIONAL") {
    res.status(404).json({ error: "national_bank_not_found" });
    return;
  }
  const params = nationalOpsDb.paramsFor(nationalId);
  const capital = capitalMetrics(bank, params.minReserveRatio);
  const locals = childLocals(nationalId).map((lb) => enrichLocal(lb, params.minReserveRatio));
  const childIds = new Set(locals.map((l) => l.id));

  const loans = db.state.loans.filter(
    (l) => l.kind === "BORROWER" && l.lenderBankId && childIds.has(l.lenderBankId),
  );
  const active = loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
  const defaulted = loans.filter((l) => l.status === "DEFAULTED");
  const pendingUpstream = db.state.loans.filter(
    (l) =>
      l.kind === "LOCAL_FROM_NATIONAL" &&
      l.status === "PENDING" &&
      l.lenderBankId === nationalId,
  );
  const capitalOpen = nationalOpsDb.state.capitalRequests.filter(
    (r) => r.toBankId === nationalId && r.status === "OPEN",
  ).length;
  const sarOpen = localOpsDb.state.amlAlerts.filter(
    (a) => childIds.has(a.bankId) && a.status === "ESCALATED",
  ).length;
  const anyChildNearMin = locals.some((l) => l.capital.nearMinimum);

  res.json({
    bank,
    params,
    capital,
    localBanks: locals,
    jurisdiction: {
      localBankCount: locals.length,
      activeLoanCount: active.length,
      activeLoanValueEth: active.reduce((s, l) => s + l.amount, 0),
      defaultRate: loans.length ? defaulted.length / loans.length : 0,
      totalLentEth: locals.reduce((s, l) => s + (l.totalLent || 0), 0),
    },
    queues: {
      capitalRequestsOpen: capitalOpen,
      sarOpen,
      localFromNationalPending: pendingUpstream.length,
    },
    warnings: {
      nationalNearMinimum: capital.nearMinimum,
      childNearMinimum: anyChildNearMin,
    },
  });
});

/** 36 — Local Bank roster */
nationalBankRouter.get("/local-banks", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const nationalId = nationalIdFor(user);
  const params = nationalOpsDb.paramsFor(nationalId);
  const banks = childLocals(nationalId).map((lb) => enrichLocal(lb, params.minReserveRatio));
  res.json({ banks, nationalBankId: nationalId });
});

const registerLocalSchema = z.object({
  name: z.string().min(2).max(120),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  city: z.string().min(2).max(120),
  jurisdiction: z.string().min(2).max(120).optional(),
  reserve: z.number().min(0).optional(),
  aprBps: z.number().int().min(0).max(5000).optional(),
});

nationalBankRouter.post("/local-banks", (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const nationalId = nationalIdFor(user);
    const parent = findBankById(nationalId);
    if (!parent || parent.tier !== "NATIONAL") {
      res.status(404).json({ error: "national_bank_not_found" });
      return;
    }
    const body = registerLocalSchema.parse(req.body);
    const dup = db.state.banks.find(
      (b) => b.walletAddress.toLowerCase() === body.walletAddress.toLowerCase(),
    );
    if (dup) {
      res.status(400).json({ error: "already_registered", bankId: dup.id });
      return;
    }
    const id = db.uid("bank_lb");
    const bank: Bank = {
      id,
      tier: "LOCAL",
      name: body.name,
      walletAddress: body.walletAddress,
      jurisdiction: body.jurisdiction || parent.jurisdiction || "Unknown",
      city: body.city,
      parentBankId: parent.id,
      reserve: body.reserve ?? 0,
      totalAllocated: 0,
      totalLent: 0,
      totalRepaid: 0,
      aprBps: body.aprBps ?? 800,
      status: "ACTIVE",
      createdAt: db.nowIso(),
    };
    db.state.banks.push(bank);
    db.save();
    res.status(201).json({ ok: true, bank, auditId: `LB_REGISTER_${id}` });
  } catch (err) {
    next(err);
  }
});

nationalBankRouter.post("/local-banks/:id/pause", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const nationalId = nationalIdFor(user);
  const lb = findBankById(String(req.params.id));
  if (!lb || lb.tier !== "LOCAL" || lb.parentBankId !== nationalId) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  lb.status = "PAUSED";
  db.save();
  res.json({ ok: true, bank: lb, auditId: `LB_PAUSE_${lb.id}` });
});

nationalBankRouter.post("/local-banks/:id/unpause", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const nationalId = nationalIdFor(user);
  const lb = findBankById(String(req.params.id));
  if (!lb || lb.tier !== "LOCAL" || lb.parentBankId !== nationalId) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  lb.status = "ACTIVE";
  db.save();
  res.json({ ok: true, bank: lb, auditId: `LB_UNPAUSE_${lb.id}` });
});

const editLocalSchema = z.object({
  aprBps: z.number().int().min(0).max(5000).optional(),
  name: z.string().min(2).max(120).optional(),
});

nationalBankRouter.post("/local-banks/:id/params", (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const nationalId = nationalIdFor(user);
    const lb = findBankById(String(req.params.id));
    if (!lb || lb.tier !== "LOCAL" || lb.parentBankId !== nationalId) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const body = editLocalSchema.parse(req.body);
    if (body.aprBps != null) lb.aprBps = body.aprBps;
    if (body.name) lb.name = body.name;
    db.save();
    res.json({ ok: true, bank: lb, auditId: `LB_PARAMS_${lb.id}` });
  } catch (err) {
    next(err);
  }
});

/** 37 — Capital allocation */
nationalBankRouter.get("/capital", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const nationalId = nationalIdFor(user);
  const bank = findBankById(nationalId);
  if (!bank) {
    res.status(404).json({ error: "national_bank_not_found" });
    return;
  }
  const params = nationalOpsDb.paramsFor(nationalId);
  const capital = capitalMetrics(bank, params.minReserveRatio);
  const locals = childLocals(nationalId).map((lb) => enrichLocal(lb, params.minReserveRatio));
  const requests = nationalOpsDb.state.capitalRequests
    .filter((r) => r.toBankId === nationalId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ bank, capital, params, localBanks: locals, requests });
});

const allocateSchema = z.object({
  toBankId: z.string().min(1),
  amount: z.number().positive().max(10_000),
  note: z.string().max(500).optional(),
});

nationalBankRouter.post("/capital/allocate", (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const nationalId = nationalIdFor(user);
    const from = findBankById(nationalId);
    const body = allocateSchema.parse(req.body);
    const to = findBankById(body.toBankId);
    if (!from || from.tier !== "NATIONAL") {
      res.status(404).json({ error: "national_bank_not_found" });
      return;
    }
    if (!to || to.tier !== "LOCAL" || to.parentBankId !== nationalId) {
      res.status(400).json({ error: "invalid_local_bank" });
      return;
    }
    if ((to.status || "ACTIVE") === "PAUSED") {
      res.status(400).json({ error: "local_bank_paused" });
      return;
    }
    const params = nationalOpsDb.paramsFor(nationalId);
    const metrics = capitalMetrics(from, params.minReserveRatio);
    if (body.amount > metrics.availableToAllocateEth + 1e-9) {
      res.status(400).json({
        error: "breaches_reserve_ratio",
        message: `Allocation would leave reserve below the ${params.minReserveRatio * 100}% minimum. Available: ${metrics.availableToAllocateEth.toFixed(4)} ETH.`,
        availableToAllocateEth: metrics.availableToAllocateEth,
        minReserveRatio: params.minReserveRatio,
      });
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
      note: body.note || `Allocation to ${to.name}`,
      at: db.nowIso(),
    });
    db.save();
    res.json({
      ok: true,
      from,
      to,
      capital: capitalMetrics(from, params.minReserveRatio),
      auditId: `ALLOC_${from.id}_${to.id}`,
    });
  } catch (err) {
    next(err);
  }
});

const resolveRequestSchema = z.object({
  decision: z.enum(["APPROVED", "DENIED"]),
  amount: z.number().positive().optional(),
  note: z.string().max(500).optional(),
});

nationalBankRouter.post("/capital/requests/:id/resolve", (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const nationalId = nationalIdFor(user);
    const row = nationalOpsDb.state.capitalRequests.find((r) => r.id === req.params.id);
    if (!row || row.toBankId !== nationalId) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (row.status !== "OPEN") {
      res.status(400).json({ error: "already_resolved", status: row.status });
      return;
    }
    const body = resolveRequestSchema.parse(req.body);
    if (body.decision === "DENIED") {
      row.status = "DENIED";
      row.resolvedAt = nationalOpsDb.nowIso();
      row.resolvedBy = user.id;
      row.resolutionNote = body.note || "Denied";
      nationalOpsDb.save();
      res.json({ ok: true, request: row, auditId: `CREQ_DENY_${row.id}` });
      return;
    }

    const amount = body.amount ?? row.amount;
    const from = findBankById(nationalId)!;
    const to = findBankById(row.fromBankId);
    if (!to) {
      res.status(404).json({ error: "local_bank_missing" });
      return;
    }
    const params = nationalOpsDb.paramsFor(nationalId);
    const metrics = capitalMetrics(from, params.minReserveRatio);
    if (amount > metrics.availableToAllocateEth + 1e-9) {
      res.status(400).json({
        error: "breaches_reserve_ratio",
        availableToAllocateEth: metrics.availableToAllocateEth,
      });
      return;
    }
    from.reserve -= amount;
    from.totalAllocated += amount;
    to.reserve += amount;
    db.state.transactions.push({
      id: db.uid("tx"),
      type: "ALLOCATION",
      bankId: from.id,
      amount,
      note: `Fulfilled capital request ${row.id}`,
      at: db.nowIso(),
    });
    db.save();
    row.status = "APPROVED";
    row.resolvedAt = nationalOpsDb.nowIso();
    row.resolvedBy = user.id;
    row.resolutionNote = body.note || `Allocated ${amount} ETH`;
    row.amount = amount;
    nationalOpsDb.save();
    res.json({
      ok: true,
      request: row,
      from,
      to,
      auditId: `CREQ_APPROVE_${row.id}`,
    });
  } catch (err) {
    next(err);
  }
});

/** 38a — Settings */
nationalBankRouter.get("/settings", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const nationalId = nationalIdFor(user);
  const bank = findBankById(nationalId);
  const params = nationalOpsDb.paramsFor(nationalId);
  const history = nationalOpsDb.state.settingsHistory
    .filter((h) => h.bankId === nationalId)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 20);
  res.json({
    bank,
    params: {
      ...params,
      aprBps: bank?.aprBps ?? params.aprBps,
    },
    history,
    governanceNote:
      "Demo applies parameters immediately off-chain. Production routes changes through multisig / timelock.",
  });
});

const settingsSchema = z.object({
  aprBps: z.number().int().min(0).max(5000).optional(),
  minReserveRatio: z.number().min(0.05).max(0.5).optional(),
  kinkBps: z.number().int().min(1000).max(10_000).optional(),
  kinkMultiplierBps: z.number().int().min(10_000).max(50_000).optional(),
  note: z.string().max(500).optional(),
});

nationalBankRouter.post("/settings", (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const nationalId = nationalIdFor(user);
    const bank = findBankById(nationalId);
    if (!bank) {
      res.status(404).json({ error: "national_bank_not_found" });
      return;
    }
    const body = settingsSchema.parse(req.body);
    const params = nationalOpsDb.paramsFor(nationalId);
    const changes: Array<{ field: "aprBps" | "minReserveRatio" | "kinkBps" | "kinkMultiplierBps"; from: number; to: number }> =
      [];

    if (body.aprBps != null && body.aprBps !== bank.aprBps) {
      changes.push({ field: "aprBps", from: bank.aprBps, to: body.aprBps });
      bank.aprBps = body.aprBps;
      params.aprBps = body.aprBps;
    }
    if (body.minReserveRatio != null && body.minReserveRatio !== params.minReserveRatio) {
      changes.push({
        field: "minReserveRatio",
        from: params.minReserveRatio,
        to: body.minReserveRatio,
      });
      params.minReserveRatio = body.minReserveRatio;
    }
    if (body.kinkBps != null && body.kinkBps !== params.kinkBps) {
      changes.push({ field: "kinkBps", from: params.kinkBps, to: body.kinkBps });
      params.kinkBps = body.kinkBps;
    }
    if (body.kinkMultiplierBps != null && body.kinkMultiplierBps !== params.kinkMultiplierBps) {
      changes.push({
        field: "kinkMultiplierBps",
        from: params.kinkMultiplierBps,
        to: body.kinkMultiplierBps,
      });
      params.kinkMultiplierBps = body.kinkMultiplierBps;
    }

    for (const c of changes) {
      nationalOpsDb.state.settingsHistory.unshift({
        id: nationalOpsDb.uid("nset"),
        bankId: nationalId,
        field: c.field,
        fromValue: c.from,
        toValue: c.to,
        changedBy: user.id,
        at: nationalOpsDb.nowIso(),
        note: body.note,
      });
    }
    db.save();
    nationalOpsDb.save();
    res.json({
      ok: true,
      params: { ...params, aprBps: bank.aprBps },
      changes,
      auditId: changes.length ? `NSET_${nationalId}_${Date.now()}` : null,
    });
  } catch (err) {
    next(err);
  }
});

/** 38b — SAR review (escalated AML from child Local Banks) */
nationalBankRouter.get("/sar", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const nationalId = nationalIdFor(user);
  const childIds = new Set(childLocals(nationalId).map((b) => b.id));
  const status = String(req.query.status || "ESCALATED");
  let alerts = localOpsDb.state.amlAlerts.filter((a) => childIds.has(a.bankId));
  if (status !== "all") {
    alerts = alerts.filter((a) => a.status === status);
  } else {
    alerts = alerts.filter((a) =>
      ["ESCALATED", "CLOSED", "ESCALATED_WORLD"].includes(a.status),
    );
  }
  const enriched = alerts.map((a) => {
    const lb = findBankById(a.bankId);
    return {
      ...a,
      sarRef: a.sarRef || `SAR-${a.id.toUpperCase()}`,
      localBank: lb ? { id: lb.id, name: lb.name, city: lb.city } : null,
    };
  });
  res.json({ alerts: enriched });
});

nationalBankRouter.get("/sar/:id", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const nationalId = nationalIdFor(user);
  const childIds = new Set(childLocals(nationalId).map((b) => b.id));
  const alert = localOpsDb.state.amlAlerts.find((a) => a.id === req.params.id);
  if (!alert || !childIds.has(alert.bankId)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const lb = findBankById(alert.bankId);
  const history = db.state.loans.filter((l) => l.borrowerId === alert.clientUserId).slice(0, 10);
  res.json({
    alert: {
      ...alert,
      sarRef: alert.sarRef || `SAR-${alert.id.toUpperCase()}`,
      localBank: lb ? { id: lb.id, name: lb.name, city: lb.city } : null,
    },
    clientHistory: history,
    model: {
      isolationForestScore: alert.anomalyScore,
      flag: alert.anomalyScore >= 0.7,
      reason: alert.reason,
    },
  });
});

const sarActionSchema = z.object({
  reason: z.string().min(3).max(500),
});

nationalBankRouter.post("/sar/:id/resolve", (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const nationalId = nationalIdFor(user);
    const childIds = new Set(childLocals(nationalId).map((b) => b.id));
    const alert = localOpsDb.state.amlAlerts.find((a) => a.id === req.params.id);
    if (!alert || !childIds.has(alert.bankId) || alert.status !== "ESCALATED") {
      res.status(404).json({ error: "not_found_or_not_escalated" });
      return;
    }
    const body = sarActionSchema.parse(req.body);
    alert.status = "CLOSED";
    alert.resolvedAt = localOpsDb.nowIso();
    alert.resolvedBy = user.id;
    alert.resolutionNote = `NB closed: ${body.reason}`;
    localOpsDb.save();
    res.json({ ok: true, alert, auditId: `SAR_CLOSE_${alert.id}` });
  } catch (err) {
    next(err);
  }
});

nationalBankRouter.post("/sar/:id/escalate-world", (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const nationalId = nationalIdFor(user);
    const childIds = new Set(childLocals(nationalId).map((b) => b.id));
    const alert = localOpsDb.state.amlAlerts.find((a) => a.id === req.params.id);
    if (!alert || !childIds.has(alert.bankId) || alert.status !== "ESCALATED") {
      res.status(404).json({ error: "not_found_or_not_escalated" });
      return;
    }
    const body = sarActionSchema.parse(req.body);
    alert.status = "ESCALATED_WORLD";
    alert.resolvedAt = localOpsDb.nowIso();
    alert.resolvedBy = user.id;
    alert.resolutionNote = `Escalated to World Bank: ${body.reason}`;
    localOpsDb.save();
    res.json({
      ok: true,
      alert,
      worldRef: `WB-SAR-${alert.id.toUpperCase()}`,
      auditId: `SAR_WORLD_${alert.id}`,
    });
  } catch (err) {
    next(err);
  }
});
