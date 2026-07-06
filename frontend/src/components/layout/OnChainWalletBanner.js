import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAccount } from "wagmi";
import { useSession } from "@/lib/store";
import { findAccountByAddress } from "@shared/hardhat-accounts";
import { useHardhatNetwork } from "@/hooks/useHardhatNetwork";
import { AlertTriangle } from "lucide-react";
export function OnChainWalletBanner() {
    const { address, isConnected } = useAccount();
    const user = useSession((s) => s.user);
    const { onHardhat, setupHardhat, isLocalDev } = useHardhatNetwork();
    if (!isConnected || !user?.wallet)
        return null;
    if (isLocalDev && !onHardhat) {
        return (_jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-700/40 bg-amber-900/15 px-4 py-3 text-sm text-amber-100", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Switch to Hardhat Local" }), _jsxs("p", { className: "mt-1 text-xs text-amber-200/90", children: ["Network is chosen at the ", _jsx("strong", { children: "top of MetaMask" }), " (main screen), not in Accounts. Or use the button \u2192"] })] })] }), _jsx("button", { type: "button", className: "btn-primary text-xs", onClick: () => void setupHardhat(), children: "Hardhat Local (31337)" })] }));
    }
    const connected = address?.toLowerCase();
    const session = user.wallet.toLowerCase();
    if (connected === session)
        return null;
    const persona = findAccountByAddress(user.wallet);
    return (_jsxs("div", { className: "mb-4 flex items-start gap-3 rounded-xl border border-amber-700/40 bg-amber-900/15 px-4 py-3 text-sm text-amber-100", children: [_jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Wallet mismatch" }), _jsxs("p", { className: "mt-1 text-xs text-amber-200/90", children: ["Signed in as", " ", _jsx("span", { className: "font-mono", children: persona?.label ?? user.displayName }), " (", user.wallet.slice(0, 8), "\u2026). MetaMask is on", " ", _jsxs("span", { className: "font-mono", children: [address?.slice(0, 8), "\u2026"] }), ". Import Hardhat account #", persona?.index ?? "?", " and switch to it before sending transactions."] })] })] }));
}
