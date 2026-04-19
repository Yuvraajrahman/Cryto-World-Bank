import { Router } from "express";
import { SiweMessage, generateNonce } from "siwe";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";

export const authRouter = Router();

const nonceCache = new Map<string, { nonce: string; createdAt: number }>();
const NONCE_TTL_MS = 10 * 60 * 1000;

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

    const token = jwt.sign({ wallet: siwe.address.toLowerCase() }, config.jwtSecret, {
      expiresIn: "7d",
    });
    res.json({ token, wallet: siwe.address });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", (req, res) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { wallet: string };
    res.json({ wallet: payload.wallet });
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
});
