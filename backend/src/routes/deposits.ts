import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import {
  depositsDb,
  ensureBalances,
  pushLedger,
  estimateAccruedYield,
  VAULT_APY_BPS,
  YIELD_SPLIT,
  FD_TERMS,
  EARLY_PENALTY_BPS,
  RESERVE_RATIO_OK,
  RESERVE_RATIO_BPS,
  RESERVE_MIN_BPS,
  type FixedDeposit,
} from "../store/deposits";
import { findUserByWallet } from "../store/db";

export const depositsRouter = Router();
depositsRouter.use(requireAuth, requireRoles("BORROWER"));

depositsRouter.get("/summary", (req, res) => {
  const user = (req as AuthedRequest).user!;
  ensureBalances(user.id);
  depositsDb.save();
  const vault = depositsDb.state.vaultBalances[user.id] ?? 0;
  const accrued = estimateAccruedYield(vault);
  const checking = depositsDb.state.checkingBalances[user.id] ?? 0;
  const fds = depositsDb.state.fixedDeposits.filter((f) => f.userId === user.id);
  const fdActive = fds
    .filter((f) => f.status === "ACTIVE" || f.status === "MATURED")
    .reduce((s, f) => s + f.principal, 0);
  res.json({
    vaultEth: vault,
    vaultPrincipalEth: vault,
    vaultAccruedEth: accrued,
    vaultTotalEth: vault + accrued,
    vaultApyBps: VAULT_APY_BPS,
    yieldSplit: YIELD_SPLIT,
    checkingEth: checking,
    fixedEth: fdActive,
    reserveRatioOk: RESERVE_RATIO_OK,
    reserveRatioBps: RESERVE_RATIO_BPS,
    reserveMinBps: RESERVE_MIN_BPS,
    withdrawalBlockedReason: RESERVE_RATIO_OK
      ? null
      : "System reserve ratio is below the minimum. Vault withdrawals are paused until the ratio recovers — your principal remains safe in the vault.",
    fdTerms: FD_TERMS,
    earlyPenaltyBps: EARLY_PENALTY_BPS,
  });
});

depositsRouter.get("/ledger", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const kind = String(req.query.kind || "");
  let rows = depositsDb.state.ledger.filter((e) => e.userId === user.id);
  if (kind === "vault") {
    rows = rows.filter((e) => e.kind.startsWith("VAULT_"));
  } else if (kind === "fd") {
    rows = rows.filter((e) => e.kind.startsWith("FD_"));
  } else if (kind === "checking") {
    rows = rows.filter((e) => e.kind.startsWith("CHECK_"));
  }
  res.json({ entries: rows.slice(0, 100) });
});

const amountSchema = z.object({
  amount: z.number().positive().max(10_000),
});

depositsRouter.post("/vault/deposit", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const body = amountSchema.parse(req.body);
  ensureBalances(user.id);
  const checking = depositsDb.state.checkingBalances[user.id] ?? 0;
  if (body.amount > checking + 1e-9) {
    res.status(400).json({
      error: "insufficient_checking",
      message: "Amount exceeds checking balance available to deposit.",
      checking,
    });
    return;
  }
  depositsDb.state.checkingBalances[user.id] = checking - body.amount;
  depositsDb.state.vaultBalances[user.id] =
    (depositsDb.state.vaultBalances[user.id] ?? 0) + body.amount;
  const entry = pushLedger({
    userId: user.id,
    kind: "VAULT_DEPOSIT",
    amount: body.amount,
    note: "Deposit to savings vault",
  });
  depositsDb.save();
  res.status(201).json({
    ok: true,
    vaultEth: depositsDb.state.vaultBalances[user.id],
    checkingEth: depositsDb.state.checkingBalances[user.id],
    entry,
  });
});

depositsRouter.post("/vault/withdraw", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const body = amountSchema.parse(req.body);
  ensureBalances(user.id);
  if (!RESERVE_RATIO_OK) {
    res.status(400).json({
      error: "withdrawal_blocked",
      message:
        "System reserve ratio is below the minimum — withdrawals paused. Your principal remains in the vault.",
      reserveRatioBps: RESERVE_RATIO_BPS,
      reserveMinBps: RESERVE_MIN_BPS,
    });
    return;
  }
  const vault = depositsDb.state.vaultBalances[user.id] ?? 0;
  if (body.amount > vault + 1e-9) {
    res.status(400).json({
      error: "insufficient_vault",
      message: "Amount exceeds vault balance.",
      vault,
    });
    return;
  }
  depositsDb.state.vaultBalances[user.id] = vault - body.amount;
  depositsDb.state.checkingBalances[user.id] =
    (depositsDb.state.checkingBalances[user.id] ?? 0) + body.amount;
  const entry = pushLedger({
    userId: user.id,
    kind: "VAULT_WITHDRAW",
    amount: body.amount,
    note: "Withdraw from savings vault",
  });
  depositsDb.save();
  res.json({
    ok: true,
    vaultEth: depositsDb.state.vaultBalances[user.id],
    checkingEth: depositsDb.state.checkingBalances[user.id],
    entry,
  });
});

depositsRouter.get("/fixed", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const list = depositsDb.state.fixedDeposits
    .filter((f) => f.userId === user.id)
    .map((f) => enrichFd(f));
  res.json({ deposits: list, terms: FD_TERMS, earlyPenaltyBps: EARLY_PENALTY_BPS });
});

