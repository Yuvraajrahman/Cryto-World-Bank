/**
 * Client deposits API — Postgres-backed (checking / vault / FD / convert / FX).
 */
import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import {
  ensureDepositAccount,
  updateDepositAccount,
  pushDepositLedger,
  listDepositLedger,
  listFixedDeposits,
  createFixedDeposit,
  findFixedDeposit,
  updateFixedDepositStatus,
  estimateAccruedYield,
  VAULT_APY_BPS,
  YIELD_SPLIT,
  FD_TERMS,
  EARLY_PENALTY_BPS,
  RESERVE_RATIO_OK,
  RESERVE_RATIO_BPS,
  RESERVE_MIN_BPS,
  USD_USDC_RATE,
  CLIENT_FX_USDC_PER_ETH,
  CLIENT_FX_SPREAD_BPS,
  type FixedDepositView,
} from "../db/clientDeposits";
import { findUserByWalletPg, findUserByLoginIdentifierPg } from "../db/users";

export const depositsRouter = Router();
depositsRouter.use(requireAuth, requireRoles("BORROWER"));

depositsRouter.get("/summary", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const acct = await ensureDepositAccount(user.id);
    const accrued = estimateAccruedYield(acct.vaultUsdc);
    const fds = await listFixedDeposits(user.id);
    const fdActive = fds
      .filter((f) => f.status === "ACTIVE" || f.status === "MATURED")
      .reduce((s, f) => s + f.principal, 0);
    res.json({
      vaultEth: acct.vaultUsdc,
      vaultPrincipalEth: acct.vaultUsdc,
      vaultAccruedEth: accrued,
      vaultTotalEth: acct.vaultUsdc + accrued,
      vaultApyBps: VAULT_APY_BPS,
      yieldSplit: YIELD_SPLIT,
      checkingEth: acct.checkingUsdc,
      checkingUsdc: acct.checkingUsdc,
      ethBalance: acct.ethBalance,
      fiatUsd: acct.fiatUsd,
      fixedEth: fdActive,
      reserveRatioOk: RESERVE_RATIO_OK,
      reserveRatioBps: RESERVE_RATIO_BPS,
      reserveMinBps: RESERVE_MIN_BPS,
      withdrawalBlockedReason: RESERVE_RATIO_OK
        ? null
        : "System reserve ratio is below the minimum. Vault withdrawals are paused until the ratio recovers — your principal remains safe in the vault.",
      fdTerms: FD_TERMS,
      earlyPenaltyBps: EARLY_PENALTY_BPS,
      fx: {
        usdcPerEth: CLIENT_FX_USDC_PER_ETH,
        spreadBps: CLIENT_FX_SPREAD_BPS,
        usdUsdcRate: USD_USDC_RATE,
      },
    });
  } catch (err) {
    next(err);
  }
});

depositsRouter.get("/ledger", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const kind = String(req.query.kind || "");
    let prefix: string | undefined;
    if (kind === "vault") prefix = "VAULT_";
    else if (kind === "fd") prefix = "FD_";
    else if (kind === "checking") prefix = "CHECK_";
    const entries = await listDepositLedger(user.id, { kindPrefix: prefix, limit: 100 });
    res.json({ entries });
  } catch (err) {
    next(err);
  }
});

const amountSchema = z.object({
  amount: z.number().positive().max(10_000),
});

depositsRouter.post("/vault/deposit", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = amountSchema.parse(req.body);
    const acct = await ensureDepositAccount(user.id);
    if (body.amount > acct.checkingUsdc + 1e-9) {
      res.status(400).json({
        error: "insufficient_checking",
        message: "Amount exceeds checking balance available to deposit.",
        checking: acct.checkingUsdc,
      });
      return;
    }
    const updated = await updateDepositAccount(user.id, {
      checkingUsdc: acct.checkingUsdc - body.amount,
      vaultUsdc: acct.vaultUsdc + body.amount,
    });
    const entry = await pushDepositLedger({
      userId: user.id,
      kind: "VAULT_DEPOSIT",
      amount: body.amount,
      note: "Deposit to savings vault",
    });
    res.status(201).json({
      ok: true,
      vaultEth: updated.vaultUsdc,
      checkingEth: updated.checkingUsdc,
      entry,
    });
  } catch (err) {
    next(err);
  }
});

