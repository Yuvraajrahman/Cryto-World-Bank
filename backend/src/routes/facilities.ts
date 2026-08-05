/**
 * Interbank lending + upward deposits — World / National / Local ops.
 * Paper features #40 InterBankLendingPool, #41 UpwardDepositFacility.
 * Ledger + capital: Postgres (Ops* tables + InstitutionCapital).
 */
import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import { db, findBankById, type Bank } from "../store/db";
import { worldOpsDb } from "../store/worldOps";
import {
  interbankAprBps,
  listInterbankForBank,
  listUpwardForBank,
  createInterbankLoan,
  findInterbankLoan,
  updateInterbankLoan,
  createUpwardDeposit,
  type InterbankLoan,
  type UpwardDeposit,
  type InterbankTenorDays,
} from "../db/facilitiesOpsPg";
import { persistBankCapital, hydrateBankCapitalFromPrisma } from "../db/banksSync";

export const facilitiesRouter = Router();
facilitiesRouter.use(
  requireAuth,
  requireRoles("OWNER", "NATIONAL_BANK_ADMIN", "LOCAL_BANK_ADMIN", "DEV_ADMIN"),
);

const MIN_RESERVE = () => worldOpsDb.state.globalParams.minReserveRatio ?? 0.15;

function actorBank(user: { role: string; bankId?: string }): Bank | null {
  if (user.role === "OWNER" || user.role === "DEV_ADMIN") {
    return db.state.banks.find((b) => b.tier === "WORLD") || null;
  }
  if (!user.bankId) return null;
  return findBankById(user.bankId) || null;
}

function availableUsdc(bank: Bank): number {
  const allocated = Math.max(bank.totalAllocated || 0, bank.reserve + (bank.totalLent || 0), 1);
  const minKeep = allocated * MIN_RESERVE();
  return Math.max(0, bank.reserve - minKeep);
}

function sameTierPeers(mine: Bank): Bank[] {
  return db.state.banks.filter(
    (b) => b.tier === mine.tier && b.id !== mine.id && (b.status || "ACTIVE") === "ACTIVE",
  );
}

function parentOf(mine: Bank): Bank | null {
  if (mine.tier === "LOCAL" && mine.parentBankId) return findBankById(mine.parentBankId) || null;
  if (mine.tier === "NATIONAL") return db.state.banks.find((b) => b.tier === "WORLD") || null;
  return null;
}

function enrichIb(loan: InterbankLoan) {
  const borrower = findBankById(loan.borrowerBankId);
  const lender = findBankById(loan.lenderBankId);
  return {
    ...loan,
    borrower: borrower ? { id: borrower.id, name: borrower.name, tier: borrower.tier } : null,
    lender: lender ? { id: lender.id, name: lender.name, tier: lender.tier } : null,
  };
}

function enrichUp(d: UpwardDeposit) {
  const from = findBankById(d.fromBankId);
  const to = findBankById(d.toBankId);
  return {
    ...d,
    from: from ? { id: from.id, name: from.name, tier: from.tier } : null,
    to: to ? { id: to.id, name: to.name, tier: to.tier } : null,
  };
}

async function refreshBank(bankId: string): Promise<Bank | null> {
  try {
    return await hydrateBankCapitalFromPrisma(bankId);
  } catch {
    return findBankById(bankId) || null;
  }
}

facilitiesRouter.get("/overview", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    let mine = actorBank(user);
    if (!mine) {
      res.status(404).json({ error: "bank_not_found" });
      return;
    }
    mine = (await refreshBank(mine.id)) || mine;
    const peers = sameTierPeers(mine).slice(0, 40).map((b) => ({
      id: b.id,
      name: b.name,
      tier: b.tier,
      reserveUsdc: b.reserve,
      availableUsdc: availableUsdc(b),
    }));
    const parent = parentOf(mine);
    const [ibMine, upwardMine] = await Promise.all([
      listInterbankForBank(mine.id),
      listUpwardForBank(mine.id),
    ]);

    res.json({
      me: {
        id: mine.id,
        name: mine.name,
        tier: mine.tier,
        reserveUsdc: mine.reserve,
        availableUsdc: availableUsdc(mine),
      },
      parent: parent
        ? { id: parent.id, name: parent.name, tier: parent.tier, reserveUsdc: parent.reserve }
        : null,
      peers,
      interbank: ibMine.map(enrichIb),
      upward: upwardMine.map(enrichUp),
      tenors: [
        { days: 1, aprBps: interbankAprBps(1) },
        { days: 7, aprBps: interbankAprBps(7) },
        { days: 30, aprBps: interbankAprBps(30) },
      ],
      minReserveRatio: MIN_RESERVE(),
    });
  } catch (err) {
    next(err);
  }
});

