import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { requirePrisma } from "../db/prisma";
import { createNotification } from "../db/notifications";
import {
  buildInstallmentSchedule,
  db,
  findBankById,
  findUserById,
  type Loan,
} from "../store/db";

export const groupsRouter = Router();

const ETH_USD = 3200;
const DTI_MAX = 0.4;
const MAX_ACTIVE_GROUP_LOANS = 2;
const COOLING_OFF_DAYS = 30;
const DEFAULT_INCOME_USD = 500;

function inviteCode(): string {
  return `WBR-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function memberUserIds(
  members: { userId: string | null }[],
): string[] {
  return members.map((m) => m.userId).filter((id): id is string => Boolean(id));
}

async function notifyUsers(
  userIds: string[],
  payload: { title: string; body: string; href?: string },
) {
  for (const userId of userIds) {
    try {
      await createNotification({
        userId,
        category: "loan",
        title: payload.title,
        body: payload.body,
        href: payload.href,
      });
    } catch {
      /* optional */
    }
  }
}

function monthlyInstallmentEth(totalEth: number, termMonths: number): number {
  return totalEth / Math.max(termMonths, 1);
}

type EligibilityCheck = {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
};

async function buildEligibility(
  groupId: string,
  opts?: { totalAmountEth?: number; termMonths?: number },
): Promise<{
  checks: EligibilityCheck[];
  canApply: boolean;
  memberCount: number;
  shareEth: number | null;
  dtiByMember: Array<{
    userId: string;
    displayName: string;
    monthlyIncomeUsd: number;
    shareEth: number;
    monthlyInstallmentUsd: number;
    dti: number;
    pass: boolean;
  }>;
}> {
  const prisma = requirePrisma();
  const group = await prisma.loanGroup.findUnique({
    where: { id: groupId },
    include: { members: true, loanRequests: true },
  });
  if (!group) {
    return {
      checks: [{ id: "group", label: "Group exists", pass: false, detail: "Not found" }],
      canApply: false,
      memberCount: 0,
      shareEth: null,
      dtiByMember: [],
    };
  }

  const memberCount = group.members.length;
  const minOk = memberCount >= group.minMembers;
  const activeCount = group.loanRequests.filter((r) => r.status === "ACTIVE").length;
  const activeOk = activeCount < MAX_ACTIVE_GROUP_LOANS;

  const lastActivated = group.loanRequests
    .filter((r) => r.activatedAt != null)
    .sort((a, b) => (b.activatedAt!.getTime() - a.activatedAt!.getTime()))[0];

  let coolingOk = true;
  let coolingDetail = "No prior activated group loan — cooling-off not required";
  if (activeCount > 0) {
    coolingDetail = "Active group loan present — cooling-off applies after repayment";
  } else if (lastActivated?.activatedAt) {
    const days = (Date.now() - lastActivated.activatedAt.getTime()) / 86400_000;
    coolingOk = days >= COOLING_OFF_DAYS;
    coolingDetail = coolingOk
      ? `Last group loan activated ${Math.floor(days)} days ago`
      : `Cooling-off: ${Math.ceil(COOLING_OFF_DAYS - days)} days remaining since last group loan`;
  }

  const amount = opts?.totalAmountEth;
  const term = opts?.termMonths ?? 6;
  const shareEth = amount != null && memberCount > 0 ? amount / memberCount : null;

  const dtiByMember: Array<{
    userId: string;
    displayName: string;
    monthlyIncomeUsd: number;
    shareEth: number;
    monthlyInstallmentUsd: number;
    dti: number;
    pass: boolean;
  }> = [];

  let dtiAllPass = true;
  if (shareEth != null) {
    for (const m of group.members) {
      if (!m.userId) continue;
      const u = findUserById(m.userId);
      let income = u?.monthlyIncomeUsd;
      if (income == null) {
        try {
          const row = await prisma.user.findUnique({ where: { id: m.userId } });
          income = row?.monthlyIncomeUsd ?? undefined;
        } catch {
          /* ignore */
        }
      }
      const monthlyIncomeUsd = Math.max(income ?? DEFAULT_INCOME_USD, DEFAULT_INCOME_USD);
      const monthlyInstallmentUsd = monthlyInstallmentEth(shareEth, term) * ETH_USD;
      const dti = monthlyInstallmentUsd / monthlyIncomeUsd;
      const pass = dti <= DTI_MAX + 1e-9;
      if (!pass) dtiAllPass = false;
      dtiByMember.push({
        userId: m.userId,
        displayName: u?.displayName ?? m.userId,
        monthlyIncomeUsd,
        shareEth,
        monthlyInstallmentUsd,
        dti,
        pass,
      });
    }
  }

  const checks: EligibilityCheck[] = [
    {
      id: "members",
      label: `At least ${group.minMembers} members`,
      pass: minOk,
      detail: `${memberCount} / ${group.minMembers} members`,
    },
    {
      id: "active_cap",
      label: `Fewer than ${MAX_ACTIVE_GROUP_LOANS} active group loans`,
      pass: activeOk,
      detail: `${activeCount} active`,
    },
    {
      id: "cooling",
      label: `${COOLING_OFF_DAYS}-day cooling-off`,
      pass: coolingOk,
      detail: coolingDetail,
    },
  ];

  if (shareEth != null) {
    checks.push({
      id: "dti",
      label: `Per-member DTI ≤ ${DTI_MAX.toFixed(2)}`,
      pass: dtiAllPass && dtiByMember.length > 0,
      detail: dtiAllPass
        ? `Share ${shareEth.toFixed(4)} ETH · all members within DTI`
        : "One or more members exceed DTI 0.40 on their share",
    });
  }

  const canApply = checks.every((c) => c.pass);
  return { checks, canApply, memberCount, shareEth, dtiByMember };
}

function serializeMember(
  m: {
    id: string;
    userId: string | null;
    walletAddress: string | null;
    role: string;
    consented: boolean;
    joinedAt: Date;
  },
  nameById?: Map<string, string>,
) {
  const u = m.userId ? findUserById(m.userId) : undefined;
  return {
    id: m.id,
    userId: m.userId,
    walletAddress: m.walletAddress,
    role: m.role,
    consented: m.consented,
    joinedAt: m.joinedAt.toISOString(),
    displayName:
      (nameById instanceof Map && m.userId ? nameById.get(m.userId) : null) ||
      u?.displayName ||
      null,
  };
}

function serializeRequest(
  r: {
    id: string;
    groupId: string;
    requestedBy: string;
    totalAmountEth: number;
    termMonths: number;
    purpose: string;
    status: string;
    retailLoanId: string | null;
    createdAt: Date;
    activatedAt: Date | null;
    consents?: Array<{
      id: string;
      userId: string;
      consentedAt: Date | null;
      signature?: string | null;
      declinedAt?: Date | null;
    }>;
  },
  nameById?: Map<string, string>,
) {
  return {
    id: r.id,
    groupId: r.groupId,
    requestedBy: r.requestedBy,
    totalAmountEth: r.totalAmountEth,
    termMonths: r.termMonths,
    purpose: r.purpose,
    status: r.status,
    retailLoanId: r.retailLoanId,
    createdAt: r.createdAt.toISOString(),
    activatedAt: r.activatedAt?.toISOString() ?? null,
    consents: (r.consents ?? []).map((c) => ({
      id: c.id,
      userId: c.userId,
      consentedAt: c.consentedAt?.toISOString() ?? null,
      signature: c.signature ?? null,
      declinedAt: c.declinedAt?.toISOString() ?? null,
      displayName:
        (nameById instanceof Map ? nameById.get(c.userId) : null) ||
        findUserById(c.userId)?.displayName ||
        null,
    })),
  };
}

async function activateGroupLoanRequest(requestId: string) {
  const prisma = requirePrisma();
  const request = await prisma.groupLoanRequest.findUnique({
    where: { id: requestId },
    include: { group: true, consents: true },
  });
  if (!request || request.status !== "AWAITING_CONSENT") return null;

  const allConsented = request.consents.every(
    (c) => c.consentedAt != null && !(c as { declinedAt?: Date | null }).declinedAt,
  );
  if (!allConsented) return null;
  if (request.consents.some((c) => (c as { declinedAt?: Date | null }).declinedAt)) {
    return null;
  }

  const shouldActivate = process.env.NODE_ENV !== "production";
  if (!shouldActivate) {
    return prisma.groupLoanRequest.update({
      where: { id: requestId },
      data: { status: "AWAITING_CONSENT" },
      include: { consents: true },
    });
  }

  const bank = findBankById(request.group.localBankId);
  const requester = findUserById(request.requestedBy);
  let retailLoanId: string | null = null;

  if (bank && requester && bank.tier === "LOCAL") {
    const loan: Loan = {
      id: db.uid("loan"),
      kind: "BORROWER",
      borrowerId: requester.id,
      lenderBankId: bank.id,
      amount: request.totalAmountEth,
      purpose: `[Group ${request.groupId}] ${request.purpose}`,
      category: "Group",
      loanType: "credit",
      aprBps: bank.aprBps,
      termMonths: request.termMonths,
      status: "ACTIVE",
      isInstallment: true,
      installments: buildInstallmentSchedule(request.totalAmountEth, request.termMonths),
      gasCostEth: Number((0.002 + Math.random() * 0.003).toFixed(5)),
      createdAt: db.nowIso(),
      approvedAt: db.nowIso(),
      approvedBy: "system_group_consent",
      txHash: `0x${crypto.randomBytes(16).toString("hex")}`,
      riskScore: 0.2,
    };
    loan.deadline = loan.installments[loan.installments.length - 1]?.dueDate;
    bank.reserve = Math.max(0, bank.reserve - loan.amount);
    bank.totalLent += loan.amount;
    requester.totalBorrowedLifetime += loan.amount;
    requester.isFirstTime = false;
    db.state.loans.push(loan);
    db.state.transactions.push({
      id: db.uid("tx"),
      type: "LOAN_DISBURSED",
      userId: requester.id,
      bankId: bank.id,
      loanId: loan.id,
      amount: loan.amount,
      at: db.nowIso(),
      txHash: loan.txHash,
      note: "Group loan auto-activated after unanimous consent",
    });
    db.save();
    retailLoanId = loan.id;
  }

  const updated = await prisma.groupLoanRequest.update({
    where: { id: requestId },
    data: {
      status: "ACTIVE",
      activatedAt: new Date(),
      retailLoanId,
    },
    include: { consents: true },
  });

  if (request.group.status === "FORMING") {
    await prisma.loanGroup.update({
      where: { id: request.groupId },
      data: { status: "ACTIVE" },
    });
  }

  const memberIds = memberUserIds(
    await prisma.groupMember.findMany({ where: { groupId: request.groupId } }),
  );
  await notifyUsers(memberIds, {
    title: "Group loan activated",
    body: `Your group loan of ${request.totalAmountEth} ETH is now active.`,
    href: `/app/groups/${request.groupId}`,
  });

  return updated;
}

// ---------- Routes ----------

groupsRouter.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const prisma = requirePrisma();
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id },
      include: {
        group: {
          include: {
            members: true,
            loanRequests: {
              where: { status: { in: ["AWAITING_CONSENT", "ACTIVE"] } },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    res.json({
      groups: memberships.map((m) => ({
        id: m.group.id,
        name: m.group.name,
        inviteCode: m.group.inviteCode,
        status: m.group.status,
        role: m.role,
        memberCount: m.group.members.length,
        minMembers: m.group.minMembers,
        maxMembers: m.group.maxMembers,
        localBankId: m.group.localBankId,
        pendingRequest: m.group.loanRequests.find((r) => r.status === "AWAITING_CONSENT")
          ? serializeRequest(m.group.loanRequests.find((r) => r.status === "AWAITING_CONSENT")!)
          : null,
        activeRequest: m.group.loanRequests.find((r) => r.status === "ACTIVE")
          ? serializeRequest(m.group.loanRequests.find((r) => r.status === "ACTIVE")!)
          : null,
        joinedAt: m.joinedAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  name: z.string().min(2).max(80),
  localBankId: z.string().min(1).optional(),
  invites: z.array(z.string().min(1)).max(19).optional(),
  terms: z.string().max(2000).optional(),
});

groupsRouter.get("/preview", requireAuth, async (req, res, next) => {
  try {
    const code = String(req.query.inviteCode || "")
      .trim()
      .toUpperCase();
    if (code.length < 3) {
      res.status(400).json({ error: "invite_code_required" });
      return;
    }
    const prisma = requirePrisma();
    const group = await prisma.loanGroup.findFirst({
      where: { inviteCode: { equals: code, mode: "insensitive" } },
      include: { members: true },
    });
    if (!group) {
      res.status(404).json({ error: "group_not_found" });
      return;
    }
    res.json({
      preview: {
        id: group.id,
        name: group.name,
        inviteCode: group.inviteCode,
        status: group.status,
        memberCount: group.members.length,
        minMembers: group.minMembers,
        maxMembers: group.maxMembers,
        termsJson: group.termsJson,
        localBankId: group.localBankId,
      },
    });
  } catch (err) {
    next(err);
  }
});

groupsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (user.role !== "BORROWER") {
      res.status(403).json({ error: "not_a_borrower" });
      return;
    }
    const body = createSchema.parse(req.body);
    const prisma = requirePrisma();
    const localBankId = body.localBankId || user.bankId || "bank_lb_dhaka";
    const bank = findBankById(localBankId);
    if (!bank || bank.tier !== "LOCAL") {
      res.status(400).json({ error: "invalid_bank" });
      return;
    }

    let code = inviteCode();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.loanGroup.findUnique({ where: { inviteCode: code } });
      if (!exists) break;
      code = inviteCode();
    }

    const group = await prisma.loanGroup.create({
      data: {
        name: body.name.trim(),
        inviteCode: code,
        organizerUserId: user.id,
        localBankId,
        status: "FORMING",
        termsJson: body.terms?.trim()
          ? { initialTerms: body.terms.trim() }
          : undefined,
        members: {
          create: {
            userId: user.id,
            walletAddress: user.wallet.toLowerCase(),
            role: "ORGANIZER",
            borrowerId: "",
            consented: false,
          },
        },
      },
      include: { members: true },
    });

    // Soft invites: notify wallets/emails if they match known users
    if (body.invites?.length) {
      for (const raw of body.invites) {
        const tip = raw.trim().toLowerCase();
        const invitee = await prisma.user.findFirst({
          where: {
            OR: [{ wallet: tip }, { email: tip }, { id: tip }],
          },
        });
        if (invitee && invitee.id !== user.id) {
          await notifyUsers([invitee.id], {
            title: "Group invite",
            body: `${user.displayName} invited you to “${group.name}”. Use code ${group.inviteCode}.`,
            href: "/app/groups/join",
          });
        }
      }
    }

    res.status(201).json({
      ok: true,
      group: {
        id: group.id,
        name: group.name,
        inviteCode: group.inviteCode,
        status: group.status,
        localBankId: group.localBankId,
        members: group.members.map((m) => serializeMember(m)),
        onChainHint: Boolean(process.env.GROUP_LENDING_POOL_ADDRESS),
      },
    });
  } catch (err) {
    next(err);
  }
});

const joinSchema = z.object({
  inviteCode: z.string().min(3).max(40),
});

groupsRouter.post("/join", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (user.role !== "BORROWER") {
      res.status(403).json({ error: "not_a_borrower" });
      return;
    }
    const body = joinSchema.parse(req.body);
    const prisma = requirePrisma();
    const code = body.inviteCode.trim().toUpperCase();
    const group = await prisma.loanGroup.findFirst({
      where: { inviteCode: { equals: code, mode: "insensitive" } },
      include: { members: true },
    });
    if (!group) {
      res.status(404).json({ error: "group_not_found" });
      return;
    }
    if (group.status === "CLOSED") {
      res.status(400).json({ error: "group_closed" });
      return;
    }
    if (group.members.length >= group.maxMembers) {
      res.status(400).json({ error: "group_full", maxMembers: group.maxMembers });
      return;
    }
    const already = group.members.find((m) => m.userId === user.id);
    if (already) {
      res.json({ ok: true, alreadyMember: true, groupId: group.id });
      return;
    }

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        walletAddress: user.wallet.toLowerCase(),
        role: "MEMBER",
        borrowerId: "",
      },
    });

    const memberIds = memberUserIds(group.members).filter((id) => id !== user.id);
    await notifyUsers(memberIds, {
      title: "New group member",
      body: `${user.displayName} joined “${group.name}”.`,
      href: `/app/groups/${group.id}`,
    });

    if (group.members.length + 1 >= group.minMembers && group.status === "FORMING") {
      await prisma.loanGroup.update({
        where: { id: group.id },
        data: { status: "ACTIVE" },
      });
    }

    res.status(201).json({ ok: true, groupId: group.id });
  } catch (err) {
    next(err);
  }
});

groupsRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const prisma = requirePrisma();
    const group = await prisma.loanGroup.findUnique({
      where: { id: String(req.params.id) },
      include: {
        members: { orderBy: { joinedAt: "asc" } },
        loanRequests: {
          orderBy: { createdAt: "desc" },
          include: { consents: true },
        },
      },
    });
    if (!group) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const membership = group.members.find((m) => m.userId === user.id);
    if (!membership && user.role === "BORROWER") {
      res.status(403).json({ error: "not_a_member" });
      return;
    }

    const eligibility = await buildEligibility(group.id);
    const userIds = memberUserIds(group.members);
    const nameRows =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, displayName: true },
          })
        : [];
    const nameById = new Map(
      nameRows.map((r) => [r.id, r.displayName ?? r.id] as [string, string]),
    );

    const activeReq = group.loanRequests.find((r) => r.status === "ACTIVE");
    const n = Math.max(group.members.length, 1);
    const shareEth = activeReq ? activeReq.totalAmountEth / n : null;
    let delinquent = false;
    if (activeReq?.retailLoanId) {
      const loan = db.state.loans.find((l) => l.id === activeReq.retailLoanId);
      if (loan?.installments?.some((inst) => !inst.paid && new Date(inst.dueDate) < new Date())) {
        delinquent = true;
      }
    }

    res.json({
      group: {
        id: group.id,
        name: group.name,
        inviteCode: group.inviteCode,
        status: group.status,
        organizerUserId: group.organizerUserId,
        localBankId: group.localBankId,
        minMembers: group.minMembers,
        maxMembers: group.maxMembers,
        onChainId: group.onChainId,
        termsJson: group.termsJson,
        createdAt: group.createdAt.toISOString(),
        myRole: membership?.role ?? null,
        members: group.members.map((m) => ({
          ...serializeMember(m, nameById),
          shareEth,
          liabilityEth: shareEth,
        })),
        requests: group.loanRequests.map((r) => serializeRequest(r, nameById)),
        eligibility,
        activeShareEth: shareEth,
        delinquent,
      },
    });
  } catch (err) {
    next(err);
  }
});

const applySchema = z.object({
  totalAmountEth: z.number().positive().max(500),
  termMonths: z.number().int().min(1).max(60),
  purpose: z.string().min(5).max(500),
});

groupsRouter.post("/:id/apply", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (user.role !== "BORROWER") {
      res.status(403).json({ error: "not_a_borrower" });
      return;
    }
    const body = applySchema.parse(req.body);
    const prisma = requirePrisma();
    const groupId = String(req.params.id);
    const group = await prisma.loanGroup.findUnique({
      where: { id: groupId },
      include: { members: true, loanRequests: true },
    });
    if (!group) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const membership = group.members.find((m) => m.userId === user.id);
    if (!membership) {
      res.status(403).json({ error: "not_a_member" });
      return;
    }

    const pending = group.loanRequests.find((r) => r.status === "AWAITING_CONSENT");
    if (pending) {
      res.status(400).json({ error: "pending_request_exists", requestId: pending.id });
      return;
    }

    const eligibility = await buildEligibility(groupId, {
      totalAmountEth: body.totalAmountEth,
      termMonths: body.termMonths,
    });
    if (!eligibility.canApply) {
      res.status(400).json({ error: "eligibility_failed", eligibility });
      return;
    }

    // Soft KYC2 gate: warn but allow if skipped; block only when rejected
    if (user.kyc2Status === "REJECTED") {
      res.status(400).json({ error: "kyc2_rejected" });
      return;
    }

    const memberIds = memberUserIds(group.members);
    const request = await prisma.groupLoanRequest.create({
      data: {
        groupId,
        requestedBy: user.id,
        totalAmountEth: body.totalAmountEth,
        termMonths: body.termMonths,
        purpose: body.purpose.trim(),
        status: "AWAITING_CONSENT",
        consents: {
          create: memberIds.map((uid) => ({
            userId: uid,
            consentedAt: uid === user.id ? new Date() : null,
          })),
        },
      },
      include: { consents: true },
    });

    await notifyUsers(
      memberIds.filter((id) => id !== user.id),
      {
        title: "Group loan needs your consent",
        body: `${user.displayName} proposed a ${body.totalAmountEth} ETH group loan. Review and consent.`,
        href: `/app/groups/${groupId}/consent?requestId=${request.id}`,
      },
    );

    // If solo (shouldn't happen with min 3) or already unanimous somehow
    const activated = await activateGroupLoanRequest(request.id);
    const finalReq = activated ?? request;

    res.status(201).json({
      ok: true,
      request: serializeRequest(finalReq),
      eligibility,
    });
  } catch (err) {
    next(err);
  }
});

groupsRouter.get("/:id/requests/:requestId", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const prisma = requirePrisma();
    const groupId = String(req.params.id);
    const requestId = String(req.params.requestId);
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user.id },
    });
    if (!membership && user.role === "BORROWER") {
      res.status(403).json({ error: "not_a_member" });
      return;
    }
    const request = await prisma.groupLoanRequest.findFirst({
      where: { id: requestId, groupId },
      include: { consents: true, group: true },
    });
    if (!request) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const eligibility = await buildEligibility(groupId, {
      totalAmountEth: request.totalAmountEth,
      termMonths: request.termMonths,
    });
    const nameRows = await prisma.user.findMany({
      where: { id: { in: request.consents.map((c) => c.userId) } },
      select: { id: true, displayName: true },
    });
    const nameById = new Map(
      nameRows.map((r) => [r.id, r.displayName ?? r.id] as [string, string]),
    );
    res.json({
      request: serializeRequest(request, nameById),
      group: {
        id: request.group.id,
        name: request.group.name,
        inviteCode: request.group.inviteCode,
      },
      eligibility,
      myConsent: request.consents.find((c) => c.userId === user.id) ?? null,
    });
  } catch (err) {
    next(err);
  }
});

groupsRouter.post("/:id/requests/:requestId/consent", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (user.role !== "BORROWER") {
      res.status(403).json({ error: "not_a_borrower" });
      return;
    }
    const body = z
      .object({
        signature: z.string().max(600).optional(),
      })
      .parse(req.body ?? {});
    const prisma = requirePrisma();
    const groupId = String(req.params.id);
    const requestId = String(req.params.requestId);
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user.id },
    });
    if (!membership) {
      res.status(403).json({ error: "not_a_member" });
      return;
    }
    const request = await prisma.groupLoanRequest.findFirst({
      where: { id: requestId, groupId },
      include: { consents: true },
    });
    if (!request) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (request.status !== "AWAITING_CONSENT") {
      res.status(400).json({ error: "not_awaiting_consent", status: request.status });
      return;
    }

    const consent = request.consents.find((c) => c.userId === user.id);
    if (!consent) {
      res.status(400).json({ error: "not_on_consent_list" });
      return;
    }
    if (consent.declinedAt) {
      res.status(400).json({ error: "already_declined" });
      return;
    }
    if (!consent.consentedAt) {
      await prisma.groupLoanConsent.update({
        where: { id: consent.id },
        data: {
          consentedAt: new Date(),
          signature: body.signature ?? null,
          declinedAt: null,
        },
      });
    } else if (body.signature && !consent.signature) {
      await prisma.groupLoanConsent.update({
        where: { id: consent.id },
        data: { signature: body.signature },
      });
    }

    const activated = await activateGroupLoanRequest(requestId);
    const final = activated
      ? activated
      : await prisma.groupLoanRequest.findUnique({
          where: { id: requestId },
          include: { consents: true },
        });

    res.json({ ok: true, request: final ? serializeRequest(final) : null });
  } catch (err) {
    next(err);
  }
});

groupsRouter.post("/:id/requests/:requestId/decline", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    if (user.role !== "BORROWER") {
      res.status(403).json({ error: "not_a_borrower" });
      return;
    }
    const prisma = requirePrisma();
    const groupId = String(req.params.id);
    const requestId = String(req.params.requestId);
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user.id },
    });
    if (!membership) {
      res.status(403).json({ error: "not_a_member" });
      return;
    }
    const request = await prisma.groupLoanRequest.findFirst({
      where: { id: requestId, groupId },
      include: { consents: true },
    });
    if (!request) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (request.status !== "AWAITING_CONSENT") {
      res.status(400).json({ error: "not_awaiting_consent", status: request.status });
      return;
    }
    const consent = request.consents.find((c) => c.userId === user.id);
    if (!consent) {
      res.status(400).json({ error: "not_on_consent_list" });
      return;
    }
    await prisma.groupLoanConsent.update({
      where: { id: consent.id },
      data: { declinedAt: new Date(), consentedAt: null, signature: null },
    });
    const updated = await prisma.groupLoanRequest.update({
      where: { id: requestId },
      data: { status: "CANCELLED" },
      include: { consents: true },
    });
    const memberIds = memberUserIds(
      await prisma.groupMember.findMany({ where: { groupId } }),
    );
    await notifyUsers(
      memberIds.filter((id) => id !== user.id),
      {
        title: "Group loan cancelled",
        body: `${user.displayName} declined the group loan request.`,
        href: `/app/groups/${groupId}`,
      },
    );
    res.json({ ok: true, request: serializeRequest(updated) });
  } catch (err) {
    next(err);
  }
});

groupsRouter.post("/:id/leave", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const prisma = requirePrisma();
    const groupId = String(req.params.id);
    const group = await prisma.loanGroup.findUnique({
      where: { id: groupId },
      include: { members: true, loanRequests: true },
    });
    if (!group) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const membership = group.members.find((m) => m.userId === user.id);
    if (!membership) {
      res.status(400).json({ error: "not_a_member" });
      return;
    }
    const hasActive = group.loanRequests.some((r) => r.status === "ACTIVE");
    if (hasActive) {
      res.status(400).json({ error: "active_group_loan" });
      return;
    }
    if (membership.role === "ORGANIZER" && group.members.length > 1) {
      res.status(400).json({ error: "organizer_cannot_leave" });
      return;
    }

    await prisma.groupMember.delete({ where: { id: membership.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
