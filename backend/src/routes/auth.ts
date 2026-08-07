import { Router } from "express";
import { SiweMessage, generateNonce } from "siwe";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import { config } from "../config";
import { UserRole } from "../store/db";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import {
  findUserByIdPg,
  findUserByLoginIdentifierPg,
  findUserByWalletPg,
  updateUserPg,
  upsertUserByWalletPg,
} from "../db/users";
import { requirePrisma } from "../db/prisma";

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

const passwordLoginSchema = z.object({
  /** User ID (loginId) or confirmed personal email (or Super Admin email). */
  identifier: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  password: z.string().min(1),
});

/** Password login via User ID or email. */
authRouter.post("/login", async (req, res, next) => {
  try {
    const body = passwordLoginSchema.parse(req.body);
    const identifier = (body.identifier || body.email || "").trim();
    if (!identifier) {
      res.status(400).json({ error: "identifier_required" });
      return;
    }
    const found = await findUserByLoginIdentifierPg(identifier);
    if (!found?.user || !found.passwordHash) {
      res.status(401).json({ error: "invalid_credentials" });
      return;
    }
    const ok = await bcrypt.compare(body.password, found.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "invalid_credentials" });
      return;
    }
    const { user } = found;
    const token = issueToken(user.id, user.wallet, user.role);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

/** Request personal email confirmation (stores pendingEmail + token). */
authRouter.post("/email/request-confirm", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email() });
    const { email } = schema.parse(req.body);
    const sessionUser = (req as AuthedRequest).user!;
    const prisma = requirePrisma();
    const taken = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        NOT: { id: sessionUser.id },
      },
      select: { id: true },
    });
    if (taken) {
      res.status(409).json({ error: "email_taken" });
      return;
    }
    const token = randomBytes(24).toString("hex");
    const user = await updateUserPg(sessionUser.id, {
      pendingEmail: email.toLowerCase(),
      emailConfirmToken: token,
    });
    // Demo: return token so UI can confirm without mailer
    res.json({ user, confirmToken: token, message: "Confirm the email with the provided token." });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/email/confirm", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({ token: z.string().min(8) });
    const { token } = schema.parse(req.body);
    const sessionUser = (req as AuthedRequest).user!;
    const prisma = requirePrisma();
    const row = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!row?.pendingEmail || !row.emailConfirmToken || row.emailConfirmToken !== token) {
      res.status(400).json({ error: "invalid_token" });
      return;
    }
    const user = await updateUserPg(sessionUser.id, {
      email: row.pendingEmail,
      emailConfirmed: true,
      pendingEmail: null,
      emailConfirmToken: null,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

/** Link MetaMask wallet to an already-authenticated password account. */
authRouter.post("/link-wallet", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      message: z.string().min(1),
      signature: z.string().min(1),
    });
    const { message, signature } = schema.parse(req.body);
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

    const sessionUser = (req as AuthedRequest).user!;
    const wallet = siwe.address.toLowerCase();
    const prisma = requirePrisma();
    const clash = await prisma.user.findFirst({
      where: { wallet, NOT: { id: sessionUser.id } },
      select: { id: true },
    });
    if (clash) {
      res.status(409).json({ error: "wallet_taken" });
      return;
    }
    const user = await updateUserPg(sessionUser.id, { wallet });
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
        displayName: body.role === "DEV_ADMIN" ? "Super Admin" : undefined,
      });
    } else if (body.role && body.role !== user.role) {
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

/** Bangladesh demo lab personas — password testing accounts for the Lab UI. */
export const DEMO_LAB_PERSONAS = {
  world: {
    key: "world" as const,
    label: "World Bank",
    scope: "Global",
    identifier: "admin@gmail.com",
  },
  national: {
    key: "national" as const,
    label: "National Bank",
    scope: "Bangladesh",
    identifier: "bangladesh",
  },
  local: {
    key: "local" as const,
    label: "Local Bank",
    scope: "Dhaka",
    identifier: "local_bangladesh_dhaka",
  },
  client: {
    key: "client" as const,
    label: "Client",
    scope: "Dhaka client #1",
    identifier: "client_bangladesh_dhaka_00001",
  },
};

const DEMO_LAB_IDS = new Set(
  Object.values(DEMO_LAB_PERSONAS).map((p) => p.identifier.toLowerCase()),
);

function isLabOperator(user: { role?: string; email?: string | null; loginId?: string | null }) {
  if (user.role === "DEV_ADMIN") return true;
  const email = (user.email || "").toLowerCase();
  const loginId = (user.loginId || "").toLowerCase();
  return email === "admin@gmail.com" || loginId === "admin";
}

function isLabPersonaUser(user: { email?: string | null; loginId?: string | null }) {
  const email = (user.email || "").toLowerCase();
  const loginId = (user.loginId || "").toLowerCase();
  return DEMO_LAB_IDS.has(email) || DEMO_LAB_IDS.has(loginId);
}

/** List demo lab personas (metadata only). */
authRouter.get("/demo-lab/personas", (_req, res) => {
  res.json({
    personas: Object.values(DEMO_LAB_PERSONAS).map((p) => ({
      key: p.key,
      label: p.label,
      scope: p.scope,
      identifier: p.identifier,
    })),
  });
});

/**
 * Switch among Bangladesh demo personas for the testing Lab UI.
 * Allowed for Super Admin (admin@gmail.com) or any already-switched lab persona.
 */
authRouter.post("/demo-lab/switch", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      persona: z.enum(["world", "national", "local", "client"]),
    });
    const { persona } = schema.parse(req.body);
    const actor = (req as AuthedRequest).user!;
    if (!isLabOperator(actor) && !isLabPersonaUser(actor)) {
      res.status(403).json({ error: "demo_lab_forbidden" });
      return;
    }
    const target = DEMO_LAB_PERSONAS[persona];
    const found = await findUserByLoginIdentifierPg(target.identifier);
    if (!found?.user) {
      res.status(404).json({ error: "persona_not_found", identifier: target.identifier });
      return;
    }
    const token = issueToken(found.user.id, found.user.wallet, found.user.role);
    res.json({
      token,
      user: found.user,
      persona: target.key,
      lab: true,
    });
  } catch (err) {
    next(err);
  }
});

/** Deterministic synthetic wallet from a loginId (for password-only accounts). */
export function syntheticWalletFromLoginId(loginId: string): `0x${string}` {
  const h = createHash("sha256").update(`cwb:login:${loginId}`).digest("hex");
  return `0x${h.slice(0, 40)}`;
}
