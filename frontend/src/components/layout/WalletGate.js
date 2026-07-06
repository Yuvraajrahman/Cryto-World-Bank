import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, KeyRound, Fingerprint, CheckCircle2, CircleUserRound, Building2, Landmark, Users, } from "lucide-react";
import { HARDHAT_ACCOUNTS } from "@shared/hardhat-accounts";
import { useSession } from "@/lib/store";
import { api } from "@/lib/api";
import { useHardhatNetwork } from "@/hooks/useHardhatNetwork";
const roleIcons = {
    OWNER: Landmark,
    NATIONAL_BANK_ADMIN: Building2,
    LOCAL_BANK_ADMIN: Users,
    APPROVER: CheckCircle2,
    BORROWER: CircleUserRound,
};
export function WalletGate() {
    const setSession = useSession((s) => s.setSession);
    const [pending, setPending] = useState(null);
    const { setupHardhat, onHardhat, isConnected, isLocalDev } = useHardhatNetwork();
    async function signIn(wallet, role) {
        try {
            setPending(wallet);
            const r = await api.post("/api/auth/dev-login", { wallet, role });
            setSession({ token: r.token, user: r.user });
            toast.success(`Signed in as ${r.user.displayName}`);
        }
        catch (err) {
            toast.error(err instanceof Error ? err.message : "Sign-in failed");
        }
        finally {
            setPending(null);
        }
    }
    return (_jsxs("div", { className: "mx-auto mt-8 max-w-5xl space-y-8", children: [_jsxs("div", { className: "card-gold p-10 text-center", children: [_jsx("div", { className: "mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-700/50 bg-gold-900/20 text-gold-300", children: _jsx(KeyRound, { className: "h-6 w-6" }) }), _jsx("h2", { className: "font-display text-3xl font-semibold gold-text", children: "Connect Your Wallet to Continue" }), _jsxs("p", { className: "mx-auto mt-3 max-w-lg text-sm text-ink-200", children: ["For local testnet: add Hardhat network (chain 31337, RPC", " ", _jsx("span", { className: "font-mono", children: "http://127.0.0.1:8545" }), ") and import account #0\u2013#5 from", " ", _jsx("span", { className: "font-mono", children: "Documentation/PHASE1.md" }), ". Pick a persona below, then connect the matching wallet in MetaMask."] }), _jsxs("div", { className: "mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center", children: [_jsx(ConnectButton, {}), isLocalDev ? (_jsx("button", { type: "button", className: "btn-primary", onClick: () => void setupHardhat(), children: "Add Hardhat network (1-click)" })) : null] }), isLocalDev && isConnected && !onHardhat ? (_jsxs("p", { className: "mt-3 text-sm text-amber-200", children: ["Wrong network \u2014 click ", _jsx("strong", { children: "Add Hardhat network" }), " above, or switch to", " ", _jsx("strong", { children: "Hardhat Local" }), " at the top of MetaMask (not in Accounts)."] })) : null, _jsx("div", { className: "mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3", children: [
                            {
                                icon: ShieldCheck,
                                title: "Audited primitives",
                                body: "OpenZeppelin access control, reentrancy guards, and pausable modules protect every transfer.",
                            },
                            {
                                icon: Fingerprint,
                                title: "Wallet-bound identity",
                                body: "Each Hardhat account maps to a tier role: Governor, National, Local, Approver, Borrower.",
                            },
                            {
                                icon: KeyRound,
                                title: "You hold the keys",
                                body: "We never see your private key. All actions are user-signed with full on-chain auditability.",
                            },
                        ].map(({ icon: Icon, title, body }) => (_jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/60 p-4", children: [_jsx(Icon, { className: "mb-2 h-5 w-5 text-gold-400" }), _jsx("div", { className: "text-sm font-semibold text-ink-100", children: title }), _jsx("div", { className: "mt-1 text-xs leading-relaxed text-ink-200", children: body })] }, title))) })] }), _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-5 flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Local testnet personas" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Hardhat accounts #0 \u2013 #5" }), _jsx("p", { className: "mt-1 max-w-2xl text-sm text-ink-200", children: "Sign in with a persona, then connect the same account in MetaMask to send on-chain transactions (deposit, allocate, loan request, approve, repay)." })] }), _jsxs("span", { className: "badge-gold", children: [_jsx(ShieldCheck, { className: "h-3.5 w-3.5" }), "Chain 31337"] })] }), _jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3", children: HARDHAT_ACCOUNTS.map((p) => {
                            const Icon = roleIcons[p.role];
                            return (_jsxs("button", { onClick: () => signIn(p.address, p.role), disabled: pending === p.address, className: "group flex items-start gap-3 rounded-xl border border-ink-600/60 bg-ink-900/60 p-4 text-left transition-colors hover:border-gold-700/40 hover:bg-gold-900/10 disabled:opacity-60", children: [_jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-700/30 bg-gold-900/20 text-gold-300", children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsxs("span", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm font-semibold text-ink-100", children: ["#", p.index, " \u00B7 ", p.label] }), _jsx("span", { className: "ml-2 text-[10px] uppercase tracking-[0.2em] text-gold-300", children: p.role.replace(/_/g, " ") })] }), _jsx("span", { className: "mt-0.5 block text-xs text-ink-200", children: p.subtitle }), _jsx("span", { className: "mt-2 block truncate font-mono text-[10px] text-ink-300", children: p.address })] })] }, `${p.address}:${p.role}`));
                        }) })] })] }));
}
