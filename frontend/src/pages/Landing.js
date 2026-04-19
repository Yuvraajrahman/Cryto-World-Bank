import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, Coins, Gauge, Layers, Fingerprint, Network, ScrollText, Sparkles, ArrowRight, BadgeCheck, Landmark, Banknote, Building2, Users, } from "lucide-react";
import { PublicHeader } from "@/components/layout/Header";
import { Logo } from "@/components/ui/Logo";
export function Landing() {
    return (_jsxs("div", { className: "flex min-h-screen flex-col", children: [_jsx(PublicHeader, {}), _jsx(Hero, {}), _jsx(TrustStrip, {}), _jsx(Features, {}), _jsx(Hierarchy, {}), _jsx(Security, {}), _jsx(Numbers, {}), _jsx(CTA, {}), _jsx(Footer, {})] }));
}
function Hero() {
    return (_jsxs("section", { className: "relative overflow-hidden border-b border-ink-700/40", children: [_jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 bg-grid-gold/40 mask-fade-b" }), _jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-x-0 top-0 h-80 bg-radial-gold" }), _jsxs("div", { className: "container-page relative grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-12 lg:py-28", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "lg:col-span-7", children: [_jsxs("div", { className: "mb-5 inline-flex items-center gap-2 rounded-full border border-gold-700/40 bg-gold-900/20 px-3 py-1 text-xs text-gold-200", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5" }), "A four-tier decentralized reserve \u2014 institutional-grade, retail-accessible"] }), _jsxs("h1", { className: "font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink-100 sm:text-6xl lg:text-7xl", children: ["The ", _jsx("span", { className: "gold-text", children: "programmable" }), _jsx("br", {}), "world bank,", _jsx("br", {}), "rebuilt on-chain."] }), _jsx("p", { className: "mt-6 max-w-xl text-base text-ink-200 sm:text-lg", children: "Crypto World Bank models a World\u00A0Bank \u2192 National\u00A0Bank \u2192 Local\u00A0Bank \u2192 Borrower lending hierarchy on EVM smart contracts. Transparent reserves, role-based governance, and explainable risk analytics \u2014 baked into the protocol." }), _jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row", children: [_jsxs(Link, { to: "/app/dashboard", className: "btn-primary text-base", children: ["Launch Platform ", _jsx(ArrowRight, { className: "h-4 w-4" })] }), _jsx("a", { href: "#features", className: "btn-ghost text-base", children: "Explore the architecture" })] }), _jsx("div", { className: "mt-10 grid grid-cols-3 gap-4 text-sm sm:max-w-md", children: [
                                    { k: "4-tier", v: "Hierarchical lending" },
                                    { k: "<$0.01", v: "Cost on Layer-2" },
                                    { k: "24/7", v: "On-chain audit trail" },
                                ].map((x) => (_jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/60 p-3", children: [_jsx("div", { className: "gold-text font-display text-xl font-semibold", children: x.k }), _jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-ink-200", children: x.v })] }, x.k))) })] }), _jsx(motion.div, { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.7, delay: 0.1 }, className: "lg:col-span-5", children: _jsx(ReserveVisual, {}) })] })] }));
}
function ReserveVisual() {
    return (_jsxs("div", { className: "relative mx-auto w-full max-w-lg", children: [_jsx("div", { className: "absolute -inset-6 rounded-[2rem] bg-radial-gold opacity-80 blur-2xl", "aria-hidden": true }), _jsxs("div", { className: "relative card-gold overflow-hidden p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Logo, { size: 36 }), _jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Global Reserve" }), _jsx("div", { className: "font-display text-lg font-semibold text-ink-100", children: "CWB \u00B7 Tier\u00A01" })] })] }), _jsxs("span", { className: "badge-gold", children: [_jsx(BadgeCheck, { className: "h-3.5 w-3.5" }), "Verified"] })] }), _jsxs("div", { className: "mt-6 rounded-xl border border-ink-600/70 bg-ink-900/80 p-5", children: [_jsxs("div", { className: "flex items-baseline justify-between", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Reserve balance" }), _jsx("div", { className: "text-[11px] text-ink-200", children: "testnet \u00B7 sepolia" })] }), _jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [_jsx("span", { className: "font-display text-4xl font-semibold text-ink-100", children: "1,842.50" }), _jsx("span", { className: "gold-text text-lg font-semibold", children: "ETH" })] }), _jsx("div", { className: "mt-1 text-xs text-ink-200", children: "\u2248 $3.68M at $2,000 / ETH" })] }), _jsx("div", { className: "mt-4 grid grid-cols-3 gap-3", children: [
                            { label: "Allocated", value: "1,240.00" },
                            { label: "Outstanding", value: "940.15" },
                            { label: "Repaid", value: "298.35" },
                        ].map((x) => (_jsxs("div", { className: "rounded-lg border border-ink-600/60 bg-ink-900/60 p-3", children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-ink-200", children: x.label }), _jsx("div", { className: "mt-1 text-base font-semibold text-ink-100", children: x.value })] }, x.label))) }), _jsx("div", { className: "mt-5 space-y-2", children: [
                            { bank: "Bangladesh National Bank", apr: "3.00%", alloc: "420 ETH" },
                            { bank: "Nigeria National Bank", apr: "3.00%", alloc: "380 ETH" },
                            { bank: "Indonesia National Bank", apr: "3.00%", alloc: "310 ETH" },
                        ].map((x) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-ink-600/50 bg-ink-900/50 px-3 py-2 text-xs", children: [_jsxs("span", { className: "flex items-center gap-2 text-ink-100", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-gold-400" }), " ", x.bank] }), _jsxs("span", { className: "flex gap-3 font-mono text-ink-200", children: [_jsx("span", { children: x.alloc }), _jsx("span", { className: "text-gold-300", children: x.apr })] })] }, x.bank))) }), _jsxs("div", { className: "mt-5 flex items-center justify-between rounded-lg border border-gold-700/30 bg-gold-900/10 px-3 py-2 text-[11px] text-gold-200", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Lock, { className: "h-3.5 w-3.5" }), "Reserve invariants enforced by smart contract"] }), _jsx("span", { className: "font-mono", children: "0xA4E\u20268F21" })] })] })] }));
}
function TrustStrip() {
    const items = [
        "OpenZeppelin Access Control",
        "ReentrancyGuard",
        "Pausable Emergency Brake",
        "SIWE Wallet Auth",
        "Role-Based Governance",
        "EIP-1193 Compatible",
    ];
    return (_jsx("section", { className: "border-b border-ink-700/40 bg-ink-900/40", children: _jsxs("div", { className: "container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-6 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx("span", { className: "text-gold-400", children: "Security primitives" }), items.map((i) => (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-1 w-1 rounded-full bg-gold-500" }), i] }, i)))] }) }));
}
function Features() {
    const features = [
        {
            icon: Layers,
            title: "Four-tier capital hierarchy",
            body: "Capital flows World → National → Local → Borrower with configurable APRs at every tier (3% / 5% / 8%), producing a natural term structure.",
        },
        {
            icon: Eye,
            title: "Transparent reserves, always",
            body: "Every deposit, allocation, and repayment is a public on-chain event. No quarterly self-reports — the ledger is the source of truth.",
        },
        {
            icon: Gauge,
            title: "Programmable lending lifecycle",
            body: "Loan request, approval, disbursement, and installment repayment are orchestrated by smart contracts, with installment schedules auto-generated above a configurable threshold.",
        },
        {
            icon: ShieldCheck,
            title: "Defense-in-depth security",
            body: "AccessControl roles, ReentrancyGuard, Pausable breaker, and planned static analysis (Slither) + symbolic execution (Mythril) checks.",
        },
        {
            icon: Network,
            title: "Cross-tier & same-tier flows",
            body: "Architecture ready for interbank lending pools and upward surplus repatriation — the full multi-directional banking model.",
        },
        {
            icon: ScrollText,
            title: "Explainable risk (planned)",
            body: "Off-chain Random Forest + Isolation Forest with SHAP attributions. Approvers see every feature that moved a decision.",
        },
    ];
    return (_jsx("section", { id: "features", className: "border-b border-ink-700/40", children: _jsxs("div", { className: "container-page py-20", children: [_jsxs("div", { className: "mb-12 max-w-3xl", children: [_jsxs("div", { className: "mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400", children: [_jsx("span", { className: "h-px w-8 bg-gold-500/50" }), "The Platform"] }), _jsxs("h2", { className: "font-display text-4xl font-semibold text-ink-100 sm:text-5xl", children: ["Built for ", _jsx("span", { className: "gold-text", children: "institutional depth" }), ", accessible like retail finance."] }), _jsx("p", { className: "mt-4 text-ink-200", children: "Every primitive on the platform is designed to feel premium while making the rules of the system plainly visible to anyone who looks." })] }), _jsx("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3", children: features.map(({ icon: Icon, title, body }) => (_jsxs("div", { className: "card card-hover p-6", children: [_jsx("div", { className: "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold-700/40 bg-gold-900/20 text-gold-300", children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsx("h3", { className: "mb-1.5 font-display text-xl font-semibold text-ink-100", children: title }), _jsx("p", { className: "text-sm text-ink-200", children: body })] }, title))) })] }) }));
}
function Hierarchy() {
    const tiers = [
        {
            icon: Landmark,
            tier: "Tier 1",
            name: "World Bank Reserve",
            apr: "3.00% APR",
            body: "Custodian of the global reserve. Allocates capital to registered National Banks.",
        },
        {
            icon: Building2,
            tier: "Tier 2",
            name: "National Bank",
            apr: "5.00% APR",
            body: "Borrows from the reserve, lends to Local Banks in its jurisdiction.",
        },
        {
            icon: Banknote,
            tier: "Tier 3",
            name: "Local Bank",
            apr: "8.00% APR",
            body: "Runs the retail loan lifecycle — request, approval, disbursement, installments.",
        },
        {
            icon: Users,
            tier: "Tier 4",
            name: "Borrower",
            apr: "0.1 – 500 ETH",
            body: "Requests loans from Local Banks. Builds on-chain repayment history.",
        },
    ];
    return (_jsx("section", { id: "hierarchy", className: "border-b border-ink-700/40 bg-gradient-to-b from-transparent to-ink-900/40", children: _jsxs("div", { className: "container-page py-20", children: [_jsxs("div", { className: "mb-12 max-w-3xl", children: [_jsxs("div", { className: "mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400", children: [_jsx("span", { className: "h-px w-8 bg-gold-500/50" }), "The Hierarchy"] }), _jsxs("h2", { className: "font-display text-4xl font-semibold text-ink-100 sm:text-5xl", children: ["Capital flows, ", _jsx("span", { className: "gold-text", children: "with boundaries" }), "."] }), _jsx("p", { className: "mt-4 text-ink-200", children: "Every tier has a role, a rate, and a public balance sheet. The system can cascade repayments upward with interest \u2014 the same way real development finance works." })] }), _jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4", children: tiers.map(({ icon: Icon, tier, name, apr, body }, i) => (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "card card-hover h-full p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "badge-gold", children: tier }), _jsx("span", { className: "font-mono text-xs text-ink-200", children: apr })] }), _jsx(Icon, { className: "mt-5 h-8 w-8 text-gold-300" }), _jsx("div", { className: "mt-3 font-display text-xl font-semibold text-ink-100", children: name }), _jsx("p", { className: "mt-1 text-sm text-ink-200", children: body })] }), i < tiers.length - 1 && (_jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gold-700/40 lg:block" }))] }, name))) })] }) }));
}
function Security() {
    const items = [
        {
            icon: Lock,
            title: "Smart contract hardening",
            points: [
                "Solidity 0.8.24 with built-in overflow protection",
                "OpenZeppelin AccessControl + ReentrancyGuard + Pausable",
                "Governor role required for allocations & rate changes",
                "Emergency withdraw only when system is paused",
            ],
        },
        {
            icon: Fingerprint,
            title: "Wallet-bound identity",
            points: [
                "Sign-In With Ethereum (EIP-4361) — no passwords stored",
                "Nonce-challenged, time-limited JWTs",
                "Role binding on-chain, not in a central DB",
                "Key rotation is literally wallet replacement",
            ],
        },
        {
            icon: Eye,
            title: "Auditable by design",
            points: [
                "Every state change emits a public event",
                "Off-chain indexer mirrors events into Postgres for analytics",
                "Planned static analysis (Slither) + symbolic exec (Mythril)",
                "Planned formal property verification (Certora)",
            ],
        },
    ];
    return (_jsx("section", { id: "security", className: "border-b border-ink-700/40", children: _jsxs("div", { className: "container-page py-20", children: [_jsxs("div", { className: "mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end", children: [_jsxs("div", { className: "max-w-2xl", children: [_jsxs("div", { className: "mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400", children: [_jsx("span", { className: "h-px w-8 bg-gold-500/50" }), "Security"] }), _jsxs("h2", { className: "font-display text-4xl font-semibold text-ink-100 sm:text-5xl", children: ["Security ", _jsx("span", { className: "gold-text", children: "baked into the protocol" }), "."] }), _jsx("p", { className: "mt-4 text-ink-200", children: "We don't bolt security on \u2014 it is the substrate. Audited primitives, wallet-native auth, and an open public ledger for every move the system makes." })] }), _jsxs("span", { className: "badge-gold", children: [_jsx(ShieldCheck, { className: "h-3.5 w-3.5" }), "Defense in depth"] })] }), _jsx("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-3", children: items.map(({ icon: Icon, title, points }) => (_jsxs("div", { className: "card card-hover p-6", children: [_jsx(Icon, { className: "h-6 w-6 text-gold-300" }), _jsx("h3", { className: "mt-4 font-display text-xl font-semibold text-ink-100", children: title }), _jsx("ul", { className: "mt-4 space-y-2 text-sm text-ink-200", children: points.map((p) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" }), _jsx("span", { children: p })] }, p))) })] }, title))) })] }) }));
}
function Numbers() {
    const stats = [
        { k: "$55B+", v: "DeFi lending TVL today" },
        { k: "1.4B", v: "Adults still unbanked" },
        { k: "$4.5T", v: "MSME financing gap" },
        { k: "6.49%", v: "Avg. remittance fee today" },
    ];
    return (_jsx("section", { className: "border-b border-ink-700/40 bg-ink-900/40", children: _jsxs("div", { className: "container-page py-16", children: [_jsx("div", { className: "grid grid-cols-2 gap-6 lg:grid-cols-4", children: stats.map(({ k, v }) => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-display text-4xl font-semibold gold-text sm:text-5xl", children: k }), _jsx("div", { className: "mt-2 text-xs uppercase tracking-[0.18em] text-ink-200", children: v })] }, k))) }), _jsx("p", { className: "mx-auto mt-8 max-w-2xl text-center text-sm text-ink-200", children: "Sources: DeFiLlama; World Bank Global Findex 2021; IFC MSME Finance Gap; World Bank Migration & Development Brief 40." })] }) }));
}
function CTA() {
    return (_jsxs("section", { id: "about", className: "relative overflow-hidden", children: [_jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 bg-radial-gold" }), _jsxs("div", { className: "container-page relative py-24 text-center", children: [_jsx(Coins, { className: "mx-auto mb-6 h-10 w-10 text-gold-300" }), _jsxs("h2", { className: "font-display text-4xl font-semibold text-ink-100 sm:text-5xl", children: ["Ready to see ", _jsx("span", { className: "gold-text", children: "transparent lending" }), " at work?"] }), _jsx("p", { className: "mx-auto mt-4 max-w-2xl text-ink-200", children: "Launch the app on Sepolia or Polygon Amoy testnets \u2014 no real funds required. Connect a wallet, explore the reserve, file a loan request, and watch the hierarchy respond." }), _jsxs("div", { className: "mt-8 flex justify-center gap-3", children: [_jsxs(Link, { to: "/app/dashboard", className: "btn-primary text-base", children: ["Enter the Platform ", _jsx(ArrowRight, { className: "h-4 w-4" })] }), _jsx("a", { href: "https://github.com/Yuvraajrahman/Cryto-World-Bank", target: "_blank", rel: "noreferrer", className: "btn-ghost text-base", children: "View source" })] })] })] }));
}
function Footer() {
    return (_jsx("footer", { className: "border-t border-ink-700/50 bg-ink-950", children: _jsxs("div", { className: "container-page flex flex-col items-center justify-between gap-6 py-10 md:flex-row", children: [_jsxs("div", { className: "flex items-center gap-3 text-xs text-ink-200", children: [_jsx(Logo, { size: 22 }), _jsx("span", { children: "\u00A9 2026 Crypto World Bank \u00B7 BRAC University prototype \u00B7 Testnet only" })] }), _jsxs("div", { className: "flex gap-6 text-xs text-ink-200", children: [_jsx("a", { href: "#security", className: "hover:text-gold-300", children: "Security" }), _jsx("a", { href: "#hierarchy", className: "hover:text-gold-300", children: "Hierarchy" }), _jsx("a", { href: "#features", className: "hover:text-gold-300", children: "Platform" })] })] }) }));
}