depositsRouter.post("/vault/withdraw", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = amountSchema.parse(req.body);
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
    const acct = await ensureDepositAccount(user.id);
    if (body.amount > acct.vaultUsdc + 1e-9) {
      res.status(400).json({
        error: "insufficient_vault",
        message: "Amount exceeds vault balance.",
        vault: acct.vaultUsdc,
      });
      return;
    }
    const updated = await updateDepositAccount(user.id, {
      vaultUsdc: acct.vaultUsdc - body.amount,
      checkingUsdc: acct.checkingUsdc + body.amount,
    });
    const entry = await pushDepositLedger({
      userId: user.id,
      kind: "VAULT_WITHDRAW",
      amount: body.amount,
      note: "Withdraw from savings vault",
    });
    res.json({
      ok: true,
      vaultEth: updated.vaultUsdc,
      checkingEth: updated.checkingUsdc,
      entry,
    });
  } catch (err) {
    next(err);
  }
});

function enrichFd(f: FixedDepositView) {
  const matured = new Date(f.maturesAt).getTime() <= Date.now();
  let status = f.status;
  if (status === "ACTIVE" && matured) status = "MATURED";
  const interest = (f.principal * f.aprBps * f.termDays) / (10_000 * 365);
  return {
    ...f,
    status,
    projectedPayout: f.principal + interest,
    interest,
  };
}

depositsRouter.get("/fixed", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const list = (await listFixedDeposits(user.id)).map(enrichFd);
    res.json({ deposits: list, terms: FD_TERMS, earlyPenaltyBps: EARLY_PENALTY_BPS });
  } catch (err) {
    next(err);
  }
});

const fdOpenSchema = z.object({
  amount: z.number().positive().max(10_000),
  termDays: z.number().int().refine((d) => FD_TERMS.some((t) => t.termDays === d)),
});

depositsRouter.post("/fixed/open", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = fdOpenSchema.parse(req.body);
    const acct = await ensureDepositAccount(user.id);
    if (body.amount > acct.checkingUsdc + 1e-9) {
      res.status(400).json({
        error: "insufficient_checking",
        message: "Amount exceeds checking balance.",
        checking: acct.checkingUsdc,
      });
      return;
    }
    const term = FD_TERMS.find((t) => t.termDays === body.termDays)!;
    await updateDepositAccount(user.id, {
      checkingUsdc: acct.checkingUsdc - body.amount,
    });
    const fd = await createFixedDeposit({
      userId: user.id,
      principal: body.amount,
      termDays: body.termDays,
      aprBps: term.aprBps,
    });
    const entry = await pushDepositLedger({
      userId: user.id,
      kind: "FD_OPEN",
      amount: body.amount,
      note: `Fixed deposit ${body.termDays}d @ ${term.aprBps} bps`,
    });
    res.status(201).json({ ok: true, deposit: enrichFd(fd), entry });
  } catch (err) {
    next(err);
  }
});

depositsRouter.post("/fixed/:id/withdraw", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const early = Boolean(req.body?.early);
    const fd = await findFixedDeposit(String(req.params.id), user.id);
    if (!fd) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (fd.status === "WITHDRAWN" || fd.status === "EARLY_WITHDRAWN") {
      res.status(400).json({ error: "already_withdrawn" });
      return;
    }
    const matured = new Date(fd.maturesAt).getTime() <= Date.now();
    if (!matured && !early) {
      res.status(400).json({ error: "not_matured", maturesAt: fd.maturesAt });
      return;
    }
    let payout = fd.principal;
    let status: string;
    if (matured) {
      payout += (fd.principal * fd.aprBps * fd.termDays) / (10_000 * 365);
      status = "WITHDRAWN";
    } else {
      const penalty = (fd.principal * EARLY_PENALTY_BPS) / 10_000;
      payout = Math.max(0, fd.principal - penalty);
      status = "EARLY_WITHDRAWN";
    }
    const acct = await ensureDepositAccount(user.id);
    await updateDepositAccount(user.id, {
      checkingUsdc: acct.checkingUsdc + payout,
    });
    const updated = await updateFixedDepositStatus(fd.id, status);
    const entry = await pushDepositLedger({
      userId: user.id,
      kind: matured ? "FD_MATURE" : "FD_EARLY",
      amount: payout,
      note: matured ? "Matured fixed deposit" : "Early withdrawal with penalty",
    });
    res.json({ ok: true, payout, deposit: enrichFd(updated), entry });
  } catch (err) {
    next(err);
  }
});

