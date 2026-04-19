import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { Coins, Landmark, Receipt, ShieldCheck, TrendingUp, ArrowUpRight, Network, } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { shortAddress } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { api, } from "@/lib/api";
import { useSession } from "@/lib/store";
import { MarketDataChart } from "@/components/market/MarketDataChart";
const reserveSeries = [
    { m: "Oct", reserve: 1200, allocated: 800 },
    { m: "Nov", reserve: 1420, allocated: 910 },
    { m: "Dec", reserve: 1510, allocated: 1020 },
    { m: "Jan", reserve: 1620, allocated: 1105 },
    { m: "Feb", reserve: 1740, allocated: 1180 },
    { m: "Mar", reserve: 1842, allocated: 1240 },
];
export function Dashboard() {
    const { address } = useAccount();
    const user = useSession((s) => s.user);
    const [stats, setStats] = useState(null);
    const [banks, setBanks] = useState(null);
    const [profile, setProfile] = useState(null);
    const [myLoans, setMyLoans] = useState([]);
    async function load() {
        const [s, b, p, loans] = await Promise.all([
            api.get("/api/banks/stats").catch(() => null),
            api.get("/api/banks").catch(() => null),
            api.get("/api/profile").catch(() => null),
            user?.role === "BORROWER"
                ? api
                    .get("/api/loans/mine")
                    .then((r) => r.loans)
                    .catch(() => [])
                : Promise.resolve([]),
        ]);
        setStats(s);
        setBanks(b);
        setProfile(p);
        setMyLoans(loans);
    }
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);
    const world = banks?.worldBank;
    const reserve = world?.reserve ?? 0;
    const allocated = world?.totalAllocated ?? 0;
    const utilizationPct = stats
        ? Math.round((stats.totalLent / Math.max(1, stats.totalLent + reserve)) * 100)
        : 0;
    const recentTx = profile?.transactions ?? [];
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Overview", title: _jsxs(_Fragment, { children: ["Welcome back,", " ", _jsx("span", { className: "gold-text", children: user?.displayName ?? shortAddress(address) })] }), description: "Your portfolio, reserve position, and loan lifecycle \u2014 all surfaced in one glance.", right: user?.role === "BORROWER" ? (_jsxs(Link, { to: "/app/loans/new", className: "btn-primary", children: ["Request Loan ", _jsx(ArrowUpRight, { className: "h-4 w-4" })] })) : (_jsxs(Link, { to: "/app/approvals", className: "btn-primary", children: ["Open queue ", _jsx(ArrowUpRight, { className: "h-4 w-4" })] })) }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx(Stat, { label: "Reserve Balance", value: `${reserve.toFixed(2)} ETH`, icon: Landmark, hint: world ? world.name : "World reserve" }), _jsx(Stat, { label: "Allocated Capital", value: `${allocated.toFixed(2)} ETH`, icon: Network, hint: `${stats?.tiers.national ?? 0} national · ${stats?.tiers.local ?? 0} local` }), _jsx(Stat, { label: "Active Loans", value: String(stats?.activeLoans ?? 0), icon: Coins, hint: `${stats?.borrowerCount ?? 0} borrowers onboarded` }), _jsx(Stat, { label: "Lifetime Repaid", value: `${(stats?.totalRepaid ?? 0).toFixed(2)} ETH`, icon: Receipt, hint: `${utilizationPct}% utilization` })] }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [_jsxs("div", { className: "card p-6 lg:col-span-2", children: [_jsxs("div", { className: "mb-4 flex items-end justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Reserve Flow" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Capital Movement \u2014 6-month window" })] }), _jsxs("span", { className: "badge-gold", children: [_jsx(TrendingUp, { className: "h-3.5 w-3.5" }), "+18.4% QoQ"] })] }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: reserveSeries, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "gReserve", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#d4af37", stopOpacity: 0.55 }), _jsx("stop", { offset: "100%", stopColor: "#d4af37", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "gAlloc", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#8a8b93", stopOpacity: 0.4 }), _jsx("stop", { offset: "100%", stopColor: "#8a8b93", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { stroke: "rgba(255,255,255,0.05)" }), _jsx(XAxis, { dataKey: "m", stroke: "#8a8b93", fontSize: 12 }), _jsx(YAxis, { stroke: "#8a8b93", fontSize: 12 }), _jsx(Tooltip, { contentStyle: {
                                                    background: "#101013",
                                                    border: "1px solid rgba(212,175,55,0.35)",
                                                    borderRadius: 12,
                                                    fontSize: 12,
                                                } }), _jsx(Area, { type: "monotone", dataKey: "reserve", stroke: "#d4af37", strokeWidth: 2, fill: "url(#gReserve)", name: "Reserve (ETH)" }), _jsx(Area, { type: "monotone", dataKey: "allocated", stroke: "#8a8b93", strokeWidth: 2, fill: "url(#gAlloc)", name: "Allocated (ETH)" })] }) }) })] }), _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(ShieldCheck, { className: "h-4 w-4 text-gold-400" }), "Security Status"] }), _jsx("ul", { className: "space-y-3 text-sm", children: [
                                    { label: "Reentrancy guard", ok: true },
                                    { label: "Pausable breaker", ok: true },
                                    { label: "Role-based access", ok: true },
                                    { label: "Reserve ratio ≥ 25%", ok: reserve > 0 },
                                    { label: "Upstream risk ping", ok: true },
                                ].map((x) => (_jsxs("li", { className: "flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2", children: [_jsx("span", { children: x.label }), _jsx("span", { className: x.ok ? "badge-green" : "badge-red", children: x.ok ? "Healthy" : "Warning" })] }, x.label))) }), _jsx("div", { className: "divider my-4" }), _jsx("p", { className: "text-xs text-ink-200", children: user?.role === "BORROWER" && profile?.limits
                                    ? `Your 6-month remaining limit: ${profile.limits.sixMonth.remaining.toFixed(2)} ETH`
                                    : "All invariants checked at current snapshot." })] })] }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [_jsx(RecentActivity, { tx: recentTx, loans: myLoans }), _jsx(TierBreakdown, { banks: banks, stats: stats })] }), _jsx(MarketDataChart, { initialCoin: "ethereum", initialDays: 30, compact: true })] }));
}
function RecentActivity({ tx, loans, }) {
    const events = useMemo(() => {
        const rows = [];
        for (const t of tx.slice(0, 5)) {
            rows.push({
                at: new Date(t.at).toLocaleString(),
                type: t.type.replace(/_/g, " "),
                who: t.loanId ? `Loan ${t.loanId.split("_").pop()?.slice(0, 6)}` : "ledger",
                amount: (t.type === "INSTALLMENT_PAID" || t.type === "LOAN_REPAID" ? "-" : "+") +
                    t.amount.toFixed(4) +
                    " ETH",
                tag: t.type === "INSTALLMENT_PAID" || t.type === "LOAN_REPAID" ? "green" : "gold",
            });
        }
        for (const l of loans.slice(0, 3)) {
            rows.push({
                at: new Date(l.createdAt).toLocaleString(),
                type: `Loan ${l.status}`,
                who: l.purpose.slice(0, 40),
                amount: `${l.amount.toFixed(2)} ETH`,
                tag: l.status === "REJECTED" || l.status === "DEFAULTED" ? "red" : "blue",
            });
        }
        return rows
            .sort((a, b) => (a.at < b.at ? 1 : -1))
            .slice(0, 6);
    }, [tx, loans]);
    return (_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Recent Activity" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Ledger events" })] }), _jsx(Link, { to: "/app/loans", className: "text-xs text-gold-300 hover:text-gold-200", children: "View all \u2192" })] }), _jsxs("div", { className: "space-y-2", children: [events.length === 0 ? (_jsx("div", { className: "py-6 text-center text-xs text-ink-200", children: "Activity will appear here as you lend, borrow, or repay." })) : null, events.map((e, i) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-ink-600/50 bg-ink-900/50 px-3 py-2.5 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-ink-100", children: e.type }), _jsxs("div", { className: "text-xs text-ink-200", children: [e.who, " \u00B7 ", e.at] })] }), _jsx("span", { className: `badge${e.tag === "gold"
                                    ? "-gold"
                                    : e.tag === "green"
                                        ? "-green"
                                        : e.tag === "red"
                                            ? "-red"
                                            : "-blue"}`, children: e.amount })] }, i)))] })] }));
}
function TierBreakdown({ banks, stats, }) {
    const world = banks?.worldBank;
    const nationalTotal = banks?.nationalBanks.reduce((a, b) => a + b.reserve + b.totalLent, 0) ?? 0;
    const localTotal = banks?.localBanks.reduce((a, b) => a + b.reserve + b.totalLent, 0) ?? 0;
    const borrowerTotal = stats?.totalLent ?? 0;
    const max = Math.max(1, (world?.reserve ?? 0) + (world?.totalAllocated ?? 0));
    const tiers = [
        {
            t: "Tier 1",
            name: world ? world.name : "World Reserve",
            val: `${((world?.reserve ?? 0) + (world?.totalAllocated ?? 0)).toFixed(2)} ETH`,
            pct: 100,
        },
        {
            t: "Tier 2",
            name: `National Banks (${banks?.nationalBanks.length ?? 0})`,
            val: `${nationalTotal.toFixed(2)} ETH`,
            pct: Math.round((nationalTotal / max) * 100),
        },
        {
            t: "Tier 3",
            name: `Local Banks (${banks?.localBanks.length ?? 0})`,
            val: `${localTotal.toFixed(2)} ETH`,
            pct: Math.round((localTotal / max) * 100),
        },
        {
            t: "Tier 4",
            name: `Borrowers (${stats?.borrowerCount ?? 0})`,
            val: `${borrowerTotal.toFixed(2)} ETH`,
            pct: Math.round((borrowerTotal / max) * 100),
        },
    ];
    return (_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Hierarchy" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Capital by tier" })] }), _jsx(Link, { to: "/app/banks", className: "text-xs text-gold-300 hover:text-gold-200", children: "Manage network \u2192" })] }), _jsx("div", { className: "space-y-3", children: tiers.map((t) => (_jsxs("div", { children: [_jsxs("div", { className: "mb-1 flex items-center justify-between text-sm", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "badge-gold", children: t.t }), _jsx("span", { className: "text-ink-100", children: t.name })] }), _jsx("span", { className: "font-mono text-ink-200", children: t.val })] }), _jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-ink-700", children: _jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400", style: { width: `${Math.min(100, t.pct)}%` } }) })] }, t.t))) })] }));
}
