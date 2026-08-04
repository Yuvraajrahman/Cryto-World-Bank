import { api } from "./api";
export async function fetchOracleStatus(loanId) {
  return api.get(`/api/oracle/status/${loanId}`);
}
export async function commitRevealOracle(body) {
  return api.post("/api/oracle/commit-reveal", body);
}
export async function sendAgentMessage(message, sessionId, opts) {
  return api.post("/api/agent/message", {
    message,
    sessionId,
    mode: opts?.mode ?? "mcp",
    history: opts?.history,
  });
}
export async function fetchAgentStatus() {
  return api.get("/api/agent/status");
}
export async function confirmAgentAction(confirmationId) {
  return api.post("/api/agent/confirm", {
    confirmationId,
  });
}
