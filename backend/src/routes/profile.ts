import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const profileRouter = Router();

profileRouter.get("/", requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({
    wallet: user.wallet,
    displayName: null,
    role: "BORROWER",
    verification: { status: "UNSUBMITTED" },
  });
});

profileRouter.put("/", requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({ ok: true, wallet: user.wallet, ...req.body });
});