const ibRequestSchema = z.object({
  lenderBankId: z.string().min(1),
  amountUsdc: z.number().positive().max(100_000_000),
  tenorDays: z.union([z.literal(1), z.literal(7), z.literal(30)]),
  note: z.string().max(300).optional(),
});

facilitiesRouter.post("/interbank/request", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const mine = actorBank(user);
    if (!mine) {
      res.status(404).json({ error: "bank_not_found" });
      return;
    }
    if (mine.tier === "WORLD") {
      res.status(400).json({
        error: "world_not_borrower",
        message: "World Bank is the reserve; same-tier IBLP is for National and Local peers.",
      });
      return;
    }
    const body = ibRequestSchema.parse(req.body);
    const lender = findBankById(body.lenderBankId);
    if (!lender || lender.tier !== mine.tier || lender.id === mine.id) {
      res.status(400).json({ error: "invalid_lender", message: "Lender must be a same-tier peer." });
      return;
    }
    await refreshBank(lender.id);
    const lenderFresh = findBankById(lender.id)!;
    if (body.amountUsdc > availableUsdc(lenderFresh) + 1e-9) {
      res.status(400).json({
        error: "lender_insufficient",
        availableUsdc: availableUsdc(lenderFresh),
      });
      return;
    }
    const tenor = body.tenorDays as InterbankTenorDays;
    const loan = await createInterbankLoan({
      borrowerBankId: mine.id,
      lenderBankId: lender.id,
      amountUsdc: body.amountUsdc,
      tenorDays: tenor,
      aprBps: interbankAprBps(tenor),
      createdBy: user.id,
      note: body.note,
    });
    res.status(201).json({ ok: true, loan: enrichIb(loan) });
  } catch (err) {
    next(err);
  }
});

facilitiesRouter.post("/interbank/:id/fund", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const mine = actorBank(user);
    const loan = await findInterbankLoan(String(req.params.id));
    if (!loan || !mine) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (loan.lenderBankId !== mine.id && user.role !== "DEV_ADMIN") {
      res.status(403).json({ error: "only_lender_can_fund" });
      return;
    }
    if (loan.status !== "REQUESTED") {
      res.status(400).json({ error: "not_requested" });
      return;
    }
    await refreshBank(loan.lenderBankId);
    await refreshBank(loan.borrowerBankId);
    const lender = findBankById(loan.lenderBankId)!;
    const borrower = findBankById(loan.borrowerBankId)!;
    if (loan.amountUsdc > availableUsdc(lender) + 1e-9) {
      res.status(400).json({ error: "insufficient_reserve", availableUsdc: availableUsdc(lender) });
      return;
    }
    lender.reserve -= loan.amountUsdc;
    lender.totalLent += loan.amountUsdc;
    borrower.reserve += loan.amountUsdc;
    const due = new Date();
    due.setDate(due.getDate() + loan.tenorDays);
    const updated = await updateInterbankLoan(loan.id, {
      status: "ACTIVE",
      fundedAt: new Date(),
      dueAt: due,
    });
    db.state.transactions.push({
      id: db.uid("tx"),
      type: "ALLOCATION",
      bankId: lender.id,
      amount: loan.amountUsdc,
      note: `Interbank lend ${loan.id} → ${borrower.name}`,
      at: db.nowIso(),
    });
    db.save();
    try {
      await persistBankCapital(lender.id);
      await persistBankCapital(borrower.id);
    } catch {
      /* optional */
    }
    res.json({ ok: true, loan: enrichIb(updated) });
  } catch (err) {
    next(err);
  }
});

