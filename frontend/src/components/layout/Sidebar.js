import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Landmark, Coins, FilePlus2, Receipt, MessageSquare, UserRound, ShieldAlert, Settings2, Network, LineChart, Inbox, Bot, } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/store";
const ALL = [
    "OWNER",
    "NATIONAL_BANK_ADMIN",
    "LOCAL_BANK_ADMIN",
    "APPROVER",
    "BORROWER",
    "GUEST",
];
const nav = [
    { to: "/app/dashboard", label: "Overview", icon: LayoutDashboard, roles: ALL },
    { to: "/app/reserve", label: "World Reserve", icon: Landmark, roles: ALL },
    { to: "/app/banks", label: "Bank Network", icon: Network, roles: ALL },
    {
        to: "/app/loans",
        label: "My Loans",
        icon: Coins,
        roles: ["BORROWER", "OWNER", "NATIONAL_BANK_ADMIN", "LOCAL_BANK_ADMIN", "APPROVER"],
    },
    { to: "/app/loans/new", label: "Request Loan", icon: FilePlus2, roles: ["BORROWER"] },
    {
        to: "/app/approvals",
        label: "Approvals Queue",
        icon: Inbox,
        roles: ["APPROVER", "LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"],
    },
    {
        to: "/app/installments",
        label: "Installments",
        icon: Receipt,
        roles: ["BORROWER"],
    },
    { to: "/app/market", label: "Markets", icon: LineChart, roles: ALL },
    { to: "/app/chat", label: "Messages", icon: MessageSquare, roles: ALL },
    { to: "/app/assistant", label: "AI Assistant", icon: Bot, roles: ALL },
    {
        to: "/app/risk",
        label: "Risk Console",
        icon: ShieldAlert,
        roles: ["APPROVER", "LOCAL_BANK_ADMIN", "NATIONAL_BANK_ADMIN", "OWNER"],
    },
    { to: "/app/profile", label: "Profile", icon: UserRound, roles: ALL },
    {
        to: "/app/admin",
        label: "Admin",
        icon: Settings2,
        roles: ["OWNER", "NATIONAL_BANK_ADMIN"],
    },
];
export function Sidebar() {
    const role = useSession((s) => s.role);
    const user = useSession((s) => s.user);
    const visible = nav.filter((n) => n.roles.includes(role));
    return (_jsx("aside", { className: "hidden w-64 shrink-0 border-r border-ink-700/60 bg-ink-900/60 backdrop-blur-sm lg:flex lg:flex-col", children: _jsxs("div", { className: "flex flex-1 flex-col gap-1 overflow-y-auto p-4", children: [user ? (_jsxs("div", { className: "mb-3 rounded-xl border border-ink-600/60 bg-ink-950/70 p-3", children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-ink-200", children: "Signed in as" }), _jsx("div", { className: "mt-0.5 truncate text-sm font-medium text-ink-100", children: user.displayName }), _jsx("div", { className: "mt-0.5 text-[10px] uppercase tracking-[0.2em] text-gold-300", children: role.replace(/_/g, " ") })] })) : null, _jsx("div", { className: "px-3 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-ink-200", children: "Navigation" }), visible.map(({ to, label, icon: Icon }) => (_jsxs(NavLink, { to: to, end: to === "/app/dashboard", className: ({ isActive }) => cn("group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition-all", isActive
                        ? "border-gold-700/40 bg-gold-900/15 text-gold-200 shadow-gold-soft"
                        : "text-ink-100 hover:border-ink-500/60 hover:bg-ink-800/60 hover:text-gold-300"), children: [_jsx(Icon, { className: "h-4 w-4 opacity-90 group-hover:opacity-100" }), _jsx("span", { children: label })] }, to))), _jsxs("div", { className: "mt-6 rounded-xl border border-gold-700/30 bg-gradient-to-b from-gold-900/10 to-transparent p-4", children: [_jsx("div", { className: "mb-1 text-[10px] uppercase tracking-[0.24em] text-gold-400", children: "Security Notice" }), _jsx("p", { className: "text-xs leading-relaxed text-ink-200", children: "Testnet deployment. All transactions use test tokens with no real monetary value." })] })] }) }));
}
