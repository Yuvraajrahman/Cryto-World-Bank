import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CheckCircle2, XCircle, Inbox, FileText, RefreshCw, User, FileSearch, Sparkles, } from "lucide-react";
import { api } from "@/lib/api";
import { fetchAuthorityBrief, fetchPendingLoansPhase2, documentNidUrl, documentPhotoUrl, } from "@/lib/phase2";
import { useSession } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { contractAddresses, localBankAbi } from "@/lib/contracts";
import { contractsConfigured } from "@/lib/onChain";
import { commitRevealOracle, fetchOracleStatus } from "@/lib/phase3";
import { useOnChainTx } from "@/hooks/useOnChainTx";
export function Approvals() {
    const role = useSession((s) => s.role);
    const { isConnected } = useAccount();
    const onChain = contractsConfigured();
    const { write, busy: chainBusy } = useOnChainTx(() => load());
    const canReviewLoans = role === "APPROVER" ||
        role === "LOCAL_BANK_ADMIN" ||
        role === "NATIONAL_BANK_ADMIN" ||
        role === "OWNER";
    const [tab, setTab] = useState("LOANS");
    const [loans, setLoans] = useState([]);
    const [borrowers, setBorrowers] = useState({});
    const [income, setIncome] = useState([]);
    const [loading, setLoading] = useState(false);
    const [acting, setActing] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [rejectReason, setRejectReason] = useState({});
    const [risk, setRisk] = useState({});
    const [chainLoans, setChainLoans] = useState([]);
    const [phase2Pending, setPhase2Pending] = useState([]);
    const [briefs, setBriefs] = useState({});
    const [oracleState, setOracleState] = useState({});
    async function load() {
        setLoading(true);
        try {
            const chainPending = onChain
                ? await api
                    .get("/api/chain/loans/pending")
                    .catch(() => ({ loans: [] }))
                : { loans: [] };
            setChainLoans(chainPending.loans);
            if (onChain) {
                const p2 = await fetchPendingLoansPhase2();
                setPhase2Pending(p2);
                const oracleEntries = {};
                for (const l of chainPending.loans) {
                    try {
                        const st = await fetchOracleStatus(l.id);
                        oracleEntries[l.id] = { revealed: st.revealed, scoreBps: st.scoreBps };
                    }
                    catch {
                        oracleEntries[l.id] = { revealed: false, scoreBps: 0 };
                    }
                }
                setOracleState(oracleEntries);
                if (p2.length > 0 && chainPending.loans.length === 0) {
                    setChainLoans(p2.map((p) => ({
                        id: p.id,
                        borrower: p.borrower,
                        principalEth: Number(p.principalEth),
                        aprBps: 800,
                        termMonths: 12,
                        purpose: p.purpose,
                    })));
                }
            }
            const loanRes = await api.get("/api/loans/queue");
            setLoans(loanRes.loans);
            const borrowerIds = Array.from(new Set(loanRes.loans.map((l) => l.borrowerId).filter(Boolean)));
            const ub = {};
            await Promise.all(borrowerIds.map(async (id) => {
                try {
                    const r = await api.get(`/api/profile/users/${id}`);
                    ub[id] = r;
                }
                catch {
                    /* ignore */
                }
            }));
            setBorrowers(ub);
            const inc = await api.get("/api/income/queue");
            setIncome(inc.proofs);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function scoreAndCommitOracle(loan) {
        setActing(`oracle_${loan.id}`);
        try {
            const result = await commitRevealOracle({
                loanId: loan.id,
                wallet: loan.borrower,
                principalEth: loan.principalEth,
                termMonths: loan.termMonths,
            });
            setOracleState((prev) => ({
                ...prev,
                [loan.id]: { revealed: true, scoreBps: result.scoreBps },
            }));
            toast.success(`Oracle revealed — risk ${result.riskScore.toFixed(2)} (${result.decision})`);
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Oracle commit failed");
        }
        finally {
            setActing(null);
        }
    }
    async function approveChain(loan) {
        if (!isConnected) {
            toast.error("Connect MetaMask as approver (account #3) or LB governor (#2)");
            return;
        }
        if (!contractAddresses.localBank)
            return;
        write({
            address: contractAddresses.localBank,
            abi: localBankAbi,
            functionName: "approveLoan",
            args: [BigInt(loan.id)],
        });
    }
    async function rejectChain(loan) {
        const reason = rejectReason[`chain_${loan.id}`]?.trim();
        if (!reason || reason.length < 3) {
            toast.error("Enter a reason (3+ chars)");
            return;
        }
        if (!isConnected) {
            toast.error("Connect MetaMask as approver");
            return;
        }
        if (!contractAddresses.localBank)
            return;
        write({
            address: contractAddresses.localBank,
            abi: localBankAbi,
            functionName: "rejectLoan",
            args: [BigInt(loan.id), reason],
        });
    }
    async function approve(loan) {
        setActing(loan.id);
        try {
            await api.post(`/api/loans/${loan.id}/approve`, { termMonths: loan.termMonths });
            toast.success("Loan approved — funds released");
            load();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Approval failed");
        }
        finally {
            setActing(null);
        }
    }
    async function reject(loan) {
        const reason = rejectReason[loan.id]?.trim();
        if (!reason || reason.length < 3) {
            toast.error("Enter a reason (3+ chars)");
            return;
        }
        setActing(loan.id);
        try {
            await api.post(`/api/loans/${loan.id}/reject`, { reason });
            toast.success("Loan rejected");
            load();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Rejection failed");
        }
        finally {
            setActing(null);
        }
    }
    async function fetchRisk(loan) {
        const borrower = loan.borrowerId ? borrowers[loan.borrowerId] : undefined;
        try {
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
            setRisk((prev) => ({ ...prev, [loan.id]: r }));
        }
        catch {
            toast.error("Risk score unavailable");
        }
    }
    async function reviewIncome(id, decision) {
        const notes = rejectReason[id]?.trim();
        if (decision === "REJECTED" && (!notes || notes.length < 3)) {
            toast.error("Reviewer note required for rejection");
            return;
        }
        setActing(id);
        try {
            await api.post(`/api/income/${id}/review`, { decision, notes });
            toast.success(`Income proof ${decision.toLowerCase()}`);
            load();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Review failed");
        }
        finally {
            setActing(null);
        }
    }
    async function loadBrief(loanId) {
        try {
            const b = await fetchAuthorityBrief(loanId);
            setBriefs((prev) => ({ ...prev, [loanId]: b.authorityBrief }));
        }
        catch {
            toast.error("Authority Brief unavailable");
        }
    }
    const loanCount = loans.length + chainLoans.length;
    const incomeCount = income.length;
    const filtered = useMemo(() => (tab === "LOANS" ? loans : []), [tab, loans]);
    if (!canReviewLoans) {
        return (_jsx("div", { className: "space-y-8", children: _jsx(SectionHeader, { eyebrow: "Review", title: "Approvals Queue", description: "Only approvers, bank admins, and the governor can review the queue." }) }));
    }
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Review", title: "Approvals Queue", description: "Pending loan requests and income proofs routed to your role. Decisions are signed and logged immediately.", right: _jsxs("button", { className: "btn-ghost", onClick: load, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] }) }), _jsxs("div", { className: "inline-flex rounded-xl border border-ink-600/60 bg-ink-900/60 p-1", children: [_jsxs("button", { className: `rounded-lg px-4 py-2 text-sm ${tab === "LOANS"
                            ? "bg-gold-900/20 text-gold-200"
                            : "text-ink-200 hover:text-ink-100"}`, onClick: () => setTab("LOANS"), children: [_jsx(Inbox, { className: "mr-2 inline h-4 w-4" }), "Loan requests", _jsx("span", { className: "ml-2 rounded-full bg-ink-800 px-2 py-0.5 text-[10px]", children: loanCount })] }), _jsxs("button", { className: `rounded-lg px-4 py-2 text-sm ${tab === "INCOME"
                            ? "bg-gold-900/20 text-gold-200"
                            : "text-ink-200 hover:text-ink-100"}`, onClick: () => setTab("INCOME"), children: [_jsx(FileText, { className: "mr-2 inline h-4 w-4" }), "Income proofs", _jsx("span", { className: "ml-2 rounded-full bg-ink-800 px-2 py-0.5 text-[10px]", children: incomeCount })] })] }), tab === "LOANS" ? (_jsxs(_Fragment, { children: [onChain && chainLoans.length > 0 ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "text-xs uppercase tracking-[0.22em] text-gold-300", children: ["On-chain pending (", chainLoans.length, ")"] }), chainLoans.map((l) => {
                                const p2 = phase2Pending.find((p) => p.id === l.id);
                                const docId = p2?.documentRequestId;
                                const brief = briefs[l.id];
                                const oracle = oracleState[l.id];
                                const canApproveOnChain = oracle?.revealed === true;
                                return (_jsxs("div", { className: "card p-5 border-gold-700/30", children: [_jsx("div", { className: "flex flex-wrap items-center justify-between gap-3", children: _jsxs("div", { children: [_jsxs("div", { className: "font-medium text-ink-100", children: ["Loan #", l.id, " \u00B7 ", l.principalEth.toFixed(4), " ETH"] }), _jsxs("div", { className: "font-mono text-xs text-ink-200", children: [l.borrower.slice(0, 10), "\u2026 \u00B7 ", l.termMonths, " mo \u00B7", " ", (l.aprBps / 100).toFixed(2), "% APR"] }), _jsx("div", { className: "mt-2 text-sm text-ink-100", children: l.purpose }), docId ? (_jsxs("div", { className: "mt-2 flex gap-2 text-xs", children: [_jsx("a", { className: "text-gold-300 underline", href: documentNidUrl(docId), target: "_blank", rel: "noreferrer", children: "View NID" }), _jsx("a", { className: "text-gold-300 underline", href: documentPhotoUrl(docId), target: "_blank", rel: "noreferrer", children: "View photo" })] })) : null] }) }), brief ? (_jsxs("div", { className: "mt-3 rounded-lg border border-gold-700/30 bg-gold-900/10 p-3 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2 text-gold-200", children: [_jsx(Sparkles, { className: "h-4 w-4" }), "Authority Brief: ", String(brief.headline ?? brief.recommendation)] }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: ["Risk ", String(brief.riskScore), " \u00B7 ", String(brief.recommendation)] })] })) : (_jsxs("button", { className: "btn-ghost mt-3 text-xs", onClick: () => loadBrief(l.id), children: [_jsx(FileSearch, { className: "mr-1 inline h-3 w-3" }), "Generate Authority Brief"] })), _jsxs("div", { className: "mt-3 rounded-lg border border-ink-600/60 bg-ink-950/60 p-3 text-xs", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("span", { className: "uppercase tracking-[0.2em] text-ink-200", children: "Oracle state" }), oracle?.revealed ? (_jsxs("span", { className: "badge-green", children: ["SCORE_REVEALED \u00B7 ", oracle.scoreBps, " bps"] })) : (_jsx("span", { className: "badge-gold", children: "PENDING" }))] }), !oracle?.revealed ? (_jsxs("button", { className: "btn-ghost mt-2 text-xs", disabled: acting === `oracle_${l.id}`, onClick: () => scoreAndCommitOracle(l), children: [_jsx(Sparkles, { className: "mr-1 inline h-3 w-3" }), acting === `oracle_${l.id}` ? "Scoring…" : "Score & commit oracle"] })) : null] }), _jsxs("div", { className: "mt-4", children: [_jsx("input", { className: "input mb-3", placeholder: "Rejection reason (if rejecting)", value: rejectReason[`chain_${l.id}`] ?? "", onChange: (e) => setRejectReason((r) => ({
                                                        ...r,
                                                        [`chain_${l.id}`]: e.target.value,
                                                    })) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { className: "btn-primary", disabled: chainBusy || !canApproveOnChain, onClick: () => approveChain(l), title: canApproveOnChain ? undefined : "Run Score & commit oracle first", children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), "Approve on-chain"] }), _jsxs("button", { className: "btn-danger", disabled: chainBusy, onClick: () => rejectChain(l), children: [_jsx(XCircle, { className: "h-4 w-4" }), "Reject"] })] })] })] }, l.id));
                            })] })) : null, filtered.length === 0 && chainLoans.length === 0 && !loading ? (_jsx(EmptyState, { icon: Inbox, title: "No pending loan requests", description: "When a borrower submits a request funded by your bank, it will appear here." })) : (_jsx("div", { className: "space-y-3", children: filtered.map((l) => {
                            const borrower = l.borrowerId ? borrowers[l.borrowerId] : undefined;
                            const isOpen = expanded === l.id;
                            const r = risk[l.id];
                            return (_jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-full border border-gold-700/40 bg-gold-900/20 text-gold-300", children: _jsx(User, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium text-ink-100", children: [borrower?.displayName ?? "Borrower", " ", _jsxs("span", { className: "ml-1 text-xs font-normal text-ink-200", children: ["\u00B7 ", l.category ?? "Uncategorized"] })] }), _jsxs("div", { className: "text-xs text-ink-200", children: [borrower?.country ?? "—", " \u00B7 requested ", formatDateTime(l.createdAt)] })] })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-mono text-gold-300", children: [l.amount.toFixed(4), " ETH"] }), _jsxs("div", { className: "text-xs text-ink-200", children: [l.termMonths, " mo \u00B7 ", (l.aprBps / 100).toFixed(2), "% APR"] })] }), _jsxs("button", { className: "btn-ghost", onClick: () => setExpanded(isOpen ? null : l.id), children: [_jsx(FileSearch, { className: "h-4 w-4" }), isOpen ? "Hide" : "Review"] })] })] }), isOpen ? (_jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/60 p-3 text-sm", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Purpose" }), _jsx("div", { className: "mt-1 text-ink-100", children: l.purpose })] }), _jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-4", children: [
                                                    ["Prior paid", `${borrower?.consecutivePaidLoans ?? 0}`],
                                                    [
                                                        "Lifetime borrowed",
                                                        `${(borrower?.totalBorrowedLifetime ?? 0).toFixed(2)} ETH`,
                                                    ],
                                                    [
                                                        "Income / mo",
                                                        borrower?.monthlyIncomeUsd
                                                            ? `$${borrower.monthlyIncomeUsd.toLocaleString()}`
                                                            : "Unverified",
                                                    ],
                                                    ["Gas cost", l.gasCostEth ? `${l.gasCostEth} ETH` : "—"],
                                                ].map(([k, v]) => (_jsxs("div", { className: "rounded-lg border border-ink-600/60 bg-ink-950/60 px-3 py-2", children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.2em] text-ink-200", children: k }), _jsx("div", { className: "mt-0.5 font-mono text-sm text-ink-100", children: v })] }, k))) }), _jsxs("div", { className: "rounded-xl border border-gold-700/30 bg-gold-900/10 p-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold-300", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5" }), "AI risk signal"] }), _jsx("button", { className: "btn-ghost text-xs", onClick: () => fetchRisk(l), children: r ? "Re-run" : "Fetch risk score" })] }), r ? (_jsxs("div", { className: "mt-3 grid grid-cols-3 gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.2em] text-ink-200", children: "Risk" }), _jsx("div", { className: "font-mono text-lg text-ink-100", children: r.riskScore.toFixed(2) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.2em] text-ink-200", children: "Anomaly" }), _jsx("div", { className: "font-mono text-lg text-ink-100", children: r.anomalyScore.toFixed(2) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.2em] text-ink-200", children: "Decision" }), _jsx("div", { className: `mt-0.5 text-sm ${r.recommendation === "APPROVE"
                                                                            ? "badge-green"
                                                                            : r.recommendation === "REJECT"
                                                                                ? "badge-red"
                                                                                : "badge-gold"}`, children: r.recommendation })] })] })) : (_jsx("p", { className: "mt-2 text-xs text-gold-100/80", children: "Click to fetch the ML risk score. Sprint 3 integrates SHAP feature attribution." }))] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Rejection reason (if rejecting)" }), _jsx("input", { className: "input", placeholder: "e.g. Unverified income, incomplete purpose", value: rejectReason[l.id] ?? "", onChange: (e) => setRejectReason((r) => ({ ...r, [l.id]: e.target.value })) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { className: "btn-primary", onClick: () => approve(l), disabled: acting === l.id, children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), acting === l.id ? "Approving…" : "Approve & fund"] }), _jsxs("button", { className: "btn-danger", onClick: () => reject(l), disabled: acting === l.id, children: [_jsx(XCircle, { className: "h-4 w-4" }), "Reject"] })] })] })) : null] }, l.id));
                        }) }))] })) : income.length === 0 && !loading ? (_jsx(EmptyState, { icon: FileText, title: "Nothing to review", description: "Uploaded income proofs waiting for review will show up here." })) : (_jsx("div", { className: "space-y-3", children: income.map((p) => (_jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/20 text-gold-300", children: _jsx(FileText, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium text-ink-100", children: [p.borrower?.displayName ?? p.userId, _jsxs("span", { className: "ml-2 text-xs text-ink-200", children: ["\u00B7 ", p.borrower?.country ?? "—"] })] }), _jsxs("div", { className: "font-mono text-xs text-ink-200", children: [p.fileName, " \u00B7 SHA-256 ", p.sha256.slice(0, 12), "\u2026"] }), p.monthlyIncomeUsd ? (_jsxs("div", { className: "text-xs text-gold-300", children: ["Claimed income: $", p.monthlyIncomeUsd.toLocaleString(), " / mo"] })) : null] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("a", { className: "btn-ghost", href: `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"}/api/income/${p.id}/file`, target: "_blank", rel: "noreferrer", children: [_jsx(FileSearch, { className: "h-4 w-4" }), "View file"] }) })] }), _jsxs("div", { className: "mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]", children: [_jsx("input", { className: "input", placeholder: "Reviewer note (required if rejecting)", value: rejectReason[p.id] ?? "", onChange: (e) => setRejectReason((r) => ({ ...r, [p.id]: e.target.value })) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { className: "btn-primary", onClick: () => reviewIncome(p.id, "APPROVED"), disabled: acting === p.id, children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), "Approve"] }), _jsxs("button", { className: "btn-danger", onClick: () => reviewIncome(p.id, "REJECTED"), disabled: acting === p.id, children: [_jsx(XCircle, { className: "h-4 w-4" }), "Reject"] })] })] })] }, p.id))) }))] }));
}
