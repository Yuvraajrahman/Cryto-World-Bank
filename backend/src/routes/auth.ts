import { Router } from "express";
import { SiweMessage, generateNonce } from "siwe";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { UserRole } from "../store/db";
import {
  findUserByIdPg,
  findUserByWalletPg,
  upsertUserByWalletPg,
} from "../db/users";

export const authRouter = Router();

const nonceCache = new Map<string, { nonce: string; createdAt: number }>();
const NONCE_TTL_MS = 10 * 60 * 1000;

function issueToken(userId: string, wallet: string, role: UserRole): string {
  return jwt.sign({ sub: userId, wallet, role }, config.jwtSecret, {
    expiresIn: "7d",
  });
}

authRouter.get("/nonce", (_req, res) => {
  const nonce = generateNonce();
  nonceCache.set(nonce, { nonce, createdAt: Date.now() });
  res.json({ nonce });
});

const verifySchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
});

authRouter.post("/verify", async (req, res, next) => {
  try {
    const { message, signature } = verifySchema.parse(req.body);
    const siwe = new SiweMessage(message);
    const result = await siwe.verify({ signature });
    if (!result.success) {
      res.status(401).json({ error: "invalid_signature" });
      return;
    }
    const cached = nonceCache.get(siwe.nonce);
    if (!cached || Date.now() - cached.createdAt > NONCE_TTL_MS) {
      res.status(401).json({ error: "invalid_nonce" });
      return;
    }
    nonceCache.delete(siwe.nonce);

    const wallet = siwe.address;
    const user = await upsertUserByWalletPg(wallet, {});
    const token = issueToken(user.id, user.wallet, user.role);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

const devLoginSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{6,64}$/),
  role: z
    .enum([
      "OWNER",
      "NATIONAL_BANK_ADMIN",
      "LOCAL_BANK_ADMIN",
      "APPROVER",
      "BORROWER",
      "REGULATOR",
      "DEV_ADMIN",
    ])
    .optional(),
  userId: z.string().optional(),
});

authRouter.post("/dev-login", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") {
      res.status(404).end();
      return;
    }
    const body = devLoginSchema.parse(req.body);
    let user = body.userId
      ? await findUserByIdPg(body.userId)
      : await findUserByWalletPg(body.wallet);
    if (!user) {
      user = await upsertUserByWalletPg(body.wallet, {
        role: body.role ?? "BORROWER",
        displayName:
          body.role === "DEV_ADMIN" ? "Dev Admin (temporary)" : undefined,
      });
    } else if (body.role && body.role !== user.role) {
      // Dev only: allow persona buttons to re-bind role on existing wallets.
      user = await upsertUserByWalletPg(body.wallet, { role: body.role });
    }
    const token = issueToken(user.id, user.wallet, user.role);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", async (req, res) => {
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
    res.json({ user });
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
});
