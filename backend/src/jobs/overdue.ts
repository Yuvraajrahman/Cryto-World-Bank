import type { Prisma } from "@prisma/client";
import type { Logger } from "pino";
import { ethers } from "ethers";
import { config } from "../config";
import { LOCAL_EVENTS_ABI } from "../chain/abis";
import { getChainProvider } from "../chain/provider";

export interface OverdueLoan {
  id: string;
  borrower: string;
  nextDueAt: number;
  principalEth: string;
  purpose: string;
}

export async function scanOverdueLoans(): Promise<OverdueLoan[]> {
  const provider = getChainProvider();
  const localBank = config.contracts.localBank;
  if (!provider || !localBank) return [];

  const lb = new ethers.Contract(localBank, LOCAL_EVENTS_ABI, provider);
  const ids: bigint[] = await lb.allLoanIds();
  const block = await provider.getBlock("latest");
  const now = block?.timestamp ?? Math.floor(Date.now() / 1000);
  const overdue: OverdueLoan[] = [];

  for (const id of ids) {
    const loan = await lb.loans(id);
    const status = Number(loan[11] ?? loan.status);
    if (status !== 3) continue; // Active
    const nextDueAt = Number(loan[14] ?? loan.nextDueAt);
    if (nextDueAt > 0 && nextDueAt < now) {
      overdue.push({
        id: id.toString(),
        borrower: (loan[1] ?? loan.borrower) as string,
        nextDueAt,
        principalEth: ethers.formatEther((loan[2] ?? loan.principal) as bigint),
        purpose: (loan[13] ?? loan.purpose) as string,
      });
    }
  }

  return overdue;
}

export function startOverdueJob(logger: Logger): () => void {
  const intervalMs = Number(process.env.OVERDUE_CRON_MS ?? 60_000);
  let running = false;

  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const overdue = await scanOverdueLoans();
      if (overdue.length > 0) {
        logger.info({ count: overdue.length, ids: overdue.map((o) => o.id) }, "overdue: loans past due");
      }

      const pk = process.env.CHAIN_OPERATOR_PRIVATE_KEY;
      if (pk && overdue.length > 0 && config.contracts.localBank) {
        const provider = getChainProvider();
        if (!provider) return;
        const wallet = new ethers.Wallet(pk, provider);
        const lb = new ethers.Contract(
          config.contracts.localBank,
          ["function markLoanDefaulted(uint256 id) external"],
          wallet,
        );
        for (const loan of overdue) {
          try {
            const tx = await lb.markLoanDefaulted(loan.id);
            await tx.wait();
            logger.info({ loanId: loan.id }, "overdue: marked defaulted on-chain");
          } catch (err) {
            logger.warn({ err, loanId: loan.id }, "overdue: markLoanDefaulted failed");
          }
        }
      }
    } catch (err) {
      logger.warn({ err }, "overdue: scan failed");
    } finally {
      running = false;
    }
  };

  const handle = setInterval(() => void tick(), intervalMs);
  void tick();
  return () => clearInterval(handle);
}
