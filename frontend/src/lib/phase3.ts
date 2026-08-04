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

export async function sendAgentMessage(
  message: string,
  sessionId?: string,
  opts?: {
    mode?: "mcp" | "keywords" | "auto";
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  },
) {
  return api.post<{
    type: string;
    mode?: string;
    sessionId?: string;
    confirmationId?: string;
    tool?: string;
    args?: Record<string, unknown>;
    message?: string;
    result?: unknown;
    model?: string;
    toolTrace?: string[];
  }>("/api/agent/message", {
    message,
    sessionId,
    mode: opts?.mode ?? "mcp",
    history: opts?.history,
  });
}

export async function fetchAgentStatus() {
  return api.get<{
    mode: string;
    llm: { ok: boolean; model: string; baseUrl: string; detail?: string };
    tools: Array<{ name: string; write: boolean }>;
    confirmationGate: boolean;
  }>("/api/agent/status");
}

export async function confirmAgentAction(confirmationId: string) {
  return api.post<{ type: string; tool: string; result: unknown }>("/api/agent/confirm", {
    confirmationId,
  });
}
