import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, KeyRound, Fingerprint, Users, Building2, Landmark, CheckCircle2, CircleUserRound, } from "lucide-react";
import { useSession } from "@/lib/store";
import { api } from "@/lib/api";
const personas = [
    {
        wallet: "0xDEa0000000000000000000000000000000000b17",
        role: "OWNER",
        label: "World Bank Governor",
        subtitle: "Tier 1 · reserve + registry",
        icon: Landmark,
    },
    {
        wallet: "0xBD00000000000000000000000000000000000Ad1",
        role: "NATIONAL_BANK_ADMIN",
        label: "Bangladesh NB Admin",
        subtitle: "Tier 2 · allocate capital",
        icon: Building2,
    },
    {
        wallet: "0xD4KA00000000000000000000000000000000000A",
        role: "LOCAL_BANK_ADMIN",
        label: "Dhaka LB Admin",
        subtitle: "Tier 3 · approve loans",
        icon: Users,
    },
    {
        wallet: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1",
        role: "APPROVER",
        label: "Loan Approver",
        subtitle: "Dhaka LB · review queue",
        icon: CheckCircle2,
    },
    {
        wallet: "0xB0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0",
        role: "BORROWER",
        label: "Borrower — returning",
        subtitle: "Bangladesh · active loan",
        icon: CircleUserRound,
    },
    {
        wallet: "0xCA11FED0000000000000000000000000000000C5",
        role: "BORROWER",
        label: "Borrower — first-time",
        subtitle: "Nigeria · needs income proof",
        icon: CircleUserRound,
    },
];
export function WalletGate() {
    const setSession = useSession((s) => s.setSession);
    const [pending, setPending] = useState(null);
    async function signIn(p) {
        try {
            setPending(p.wallet);
            const r = await api.post("/api/auth/dev-login", { wallet: p.wallet, role: p.role });
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
    return (_jsxs("div", { className: "mx-auto mt-8 max-w-5xl space-y-8", children: [_jsxs("div", { className: "card-gold p-10 text-center", children: [_jsx("div", { className: "mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-700/50 bg-gold-900/20 text-gold-300", children: _jsx(KeyRound, { className: "h-6 w-6" }) }), _jsx("h2", { className: "font-display text-3xl font-semibold gold-text", children: "Connect Your Wallet to Continue" }), _jsx("p", { className: "mx-auto mt-3 max-w-lg text-sm text-ink-200", children: "Crypto World Bank uses wallet-based identity. Your public address authenticates you across the platform \u2014 no passwords, no third-party custody, no central credential store." }), _jsx("div", { className: "mt-6 flex justify-center", children: _jsx(ConnectButton, {}) }), _jsx("div", { className: "mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3", children: [
                            {
                                icon: ShieldCheck,
                                title: "Audited primitives",
                                body: "OpenZeppelin access control, reentrancy guards, and pausable modules protect every transfer.",
                            },
                            {
                                icon: Fingerprint,
                                title: "Wallet-bound identity",
                                body: "EIP-1193 compatible wallets map to hierarchical roles: Owner, National, Local, Approver, Borrower.",
                            },
                            {
                                icon: KeyRound,
                                title: "You hold the keys",
                                body: "We never see your private key. All actions are user-signed with full on-chain auditability.",
                            },
                        ].map(({ icon: Icon, title, body }) => (_jsxs("div", { className: "rounded-xl border border-ink-600/60 bg-ink-900/60 p-4", children: [_jsx(Icon, { className: "mb-2 h-5 w-5 text-gold-400" }), _jsx("div", { className: "text-sm font-semibold text-ink-100", children: title }), _jsx("div", { className: "mt-1 text-xs leading-relaxed text-ink-200", children: body })] }, title))) })] }), _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-5 flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.22em] text-ink-200", children: "Demo sign-in" }), _jsx("div", { className: "font-display text-xl font-semibold text-ink-100", children: "Explore the platform as any role" }), _jsx("p", { className: "mt-1 max-w-2xl text-sm text-ink-200", children: "Testnet wallets and demo accounts are provisioned for every tier in the hierarchy. Pick a persona to experience the app without connecting a wallet \u2014 your role drives which pages, actions, and queues you see." })] }), _jsxs("span", { className: "badge-gold", children: [_jsx(ShieldCheck, { className: "h-3.5 w-3.5" }), "Dev mode"] })] }), _jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3", children: personas.map((p) => (_jsxs("button", { onClick: () => signIn(p), disabled: pending === p.wallet, className: "group flex items-start gap-3 rounded-xl border border-ink-600/60 bg-ink-900/60 p-4 text-left transition-colors hover:border-gold-700/40 hover:bg-gold-900/10 disabled:opacity-60", children: [_jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-700/30 bg-gold-900/20 text-gold-300", children: _jsx(p.icon, { className: "h-5 w-5" }) }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsxs("span", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-semibold text-ink-100", children: p.label }), _jsx("span", { className: "ml-2 text-[10px] uppercase tracking-[0.2em] text-gold-300", children: p.role.replace(/_/g, " ") })] }), _jsx("span", { className: "mt-0.5 block text-xs text-ink-200", children: p.subtitle }), _jsx("span", { className: "mt-2 block truncate font-mono text-[10px] text-ink-300", children: p.wallet })] })] }, `${p.wallet}:${p.role}`))) })] })] }));
}
