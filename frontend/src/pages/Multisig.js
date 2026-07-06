import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { encodeAbiParameters, encodeFunctionData, keccak256, parseEther } from "viem";
import toast from "react-hot-toast";
import { ShieldCheck, Users, Play } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { contractAddresses, governorMultisigAbi, worldBankAbi } from "@/lib/contracts";
import { contractsConfigured } from "@/lib/onChain";
import { useOnChainTx } from "@/hooks/useOnChainTx";
function operationId(target, data) {
    return keccak256(encodeAbiParameters([{ type: "address" }, { type: "bytes" }], [target, data]));
}
export function Multisig() {
    const { address, isConnected } = useAccount();
    const onChain = contractsConfigured();
    const multisig = contractAddresses.governorMultisig;
    const { write, busy } = useOnChainTx();
    const [allocateAmount, setAllocateAmount] = useState("0.05");
    const [storedOpId, setStoredOpId] = useState("");
    const { data: isOwner } = useReadContract({
        address: multisig || undefined,
        abi: governorMultisigAbi,
        functionName: "isOwner",
        args: address ? [address] : undefined,
        query: { enabled: Boolean(multisig && address) },
    });
    const builtOp = (() => {
        if (!contractAddresses.worldBank || !contractAddresses.nationalBank)
            return null;
        const data = encodeFunctionData({
            abi: worldBankAbi,
            functionName: "allocate",
            args: [contractAddresses.nationalBank, parseEther(allocateAmount)],
        });
        return {
            target: contractAddresses.worldBank,
            data,
            opId: operationId(contractAddresses.worldBank, data),
        };
    })();
    const opId = storedOpId || builtOp?.opId || "";
    const { data: confirmCount } = useReadContract({
        address: multisig || undefined,
        abi: governorMultisigAbi,
        functionName: "confirmationCount",
        args: opId ? [opId] : undefined,
        query: { enabled: Boolean(multisig && opId) },
    });
    function confirmOp() {
        if (!multisig || !builtOp || !isConnected) {
            toast.error("Connect an owner wallet");
            return;
        }
        setStoredOpId(builtOp.opId);
        write({
            address: multisig,
            abi: governorMultisigAbi,
            functionName: "confirm",
            args: [builtOp.opId],
        });
    }
    function executeOp() {
        if (!multisig || !builtOp || !isConnected)
            return;
        write({
            address: multisig,
            abi: governorMultisigAbi,
            functionName: "execute",
            args: [builtOp.target, builtOp.data, builtOp.opId],
        });
    }
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(SectionHeader, { eyebrow: "Phase I \u00B7 DT-I.18", title: "Governor Multisig (2-of-3)", description: "Confirm and execute World Bank governor actions from two of three owner wallets.", right: _jsxs("span", { className: "badge-gold", children: [_jsx(ShieldCheck, { className: "h-3.5 w-3.5" }), "MVT #15"] }) }), !onChain || !multisig ? (_jsxs("div", { className: "card p-6 text-sm text-amber-200", children: ["Deploy contracts and run ", _jsx("code", { className: "font-mono", children: "npm run sync:env" }), " to load the multisig address."] })) : (_jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { className: "card p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5 text-gold-400" }), _jsx("div", { className: "font-display text-lg font-semibold text-ink-100", children: "Your signer" })] }), _jsx("p", { className: "text-sm text-ink-200 font-mono", children: address ?? "Not connected" }), _jsxs("p", { className: "text-sm text-ink-200", children: ["Multisig owner:", " ", _jsx("span", { className: isOwner ? "text-green-300" : "text-amber-300", children: isOwner ? "Yes" : "No — switch to owner account 0, 1, or 4" })] }), _jsxs("p", { className: "text-xs text-ink-200 break-all", children: ["Multisig: ", multisig] })] }), _jsxs("div", { className: "card p-6 space-y-4", children: [_jsx("div", { className: "font-display text-lg font-semibold text-ink-100", children: "Demo: allocate via multisig" }), _jsx("p", { className: "text-sm text-ink-200", children: "1) Owner A confirms \u00B7 2) Owner B confirms \u00B7 3) Either owner executes" }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Allocate to National (ETH)" }), _jsx("input", { className: "input", value: allocateAmount, onChange: (e) => setAllocateAmount(e.target.value) })] }), _jsxs("div", { className: "text-xs font-mono text-ink-200 break-all", children: ["Op ID: ", opId || "—", _jsx("br", {}), "Confirmations: ", confirmCount ?? 0, " / 2"] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { className: "btn-primary", onClick: confirmOp, disabled: busy || !isOwner, children: "Confirm operation" }), _jsxs("button", { className: "btn-ghost", onClick: executeOp, disabled: busy || !isOwner, children: [_jsx(Play, { className: "h-4 w-4" }), "Execute (2+ confirms)"] })] })] })] }))] }));
}
