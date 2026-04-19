import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, Coins, Info, FilePlus2, Shield, AlertTriangle, RefreshCw, } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { api } from "@/lib/api";
export function RequestLoan() {
    const nav = useNavigate();
    const [principal, setPrincipal] = useState("2.5");
    const [termMonths, setTermMonths] = useState(12);
    const [purpose, setPurpose] = useState("Working capital for a small business");
    const [category, setCategory] = useState("Working Capital");
    const [submitting, setSubmitting] = useState(false);
    const [localBanks, setLocalBanks] = useState([]);
    const [selectedBankId, setSelectedBankId] = useState("");
    const [limits, setLimits] = useState(null);
    const [gasEth, setGasEth] = useState(0);
    const [loading, setLoading] = useState(false);
    async function load() {
        setLoading(true);
        try {
            const [banks, lim] = await Promise.all([
                api.get("/api/banks"),
                api
                    .get("/api/profile/limits")
                    .catch(() => null),
            ]);
            setLocalBanks(banks.localBanks);
            if (!selectedBankId && banks.localBanks[0])
                setSelectedBankId(banks.localBanks[0].id);
            setLimits(lim);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
        // Simulate gas estimation — small ETH cost that refreshes every few seconds.
        setGasEth(Number((0.002 + Math.random() * 0.003).toFixed(5)));
        const t = setInterval(() => setGasEth(Number((0.002 + Math.random() * 0.003).toFixed(5))), 6000);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const apr = 0.08;
    const principalNum = Number(principal) || 0;
    const { interest, total, monthly, finalAmount } = useMemo(() => {
        const int = (principalNum * apr * termMonths) / 12;
        const tot = principalNum + int;
        const m = termMonths > 0 ? tot / termMonths : 0;
        return { interest: int, total: tot, monthly: m, finalAmount: principalNum - gasEth };
    }, [principalNum, termMonths, gasEth]);
    const limitsWarning = useMemo(() => {
        if (!limits)
            return null;
        if (principalNum <= 0)
            return null;
        if (principalNum > limits.sixMonth.remaining) {
            return {
                kind: "error",
                text: `Exceeds 6-month remaining limit (${limits.sixMonth.remaining.toFixed(2)} ETH).`,
            };
        }
        if (principalNum > limits.oneYear.remaining) {
            return {
                kind: "error",
                text: `Exceeds 1-year remaining limit (${limits.oneYear.remaining.toFixed(2)} ETH).`,
            };
        }
        if (limits.activeLoanCount >= limits.maxActiveLoans) {
            return {
                kind: "error",
                text: `You already have ${limits.activeLoanCount} of ${limits.maxActiveLoans} allowed active loans. Repay one before requesting more.`,
            };
        }
        const bank = localBanks.find((b) => b.id === selectedBankId);
        if (bank && principalNum > bank.reserve) {
            return {
                kind: "error",
                text: `${bank.name} currently has only ${bank.reserve.toFixed(2)} ETH in reserve.`,
            };
        }
        return { kind: "ok", text: "Within limits." };
    }, [principalNum, limits, localBanks, selectedBankId]);
    async function submit() {
        if (!selectedBankId) {
            toast.error("Select a local bank");
            return;
        }
        if (limitsWarning?.kind === "error") {
            toast.error(limitsWarning.text);
            return;
        }
        try {
            setSubmitting(true);
            await api.post("/api/loans", {
                amount: principalNum,
                termMonths,
                purpose,
                localBankId: selectedBankId,
                category,
            });
            toast.success("Loan request submitted — awaiting approver review");
            nav("/app/loans");
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Request failed");
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Apply", title: "Request a Loan", description: "Submit an on-chain loan request to your Local Bank. Approvals are logged immutably; repayment schedules are auto-generated above the 100 ETH threshold.", right: _jsxs("button", { className: "btn-ghost", onClick: load, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] }) }), limits ? (_jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-4", children: [_jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "6-month remaining" }), _jsxs("div", { className: "stat-value", children: [limits.sixMonth.remaining.toFixed(2), " ETH"] }), _jsxs("div", { className: "text-xs text-ink-200", children: ["of ", limits.sixMonth.limit.toFixed(2)] })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "1-year remaining" }), _jsxs("div", { className: "stat-value", children: [limits.oneYear.remaining.toFixed(2), " ETH"] }), _jsxs("div", { className: "text-xs text-ink-200", children: ["of ", limits.oneYear.limit.toFixed(2)] })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Active loans" }), _jsxs("div", { className: "stat-value", children: [limits.activeLoanCount, " / ", limits.maxActiveLoans] }), _jsx("div", { className: "text-xs text-ink-200", children: limits.exceptionApplied ? "Good-history exception" : "Standard cap" })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Gas cost (est.)" }), _jsxs("div", { className: "stat-value", children: [gasEth.toFixed(5), " ETH"] }), _jsx("div", { className: "text-xs text-ink-200", children: "Deducted from disbursed amount" })] })] })) : null, _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-5", children: [_jsxs("div", { className: "card p-6 lg:col-span-3", children: [_jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Principal (ETH)" }), _jsx("input", { inputMode: "decimal", className: "input", value: principal, onChange: (e) => setPrincipal(e.target.value) }), _jsxs("p", { className: "mt-1 text-xs text-ink-200", children: ["Between 0.1 and 500 ETH", limits ? ` · max ${Math.min(limits.sixMonth.remaining, limits.oneYear.remaining).toFixed(2)} ETH` : ""] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Term (months)" }), _jsx("input", { type: "number", min: 1, max: 60, className: "input", value: termMonths, onChange: (e) => setTermMonths(Number(e.target.value)) }), _jsx("p", { className: "mt-1 text-xs text-ink-200", children: "Maximum 60 months" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Category" }), _jsxs("select", { className: "input", value: category, onChange: (e) => setCategory(e.target.value), children: [_jsx("option", { children: "Small Business" }), _jsx("option", { children: "Agriculture" }), _jsx("option", { children: "Education" }), _jsx("option", { children: "Housing" }), _jsx("option", { children: "Working Capital" }), _jsx("option", { children: "Other" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Local Bank" }), _jsx("select", { className: "input", value: selectedBankId, onChange: (e) => setSelectedBankId(e.target.value), children: localBanks.map((b) => (_jsxs("option", { value: b.id, children: [b.name, " \u00B7 ", b.reserve.toFixed(0), " ETH capacity"] }, b.id))) })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "label", children: "Purpose" }), _jsx("textarea", { rows: 3, className: "input resize-none", value: purpose, onChange: (e) => setPurpose(e.target.value) }), _jsx("p", { className: "mt-1 text-xs text-ink-200", children: "10\u2013500 characters" })] })] }), limitsWarning ? (_jsx("div", { className: `mt-5 rounded-xl border px-4 py-3 text-sm ${limitsWarning.kind === "error"
                                    ? "border-red-700/40 bg-red-900/10 text-red-200"
                                    : "border-emerald-700/30 bg-emerald-900/10 text-emerald-200"}`, children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [limitsWarning.kind === "error" ? (_jsx(AlertTriangle, { className: "h-4 w-4" })) : (_jsx(CheckCircle2, { className: "h-4 w-4" })), limitsWarning.text] }) })) : null, _jsxs("div", { className: "mt-6 rounded-xl border border-gold-700/30 bg-gold-900/10 p-4 text-xs text-gold-200", children: [_jsxs("div", { className: "mb-1 flex items-center gap-2 font-medium", children: [_jsx(Shield, { className: "h-4 w-4" }), "Integrity notice"] }), "Your request is cryptographically signed by your wallet and emits a public", _jsx("span", { className: "mx-1 font-mono", children: "LoanRequested" }), "event on chain. Approvers see the same payload you see."] }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsxs("button", { className: "btn-primary", onClick: submit, disabled: submitting || limitsWarning?.kind === "error", children: [_jsx(FilePlus2, { className: "h-4 w-4" }), submitting ? "Submitting…" : "Submit Request"] }), _jsx("button", { className: "btn-ghost", onClick: () => nav(-1), children: "Cancel" })] })] }), _jsxs("div", { className: "card p-6 lg:col-span-2", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Cost preview" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Loan summary" })] }), _jsxs("span", { className: "badge-gold", children: [_jsx(Coins, { className: "h-3.5 w-3.5" }), (apr * 100).toFixed(2), "% APR"] })] }), _jsx("dl", { className: "space-y-3", children: [
                                    { k: "Principal", v: `${principalNum.toFixed(4)} ETH` },
                                    { k: "Gas cost (est.)", v: `${gasEth.toFixed(5)} ETH` },
                                    { k: "Net to wallet", v: `${Math.max(0, finalAmount).toFixed(4)} ETH` },
                                    { k: "Interest", v: `${interest.toFixed(4)} ETH` },
                                    { k: "Total owed", v: `${total.toFixed(4)} ETH`, highlight: true },
                                    { k: "Monthly installment", v: `${monthly.toFixed(4)} ETH` },
                                    {
                                        k: "# Installments",
                                        v: principalNum >= 100 ? `${termMonths} (auto)` : "1 (lump sum)",
                                    },
                                ].map((r) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2.5 text-sm", children: [_jsx("dt", { className: "text-ink-200", children: r.k }), _jsx("dd", { className: `font-mono ${r.highlight ? "gold-text text-base font-semibold" : "text-ink-100"}`, children: r.v })] }, r.k))) }), _jsx("div", { className: "divider my-5" }), _jsxs("div", { className: "space-y-2 text-xs text-ink-200", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Reviewed by a human approver + optional ML risk score"] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Funds disbursed directly to your wallet on approval"] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Info, { className: "mt-0.5 h-4 w-4 text-gold-400" }), "Loans \u2265 100 ETH auto-schedule monthly installments"] })] })] })] })] }));
}
