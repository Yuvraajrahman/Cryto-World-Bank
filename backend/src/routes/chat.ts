import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const chatRouter = Router();

chatRouter.get("/threads", requireAuth, (_req, res) => {
  res.json({ threads: [] });
});

chatRouter.post("/threads", requireAuth, (req, res) => {
  res.status(201).json({ id: "thread_stub", subject: req.body?.subject ?? null });
});

chatRouter.get("/threads/:id/messages", requireAuth, (_req, res) => {
  res.json({ messages: [] });
});

chatRouter.post("/threads/:id/messages", requireAuth, (req, res) => {
  res.status(201).json({ ok: true, body: req.body?.body ?? "" });
});
