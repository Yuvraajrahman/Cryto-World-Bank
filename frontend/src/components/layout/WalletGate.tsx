import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ShieldCheck, KeyRound, Fingerprint } from "lucide-react";

export function WalletGate() {
  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div className="card-gold p-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-700/50 bg-gold-900/20 text-gold-300">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl font-semibold gold-text">
          Connect Your Wallet to Continue
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink-200">
          Crypto World Bank uses wallet-based identity. Your public address
          authenticates you across the platform — no passwords, no third-party
          custody, no central credential store.
        </p>
        <div className="mt-6 flex justify-center">
          <ConnectButton />
        </div>

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
              body: "EIP-1193 compatible wallets map to hierarchical roles: Owner, National, Local, Approver, Borrower.",
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
    </div>
  );
}
