import { Router } from "express";
import { ethers } from "ethers";
import { config } from "../config";
import { getPrisma } from "../db/prisma";
import { getChainProvider } from "../chain/provider";
import { fetchCapitalRequests } from "../chain/capitalRequests";
import { scanOverdueLoans } from "../jobs/overdue";
import { PASSPORT_TIERS } from "../lib/rates";

export function registerPhase2FacilityRoutes(router: Router): void {
  router.get("/capital-requests", async (req, res) => {
    const tier = (req.query.tier as string) ?? "world";
    if (tier !== "world" && tier !== "national") {
      res.status(400).json({ error: "tier must be world or national" });
      return;
    }
    try {
      const open = await fetchCapitalRequests(tier);
      res.json({ tier, requests: open });
    } catch (err) {
      res.status(502).json({
        error: "capital_requests_failed",
        message: err instanceof Error ? err.message : "unknown",
      });
    }
  });

  router.get("/upward-deposits", async (req, res) => {
    const prisma = getPrisma();
    const depositor = (req.query.depositor as string)?.toLowerCase();
    if (prisma) {
      const rows = await prisma.upwardDepositRecord.findMany({
        where: depositor ? { depositorId: depositor } : undefined,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      res.json({ deposits: rows });
      return;
    }
    res.json({ deposits: [] });
  });

  router.get("/savings/:wallet", async (req, res) => {
    const wallet = req.params.wallet;
    const vault = config.contracts.savingsVault;
    if (!vault) {
      res.status(503).json({ error: "savings_vault_not_configured" });
      return;
    }

    const provider = getChainProvider();
    let onChain = { balanceEth: "0", shares: "0", totalShares: "0", yieldIndexBps: 500 };
    if (provider) {
      const sv = new ethers.Contract(
        vault,
        [
          "function balanceOf(address) view returns (uint256)",
          "function sharesOf(address) view returns (uint256)",
          "function totalShares() view returns (uint256)",
          "function yieldIndexBps() view returns (uint256)",
        ],
        provider,
      );
      const [bal, shares, totalShares, yieldBps] = await Promise.all([
        sv.balanceOf(wallet),
        sv.sharesOf(wallet),
        sv.totalShares(),
        sv.yieldIndexBps(),
      ]);
      onChain = {
        balanceEth: ethers.formatEther(bal),
        shares: shares.toString(),
        totalShares: totalShares.toString(),
        yieldIndexBps: Number(yieldBps),
      };
    }

    const prisma = getPrisma();
    let dbRow = null;
    if (prisma) {
      const borrower = await prisma.borrower.findUnique({
        where: { walletAddress: wallet.toLowerCase() },
      });
      if (borrower) {
        dbRow = await prisma.savingsAccount.findFirst({
          where: { borrowerId: borrower.id, vaultAddress: vault.toLowerCase() },
        });
      }
    }

    res.json({ wallet, vault, onChain, db: dbRow });
  });

  router.get("/groups", async (_req, res) => {
    const pool = config.contracts.groupLendingPool;
    const prisma = getPrisma();

    const onChain: unknown[] = [];
    const provider = getChainProvider();
    if (provider && pool) {
      const gp = new ethers.Contract(
        pool,
        [
          "function nextGroupId() view returns (uint256)",
          "function groups(uint256) view returns (uint256,address,address,uint8,uint8,uint8)",
          "function groupMembers(uint256,uint256) view returns (address)",
          "function members(uint256,address) view returns (address,bool,bool)",
        ],
        provider,
      );
      const next: bigint = await gp.nextGroupId();
      for (let id = 1n; id < next; id++) {
        const g = await gp.groups(id);
        const memberCount = Number(g[3] ?? g.memberCount);
        const members: string[] = [];
        for (let i = 0; i < memberCount; i++) {
          members.push(await gp.groupMembers(id, i));
        }
        onChain.push({
          id: id.toString(),
          organizer: g[1],
          localBank: g[2],
          memberCount,
          consentCount: Number(g[4]),
          status: Number(g[5]),
          members,
        });
      }
    }

    const dbGroups = prisma
      ? await prisma.loanGroup.findMany({
          include: { members: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

    res.json({ onChain, db: dbGroups });
  });

  router.get("/interbank/loans", async (req, res) => {
    const pool = config.contracts.interBankLendingPool;
    const borrower = req.query.borrower as string | undefined;
    const prisma = getPrisma();

    const onChain: unknown[] = [];
    const provider = getChainProvider();
    if (provider && pool) {
      const ib = new ethers.Contract(
        pool,
        [
          "function nextLoanId() view returns (uint256)",
          "function loans(uint256) view returns (uint256,address,address,uint256,uint256,uint32,uint256,uint256,uint8)",
          "function loansByBorrower(address,uint256) view returns (uint256)",
          "function tierLabel() view returns (string)",
        ],
        provider,
      );
      const tierLabel: string = await ib.tierLabel();

      if (borrower) {
        let i = 0;
        for (;;) {
          try {
            const lid: bigint = await ib.loansByBorrower(borrower, i);
            const l = await ib.loans(lid);
            onChain.push(formatIblpLoan(lid, l, tierLabel));
            i++;
          } catch {
            break;
          }
        }
      } else {
        const next: bigint = await ib.nextLoanId();
        for (let id = 1n; id < next; id++) {
          const l = await ib.loans(id);
          const principal = l[3] ?? l.principal;
          if (principal === 0n) continue;
          onChain.push(formatIblpLoan(id, l, tierLabel));
        }
      }
    }

    const dbLoans = prisma
      ? await prisma.interbankLoanRecord.findMany({
          orderBy: { createdAt: "desc" },
          take: 30,
        })
      : [];

    res.json({ onChain, db: dbLoans });
  });

  router.get("/interest-tiers", async (_req, res) => {
    const prisma = getPrisma();
    if (prisma) {
      const tiers = await prisma.interestRateTier.findMany({ orderBy: { minScore: "asc" } });
      if (tiers.length > 0) {
        res.json({ tiers });
        return;
      }
    }
    // Fallback aligned with PASSPORT_TIERS (CreditPassport.sol / rates.ts)
    const baseApr = 1000;
    res.json({
      tiers: PASSPORT_TIERS.map((t) => ({
        tierName: t.name.toUpperCase(),
        minScore: t.minScore,
        maxScore: t.maxScore,
        aprBps: baseApr + t.rateModifierBps,
        rateModifierBps: t.rateModifierBps,
        maxLoanUsdc: t.maxLoanUsdc,
      })),
    });
  });

  router.get("/accounts/:wallet", async (req, res) => {
    const wallet = req.params.wallet;
    let frozen = false;
    if (config.contracts.localBank && config.chainRpcUrl) {
      const provider = getChainProvider();
      if (provider) {
        const lb = new ethers.Contract(
          config.contracts.localBank,
          ["function frozenAccounts(address) view returns (bool)"],
          provider,
        );
        frozen = await lb.frozenAccounts(wallet);
      }
    }

    const prisma = getPrisma();
    const borrower = prisma
      ? await prisma.borrower.findUnique({
          where: { walletAddress: wallet.toLowerCase() },
          include: { creditPassport: true },
        })
      : null;

    res.json({
      wallet,
      frozen,
      registered: Boolean(borrower),
      kycLevel: borrower?.kycLevel ?? null,
      creditPassport: borrower?.creditPassport ?? null,
    });
  });

  router.get("/loans/history/:wallet", async (req, res) => {
    const wallet = req.params.wallet.toLowerCase();
    const prisma = getPrisma();

    const dbLoans = prisma
      ? await prisma.loan.findMany({
          where: { borrower: { walletAddress: wallet } },
          include: {
            installments: { orderBy: { index: "asc" } },
            request: true,
            localBank: true,
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    let chainLoans: unknown[] = [];
    if (config.chainRpcUrl && config.contracts.localBank) {
      try {
        const provider = getChainProvider();
        if (provider) {
          const lb = new ethers.Contract(
            config.contracts.localBank,
            [
              "function borrowerLoans(address) view returns (uint256[])",
              "function loans(uint256) view returns (uint256,address,uint256,uint256,uint32,uint256,uint256,uint256,uint256,uint8,uint8,uint8,bytes32,string,uint256)",
            ],
            provider,
          );
          const ids: bigint[] = await lb.borrowerLoans(wallet);
          chainLoans = await Promise.all(
            ids.map(async (id) => {
              const l = await lb.loans(id);
              return {
                id: id.toString(),
                principalEth: ethers.formatEther(l[2] as bigint),
                totalOwedEth: ethers.formatEther(l[5] as bigint),
                totalPaidEth: ethers.formatEther(l[6] as bigint),
                status: Number(l[11]),
                purpose: l[13] as string,
                docHash: l[12] as string,
                nextDueAt: Number(l[14]),
              };
            }),
          );
        }
      } catch {
        /* optional */
      }
    }

    res.json({ wallet, chain: chainLoans, db: dbLoans });
  });

  router.get("/loans/overdue", async (_req, res) => {
    try {
      const overdue = await scanOverdueLoans();
      res.json({ overdue, count: overdue.length });
    } catch (err) {
      res.status(502).json({
        error: "overdue_scan_failed",
        message: err instanceof Error ? err.message : "unknown",
      });
    }
  });

  router.post("/loans/validate", async (req, res) => {
    const { wallet, principalEth } = req.body as { wallet?: string; principalEth?: number };
    if (!wallet || principalEth === undefined) {
      res.status(400).json({ error: "wallet and principalEth required" });
      return;
    }
    if (!config.chainRpcUrl || !config.contracts.creditPassport) {
      res.json({ valid: true, source: "unchecked" });
      return;
    }
    const provider = getChainProvider();
    if (!provider) {
      res.json({ valid: true, source: "unchecked" });
      return;
    }
    const passport = new ethers.Contract(
      config.contracts.creditPassport,
      ["function canBorrow(address,uint256) view returns (bool)", "function maxLoanAmount(address) view returns (uint256)"],
      provider,
    );
    const wei = ethers.parseEther(String(principalEth));
    const [canBorrow, maxLoan] = await Promise.all([
      passport.canBorrow(wallet, wei),
      passport.maxLoanAmount(wallet),
    ]);
    res.json({
      valid: Boolean(canBorrow),
      maxLoanEth: ethers.formatEther(maxLoan),
      principalEth,
      wallet,
    });
  });
}

function formatIblpLoan(id: bigint, l: ethers.Result, tierLabel: string) {
  return {
    id: id.toString(),
    lender: l[1],
    borrower: l[2],
    principalEth: ethers.formatEther(l[3] as bigint),
    interestBps: Number(l[4]),
    tenorDays: Number(l[5]),
    createdAt: Number(l[6]),
    dueAt: Number(l[7]),
    status: Number(l[8]),
    tierLabel,
  };
}
