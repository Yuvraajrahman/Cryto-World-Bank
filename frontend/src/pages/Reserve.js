import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAccount, useBalance, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import toast from "react-hot-toast";
import { ArrowDownToLine, ArrowUpFromLine, Landmark, Lock, AlertTriangle, RefreshCw, } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { contractAddresses, worldBankAbi } from "@/lib/contracts";
import { api } from "@/lib/api";
export function Reserve() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
    const [amount, setAmount] = useState("0.1");
    const [allocateAmount, setAllocateAmount] = useState("0.05");
    const [withdrawAmount, setWithdrawAmount] = useState("0.01");
    const [withdrawTo, setWithdrawTo] = useState("");
    const [loading, setLoading] = useState(false);
    const [world, setWorld] = useState(null);
    const [national, setNational] = useState([]);
    const [stats, setStats] = useState(null);
    const worldBankAddr = contractAddresses.worldBank;
    const nationalBankAddr = contractAddresses.nationalBank;
    const contractsReady = Boolean(worldBankAddr && nationalBankAddr);
    const { data: onChainStats, refetch: refetchOnChain } = useReadContract({
        address: worldBankAddr || undefined,
        abi: worldBankAbi,
        functionName: "systemStats",
        query: { enabled: Boolean(worldBankAddr) },
    });
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
            await refetchOnChain();
        }
        finally {
            setLoading(false);
        }
    }
    const { data: worldPaused } = useReadContract({
        address: worldBankAddr || undefined,
        abi: worldBankAbi,
        functionName: "paused",
        query: { enabled: Boolean(worldBankAddr) },
    });
    function emergencyWithdraw() {
        if (!worldBankAddr || !withdrawTo) {
            toast.error("Set recipient address");
            return;
        }
        if (!worldPaused) {
            toast.error("Pause the World Bank first (Admin → Pause)");
            return;
        }
        try {
            writeContract({
                address: worldBankAddr,
                abi: worldBankAbi,
                functionName: "emergencyWithdraw",
                args: [withdrawTo, parseEther(withdrawAmount)],
            });
        }
        catch {
            toast.error("Invalid amount");
        }
    }
    useEffect(() => {
        load();
    }, []);
    useEffect(() => {
        if (address && !withdrawTo)
            setWithdrawTo(address);
    }, [address, withdrawTo]);
    useEffect(() => {
        if (writeError) {
            toast.error(writeError.message.slice(0, 120));
            reset();
        }
    }, [writeError, reset]);
    useEffect(() => {
        if (isConfirmed) {
            toast.success("Transaction confirmed on-chain");
            load();
            reset();
        }
    }, [isConfirmed, reset]);
    function deposit() {
        if (!worldBankAddr) {
            toast.error("Set VITE_WORLD_BANK_ADDRESS (run deploy + sync:env)");
            return;
        }
        if (!isConnected) {
            toast.error("Connect your wallet first");
            return;
        }
        try {
            writeContract({
                address: worldBankAddr,
                abi: worldBankAbi,
                functionName: "deposit",
                value: parseEther(amount),
            });
        }
        catch {
            toast.error("Invalid amount");
        }
    }
    function allocateToNational() {
        if (!worldBankAddr || !nationalBankAddr) {
            toast.error("Deploy contracts and run npm run sync:env");
            return;
        }
        if (!isConnected) {
            toast.error("Connect your wallet first");
            return;
        }
        try {
            writeContract({
                address: worldBankAddr,
                abi: worldBankAbi,
                functionName: "allocate",
                args: [nationalBankAddr, parseEther(allocateAmount)],
            });
        }
        catch {
            toast.error("Invalid allocation amount");
        }
    }
    const onChainReserve = onChainStats
        ? Number(formatEther(onChainStats[0]))
        : null;
    const onChainDeposits = onChainStats
        ? Number(formatEther(onChainStats[1]))
        : null;
    const onChainAllocated = onChainStats
        ? Number(formatEther(onChainStats[2]))
        : null;
    const totalDeposits = onChainDeposits ?? stats?.totalDeposits ?? 0;
    const totalAllocated = onChainAllocated ?? world?.totalAllocated ?? 0;
    const reserve = onChainReserve ?? world?.reserve ?? 0;
    const aprPct = ((world?.aprBps ?? 300) / 100).toFixed(2);
    const busy = isPending || isConfirming;
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Tier 1", title: "World Bank Reserve", description: "The global custody contract. Every deposit is a public on-chain record; every allocation is gated by the Governor role.", right: _jsxs(_Fragment, { children: [_jsxs("button", { className: "btn-ghost", onClick: load, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] }), _jsxs("span", { className: "badge-gold", children: [_jsx(Lock, { className: "h-3.5 w-3.5" }), contractsReady ? "On-chain" : "Configure addresses"] })] }) }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx(Stat, { label: "Reserve Balance", value: `${reserve.toFixed(4)} ETH`, icon: Landmark, hint: "on-chain" }), _jsx(Stat, { label: "Total Deposits", value: `${totalDeposits.toFixed(4)} ETH`, hint: "lifetime" }), _jsx(Stat, { label: "Total Allocated", value: `${totalAllocated.toFixed(4)} ETH`, hint: `to ${stats?.tiers.national ?? 0} national bank${stats?.tiers.national === 1 ? "" : "s"}` }), _jsx(Stat, { label: "Lending APR", value: `${aprPct}%`, hint: "Tier 1 \u2192 Tier 2" })] }), _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-5", children: [_jsxs("div", { className: "card p-6 lg:col-span-3 space-y-6", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Action" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Contribute to the reserve" }), _jsx("p", { className: "mt-1 text-sm text-ink-200", children: "Deposits are signed by your wallet and recorded on-chain. Use the deployer wallet (governor) to allocate capital downstream." })] }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Deposit amount (ETH)" }), _jsx("input", { className: "input", value: amount, onChange: (e) => setAmount(e.target.value), inputMode: "decimal" }), _jsxs("div", { className: "mt-1 text-xs text-ink-200", children: ["Wallet:", " ", _jsxs("span", { className: "font-mono text-ink-100", children: [balance ? Number(balance.formatted).toFixed(4) : "0.0000", " ", balance?.symbol ?? "ETH"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "World Bank contract" }), _jsxs("div", { className: "input flex items-center justify-between", children: [_jsx("span", { className: "truncate font-mono text-xs text-ink-100", children: worldBankAddr || "run npm run sync:env" }), _jsx("span", { className: "badge", children: "Reserve" })] })] })] }), _jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/40 p-4", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-ink-200", children: "Governor action" }), _jsxs("div", { className: "mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Allocate to National Bank (ETH)" }), _jsx("input", { className: "input", value: allocateAmount, onChange: (e) => setAllocateAmount(e.target.value), inputMode: "decimal" })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { className: "btn-primary w-full", disabled: busy || !contractsReady, onClick: allocateToNational, children: "Allocate downstream" }) })] }), _jsxs("p", { className: "mt-2 text-xs text-ink-200", children: ["Requires GOVERNOR_ROLE on WorldBankReserve. National:", " ", _jsx("span", { className: "font-mono", children: nationalBankAddr || "—" })] })] }), _jsx("div", { className: "flex items-center justify-between rounded-xl border border-gold-700/30 bg-gold-900/10 px-4 py-3 text-xs text-gold-200", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), "Testnet only \u2014 never send real funds you cannot lose."] }) }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { className: "btn-primary", disabled: busy || !contractsReady, onClick: deposit, children: [_jsx(ArrowDownToLine, { className: "h-4 w-4" }), busy ? "Confirm in wallet…" : "Deposit on-chain"] }), _jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-end", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "label", children: "Emergency withdraw (paused only)" }), _jsx("input", { className: "input mb-2", value: withdrawAmount, onChange: (e) => setWithdrawAmount(e.target.value) }), _jsx("input", { className: "input font-mono text-xs", value: withdrawTo, onChange: (e) => setWithdrawTo(e.target.value), placeholder: "Recipient 0x\u2026" })] }), _jsxs("button", { className: "btn-ghost", disabled: busy || !contractsReady || !worldPaused, onClick: emergencyWithdraw, children: [_jsx(ArrowUpFromLine, { className: "h-4 w-4" }), "Withdraw"] })] })] })] }), _jsxs("div", { className: "card p-6 lg:col-span-2", children: [_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Registry" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Active National Banks" })] }), _jsxs("div", { className: "space-y-2.5", children: [national.length === 0 ? (_jsx("div", { className: "text-xs text-ink-200", children: "No national banks in API store." })) : null, national.map((b) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2.5", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-ink-100", children: b.name }), _jsxs("div", { className: "text-xs text-ink-200", children: ["Jurisdiction \u00B7 ", b.jurisdiction ?? "—"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs uppercase tracking-[0.16em] text-ink-200", children: "Allocated" }), _jsxs("div", { className: "font-mono text-sm text-gold-300", children: [b.totalAllocated.toFixed(2), " ETH"] })] })] }, b.id)))] })] })] })] }));
}
