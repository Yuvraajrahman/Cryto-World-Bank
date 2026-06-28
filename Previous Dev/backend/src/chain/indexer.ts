// Lightweight on-chain event indexer.
//
// Listens to the three Crypto World Bank contracts via ethers and mirrors
// selected events into the in-memory / JSON-file store as Transactions. The
// indexer is opt-in: when CHAIN_RPC_URL and the contract addresses are not
// configured, it logs a warning and returns so the API can still run locally
// without a live chain. This satisfies the Sprint-1 "event listener" hook
// mentioned in the thesis's off-chain services layer.

import { ethers } from "ethers";
import type { Logger } from "pino";
import { config } from "../config";
import { db, type Transaction } from "../store/db";

// Minimal ABIs — only the events we actually mirror. Keeping them local means
// the backend doesn't need a Hardhat artifact path at runtime.
const WORLD_ABI = [
  "event DepositReceived(address indexed from, uint256 amount)",
  "event CapitalAllocated(address indexed bank, uint256 amount)",
  "event RepaymentRecorded(address indexed bank, uint256 principal, uint256 interest)",
] as const;

const NATIONAL_ABI = [
  "event CapitalAllocated(address indexed bank, uint256 amount)",
  "event RepaymentRecorded(address indexed bank, uint256 principal, uint256 interest)",
] as const;

const LOCAL_ABI = [
  "event LoanApproved(uint256 indexed id, address indexed approver, uint256 totalOwed, uint8 installments)",
  "event InstallmentPaid(uint256 indexed id, address indexed borrower, uint8 installmentIndex, uint256 amount)",
  "event LoanRepaid(uint256 indexed id, address indexed borrower)",
] as const;

function pushTx(partial: Omit<Transaction, "id" | "at">): void {
  const tx: Transaction = {
    id: db.uid("tx"),
    at: db.nowIso(),
    ...partial,
  };
  db.state.transactions.unshift(tx);
}

function weiToEth(v: bigint): number {
  return Number(ethers.formatEther(v));
}

export interface IndexerHandle {
  stop: () => Promise<void>;
}

export async function startIndexer(logger: Logger): Promise<IndexerHandle | null> {
  const { chainRpcUrl, contracts } = config;
  const hasAny =
    contracts.worldBank || contracts.nationalBank || contracts.localBank;

  if (!chainRpcUrl || !hasAny) {
    logger.warn(
      "indexer: CHAIN_RPC_URL or contract addresses not set — on-chain sync disabled",
    );
    return null;
  }

  let provider: ethers.JsonRpcProvider;
  try {
    provider = new ethers.JsonRpcProvider(chainRpcUrl);
    // Force a connection check so we can fail fast with a useful log line
    // instead of silently dropping events.
    const net = await provider.getNetwork();
    logger.info({ chainId: Number(net.chainId) }, "indexer: connected to chain");
  } catch (err) {
    logger.warn({ err }, "indexer: could not connect to CHAIN_RPC_URL — disabled");
    return null;
  }

  const cleanups: Array<() => void> = [];

  if (contracts.worldBank) {
    const wb = new ethers.Contract(contracts.worldBank, WORLD_ABI, provider);

    await wb.on("DepositReceived", (from: string, amount: bigint, ev: ethers.Log) => {
      pushTx({
        type: "DEPOSIT",
        amount: weiToEth(amount),
        txHash: ev.transactionHash,
        note: `Deposit from ${from}`,
      });
    });
    await wb.on(
      "CapitalAllocated",
      (bank: string, amount: bigint, ev: ethers.Log) => {
        pushTx({
          type: "ALLOCATION",
          amount: weiToEth(amount),
          txHash: ev.transactionHash,
          note: `WorldBank → ${bank}`,
        });
      },
    );
    cleanups.push(() => {
      wb.removeAllListeners();
    });
    logger.info({ addr: contracts.worldBank }, "indexer: listening on WorldBankReserve");
  }

  if (contracts.nationalBank) {
    const nb = new ethers.Contract(contracts.nationalBank, NATIONAL_ABI, provider);
    await nb.on(
      "CapitalAllocated",
      (bank: string, amount: bigint, ev: ethers.Log) => {
        pushTx({
          type: "ALLOCATION",
          amount: weiToEth(amount),
          txHash: ev.transactionHash,
          note: `NationalBank → ${bank}`,
        });
      },
    );
    cleanups.push(() => {
      nb.removeAllListeners();
    });
    logger.info({ addr: contracts.nationalBank }, "indexer: listening on NationalBank");
  }

  if (contracts.localBank) {
    const lb = new ethers.Contract(contracts.localBank, LOCAL_ABI, provider);
    await lb.on(
      "LoanApproved",
      (id: bigint, _approver: string, totalOwed: bigint, _installments: number, ev: ethers.Log) => {
        pushTx({
          type: "LOAN_APPROVED",
          amount: weiToEth(totalOwed),
          txHash: ev.transactionHash,
          loanId: `chain_${id.toString()}`,
        });
      },
    );
    await lb.on(
      "InstallmentPaid",
      (
        id: bigint,
        borrower: string,
        _idx: number,
        amount: bigint,
        ev: ethers.Log,
      ) => {
        pushTx({
          type: "INSTALLMENT_PAID",
          amount: weiToEth(amount),
          txHash: ev.transactionHash,
          loanId: `chain_${id.toString()}`,
          note: `from ${borrower}`,
        });
      },
    );
    await lb.on(
      "LoanRepaid",
      (id: bigint, borrower: string, ev: ethers.Log) => {
        pushTx({
          type: "LOAN_REPAID",
          amount: 0,
          txHash: ev.transactionHash,
          loanId: `chain_${id.toString()}`,
          note: `repaid by ${borrower}`,
        });
      },
    );
    cleanups.push(() => {
      lb.removeAllListeners();
    });
    logger.info({ addr: contracts.localBank }, "indexer: listening on LocalBank");
  }

  return {
    stop: async () => {
      for (const c of cleanups) c();
      await provider.destroy?.();
    },
  };
}
