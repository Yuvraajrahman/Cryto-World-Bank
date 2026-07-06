import { Router } from "express";
import { ethers } from "ethers";
import type { InstitutionType } from "@prisma/client";
import { config } from "../config";
import { getPrisma } from "../db/prisma";
import { fetchCapitalRequests } from "../chain/capitalRequests";
import { getChainProvider } from "../chain/provider";

export const phase1Router = Router();

phase1Router.get("/status", async (_req, res) => {
  const prisma = getPrisma();
  const hasDb = Boolean(prisma);
  const hasContracts = Boolean(
    config.contracts.worldBank &&
      config.contracts.nationalBank &&
      config.contracts.localBank,
  );

  let chainConnected = false;
  let reserveBalanceEth: string | null = null;

  if (config.chainRpcUrl && config.contracts.worldBank) {
    try {
      const provider = new ethers.JsonRpcProvider(config.chainRpcUrl);
      await provider.getNetwork();
      chainConnected = true;
      const wb = new ethers.Contract(
        config.contracts.worldBank,
        ["function reserveBalance() view returns (uint256)"],
        provider,
      );
      const bal: bigint = await wb.reserveBalance();
      reserveBalanceEth = ethers.formatEther(bal);
    } catch {
      chainConnected = false;
    }
  }

  res.json({
    phase: "I",
    gate: "G1",
    postgres: hasDb,
    contractsConfigured: hasContracts,
    chainConnected,
    onChainReserveEth: reserveBalanceEth,
    contracts: config.contracts,
    mockUsdc: config.contracts.mockUsdc,
    loanController: config.contracts.loanController,
    governorMultisig: config.contracts.governorMultisig,
  });
});

phase1Router.get("/reserve/summary", async (_req, res) => {
  const { chainRpcUrl, contracts } = config;
  if (!chainRpcUrl || !contracts.worldBank) {
    res.status(503).json({ error: "Chain not configured" });
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(chainRpcUrl);
    const world = new ethers.Contract(
      contracts.worldBank,
      ["function systemStats() view returns (uint256,uint256,uint256,uint256,uint256)"],
      provider,
    );
    const stats: bigint[] = await world.systemStats();

    let national: Record<string, unknown> | null = null;
    let local: Record<string, unknown> | null = null;

    if (contracts.nationalBank) {
      const nb = new ethers.Contract(
        contracts.nationalBank,
        ["function bankStats() view returns (uint256,uint256,uint256,uint256)"],
        provider,
      );
      const nStats: bigint[] = await nb.bankStats();
      national = {
        address: contracts.nationalBank,
        balanceEth: Number(ethers.formatEther(nStats[0])),
        allocatedEth: Number(ethers.formatEther(nStats[1])),
      };
    }

    const loanReader = contracts.localBank;
    if (loanReader) {
      const lb = new ethers.Contract(
        loanReader,
        ["function bankStats() view returns (uint256,uint256,uint256,uint256,uint256)"],
        provider,
      );
      const lStats: bigint[] = await lb.bankStats();
      local = {
        address: contracts.localBank,
        loanPoolEth: Number(ethers.formatEther(lStats[0])),
        pending: Number(lStats[2]),
        active: Number(lStats[3]),
        repaid: Number(lStats[4]),
      };
    }

    const prisma = getPrisma();
    let assetRows: unknown[] = [];
    if (prisma) {
      assetRows = await prisma.asset.findMany({ take: 20 });
    }

    res.json({
      world: {
        address: contracts.worldBank,
        reserveEth: Number(ethers.formatEther(stats[0])),
        depositsEth: Number(ethers.formatEther(stats[1])),
        allocatedEth: Number(ethers.formatEther(stats[2])),
        repaidEth: Number(ethers.formatEther(stats[3])),
        nationalBankCount: Number(stats[4]),
      },
      national,
      local,
      loanController: contracts.loanController || null,
      assets: assetRows,
    });
  } catch (err) {
    res.status(502).json({
      error: "reserve_summary_failed",
      message: err instanceof Error ? err.message : "unknown",
    });
  }
});

phase1Router.get("/institutions", async (_req, res) => {
  const prisma = getPrisma();
  if (!prisma) {
    res.status(503).json({
      error: "PostgreSQL not configured. Set DATABASE_URL and run prisma migrate.",
    });
    return;
  }

  const institutions = await prisma.institution.findMany({
    include: {
      worldBank: true,
      nationalBank: true,
      localBank: true,
      country: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const events = await prisma.blockchainEventLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  res.json({ institutions, recentEvents: events });
});

const TIER_MAP: Record<string, InstitutionType> = {
  world: "WORLD",
  national: "NATIONAL",
  local: "LOCAL",
  WORLD: "WORLD",
  NATIONAL: "NATIONAL",
  LOCAL: "LOCAL",
};

phase1Router.get("/institutions/:tier", async (req, res) => {
  const prisma = getPrisma();
  const tierKey = req.params.tier;
  const institutionType = TIER_MAP[tierKey];
  if (!institutionType) {
    res.status(400).json({ error: "invalid_tier", allowed: ["world", "national", "local"] });
    return;
  }
  if (!prisma) {
    res.status(503).json({ error: "PostgreSQL not configured" });
    return;
  }

  const institutions = await prisma.institution.findMany({
    where: { institutionType },
    include: {
      worldBank: true,
      nationalBank: true,
      localBank: true,
      country: true,
      assets: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const provider = getChainProvider();
  const balances: Record<string, string> = {};
  if (provider) {
    for (const inst of institutions) {
      const addr = inst.onChainAddress;
      if (!addr) continue;
      try {
        const bal = await provider.getBalance(addr);
        balances[inst.id] = ethers.formatEther(bal);
      } catch {
        /* skip */
      }
    }
  }

  res.json({ tier: institutionType, institutions, balancesEth: balances });
});

phase1Router.get("/capital-requests", async (req, res) => {
  const tier = ((req.query.tier as string) ?? "world") as "world" | "national";
  if (tier !== "world" && tier !== "national") {
    res.status(400).json({ error: "tier must be world or national" });
    return;
  }
  try {
    const requests = await fetchCapitalRequests(tier);
    res.json({ tier, requests });
  } catch (err) {
    res.status(502).json({
      error: "capital_requests_failed",
      message: err instanceof Error ? err.message : "unknown",
    });
  }
});
