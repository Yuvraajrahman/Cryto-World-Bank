import type { Prisma } from "@prisma/client";
import { ethers } from "ethers";
import type { Logger } from "pino";
import { config } from "../config";
import { persistBlockchainEvent } from "./persistEvent";
import {
  WORLD_EVENTS_ABI,
  NATIONAL_EVENTS_ABI,
  LOCAL_EVENTS_ABI,
  LOAN_CONTROLLER_EVENTS_ABI,
  PASSPORT_EVENTS_ABI,
  UPWARD_EVENTS_ABI,
  SAVINGS_EVENTS_ABI,
  GROUP_EVENTS_ABI,
  IBLP_EVENTS_ABI,
} from "./abis";
import {
  projectAccountFrozen,
  projectCapitalRequested,
  projectClientRegistered,
  projectGroupActivated,
  projectGroupCreated,
  projectGroupMember,
  projectIblpBorrowed,
  projectIblpRepaid,
  projectInstallmentPaid,
  projectLoanApproved,
  projectLoanDefaulted,
  projectLoanRejected,
  projectLoanRepaid,
  projectLoanRequested,
  projectPassportIssued,
  projectSavingsDeposit,
  projectUpwardDeposit,
} from "./projections";
import { db, type Transaction } from "../store/db";

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

