import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAccount } from "wagmi";
import { WalletGate } from "@/components/layout/WalletGate";
import { useSession } from "@/lib/store";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { OnChainWalletBanner } from "@/components/layout/OnChainWalletBanner";
export function AppLayout() {
    const { isConnected, address } = useAccount();
    const { token, user, setUser, reset } = useSession();
    // Keep session.user in sync with the backend. This also validates that the
    // JWT we persisted is still accepted after a hot-reload.
    useEffect(() => {
        if (!token)
            return;
        let cancelled = false;
        api
            .get("/api/auth/me")
            .then((r) => {
            if (!cancelled)
                setUser(r.user);
        })
            .catch(() => {
            if (!cancelled)
                reset();
        });
        return () => {
            cancelled = true;
        };
    }, [token, setUser, reset]);
    const authed = Boolean(token) || (isConnected && Boolean(address));
    return (_jsxs("div", { className: "flex min-h-screen flex-col", children: [_jsx(AppHeader, {}), _jsxs("div", { className: "flex flex-1", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 bg-grid-gold/10", children: _jsxs("div", { className: "container-page py-8 sm:py-10", children: [!authed ? (_jsxs("div", { className: "mb-6 rounded-xl border border-gold-700/30 bg-gold-900/10 p-4", children: [_jsx("div", { className: "text-xs font-medium uppercase tracking-[0.22em] text-gold-300", children: "Limited access" }), _jsx("div", { className: "mt-1 text-sm text-ink-100", children: "Connect a wallet or use Demo sign-in to unlock all features." }), _jsx("div", { className: "mt-3", children: _jsx(WalletGate, {}) })] })) : null, authed ? _jsx(OnChainWalletBanner, {}) : null, _jsx(Outlet, {})] }) })] }), authed ? _jsx(ChatbotWidget, {}) : null] }));
}
