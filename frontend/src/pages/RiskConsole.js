import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ShieldAlert, Sparkles, Sigma, Info, RefreshCw, AlertTriangle, } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { api } from "@/lib/api";
export function RiskConsole() {
    const [loans, setLoans] = useState([]);
    const [borrowers, setBorrowers] = useState({});
    const [selectedId, setSelectedId] = useState("");
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scoring, setScoring] = useState(false);
    const [health, setHealth] = useState(null);
    async function loadQueue() {
        setLoading(true);
        try {
            const r = await api.get("/api/loans/queue");
            setLoans(r.loans);
            if (!selectedId && r.loans[0])
                setSelectedId(r.loans[0].id);
            const ids = Array.from(new Set(r.loans.map((l) => l.borrowerId).filter(Boolean)));
            const map = {};
            await Promise.all(ids.map(async (id) => {
                try {
                    const u = await api.get(`/api/profile/users/${id}`);
                    map[id] = u;
                }
                catch {
                    /* ignore */
                }
            }));
            setBorrowers(map);
        }
        catch {
            /* ignore */
        }
        finally {
            setLoading(false);
        }
    }
    async function loadHealth() {
        try {
            const h = await api.get("/api/risk/health");
            setHealth(h);
        }
        catch {
            setHealth({ ok: false, upstream: null });
        }
    }
    async function runScore(loan) {
        if (!loan)
            return;
        setScoring(true);
        try {
            const borrower = loan.borrowerId ? borrowers[loan.borrowerId] : undefined;
            const r = await api.post("/api/risk/score", {
                loanId: loan.id,
                features: {
                    principalEth: loan.amount,
                    termMonths: loan.termMonths,
                    priorDefaults: 0,
                    consecutivePaidLoans: borrower?.consecutivePaidLoans ?? 0,
                    monthlyIncomeUsd: borrower?.monthlyIncomeUsd ?? 0,
                    txCount6m: 0,
                },
            });
            setScore(r);
        }
        finally {
            setScoring(false);
        }
    }
    useEffect(() => {
        loadQueue();
        loadHealth();
    }, []);
    useEffect(() => {
        if (selectedId) {
            const l = loans.find((x) => x.id === selectedId);
            runScore(l);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, loans.length]);
    const loan = loans.find((l) => l.id === selectedId);
    const borrower = loan?.borrowerId ? borrowers[loan.borrowerId] : undefined;
    const shap = score?.shap ?? [];
    const recommendationBadge = score?.recommendation === "APPROVE"
        ? "badge-green"
        : score?.recommendation === "REJECT"
            ? "badge-red"
            : "badge-gold";
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Risk", title: "AI Risk Console", description: "Approver-facing view of the off-chain risk model. The backend tries the upstream FastAPI service first and falls back to a deterministic stub.", right: _jsxs(_Fragment, { children: [_jsxs("span", { className: "badge-gold", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5" }), score?.upstream ? "Upstream ML" : score?.model ?? "stub-v0"] }), _jsxs("button", { className: "btn-ghost", onClick: loadQueue, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh queue"] })] }) }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-4", children: [_jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Risk score" }), _jsx("div", { className: "stat-value gold-text", children: score ? score.riskScore.toFixed(2) : "—" }), _jsx("div", { className: `text-xs ${score?.recommendation === "APPROVE"
                                    ? "text-emerald-400"
                                    : score?.recommendation === "REJECT"
                                        ? "text-red-300"
                                        : "text-gold-300"}`, children: score?.recommendation ?? "—" })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Anomaly score" }), _jsx("div", { className: "stat-value", children: score ? score.anomalyScore.toFixed(2) : "—" }), _jsx("div", { className: "text-xs text-ink-200", children: "Isolation Forest" })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Model" }), _jsx("div", { className: "stat-value text-xl", children: score?.model ?? "stub-v0" }), _jsx("div", { className: "text-xs text-ink-200", children: score?.upstream ? "Live upstream" : "Deterministic stub" })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Upstream" }), _jsx("div", { className: "stat-value text-xl", children: health?.ok ? "Online" : "Offline" }), _jsx("div", { className: "text-xs text-ink-200", children: "FastAPI \u00B7 :8000" })] })] }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-5", children: [_jsxs("div", { className: "card p-6 lg:col-span-3", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "SHAP Attribution" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "What moved the decision" })] }), _jsxs("span", { className: "badge-gold", children: [_jsx(Sigma, { className: "h-3.5 w-3.5" }), "Explainable"] })] }), shap.length > 0 ? (_jsx("div", { className: "h-72", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: shap, layout: "vertical", margin: { left: 30 }, children: [_jsx(CartesianGrid, { stroke: "rgba(255,255,255,0.05)" }), _jsx(XAxis, { type: "number", stroke: "#8a8b93", fontSize: 12 }), _jsx(YAxis, { type: "category", dataKey: "feature", stroke: "#8a8b93", fontSize: 12, width: 160 }), _jsx(Tooltip, { contentStyle: {
                                                    background: "#101013",
                                                    border: "1px solid rgba(212,175,55,0.35)",
                                                    borderRadius: 12,
                                                    fontSize: 12,
                                                } }), _jsx(Bar, { dataKey: "contribution", radius: [0, 8, 8, 0], children: shap.map((f, i) => (_jsx(Cell, { fill: f.contribution > 0 ? "#d4af37" : "#3aa675" }, i))) })] }) }) })) : (_jsxs("div", { className: "flex h-72 flex-col items-center justify-center text-sm text-ink-200", children: [_jsx(AlertTriangle, { className: "mb-2 h-6 w-6 text-gold-400" }), "Select a pending loan to compute a risk score."] }))] }), _jsxs("div", { className: "card p-6 lg:col-span-2", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(ShieldAlert, { className: "h-4 w-4 text-gold-400" }), "Current subject"] }), loan ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "font-display text-xl font-semibold text-ink-100", children: ["Loan #", loan.id.split("_").pop()?.slice(0, 8)] }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: [borrower?.displayName ?? "Borrower", borrower?.country ? ` · ${borrower.country}` : ""] }), _jsx("dl", { className: "mt-4 space-y-2 text-sm", children: [
                                            ["Principal", `${loan.amount.toFixed(2)} ETH`],
                                            ["Term", `${loan.termMonths} months`],
                                            ["APR", `${(loan.aprBps / 100).toFixed(2)}%`],
                                            [
                                                "Prior paid",
                                                String(borrower?.consecutivePaidLoans ?? 0),
                                            ],
                                            [
                                                "Monthly income",
                                                borrower?.monthlyIncomeUsd
                                                    ? `$${borrower.monthlyIncomeUsd.toLocaleString()} (verified)`
                                                    : "Unverified",
                                            ],
                                        ].map(([k, v]) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2", children: [_jsx("span", { className: "text-ink-200", children: k }), _jsx("span", { className: "font-mono text-ink-100", children: v })] }, k))) }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "label", children: "Switch subject" }), _jsx("select", { className: "input", value: selectedId, onChange: (e) => setSelectedId(e.target.value), children: loans.map((l) => (_jsxs("option", { value: l.id, children: [l.id.split("_").pop()?.slice(0, 8), " \u00B7 ", l.amount.toFixed(2), " ETH"] }, l.id))) })] }), _jsxs("button", { className: "btn-primary mt-4 w-full", onClick: () => runScore(loan), disabled: scoring, children: [_jsx(Sparkles, { className: "h-4 w-4" }), scoring ? "Scoring…" : "Re-score"] })] })) : (_jsx("div", { className: "text-sm text-ink-200", children: "No pending loans in the queue." })), _jsxs("div", { className: "mt-5 flex items-start gap-2 rounded-xl border border-gold-700/30 bg-gold-900/10 p-3 text-xs text-gold-200", children: [_jsx(Info, { className: "mt-0.5 h-4 w-4 shrink-0" }), "Final approvals are always human. The model's role is to surface evidence, not to overrule the approver."] }), score?.recommendation ? (_jsxs("div", { className: "mt-3 flex items-center justify-between rounded-xl border border-ink-600/60 bg-ink-900/60 p-3 text-sm", children: [_jsx("span", { children: "Recommended" }), _jsx("span", { className: recommendationBadge, children: score.recommendation })] })) : null] })] })] }));
}