function persist(
  contract: string,
  eventName: string,
  ev: ethers.Log,
  payload: Prisma.InputJsonValue,
): void {
  void persistBlockchainEvent({
    contract,
    eventName,
    txHash: ev.transactionHash,
    blockNumber: ev.blockNumber,
    logIndex: ev.index,
    payload,
  });
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
    const net = await provider.getNetwork();
    logger.info({ chainId: Number(net.chainId) }, "indexer: connected to chain");
  } catch (err) {
    logger.warn({ err }, "indexer: could not connect to CHAIN_RPC_URL — disabled");
    return null;
  }

  const cleanups: Array<() => void> = [];

  const bindLoanEvents = (addr: string, label: string) => {
    const c = new ethers.Contract(addr, LOAN_CONTROLLER_EVENTS_ABI, provider);

    c.on(
      "LoanRequested",
      (
        id: bigint,
        borrower: string,
        principal: bigint,
        docHash: string,
        purpose: string,
        ev: ethers.Log,
      ) => {
        pushTx({
          type: "LOAN_REQUESTED",
          amount: weiToEth(principal),
          txHash: ev.transactionHash,
          loanId: `chain_${id.toString()}`,
          note: purpose,
        });
        persist(addr, "LoanRequested", ev, {
          id: id.toString(),
          borrower,
          principal: principal.toString(),
          docHash,
          purpose,
        });
        void projectLoanRequested({
          onChainId: id.toString(),
          borrower,
          principalWei: principal.toString(),
          docHash,
          purpose,
          txHash: ev.transactionHash,
        });
      },
    );

    c.on(
      "LoanApproved",
      (id: bigint, _approver: string, totalOwed: bigint, installments: number, ev: ethers.Log) => {
        pushTx({
          type: "LOAN_APPROVED",
          amount: weiToEth(totalOwed),
          txHash: ev.transactionHash,
          loanId: `chain_${id.toString()}`,
        });
        persist(addr, "LoanApproved", ev, {
          id: id.toString(),
          totalOwed: totalOwed.toString(),
          installments,
        });
        void projectLoanApproved({
          onChainId: id.toString(),
          totalOwedWei: totalOwed.toString(),
          installments,
          txHash: ev.transactionHash,
        });
      },
    );

    c.on(
      "LoanDisbursed",
      (id: bigint, borrower: string, amount: bigint, ev: ethers.Log) => {
        pushTx({
          type: "LOAN_DISBURSED",
          amount: weiToEth(amount),
          txHash: ev.transactionHash,
          loanId: `chain_${id.toString()}`,
          note: `disbursed to ${borrower}`,
        });
        persist(addr, "LoanDisbursed", ev, {
          id: id.toString(),
          borrower,
          amount: amount.toString(),
        });
      },
    );

    c.on(
      "LoanRejected",
      (id: bigint, _approver: string, reason: string, ev: ethers.Log) => {
        persist(addr, "LoanRejected", ev, { id: id.toString(), reason });
        void projectLoanRejected({
          onChainId: id.toString(),
          reason,
          txHash: ev.transactionHash,
        });
      },
    );

    c.on(
      "InstallmentPaid",
      (id: bigint, borrower: string, idx: number, amount: bigint, ev: ethers.Log) => {
        pushTx({
          type: "INSTALLMENT_PAID",
          amount: weiToEth(amount),
          txHash: ev.transactionHash,
          loanId: `chain_${id.toString()}`,
          note: `from ${borrower}`,
        });
        persist(addr, "InstallmentPaid", ev, {
          id: id.toString(),
          borrower,
          installmentIndex: idx,
          amount: amount.toString(),
        });
        void projectInstallmentPaid({
          onChainId: id.toString(),
          installmentIndex: idx,
          amountWei: amount.toString(),
          txHash: ev.transactionHash,
        });
      },
    );

    c.on("LoanRepaid", (id: bigint, borrower: string, ev: ethers.Log) => {
      pushTx({
        type: "LOAN_REPAID",
        amount: 0,
        txHash: ev.transactionHash,
        loanId: `chain_${id.toString()}`,
        note: `repaid by ${borrower}`,
      });
      persist(addr, "LoanRepaid", ev, { id: id.toString(), borrower });
      void projectLoanRepaid({
        onChainId: id.toString(),
        borrower,
        txHash: ev.transactionHash,
      });
    });

    c.on("LoanDefaulted", (id: bigint, borrower: string, ev: ethers.Log) => {
      persist(addr, "LoanDefaulted", ev, { id: id.toString(), borrower });
      void projectLoanDefaulted({
        onChainId: id.toString(),
        borrower,
        txHash: ev.transactionHash,
      });
    });

    cleanups.push(() => c.removeAllListeners());
    logger.info({ addr, label }, "indexer: listening on loan events");
  };

  if (contracts.worldBank) {
    const wb = new ethers.Contract(contracts.worldBank, WORLD_EVENTS_ABI, provider);

    wb.on("DepositReceived", (from: string, amount: bigint, ev: ethers.Log) => {
      pushTx({
        type: "DEPOSIT",
        amount: weiToEth(amount),
        txHash: ev.transactionHash,
        note: `Deposit from ${from}`,
      });
      persist(contracts.worldBank!, "DepositReceived", ev, {
        from,
        amount: amount.toString(),
      });
    });

    wb.on("CapitalAllocated", (bank: string, amount: bigint, ev: ethers.Log) => {
      pushTx({
        type: "ALLOCATION",
        amount: weiToEth(amount),
        txHash: ev.transactionHash,
        note: `WorldBank → ${bank}`,
      });
      persist(contracts.worldBank!, "CapitalAllocated", ev, {
        bank,
        amount: amount.toString(),
      });
    });

    wb.on(
      "CapitalRequested",
      (bank: string, amount: bigint, requestId: bigint, ev: ethers.Log) => {
        persist(contracts.worldBank!, "CapitalRequested", ev, {
          bank,
          amount: amount.toString(),
          requestId: requestId.toString(),
        });
        void projectCapitalRequested({
          tier: "world",
          bank,
          amountWei: amount.toString(),
          requestId: requestId.toString(),
          txHash: ev.transactionHash,
        });
      },
    );

    cleanups.push(() => wb.removeAllListeners());
    logger.info({ addr: contracts.worldBank }, "indexer: listening on WorldBankReserve");
  }

  if (contracts.nationalBank) {
    const nb = new ethers.Contract(contracts.nationalBank, NATIONAL_EVENTS_ABI, provider);

    nb.on("CapitalAllocated", (bank: string, amount: bigint, ev: ethers.Log) => {
      pushTx({
        type: "ALLOCATION",
        amount: weiToEth(amount),
        txHash: ev.transactionHash,
        note: `NationalBank → ${bank}`,
      });
      persist(contracts.nationalBank!, "CapitalAllocated", ev, {
        bank,
        amount: amount.toString(),
      });
    });

    nb.on(
      "CapitalRequested",
      (bank: string, amount: bigint, requestId: bigint, ev: ethers.Log) => {
        persist(contracts.nationalBank!, "CapitalRequested", ev, {
          bank,
          amount: amount.toString(),
          requestId: requestId.toString(),
        });
        void projectCapitalRequested({
          tier: "national",
          bank,
          amountWei: amount.toString(),
          requestId: requestId.toString(),
          txHash: ev.transactionHash,
        });
      },
    );

    cleanups.push(() => nb.removeAllListeners());
    logger.info({ addr: contracts.nationalBank }, "indexer: listening on NationalBank");
  }

  if (contracts.localBank) {
    const lb = new ethers.Contract(contracts.localBank, LOCAL_EVENTS_ABI, provider);

    lb.on("ClientRegistered", (client: string, ev: ethers.Log) => {
      persist(contracts.localBank!, "ClientRegistered", ev, { client });
      void projectClientRegistered({ wallet: client, txHash: ev.transactionHash });
    });

    lb.on("AccountFrozen", (client: string, ev: ethers.Log) => {
      persist(contracts.localBank!, "AccountFrozen", ev, { client });
      void projectAccountFrozen({ wallet: client, txHash: ev.transactionHash });
    });

    cleanups.push(() => lb.removeAllListeners());
    logger.info({ addr: contracts.localBank }, "indexer: listening on LocalBank admin events");
  }

  const loanAddr = contracts.loanController || contracts.localBank;
  if (loanAddr) {
    bindLoanEvents(loanAddr, "LoanController");
  }

  if (contracts.creditPassport) {
    const cp = new ethers.Contract(contracts.creditPassport, PASSPORT_EVENTS_ABI, provider);
    cp.on(
      "PassportIssued",
      (wallet: string, creditScore: bigint, tier: number, ev: ethers.Log) => {
        persist(contracts.creditPassport!, "PassportIssued", ev, {
          wallet,
          creditScore: creditScore.toString(),
          tier,
        });
        void projectPassportIssued({
          wallet,
          creditScore: Number(creditScore),
          tier,
        });
      },
    );
    cp.on(
      "ScoreUpdated",
      (wallet: string, _old: bigint, newScore: bigint, tier: number, ev: ethers.Log) => {
        persist(contracts.creditPassport!, "ScoreUpdated", ev, {
          wallet,
          newScore: newScore.toString(),
          tier,
        });
        void projectPassportIssued({
          wallet,
          creditScore: Number(newScore),
          tier,
        });
      },
    );
    cleanups.push(() => cp.removeAllListeners());
    logger.info({ addr: contracts.creditPassport }, "indexer: listening on CreditPassport");
  }

  if (contracts.upwardDeposit) {
    const ud = new ethers.Contract(contracts.upwardDeposit, UPWARD_EVENTS_ABI, provider);
    ud.on(
      "UpwardDepositMade",
      (from: string, to: string, amount: bigint, depositId: bigint, ev: ethers.Log) => {
        persist(contracts.upwardDeposit!, "UpwardDepositMade", ev, {
          from,
          to,
          amount: amount.toString(),
          depositId: depositId.toString(),
        });
        void projectUpwardDeposit({
          from,
          to,
          amountWei: amount.toString(),
          depositId: depositId.toString(),
          txHash: ev.transactionHash,
        });
      },
    );
    cleanups.push(() => ud.removeAllListeners());
    logger.info({ addr: contracts.upwardDeposit }, "indexer: listening on UpwardDepositFacility");
  }

  if (contracts.savingsVault) {
    const sv = new ethers.Contract(contracts.savingsVault, SAVINGS_EVENTS_ABI, provider);
    sv.on("Deposited", (user: string, assets: bigint, shares: bigint, ev: ethers.Log) => {
      persist(contracts.savingsVault!, "Deposited", ev, {
        user,
        assets: assets.toString(),
        shares: shares.toString(),
      });
      void projectSavingsDeposit({
        wallet: user,
        assetsWei: assets.toString(),
        sharesWei: shares.toString(),
        txHash: ev.transactionHash,
      });
    });
    sv.on("Withdrawn", (user: string, assets: bigint, shares: bigint, ev: ethers.Log) => {
      persist(contracts.savingsVault!, "Withdrawn", ev, {
        user,
        assets: assets.toString(),
        shares: shares.toString(),
      });
    });
    cleanups.push(() => sv.removeAllListeners());
    logger.info({ addr: contracts.savingsVault }, "indexer: listening on SavingsVault");
  }

  if (contracts.groupLendingPool) {
    const gp = new ethers.Contract(contracts.groupLendingPool, GROUP_EVENTS_ABI, provider);
    gp.on(
      "GroupCreated",
      (groupId: bigint, organizer: string, localBank: string, ev: ethers.Log) => {
        persist(contracts.groupLendingPool!, "GroupCreated", ev, {
          groupId: groupId.toString(),
          organizer,
          localBank,
        });
        void projectGroupCreated({
          groupId: groupId.toString(),
          organizer,
          localBank,
        });
      },
    );
    gp.on("MemberAdded", (groupId: bigint, member: string, ev: ethers.Log) => {
      persist(contracts.groupLendingPool!, "MemberAdded", ev, {
        groupId: groupId.toString(),
        member,
      });
      void projectGroupMember({ groupId: groupId.toString(), memberWallet: member });
    });
    gp.on("GroupActivated", (groupId: bigint, ev: ethers.Log) => {
      persist(contracts.groupLendingPool!, "GroupActivated", ev, {
        groupId: groupId.toString(),
      });
      void projectGroupActivated({ groupId: groupId.toString() });
    });
    cleanups.push(() => gp.removeAllListeners());
    logger.info({ addr: contracts.groupLendingPool }, "indexer: listening on GroupLendingPool");
  }

  if (contracts.interBankLendingPool) {
    const ib = new ethers.Contract(contracts.interBankLendingPool, IBLP_EVENTS_ABI, provider);
    ib.on(
      "IBLPBorrowed",
      (
        id: bigint,
        lender: string,
        borrower: string,
        principal: bigint,
        tenorDays: number,
        ev: ethers.Log,
      ) => {
        persist(contracts.interBankLendingPool!, "IBLPBorrowed", ev, {
          id: id.toString(),
          lender,
          borrower,
          principal: principal.toString(),
          tenorDays,
        });
        void projectIblpBorrowed({
          id: id.toString(),
          lender,
          borrower,
          principalWei: principal.toString(),
          tenorDays,
          txHash: ev.transactionHash,
        });
      },
    );
    ib.on("IBLPRepaid", (id: bigint, borrower: string, amount: bigint, ev: ethers.Log) => {
      persist(contracts.interBankLendingPool!, "IBLPRepaid", ev, {
        id: id.toString(),
        borrower,
        amount: amount.toString(),
      });
      void projectIblpRepaid({ id: id.toString(), txHash: ev.transactionHash });
    });
    cleanups.push(() => ib.removeAllListeners());
    logger.info({ addr: contracts.interBankLendingPool }, "indexer: listening on InterBankLendingPool");
  }

  return {
    stop: async () => {
      for (const c of cleanups) c();
      await provider.destroy?.();
    },
  };
}
