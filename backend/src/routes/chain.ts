import { Router } from "express";
import { ethers } from "ethers";
import { config } from "../config";

export const chainRouter = Router();

const WORLD_ABI = [
  "function reserveBalance() view returns (uint256)",
  "function systemStats() view returns (uint256,uint256,uint256,uint256,uint256)",
] as const;

const NATIONAL_ABI = [
  "function bankStats() view returns (uint256,uint256,uint256,uint256)",
] as const;

const LOCAL_ABI = [
  "function bankStats() view returns (uint256,uint256,uint256,uint256,uint256)",
  "function allLoanIds() view returns (uint256[])",
  "function loans(uint256) view returns (uint256,address,uint256,uint256,uint32,uint256,uint256,uint256,uint256,uint8,uint8,uint8,string)",
] as const;

function weiToEth(v: bigint): number {
  return Number(ethers.formatEther(v));
}

chainRouter.get("/hierarchy", async (_req, res) => {
  const { chainRpcUrl, contracts } = config;
  if (!chainRpcUrl || !contracts.worldBank) {
    res.status(503).json({ error: "Chain not configured" });
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(chainRpcUrl);
    const network = await provider.getNetwork();

    const world = new ethers.Contract(contracts.worldBank, WORLD_ABI, provider);
    const stats: bigint[] = await world.systemStats();
    const reserveEth = weiToEth(stats[0]);

    let national: Record<string, unknown> | null = null;
    if (contracts.nationalBank) {
      const nb = new ethers.Contract(contracts.nationalBank, NATIONAL_ABI, provider);
      const nStats: bigint[] = await nb.bankStats();
      national = {
        address: contracts.nationalBank,
        balanceEth: weiToEth(nStats[0]),
        allocatedEth: weiToEth(nStats[1]),
        repaidEth: weiToEth(nStats[2]),
        localBankCount: Number(nStats[3]),
      };
    }

    let local: Record<string, unknown> | null = null;
    if (contracts.localBank) {
      const lb = new ethers.Contract(contracts.localBank, LOCAL_ABI, provider);
      const lStats: bigint[] = await lb.bankStats();
      local = {
        address: contracts.localBank,
        balanceEth: weiToEth(lStats[0]),
        loanCount: Number(lStats[1]),
        pending: Number(lStats[2]),
        active: Number(lStats[3]),
        repaid: Number(lStats[4]),
      };
    }

    res.json({
      chainId: Number(network.chainId),
      world: {
        address: contracts.worldBank,
        reserveEth,
        depositsEth: weiToEth(stats[1]),
        allocatedEth: weiToEth(stats[2]),
      },
      national,
      local,
      mockUsdc: contracts.mockUsdc || null,
    });
  } catch (err) {
    res.status(502).json({
      error: "chain_read_failed",
      message: err instanceof Error ? err.message : "unknown",
    });
  }
});

chainRouter.get("/loans/pending", async (_req, res) => {
  const { chainRpcUrl, contracts } = config;
  if (!chainRpcUrl || !contracts.localBank) {
    res.status(503).json({ error: "Local bank not configured" });
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(chainRpcUrl);
    const lb = new ethers.Contract(contracts.localBank, LOCAL_ABI, provider);
    const ids: bigint[] = await lb.allLoanIds();
    const pending = [];

    for (const id of ids) {
      const loan = await lb.loans(id);
      const status = Number(loan[11]);
      if (status !== 0) continue;
      pending.push({
        id: id.toString(),
        borrower: loan[1] as string,
        principalEth: weiToEth(loan[2] as bigint),
        aprBps: Number(loan[3]),
        termMonths: Number(loan[4]),
        purpose: loan[12] as string,
        createdAt: Number(loan[7]),
      });
    }

    res.json({ loans: pending });
  } catch (err) {
    res.status(502).json({
      error: "chain_read_failed",
      message: err instanceof Error ? err.message : "unknown",
    });
  }
});

chainRouter.get("/loans/borrower/:address", async (req, res) => {
  const { chainRpcUrl, contracts } = config;
  const borrower = req.params.address;
  if (!chainRpcUrl || !contracts.localBank) {
    res.status(503).json({ error: "Local bank not configured" });
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(chainRpcUrl);
    const lb = new ethers.Contract(contracts.localBank, LOCAL_ABI, provider);
    const lbRead = new ethers.Contract(
      contracts.localBank,
      [...LOCAL_ABI, "function borrowerLoans(address) view returns (uint256[])"],
      provider,
    );
    const ids: bigint[] = await lbRead.borrowerLoans(borrower);
    const loans = [];

    for (const id of ids) {
      const loan = await lb.loans(id);
      const status = Number(loan[11]);
      if (status !== 3) continue;
      const installmentCount = Number(loan[9]);
      const installmentsPaid = Number(loan[10]);
      const totalOwed = loan[5] as bigint;
      const installmentWei =
        installmentCount > 0 ? totalOwed / BigInt(installmentCount) : totalOwed;

      loans.push({
        id: id.toString(),
        principalEth: weiToEth(loan[2] as bigint),
        totalOwedEth: weiToEth(totalOwed),
        totalPaidEth: weiToEth(loan[6] as bigint),
        installmentCount,
        installmentsPaid,
        nextInstallmentEth: weiToEth(installmentWei),
        isLumpSum: installmentCount === 1,
        purpose: loan[12] as string,
      });
    }

    res.json({ loans });
  } catch (err) {
    res.status(502).json({
      error: "chain_read_failed",
      message: err instanceof Error ? err.message : "unknown",
    });
  }
});
