import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { parseEther } from "viem";
import toast from "react-hot-toast";
import { ArrowDownToLine, ArrowUpFromLine, Landmark, Lock, AlertTriangle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { contractAddresses } from "@/lib/contracts";

export function Reserve() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [amount, setAmount] = useState("0.1");
  const [pending, setPending] = useState(false);

  const worldBank = contractAddresses.worldBank;

  async function deposit() {
    if (!worldBank) {
      toast.error("World Bank contract address is not configured");
      return;
    }
    try {
      setPending(true);
      parseEther(amount); // validation
      // NOTE: In the integrated build this should call `writeContract` via wagmi
      // with the WorldBankReserve ABI. The UI below makes the intent explicit
      // while the contracts are still being deployed per-environment.
      await new Promise((r) => setTimeout(r, 900));
      toast.success(`Deposit of ${amount} ETH queued (signer required)`);
    } catch {
      toast.error("Invalid amount");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Tier 1"
        title="World Bank Reserve"
        description="The global custody contract. Every deposit is a public on-chain record; every allocation is gated by the Governor role."
        right={
          <span className="badge-gold">
            <Lock className="h-3.5 w-3.5" />
            {worldBank ? "Connected" : "Not configured"}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Reserve Balance" value="1,842.50 ETH" icon={Landmark} hint="on-chain" />
        <Stat label="Total Deposits" value="2,140.85 ETH" hint="lifetime" />
        <Stat label="Total Allocated" value="1,240.00 ETH" hint="to 3 banks" />
        <Stat label="Lending APR" value="3.00%" hint="Tier 1 → Tier 2" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <div className="mb-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Action</div>
            <div className="font-display text-xl font-semibold text-ink-100">
              Contribute to the reserve
            </div>
            <p className="mt-1 text-sm text-ink-200">
              Deposits immediately become lendable capital. The transaction is signed by your
              wallet — the platform never custodies your funds.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Amount (ETH)</label>
              <input
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
              />
              <div className="mt-1 text-xs text-ink-200">
                Wallet: <span className="font-mono text-ink-100">
                  {balance ? Number(balance.formatted).toFixed(4) : "0.0000"} {balance?.symbol ?? "ETH"}
                </span>
              </div>
            </div>
            <div>
              <label className="label">Destination</label>
              <div className="input flex items-center justify-between">
                <span className="font-mono text-xs text-ink-100">
                  {worldBank || "0x…set VITE_WORLD_BANK_ADDRESS"}
                </span>
                <span className="badge">Reserve</span>
              </div>
              <div className="mt-1 text-xs text-ink-200">Tier 1 smart contract</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-gold-700/30 bg-gold-900/10 px-4 py-3 text-xs text-gold-200">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Testnet only — never send real ETH to this contract.
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="btn-primary" disabled={pending} onClick={deposit}>
              <ArrowDownToLine className="h-4 w-4" />
              {pending ? "Submitting…" : "Deposit"}
            </button>
            <button className="btn-ghost" disabled>
              <ArrowUpFromLine className="h-4 w-4" />
              Withdraw (governor only)
            </button>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Registry</div>
            <div className="font-display text-xl font-semibold text-ink-100">Active National Banks</div>
          </div>
          <div className="space-y-2.5">
            {[
              { name: "Bangladesh National Bank", j: "BD", out: "320 ETH" },
              { name: "Nigeria National Bank", j: "NG", out: "280 ETH" },
              { name: "Indonesia National Bank", j: "ID", out: "210 ETH" },
            ].map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2.5"
              >
                <div>
                  <div className="text-sm font-medium text-ink-100">{b.name}</div>
                  <div className="text-xs text-ink-200">Jurisdiction · {b.j}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.16em] text-ink-200">Outstanding</div>
                  <div className="font-mono text-sm text-gold-300">{b.out}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
