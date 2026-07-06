import { Router } from "express";
import { ethers } from "ethers";
import { config } from "../config";
import { getPrisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth";

export const briefRouter = Router();

const LOCAL_READ_ABI = [
  "function loans(uint256) view returns (uint256,address,uint256,uint256,uint32,uint256,uint256,uint256,uint256,uint8,uint8,uint8,bytes32,string,uint256)",
] as const;

// DT-II.12 Authority Brief — structured approver summary (stub + chain data).
briefRouter.get("/:loanId", requireAuth, async (req, res) => {
  const rawId = req.params.loanId;
  const loanId = (Array.isArray(rawId) ? rawId[0] : rawId).replace(/^chain_/, "");
  const prisma = getPrisma();

  let chainLoan: Record<string, unknown> | null = null;
  if (config.chainRpcUrl && config.contracts.localBank) {
    try {
      const provider = new ethers.JsonRpcProvider(config.chainRpcUrl);
      const lb = new ethers.Contract(config.contracts.localBank, LOCAL_READ_ABI, provider);
      const l = await lb.loans(loanId);
      chainLoan = {
        id: loanId,
        borrower: l[1] as string,
        principalEth: ethers.formatEther(l[2] as bigint),
        aprBps: Number(l[3]),
        termMonths: Number(l[4]),
        totalOwedEth: ethers.formatEther(l[5] as bigint),
        totalPaidEth: ethers.formatEther(l[6] as bigint),
        status: Number(l[11]),
        docHash: l[12] as string,
        purpose: l[13] as string,
        nextDueAt: Number(l[14]),
      };
    } catch {
      /* chain optional */
    }
  }

  let prismaLoan = null;
  let documents: unknown[] = [];
  if (prisma) {
    prismaLoan = await prisma.loan.findFirst({
      where: { onChainLoanId: loanId },
      include: {
        borrower: { include: { creditPassport: true, borrowingLimit: true } },
        installments: { orderBy: { index: "asc" } },
        request: true,
      },
    });

    if (prismaLoan?.request?.docHash) {
      const reqs = await prisma.loanRequest.findMany({
        where: { docHash: prismaLoan.request.docHash },
        take: 1,
      });
      documents = reqs;
    }
  }

  const principalEth = Number(
    chainLoan?.principalEth ?? (prismaLoan ? ethers.formatEther(BigInt(prismaLoan.principalWei)) : 0),
  );

  const riskScore =
    principalEth < 0.1 ? 0.22 : principalEth < 0.5 ? 0.38 : principalEth < 2 ? 0.52 : 0.68;
  const recommendation = riskScore < 0.35 ? "APPROVE" : riskScore < 0.65 ? "REVIEW" : "REJECT";

  res.json({
    loanId,
    generatedAt: new Date().toISOString(),
    chain: chainLoan,
    prisma: prismaLoan,
    documents,
    authorityBrief: {
      headline: `Loan #${loanId} — ${recommendation}`,
      recommendation,
      riskScore: Number(riskScore.toFixed(3)),
      factors: [
        { label: "Principal (ETH)", value: principalEth },
        {
          label: "Credit tier",
          value: prismaLoan?.borrower?.creditPassport?.riskTier ?? "SILVER",
        },
        {
          label: "Open loans",
          value: prismaLoan?.borrower?.creditPassport?.openLoans ?? 0,
        },
        { label: "Purpose", value: chainLoan?.purpose ?? prismaLoan?.request?.purpose ?? "—" },
      ],
      compliance: {
        docHashPresent: Boolean(chainLoan?.docHash && chainLoan.docHash !== `0x${"0".repeat(64)}`),
        kycLevel: prismaLoan?.borrower?.kycLevel ?? "LEVEL_0",
      },
      disclaimer:
        "Authority Brief v0 — replace with FastAPI /v1/brief when ML pipeline is connected.",
    },
  });
});
