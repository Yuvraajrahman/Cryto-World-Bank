import { Router } from "express";
import {
  buildReserveSummaryFromPg,
  buildReserveTransparencyFromPg,
  publicSummaryPayload,
} from "../db/reserve";

export const publicRouter = Router();

/** Landing page aggregate stats (A.1) — Postgres InstitutionCapital projection */
publicRouter.get("/reserve-summary", async (_req, res, next) => {
  try {
    const built = await buildReserveSummaryFromPg();
    res.json(publicSummaryPayload(built));
  } catch (err) {
    if ((err as Error).message === "reserve_unavailable") {
      res.status(503).json({ error: "reserve_unavailable" });
      return;
    }
    next(err);
  }
});

/** Public reserve transparency dashboard (A.3) */
publicRouter.get("/reserve-transparency", async (_req, res, next) => {
  try {
    const payload = await buildReserveTransparencyFromPg();
    res.json(payload);
  } catch (err) {
    if ((err as Error).message === "reserve_unavailable") {
      res.status(503).json({ error: "reserve_unavailable" });
      return;
    }
    next(err);
  }
});
