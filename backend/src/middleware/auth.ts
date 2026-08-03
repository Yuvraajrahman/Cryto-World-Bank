import { RequestHandler, Request } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UserRole, User } from "../store/db";
import { findUserByIdPg } from "../db/users";

export interface AuthedRequest extends Request {
  user?: User;
}

export const optionalAuth: RequestHandler = async (req, _res, next) => {
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
    const user = await findUserByIdPg(payload.sub);
    if (user) {
      (req as AuthedRequest).user = user;
    }
  } catch {
    // ignore invalid tokens for optional auth
  }
  next();
};

export const requireAuth: RequestHandler = async (req, res, next) => {
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
    const user = await findUserByIdPg(payload.sub);
    if (!user) {
      res.status(401).json({ error: "user_not_found" });
      return;
    }
    (req as AuthedRequest).user = user;
    next();
  } catch (err) {
    if ((err as Error)?.message?.includes("DATABASE_URL")) {
      res.status(503).json({ error: "database_unavailable", message: (err as Error).message });
      return;
    }
    res.status(401).json({ error: "invalid_token" });
  }
};

export function requireRoles(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    const u = (req as AuthedRequest).user;
    if (!u) {
      res.status(403).json({ error: "forbidden", required: roles });
      return;
    }
    // Super Admin bypasses all role gates
    if (u.role === "DEV_ADMIN" || roles.includes(u.role)) {
      next();
      return;
    }
    res.status(403).json({ error: "forbidden", required: roles });
  };
}

/** Permanent Super Admin (DEV_ADMIN) — full platform access. */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === "DEV_ADMIN";
}
