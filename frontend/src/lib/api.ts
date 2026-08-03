import { resolveApiBaseUrl, clearApiBaseCache } from "@/lib/apiBase";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getToken(): string | null {
  // Pulled lazily so that zustand persist rehydration doesn't race the first
  // request.
  try {
    const raw = localStorage.getItem("cwb-session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }
  if (token) headers.set("authorization", `Bearer ${token}`);
  // Free ngrok interstitial returns HTML without CORS; skip when hitting tunnel directly.
  if (!headers.has("ngrok-skip-browser-warning")) {
    headers.set("ngrok-skip-browser-warning", "1");
  }

  const base = await resolveApiBaseUrl(retried);
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { ...init, headers });
  } catch (err) {
    if (!retried && !import.meta.env.DEV) {
      clearApiBaseCache();
      return request<T>(path, init, true);
    }
    throw err;
  }
  if (!res.ok) {
    let code: string | undefined;
    let message = res.statusText;
    let details: unknown;
    try {
      const body = await res.json();
      code = body?.error;
      message = body?.message ?? body?.error ?? message;
      details = body?.details ?? body;
    } catch {
      /* ignore */
    }
    if (res.status === 401 && typeof window !== "undefined" && token) {
      try {
        const raw = localStorage.getItem("cwb-session");
        if (raw) {
          const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
          if (parsed?.state) {
            parsed.state.token = null;
            parsed.state.user = null;
            parsed.state.role = "GUEST";
            localStorage.setItem("cwb-session", JSON.stringify(parsed));
          }
        }
      } catch {
        /* ignore */
      }
      const pathNow = window.location.pathname + window.location.search;
      if (!pathNow.startsWith("/login")) {
        window.location.assign(
          `/login?returnTo=${encodeURIComponent(pathNow)}&reason=expired`,
        );
      }
    }
    throw new ApiError(message, res.status, code, details);
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T,>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T,>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T,>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Domain types mirroring backend/src/store/db.ts. Kept deliberately minimal —
// the backend is the source of truth, the frontend only imports what it needs.

export type UserRole =
  | "OWNER"
  | "NATIONAL_BANK_ADMIN"
  | "LOCAL_BANK_ADMIN"
  | "APPROVER"
  | "BORROWER"
  | "REGULATOR"
  | "DEV_ADMIN";

export type BankTier = "WORLD" | "NATIONAL" | "LOCAL";

export type LoanStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "REPAID"
  | "REJECTED"
  | "DEFAULTED";

export type LoanKind = "BORROWER" | "LOCAL_FROM_NATIONAL" | "NATIONAL_FROM_WORLD";

export interface UserDTO {
  id: string;
  wallet: string;
  displayName: string;
  email?: string;
  phone?: string;
  country?: string;
  dateOfBirth?: string;
  accountType?: "individual" | "group";
  role: UserRole;
  bankId?: string;
  consecutivePaidLoans?: number;
  totalBorrowedLifetime?: number;
  isFirstTime?: boolean;
  monthlyIncomeUsd?: number;
  onboardingComplete?: boolean;
}

export interface BankDTO {
  id: string;
  tier: BankTier;
  name: string;
  walletAddress: string;
  jurisdiction?: string;
  city?: string;
  parentBankId?: string;
  reserve: number;
  totalAllocated: number;
  totalLent: number;
  totalRepaid: number;
  aprBps: number;
  createdAt: string;
}

export interface Installment {
  index: number;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidAt?: string;
  txHash?: string;
}

export interface LoanDTO {
  id: string;
  kind: LoanKind;
  borrowerId?: string;
  bankRequesterId?: string;
  lenderBankId: string;
  amount: number;
  purpose: string;
  aprBps: number;
  termMonths: number;
  status: LoanStatus;
  isInstallment: boolean;
  installments: Installment[];
  riskScore?: number;
  gasCostEth?: number;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  txHash?: string;
  deadline?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  repaidAt?: string;
  category?: string;
}

export interface BorrowingLimits {
  sixMonth: { limit: number; borrowed: number; remaining: number };
  oneYear: { limit: number; borrowed: number; remaining: number };
  activeLoanCount: number;
  maxActiveLoans: number;
  exceptionApplied: boolean;
  baseCap: number;
}

export interface TransactionDTO {
  id: string;
  type: "LOAN_APPROVED" | "INSTALLMENT_PAID" | "LOAN_REPAID" | "ALLOCATION" | "DEPOSIT";
  userId?: string;
  bankId?: string;
  loanId?: string;
  amount: number;
  at: string;
  txHash?: string;
  note?: string;
}

export interface ProfileResponse {
  user: UserDTO;
  bank: BankDTO | null;
  parentBank: BankDTO | null;
  limits: BorrowingLimits | null;
  transactions: TransactionDTO[];
  incomeVerification: {
    status: "UNSUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
    fileName?: string;
    monthlyIncomeUsd?: number | null;
    reviewedAt?: string | null;
    notes?: string | null;
    createdAt?: string;
  };
}

export interface ChatParticipant {
  id: string;
  displayName: string;
  wallet: string;
  role: UserRole;
  bankId?: string;
}

export interface ChatThreadDTO {
  id: string;
  subject: string;
  participants: ChatParticipant[];
  createdAt: string;
  lastMessageAt: string;
  lastMessage: { body: string; senderId: string; at: string } | null;
}

export interface ChatMessageDTO {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
  attachmentName?: string;
  attachmentMime?: string;
  attachmentSize?: number;
  readBy?: string[];
}
