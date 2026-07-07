import { Router } from "express";
import { z } from "zod";
import { fetchOracleStatus, relayOracleCommitReveal } from "../agent/tools";
import { config } from "../config";
import { requireAuth } from "../middleware/auth";

export const oracleRouter = Router();

const scoreAndCommitSchema = z.object({
  loanId: z.union([z.string(), z.number()]),
  wallet: z.string().optional(),
  principalEth: z.number().optional(),
  termMonths: z.number().optional(),
  priorDefaultCount: z.number().optional(),
  consecutivePaidLoans: z.number().optional(),
  monthlyIncomeUsd: z.number().optional(),
});

oracleRouter.get("/status/:loanId", requireAuth, async (req, res, next) => {
  try {
    const rawId = req.params.loanId;
    const loanId = Array.isArray(rawId) ? rawId[0] : rawId;
    const status = await fetchOracleStatus(loanId);
    res.json({ loanId, ...status });
  } catch (err) {
    next(err);
  }
});

/** Score via ML, then commit+reveal on-chain (Phase III MVT). */
oracleRouter.post("/commit-reveal", requireAuth, async (req, res, next) => {
  try {
    const body = scoreAndCommitSchema.parse(req.body ?? {});

    let scoreBps = 3000;
    let riskScore = 0.3;
    let decision = "REVIEW";

    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 5000);
      const r = await fetch(`${config.mlServiceUrl}/v1/score`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: body.wallet ?? "0x0000000000000000000000000000000000000000",
          principal_eth: body.principalEth ?? 0.1,
          term_months: body.termMonths ?? 12,
          prior_default_count: body.priorDefaultCount ?? 0,
          consecutive_paid_loans: body.consecutivePaidLoans ?? 0,
          monthly_income_usd: body.monthlyIncomeUsd ?? 800,
        }),
        signal: ctl.signal,
      });
      clearTimeout(t);
      if (r.ok) {
        const data = (await r.json()) as { score_bps?: number; risk_score?: number; decision?: string };
        scoreBps = data.score_bps ?? Math.round((data.risk_score ?? 0.3) * 10000);
        riskScore = data.risk_score ?? scoreBps / 10000;
        decision = data.decision ?? decision;
      }
    } catch {
      /* use defaults */
    }

    const relay = await relayOracleCommitReveal(body.loanId, scoreBps);
    res.json({
      loanId: body.loanId,
      riskScore,
      decision,
      scoreBps,
      oracleState: "SCORE_REVEALED",
      commitTx: relay.commitTx,
      revealTx: relay.revealTx,
    });
  } catch (err) {
    next(err);
  }
});
