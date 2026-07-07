import { api } from "./api";

export type OracleStatus = {
  loanId: string;
  revealed: boolean;
  scoreBps: number;
};

export async function fetchOracleStatus(loanId: string): Promise<OracleStatus> {
  return api.get<OracleStatus>(`/api/oracle/status/${loanId}`);
}

export async function commitRevealOracle(body: {
  loanId: string | number;
  wallet?: string;
  principalEth?: number;
  termMonths?: number;
}) {
  return api.post<{
    loanId: string;
    riskScore: number;
    decision: string;
    scoreBps: number;
    oracleState: string;
    commitTx: string;
    revealTx: string;
  }>("/api/oracle/commit-reveal", body);
}

export async function sendAgentMessage(message: string, sessionId?: string) {
  return api.post<{
    type: string;
    sessionId?: string;
    confirmationId?: string;
    tool?: string;
    args?: Record<string, unknown>;
    message?: string;
    result?: unknown;
  }>("/api/agent/message", { message, sessionId });
}

export async function confirmAgentAction(confirmationId: string) {
  return api.post<{ type: string; tool: string; result: unknown }>("/api/agent/confirm", {
    confirmationId,
  });
}