facilitiesRouter.post("/interbank/:id/reject", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const mine = actorBank(user);
    const loan = await findInterbankLoan(String(req.params.id));
    if (!loan || !mine) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (loan.lenderBankId !== mine.id && user.role !== "DEV_ADMIN") {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    if (loan.status !== "REQUESTED") {
      res.status(400).json({ error: "not_requested" });
      return;
    }
    const updated = await updateInterbankLoan(loan.id, { status: "REJECTED" });
    res.json({ ok: true, loan: enrichIb(updated) });
  } catch (err) {
    next(err);
  }
});

facilitiesRouter.post("/interbank/:id/repay", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const mine = actorBank(user);
    const loan = await findInterbankLoan(String(req.params.id));
    if (!loan || !mine) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (loan.borrowerBankId !== mine.id && user.role !== "DEV_ADMIN") {
      res.status(403).json({ error: "only_borrower_can_repay" });
      return;
    }
    if (loan.status !== "ACTIVE") {
      res.status(400).json({ error: "not_active" });
      return;
    }
    await refreshBank(loan.borrowerBankId);
    await refreshBank(loan.lenderBankId);
    const borrower = findBankById(loan.borrowerBankId)!;
    const lender = findBankById(loan.lenderBankId)!;
    const interest =
      (loan.amountUsdc * loan.aprBps * loan.tenorDays) / (10_000 * 365);
    const total = loan.amountUsdc + interest;
    if (total > borrower.reserve + 1e-9) {
      res.status(400).json({ error: "insufficient_reserve", requiredUsdc: total });
      return;
    }
    borrower.reserve -= total;
    lender.reserve += total;
    lender.totalRepaid = (lender.totalRepaid || 0) + loan.amountUsdc;
    const updated = await updateInterbankLoan(loan.id, {
      status: "REPAID",
      repaidAt: new Date(),
    });
    db.save();
    try {
      await persistBankCapital(lender.id);
      await persistBankCapital(borrower.id);
    } catch {
      /* optional */
    }
    res.json({ ok: true, loan: enrichIb(updated), interestUsdc: interest, totalRepaidUsdc: total });
  } catch (err) {
    next(err);
  }
});

const upwardSchema = z.object({
  amountUsdc: z.number().positive().max(100_000_000),
  note: z.string().max(300).optional(),
});

facilitiesRouter.post("/upward/deposit", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    let mine = actorBank(user);
    if (!mine) {
      res.status(404).json({ error: "bank_not_found" });
      return;
    }
    mine = (await refreshBank(mine.id)) || mine;
    const parent = parentOf(mine);
    if (!parent) {
      res.status(400).json({ error: "no_parent", message: "World Bank has no upward parent." });
      return;
    }
    await refreshBank(parent.id);
    const parentFresh = findBankById(parent.id)!;
    const body = upwardSchema.parse(req.body);
    if (body.amountUsdc > availableUsdc(mine) + 1e-9) {
      res.status(400).json({
        error: "insufficient_surplus",
        availableUsdc: availableUsdc(mine),
        message: "Would breach minimum reserve ratio.",
      });
      return;
    }
    mine.reserve -= body.amountUsdc;
    parentFresh.reserve += body.amountUsdc;
    const row = await createUpwardDeposit({
      fromBankId: mine.id,
      toBankId: parentFresh.id,
      amountUsdc: body.amountUsdc,
      createdBy: user.id,
      note: body.note || `Upward deposit to ${parentFresh.name}`,
    });
    db.state.transactions.push({
      id: db.uid("tx"),
      type: "DEPOSIT",
      bankId: mine.id,
      amount: body.amountUsdc,
      note: row.note,
      at: db.nowIso(),
    });
    db.save();
    try {
      await persistBankCapital(mine.id);
      await persistBankCapital(parentFresh.id);
    } catch {
      /* optional */
    }
    res.status(201).json({ ok: true, deposit: enrichUp(row), from: mine, to: parentFresh });
  } catch (err) {
    next(err);
  }
});
