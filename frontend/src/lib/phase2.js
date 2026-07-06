import { api } from "@/lib/api";
export async function fetchCreditPassport(wallet) {
    try {
        return await api.get(`/api/phase2/credit/${wallet}`);
    }
    catch {
        return null;
    }
}
export async function validateLoanAmount(wallet, principalEth) {
    try {
        return await api.post("/api/phase2/loans/validate", {
            wallet,
            principalEth,
        });
    }
    catch {
        return { valid: true };
    }
}
export async function fetchPendingLoansPhase2() {
    try {
        const r = await api.get("/api/phase2/loans/pending");
        return r.pending;
    }
    catch {
        return [];
    }
}
export async function fetchLoanHistory(wallet) {
    return api.get(`/api/phase2/loans/history/${wallet}`);
}
export async function fetchAuthorityBrief(loanId) {
    return api.get(`/api/brief/${loanId}`);
}
export function documentNidUrl(requestId) {
    const base = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000";
    return `${base}/api/phase2/documents/${requestId}/nid`;
}
export function documentPhotoUrl(requestId) {
    const base = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000";
    return `${base}/api/phase2/documents/${requestId}/photo`;
}
