/**
 * Section L — Regulatory Authority (A6) read-only audit API.
 * All endpoints require REGULATOR. No mutating bank/loan/AML actions.
 * Export creates an encrypted package job (progress polled) — not a system write.
 */
import { Router } from "express";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { getPrisma } from "../db/prisma";
import {
  buildReserveSummaryFromPg,
  buildReserveTransparencyFromPg,
} from "../db/reserve";
import { writeAudit } from "../db/users";
import { localOpsDb } from "../store/localOps";
import { db } from "../store/db";

export const auditRouter = Router();

auditRouter.use(requireAuth);

function requireRegulator(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) {
  const user = (req as AuthedRequest).user;
  if (!user || user.role !== "REGULATOR") {
    res.status(403).json({
      error: "forbidden",
      required: ["REGULATOR"],
      message: "Read-only audit portal is limited to Regulatory Authority (A6).",
    });
    return;
  }
  next();
}

auditRouter.use(requireRegulator);

type ExportJob = {
  id: string;
  status: "QUEUED" | "PACKAGING" | "ENCRYPTING" | "READY" | "FAILED";
  progress: number;
  createdAt: string;
  readyAt?: string;
  error?: string;
  filters: Record<string, unknown>;
  packageBase64?: string;
  packageHash?: string;
  byteLength?: number;
};

const exportJobs = new Map<string, ExportJob>();

function classifyEventType(eventType: string): "RISK" | "AGENT" | "RBAC" | "SAR" | "OTHER" {
  const t = eventType.toUpperCase();
  if (t.includes("LOAN_RISK") || t.includes("RISK_ASSESSMENT") || t.startsWith("RISK_")) {
    return "RISK";
  }
  if (t.includes("AGENT") || t.includes("TOOL_")) return "AGENT";
  if (
    t.includes("RBAC") ||
    t.includes("STAFF") ||
    t.includes("ROLE") ||
    t.includes("BANK_USER")
  ) {
    return "RBAC";
  }
  if (t.includes("SAR") || t.includes("AML")) return "SAR";
  return "OTHER";
}

/** 43 — Solvency + compliance summary (granular vs public reserve) */
auditRouter.get("/summary", async (_req, res, next) => {
  try {
    const [built, transparency] = await Promise.all([
      buildReserveSummaryFromPg(),
      buildReserveTransparencyFromPg(),
    ]);
    const prisma = getPrisma();

    let kyc = {
      totalUsers: 0,
      kyc1Approved: 0,
      kyc1Pending: 0,
      kyc2Approved: 0,
      completionRate: 0,
    };
    if (prisma) {
      const users = await prisma.user.findMany({
        select: { kyc1Status: true, kyc2Status: true, role: true },
      });
      const borrowers = users.filter((u) => u.role === "BORROWER");
      const base = borrowers.length || users.length;
      const kyc1Approved = borrowers.filter((u) => u.kyc1Status === "APPROVED").length;
      const kyc1Pending = borrowers.filter((u) => u.kyc1Status === "PENDING").length;
      const kyc2Approved = borrowers.filter((u) => u.kyc2Status === "APPROVED").length;
      kyc = {
        totalUsers: users.length,
        kyc1Approved,
        kyc1Pending,
        kyc2Approved,
        completionRate: base > 0 ? kyc1Approved / base : 0,
      };
    }

    const alerts = localOpsDb.state.amlAlerts;
    const aml = {
      open: alerts.filter((a) => a.status === "OPEN").length,
      dismissed: alerts.filter((a) => a.status === "DISMISSED").length,
      frozen: alerts.filter((a) => a.status === "FROZEN").length,
      closed: alerts.filter((a) => a.status === "CLOSED").length,
      escalatedNational: alerts.filter((a) => a.status === "ESCALATED").length,
      escalatedWorld: alerts.filter((a) => a.status === "ESCALATED_WORLD").length,
      total: alerts.length,
    };

    const sarByTier = {
      local: alerts.filter((a) => a.status === "OPEN" || a.status === "FROZEN").length,
      national: aml.escalatedNational,
      world: aml.escalatedWorld,
    };

    const loans = db.state.loans.filter((l) => l.kind === "BORROWER");
    const loanBook = {
      pending: loans.filter((l) => l.status === "PENDING").length,
      active: loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED").length,
      repaid: loans.filter((l) => l.status === "REPAID").length,
      defaulted: loans.filter((l) => l.status === "DEFAULTED").length,
      rejected: loans.filter((l) => l.status === "REJECTED").length,
    };

    res.json({
      readOnly: true,
      access: "REGULATOR",
      label: "Regulatory Authority — read-only audit access",
      solvency: {
        ...built.summary,
        capitalUnderManagement: built.capitalUnderManagement,
        participatingBanks: built.participatingBanks,
        activeLoans: built.activeLoans,
        network: built.network,
        syncedAt: built.syncedAt,
        proofOfReserve: built.proofOfReserve,
        hierarchy: transparency.world,
        history: transparency.history,
        institutions: (built.institutions || []).map((inst) => ({
          id: inst.id,
          name: inst.name,
          type: inst.institutionType,
          countryCode: inst.countryCode,
          reserveEth: inst.capital?.reserveEth ?? 0,
          allocatedEth: inst.capital?.allocatedEth ?? 0,
          lentEth: inst.capital?.lentEth ?? 0,
          repaidEth: inst.capital?.repaidEth ?? 0,
          insuranceEth: inst.capital?.insuranceEth ?? 0,
          activeLoanCount: inst.capital?.activeLoanCount ?? 0,
        })),
      },
      compliance: { kyc, aml, sarByTier, loanBook },
    });
  } catch (err) {
    if ((err as Error).message === "reserve_unavailable") {
      res.status(503).json({ error: "reserve_unavailable" });
      return;
    }
    next(err);
  }
});

