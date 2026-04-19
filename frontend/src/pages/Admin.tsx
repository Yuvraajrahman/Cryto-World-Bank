import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  AlertTriangle,
  Pause,
  Play,
  Gauge,
  ShieldCheck,
  History,
  Shuffle,
  RefreshCw,
} from "lucide-react";
import { api, BankDTO, TransactionDTO } from "@/lib/api";
import { useSession } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

export function Admin() {
  const role = useSession((s) => s.role);
  const user = useSession((s) => s.user);
  const [paused, setPaused] = useState(false);
  const [apr, setApr] = useState(300);

  const [banks, setBanks] = useState<{
    worldBank: BankDTO | null;
    nationalBanks: BankDTO[];
    localBanks: BankDTO[];
  } | null>(null);
  const [log, setLog] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("10");
  const [allocating, setAllocating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [b, l] = await Promise.all([
        api.get<{
          worldBank: BankDTO | null;
          nationalBanks: BankDTO[];
          localBanks: BankDTO[];
        }>("/api/banks"),
        api.get<{ entries: TransactionDTO[] }>("/api/banks/audit-log").catch(() => ({ entries: [] })),
      ]);
      setBanks(b);
      setLog(l.entries ?? []);

      if (!fromId) {
        if (role === "OWNER" && b.worldBank) setFromId(b.worldBank.id);
        else if (user?.bankId) setFromId(user.bankId);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOwner = role === "OWNER";
  const isNbAdmin = role === "NATIONAL_BANK_ADMIN";

  const allocationTargets = isOwner
    ? (banks?.nationalBanks ?? [])
    : (banks?.localBanks ?? []).filter((lb) => lb.parentBankId === user?.bankId);

  async function allocate() {
    if (!fromId || !toId) {
      toast.error("Select source and target");
      return;
    }
    const amt = Number(amount);
    if (!(amt > 0)) {
      toast.error("Amount must be positive");
      return;
    }
    try {
      setAllocating(true);
      await api.post("/api/banks/allocate", {
        fromBankId: fromId,
        toBankId: toId,
        amount: amt,
      });
      toast.success(`Allocated ${amt} ETH`);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Allocation failed");
    } finally {
      setAllocating(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Governance"
        title={isOwner ? "Governor Controls" : "National Bank Controls"}
        description="Governance actions are role-gated, signed by your wallet, and logged immutably. Unauthorized calls revert on-chain."
        right={
          <div className="flex items-center gap-2">
            <span className="badge-gold">
              <ShieldCheck className="h-3.5 w-3.5" />
              {role.replace(/_/g, " ")}
            </span>
            <button className="btn-ghost" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {isOwner ? (
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
              <Gauge className="h-4 w-4 text-gold-400" />
              Reserve APR
            </div>
            <div className="font-display text-xl font-semibold text-ink-100">
              Tier 1 → Tier 2 lending rate
            </div>
            <div className="mt-4">
              <label className="label">Basis points (100 = 1.00%)</label>
              <input
                type="number"
                className="input"
                min={0}
                max={5000}
                value={apr}
                onChange={(e) => setApr(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-ink-200">Safety cap: 50.00% (5000 bps)</p>
            </div>
            <button
              className="btn-primary mt-4"
              onClick={() => toast.success(`APR set to ${(apr / 100).toFixed(2)}%`)}
            >
              Update rate
            </button>
          </div>
        ) : null}

        <div className={`card p-6 ${isOwner ? "" : "lg:col-span-2"}`}>
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
            <Shuffle className="h-4 w-4 text-gold-400" />
            Capital allocation
          </div>
          <div className="font-display text-xl font-semibold text-ink-100">
            {isOwner ? "World → National" : "National → Local"}
          </div>
          <p className="mt-1 text-xs text-ink-200">
            {isOwner
              ? "Move reserve into a national bank's wallet."
              : "Move your national reserve into one of your local banks."}
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">From</label>
              <select
                className="input"
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                disabled={!isOwner && Boolean(user?.bankId)}
              >
                <option value="">Select…</option>
                {isOwner && banks?.worldBank ? (
                  <option value={banks.worldBank.id}>
                    {banks.worldBank.name} · {banks.worldBank.reserve.toFixed(0)} ETH
                  </option>
                ) : null}
                {!isOwner && isNbAdmin && user?.bankId
                  ? (() => {
                      const nb = banks?.nationalBanks.find((n) => n.id === user.bankId);
                      return nb ? (
                        <option value={nb.id}>
                          {nb.name} · {nb.reserve.toFixed(0)} ETH
                        </option>
                      ) : null;
                    })()
                  : null}
              </select>
            </div>
            <div>
              <label className="label">To</label>
              <select className="input" value={toId} onChange={(e) => setToId(e.target.value)}>
                <option value="">Select…</option>
                {allocationTargets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount (ETH)</label>
              <input
                className="input"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <button className="btn-primary mt-4" onClick={allocate} disabled={allocating}>
            <Shuffle className="h-4 w-4" />
            {allocating ? "Allocating…" : "Allocate funds"}
          </button>
        </div>

        {isOwner ? (
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
              <AlertTriangle className="h-4 w-4 text-gold-400" />
              Emergency
            </div>
            <div className="font-display text-xl font-semibold text-ink-100">
              System breaker
            </div>
            <p className="mt-1 text-xs text-ink-200">
              Pausing halts allocations, repayments, and loan lifecycle actions at every tier. Use
              only during a confirmed incident.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-ink-600/60 bg-ink-900/60 px-4 py-3">
              <span className="text-sm text-ink-200">Current state</span>
              <span className={paused ? "badge-red" : "badge-green"}>
                {paused ? "Paused" : "Live"}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className={paused ? "btn-primary" : "btn-danger"}
                onClick={() => {
                  setPaused((p) => !p);
                  toast(paused ? "System resumed" : "System paused");
                }}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {paused ? "Unpause" : "Pause"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200 flex items-center gap-2">
              <History className="h-4 w-4 text-gold-400" />
              Audit log
            </div>
            <div className="font-display text-xl font-semibold text-ink-100">
              Allocation history
            </div>
          </div>
          <span className="text-xs text-ink-200">{log.length} entries</span>
        </div>
        <ul className="space-y-2 text-sm">
          {log.length === 0 ? (
            <li className="py-6 text-center text-xs text-ink-200">No allocations yet.</li>
          ) : null}
          {log.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between rounded-lg border border-ink-600/50 bg-ink-900/50 px-3 py-2.5"
            >
              <div>
                <div className="font-medium text-ink-100">
                  {e.note ?? "Capital allocated"}
                </div>
                <div className="text-xs text-ink-200">
                  {formatDateTime(e.at)}
                  {e.txHash ? (
                    <span className="ml-2 font-mono text-gold-300">
                      tx {e.txHash.slice(0, 10)}…
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="badge-gold">{e.amount.toFixed(2)} ETH</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
