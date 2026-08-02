import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  KeyRound,
  Fingerprint,
  CheckCircle2,
  CircleUserRound,
  Building2,
  Landmark,
  Users,
  Scale,
  Wrench,
} from "lucide-react";
import { HARDHAT_ACCOUNTS, type TestnetPersonaRole } from "@shared/hardhat-accounts";
import { useSession } from "@/lib/store";
import { api, UserDTO } from "@/lib/api";
import { useHardhatNetwork } from "@/hooks/useHardhatNetwork";

const roleIcons: Record<TestnetPersonaRole, typeof Landmark> = {
  OWNER: Landmark,
  NATIONAL_BANK_ADMIN: Building2,
  LOCAL_BANK_ADMIN: Users,
  APPROVER: CheckCircle2,
  BORROWER: CircleUserRound,
  REGULATOR: Scale,
  DEV_ADMIN: Wrench,
};

export function WalletGate() {
  const setSession = useSession((s) => s.setSession);
  const [pending, setPending] = useState<string | null>(null);
  const { setupHardhat, onHardhat, isConnected, isLocalDev } = useHardhatNetwork();

  async function signIn(wallet: string, role: TestnetPersonaRole) {
    try {
      setPending(wallet);
      const r = await api.post<{ token: string; user: UserDTO }>(
        "/api/auth/dev-login",
        { wallet, role },
      );
      setSession({ token: r.token, user: r.user });
      toast.success(`Signed in as ${r.user.displayName}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-5xl space-y-8">
      <div className="card-gold p-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-700/50 bg-gold-900/20 text-gold-300">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl font-semibold gold-text">
          Connect Your Wallet to Continue
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink-200">
          For local testnet: add Hardhat network (chain 31337, RPC{" "}
          <span className="font-mono">http://127.0.0.1:8545</span>) and import
          account #0–#5 from{" "}
          <span className="font-mono">Documentation/PHASE1.md</span>. Pick a persona
          below, then connect the matching wallet in MetaMask.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <ConnectButton />
          {isLocalDev ? (
            <button type="button" className="btn-primary" onClick={() => void setupHardhat()}>
              Add Hardhat network (1-click)
            </button>
          ) : null}
        </div>
        {isLocalDev && isConnected && !onHardhat ? (
          <p className="mt-3 text-sm text-amber-200">
            Wrong network — click <strong>Add Hardhat network</strong> above, or switch to{" "}
            <strong>Hardhat Local</strong> at the top of MetaMask (not in Accounts).
          </p>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
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
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-ink-600/60 bg-ink-900/60 p-4">
              <Icon className="mb-2 h-5 w-5 text-gold-400" />
              <div className="text-sm font-semibold text-ink-100">{title}</div>
              <div className="mt-1 text-xs leading-relaxed text-ink-200">{body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
              Local testnet personas
            </div>
            <div className="font-display text-xl font-semibold text-ink-100">
              Hardhat accounts #0 – #5
            </div>
            <p className="mt-1 max-w-2xl text-sm text-ink-200">
              Sign in with a persona, then connect the same account in MetaMask to
              send on-chain transactions (deposit, allocate, loan request, approve,
              repay).
            </p>
          </div>
          <span className="badge-gold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Chain 31337
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {HARDHAT_ACCOUNTS.map((p) => {
            const Icon = roleIcons[p.role];
            return (
              <button
                key={`${p.address}:${p.role}`}
                onClick={() => signIn(p.address, p.role)}
                disabled={pending === p.address}
                className="group flex items-start gap-3 rounded-xl border border-ink-600/60 bg-ink-900/60 p-4 text-left transition-colors hover:border-gold-700/40 hover:bg-gold-900/10 disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-700/30 bg-gold-900/20 text-gold-300">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink-100">
                      #{p.index} · {p.label}
                    </span>
                    <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-gold-300">
                      {p.role.replace(/_/g, " ")}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-200">{p.subtitle}</span>
                  <span className="mt-2 block truncate font-mono text-[10px] text-ink-300">
                    {p.address}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
