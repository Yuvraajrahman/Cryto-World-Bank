import { Router } from "express";
import { z } from "zod";
import { NotificationCategory } from "@prisma/client";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../db/notifications";

export const notificationsRouter = Router();

const categorySchema = z.nativeEnum(NotificationCategory);

notificationsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const categoryRaw = typeof req.query.category === "string" ? req.query.category : undefined;
    const category = categoryRaw ? categorySchema.parse(categoryRaw) : undefined;
    const unreadOnly =
      req.query.unreadOnly === "1" ||
      req.query.unreadOnly === "true" ||
      req.query.unread === "1";
    const limit = req.query.limit ? Number(req.query.limit) : 40;
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

    const payload = await listNotifications({
      userId: user.id,
      category,
      unreadOnly,
      limit: Number.isFinite(limit) ? limit : 40,
      cursor,
    });
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

notificationsRouter.post("/read-all", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const count = await markAllNotificationsRead(user.id);
    res.json({ ok: true, marked: count });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.post("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const row = await markNotificationRead(user.id, String(req.params.id), true);
    if (!row) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ ok: true, id: row.id, readAt: row.readAt?.toISOString() ?? null });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.post("/:id/unread", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const row = await markNotificationRead(user.id, String(req.params.id), false);
    if (!row) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ ok: true, id: row.id, readAt: null });
  } catch (err) {
    next(err);
  }
});
