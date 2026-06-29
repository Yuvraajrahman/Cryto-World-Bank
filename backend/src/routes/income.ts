import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { AuthedRequest, requireAuth, requireRoles } from "../middleware/auth";
import { db, findUserById } from "../store/db";

export const incomeRouter = Router();

const uploadSchema = z.object({
  fileName: z.string().min(1).max(200),
  mimeType: z.string().min(3).max(120),
  contentBase64: z.string().min(8),
  monthlyIncomeUsd: z.number().positive().optional(),
});

incomeRouter.post("/upload", requireAuth, (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = uploadSchema.parse(req.body);

    const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!ALLOWED.includes(body.mimeType)) {
      res.status(400).json({ error: "unsupported_mime_type" });
      return;
    }
    const buf = Buffer.from(body.contentBase64, "base64");
    if (buf.length > 10 * 1024 * 1024) {
      res.status(413).json({ error: "file_too_large" });
      return;
    }
    const sha256 = crypto.createHash("sha256").update(buf).digest("hex");

    const proof = {
      id: db.uid("prf"),
      userId: user.id,
      fileName: body.fileName,
      mimeType: body.mimeType,
      contentBase64: body.contentBase64,
      sha256,
      monthlyIncomeUsd: body.monthlyIncomeUsd,
      status: "PENDING" as const,
      createdAt: db.nowIso(),
    };
    db.state.incomeProofs.push(proof);
    res.status(201).json({
      ok: true,
      proof: {
        id: proof.id,
        fileName: proof.fileName,
        sha256,
        status: proof.status,
        createdAt: proof.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Current user's latest status
incomeRouter.get("/mine", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user!;
  const proofs = db.state.incomeProofs
    .filter((p) => p.userId === user.id)
    .map(({ contentBase64, ...rest }) => rest)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({ proofs });
});

// Pending review queue for approvers
incomeRouter.get(
  "/queue",
  requireAuth,
  requireRoles("APPROVER", "LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"),
  (_req, res) => {
    const proofs = db.state.incomeProofs
      .filter((p) => p.status === "PENDING")
      .map(({ contentBase64, ...rest }) => {
        const borrower = findUserById(rest.userId);
        return { ...rest, borrower };
      });
    res.json({ proofs });
  },
);

// Download for approvers
incomeRouter.get(
  "/:id/file",
  requireAuth,
  requireRoles("APPROVER", "LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER", "BORROWER"),
  (req, res) => {
    const proof = db.state.incomeProofs.find((p) => p.id === req.params.id);
    if (!proof) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const user = (req as AuthedRequest).user!;
    if (user.role === "BORROWER" && proof.userId !== user.id) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    const buf = Buffer.from(proof.contentBase64, "base64");
    res.setHeader("Content-Type", proof.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${proof.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
    );
    res.send(buf);
  },
);

const reviewSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().max(500).optional(),
  monthlyIncomeUsd: z.number().positive().optional(),
});

incomeRouter.post(
  "/:id/review",
  requireAuth,
  requireRoles("APPROVER", "LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"),
  (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user!;
      const body = reviewSchema.parse(req.body);
      const proof = db.state.incomeProofs.find((p) => p.id === req.params.id);
      if (!proof) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      proof.status = body.decision;
      proof.reviewedBy = user.id;
      proof.reviewedAt = db.nowIso();
      proof.notes = body.notes;
      if (body.monthlyIncomeUsd) {
        proof.monthlyIncomeUsd = body.monthlyIncomeUsd;
      }

      if (body.decision === "APPROVED") {
        const borrower = findUserById(proof.userId);
        if (borrower) {
          if (proof.monthlyIncomeUsd) borrower.monthlyIncomeUsd = proof.monthlyIncomeUsd;
          borrower.isFirstTime = false;
        }
      }

      res.json({ ok: true, proof: { ...proof, contentBase64: undefined } });
    } catch (err) {
      next(err);
    }
  },
);
