import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CalendarClock, CheckCircle2, Coins, CircleDollarSign, Receipt, } from "lucide-react";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { contractAddresses, localBankAbi } from "@/lib/contracts";
import { contractsConfigured } from "@/lib/onChain";
import { useOnChainTx } from "@/hooks/useOnChainTx";
export function Installments() {
    const { address, isConnected } = useAccount();
    const onChain = contractsConfigured();
    const { write, busy: chainBusy } = useOnChainTx(() => load());
    const [loans, setLoans] = useState([]);
    const [chainLoans, setChainLoans] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(null);
    async function load() {
        setLoading(true);
        try {
            if (onChain && address) {
                const r = await api.get(`/api/chain/loans/borrower/${address}`);
                setChainLoans(r.loans);
                if (r.loans.length > 0 && !activeId) {
                    setActiveId(`chain_${r.loans[0].id}`);
                }
            }
            const r = await api.get("/api/loans/mine");
            const active = r.loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
            setLoans(active);
            if (!onChain && active.length > 0 && !activeId) {
                setActiveId(active[0].id);
            }
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);
    const chainLoan = useMemo(() => activeId?.startsWith("chain_")
        ? chainLoans.find((l) => `chain_${l.id}` === activeId)
        : undefined, [chainLoans, activeId]);
    const loan = useMemo(() => (activeId?.startsWith("chain_") ? undefined : loans.find((l) => l.id === activeId)), [loans, activeId]);
    function payOnChain(l) {
        if (!isConnected) {
            toast.error("Connect MetaMask as borrower");
            return;
        }
        if (!contractAddresses.localBank)
            return;
        const value = l.isLumpSum ? l.totalOwedEth : l.nextInstallmentEth;
        write({
            address: contractAddresses.localBank,
            abi: localBankAbi,
            functionName: "payInstallment",
            args: [BigInt(l.id)],
            value: parseEther(value.toFixed(8)),
        });
    }
    async function pay(index) {
        if (!loan)
            return;
        setPaying(index);
        try {
            await api.post(`/api/loans/${loan.id}/installments/${index}/pay`);
            toast.success(`Installment #${index} paid`);
            await load();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment failed");
        }
        finally {
            setPaying(null);
        }
    }
    async function payFull() {
        if (!loan)
            return;
        setPaying(0);
        try {
            await api.post(`/api/loans/${loan.id}/repay`);
            toast.success("Loan fully repaid");
            await load();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Repayment failed");
        }
        finally {
            setPaying(null);
        }
    }
    const hasChain = onChain && chainLoans.length > 0;
    const hasApi = loans.length > 0;
    if (!loading && !hasChain && !hasApi) {
        return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Lifecycle", title: "Installment Schedule", description: "Your repayment plan lives on-chain. Pay a single installment, prepay, or audit any transition at a glance." }), _jsx(EmptyState, { icon: Receipt, title: "No active loans yet", description: "Once an approver accepts a request, your installment schedule will show up here.", action: _jsx(Link, { to: "/app/loans/new", className: "btn-primary", children: "Request a loan" }) })] }));
    }
    if (chainLoan) {
        const remaining = chainLoan.totalOwedEth - chainLoan.totalPaidEth;
        return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Lifecycle", title: "On-chain repayment", description: `Loan #${chainLoan.id} on LocalBank — ${chainLoan.purpose}` }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-4", children: [_jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Principal" }), _jsxs("div", { className: "stat-value", children: [chainLoan.principalEth.toFixed(4), " ETH"] })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Progress" }), _jsxs("div", { className: "stat-value", children: [chainLoan.installmentsPaid, " / ", chainLoan.installmentCount] })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Outstanding" }), _jsxs("div", { className: "stat-value", children: [remaining.toFixed(4), " ETH"] })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Next payment" }), _jsxs("div", { className: "stat-value", children: [(chainLoan.isLumpSum ? remaining : chainLoan.nextInstallmentEth).toFixed(4), " ETH"] })] })] }), _jsx("div", { className: "card p-6", children: _jsxs("button", { className: "btn-primary", disabled: chainBusy, onClick: () => payOnChain(chainLoan), children: [_jsx(CircleDollarSign, { className: "h-4 w-4" }), chainBusy
                                ? "Confirm in wallet…"
                                : chainLoan.isLumpSum
                                    ? "Repay full loan"
                                    : `Pay installment #${chainLoan.installmentsPaid + 1}`] }) })] }));
    }
    const paidCount = loan?.installments.filter((x) => x.paid).length ?? 0;
    const total = loan?.installments.length ?? 0;
    const next = loan?.installments.find((x) => !x.paid);
    const daysToNext = next
        ? Math.ceil((new Date(next.dueDate).getTime() - Date.now()) / 86400000)
        : null;
    const overdue = daysToNext !== null && daysToNext < 0;
    const outstanding = loan?.installments.filter((i) => !i.paid).reduce((a, i) => a + i.amount, 0) ?? 0;
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Lifecycle", title: "Installment Schedule", description: "Your repayment plan lives on-chain. Pay a single installment, prepay, or audit any transition at a glance.", right: (hasChain ? chainLoans : loans).length > 1 ? (_jsxs("select", { className: "btn-ghost", value: activeId ?? "", onChange: (e) => setActiveId(e.target.value), children: [chainLoans.map((l) => (_jsxs("option", { value: `chain_${l.id}`, children: ["On-chain #", l.id, " \u2014 ", l.principalEth, " ETH"] }, l.id))), loans.map((l) => (_jsxs("option", { value: l.id, children: ["Loan #", l.id.split("_").pop()?.slice(0, 8), " \u2014 ", l.amount, " ETH"] }, l.id)))] })) : null }), loan ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-4", children: [_jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Loan" }), _jsxs("div", { className: "stat-value", children: ["#", loan.id.split("_").pop()?.slice(0, 8)] }), _jsxs("div", { className: "text-xs text-ink-200", children: [loan.amount.toFixed(2), " ETH"] })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Progress" }), _jsxs("div", { className: "stat-value", children: [paidCount, " / ", total || 1] }), _jsx("div", { className: "text-xs text-ink-200", children: loan.isInstallment ? "installments paid" : "single payment" })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Outstanding" }), _jsxs("div", { className: "stat-value", children: [(loan.isInstallment ? outstanding : loan.amount).toFixed(3), " ETH"] })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: loan.isInstallment ? "Next due" : "Deadline" }), _jsx("div", { className: "stat-value", children: loan.isInstallment
                                            ? next
                                                ? new Date(next.dueDate).toLocaleDateString()
                                                : "Done"
                                            : loan.deadline
                                                ? new Date(loan.deadline).toLocaleDateString()
                                                : "—" }), daysToNext !== null ? (_jsx("div", { className: `text-xs ${overdue ? "text-red-300" : "text-ink-200"}`, children: overdue
                                            ? `${Math.abs(daysToNext)} day(s) overdue`
                                            : `${daysToNext} day(s) remaining` })) : null] })] }), _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Repayment timeline" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: loan.isInstallment
                                                    ? `${loan.termMonths}-month schedule`
                                                    : "Single payment" })] }), loan.isInstallment ? (next ? (_jsxs("button", { className: "btn-primary", onClick: () => pay(next.index), disabled: paying !== null, children: [_jsx(CircleDollarSign, { className: "h-4 w-4" }), paying === next.index
                                                ? "Paying…"
                                                : `Pay installment #${next.index}`] })) : (_jsx("span", { className: "badge-green", children: "All paid" }))) : (_jsxs("button", { className: "btn-primary", onClick: payFull, disabled: paying !== null, children: [_jsx(CircleDollarSign, { className: "h-4 w-4" }), paying !== null ? "Paying…" : "Repay loan"] }))] }), loan.isInstallment ? (_jsxs("div", { className: "relative", children: [_jsx("div", { "aria-hidden": true, className: "absolute left-3.5 top-0 h-full w-px bg-gold-700/30" }), _jsx("ul", { className: "space-y-3", children: loan.installments.map((x) => {
                                            const isNext = next?.index === x.index;
                                            const d = new Date(x.dueDate);
                                            const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
                                            const isOverdue = !x.paid && days < 0;
                                            return (_jsxs("li", { className: `relative flex items-center justify-between rounded-xl border bg-ink-900/60 px-4 py-3 pl-10 ${isNext
                                                    ? "border-gold-700/50"
                                                    : isOverdue
                                                        ? "border-red-700/40"
                                                        : "border-ink-600/60"}`, children: [_jsx("span", { "aria-hidden": true, className: `absolute left-2 flex h-4 w-4 items-center justify-center rounded-full border ${x.paid
                                                            ? "border-emerald-500/70 bg-emerald-500/30"
                                                            : isOverdue
                                                                ? "border-red-500/70 bg-red-500/30"
                                                                : "border-gold-600/60 bg-gold-700/10"}`, children: _jsx("span", { className: `h-1.5 w-1.5 rounded-full ${x.paid
                                                                ? "bg-emerald-300"
                                                                : isOverdue
                                                                    ? "bg-red-300"
                                                                    : "bg-gold-300"}` }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "font-mono text-sm text-ink-200", children: ["#", x.index.toString().padStart(2, "0")] }), _jsx("div", { children: _jsxs("div", { className: "flex items-center gap-2 text-sm text-ink-100", children: [_jsx(CalendarClock, { className: "h-3.5 w-3.5 text-gold-400" }), d.toLocaleDateString(), !x.paid ? (_jsxs("span", { className: `text-xs ${isOverdue ? "text-red-300" : "text-ink-200"}`, children: ["\u00B7 ", isOverdue ? `overdue ${-days}d` : `${days}d`] })) : null] }) })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "font-mono text-sm text-ink-100", children: [x.amount.toFixed(4), " ETH"] }), x.paid ? (_jsxs("span", { className: "badge-green", children: [_jsx(CheckCircle2, { className: "h-3.5 w-3.5" }), "Paid"] })) : (_jsxs("button", { className: "btn-ghost text-xs", onClick: () => pay(x.index), disabled: paying !== null, children: [_jsx(Coins, { className: "h-3.5 w-3.5" }), paying === x.index ? "Paying…" : "Pay"] }))] })] }, x.index));
                                        }) })] })) : (_jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/60 p-6 text-sm text-ink-200", children: ["This is a single-payment loan. You can repay", " ", _jsxs("span", { className: "font-mono text-gold-300", children: [loan.amount.toFixed(4), " ETH"] }), " ", "any time before", " ", loan.deadline ? new Date(loan.deadline).toLocaleDateString() : "the deadline", "."] }))] })] })) : null] }));
}
