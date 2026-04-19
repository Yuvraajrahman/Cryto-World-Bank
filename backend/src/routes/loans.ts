import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

export const loansRouter = Router();

const loanCreateSchema = z.object({
  principalWei: z.string().regex(/^\d+$/),
  termMonths: z.number().int().min(1).max(60),
  purpose: z.string().max(500),
});

loansRouter.get("/", (_req, res) => {
  res.json({ loans: [] });
});

loansRouter.post("/", requireAuth, (req, res, next) => {
  try {
    const body = loanCreateSchema.parse(req.body);
    // Off-chain mirror: the actual loan is created on-chain from the frontend.
    // This endpoint records analytics metadata and triggers the ML risk call.
    res.status(202).json({ accepted: true, loan: body });
  } catch (err) {
    next(err);
  }
});

loansRouter.get("/:id", (req, res) => {
  res.json({ id: req.params.id, status: "PENDING", installments: [] });
});
