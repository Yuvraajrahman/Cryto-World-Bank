import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AlertTriangle, Pause, Play, Gauge, ShieldCheck, History, Shuffle, RefreshCw, } from "lucide-react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
export function Admin() {
    const role = useSession((s) => s.role);
    const user = useSession((s) => s.user);
    const [paused, setPaused] = useState(false);
    const [apr, setApr] = useState(300);
    const [banks, setBanks] = useState(null);
    const [log, setLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fromId, setFromId] = useState("");
    const [toId, setToId] = useState("");
    const [amount, setAmount] = useState("10");
    const [allocating, setAllocating] = useState(false);
    async function load() {
        setLoading(true);
        try {
            const [b, l] = await Promise.all([
                api.get("/api/banks"),
                api.get("/api/banks/audit-log").catch(() => ({ entries: [] })),
            ]);
            setBanks(b);
            setLog(l.entries ?? []);
            if (!fromId) {
                if (role === "OWNER" && b.worldBank)
                    setFromId(b.worldBank.id);
                else if (user?.bankId)
                    setFromId(user.bankId);
            }
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const isOwner = role === "OWNER";
    const isNbAdmin = role === "NATIONAL_BANK_ADMIN";
    const allocationTargets = isOwner
        ? (banks?.nationalBanks ?? [])
        : (banks?.localBanks ?? []).filter((lb) => lb.parentBankId === user?.bankId);
    async function allocate() {
        if (!fromId || !toId) {
            toast.error("Select source and target");
            return;
        }
        const amt = Number(amount);
        if (!(amt > 0)) {
            toast.error("Amount must be positive");
            return;
        }
        try {
            setAllocating(true);
            await api.post("/api/banks/allocate", {
                fromBankId: fromId,
                toBankId: toId,
                amount: amt,
            });
            toast.success(`Allocated ${amt} ETH`);
            load();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Allocation failed");
        }
        finally {
            setAllocating(false);
        }
    }
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Governance", title: isOwner ? "Governor Controls" : "National Bank Controls", description: "Governance actions are role-gated, signed by your wallet, and logged immutably. Unauthorized calls revert on-chain.", right: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "badge-gold", children: [_jsx(ShieldCheck, { className: "h-3.5 w-3.5" }), role.replace(/_/g, " ")] }), _jsxs("button", { className: "btn-ghost", onClick: load, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] }) }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [isOwner ? (_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Gauge, { className: "h-4 w-4 text-gold-400" }), "Reserve APR"] }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Tier 1 \u2192 Tier 2 lending rate" }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "label", children: "Basis points (100 = 1.00%)" }), _jsx("input", { type: "number", className: "input", min: 0, max: 5000, value: apr, onChange: (e) => setApr(Number(e.target.value)) }), _jsx("p", { className: "mt-1 text-xs text-ink-200", children: "Safety cap: 50.00% (5000 bps)" })] }), _jsx("button", { className: "btn-primary mt-4", onClick: () => toast.success(`APR set to ${(apr / 100).toFixed(2)}%`), children: "Update rate" })] })) : null, _jsxs("div", { className: `card p-6 ${isOwner ? "" : "lg:col-span-2"}`, children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Shuffle, { className: "h-4 w-4 text-gold-400" }), "Capital allocation"] }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: isOwner ? "World → National" : "National → Local" }), _jsx("p", { className: "mt-1 text-xs text-ink-200", children: isOwner
                                    ? "Move reserve into a national bank's wallet."
                                    : "Move your national reserve into one of your local banks." }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "From" }), _jsxs("select", { className: "input", value: fromId, onChange: (e) => setFromId(e.target.value), disabled: !isOwner && Boolean(user?.bankId), children: [_jsx("option", { value: "", children: "Select\u2026" }), isOwner && banks?.worldBank ? (_jsxs("option", { value: banks.worldBank.id, children: [banks.worldBank.name, " \u00B7 ", banks.worldBank.reserve.toFixed(0), " ETH"] })) : null, !isOwner && isNbAdmin && user?.bankId
                                                        ? (() => {
                                                            const nb = banks?.nationalBanks.find((n) => n.id === user.bankId);
                                                            return nb ? (_jsxs("option", { value: nb.id, children: [nb.name, " \u00B7 ", nb.reserve.toFixed(0), " ETH"] })) : null;
                                                        })()
                                                        : null] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "To" }), _jsxs("select", { className: "input", value: toId, onChange: (e) => setToId(e.target.value), children: [_jsx("option", { value: "", children: "Select\u2026" }), allocationTargets.map((b) => (_jsx("option", { value: b.id, children: b.name }, b.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Amount (ETH)" }), _jsx("input", { className: "input", inputMode: "decimal", value: amount, onChange: (e) => setAmount(e.target.value) })] })] }), _jsxs("button", { className: "btn-primary mt-4", onClick: allocate, disabled: allocating, children: [_jsx(Shuffle, { className: "h-4 w-4" }), allocating ? "Allocating…" : "Allocate funds"] })] }), isOwner ? (_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-gold-400" }), "Emergency"] }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "System breaker" }), _jsx("p", { className: "mt-1 text-xs text-ink-200", children: "Pausing halts allocations, repayments, and loan lifecycle actions at every tier. Use only during a confirmed incident." }), _jsxs("div", { className: "mt-4 flex items-center justify-between rounded-xl border border-ink-600/60 bg-ink-900/60 px-4 py-3", children: [_jsx("span", { className: "text-sm text-ink-200", children: "Current state" }), _jsx("span", { className: paused ? "badge-red" : "badge-green", children: paused ? "Paused" : "Live" })] }), _jsx("div", { className: "mt-4 flex gap-2", children: _jsxs("button", { className: paused ? "btn-primary" : "btn-danger", onClick: () => {
                                        setPaused((p) => !p);
                                        toast(paused ? "System resumed" : "System paused");
                                    }, children: [paused ? _jsx(Play, { className: "h-4 w-4" }) : _jsx(Pause, { className: "h-4 w-4" }), paused ? "Unpause" : "Pause"] }) })] })) : null] }), _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200 flex items-center gap-2", children: [_jsx(History, { className: "h-4 w-4 text-gold-400" }), "Audit log"] }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Allocation history" })] }), _jsxs("span", { className: "text-xs text-ink-200", children: [log.length, " entries"] })] }), _jsxs("ul", { className: "space-y-2 text-sm", children: [log.length === 0 ? (_jsx("li", { className: "py-6 text-center text-xs text-ink-200", children: "No allocations yet." })) : null, log.map((e) => (_jsxs("li", { className: "flex items-center justify-between rounded-lg border border-ink-600/50 bg-ink-900/50 px-3 py-2.5", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-ink-100", children: e.note ?? "Capital allocated" }), _jsxs("div", { className: "text-xs text-ink-200", children: [formatDateTime(e.at), e.txHash ? (_jsxs("span", { className: "ml-2 font-mono text-gold-300", children: ["tx ", e.txHash.slice(0, 10), "\u2026"] })) : null] })] }), _jsxs("span", { className: "badge-gold", children: [e.amount.toFixed(2), " ETH"] })] }, e.id)))] })] })] }));
}
