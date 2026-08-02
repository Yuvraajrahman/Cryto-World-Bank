import { Router } from "express";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import { db } from "../store/db";
import { getPrisma } from "../db/prisma";

export const passportRouter = Router();
passportRouter.use(requireAuth, requireRoles("BORROWER"));

/** Plan G.26 — 0–1000 scale with Bronze→Diamond tiers. */
export const PASSPORT_TIERS = [
  { tier: "Bronze", min: 0, max: 399, maxLoan: "$50", modifier: "base" },
  { tier: "Silver", min: 400, max: 549, maxLoan: "$500", modifier: "−0.25%" },
  { tier: "Gold", min: 550, max: 699, maxLoan: "$2,500", modifier: "−0.50%" },
  { tier: "Platinum", min: 700, max: 849, maxLoan: "$10,000", modifier: "−1.00%" },
  { tier: "Diamond", min: 850, max: 1000, maxLoan: "$25,000", modifier: "−2.00%" },
] as const;

function tierFromScore(score: number): string {
  const s = Math.max(0, Math.min(1000, score));
  const row = PASSPORT_TIERS.find((t) => s >= t.min && s <= t.max);
  return row?.tier ?? "Bronze";
}

/** Map legacy 0–850 contract scores onto the plan’s 0–1000 scale. */
function scale850to1000(score850: number): number {
  return Math.round(Math.max(0, Math.min(850, score850)) * (1000 / 850));
}

passportRouter.get("/me", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const loans = db.state.loans.filter((l) => l.borrowerId === user.id);
    const repaid = loans.filter((l) => l.status === "REPAID");
    const active = loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
    const defaults = loans.filter((l) => l.status === "DEFAULTED");
    let lateCount = 0;
    for (const loan of loans) {
      for (const inst of loan.installments || []) {
        if (!inst.paid && new Date(inst.dueDate) < new Date()) lateCount += 1;
      }
    }

    let score = 320;
    let source: "demo" | "db" | "chain" = "demo";
    let available = false;

    try {
      const prisma = getPrisma();
      if (prisma) {
        const borrower = await prisma.borrower.findUnique({
          where: { walletAddress: user.wallet.toLowerCase() },
          include: { creditPassport: true },
        });
        if (borrower?.creditPassport) {
          score = scale850to1000(borrower.creditPassport.creditScore);
          source = "db";
          available = true;
        }
      }
    } catch {
      /* optional */
    }

    if (!available) {
      score = Math.max(
        0,
        Math.min(1000, 320 + repaid.length * 15 - lateCount * 40 - defaults.length * 120),
      );
    }

    const events: Array<{ label: string; delta: number; at: string; scoreAfter?: number }> = [
      { label: "Account opened", delta: 0, at: "Baseline Bronze" },
    ];
    if (repaid.length > 0) {
      events.push({
        label: "On-time repayments",
        delta: repaid.length * 15,
        at: `${repaid.length} loan${repaid.length === 1 ? "" : "s"}`,
      });
    }
    if (lateCount > 0) {
      events.push({
        label: "Late installments",
        delta: -(lateCount * 40),
        at: `${lateCount} event${lateCount === 1 ? "" : "s"}`,
      });
    }
    if (defaults.length > 0) {
      events.push({
        label: "Defaults",
        delta: -(defaults.length * 120),
        at: `${defaults.length} loan${defaults.length === 1 ? "" : "s"}`,
      });
    }

    // Running score series for a simple chart (newest last)
    let cursor = 320;
    const series = [{ label: "Start", score: cursor }];
    for (const ev of events.slice(1)) {
      cursor = Math.max(0, Math.min(1000, cursor + ev.delta));
      series.push({ label: ev.label, score: cursor });
    }
    series[series.length - 1].score = score;

    const tier = tierFromScore(score);
    const qualifiesForCredit = score >= 400; // Silver+

    let groupHistory: Array<{ groupName: string; role: string; status: string }> = [];
    try {
      const prisma = getPrisma();
      if (prisma) {
        const memberships = await prisma.groupMember.findMany({
          where: { userId: user.id },
          include: { group: true },
          take: 10,
        });
        groupHistory = memberships.map((m) => ({
          groupName: m.group.name,
          role: m.role,
          status: m.group.status,
        }));
      }
    } catch {
      /* groups optional */
    }

    res.json({
      score,
      scaleMax: 1000,
      tier,
      available,
      source,
      wallet: user.wallet,
      qualifiesForCredit,
      tiers: PASSPORT_TIERS,
      repayment: {
        onTime: repaid.length,
        late: lateCount,
        defaults: defaults.length,
        active: active.length,
      },
      events,
      series,
      groupHistory,
      explainer: {
        raises: ["On-time installment payments", "Completed loan cycles", "Healthy group repayment"],
        lowers: ["Missed installments", "Defaults", "Group delinquency while a member"],
      },
    });
  } catch (err) {
    next(err);
  }
});
