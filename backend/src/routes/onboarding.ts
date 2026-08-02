import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import type { KycStatus } from "../store/db";
import {
  findUserByWalletPg,
  isEmailTakenPg,
  updateUserPg,
  writeAudit,
  type AppUser,
} from "../db/users";

export const onboardingRouter = Router();

function hashPayload(parts: string[]): string {
  return crypto.createHash("sha256").update(parts.filter(Boolean).join("|")).digest("hex");
}

function onboardingStatus(user: AppUser) {
  return {
    user: {
      id: user.id,
      wallet: user.wallet,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      accountType: user.accountType,
      role: user.role,
      isFirstTime: user.isFirstTime,
      onboardingComplete: Boolean(user.onboardingComplete),
    },
    registration: {
      done: Boolean(user.phone && user.email && user.dateOfBirth && !user.isFirstTime),
    },
    kyc1: {
      status: (user.kyc1Status ?? "NOT_STARTED") as KycStatus,
      ...user.kyc1,
    },
    kyc2: {
      status: (user.kyc2Status ?? "NOT_STARTED") as KycStatus,
      skipped: Boolean(user.kyc2Skipped),
      ...user.kyc2,
    },
    consent: user.consent ?? null,
    nextStep: (() => {
      if (user.onboardingComplete) return "dashboard";
      if (!user.email || user.isFirstTime) return "register";
      if ((user.kyc1Status ?? "NOT_STARTED") === "NOT_STARTED") return "kyc-1";
      if (!user.consent) return "consent";
      return "complete";
    })(),
  };
}

onboardingRouter.get("/status", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  res.json(onboardingStatus(user));
});

const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(8).max(32),
  country: z.string().min(2).max(64),
  dateOfBirth: z.string().min(8).max(32),
  accountType: z.enum(["individual", "group"]).default("individual"),
  termsAccepted: z.literal(true),
});

onboardingRouter.post("/register", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = registerSchema.parse(req.body);

    const ageMs = Date.now() - new Date(body.dateOfBirth).getTime();
    if (!Number.isFinite(ageMs) || ageMs < 18 * 365.25 * 24 * 3600 * 1000) {
      res.status(400).json({ error: "underage", message: "You must be 18 or older" });
      return;
    }

    if (await isEmailTakenPg(body.email.trim().toLowerCase(), user.id)) {
      res.status(409).json({ error: "duplicate_email", message: "Email already registered" });
      return;
    }

    const updated = await updateUserPg(user.id, {
      displayName: body.fullName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      country: body.country.trim(),
      dateOfBirth: new Date(body.dateOfBirth),
      accountType: body.accountType,
      isFirstTime: false,
    });
    await writeAudit("ONBOARDING_REGISTER", user.id, {
      email: updated.email,
      country: updated.country,
      accountType: updated.accountType,
    });

    res.json({ ok: true, ...onboardingStatus(updated) });
  } catch (err) {
    next(err);
  }
});

const kyc1Schema = z.object({
  idFrontName: z.string().min(1).max(255),
  idBackName: z.string().min(1).max(255),
  selfieName: z.string().min(1).max(255),
});

onboardingRouter.post("/kyc-1", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (user.isFirstTime || !user.email) {
      res.status(400).json({ error: "register_first" });
      return;
    }
    const body = kyc1Schema.parse(req.body);
    const docHash = hashPayload([
      user.wallet,
      body.idFrontName,
      body.idBackName,
      body.selfieName,
      String(Date.now()),
    ]);
    const updated = await updateUserPg(user.id, {
      kyc1IdFrontName: body.idFrontName,
      kyc1IdBackName: body.idBackName,
      kyc1SelfieName: body.selfieName,
      kyc1DocHash: docHash,
      kyc1SubmittedAt: new Date(),
      kyc1RejectionReason: null,
      kyc1Status: "PENDING",
    });
    await writeAudit("ONBOARDING_KYC1", user.id, { docHash });
    res.json({ ok: true, ...onboardingStatus(updated) });
  } catch (err) {
    next(err);
  }
});

const kyc2Schema = z.object({
  addressDocName: z.string().min(1).max(255),
  incomeDocName: z.string().min(1).max(255),
});

onboardingRouter.post("/kyc-2", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if ((user.kyc1Status ?? "NOT_STARTED") === "NOT_STARTED") {
      res.status(400).json({ error: "kyc1_required" });
      return;
    }
    const body = kyc2Schema.parse(req.body);
    const docHash = hashPayload([
      user.wallet,
      body.addressDocName,
      body.incomeDocName,
      String(Date.now()),
    ]);
    const updated = await updateUserPg(user.id, {
      kyc2AddressDocName: body.addressDocName,
      kyc2IncomeDocName: body.incomeDocName,
      kyc2DocHash: docHash,
      kyc2SubmittedAt: new Date(),
      kyc2RejectionReason: null,
      kyc2Status: "PENDING",
      kyc2Skipped: false,
    });
    await writeAudit("ONBOARDING_KYC2", user.id, { docHash });
    res.json({ ok: true, ...onboardingStatus(updated) });
  } catch (err) {
    next(err);
  }
});

onboardingRouter.post("/kyc-2/skip", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if ((user.kyc1Status ?? "NOT_STARTED") === "NOT_STARTED") {
      res.status(400).json({ error: "kyc1_required" });
      return;
    }
    const updated = await updateUserPg(user.id, { kyc2Skipped: true });
    await writeAudit("ONBOARDING_KYC2_SKIP", user.id, {});
    res.json({ ok: true, ...onboardingStatus(updated) });
  } catch (err) {
    next(err);
  }
});

const consentSchema = z.object({
  risk: z.literal(true),
  data: z.literal(true),
  agent: z.literal(true),
});

onboardingRouter.post("/consent", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if ((user.kyc1Status ?? "NOT_STARTED") === "NOT_STARTED") {
      res.status(400).json({ error: "kyc1_required" });
      return;
    }
    const body = consentSchema.parse(req.body);
    const updated = await updateUserPg(user.id, {
      consentRisk: body.risk,
      consentData: body.data,
      consentAgent: body.agent,
      consentedAt: new Date(),
    });
    await writeAudit("ONBOARDING_CONSENT", user.id, body);
    res.json({ ok: true, ...onboardingStatus(updated) });
  } catch (err) {
    next(err);
  }
});

onboardingRouter.post("/complete", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (!user.consent) {
      res.status(400).json({ error: "consent_required" });
      return;
    }
    const updated = await updateUserPg(user.id, {
      onboardingComplete: true,
      isFirstTime: false,
    });
    await writeAudit("ONBOARDING_COMPLETE", user.id, {});
    res.json({ ok: true, ...onboardingStatus(updated) });
  } catch (err) {
    next(err);
  }
});

/** Dev helper: approve KYC pending for demos (non-production). */
onboardingRouter.post("/dev/approve-kyc", requireAuth, async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") {
      res.status(404).end();
      return;
    }
    const user = (req as AuthedRequest).user!;
    const updated = await updateUserPg(user.id, {
      ...(user.kyc1Status === "PENDING" ? { kyc1Status: "APPROVED" as const } : {}),
      ...(user.kyc2Status === "PENDING" ? { kyc2Status: "APPROVED" as const } : {}),
    });
    res.json({ ok: true, ...onboardingStatus(updated) });
  } catch (err) {
    next(err);
  }
});

export async function findOnboardingUser(wallet: string) {
  return findUserByWalletPg(wallet);
}
