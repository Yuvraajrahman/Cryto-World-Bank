import { RequestHandler, Request } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { findUserById, UserRole, User } from "../store/db";

export interface AuthedRequest extends Request {
  user?: User;
}

export const optionalAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    next();
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      wallet: string;
      role: UserRole;
    };
    const user = findUserById(payload.sub);
    if (user) {
      (req as AuthedRequest).user = user;
    }
  } catch {
    // ignore invalid tokens for optional auth
  }
  next();
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      wallet: string;
      role: UserRole;
    };
    const user = findUserById(payload.sub);
    if (!user) {
      res.status(401).json({ error: "user_not_found" });
      return;
    }
    (req as AuthedRequest).user = user;
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
};

export function requireRoles(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    const u = (req as AuthedRequest).user;
    if (!u || !roles.includes(u.role)) {
      res.status(403).json({ error: "forbidden", required: roles });
      return;
    }
    next();
  };
}
