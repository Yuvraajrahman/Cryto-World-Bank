import { api } from "@/lib/api";

export interface CreditPassportInfo {
  wallet: string;
  creditScore: number;
  riskTier: number;
  riskTierName: string;
  maxLoanEth: string;
  openLoans: number;
}

export interface PendingLoanRow {
  id: string;
  borrower: string;
  principalEth: string;
  docHash?: string;
  documentRequestId?: string | null;
  purpose: string;
  status: string;
}

export async function fetchCreditPassport(wallet: string): Promise<CreditPassportInfo | null> {
  try {
    return await api.get<CreditPassportInfo>(`/api/phase2/credit/${wallet}`);
  } catch {
    return null;
  }
}

export async function validateLoanAmount(
  wallet: string,
  principalEth: number,
): Promise<{ valid: boolean; maxLoanEth?: string }> {
  try {
    return await api.post<{ valid: boolean; maxLoanEth?: string }>("/api/phase2/loans/validate", {
      wallet,
      principalEth,
    });
  } catch {
    return { valid: true };
  }
}

export async function fetchPendingLoansPhase2(): Promise<PendingLoanRow[]> {
  try {
    const r = await api.get<{ pending: PendingLoanRow[] }>("/api/phase2/loans/pending");
    return r.pending;
  } catch {
    return [];
  }
}

export async function fetchLoanHistory(wallet: string) {
  return api.get<{ chain: unknown[]; db: unknown[] }>(`/api/phase2/loans/history/${wallet}`);
}

export async function fetchAuthorityBrief(loanId: string) {
  return api.get<{ authorityBrief: Record<string, unknown>; chain: unknown }>(
    `/api/brief/${loanId}`,
  );
}

export function documentNidUrl(requestId: string): string {
  const base = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000";
  return `${base}/api/phase2/documents/${requestId}/nid`;
}

export function documentPhotoUrl(requestId: string): string {
  const base = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000";
  return `${base}/api/phase2/documents/${requestId}/photo`;
}