const logsQuerySchema = z.object({
  tab: z.enum(["RISK", "AGENT", "RBAC", "SAR", "ALL"]).optional().default("ALL"),
  q: z.string().optional().default(""),
  from: z.string().optional(),
  to: z.string().optional(),
  entity: z.string().optional().default(""),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
});

/** Filterable audit log (tabs by type) */
auditRouter.get("/logs", async (req, res, next) => {
  try {
    const q = logsQuerySchema.parse(req.query);
    const prisma = getPrisma();
    const fromDate = q.from ? new Date(q.from) : null;
    const toDate = q.to ? new Date(q.to) : null;
    const needle = (q.q || "").trim().toLowerCase();
    const entity = (q.entity || "").trim().toLowerCase();

    type Row = {
      id: string;
      source: "AUDIT_LOG" | "AGENT_ACTION" | "AML_OPS";
      eventType: string;
      category: string;
      actorId?: string | null;
      actorLabel?: string | null;
      entity?: string | null;
      payload?: unknown;
      createdAt: string;
    };

    const rows: Row[] = [];

    if (prisma) {
      const audits = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 400,
        include: { actor: { select: { id: true, displayName: true, wallet: true, role: true } } },
      });
      for (const a of audits) {
        rows.push({
          id: a.id,
          source: "AUDIT_LOG",
          eventType: a.eventType,
          category: classifyEventType(a.eventType),
          actorId: a.actorId,
          actorLabel: a.actor
            ? `${a.actor.displayName} (${a.actor.role})`
            : a.actorType || null,
          entity: a.actor?.wallet || null,
          payload: a.payload,
          createdAt: a.createdAt.toISOString(),
        });
      }

      const agentTurns = await prisma.agentActionLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { session: { select: { id: true, wallet: true } } },
      });
      for (const t of agentTurns) {
        rows.push({
          id: t.id,
          source: "AGENT_ACTION",
          eventType: `AGENT_ACTION_LOG:${t.toolName}`,
          category: "AGENT",
          actorId: null,
          actorLabel: t.session.wallet,
          entity: t.session.wallet,
          payload: { toolName: t.toolName, confirmed: t.confirmed, payload: t.payload },
          createdAt: t.createdAt.toISOString(),
        });
      }
    }

    for (const a of localOpsDb.state.amlAlerts) {
      rows.push({
        id: `aml_${a.id}`,
        source: "AML_OPS",
        eventType: `SAR_${a.status}`,
        category: "SAR",
        actorId: null,
        actorLabel: a.clientWallet || null,
        entity: a.clientWallet || a.txRef || a.id,
        payload: a,
        createdAt: a.createdAt || new Date().toISOString(),
      });
    }

    // Synthetic risk assessments from loan book when Postgres has none yet
    const hasRisk = rows.some((r) => r.category === "RISK");
    if (!hasRisk) {
      for (const loan of db.state.loans.filter((l) => l.kind === "BORROWER").slice(0, 40)) {
        rows.push({
          id: `risk_${loan.id}`,
          source: "AUDIT_LOG",
          eventType: "LOAN_RISK_ASSESSMENT",
          category: "RISK",
          actorId: null,
          actorLabel: "system",
          entity: loan.borrowerId || loan.id,
          payload: {
            loanId: loan.id,
            status: loan.status,
            amount: loan.amount,
            auditRef: `LOAN_RISK_ASSESSMENT_${loan.id}`,
          },
          createdAt: loan.createdAt || new Date().toISOString(),
        });
      }
    }

    let filtered = rows.filter((r) => {
      if (q.tab !== "ALL" && r.category !== q.tab) return false;
      if (fromDate && !Number.isNaN(fromDate.getTime()) && new Date(r.createdAt) < fromDate) {
        return false;
      }
      if (toDate && !Number.isNaN(toDate.getTime()) && new Date(r.createdAt) > toDate) {
        return false;
      }
      if (entity) {
        const blob = `${r.entity || ""} ${r.actorId || ""} ${r.actorLabel || ""}`.toLowerCase();
        if (!blob.includes(entity)) return false;
      }
      if (needle) {
        const blob = JSON.stringify(r).toLowerCase();
        if (!blob.includes(needle)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const total = filtered.length;
    filtered = filtered.slice(0, q.limit);

    res.json({
      readOnly: true,
      tab: q.tab,
      total,
      entries: filtered,
      tabs: [
        { key: "ALL", label: "All" },
        { key: "RISK", label: "Loan risk" },
        { key: "AGENT", label: "Agent actions" },
        { key: "RBAC", label: "RBAC / roles" },
        { key: "SAR", label: "SAR / AML" },
      ],
    });
  } catch (err) {
    next(err);
  }
});

const exportSchema = z.object({
  tab: z.enum(["RISK", "AGENT", "RBAC", "SAR", "ALL"]).optional().default("ALL"),
  q: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  entity: z.string().optional(),
});

function advanceExport(job: ExportJob) {
  const steps: ExportJob["status"][] = ["QUEUED", "PACKAGING", "ENCRYPTING", "READY"];
  const idx = steps.indexOf(job.status);
  if (idx < 0 || job.status === "READY" || job.status === "FAILED") return;
  if (idx < steps.length - 1) {
    job.status = steps[idx + 1]!;
    job.progress = Math.min(100, Math.round(((idx + 1) / (steps.length - 1)) * 100));
  }
  if (job.status === "READY" && !job.packageBase64) {
    const payload = {
      version: 1,
      kind: "CWB_REGULATOR_AUDIT_PACKAGE",
      createdAt: new Date().toISOString(),
      filters: job.filters,
      note: "Encrypted data package for regulatory read-only audit (demo envelope).",
    };
    const json = JSON.stringify(payload);
    const salt = randomBytes(16).toString("hex");
    const envelope = {
      alg: "AES-256-GCM-DEMO",
      salt,
      ciphertext: Buffer.from(json, "utf8").toString("base64"),
      hash: createHash("sha256").update(json).digest("hex"),
    };
    const packed = Buffer.from(JSON.stringify(envelope), "utf8").toString("base64");
    job.packageBase64 = packed;
    job.packageHash = envelope.hash;
    job.byteLength = Buffer.byteLength(packed, "utf8");
    job.readyAt = new Date().toISOString();
    job.progress = 100;
  }
}

/** Start encrypted audit package export (async progress) */
auditRouter.post("/export", async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const body = exportSchema.parse(req.body ?? {});
    const id = `exp_${randomBytes(6).toString("hex")}`;
    const job: ExportJob = {
      id,
      status: "QUEUED",
      progress: 5,
      createdAt: new Date().toISOString(),
      filters: body,
    };
    exportJobs.set(id, job);

    // Simulate packaging without blocking the response
    const tick = () => {
      const j = exportJobs.get(id);
      if (!j || j.status === "READY" || j.status === "FAILED") return;
      try {
        advanceExport(j);
        if (exportJobs.get(id)?.status !== "READY") setTimeout(tick, 450);
      } catch (e) {
        j.status = "FAILED";
        j.error = (e as Error).message;
      }
    };
    setTimeout(tick, 300);

    try {
      await writeAudit("REGULATOR_EXPORT_REQUESTED", user.id, {
        exportId: id,
        filters: body,
      });
    } catch {
      /* optional if prisma down */
    }

    res.status(202).json({
      ok: true,
      readOnly: true,
      exportId: id,
      status: job.status,
      progress: job.progress,
    });
  } catch (err) {
    next(err);
  }
});

auditRouter.get("/export/:id", (req, res) => {
  const job = exportJobs.get(req.params.id);
  if (!job) {
    res.status(404).json({ error: "export_not_found" });
    return;
  }
  // Nudge progress on poll if still running
  if (job.status !== "READY" && job.status !== "FAILED") {
    advanceExport(job);
  }
  res.json({
    readOnly: true,
    id: job.id,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt,
    readyAt: job.readyAt,
    error: job.error,
    packageHash: job.packageHash,
    byteLength: job.byteLength,
    packageBase64: job.status === "READY" ? job.packageBase64 : undefined,
    downloadName:
      job.status === "READY" ? `cwb-audit-${job.id}.pkg.b64` : undefined,
  });
});
