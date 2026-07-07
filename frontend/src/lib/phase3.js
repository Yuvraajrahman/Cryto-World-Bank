import { api } from "./api";
export async function fetchOracleStatus(loanId) {
    return api.get(`/api/oracle/status/${loanId}`);
}
export async function commitRevealOracle(body) {
    return api.post("/api/oracle/commit-reveal", body);
}
export async function sendAgentMessage(message, sessionId) {
    return api.post("/api/agent/message", { message, sessionId });
}
export async function confirmAgentAction(confirmationId) {
    return api.post("/api/agent/confirm", {
        confirmationId,
    });
}
