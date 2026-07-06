import { useAccount } from "wagmi";
import { useSession } from "@/lib/store";
import { findAccountByAddress } from "@shared/hardhat-accounts";
import { useHardhatNetwork } from "@/hooks/useHardhatNetwork";
import { AlertTriangle } from "lucide-react";

export function OnChainWalletBanner() {
  const { address, isConnected } = useAccount();
  const user = useSession((s) => s.user);
  const { onHardhat, setupHardhat, isLocalDev } = useHardhatNetwork();

  if (!isConnected || !user?.wallet) return null;

  if (isLocalDev && !onHardhat) {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-700/40 bg-amber-900/15 px-4 py-3 text-sm text-amber-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">Switch to Hardhat Local</div>
            <p className="mt-1 text-xs text-amber-200/90">
              Network is chosen at the <strong>top of MetaMask</strong> (main screen), not in
              Accounts. Or use the button →
            </p>
          </div>
        </div>
        <button type="button" className="btn-primary text-xs" onClick={() => void setupHardhat()}>
          Hardhat Local (31337)
        </button>
      </div>
    );
  }

  const connected = address?.toLowerCase();
  const session = user.wallet.toLowerCase();
  if (connected === session) return null;

  const persona = findAccountByAddress(user.wallet);

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-700/40 bg-amber-900/15 px-4 py-3 text-sm text-amber-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <div className="font-medium">Wallet mismatch</div>
        <p className="mt-1 text-xs text-amber-200/90">
          Signed in as{" "}
          <span className="font-mono">{persona?.label ?? user.displayName}</span> (
          {user.wallet.slice(0, 8)}…). MetaMask is on{" "}
          <span className="font-mono">{address?.slice(0, 8)}…</span>. Import Hardhat
          account #{persona?.index ?? "?"} and switch to it before sending transactions.
        </p>
      </div>
    </div>
  );
}
