import { useEffect, useState } from "react";
import { useAccount, useBalance, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import toast from "react-hot-toast";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  Lock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { contractAddresses, nationalBankAbi, worldBankAbi } from "@/lib/contracts";
import { api, BankDTO } from "@/lib/api";

interface BankStats {
  totalDeposits: number;
  totalAllocated: number;
  totalLent: number;
  totalRepaid: number;
  activeLoans: number;
  borrowerCount: number;
  tiers: { world: number; national: number; local: number };
}

export function Reserve() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { writeContract, data: txHash, isPending, error: writeError, reset } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const [amount, setAmount] = useState("0.1");
  const [allocateAmount, setAllocateAmount] = useState("0.05");
  const [withdrawAmount, setWithdrawAmount] = useState("0.01");
  const [withdrawTo, setWithdrawTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [world, setWorld] = useState<BankDTO | null>(null);
  const [national, setNational] = useState<BankDTO[]>([]);
  const [stats, setStats] = useState<BankStats | null>(null);

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
        api.get<{ worldBank: BankDTO | null; nationalBanks: BankDTO[] }>("/api/banks"),
        api.get<BankStats>("/api/banks/stats"),
      ]);
      setWorld(b.worldBank);
      setNational(b.nationalBanks);
      setStats(s);
      await refetchOnChain();
    } finally {
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
        args: [withdrawTo as `0x${string}`, parseEther(withdrawAmount)],
      });
    } catch {
      toast.error("Invalid amount");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (address && !withdrawTo) setWithdrawTo(address);
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
    } catch {
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
    } catch {
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

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Tier 1"
        title="World Bank Reserve"
        description="The global custody contract. Every deposit is a public on-chain record; every allocation is gated by the Governor role."
        right={
          <>
            <button className="btn-ghost" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <span className="badge-gold">
              <Lock className="h-3.5 w-3.5" />
              {contractsReady ? "On-chain" : "Configure addresses"}
            </span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Reserve Balance" value={`${reserve.toFixed(4)} ETH`} icon={Landmark} hint="on-chain" />
        <Stat label="Total Deposits" value={`${totalDeposits.toFixed(4)} ETH`} hint="lifetime" />
        <Stat
          label="Total Allocated"
          value={`${totalAllocated.toFixed(4)} ETH`}
          hint={`to ${stats?.tiers.national ?? 0} national bank${stats?.tiers.national === 1 ? "" : "s"}`}
        />
        <Stat label="Lending APR" value={`${aprPct}%`} hint="Tier 1 → Tier 2" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3 space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Action</div>
            <div className="font-display text-xl font-semibold text-ink-100">
              Contribute to the reserve
            </div>
            <p className="mt-1 text-sm text-ink-200">
              Deposits are signed by your wallet and recorded on-chain. Use the deployer
              wallet (governor) to allocate capital downstream.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Deposit amount (ETH)</label>
              <input
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
              />
              <div className="mt-1 text-xs text-ink-200">
                Wallet:{" "}
                <span className="font-mono text-ink-100">
                  {balance ? Number(balance.formatted).toFixed(4) : "0.0000"}{" "}
                  {balance?.symbol ?? "ETH"}
                </span>
              </div>
            </div>
            <div>
              <label className="label">World Bank contract</label>
              <div className="input flex items-center justify-between">
                <span className="truncate font-mono text-xs text-ink-100">
                  {worldBankAddr || "run npm run sync:env"}
                </span>
                <span className="badge">Reserve</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-ink-600/60 bg-ink-900/40 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-200">
              Governor action
            </div>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Allocate to National Bank (ETH)</label>
                <input
                  className="input"
                  value={allocateAmount}
                  onChange={(e) => setAllocateAmount(e.target.value)}
                  inputMode="decimal"
                />
              </div>
              <div className="flex items-end">
                <button
                  className="btn-primary w-full"
                  disabled={busy || !contractsReady}
                  onClick={allocateToNational}
                >
                  Allocate downstream
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-200">
              Requires GOVERNOR_ROLE on WorldBankReserve. National:{" "}
              <span className="font-mono">{nationalBankAddr || "—"}</span>
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gold-700/30 bg-gold-900/10 px-4 py-3 text-xs text-gold-200">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Testnet only — never send real funds you cannot lose.
            </span>
          </div>

          <div className="flex gap-3">
            <button className="btn-primary" disabled={busy || !contractsReady} onClick={deposit}>
              <ArrowDownToLine className="h-4 w-4" />
              {busy ? "Confirm in wallet…" : "Deposit on-chain"}
            </button>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="label">Emergency withdraw (paused only)</label>
                <input className="input mb-2" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                <input className="input font-mono text-xs" value={withdrawTo} onChange={(e) => setWithdrawTo(e.target.value)} placeholder="Recipient 0x…" />
              </div>
              <button
                className="btn-ghost"
                disabled={busy || !contractsReady || !worldPaused}
                onClick={emergencyWithdraw}
              >
                <ArrowUpFromLine className="h-4 w-4" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Registry</div>
            <div className="font-display text-xl font-semibold text-ink-100">
              Active National Banks
            </div>
          </div>
          <div className="space-y-2.5">
            {national.length === 0 ? (
              <div className="text-xs text-ink-200">No national banks in API store.</div>
            ) : null}
            {national.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2.5"
              >
                <div>
                  <div className="text-sm font-medium text-ink-100">{b.name}</div>
                  <div className="text-xs text-ink-200">
                    Jurisdiction · {b.jurisdiction ?? "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.16em] text-ink-200">
                    Allocated
                  </div>
                  <div className="font-mono text-sm text-gold-300">
                    {b.totalAllocated.toFixed(2)} ETH
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
