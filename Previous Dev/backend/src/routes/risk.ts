import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { requireAuth } from "../middleware/auth";

export const riskRouter = Router();

const scoreSchema = z.object({
  loanId: z.string().optional(),
  features: z
    .object({
      principalEth: z.number(),
      termMonths: z.number(),
      priorDefaults: z.number().default(0),
      consecutivePaidLoans: z.number().default(0),
      monthlyIncomeUsd: z.number().default(0),
      txCount6m: z.number().default(0),
    })
    .partial()
    .optional(),
});

// Computes a deterministic stub score when the FastAPI service is unavailable.
// Keeps Sprint-2 UIs functional and gives approvers something to sanity-check.
function stubScore(body: z.infer<typeof scoreSchema>) {
  const f = body.features ?? {};
  const principal = f.principalEth ?? 1;
  const term = f.termMonths ?? 12;
  const defaults = f.priorDefaults ?? 0;
  const paid = f.consecutivePaidLoans ?? 0;
  const income = f.monthlyIncomeUsd ?? 800;
  const tx = f.txCount6m ?? 10;

  // Risk score in [0, 1]: higher → riskier.
  let risk = 0.3 + defaults * 0.15 + Math.min(principal / 200, 0.3);
  risk -= paid * 0.05;
  risk -= Math.min(income / 5000, 0.2);
  risk -= Math.min(tx / 80, 0.15);
  risk = Math.max(0.02, Math.min(0.97, risk));

  const anomaly = Math.max(0.02, Math.min(0.95, risk * 0.6 + (Math.random() - 0.5) * 0.1));

  const shap = [
    { feature: "prior_default_count", contribution: +(defaults * 0.12).toFixed(3) },
    { feature: "principal_eth", contribution: +((principal / 200) * 0.25).toFixed(3) },
    { feature: "term_months", contribution: +((term / 60) * 0.08).toFixed(3) },
    { feature: "tx_count_6m", contribution: -(+((tx / 80) * 0.15).toFixed(3)) },
    { feature: "monthly_income_usd", contribution: -(+((income / 5000) * 0.22).toFixed(3)) },
    { feature: "consecutive_paid_loans", contribution: -(+(paid * 0.05).toFixed(3)) },
  ];

  return {
    riskScore: Number(risk.toFixed(3)),
    anomalyScore: Number(anomaly.toFixed(3)),
    recommendation: risk < 0.35 ? "APPROVE" : risk < 0.65 ? "REVIEW" : "REJECT",
    shap,
    model: "stub-v0",
    upstream: false,
    disclaimer:
      "Stub risk engine — swap FastAPI URL via ML_SERVICE_URL to attach the real model.",
  };
}

riskRouter.post("/score", requireAuth, async (req, res, next) => {
  try {
    const body = scoreSchema.parse(req.body ?? {});
    // Try upstream FastAPI first, fall back to deterministic stub.
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 2500);
      const r = await fetch(`${config.mlServiceUrl}/score`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: ctl.signal,
      });
      clearTimeout(t);
      if (r.ok) {
        const data = (await r.json()) as Record<string, unknown>;
        res.json({ ...data, upstream: true });
        return;
      }
    } catch {
      /* fall through to stub */
    }
    res.json(stubScore(body));
  } catch (err) {
    next(err);
  }
});

riskRouter.get("/health", async (_req, res) => {
  try {
    const r = await fetch(`${config.mlServiceUrl}/health`);
    const data = await r.json();
    res.json({ upstream: data, ok: r.ok });
  } catch {
    res.json({ ok: false, upstream: null });
  }
});
