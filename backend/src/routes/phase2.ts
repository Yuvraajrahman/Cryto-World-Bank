import { Router } from "express";
import { createHash, randomUUID } from "crypto";
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import { ethers } from "ethers";
import { config } from "../config";
import { getPrisma } from "../db/prisma";
import { registerPhase2FacilityRoutes } from "./phase2-facilities";

export const phase2Router = Router();

const uploadDir = path.join(process.cwd(), "uploads", "documents");
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

phase2Router.get("/status", async (_req, res) => {
  res.json({
    phase: "II",
    gate: "G2",
    contracts: {
      creditPassport: config.contracts.creditPassport,
      upwardDeposit: config.contracts.upwardDeposit,
      savingsVault: config.contracts.savingsVault,
      groupLendingPool: config.contracts.groupLendingPool,
      interBankLendingPool: config.contracts.interBankLendingPool,
    },
  });
});

phase2Router.post("/documents/upload", async (req, res) => {
  const { wallet, nidBase64, photoBase64, purpose } = req.body as {
    wallet?: string;
    nidBase64?: string;
    photoBase64?: string;
    purpose?: string;
  };

  if (!wallet || !nidBase64 || !photoBase64) {
    res.status(400).json({ error: "wallet, nidBase64, and photoBase64 required" });
    return;
  }

  const nidBuf = Buffer.from(nidBase64, "base64");
  const photoBuf = Buffer.from(photoBase64, "base64");
  const nidHash = createHash("sha256").update(nidBuf).digest("hex");
  const photoHash = createHash("sha256").update(photoBuf).digest("hex");
  const docHash = createHash("sha256")
    .update(`${nidHash}:${photoHash}:${purpose ?? ""}`)
    .digest("hex");

  const requestId = randomUUID();
  const dir = path.join(uploadDir, requestId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "nid.bin"), nidBuf);
  writeFileSync(path.join(dir, "photo.bin"), photoBuf);
  writeFileSync(
    path.join(dir, "meta.json"),
    JSON.stringify({ wallet, nidHash, photoHash, docHash, purpose }, null, 2),
  );

  const prisma = getPrisma();
  if (prisma) {
    let borrower = await prisma.borrower.findUnique({ where: { walletAddress: wallet } });
    if (!borrower) {
      const localInst = await prisma.institution.findFirst({ where: { institutionType: "LOCAL" } });
      if (localInst) {
        borrower = await prisma.borrower.create({
          data: {
            walletAddress: wallet,
            registeredLocalBankId: localInst.id,
            kycDocumentHash: nidHash,
          },
        });
      }
    }
    if (borrower) {
      const localInst =
        (await prisma.institution.findFirst({ where: { institutionType: "LOCAL" } })) ?? undefined;
      if (localInst) {
        await prisma.loanRequest.create({
          data: {
            borrowerId: borrower.id,
            localBankId: localInst.id,
            principalWei: "0",
            termMonths: 0,
            purpose: purpose ?? "",
            docHash: `0x${docHash}`,
            nidDocHash: nidHash,
            photoDocHash: photoHash,
            status: "DRAFT",
          },
        });
      }
    }
  }

  res.json({
    requestId,
    docHash: `0x${docHash}`,
    nidHash,
    photoHash,
  });
});

