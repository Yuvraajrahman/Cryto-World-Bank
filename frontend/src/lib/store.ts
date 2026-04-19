import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role =
  | "OWNER"
  | "NATIONAL_BANK_ADMIN"
  | "LOCAL_BANK_ADMIN"
  | "APPROVER"
  | "BORROWER"
  | "GUEST";

export interface SessionUser {
  id: string;
  wallet: string;
  displayName: string;
  email?: string;
  country?: string;
  role: Role;
  bankId?: string;
  consecutivePaidLoans?: number;
  totalBorrowedLifetime?: number;
  isFirstTime?: boolean;
  monthlyIncomeUsd?: number;
}

interface SessionState {
  token: string | null;
  role: Role;
  user: SessionUser | null;
  setSession: (session: { token: string; user: SessionUser }) => void;
  setUser: (user: SessionUser) => void;
  setRole: (role: Role) => void;
  reset: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      role: "GUEST",
      user: null,
      setSession: ({ token, user }) =>
        set({ token, user, role: user.role ?? "GUEST" }),
      setUser: (user) => set({ user, role: user.role ?? "GUEST" }),
      setRole: (role) => set({ role }),
      reset: () => set({ token: null, role: "GUEST", user: null }),
    }),
    { name: "cwb-session" },
  ),
);
