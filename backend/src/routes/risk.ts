import { Router } from "express";
import { config } from "../config";

export const riskRouter = Router();

// Thin proxy to the FastAPI ML service. Keeps the browser decoupled from
// the Python host so we can swap models / scale horizontally later.
riskRouter.post("/score", async (req, res, next) => {
  try {
    const r = await fetch(`${config.mlServiceUrl}/score`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });
    const data = await r.json();
    res.status(r.status).json(data);
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