phase2Router.get("/documents/:requestId", (req, res) => {
  const dir = path.join(uploadDir, req.params.requestId);
  const metaPath = path.join(dir, "meta.json");
  if (!existsSync(metaPath)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  res.json({
    ...meta,
    requestId: req.params.requestId,
    hasNid: existsSync(path.join(dir, "nid.bin")),
    hasPhoto: existsSync(path.join(dir, "photo.bin")),
  });
});

phase2Router.get("/documents/:requestId/nid", (req, res) => {
  const file = path.join(uploadDir, req.params.requestId, "nid.bin");
  if (!existsSync(file)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.setHeader("content-type", "application/octet-stream");
  res.send(readFileSync(file));
});

phase2Router.get("/documents/:requestId/photo", (req, res) => {
  const file = path.join(uploadDir, req.params.requestId, "photo.bin");
  if (!existsSync(file)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.setHeader("content-type", "application/octet-stream");
  res.send(readFileSync(file));
});

phase2Router.get("/documents/by-hash/:docHash", async (req, res) => {
  const docHash = req.params.docHash.startsWith("0x")
    ? req.params.docHash
    : `0x${req.params.docHash}`;

  if (existsSync(uploadDir)) {
    for (const id of readdirSync(uploadDir)) {
      const metaPath = path.join(uploadDir, id, "meta.json");
      if (!existsSync(metaPath)) continue;
      const meta = JSON.parse(readFileSync(metaPath, "utf8"));
      const full = meta.docHash?.startsWith("0x") ? meta.docHash : `0x${meta.docHash}`;
      if (full?.toLowerCase() === docHash.toLowerCase()) {
        res.json({ requestId: id, ...meta });
        return;
      }
    }
  }

  const prisma = getPrisma();
  if (prisma) {
    const row = await prisma.loanRequest.findFirst({
      where: { docHash },
      orderBy: { createdAt: "desc" },
    });
    if (row) {
      res.json({
        docHash: row.docHash,
        nidHash: row.nidDocHash,
        photoHash: row.photoDocHash,
        purpose: row.purpose,
        prismaRequestId: row.id,
      });
      return;
    }
  }

  res.status(404).json({ error: "not_found" });
});

phase2Router.get("/loans/pending", async (req, res) => {
  const localBank = (req.query.localBank as string) || config.contracts.localBank;
  const prisma = getPrisma();

  let dbPending: unknown[] = [];
  if (prisma) {
    const localInst = localBank
      ? await prisma.institution.findFirst({
          where: { onChainAddress: localBank.toLowerCase() },
        })
      : await prisma.institution.findFirst({ where: { institutionType: "LOCAL" } });
    if (localInst) {
      dbPending = await prisma.loanRequest.findMany({
        where: {
          localBankId: localInst.id,
          status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
        },
        include: { borrower: true },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  if (!config.chainRpcUrl || !localBank) {
    res.json({ pending: [], db: dbPending, source: "prisma" });
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(config.chainRpcUrl);
    const lb = new ethers.Contract(
      localBank,
      [
        "function pendingLoanIds() view returns (uint256[])",
        "function loans(uint256) view returns (uint256,address,uint256,uint256,uint32,uint256,uint256,uint256,uint256,uint8,uint8,uint8,bytes32,string,uint256)",
      ],
      provider,
    );
    const ids: bigint[] = await lb.pendingLoanIds();
    const rows = await Promise.all(
      ids.map(async (id) => {
        const l = await lb.loans(id);
        const docHash = l[12] as string;
        let documentRequestId: string | null = null;
        if (docHash && existsSync(uploadDir)) {
          for (const entry of readdirSync(uploadDir)) {
            const metaPath = path.join(uploadDir, entry, "meta.json");
            if (!existsSync(metaPath)) continue;
            const meta = JSON.parse(readFileSync(metaPath, "utf8"));
            const full = meta.docHash?.startsWith("0x") ? meta.docHash : `0x${meta.docHash}`;
            if (full?.toLowerCase() === docHash.toLowerCase()) {
              documentRequestId = entry;
              break;
            }
          }
        }
        return {
          id: id.toString(),
          borrower: l[1] as string,
          principalWei: (l[2] as bigint).toString(),
          principalEth: ethers.formatEther(l[2] as bigint),
          docHash,
          documentRequestId,
          purpose: l[13] as string,
          status: "PENDING",
        };
      }),
    );
    res.json({ pending: rows, db: dbPending, source: "chain+prisma" });
  } catch (err) {
    res.status(502).json({
      error: "pending_loans_failed",
      message: err instanceof Error ? err.message : "unknown",
      db: dbPending,
    });
  }
});

phase2Router.get("/credit/:wallet", async (req, res) => {
  if (!config.chainRpcUrl || !config.contracts.creditPassport) {
    res.status(503).json({ error: "passport_not_configured" });
    return;
  }
  const provider = new ethers.JsonRpcProvider(config.chainRpcUrl);
  const passport = new ethers.Contract(
    config.contracts.creditPassport,
    [
      "function getScore(address) view returns (uint16,uint8)",
      "function maxLoanAmount(address) view returns (uint256)",
      "function openLoans(address) view returns (uint8)",
      "function canBorrow(address,uint256) view returns (bool)",
    ],
    provider,
  );
  const wallet = req.params.wallet;
  const [score, tier] = await passport.getScore(wallet).catch(() => [0, 0]);
  const maxLoan = await passport.maxLoanAmount(wallet).catch(() => 0n);
  const open = await passport.openLoans(wallet).catch(() => 0);

  const tierNames = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
  const prisma = getPrisma();
  let dbRecord = null;
  if (prisma) {
    const borrower = await prisma.borrower.findUnique({
      where: { walletAddress: wallet.toLowerCase() },
      include: { creditPassport: true, borrowingLimit: true },
    });
    dbRecord = borrower?.creditPassport ?? null;
  }

  res.json({
    wallet,
    creditScore: Number(score),
    riskTier: Number(tier),
    riskTierName: tierNames[Number(tier)] ?? "SILVER",
    maxLoanEth: ethers.formatEther(maxLoan),
    openLoans: Number(open),
    canBorrowWei: maxLoan.toString(),
    db: dbRecord,
  });
});

registerPhase2FacilityRoutes(phase2Router);
