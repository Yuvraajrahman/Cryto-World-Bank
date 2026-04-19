import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "OWNER" | "NATIONAL_BANK_ADMIN" | "LOCAL_BANK_ADMIN" | "APPROVER" | "BORROWER" | "GUEST";

interface SessionState {
  token: string | null;
  role: Role;
  setToken: (token: string | null) => void;
  setRole: (role: Role) => void;
  reset: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      role: "GUEST",
      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      reset: () => set({ token: null, role: "GUEST" }),
    }),
    { name: "cwb-session" },
  ),
);
