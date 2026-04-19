import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link, NavLink } from "react-router-dom";
import { Wordmark } from "@/components/ui/Logo";
import { LogOut, ShieldCheck } from "lucide-react";
import { useSession } from "@/lib/store";
import { shortAddress } from "@/lib/utils";
import toast from "react-hot-toast";
const publicLinks = [
    { to: "/#features", label: "Platform" },
    { to: "/#security", label: "Security" },
    { to: "/#hierarchy", label: "Hierarchy" },
    { to: "/#about", label: "About" },
];
export function PublicHeader() {
    return (_jsx("header", { className: "sticky top-0 z-40 border-b border-ink-700/60 bg-ink-950/70 backdrop-blur-xl", children: _jsxs("div", { className: "container-page flex h-16 items-center justify-between", children: [_jsx(Link, { to: "/", children: _jsx(Wordmark, {}) }), _jsx("nav", { className: "hidden items-center gap-7 md:flex", children: publicLinks.map((l) => (_jsx("a", { href: l.to, className: "text-sm text-ink-200 transition-colors hover:text-gold-300", children: l.label }, l.to))) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "hidden items-center gap-1.5 text-xs text-ink-200 sm:inline-flex", children: [_jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-gold-400" }), "Testnet \u00B7 Audited primitives"] }), _jsx(Link, { to: "/app/dashboard", className: "btn-primary", children: "Launch App" })] })] }) }));
}
export function AppHeader() {
    const { user, token, reset } = useSession();
    const navLinks = [
        { to: "/app/dashboard", label: "Overview" },
        { to: "/app/reserve", label: "Reserve" },
        { to: "/app/loans", label: "Loans" },
        { to: "/app/market", label: "Markets" },
    ];
    function signOut() {
        reset();
        toast("Signed out");
    }
    return (_jsx("header", { className: "sticky top-0 z-30 border-b border-ink-700/60 bg-ink-950/75 backdrop-blur-xl", children: _jsxs("div", { className: "container-page flex h-16 items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx(Link, { to: "/", children: _jsx(Wordmark, {}) }), _jsx("div", { className: "hidden h-6 w-px bg-gold-700/30 md:block" }), _jsx("nav", { className: "hidden items-center gap-1 md:flex", children: navLinks.map((l) => (_jsx(NavLink, { to: l.to, end: l.to === "/app/dashboard", className: ({ isActive }) => `rounded-lg px-3 py-1.5 text-sm transition-colors ${isActive ? "text-gold-300" : "text-ink-200 hover:text-gold-300"}`, children: l.label }, l.to))) })] }), _jsx("div", { className: "flex items-center gap-3", children: token && user ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "hidden rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-1.5 text-xs text-ink-200 sm:inline-flex", children: [_jsx("span", { className: "mr-2 text-gold-300", children: user.displayName }), _jsx("span", { className: "font-mono", children: shortAddress(user.wallet, 4) })] }), _jsxs("button", { onClick: signOut, className: "btn-ghost", title: "Sign out", children: [_jsx(LogOut, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Sign out" })] })] })) : (_jsx(ConnectButton, { accountStatus: { smallScreen: "avatar", largeScreen: "full" }, showBalance: { smallScreen: false, largeScreen: true }, chainStatus: "icon" })) })] }) }));
}
