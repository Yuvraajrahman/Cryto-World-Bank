import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Building2, Banknote, Landmark, Users, Activity, MapPin, Plus, Shuffle, RefreshCw, } from "lucide-react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
export function Banks() {
    const role = useSession((s) => s.role);
    const user = useSession((s) => s.user);
    const [data, setData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    async function load() {
        setLoading(true);
        try {
            const [b, s] = await Promise.all([
                api.get("/api/banks"),
                api.get("/api/banks/stats"),
            ]);
            setData(b);
            setStats(s);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
    }, []);
    const national = data?.nationalBanks ?? [];
    const local = data?.localBanks ?? [];
    const localsByNb = useMemo(() => {
        const m = new Map();
        for (const lb of local) {
            if (!lb.parentBankId)
                continue;
            const list = m.get(lb.parentBankId) ?? [];
            list.push(lb);
            m.set(lb.parentBankId, list);
        }
        return m;
    }, [local]);
    const canRegisterNational = role === "OWNER";
    const canRegisterLocal = role === "OWNER" || role === "NATIONAL_BANK_ADMIN";
    const canAllocate = role === "OWNER" || role === "NATIONAL_BANK_ADMIN";
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Network", title: "Bank Hierarchy", description: "The living map of participating institutions \u2014 registered, capitalized, and lending.", right: _jsxs("button", { className: "btn-ghost", onClick: load, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] }) }), _jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
                    {
                        label: "World Bank",
                        value: String(stats?.tiers.world ?? 0),
                        icon: Landmark,
                        hint: `${(data?.worldBank?.reserve ?? 0).toFixed(0)} ETH reserve`,
                    },
                    {
                        label: "National Banks",
                        value: String(stats?.tiers.national ?? 0),
                        icon: Building2,
                        hint: `${national.reduce((a, b) => a + b.reserve, 0).toFixed(0)} ETH capitalized`,
                    },
                    {
                        label: "Local Banks",
                        value: String(stats?.tiers.local ?? 0),
                        icon: Banknote,
                        hint: `${local.reduce((a, b) => a + b.totalLent, 0).toFixed(0)} ETH lent`,
                    },
                    {
                        label: "Borrowers",
                        value: String(stats?.borrowerCount ?? 0),
                        icon: Users,
                        hint: `${stats?.activeLoans ?? 0} active loans`,
                    },
                ].map(({ label, value, icon: Icon, hint }) => (_jsxs("div", { className: "stat card-hover", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "stat-label", children: label }), _jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/20 text-gold-300", children: _jsx(Icon, { className: "h-4 w-4" }) })] }), _jsx("div", { className: "stat-value", children: value }), _jsx("div", { className: "text-xs text-ink-200", children: hint })] }, label))) }), canAllocate ? (_jsx(AllocationPanel, { world: data?.worldBank ?? null, national: national, local: local, onAfter: load, currentBankId: user?.bankId, role: role })) : null, _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Tier 2" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "National Banks" })] }), _jsxs("span", { className: "badge", children: [(national[0]?.aprBps ?? 500) / 100, "% APR from reserve"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-[11px] uppercase tracking-[0.2em] text-ink-200", children: [_jsx("th", { className: "py-2 pr-4", children: "Bank" }), _jsx("th", { className: "py-2 pr-4", children: "Jurisdiction" }), _jsx("th", { className: "py-2 pr-4", children: "Local Banks" }), _jsx("th", { className: "py-2 pr-4", children: "Reserve" }), _jsx("th", { className: "py-2 pr-4", children: "Allocated" }), _jsx("th", { className: "py-2 pr-4", children: "Utilization" })] }) }), _jsxs("tbody", { children: [national.map((b) => {
                                            const util = b.totalAllocated + b.reserve > 0
                                                ? Math.round((b.totalAllocated / (b.totalAllocated + b.reserve)) * 100)
                                                : 0;
                                            return (_jsxs("tr", { className: "border-t border-ink-700/50", children: [_jsx("td", { className: "py-3 pr-4 font-medium text-ink-100", children: b.name }), _jsx("td", { className: "py-3 pr-4", children: _jsxs("span", { className: "inline-flex items-center gap-1.5 text-ink-200", children: [_jsx(MapPin, { className: "h-3.5 w-3.5 text-gold-400" }), b.jurisdiction] }) }), _jsx("td", { className: "py-3 pr-4 text-ink-200", children: (localsByNb.get(b.id) ?? []).length }), _jsxs("td", { className: "py-3 pr-4 font-mono text-ink-100", children: [b.reserve.toFixed(2), " ETH"] }), _jsxs("td", { className: "py-3 pr-4 font-mono text-gold-300", children: [b.totalAllocated.toFixed(2), " ETH"] }), _jsx("td", { className: "py-3 pr-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-1.5 w-28 overflow-hidden rounded-full bg-ink-700", children: _jsx("div", { className: "h-full bg-gradient-to-r from-gold-600 to-gold-400", style: { width: `${util}%` } }) }), _jsxs("span", { className: "text-xs text-ink-200", children: [util, "%"] })] }) })] }, b.id));
                                        }), national.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "py-6 text-center text-xs text-ink-200", children: "No national banks yet." }) })) : null] })] }) })] }), _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Tier 3" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Local Banks" })] }), _jsxs("span", { className: "badge", children: [(local[0]?.aprBps ?? 800) / 100, "% APR from national"] })] }), _jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3", children: [local.map((b) => {
                                const parent = national.find((n) => n.id === b.parentBankId);
                                return (_jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/60 p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "font-medium text-ink-100", children: b.name }), _jsx(Activity, { className: "h-4 w-4 text-gold-400" })] }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: [b.city ? `${b.city} · ` : "", "Parent \u00B7 ", parent?.name ?? "—"] }), _jsxs("div", { className: "mt-3 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-ink-200", children: "Reserve" }), _jsxs("span", { className: "font-mono text-ink-100", children: [b.reserve.toFixed(2), " ETH"] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-ink-200", children: "Lent out" }), _jsxs("span", { className: "font-mono text-gold-300", children: [b.totalLent.toFixed(2), " ETH"] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-ink-200", children: "Repaid" }), _jsxs("span", { className: "font-mono text-emerald-300", children: [b.totalRepaid.toFixed(2), " ETH"] })] })] }, b.id));
                            }), local.length === 0 ? (_jsx("div", { className: "col-span-full text-center text-xs text-ink-200", children: "No local banks registered yet." })) : null] })] }), (canRegisterNational || canRegisterLocal) ? (_jsx(RegisterPanels, { canNational: canRegisterNational, canLocal: canRegisterLocal, national: national, onAfter: load, currentBankId: user?.bankId, role: role })) : null] }));
}
function AllocationPanel({ world, national, local, onAfter, currentBankId, role, }) {
    const isOwner = role === "OWNER";
    const defaultFrom = isOwner ? world?.id ?? "" : currentBankId ?? "";
    const [fromBankId, setFromBankId] = useState(defaultFrom);
    const [toBankId, setToBankId] = useState("");
    const [amount, setAmount] = useState("10");
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        if (!fromBankId)
            setFromBankId(defaultFrom);
    }, [defaultFrom, fromBankId]);
    const sourceOptions = isOwner
        ? world
            ? [world]
            : []
        : national.filter((n) => n.id === currentBankId);
    const targetOptions = isOwner
        ? national
        : local.filter((l) => l.parentBankId === currentBankId);
    async function submit() {
        if (!fromBankId || !toBankId) {
            toast.error("Select source and destination");
            return;
        }
        const amt = Number(amount);
        if (!(amt > 0)) {
            toast.error("Enter a positive amount");
            return;
        }
        try {
            setSubmitting(true);
            await api.post("/api/banks/allocate", {
                fromBankId,
                toBankId,
                amount: amt,
            });
            toast.success(`Allocated ${amt} ETH`);
            onAfter();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Allocation failed");
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Capital flow" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Allocate reserve down the hierarchy" }), _jsx("p", { className: "mt-1 text-sm text-ink-200", children: isOwner
                                    ? "Move funds from the World Reserve to a National Bank."
                                    : "Move funds from your National Bank to one of your Local Banks." })] }), _jsxs("span", { className: "badge-gold", children: [_jsx(Shuffle, { className: "h-3.5 w-3.5" }), isOwner ? "Governor" : "NB Admin"] })] }), _jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "From" }), _jsxs("select", { className: "input", value: fromBankId, onChange: (e) => setFromBankId(e.target.value), children: [_jsx("option", { value: "", children: "Select\u2026" }), sourceOptions.map((b) => (_jsxs("option", { value: b.id, children: [b.name, " \u00B7 ", b.reserve.toFixed(0), " ETH"] }, b.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "To" }), _jsxs("select", { className: "input", value: toBankId, onChange: (e) => setToBankId(e.target.value), children: [_jsx("option", { value: "", children: "Select\u2026" }), targetOptions.map((b) => (_jsx("option", { value: b.id, children: b.name }, b.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Amount (ETH)" }), _jsx("input", { className: "input", inputMode: "decimal", value: amount, onChange: (e) => setAmount(e.target.value) })] }), _jsx("div", { className: "flex items-end", children: _jsxs("button", { className: "btn-primary w-full", onClick: submit, disabled: submitting, children: [_jsx(Shuffle, { className: "h-4 w-4" }), submitting ? "Allocating…" : "Allocate"] }) })] })] }));
}
function RegisterPanels({ canNational, canLocal, national, onAfter, currentBankId, role, }) {
    return (_jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [canNational ? (_jsx(RegisterNationalForm, { onAfter: onAfter })) : null, canLocal ? (_jsx(RegisterLocalForm, { national: national, defaultParentId: role === "NATIONAL_BANK_ADMIN" ? currentBankId : undefined, lockParent: role === "NATIONAL_BANK_ADMIN", onAfter: onAfter })) : null] }));
}
function RegisterNationalForm({ onAfter }) {
    const [name, setName] = useState("");
    const [wallet, setWallet] = useState("");
    const [jurisdiction, setJurisdiction] = useState("");
    const [reserve, setReserve] = useState("0");
    const [submitting, setSubmitting] = useState(false);
    async function submit() {
        if (!name || !wallet || !jurisdiction) {
            toast.error("Fill all fields");
            return;
        }
        try {
            setSubmitting(true);
            await api.post("/api/banks/register-national", {
                name,
                walletAddress: wallet,
                jurisdiction,
                reserve: Number(reserve) || 0,
            });
            toast.success(`Registered ${name}`);
            setName("");
            setWallet("");
            setJurisdiction("");
            setReserve("0");
            onAfter();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Registration failed");
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Plus, { className: "h-4 w-4 text-gold-400" }), "Register a National Bank"] }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Tier 2 onboarding" }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Display name" }), _jsx("input", { className: "input", placeholder: "e.g. Kenya National Bank", value: name, onChange: (e) => setName(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Wallet address" }), _jsx("input", { className: "input font-mono", placeholder: "0x\u2026", value: wallet, onChange: (e) => setWallet(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Jurisdiction" }), _jsx("input", { className: "input", placeholder: "Country", value: jurisdiction, onChange: (e) => setJurisdiction(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Initial reserve (ETH, optional)" }), _jsx("input", { className: "input", inputMode: "decimal", value: reserve, onChange: (e) => setReserve(e.target.value) })] })] }), _jsxs("button", { className: "btn-primary mt-5", onClick: submit, disabled: submitting, children: [_jsx(Plus, { className: "h-4 w-4" }), submitting ? "Registering…" : "Register"] })] }));
}
function RegisterLocalForm({ national, defaultParentId, lockParent, onAfter, }) {
    const [name, setName] = useState("");
    const [wallet, setWallet] = useState("");
    const [jurisdiction, setJurisdiction] = useState("");
    const [city, setCity] = useState("");
    const [parentBankId, setParentBankId] = useState(defaultParentId ?? "");
    const [reserve, setReserve] = useState("0");
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        if (defaultParentId && !parentBankId)
            setParentBankId(defaultParentId);
    }, [defaultParentId, parentBankId]);
    async function submit() {
        if (!name || !wallet || !jurisdiction || !city || !parentBankId) {
            toast.error("Fill all fields");
            return;
        }
        try {
            setSubmitting(true);
            await api.post("/api/banks/register-local", {
                name,
                walletAddress: wallet,
                jurisdiction,
                city,
                parentBankId,
                reserve: Number(reserve) || 0,
            });
            toast.success(`Registered ${name}`);
            setName("");
            setWallet("");
            setCity("");
            setJurisdiction("");
            setReserve("0");
            if (!lockParent)
                setParentBankId("");
            onAfter();
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Registration failed");
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200", children: [_jsx(Plus, { className: "h-4 w-4 text-gold-400" }), "Register a Local Bank"] }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Tier 3 onboarding" }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Parent National Bank" }), _jsxs("select", { className: "input", value: parentBankId, onChange: (e) => setParentBankId(e.target.value), disabled: lockParent, children: [_jsx("option", { value: "", children: "Select\u2026" }), national.map((b) => (_jsx("option", { value: b.id, children: b.name }, b.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Display name" }), _jsx("input", { className: "input", placeholder: "e.g. Rajshahi Local Bank", value: name, onChange: (e) => setName(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Wallet address" }), _jsx("input", { className: "input font-mono", placeholder: "0x\u2026", value: wallet, onChange: (e) => setWallet(e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Jurisdiction" }), _jsx("input", { className: "input", placeholder: "Country", value: jurisdiction, onChange: (e) => setJurisdiction(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "City" }), _jsx("input", { className: "input", placeholder: "City", value: city, onChange: (e) => setCity(e.target.value) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Initial reserve (ETH, optional)" }), _jsx("input", { className: "input", inputMode: "decimal", value: reserve, onChange: (e) => setReserve(e.target.value) })] })] }), _jsxs("button", { className: "btn-primary mt-5", onClick: submit, disabled: submitting, children: [_jsx(Plus, { className: "h-4 w-4" }), submitting ? "Registering…" : "Register"] })] }));
}
