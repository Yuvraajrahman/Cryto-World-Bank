import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FilePlus2, Coins, ArrowUpRight, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { useSession } from "@/lib/store";
const statusStyle = {
    PENDING: "badge-blue",
    APPROVED: "badge-gold",
    ACTIVE: "badge-gold",
    REPAID: "badge-green",
    REJECTED: "badge-red",
    DEFAULTED: "badge-red",
};
export function Loans() {
    const user = useSession((s) => s.user);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    async function load() {
        setLoading(true);
        try {
            if (user?.role === "BORROWER") {
                const r = await api.get("/api/loans/mine");
                setLoans(r.loans);
            }
            else if (user?.bankId) {
                const r = await api.get(`/api/loans/bank/${user.bankId}`);
                setLoans(r.loans);
            }
            else {
                setLoans([]);
            }
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.bankId]);
    const filtered = useMemo(() => (statusFilter === "ALL" ? loans : loans.filter((l) => l.status === statusFilter)), [loans, statusFilter]);
    const totals = useMemo(() => {
        const total = loans.length;
        const active = loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED").length;
        const outstanding = loans
            .filter((l) => l.status === "ACTIVE" || l.status === "APPROVED")
            .reduce((acc, l) => {
            if (!l.isInstallment)
                return acc + l.amount;
            const unpaid = l.installments.filter((i) => !i.paid).reduce((a, i) => a + i.amount, 0);
            return acc + unpaid;
        }, 0);
        const lifetimeRepaid = loans
            .filter((l) => l.status === "REPAID")
            .reduce((acc, l) => acc + l.amount, 0);
        return { total, active, outstanding, lifetimeRepaid };
    }, [loans]);
    const isBorrower = user?.role === "BORROWER";
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Loans", title: isBorrower ? "Your Loan Portfolio" : "Bank Loan Portfolio", description: isBorrower
                    ? "Every loan you've requested, approved, or repaid — with an immutable on-chain link for each state transition."
                    : "Loans currently funded by your bank. Every state transition is signed and auditable.", right: _jsxs(_Fragment, { children: [_jsxs("select", { className: "btn-ghost", value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [_jsx("option", { value: "ALL", children: "All statuses" }), _jsx("option", { value: "PENDING", children: "Pending" }), _jsx("option", { value: "ACTIVE", children: "Active" }), _jsx("option", { value: "APPROVED", children: "Approved" }), _jsx("option", { value: "REPAID", children: "Repaid" }), _jsx("option", { value: "REJECTED", children: "Rejected" })] }), isBorrower ? (_jsxs(Link, { to: "/app/loans/new", className: "btn-primary", children: [_jsx(FilePlus2, { className: "h-4 w-4" }), "Request Loan"] })) : (_jsxs(Link, { to: "/app/approvals", className: "btn-primary", children: [_jsx(Filter, { className: "h-4 w-4" }), "Review Queue"] }))] }) }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-4", children: [_jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Total Loans" }), _jsx("div", { className: "stat-value", children: totals.total })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Currently Active" }), _jsx("div", { className: "stat-value", children: totals.active })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Outstanding" }), _jsxs("div", { className: "stat-value", children: [totals.outstanding.toFixed(2), " ETH"] })] }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Lifetime Repaid" }), _jsxs("div", { className: "stat-value", children: [totals.lifetimeRepaid.toFixed(2), " ETH"] })] })] }), _jsxs("div", { className: "card p-0 overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-ink-700/50 px-6 py-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-ink-200", children: [_jsx(Coins, { className: "h-4 w-4 text-gold-400" }), loading
                                        ? "Loading…"
                                        : `Showing ${filtered.length} of ${loans.length} loan${loans.length === 1 ? "" : "s"}`] }), _jsxs("span", { className: "text-xs text-ink-200", children: ["Sorted by ", _jsx("span", { className: "text-gold-300", children: "Newest" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-ink-900/60 text-[11px] uppercase tracking-[0.2em] text-ink-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left", children: "Loan" }), _jsx("th", { className: "px-6 py-3 text-left", children: "Principal" }), _jsx("th", { className: "px-6 py-3 text-left", children: "Term" }), _jsx("th", { className: "px-6 py-3 text-left", children: "APR" }), _jsx("th", { className: "px-6 py-3 text-left", children: "Purpose" }), _jsx("th", { className: "px-6 py-3 text-left", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left", children: "Created" }), _jsx("th", { className: "px-6 py-3" })] }) }), _jsxs("tbody", { children: [filtered.map((l) => (_jsxs("tr", { className: "border-t border-ink-700/50 transition-colors hover:bg-ink-800/40", children: [_jsxs("td", { className: "px-6 py-4 font-mono text-gold-300", children: ["#", l.id.split("_").pop()?.slice(0, 8)] }), _jsxs("td", { className: "px-6 py-4 text-ink-100", children: [l.amount.toFixed(2), " ETH"] }), _jsxs("td", { className: "px-6 py-4 text-ink-200", children: [l.termMonths, " mo"] }), _jsxs("td", { className: "px-6 py-4 text-ink-200", children: [(l.aprBps / 100).toFixed(2), "%"] }), _jsx("td", { className: "px-6 py-4 text-ink-100 max-w-[260px] truncate", title: l.purpose, children: l.purpose }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: statusStyle[l.status], children: l.status }) }), _jsx("td", { className: "px-6 py-4 text-xs text-ink-200", children: formatDateTime(l.createdAt) }), _jsx("td", { className: "px-6 py-4 text-right", children: _jsxs(Link, { to: isBorrower ? "/app/installments" : "/app/approvals", className: "inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200", children: ["Details ", _jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })] }) })] }, l.id))), filtered.length === 0 && !loading ? (_jsx("tr", { children: _jsxs("td", { colSpan: 8, className: "px-6 py-10 text-center text-sm text-ink-200", children: ["No loans yet.", " ", isBorrower ? (_jsx(Link, { to: "/app/loans/new", className: "text-gold-300 hover:text-gold-200", children: "Request your first loan \u2192" })) : null] }) })) : null] })] }) })] })] }));
}
