/**
 * Treasury FX swap API — World ↔ National ↔ Local (adjacent tiers + World↔Local).
 * USDC uses bank.reserve; ETH uses treasuryOps ethBalances.
 */
import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import { db, findBankById, type Bank } from "../store/db";
import { worldOpsDb } from "../store/worldOps";
import {
  treasuryOpsDb,
  quoteBuyAmount,
  usdcNotional,
  type TreasuryAsset,
  type TreasurySwap,
} from "../store/treasuryOps";
import { persistBankCapital } from "../db/banksSync";

export const treasuryRouter = Router();
treasuryRouter.use(
  requireAuth,
  requireRoles("OWNER", "NATIONAL_BANK_ADMIN", "LOCAL_BANK_ADMIN", "DEV_ADMIN"),
);

const MIN_RESERVE = () => worldOpsDb.state.globalParams.minReserveRatio ?? 0.15;

function seedEthFor(bank: Bank): number {
  // Bootstrap ETH treasury ~ proportional to USDC reserve (demo inventory)
  if (bank.tier === "WORLD") return Math.max(50_000, (bank.reserve || 0) / 3200 / 20);
  if (bank.tier === "NATIONAL") return Math.max(200, (bank.reserve || 0) / 3200 / 10);
  return Math.max(20, (bank.reserve || 0) / 3200 / 8);
}

function ensureBankEth(bank: Bank) {
  if (treasuryOpsDb.state.ethBalances[bank.id] == null) {
    treasuryOpsDb.ensureEth(bank.id, seedEthFor(bank));
    treasuryOpsDb.save();
  }
}

function actorBank(user: { role: string; bankId?: string }): Bank | null {
  if (user.role === "OWNER" || user.role === "DEV_ADMIN") {
    return db.state.banks.find((b) => b.tier === "WORLD") || null;
  }
  if (!user.bankId) return null;
  return findBankById(user.bankId) || null;
}

/** Allowed counterparties: World↔NB, World↔LB, NB↔child LB, NB↔World, LB↔parent NB, LB↔World. */
function canSwap(a: Bank, b: Bank): boolean {
  if (a.id === b.id) return false;
  const tiers = new Set([a.tier, b.tier]);
  if (tiers.has("WORLD") && tiers.has("NATIONAL")) return true;
  if (tiers.has("WORLD") && tiers.has("LOCAL")) return true;
  if (a.tier === "NATIONAL" && b.tier === "LOCAL" && b.parentBankId === a.id) return true;
  if (b.tier === "NATIONAL" && a.tier === "LOCAL" && a.parentBankId === b.id) return true;
  return false;
}

function availableUsdc(bank: Bank): number {
  const allocated = Math.max(bank.totalAllocated || 0, bank.reserve + (bank.totalLent || 0), 1);
  const minKeep = allocated * MIN_RESERVE();
  return Math.max(0, bank.reserve - minKeep);
}

function balancesFor(bank: Bank) {
  ensureBankEth(bank);
  return {
    bankId: bank.id,
    name: bank.name,
    tier: bank.tier,
    usdc: bank.reserve,
    eth: treasuryOpsDb.getEth(bank.id),
    availableUsdc: availableUsdc(bank),
    availableEth: treasuryOpsDb.getEth(bank.id),
  };
}

function enrichSwap(s: TreasurySwap) {
  return {
    ...s,
    initiator: findBankById(s.initiatorBankId)
      ? { id: s.initiatorBankId, name: findBankById(s.initiatorBankId)!.name, tier: findBankById(s.initiatorBankId)!.tier }
      : null,
    counterparty: findBankById(s.counterpartyBankId)
      ? {
          id: s.counterpartyBankId,
          name: findBankById(s.counterpartyBankId)!.name,
          tier: findBankById(s.counterpartyBankId)!.tier,
        }
      : null,
  };
}

treasuryRouter.get("/overview", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const mine = actorBank(user);
  if (!mine) {
    res.status(404).json({ error: "bank_not_found" });
    return;
  }
  ensureBankEth(mine);

  let counterparties: Bank[] = [];
  if (mine.tier === "WORLD") {
    counterparties = db.state.banks.filter((b) => b.tier === "NATIONAL" || b.tier === "LOCAL");
  } else if (mine.tier === "NATIONAL") {
    const world = db.state.banks.find((b) => b.tier === "WORLD");
    const locals = db.state.banks.filter((b) => b.tier === "LOCAL" && b.parentBankId === mine.id);
    counterparties = [...(world ? [world] : []), ...locals];
  } else {
    const world = db.state.banks.find((b) => b.tier === "WORLD");
    const parent = mine.parentBankId ? findBankById(mine.parentBankId) : null;
    counterparties = [...(world ? [world] : []), ...(parent ? [parent] : [])];
  }

  // Cap list size for World (many locals)
  if (mine.tier === "WORLD") {
    const nationals = counterparties.filter((b) => b.tier === "NATIONAL").slice(0, 50);
    const locals = counterparties.filter((b) => b.tier === "LOCAL").slice(0, 30);
    counterparties = [...nationals, ...locals];
  }

  counterparties.forEach(ensureBankEth);

  const open = treasuryOpsDb.state.swaps.filter(
    (s) =>
      (s.initiatorBankId === mine.id || s.counterpartyBankId === mine.id) &&
      (s.status === "PROPOSED" || s.status === "PENDING_MULTISIG"),
  );
  const history = treasuryOpsDb.state.swaps
    .filter((s) => s.initiatorBankId === mine.id || s.counterpartyBankId === mine.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 40);

  res.json({
    unit: { usdc: "USDC", eth: "ETH" },
    oracleUsdcPerEth: treasuryOpsDb.state.oracleUsdcPerEth,
    spreadBps: treasuryOpsDb.state.spreadBps,
    largeSwapUsdcThreshold: treasuryOpsDb.state.largeSwapUsdcThreshold,
    minReserveRatio: MIN_RESERVE(),
    me: balancesFor(mine),
    counterparties: counterparties.map(balancesFor),
    openSwaps: open.map(enrichSwap),
    history: history.map(enrichSwap),
  });
});

