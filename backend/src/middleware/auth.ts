import { RequestHandler, Request } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthedRequest extends Request {
  user?: { wallet: string; role?: string };
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { wallet: string; role?: string };
    (req as AuthedRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
};
