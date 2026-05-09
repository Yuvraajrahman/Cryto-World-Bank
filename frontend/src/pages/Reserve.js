import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { parseEther } from "viem";
import toast from "react-hot-toast";
import { ArrowDownToLine, ArrowUpFromLine, Landmark, Lock, AlertTriangle, RefreshCw, } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { contractAddresses } from "@/lib/contracts";
import { api } from "@/lib/api";
export function Reserve() {
    const { address } = useAccount();
    const { data: balance } = useBalance({ address });
    const [amount, setAmount] = useState("0.1");
    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [world, setWorld] = useState(null);
    const [national, setNational] = useState([]);
    const [stats, setStats] = useState(null);
    const worldBankAddr = contractAddresses.worldBank;
    async function load() {
        setLoading(true);
        try {
            const [b, s] = await Promise.all([
                api.get("/api/banks"),
                api.get("/api/banks/stats"),
            ]);
            setWorld(b.worldBank);
            setNational(b.nationalBanks);
            setStats(s);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
    }, []);
    async function deposit() {
        try {
            setPending(true);
            parseEther(amount); // validation
            await new Promise((r) => setTimeout(r, 900));
            toast.success(`Deposit of ${amount} ETH queued. Contract signer is required on-chain — this demo records the intent only.`);
        }
        catch {
            toast.error("Invalid amount");
        }
        finally {
            setPending(false);
        }
    }
    const totalDeposits = stats?.totalDeposits ?? 0;
    const totalAllocated = world?.totalAllocated ?? 0;
    const reserve = world?.reserve ?? 0;
    const aprPct = ((world?.aprBps ?? 300) / 100).toFixed(2);
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Tier 1", title: "World Bank Reserve", description: "The global custody contract. Every deposit is a public on-chain record; every allocation is gated by the Governor role.", right: _jsxs(_Fragment, { children: [_jsxs("button", { className: "btn-ghost", onClick: load, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] }), _jsxs("span", { className: "badge-gold", children: [_jsx(Lock, { className: "h-3.5 w-3.5" }), worldBankAddr ? "Connected" : "Demo mode"] })] }) }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx(Stat, { label: "Reserve Balance", value: `${reserve.toFixed(2)} ETH`, icon: Landmark, hint: "on-chain" }), _jsx(Stat, { label: "Total Deposits", value: `${totalDeposits.toFixed(2)} ETH`, hint: "lifetime" }), _jsx(Stat, { label: "Total Allocated", value: `${totalAllocated.toFixed(2)} ETH`, hint: `to ${stats?.tiers.national ?? 0} national bank${stats?.tiers.national === 1 ? "" : "s"}` }), _jsx(Stat, { label: "Lending APR", value: `${aprPct}%`, hint: "Tier 1 \u2192 Tier 2" })] }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-5", children: [_jsxs("div", { className: "card p-6 lg:col-span-3", children: [_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Action" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Contribute to the reserve" }), _jsx("p", { className: "mt-1 text-sm text-ink-200", children: "Deposits immediately become lendable capital. The transaction is signed by your wallet \u2014 the platform never custodies your funds." })] }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Amount (ETH)" }), _jsx("input", { className: "input", value: amount, onChange: (e) => setAmount(e.target.value), inputMode: "decimal" }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: ["Wallet:", " ", _jsxs("span", { className: "font-mono text-ink-100", children: [balance ? Number(balance.formatted).toFixed(4) : "0.0000", " ", balance?.symbol ?? "ETH"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Destination" }), _jsxs("div", { className: "input flex items-center justify-between", children: [_jsx("span", { className: "font-mono text-xs text-ink-100", children: worldBankAddr ?? world?.walletAddress ?? "0x…set VITE_WORLD_BANK_ADDRESS" }), _jsx("span", { className: "badge", children: "Reserve" })] }), _jsx("div", { className: "mt-1 text-xs text-ink-200", children: "Tier 1 smart contract" })] })] }), _jsx("div", { className: "mt-6 flex items-center justify-between rounded-xl border border-gold-700/30 bg-gold-900/10 px-4 py-3 text-xs text-gold-200", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), "Testnet only \u2014 never send real ETH to this contract."] }) }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsxs("button", { className: "btn-primary", disabled: pending, onClick: deposit, children: [_jsx(ArrowDownToLine, { className: "h-4 w-4" }), pending ? "Submitting…" : "Deposit"] }), _jsxs("button", { className: "btn-ghost", disabled: true, children: [_jsx(ArrowUpFromLine, { className: "h-4 w-4" }), "Withdraw (governor only)"] })] })] }), _jsxs("div", { className: "card p-6 lg:col-span-2", children: [_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Registry" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Active National Banks" })] }), _jsxs("div", { className: "space-y-2.5", children: [national.length === 0 ? (_jsx("div", { className: "text-xs text-ink-200", children: "No national banks registered." })) : null, national.map((b) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2.5", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-ink-100", children: b.name }), _jsxs("div", { className: "text-xs text-ink-200", children: ["Jurisdiction \u00B7 ", b.jurisdiction ?? "—"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.16em] text-ink-200", children: "Outstanding" }), _jsxs("div", { className: "font-mono text-sm text-gold-300", children: [b.totalLent.toFixed(2), " ETH"] })] })] }, b.id)))] })] })] })] }));
}
