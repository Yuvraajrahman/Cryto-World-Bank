import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import toast from "react-hot-toast";
import { PiggyBank, Users, ArrowLeftRight, RefreshCw, Landmark, } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { contractAddresses, savingsVaultAbi, groupLendingAbi, interBankAbi, mockUsdcAbi, } from "@/lib/contracts";
import { contractsConfigured } from "@/lib/onChain";
import { useOnChainTx } from "@/hooks/useOnChainTx";
export function Facilities() {
    const role = useSession((s) => s.role);
    const { address, isConnected } = useAccount();
    const onChain = contractsConfigured();
    const { write, busy } = useOnChainTx(() => load());
    const [savingsAmount, setSavingsAmount] = useState("0.05");
    const [savingsBalance, setSavingsBalance] = useState("0");
    const [savingsShares, setSavingsShares] = useState("0");
    const [withdrawShares, setWithdrawShares] = useState("");
    const [musdcMintAmount, setMusdcMintAmount] = useState("1000");
    const [groups, setGroups] = useState([]);
    const [iblpLoans, setIblpLoans] = useState([]);
    const [upward, setUpward] = useState([]);
    const [memberWallet, setMemberWallet] = useState("");
    const [groupId, setGroupId] = useState("1");
    const [iblpBorrower, setIblpBorrower] = useState("");
    const [iblpAmount, setIblpAmount] = useState("0.05");
    const [loading, setLoading] = useState(false);
    async function load() {
        setLoading(true);
        try {
            if (address) {
                const s = await api
                    .get(`/api/phase2/savings/${address}`)
                    .catch(() => null);
                setSavingsBalance(s?.onChain?.balanceEth ?? "0");
                setSavingsShares(s?.onChain?.shares ?? "0");
                if (!withdrawShares && s?.onChain?.shares)
                    setWithdrawShares(s.onChain.shares);
            }
            const g = await api.get("/api/phase2/groups").catch(() => ({ onChain: [] }));
            setGroups(g.onChain ?? []);
            const ib = await api
                .get(iblpBorrower
                ? `/api/phase2/interbank/loans?borrower=${iblpBorrower}`
                : "/api/phase2/interbank/loans")
                .catch(() => ({ onChain: [] }));
            setIblpLoans(ib.onChain ?? []);
            const u = await api.get("/api/phase2/upward-deposits").catch(() => ({ deposits: [] }));
            setUpward(u.deposits ?? []);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);
    function depositSavings() {
        if (!isConnected || !contractAddresses.savingsVault) {
            toast.error("Connect wallet and run phase2:local");
            return;
        }
        const assets = parseEther(savingsAmount);
        write({
            address: contractAddresses.savingsVault,
            abi: savingsVaultAbi,
            functionName: "deposit",
            args: [assets],
            value: assets,
        });
    }
    function createGroup() {
        if (!contractAddresses.groupLendingPool || !contractAddresses.localBank)
            return;
        write({
            address: contractAddresses.groupLendingPool,
            abi: groupLendingAbi,
            functionName: "createGroup",
            args: [contractAddresses.localBank],
        });
    }
    function addGroupMember() {
        if (!contractAddresses.groupLendingPool || !memberWallet)
            return;
        write({
            address: contractAddresses.groupLendingPool,
            abi: groupLendingAbi,
            functionName: "addMember",
            args: [BigInt(groupId), memberWallet],
        });
    }
    function consentGroup() {
        if (!contractAddresses.groupLendingPool)
            return;
        write({
            address: contractAddresses.groupLendingPool,
            abi: groupLendingAbi,
            functionName: "recordConsent",
            args: [BigInt(groupId)],
        });
    }
    function withdrawSavings() {
        if (!isConnected || !contractAddresses.savingsVault || !withdrawShares) {
            toast.error("Enter shares to withdraw");
            return;
        }
        write({
            address: contractAddresses.savingsVault,
            abi: savingsVaultAbi,
            functionName: "withdraw",
            args: [BigInt(withdrawShares)],
        });
    }
    function mintMusdc() {
        if (!isConnected || !contractAddresses.mockUsdc || !address) {
            toast.error("Connect wallet (world governor / minter)");
            return;
        }
        const amount = BigInt(Math.floor(Number(musdcMintAmount) * 1000000));
        write({
            address: contractAddresses.mockUsdc,
            abi: mockUsdcAbi,
            functionName: "mint",
            args: [address, amount],
        });
    }
    function iblpRepay(loanId, principalEth, tenorDays) {
        if (!contractAddresses.interBankLendingPool || !isConnected)
            return;
        const principal = parseEther(principalEth);
        const interest = (principal * 400n * BigInt(tenorDays)) / (10000n * 365n);
        const owed = principal + interest;
        write({
            address: contractAddresses.interBankLendingPool,
            abi: interBankAbi,
            functionName: "repay",
            args: [BigInt(loanId)],
            value: owed,
        });
    }
    function iblpBorrow() {
        if (!contractAddresses.interBankLendingPool || !iblpBorrower)
            return;
        const principal = parseEther(iblpAmount);
        write({
            address: contractAddresses.interBankLendingPool,
            abi: interBankAbi,
            functionName: "borrow",
            args: [iblpBorrower, principal, 7],
            value: principal,
        });
    }
    const canManageGroup = role === "LOCAL_BANK_ADMIN" || role === "OWNER" || role === "APPROVER";
    const canIblp = role === "NATIONAL_BANK_ADMIN" || role === "LOCAL_BANK_ADMIN" || role === "OWNER";
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Phase II", title: "Banking Facilities", description: "Savings vault, group lending pools, interbank liquidity, and upward funding history.", right: _jsxs("button", { className: "btn-ghost", onClick: load, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"] }) }), !onChain ? (_jsxs("div", { className: "card p-6 text-sm text-amber-200", children: ["Run ", _jsx("code", { className: "font-mono", children: "npm run phase2:local" }), " and restart the frontend."] })) : null, _jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [_jsxs("div", { className: "card p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(PiggyBank, { className: "h-5 w-5 text-gold-400" }), _jsx("div", { className: "font-display text-lg font-semibold text-ink-100", children: "Savings Vault" })] }), _jsx("p", { className: "text-sm text-ink-200", children: "ETH savings with simplified yield accrual." }), _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-label", children: "Your balance" }), _jsxs("div", { className: "stat-value", children: [Number(savingsBalance).toFixed(4), " ETH"] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Deposit (ETH)" }), _jsx("input", { className: "input", value: savingsAmount, onChange: (e) => setSavingsAmount(e.target.value) })] }), _jsx("button", { className: "btn-primary", onClick: depositSavings, disabled: busy, children: "Deposit to vault" }), _jsxs("div", { className: "border-t border-ink-700/50 pt-4 space-y-2", children: [_jsx("label", { className: "label", children: "Withdraw shares" }), _jsx("input", { className: "input", value: withdrawShares, onChange: (e) => setWithdrawShares(e.target.value), placeholder: savingsShares }), _jsx("button", { className: "btn-ghost w-full", onClick: withdrawSavings, disabled: busy, children: "Withdraw savings" })] })] }), _jsxs("div", { className: "card p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(PiggyBank, { className: "h-5 w-5 text-gold-400" }), _jsx("div", { className: "font-display text-lg font-semibold text-ink-100", children: "MockUSDC (mUSDC)" })] }), _jsx("p", { className: "text-sm text-ink-200", children: "Phase I testnet stablecoin \u2014 mint as world governor (minter)." }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Mint amount (mUSDC)" }), _jsx("input", { className: "input", value: musdcMintAmount, onChange: (e) => setMusdcMintAmount(e.target.value) })] }), _jsx("button", { className: "btn-primary", onClick: mintMusdc, disabled: busy, children: "Mint to my wallet" })] }), _jsxs("div", { className: "card p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Landmark, { className: "h-5 w-5 text-gold-400" }), _jsx("div", { className: "font-display text-lg font-semibold text-ink-100", children: "Upward deposits" })] }), _jsx("p", { className: "text-sm text-ink-200", children: "Recent voluntary funding toward parent institutions." }), _jsx("ul", { className: "max-h-40 space-y-2 overflow-y-auto text-sm", children: upward.length === 0 ? (_jsx("li", { className: "text-ink-200", children: "No indexed deposits yet." })) : (upward.map((d, i) => {
                                    const row = d;
                                    return (_jsxs("li", { className: "font-mono text-xs text-ink-100", children: [row.depositorId?.slice(0, 10), "\u2026 \u2192", " ", (Number(row.amountWei ?? 0) / 1e18).toFixed(4), " ETH"] }, i));
                                })) })] })] }), canManageGroup ? (_jsxs("div", { className: "card p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5 text-gold-400" }), _jsx("div", { className: "font-display text-lg font-semibold text-ink-100", children: "Group Lending" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { className: "btn-primary", onClick: createGroup, disabled: busy, children: "Create group" }), _jsx("input", { className: "input w-24", value: groupId, onChange: (e) => setGroupId(e.target.value), placeholder: "Group #" }), _jsx("input", { className: "input flex-1 min-w-[200px]", value: memberWallet, onChange: (e) => setMemberWallet(e.target.value), placeholder: "Member wallet" }), _jsx("button", { className: "btn-ghost", onClick: addGroupMember, disabled: busy, children: "Add member" }), _jsx("button", { className: "btn-ghost", onClick: consentGroup, disabled: busy, children: "Record my consent" })] }), _jsx("div", { className: "grid gap-2 md:grid-cols-2", children: groups.map((g) => {
                            const row = g;
                            return (_jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/60 p-3 text-sm", children: ["Group #", row.id, " \u00B7 ", row.memberCount, " members \u00B7 ", row.consentCount, " consents \u00B7 status ", row.status] }, row.id));
                        }) })] })) : null, canIblp ? (_jsxs("div", { className: "card p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ArrowLeftRight, { className: "h-5 w-5 text-gold-400" }), _jsx("div", { className: "font-display text-lg font-semibold text-ink-100", children: "Inter-bank lending (IBLP)" })] }), _jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-3", children: [_jsx("input", { className: "input", value: iblpBorrower, onChange: (e) => setIblpBorrower(e.target.value), placeholder: "Borrower bank address" }), _jsx("input", { className: "input", value: iblpAmount, onChange: (e) => setIblpAmount(e.target.value), placeholder: "ETH" }), _jsx("button", { className: "btn-primary", onClick: iblpBorrow, disabled: busy, children: "Lend (7-day tenor)" })] }), _jsx("ul", { className: "space-y-2 text-sm", children: iblpLoans.map((l) => {
                            const row = l;
                            return (_jsxs("li", { className: "flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-ink-100", children: [_jsxs("span", { children: ["Loan #", row.id, " \u00B7 ", row.principalEth, " ETH \u2192 ", row.borrower.slice(0, 10), "\u2026 \u00B7 status", " ", row.status] }), row.status === 0 ? (_jsx("button", { className: "btn-ghost text-xs", onClick: () => iblpRepay(row.id, row.principalEth, row.tenorDays ?? 7), disabled: busy, children: "Repay" })) : null] }, row.id));
                        }) })] })) : null] }));
}