function enrichFd(f: FixedDeposit) {
  const matured = new Date(f.maturesAt).getTime() <= Date.now();
  let status = f.status;
  if (status === "ACTIVE" && matured) status = "MATURED";
  const interest =
    (f.principal * f.aprBps * f.termDays) / (10_000 * 365);
  return {
    ...f,
    status,
    projectedPayout: f.principal + interest,
    interest,
  };
}

const fdOpenSchema = z.object({
  amount: z.number().positive().max(10_000),
  termDays: z.number().int().refine((d) => FD_TERMS.some((t) => t.termDays === d)),
});

depositsRouter.post("/fixed/open", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const body = fdOpenSchema.parse(req.body);
  ensureBalances(user.id);
  const checking = depositsDb.state.checkingBalances[user.id] ?? 0;
  if (body.amount > checking + 1e-9) {
    res.status(400).json({
      error: "insufficient_checking",
      message: "Amount exceeds checking balance.",
      checking,
    });
    return;
  }
  const term = FD_TERMS.find((t) => t.termDays === body.termDays)!;
  depositsDb.state.checkingBalances[user.id] = checking - body.amount;
  const openedAt = depositsDb.nowIso();
  const matures = new Date(openedAt);
  matures.setDate(matures.getDate() + body.termDays);
  const fd: FixedDeposit = {
    id: depositsDb.uid("fd"),
    userId: user.id,
    principal: body.amount,
    termDays: body.termDays,
    aprBps: term.aprBps,
    openedAt,
    maturesAt: matures.toISOString(),
    status: "ACTIVE",
    penaltyBps: EARLY_PENALTY_BPS,
  };
  depositsDb.state.fixedDeposits.push(fd);
  const entry = pushLedger({
    userId: user.id,
    kind: "FD_OPEN",
    amount: body.amount,
    note: `Fixed deposit ${body.termDays}d @ ${term.aprBps} bps`,
  });
  depositsDb.save();
  res.status(201).json({ ok: true, deposit: enrichFd(fd), entry });
});

depositsRouter.post("/fixed/:id/withdraw", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const early = Boolean(req.body?.early);
  const fd = depositsDb.state.fixedDeposits.find(
    (f) => f.id === String(req.params.id) && f.userId === user.id,
  );
  if (!fd) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (fd.status === "WITHDRAWN" || fd.status === "EARLY_WITHDRAWN") {
    res.status(400).json({ error: "already_withdrawn" });
    return;
  }
  ensureBalances(user.id);
  const matured = new Date(fd.maturesAt).getTime() <= Date.now();
  if (!matured && !early) {
    res.status(400).json({ error: "not_matured", maturesAt: fd.maturesAt });
    return;
  }
  let payout = fd.principal;
  if (matured) {
    payout += (fd.principal * fd.aprBps * fd.termDays) / (10_000 * 365);
    fd.status = "WITHDRAWN";
  } else {
    const penalty = (fd.principal * EARLY_PENALTY_BPS) / 10_000;
    payout = Math.max(0, fd.principal - penalty);
    fd.status = "EARLY_WITHDRAWN";
  }
  depositsDb.state.checkingBalances[user.id] =
    (depositsDb.state.checkingBalances[user.id] ?? 0) + payout;
  const entry = pushLedger({
    userId: user.id,
    kind: matured ? "FD_MATURE" : "FD_EARLY",
    amount: payout,
    note: matured ? "Matured fixed deposit" : "Early withdrawal with penalty",
  });
  depositsDb.save();
  res.json({ ok: true, payout, deposit: enrichFd(fd), entry });
});

const sendSchema = z.object({
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.number().positive().max(10_000),
});

depositsRouter.post("/checking/send", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const body = sendSchema.parse(req.body);
  if (user.frozen) {
    res.status(403).json({ error: "account_frozen" });
    return;
  }
  ensureBalances(user.id);
  const checking = depositsDb.state.checkingBalances[user.id] ?? 0;
  if (body.amount > checking + 1e-9) {
    res.status(400).json({
      error: "insufficient_checking",
      message: "Amount exceeds checking balance.",
      checking,
    });
    return;
  }
  depositsDb.state.checkingBalances[user.id] = checking - body.amount;
  const sendEntry = pushLedger({
    userId: user.id,
    kind: "CHECK_SEND",
    amount: body.amount,
    counterparty: body.toAddress.toLowerCase(),
    note: "Checking transfer out",
  });

  const recipient = findUserByWallet(body.toAddress);
  let recvEntry = null;
  if (recipient && !recipient.frozen) {
    ensureBalances(recipient.id);
    depositsDb.state.checkingBalances[recipient.id] =
      (depositsDb.state.checkingBalances[recipient.id] ?? 0) + body.amount;
    recvEntry = pushLedger({
      userId: recipient.id,
      kind: "CHECK_RECV",
      amount: body.amount,
      counterparty: user.wallet.toLowerCase(),
      note: "Checking transfer in",
    });
  }

  depositsDb.save();
  res.status(201).json({
    ok: true,
    checkingEth: depositsDb.state.checkingBalances[user.id],
    entry: sendEntry,
    recipientCredited: Boolean(recipient && !recipient.frozen),
    recvEntry,
  });
});