const quoteSchema = z.object({
  sellAsset: z.enum(["USDC", "ETH"]),
  sellAmount: z.number().positive().max(500_000_000),
});

treasuryRouter.post("/quote", (req, res) => {
  const body = quoteSchema.parse(req.body);
  const buyAsset: TreasuryAsset = body.sellAsset === "USDC" ? "ETH" : "USDC";
  const rate = treasuryOpsDb.state.oracleUsdcPerEth;
  const spread = treasuryOpsDb.state.spreadBps;
  const buyAmount = quoteBuyAmount(body.sellAsset, body.sellAmount, rate, spread);
  const notional = usdcNotional(body.sellAsset, body.sellAmount, rate);
  res.json({
    sellAsset: body.sellAsset,
    sellAmount: body.sellAmount,
    buyAsset,
    buyAmount,
    rateUsdcPerEth: rate,
    spreadBps: spread,
    usdcNotional: notional,
    requiresMultisig: notional >= treasuryOpsDb.state.largeSwapUsdcThreshold,
  });
});

const proposeSchema = z.object({
  counterpartyBankId: z.string().min(1),
  sellAsset: z.enum(["USDC", "ETH"]),
  sellAmount: z.number().positive().max(500_000_000),
  note: z.string().max(300).optional(),
});

treasuryRouter.post("/swaps", (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const mine = actorBank(user);
    if (!mine) {
      res.status(404).json({ error: "bank_not_found" });
      return;
    }
    const body = proposeSchema.parse(req.body);
    const counter = findBankById(body.counterpartyBankId);
    if (!counter || !canSwap(mine, counter)) {
      res.status(400).json({
        error: "invalid_counterparty",
        message: "Counterparty must be World, parent/child National–Local, or World↔Local.",
      });
      return;
    }

    ensureBankEth(mine);
    ensureBankEth(counter);

    const rate = treasuryOpsDb.state.oracleUsdcPerEth;
    const spread = treasuryOpsDb.state.spreadBps;
    const buyAsset: TreasuryAsset = body.sellAsset === "USDC" ? "ETH" : "USDC";
    const buyAmount = quoteBuyAmount(body.sellAsset, body.sellAmount, rate, spread);
    const notional = usdcNotional(body.sellAsset, body.sellAmount, rate);

    if (body.sellAsset === "USDC") {
      if (body.sellAmount > availableUsdc(mine) + 1e-9) {
        res.status(400).json({
          error: "insufficient_usdc",
          availableUsdc: availableUsdc(mine),
          message: "Would breach minimum reserve ratio on USDC side.",
        });
        return;
      }
    } else if (body.sellAmount > treasuryOpsDb.getEth(mine.id) + 1e-9) {
      res.status(400).json({
        error: "insufficient_eth",
        availableEth: treasuryOpsDb.getEth(mine.id),
      });
      return;
    }

    // Counterparty must be able to pay buyAsset
    if (buyAsset === "USDC" && buyAmount > availableUsdc(counter) + 1e-9) {
      res.status(400).json({
        error: "counterparty_insufficient_usdc",
        availableUsdc: availableUsdc(counter),
      });
      return;
    }
    if (buyAsset === "ETH" && buyAmount > treasuryOpsDb.getEth(counter.id) + 1e-9) {
      res.status(400).json({
        error: "counterparty_insufficient_eth",
        availableEth: treasuryOpsDb.getEth(counter.id),
      });
      return;
    }

    const requiresMultisig = notional >= treasuryOpsDb.state.largeSwapUsdcThreshold;
    const swap: TreasurySwap = {
      id: treasuryOpsDb.uid("swap"),
      initiatorBankId: mine.id,
      counterpartyBankId: counter.id,
      sellAsset: body.sellAsset,
      buyAsset,
      sellAmount: body.sellAmount,
      buyAmount,
      rateUsdcPerEth: rate,
      spreadBps: spread,
      status: requiresMultisig ? "PENDING_MULTISIG" : "PROPOSED",
      createdAt: treasuryOpsDb.nowIso(),
      createdBy: user.id,
      note: body.note,
      requiresMultisig,
    };
    treasuryOpsDb.state.swaps.push(swap);
    treasuryOpsDb.save();
    res.status(201).json({ ok: true, swap: enrichSwap(swap) });
  } catch (err) {
    next(err);
  }
});