const sendSchema = z
  .object({
    toAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/)
      .optional(),
    toLoginId: z.string().min(2).max(80).optional(),
    amount: z.number().positive().max(100_000),
    memo: z.string().max(200).optional(),
  })
  .refine((b) => Boolean(b.toAddress || b.toLoginId), {
    message: "Provide toAddress or toLoginId",
  });

depositsRouter.get("/checking/resolve", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) {
      res.status(400).json({ error: "query_required" });
      return;
    }
    let user = null;
    if (/^0x[a-fA-F0-9]{40}$/i.test(q)) {
      user = await findUserByWalletPg(q);
    } else {
      const found = await findUserByLoginIdentifierPg(q);
      user = found?.user ?? null;
    }
    if (!user || user.role !== "BORROWER") {
      res.status(404).json({ error: "recipient_not_found" });
      return;
    }
    if (user.frozen) {
      res.status(400).json({ error: "recipient_frozen" });
      return;
    }
    res.json({
      id: user.id,
      displayName: user.displayName,
      loginId: user.loginId,
      wallet: user.wallet,
    });
  } catch (err) {
    next(err);
  }
});

depositsRouter.post("/checking/send", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = sendSchema.parse(req.body);
    if (user.frozen) {
      res.status(403).json({ error: "account_frozen" });
      return;
    }

    let recipient = null as Awaited<ReturnType<typeof findUserByWalletPg>>;
    if (body.toLoginId) {
      const found = await findUserByLoginIdentifierPg(body.toLoginId);
      recipient = found?.user ?? null;
    } else if (body.toAddress) {
      recipient = await findUserByWalletPg(body.toAddress);
    }

    if (!recipient || recipient.role !== "BORROWER") {
      res.status(404).json({
        error: "recipient_not_found",
        message: "Recipient must be an active client (wallet or login ID).",
      });
      return;
    }
    if (recipient.id === user.id) {
      res.status(400).json({ error: "cannot_send_to_self" });
      return;
    }
    if (recipient.frozen) {
      res.status(400).json({ error: "recipient_frozen" });
      return;
    }

    const acct = await ensureDepositAccount(user.id);
    if (body.amount > acct.checkingUsdc + 1e-9) {
      res.status(400).json({
        error: "insufficient_checking",
        message: "Amount exceeds checking balance.",
        checking: acct.checkingUsdc,
      });
      return;
    }

    const senderAfter = await updateDepositAccount(user.id, {
      checkingUsdc: acct.checkingUsdc - body.amount,
    });
    const sendEntry = await pushDepositLedger({
      userId: user.id,
      kind: "CHECK_SEND",
      amount: body.amount,
      counterparty: recipient.wallet.toLowerCase(),
      note: body.memo || `P2P to ${recipient.loginId || recipient.displayName}`,
    });

    const recvAcct = await ensureDepositAccount(recipient.id);
    await updateDepositAccount(recipient.id, {
      checkingUsdc: recvAcct.checkingUsdc + body.amount,
    });
    const recvEntry = await pushDepositLedger({
      userId: recipient.id,
      kind: "CHECK_RECV",
      amount: body.amount,
      counterparty: user.wallet.toLowerCase(),
      note: body.memo || `P2P from ${user.loginId || user.displayName}`,
    });

    try {
      const { createNotification } = await import("../db/notifications");
      await createNotification({
        userId: recipient.id,
        category: "payment",
        title: "USDC received",
        body: `${user.displayName || "A client"} sent you ${body.amount.toFixed(2)} USDC.`,
        href: "/app/account/checking",
      });
    } catch {
      /* optional */
    }

    res.status(201).json({
      ok: true,
      unit: "USDC",
      checkingEth: senderAfter.checkingUsdc,
      checkingUsdc: senderAfter.checkingUsdc,
      entry: sendEntry,
      recipientCredited: true,
      recipient: {
        id: recipient.id,
        displayName: recipient.displayName,
        loginId: recipient.loginId,
        wallet: recipient.wallet,
      },
      recvEntry,
    });
  } catch (err) {
    next(err);
  }
});

const convertSchema = z.object({
  amountUsd: z.number().positive().max(100_000),
});

