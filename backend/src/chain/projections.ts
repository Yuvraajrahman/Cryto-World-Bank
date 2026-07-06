import type { RiskTier } from "@prisma/client";
import { getPrisma } from "../db/prisma";
import { config } from "../config";

const TIER_MAP: RiskTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

async function institutionByOnChain(addr: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.institution.findUnique({
    where: { onChainAddress: addr.toLowerCase() },
  });
}

async function ensureBorrower(wallet: string, localBankId?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const w = wallet.toLowerCase();
  let borrower = await prisma.borrower.findUnique({ where: { walletAddress: w } });
  if (borrower) return borrower;
  const localInst =
    localBankId ??
    (await prisma.institution.findFirst({ where: { institutionType: "LOCAL" } }))?.id;
  if (!localInst) return null;
  return prisma.borrower.create({
    data: { walletAddress: w, registeredLocalBankId: localInst },
  });
}

export async function projectLoanRequested(input: {
  onChainId: string;
  borrower: string;
  principalWei: string;
  docHash?: string;
  purpose?: string;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const localAddr = config.contracts.localBank;
  const localInst = localAddr ? await institutionByOnChain(localAddr) : null;
  const borrower = await ensureBorrower(input.borrower, localInst?.id);
  if (!borrower || !localInst) return;

  const existing = await prisma.loanRequest.findFirst({
    where: { onChainRequestId: input.onChainId },
  });
  if (existing) {
    await prisma.loanRequest.update({
      where: { id: existing.id },
      data: {
        status: "SUBMITTED",
        principalWei: input.principalWei,
        docHash: input.docHash,
        purpose: input.purpose,
      },
    });
    return;
  }

  const byDoc =
    input.docHash && input.docHash !== `0x${"0".repeat(64)}`
      ? await prisma.loanRequest.findFirst({
          where: { borrowerId: borrower.id, docHash: input.docHash, status: "DRAFT" },
          orderBy: { createdAt: "desc" },
        })
      : null;

  if (byDoc) {
    await prisma.loanRequest.update({
      where: { id: byDoc.id },
      data: {
        status: "SUBMITTED",
        onChainRequestId: input.onChainId,
        principalWei: input.principalWei,
        purpose: input.purpose ?? byDoc.purpose,
      },
    });
    return;
  }

  await prisma.loanRequest.create({
    data: {
      borrowerId: borrower.id,
      localBankId: localInst.id,
      principalWei: input.principalWei,
      termMonths: 0,
      purpose: input.purpose ?? "",
      docHash: input.docHash,
      status: "SUBMITTED",
      onChainRequestId: input.onChainId,
    },
  });

  await prisma.auditLog.create({
    data: {
      eventType: "LOAN_REQUESTED",
      actorId: input.borrower.toLowerCase(),
      actorType: "BORROWER",
      payload: { onChainId: input.onChainId, txHash: input.txHash },
    },
  });
}

export async function projectLoanApproved(input: {
  onChainId: string;
  totalOwedWei: string;
  installments: number;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const req = await prisma.loanRequest.findFirst({
    where: { onChainRequestId: input.onChainId },
    include: { borrower: true },
  });
  if (!req) return;

  await prisma.loanRequest.update({
    where: { id: req.id },
    data: { status: "APPROVED" },
  });

  const existingLoan = await prisma.loan.findUnique({ where: { requestId: req.id } });
  if (existingLoan) return;

  const loan = await prisma.loan.create({
    data: {
      requestId: req.id,
      borrowerId: req.borrowerId,
      localBankId: req.localBankId,
      onChainLoanId: input.onChainId,
      principalWei: req.principalWei,
      aprBps: 800,
      termMonths: req.termMonths || 12,
      status: "ACTIVE",
    },
  });

  const count = Math.max(1, input.installments);
  const total = BigInt(input.totalOwedWei);
  const each = total / BigInt(count);
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const due = new Date(now);
    due.setDate(due.getDate() + 30 * (i + 1));
    await prisma.installment.create({
      data: {
        loanId: loan.id,
        index: i,
        amountWei: each.toString(),
        dueDate: due,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      eventType: "LOAN_APPROVED",
      actorType: "LOCAL_BANK",
      payload: { onChainId: input.onChainId, txHash: input.txHash },
    },
  });
}

export async function projectLoanRejected(input: {
  onChainId: string;
  reason: string;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const req = await prisma.loanRequest.findFirst({ where: { onChainRequestId: input.onChainId } });
  if (!req) return;
  await prisma.loanRequest.update({
    where: { id: req.id },
    data: { status: "REJECTED" },
  });
  await prisma.auditLog.create({
    data: {
      eventType: "LOAN_REJECTED",
      actorType: "APPROVER",
      payload: { onChainId: input.onChainId, reason: input.reason, txHash: input.txHash },
    },
  });
}

export async function projectInstallmentPaid(input: {
  onChainId: string;
  installmentIndex: number;
  amountWei: string;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const loan = await prisma.loan.findFirst({ where: { onChainLoanId: input.onChainId } });
  if (!loan) return;
  await prisma.installment.updateMany({
    where: { loanId: loan.id, index: input.installmentIndex },
    data: { paid: true, paidAt: new Date(), txHash: input.txHash },
  });
}

export async function projectLoanRepaid(input: {
  onChainId: string;
  borrower: string;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const loan = await prisma.loan.findFirst({ where: { onChainLoanId: input.onChainId } });
  if (!loan) return;
  await prisma.loan.update({ where: { id: loan.id }, data: { status: "REPAID" } });
  await prisma.installment.updateMany({
    where: { loanId: loan.id, paid: false },
    data: { paid: true, paidAt: new Date(), txHash: input.txHash },
  });

  const borrower = await prisma.borrower.findUnique({ where: { walletAddress: input.borrower.toLowerCase() } });
  if (borrower) {
    const passport = await prisma.creditPassportRecord.findUnique({ where: { borrowerId: borrower.id } });
    if (passport) {
      await prisma.creditPassportRecord.update({
        where: { borrowerId: borrower.id },
        data: {
          completedCycles: passport.completedCycles + 1,
          openLoans: Math.max(0, passport.openLoans - 1),
          creditScore: Math.min(850, passport.creditScore + 15),
        },
      });
    }
  }
}

export async function projectLoanDefaulted(input: {
  onChainId: string;
  borrower: string;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const loan = await prisma.loan.findFirst({ where: { onChainLoanId: input.onChainId } });
  if (!loan) return;
  await prisma.loan.update({ where: { id: loan.id }, data: { status: "DEFAULTED" } });
  await prisma.auditLog.create({
    data: {
      eventType: "LOAN_DEFAULTED",
      actorId: input.borrower.toLowerCase(),
      actorType: "SYSTEM",
      payload: { onChainId: input.onChainId, txHash: input.txHash },
    },
  });
}

export async function projectPassportIssued(input: {
  wallet: string;
  creditScore: number;
  tier: number;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const borrower = await ensureBorrower(input.wallet);
  if (!borrower) return;
  const riskTier = TIER_MAP[input.tier] ?? "SILVER";
  await prisma.creditPassportRecord.upsert({
    where: { borrowerId: borrower.id },
    update: { creditScore: input.creditScore, riskTier },
    create: {
      borrowerId: borrower.id,
      creditScore: input.creditScore,
      riskTier,
      onChainAddress: config.contracts.creditPassport || undefined,
    },
  });
}

export async function projectUpwardDeposit(input: {
  from: string;
  to: string;
  amountWei: string;
  depositId: string;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.upwardDepositRecord.create({
    data: {
      depositorId: input.from.toLowerCase(),
      parentId: input.to.toLowerCase(),
      amountWei: input.amountWei,
      onChainTxHash: input.txHash,
    },
  });
}

export async function projectSavingsDeposit(input: {
  wallet: string;
  assetsWei: string;
  sharesWei: string;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const borrower = await ensureBorrower(input.wallet);
  if (!borrower) return;
  const vault = config.contracts.savingsVault ?? "";
  const existing = await prisma.savingsAccount.findFirst({
    where: { borrowerId: borrower.id, vaultAddress: vault.toLowerCase() },
  });
  if (existing) {
    const next = (BigInt(existing.sharesWei) + BigInt(input.sharesWei)).toString();
    await prisma.savingsAccount.update({
      where: { id: existing.id },
      data: { sharesWei: next },
    });
  } else {
    await prisma.savingsAccount.create({
      data: {
        borrowerId: borrower.id,
        vaultAddress: vault.toLowerCase(),
        sharesWei: input.sharesWei,
      },
    });
  }
}

export async function projectGroupCreated(input: {
  groupId: string;
  organizer: string;
  localBank: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const localInst = await institutionByOnChain(input.localBank);
  await prisma.loanGroup.create({
    data: {
      localBankId: localInst?.id ?? input.localBank.toLowerCase(),
      onChainId: input.groupId,
      status: "FORMING",
    },
  });
}

export async function projectGroupMember(input: {
  groupId: string;
  memberWallet: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const group = await prisma.loanGroup.findFirst({ where: { onChainId: input.groupId } });
  if (!group) return;
  const borrower = await ensureBorrower(input.memberWallet);
  if (!borrower) return;
  const exists = await prisma.groupMember.findFirst({
    where: { groupId: group.id, borrowerId: borrower.id },
  });
  if (exists) return;
  await prisma.groupMember.create({
    data: { groupId: group.id, borrowerId: borrower.id },
  });
}

export async function projectGroupActivated(input: { groupId: string }): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const group = await prisma.loanGroup.findFirst({ where: { onChainId: input.groupId } });
  if (!group) return;
  await prisma.loanGroup.update({ where: { id: group.id }, data: { status: "ACTIVE" } });
}

export async function projectIblpBorrowed(input: {
  id: string;
  lender: string;
  borrower: string;
  principalWei: string;
  tenorDays: number;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.interbankLoanRecord.create({
    data: {
      lenderId: input.lender.toLowerCase(),
      borrowerId: input.borrower.toLowerCase(),
      principalWei: input.principalWei,
      tenorDays: input.tenorDays,
      onChainLoanId: input.id,
      status: "ACTIVE",
    },
  });
}

export async function projectIblpRepaid(input: { id: string; txHash: string }): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const row = await prisma.interbankLoanRecord.findFirst({ where: { onChainLoanId: input.id } });
  if (!row) return;
  await prisma.interbankLoanRecord.update({
    where: { id: row.id },
    data: { status: "REPAID" },
  });
}

export async function projectAccountFrozen(input: { wallet: string; txHash: string }): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const borrower = await ensureBorrower(input.wallet);
  if (!borrower) return;
  await prisma.borrower.update({
    where: { id: borrower.id },
    data: { kycLevel: "LEVEL_0" },
  });
  await prisma.auditLog.create({
    data: {
      eventType: "ACCOUNT_FROZEN",
      actorId: input.wallet.toLowerCase(),
      actorType: "LOCAL_BANK",
      payload: { txHash: input.txHash },
    },
  });
}

export async function projectClientRegistered(input: {
  wallet: string;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  await ensureBorrower(input.wallet);
  await prisma.auditLog.create({
    data: {
      eventType: "CLIENT_REGISTERED",
      actorId: input.wallet.toLowerCase(),
      actorType: "LOCAL_BANK",
      payload: { txHash: input.txHash },
    },
  });
}

export async function projectCapitalRequested(input: {
  tier: "world" | "national";
  bank: string;
  amountWei: string;
  requestId: string;
  txHash: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.auditLog.create({
    data: {
      eventType: "CAPITAL_REQUESTED",
      actorId: input.bank.toLowerCase(),
      actorType: input.tier.toUpperCase(),
      payload: {
        requestId: input.requestId,
        amountWei: input.amountWei,
        txHash: input.txHash,
      },
    },
  });
}
