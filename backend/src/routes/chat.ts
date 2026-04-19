import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { db, findUserById } from "../store/db";

export const chatRouter = Router();

function hydrateThread(threadId: string) {
  const thread = db.state.chatThreads.find((t) => t.id === threadId);
  if (!thread) return null;
  const lastMessage = [...db.state.chatMessages]
    .filter((m) => m.threadId === thread.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  const participants = thread.participants
    .map((id) => findUserById(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
    .map((u) => ({
      id: u.id,
      displayName: u.displayName,
      wallet: u.wallet,
      role: u.role,
      bankId: u.bankId,
    }));
  return {
    ...thread,
    participants,
    lastMessage: lastMessage
      ? { body: lastMessage.body, senderId: lastMessage.senderId, at: lastMessage.createdAt }
      : null,
  };
}

chatRouter.get("/threads", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const threads = db.state.chatThreads
    .filter((t) => t.participants.includes(user.id))
    .map((t) => hydrateThread(t.id)!)
    .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
  res.json({ threads });
});

const createThreadSchema = z.object({
  subject: z.string().min(1).max(160),
  participantIds: z.array(z.string().min(1)).min(1).max(20),
});

chatRouter.post("/threads", requireAuth, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = createThreadSchema.parse(req.body);
    const participants = Array.from(new Set([user.id, ...body.participantIds]));
    const thread = {
      id: db.uid("thr"),
      subject: body.subject,
      participants,
      createdAt: db.nowIso(),
      lastMessageAt: db.nowIso(),
    };
    db.state.chatThreads.push(thread);
    res.status(201).json({ thread: hydrateThread(thread.id) });
  } catch (err) {
    next(err);
  }
});

chatRouter.get("/threads/:id/messages", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const thread = db.state.chatThreads.find((t) => t.id === req.params.id);
  if (!thread || !thread.participants.includes(user.id)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const since = req.query.since ? String(req.query.since) : null;
  const msgs = db.state.chatMessages
    .filter((m) => m.threadId === thread.id)
    .filter((m) => !since || m.createdAt > since)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  res.json({ messages: msgs, thread: hydrateThread(thread.id) });
});

const sendSchema = z.object({ body: z.string().min(1).max(2000) });

chatRouter.post("/threads/:id/messages", requireAuth, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = sendSchema.parse(req.body);
    const thread = db.state.chatThreads.find((t) => t.id === req.params.id);
    if (!thread || !thread.participants.includes(user.id)) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const msg = {
      id: db.uid("msg"),
      threadId: thread.id,
      senderId: user.id,
      body: body.body,
      createdAt: db.nowIso(),
    };
    db.state.chatMessages.push(msg);
    thread.lastMessageAt = msg.createdAt;
    res.status(201).json({ message: msg });
  } catch (err) {
    next(err);
  }
});
