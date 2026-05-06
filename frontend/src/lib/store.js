import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useSession = create()(persist((set) => ({
    token: null,
    role: "GUEST",
    user: null,
    setSession: ({ token, user }) => set({ token, user, role: user.role ?? "GUEST" }),
    setUser: (user) => set({ user, role: user.role ?? "GUEST" }),
    setRole: (role) => set({ role }),
    reset: () => set({ token: null, role: "GUEST", user: null }),
}), { name: "cwb-session" }));