depositsRouter.post("/convert/usd-to-usdc", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = convertSchema.parse(req.body);
    const acct = await ensureDepositAccount(user.id);
    if (body.amountUsd > acct.fiatUsd + 1e-9) {
      res.status(400).json({
        error: "insufficient_fiat",
        fiatUsd: acct.fiatUsd,
        message: "Not enough simulated USD balance. Demo top-up is automatic on first visit.",
      });
      return;
    }
    const usdc = body.amountUsd * USD_USDC_RATE;
    const updated = await updateDepositAccount(user.id, {
      fiatUsd: acct.fiatUsd - body.amountUsd,
      checkingUsdc: acct.checkingUsdc + usdc,
    });
    const entry = await pushDepositLedger({
      userId: user.id,
      kind: "USD_TO_USDC",
      amount: usdc,
      note: `Converted $${body.amountUsd.toFixed(2)} USD → ${usdc.toFixed(2)} USDC`,
    });
    res.status(201).json({
      ok: true,
      usdcCredited: usdc,
      checkingUsdc: updated.checkingUsdc,
      fiatUsd: updated.fiatUsd,
      entry,
    });
  } catch (err) {
    next(err);
  }
});

depositsRouter.post("/convert/fiat-topup", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const amount = z.object({ amountUsd: z.number().positive().max(50_000) }).parse(req.body);
    const acct = await ensureDepositAccount(user.id);
    const updated = await updateDepositAccount(user.id, {
      fiatUsd: acct.fiatUsd + amount.amountUsd,
    });
    res.json({ ok: true, fiatUsd: updated.fiatUsd });
  } catch (err) {
    next(err);
  }
});

const fxSchema = z.object({
  side: z.enum(["USDC_TO_ETH", "ETH_TO_USDC"]),
  amount: z.number().positive().max(1_000_000),
});

depositsRouter.post("/fx/swap", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = fxSchema.parse(req.body);
    const acct = await ensureDepositAccount(user.id);
    const rate = CLIENT_FX_USDC_PER_ETH;
    const mult = 1 - CLIENT_FX_SPREAD_BPS / 10_000;

    if (body.side === "USDC_TO_ETH") {
      if (body.amount > acct.checkingUsdc + 1e-9) {
        res.status(400).json({ error: "insufficient_usdc", checkingUsdc: acct.checkingUsdc });
        return;
      }
      const ethOut = (body.amount / rate) * mult;
      const updated = await updateDepositAccount(user.id, {
        checkingUsdc: acct.checkingUsdc - body.amount,
        ethBalance: acct.ethBalance + ethOut,
      });
      const entry = await pushDepositLedger({
        userId: user.id,
        kind: "FX_USDC_TO_ETH",
        amount: body.amount,
        note: `Sold ${body.amount} USDC → ${ethOut.toFixed(6)} ETH`,
      });
      res.status(201).json({
        ok: true,
        ethReceived: ethOut,
        checkingUsdc: updated.checkingUsdc,
        ethBalance: updated.ethBalance,
        entry,
      });
      return;
    }

    if (body.amount > acct.ethBalance + 1e-9) {
      res.status(400).json({ error: "insufficient_eth", ethBalance: acct.ethBalance });
      return;
    }
    const usdcOut = body.amount * rate * mult;
    const updated = await updateDepositAccount(user.id, {
      ethBalance: acct.ethBalance - body.amount,
      checkingUsdc: acct.checkingUsdc + usdcOut,
    });
    const entry = await pushDepositLedger({
      userId: user.id,
      kind: "FX_ETH_TO_USDC",
      amount: usdcOut,
      note: `Sold ${body.amount} ETH → ${usdcOut.toFixed(2)} USDC`,
    });
    res.status(201).json({
      ok: true,
      usdcReceived: usdcOut,
      checkingUsdc: updated.checkingUsdc,
      ethBalance: updated.ethBalance,
      entry,
    });
  } catch (err) {
    next(err);
  }
});

depositsRouter.get("/statement", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const acct = await ensureDepositAccount(user.id);
    const rows = await listDepositLedger(user.id, { limit: 200 });
    res.json({
      generatedAt: new Date().toISOString(),
      account: {
        displayName: user.displayName,
        loginId: user.loginId,
        wallet: user.wallet,
      },
      balances: {
        checkingUsdc: acct.checkingUsdc,
        vaultUsdc: acct.vaultUsdc,
        eth: acct.ethBalance,
        fiatUsd: acct.fiatUsd,
      },
      entries: rows,
    });
  } catch (err) {
    next(err);
  }
});