async function settleSwap(swap: TreasurySwap, actorId: string) {
  const seller = findBankById(swap.initiatorBankId);
  const buyer = findBankById(swap.counterpartyBankId);
  if (!seller || !buyer) throw new Error("bank_missing");

  ensureBankEth(seller);
  ensureBankEth(buyer);

  if (swap.sellAsset === "USDC") {
    if (swap.sellAmount > availableUsdc(seller) + 1e-9) throw new Error("insufficient_usdc");
    if (swap.buyAmount > treasuryOpsDb.getEth(buyer.id) + 1e-9) throw new Error("insufficient_eth");
    seller.reserve -= swap.sellAmount;
    buyer.reserve += swap.sellAmount;
    treasuryOpsDb.setEth(buyer.id, treasuryOpsDb.getEth(buyer.id) - swap.buyAmount);
    treasuryOpsDb.setEth(seller.id, treasuryOpsDb.getEth(seller.id) + swap.buyAmount);
  } else {
    if (swap.sellAmount > treasuryOpsDb.getEth(seller.id) + 1e-9) throw new Error("insufficient_eth");
    if (swap.buyAmount > availableUsdc(buyer) + 1e-9) throw new Error("insufficient_usdc");
    treasuryOpsDb.setEth(seller.id, treasuryOpsDb.getEth(seller.id) - swap.sellAmount);
    treasuryOpsDb.setEth(buyer.id, treasuryOpsDb.getEth(buyer.id) + swap.sellAmount);
    buyer.reserve -= swap.buyAmount;
    seller.reserve += swap.buyAmount;
  }

  swap.status = "SETTLED";
  swap.settledAt = treasuryOpsDb.nowIso();
  swap.settledBy = actorId;

  db.state.transactions.push({
    id: db.uid("tx"),
    type: "DEPOSIT",
    bankId: seller.id,
    amount: swap.sellAsset === "USDC" ? swap.sellAmount : swap.buyAmount,
    note: `Treasury swap ${swap.id}: ${swap.sellAmount} ${swap.sellAsset} ↔ ${swap.buyAmount.toFixed(6)} ${swap.buyAsset}`,
    at: db.nowIso(),
  });
  db.save();
  treasuryOpsDb.save();

  try {
    await persistBankCapital(seller.id);
    await persistBankCapital(buyer.id);
  } catch {
    /* best-effort */
  }
}

treasuryRouter.post("/swaps/:id/accept", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const mine = actorBank(user);
    const swap = treasuryOpsDb.state.swaps.find((s) => s.id === req.params.id);
    if (!swap || !mine) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (swap.counterpartyBankId !== mine.id && user.role !== "DEV_ADMIN") {
      res.status(403).json({ error: "only_counterparty_can_accept" });
      return;
    }
    if (swap.status === "PENDING_MULTISIG") {
      res.status(400).json({
        error: "needs_multisig",
        message: "Large swap — World OWNER must settle via multisig confirm.",
      });
      return;
    }
    if (swap.status !== "PROPOSED") {
      res.status(400).json({ error: "not_proposed", status: swap.status });
      return;
    }
    await settleSwap(swap, user.id);
    res.json({ ok: true, swap: enrichSwap(swap) });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.startsWith("insufficient_")) {
      res.status(400).json({ error: msg });
      return;
    }
    next(err);
  }
});

/** World OWNER settles large swaps (demo multisig gate). */
treasuryRouter.post("/swaps/:id/settle-multisig", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (user.role !== "OWNER" && user.role !== "DEV_ADMIN") {
      res.status(403).json({ error: "world_owner_required" });
      return;
    }
    const swap = treasuryOpsDb.state.swaps.find((s) => s.id === req.params.id);
    if (!swap || swap.status !== "PENDING_MULTISIG") {
      res.status(404).json({ error: "not_found" });
      return;
    }
    await settleSwap(swap, user.id);
    res.json({ ok: true, swap: enrichSwap(swap) });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.startsWith("insufficient_")) {
      res.status(400).json({ error: msg });
      return;
    }
    next(err);
  }
});

treasuryRouter.post("/swaps/:id/reject", (req, res) => {
  const user = (req as AuthedRequest).user!;
  const mine = actorBank(user);
  const swap = treasuryOpsDb.state.swaps.find((s) => s.id === req.params.id);
  if (!swap || !mine) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const party =
    swap.initiatorBankId === mine.id ||
    swap.counterpartyBankId === mine.id ||
    user.role === "OWNER" ||
    user.role === "DEV_ADMIN";
  if (!party) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  if (swap.status !== "PROPOSED" && swap.status !== "PENDING_MULTISIG") {
    res.status(400).json({ error: "not_open" });
    return;
  }
  swap.status = "REJECTED";
  swap.rejectedAt = treasuryOpsDb.nowIso();
  swap.rejectedBy = user.id;
  treasuryOpsDb.save();
  res.json({ ok: true, swap: enrichSwap(swap) });
});
