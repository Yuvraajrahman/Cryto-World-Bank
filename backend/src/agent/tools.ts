import { ethers } from "ethers";
import { config } from "../config";
import { computeBorrowingLimits, db } from "../store/db";

export type AgentToolDef = {
  name: string;
  description: string;
  write: boolean;
  parameters: Record<string, string>;
};

export const AGENT_TOOLS: AgentToolDef[] = [
  {
    name: "get_borrowing_limit",
    description: "Return the borrower's 6-month and 1-year remaining limits.",
    write: false,
    parameters: {},
  },
  {
    name: "get_loan_status",
    description: "List recent loans for the authenticated borrower.",
    write: false,
    parameters: {},
  },
  {
    name: "get_credit_passport",
    description: "Return credit tier and open-loan count (stubbed from profile).",
    write: false,
    parameters: {},
  },
  {
    name: "submit_loan_application",
    description: "Submit a loan request (requires human confirmation).",
    write: true,
    parameters: { amountEth: "number", termMonths: "number", purpose: "string" },
  },
];

export type ToolInvokeResult = {
  ok: boolean;
  data?: unknown;
  error?: string;
};

export async function invokeAgentTool(
  toolName: string,
  args: Record<string, unknown>,
  user: { id: string; role: string; wallet?: string },
): Promise<ToolInvokeResult> {
  switch (toolName) {
    case "get_borrowing_limit": {
      if (user.role !== "BORROWER") {
        return { ok: false, error: "Borrower role required" };
      }
      const limits = computeBorrowingLimits(user.id);
      return { ok: true, data: limits };
    }
    case "get_loan_status": {
      const loans = db.state.loans
        .filter((l) => l.borrowerId === user.id)
        .slice(0, 5)
        .map((l) => ({ id: l.id, amount: l.amount, status: l.status, createdAt: l.createdAt }));
      return { ok: true, data: { loans } };
    }
    case "get_credit_passport": {
      const u = db.state.users.find((x) => x.id === user.id);
      return {
        ok: true,
        data: {
          tier: "SILVER",
          consecutivePaidLoans: u?.consecutivePaidLoans ?? 0,
          openLoans: db.state.loans.filter(
            (l) => l.borrowerId === user.id && (l.status === "ACTIVE" || l.status === "APPROVED"),
          ).length,
        },
      };
    }
    case "submit_loan_application": {
      const amountEth = Number(args.amountEth);
      const termMonths = Number(args.termMonths ?? 12);
      const purpose = String(args.purpose ?? "").trim();
      if (!Number.isFinite(amountEth) || amountEth <= 0) {
        return { ok: false, error: "amountEth must be positive" };
      }
      if (purpose.length < 3) {
        return { ok: false, error: "purpose must be at least 3 characters" };
      }
      const loan = {
        id: `agent_${Date.now()}`,
        borrowerId: user.id,
        lenderBankId: "local_demo",
        amount: amountEth,
        termMonths,
        purpose,
        status: "PENDING" as const,
        category: "Agent",
        kind: "BORROWER" as const,
        aprBps: 800,
        isInstallment: false,
        createdAt: new Date().toISOString(),
        installments: [],
      };
      db.state.loans.push(loan);
      return {
        ok: true,
        data: {
          loanId: loan.id,
          message: `Loan request for ${amountEth} ETH submitted — pending approver review.`,
        },
      };
    }
    default:
      return { ok: false, error: `Unknown tool: ${toolName}` };
  }
}

const ORACLE_ABI = [
  "function commitRiskScore(uint256 id, bytes32 commitHash)",
  "function revealRiskScore(uint256 id, uint16 scoreBps, bytes32 salt)",
  "function isRiskScoreRevealed(uint256 id) view returns (bool)",
  "function revealedRiskBps(uint256 id) view returns (uint16)",
] as const;

export async function relayOracleCommitReveal(
  loanId: string | number,
  scoreBps: number,
): Promise<{ commitTx: string; revealTx: string; scoreBps: number }> {
  const pk = config.oraclePrivateKey;
  const rpc = config.chainRpcUrl;
  const controller = config.contracts.loanController;
  if (!pk || !rpc || !controller) {
    throw new Error("Oracle relay not configured (ORACLE_PRIVATE_KEY, CHAIN_RPC_URL, LOAN_CONTROLLER_ADDRESS)");
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const contract = new ethers.Contract(controller, ORACLE_ABI, wallet);

  const salt = ethers.randomBytes(32);
  const commitHash = ethers.keccak256(
    ethers.solidityPacked(["uint16", "bytes32"], [scoreBps, salt]),
  );

  const commitTx = await contract.commitRiskScore(loanId, commitHash);
  const commitRcpt = await commitTx.wait();
  const revealTx = await contract.revealRiskScore(loanId, scoreBps, salt);
  const revealRcpt = await revealTx.wait();

  return {
    commitTx: commitRcpt?.hash ?? commitTx.hash,
    revealTx: revealRcpt?.hash ?? revealTx.hash,
    scoreBps,
  };
}

export async function fetchOracleStatus(loanId: string | number): Promise<{
  revealed: boolean;
  scoreBps: number;
}> {
  const rpc = config.chainRpcUrl;
  const controller = config.contracts.loanController;
  if (!rpc || !controller) {
    return { revealed: false, scoreBps: 0 };
  }
  const provider = new ethers.JsonRpcProvider(rpc);
  const contract = new ethers.Contract(controller, ORACLE_ABI, provider);
  const revealed = await contract.isRiskScoreRevealed(loanId);
  const scoreBps = revealed ? Number(await contract.revealedRiskBps(loanId)) : 0;
  return { revealed, scoreBps };
}
