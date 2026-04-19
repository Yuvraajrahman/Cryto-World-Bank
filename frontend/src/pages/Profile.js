import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { shortAddress, formatDateTime } from "@/lib/utils";
import { UploadCloud, CheckCircle2, ShieldCheck, Copy, FileText, Clock, AlertCircle, CircleDollarSign, } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
export function Profile() {
    const { chain } = useAccount();
    const user = useSession((s) => s.user);
    const setUser = useSession((s) => s.setUser);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ displayName: "", email: "", country: "Bangladesh" });
    const [monthlyIncomeUsd, setMonthlyIncomeUsd] = useState("");
    async function load() {
        setLoading(true);
        try {
            const r = await api.get("/api/profile");
            setProfile(r);
            setForm({
                displayName: r.user.displayName ?? "",
                email: r.user.email ?? "",
                country: r.user.country ?? "Bangladesh",
            });
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
    }, []);
    async function save() {
        setSaving(true);
        try {
            const r = await api.put("/api/profile", form);
            toast.success("Profile saved");
            setUser({ ...user, ...r.user });
            await load();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed");
        }
        finally {
            setSaving(false);
        }
    }
    function handleFileChange(e) {
        const f = e.target.files?.[0];
        if (!f)
            return;
        if (f.size > 10 * 1024 * 1024) {
            toast.error("File exceeds 10MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            const dataUrl = reader.result;
            const base64 = dataUrl.split(",")[1];
            setUploading(true);
            try {
                await api.post("/api/income/upload", {
                    fileName: f.name,
                    mimeType: f.type,
                    contentBase64: base64,
                    monthlyIncomeUsd: monthlyIncomeUsd ? Number(monthlyIncomeUsd) : undefined,
                });
                toast.success("Income proof uploaded — pending review");
                await load();
            }
            catch (err) {
                toast.error(err instanceof Error ? err.message : "Upload failed");
            }
            finally {
                setUploading(false);
                e.target.value = "";
            }
        };
        reader.readAsDataURL(f);
    }
    const verif = profile?.incomeVerification;
    const verifBadge = (() => {
        switch (verif?.status) {
            case "APPROVED":
                return "badge-green";
            case "PENDING":
                return "badge-gold";
            case "REJECTED":
                return "badge-red";
            default:
                return "badge";
        }
    })();
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Identity", title: "Your Profile", description: "Your wallet is your identity. Profile metadata and income verification unlock higher loan tiers." }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [_jsxs("div", { className: "card p-6 lg:col-span-2", children: [_jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Display name" }), _jsx("input", { className: "input", value: form.displayName, onChange: (e) => setForm((f) => ({ ...f, displayName: e.target.value })), placeholder: "Your name" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Email" }), _jsx("input", { className: "input", placeholder: "you@example.com", type: "email", value: form.email, onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Country" }), _jsxs("select", { className: "input", value: form.country, onChange: (e) => setForm((f) => ({ ...f, country: e.target.value })), children: [_jsx("option", { children: "Bangladesh" }), _jsx("option", { children: "Nigeria" }), _jsx("option", { children: "Indonesia" }), _jsx("option", { children: "Other" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Role" }), _jsxs("div", { className: "input flex items-center justify-between", children: [_jsx("span", { children: (user?.role ?? "GUEST").replace(/_/g, " ") }), _jsxs("span", { className: "badge-gold", children: [_jsx(ShieldCheck, { className: "h-3.5 w-3.5" }), user?.role === "BORROWER"
                                                                ? "Tier 4"
                                                                : user?.role === "LOCAL_BANK_ADMIN" || user?.role === "APPROVER"
                                                                    ? "Tier 3"
                                                                    : user?.role === "NATIONAL_BANK_ADMIN"
                                                                        ? "Tier 2"
                                                                        : "Tier 1"] })] })] })] }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx("button", { className: "btn-primary", onClick: save, disabled: saving || loading, children: saving ? "Saving…" : "Save changes" }), _jsx("button", { className: "btn-ghost", onClick: load, disabled: loading, children: "Reload" })] })] }), _jsxs("div", { className: "card p-6", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Wallet" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: shortAddress(user?.wallet, 6) }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: ["Network: ", _jsx("span", { className: "text-gold-300", children: chain?.name ?? "Testnet (demo)" })] }), _jsxs("div", { className: "mt-4 flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2.5", children: [_jsx("span", { className: "truncate font-mono text-xs text-ink-100", children: user?.wallet ?? "—" }), _jsxs("button", { className: "ml-2 inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200", onClick: () => {
                                            if (user?.wallet) {
                                                navigator.clipboard.writeText(user.wallet);
                                                toast.success("Address copied");
                                            }
                                        }, children: [_jsx(Copy, { className: "h-3.5 w-3.5" }), "Copy"] })] }), _jsx("div", { className: "divider my-5" }), _jsxs("ul", { className: "space-y-2 text-sm", children: [_jsxs("li", { className: "flex items-center justify-between text-ink-200", children: [_jsx("span", { children: "Session" }), _jsx("span", { className: "badge-green", children: "Active" })] }), _jsxs("li", { className: "flex items-center justify-between text-ink-200", children: [_jsx("span", { children: "Role on-chain" }), _jsx("span", { className: "badge-gold", children: (user?.role ?? "GUEST").replace(/_/g, " ") })] }), _jsxs("li", { className: "flex items-center justify-between text-ink-200", children: [_jsx("span", { children: "Bank" }), _jsx("span", { className: "badge", children: profile?.bank?.name ?? "—" })] })] })] })] }), user?.role === "BORROWER" && profile?.limits ? (_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Borrowing limits" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Your current capacity" }), _jsx("p", { className: "mt-1 text-sm text-ink-200", children: "Limits reset on a rolling 6-month and 1-year window, recomputed on every approval, installment payment, and nightly cron." })] }), profile.limits.exceptionApplied ? (_jsxs("span", { className: "badge-green", children: [_jsx(CheckCircle2, { className: "h-3.5 w-3.5" }), "1.5x good-history multiplier"] })) : null] }), _jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [_jsx(LimitCard, { label: "6-month", data: profile.limits.sixMonth }), _jsx(LimitCard, { label: "1-year", data: profile.limits.oneYear }), _jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/60 p-4", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Active loans" }), _jsxs("div", { className: "mt-1 font-display text-2xl font-semibold text-ink-100", children: [profile.limits.activeLoanCount, " / ", profile.limits.maxActiveLoans] }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: ["Consecutive paid: ", user?.consecutivePaidLoans ?? 0] })] })] })] })) : null, user?.role === "BORROWER" ? (_jsxs("div", { className: "card p-6", children: [_jsx("div", { className: "mb-1 text-xs uppercase tracking-[0.22em] text-ink-200", children: "Income Verification" }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Raise your borrowing ceiling" }), _jsx("p", { className: "mt-1 max-w-2xl text-sm text-ink-200", children: "Upload proof of monthly income (bank statement, payslip, or invoices). An approver will review and countersign \u2014 your verified status unlocks first-time lending and higher caps." })] }), _jsxs("span", { className: verifBadge, children: [verif?.status === "APPROVED" ? (_jsx(CheckCircle2, { className: "h-3.5 w-3.5" })) : verif?.status === "PENDING" ? (_jsx(Clock, { className: "h-3.5 w-3.5" })) : verif?.status === "REJECTED" ? (_jsx(AlertCircle, { className: "h-3.5 w-3.5" })) : null, verif?.status ?? "UNSUBMITTED"] })] }), verif && verif.status !== "UNSUBMITTED" ? (_jsxs("div", { className: "mt-4 rounded-xl border border-ink-600/60 bg-ink-900/60 p-4 text-sm text-ink-200", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-gold-400" }), _jsx("span", { className: "truncate text-ink-100", children: verif.fileName })] }), verif.monthlyIncomeUsd ? (_jsxs("div", { className: "mt-1 flex items-center gap-1.5 text-xs", children: [_jsx(CircleDollarSign, { className: "h-3.5 w-3.5 text-gold-400" }), "Verified monthly income:", " ", _jsxs("span", { className: "font-mono text-ink-100", children: ["$", verif.monthlyIncomeUsd.toLocaleString()] })] })) : null, verif.createdAt ? (_jsxs("div", { className: "mt-0.5 text-xs", children: ["Uploaded ", formatDateTime(verif.createdAt), verif.reviewedAt ? ` · Reviewed ${formatDateTime(verif.reviewedAt)}` : ""] })) : null, verif.notes ? (_jsxs("div", { className: "mt-2 rounded-lg border border-ink-600/60 bg-ink-950/60 p-2 text-xs text-ink-200", children: ["Reviewer note: ", verif.notes] })) : null] })) : null, _jsxs("div", { className: "mt-6 grid grid-cols-1 gap-6 md:grid-cols-3", children: [_jsxs("label", { className: "relative rounded-2xl border-2 border-dashed border-ink-500/70 bg-ink-900/60 p-6 text-center md:col-span-2 cursor-pointer hover:border-gold-700/40 hover:bg-gold-900/10 transition-colors", children: [_jsx(UploadCloud, { className: "mx-auto h-8 w-8 text-gold-400" }), _jsx("div", { className: "mt-2 font-medium text-ink-100", children: "Drop a PDF or image" }), _jsx("div", { className: "text-xs text-ink-200", children: "Up to 10 MB \u00B7 PDF / PNG / JPG" }), _jsx("button", { className: "btn-primary mt-4", type: "button", disabled: true, children: uploading ? "Uploading…" : "Browse files" }), _jsx("input", { type: "file", accept: "application/pdf,image/png,image/jpeg,image/jpg", className: "absolute inset-0 cursor-pointer opacity-0", onChange: handleFileChange, disabled: uploading })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Monthly income (USD, optional)" }), _jsx("input", { className: "input", placeholder: "e.g. 1400", value: monthlyIncomeUsd, onChange: (e) => setMonthlyIncomeUsd(e.target.value) })] }), _jsx("div", { className: "space-y-2 text-xs", children: [
                                            "Valid ID cross-check",
                                            "3-month income window",
                                            "Wallet-signed submission",
                                            "Approver countersign",
                                        ].map((x) => (_jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2 text-ink-200", children: [_jsx(CheckCircle2, { className: "h-4 w-4 text-gold-400" }), x] }, x))) })] })] })] })) : null, profile?.transactions && profile.transactions.length > 0 ? (_jsxs("div", { className: "card p-6", children: [_jsx("div", { className: "mb-4 flex items-center justify-between", children: _jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Transactions" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Recent ledger entries" })] }) }), _jsx("ul", { className: "space-y-2 text-sm", children: profile.transactions.slice(0, 10).map((t) => (_jsxs("li", { className: "flex items-center justify-between rounded-lg border border-ink-600/50 bg-ink-900/50 px-3 py-2.5", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-ink-100", children: t.type.replace(/_/g, " ") }), _jsxs("div", { className: "text-xs text-ink-200", children: [formatDateTime(t.at), t.note ? ` · ${t.note}` : "", t.txHash ? (_jsxs("span", { className: "ml-2 font-mono text-ink-300", children: ["tx ", t.txHash.slice(0, 10), "\u2026"] })) : null] })] }), _jsxs("span", { className: "font-mono text-gold-300", children: [t.type === "INSTALLMENT_PAID" || t.type === "LOAN_REPAID" ? "-" : "+", t.amount.toFixed(4), " ETH"] })] }, t.id))) })] })) : null] }));
}
function LimitCard({ label, data, }) {
    const pct = data.limit > 0 ? Math.round((data.borrowed / data.limit) * 100) : 0;
    return (_jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/60 p-4", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: label }), _jsxs("div", { className: "mt-1 font-display text-2xl font-semibold text-ink-100", children: [data.remaining.toFixed(2), " / ", data.limit.toFixed(2), " ETH"] }), _jsx("div", { className: "mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700", children: _jsx("div", { className: "h-full bg-gradient-to-r from-gold-600 to-gold-400", style: { width: `${pct}%` } }) }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: ["Used ", data.borrowed.toFixed(2), " ETH (", pct, "%)"] })] }));
}
