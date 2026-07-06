import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  Building2,
  Banknote,
  Landmark,
  Users,
  Activity,
  MapPin,
  Plus,
  Shuffle,
  RefreshCw,
} from "lucide-react";
import { api, BankDTO } from "@/lib/api";
import { useSession } from "@/lib/store";
import {
  contractAddresses,
  nationalBankAbi,
  upwardDepositAbi,
  worldBankAbi,
  capitalRequestAbi,
  localBankAdminAbi,
} from "@/lib/contracts";
import { contractsConfigured } from "@/lib/onChain";
import { useOnChainTx } from "@/hooks/useOnChainTx";

interface BanksResponse {
  worldBank: BankDTO | null;
  nationalBanks: BankDTO[];
  localBanks: BankDTO[];
}

interface BankStats {
  totalDeposits: number;
  totalAllocated: number;
  totalLent: number;
  totalRepaid: number;
  activeLoans: number;
  borrowerCount: number;
  tiers: { world: number; national: number; local: number };
}

export function Banks() {
  const role = useSession((s) => s.role);
  const user = useSession((s) => s.user);

  const [data, setData] = useState<BanksResponse | null>(null);
  const [stats, setStats] = useState<BankStats | null>(null);
  const [chainHierarchy, setChainHierarchy] = useState<{
    world?: { reserveEth: number; allocatedEth: number };
    national?: { balanceEth: number };
    local?: { balanceEth: number; pending: number; active: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [b, s, chain] = await Promise.all([
        api.get<BanksResponse>("/api/banks"),
        api.get<BankStats>("/api/banks/stats"),
        contractsConfigured()
          ? api.get<{
              world: { reserveEth: number; allocatedEth: number };
              national: { balanceEth: number } | null;
              local: { balanceEth: number; pending: number; active: number } | null;
            }>("/api/chain/hierarchy").catch(() => null)
          : Promise.resolve(null),
      ]);
      setData(b);
      setStats(s);
      setChainHierarchy(
        chain
          ? {
              world: chain.world,
              national: chain.national ?? undefined,
              local: chain.local ?? undefined,
            }
          : null,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const national = data?.nationalBanks ?? [];
  const local = data?.localBanks ?? [];

  const localsByNb = useMemo(() => {
    const m = new Map<string, BankDTO[]>();
    for (const lb of local) {
      if (!lb.parentBankId) continue;
      const list = m.get(lb.parentBankId) ?? [];
      list.push(lb);
      m.set(lb.parentBankId, list);
    }
    return m;
  }, [local]);

  const canRegisterNational = role === "OWNER";
  const canRegisterLocal = role === "OWNER" || role === "NATIONAL_BANK_ADMIN";
  const canAllocate = role === "OWNER" || role === "NATIONAL_BANK_ADMIN";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Network"
        title="Bank Hierarchy"
        description="The living map of participating institutions — registered, capitalized, and lending."
        right={
          <button className="btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "World Bank",
            value: String(stats?.tiers.world ?? 0),
            icon: Landmark,
            hint: `${(chainHierarchy?.world?.reserveEth ?? data?.worldBank?.reserve ?? 0).toFixed(2)} ETH reserve`,
          },
          {
            label: "National Banks",
            value: String(stats?.tiers.national ?? 0),
            icon: Building2,
            hint: `${national.reduce((a, b) => a + b.reserve, 0).toFixed(0)} ETH capitalized`,
          },
          {
            label: "Local Banks",
            value: String(stats?.tiers.local ?? 0),
            icon: Banknote,
            hint: `${local.reduce((a, b) => a + b.totalLent, 0).toFixed(0)} ETH lent`,
          },
          {
            label: "Borrowers",
            value: String(stats?.borrowerCount ?? 0),
            icon: Users,
            hint: `${stats?.activeLoans ?? 0} active loans`,
          },
        ].map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="stat card-hover">
            <div className="flex items-center justify-between">
              <span className="stat-label">{label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/20 text-gold-300">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="text-xs text-ink-200">{hint}</div>
          </div>
        ))}
      </div>

      {canAllocate ? (
        <AllocationPanel
          world={data?.worldBank ?? null}
          national={national}
          local={local}
          onAfter={load}
          currentBankId={user?.bankId}
          role={role}
        />
      ) : null}

      {(canAllocate || role === "LOCAL_BANK_ADMIN") && contractsConfigured() ? (
        <UpwardDepositPanel role={role} onAfter={load} />
      ) : null}

      {(role === "OWNER" || role === "NATIONAL_BANK_ADMIN" || role === "LOCAL_BANK_ADMIN") ? (
        <CapitalRequestsPanel role={role} onAfter={load} />
      ) : null}

      {role === "LOCAL_BANK_ADMIN" && contractsConfigured() ? (
        <AccountCompliancePanel />
      ) : null}

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Tier 2</div>
            <div className="font-display text-xl font-semibold text-ink-100">
              National Banks
            </div>
          </div>
          <span className="badge">
            {(national[0]?.aprBps ?? 500) / 100}% APR from reserve
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.2em] text-ink-200">
                <th className="py-2 pr-4">Bank</th>
                <th className="py-2 pr-4">Jurisdiction</th>
                <th className="py-2 pr-4">Local Banks</th>
                <th className="py-2 pr-4">Reserve</th>
                <th className="py-2 pr-4">Allocated</th>
                <th className="py-2 pr-4">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {national.map((b) => {
                const util =
                  b.totalAllocated + b.reserve > 0
                    ? Math.round((b.totalAllocated / (b.totalAllocated + b.reserve)) * 100)
                    : 0;
                return (
                  <tr key={b.id} className="border-t border-ink-700/50">
                    <td className="py-3 pr-4 font-medium text-ink-100">{b.name}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-ink-200">
                        <MapPin className="h-3.5 w-3.5 text-gold-400" />
                        {b.jurisdiction}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-ink-200">
                      {(localsByNb.get(b.id) ?? []).length}
                    </td>
                    <td className="py-3 pr-4 font-mono text-ink-100">
                      {b.reserve.toFixed(2)} ETH
                    </td>
                    <td className="py-3 pr-4 font-mono text-gold-300">
                      {b.totalAllocated.toFixed(2)} ETH
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-ink-700">
                          <div
                            className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                            style={{ width: `${util}%` }}
                          />
                        </div>
                        <span className="text-xs text-ink-200">{util}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {national.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-ink-200">
                    No national banks yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Tier 3</div>
            <div className="font-display text-xl font-semibold text-ink-100">
              Local Banks
            </div>
          </div>
          <span className="badge">
            {(local[0]?.aprBps ?? 800) / 100}% APR from national
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {local.map((b) => {
            const parent = national.find((n) => n.id === b.parentBankId);
            return (
              <div
                key={b.id}
                className="rounded-xl border border-ink-600/60 bg-ink-900/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-ink-100">{b.name}</div>
                  <Activity className="h-4 w-4 text-gold-400" />
                </div>
                <div className="mt-1 text-xs text-ink-200">
                  {b.city ? `${b.city} · ` : ""}Parent · {parent?.name ?? "—"}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-ink-200">Reserve</span>
                  <span className="font-mono text-ink-100">
                    {b.reserve.toFixed(2)} ETH
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-200">Lent out</span>
                  <span className="font-mono text-gold-300">
                    {b.totalLent.toFixed(2)} ETH
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-200">Repaid</span>
                  <span className="font-mono text-emerald-300">
                    {b.totalRepaid.toFixed(2)} ETH
                  </span>
                </div>
              </div>
            );
          })}
          {local.length === 0 ? (
            <div className="col-span-full text-center text-xs text-ink-200">
              No local banks registered yet.
            </div>
          ) : null}
        </div>
      </div>

      {(canRegisterNational || canRegisterLocal) ? (
        <RegisterPanels
          canNational={canRegisterNational}
          canLocal={canRegisterLocal}
          national={national}
          onAfter={load}
          currentBankId={user?.bankId}
          role={role}
        />
      ) : null}
    </div>
  );
}

function UpwardDepositPanel({ role, onAfter }: { role: string; onAfter: () => void }) {
  const isNational = role === "NATIONAL_BANK_ADMIN" || role === "OWNER";
  const isLocal = role === "LOCAL_BANK_ADMIN";
  const [amount, setAmount] = useState("0.1");
  const { isConnected } = useAccount();
  const { write, busy } = useOnChainTx(onAfter);

  function submit() {
    if (!isConnected) {
      toast.error("Connect MetaMask");
      return;
    }
    if (!contractAddresses.upwardDeposit) {
      toast.error("Run phase2:local");
      return;
    }
    const parent = isLocal
      ? contractAddresses.nationalBank
      : isNational
        ? contractAddresses.worldBank
        : null;
    if (!parent) {
      toast.error("Parent bank address missing");
      return;
    }
    write({
      address: contractAddresses.upwardDeposit,
      abi: upwardDepositAbi,
      functionName: "depositUpward",
      args: [parent],
      value: parseEther(amount),
    } as unknown as Parameters<typeof write>[0]);
  }

  const label = isLocal ? "Local → National" : "National → World";

  return (
    <div className="card p-6">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Phase II</div>
        <div className="font-display text-xl font-semibold text-ink-100">Upward funding</div>
        <p className="mt-1 text-sm text-ink-200">
          Voluntary surplus repatriation via UpwardDepositFacility ({label}).
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="label">Amount (ETH)</label>
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="flex items-end md:col-span-2">
          <button className="btn-primary w-full" onClick={submit} disabled={busy}>
            {busy ? "Confirm in wallet…" : "Deposit upward on-chain"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CapitalRequestsPanel({ role, onAfter }: { role: string; onAfter: () => void }) {
  const tier =
    role === "OWNER" ? "world" : role === "NATIONAL_BANK_ADMIN" ? "national" : "national";
  const canFulfill = role === "OWNER" || role === "NATIONAL_BANK_ADMIN";
  const [requests, setRequests] = useState<
    Array<{ requestId: string; bank: string; amountEth: string; open: boolean }>
  >([]);
  const [requestAmount, setRequestAmount] = useState("0.1");
  const { isConnected } = useAccount();
  const { write, busy } = useOnChainTx(onAfter);

  async function loadRequests() {
    try {
      const path =
        role === "LOCAL_BANK_ADMIN"
          ? "/api/phase2/capital-requests?tier=national"
          : `/api/phase1/capital-requests?tier=${tier}`;
      const r = await api.get<{ requests: typeof requests }>(path);
      setRequests(r.requests ?? []);
    } catch {
      setRequests([]);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, [role, tier]);

  function submitRequest() {
    if (!isConnected) {
      toast.error("Connect MetaMask");
      return;
    }
    if (role === "NATIONAL_BANK_ADMIN" && contractAddresses.nationalBank) {
      write({
        address: contractAddresses.nationalBank,
        abi: nationalBankAbi,
        functionName: "requestUpstreamCapital",
        args: [parseEther(requestAmount)],
      });
      return;
    }
    if (role === "LOCAL_BANK_ADMIN" && contractAddresses.localBank) {
      write({
        address: contractAddresses.localBank,
        abi: localBankAdminAbi,
        functionName: "requestCapital",
        args: [parseEther(requestAmount)],
      });
    }
  }

  function fulfill(requestId: string) {
    if (!isConnected) return;
    const contract = role === "OWNER" ? contractAddresses.worldBank : contractAddresses.nationalBank;
    if (!contract) return;
    write({
      address: contract,
      abi: capitalRequestAbi,
      functionName: "fulfillCapitalRequest",
      args: [BigInt(requestId)],
    });
  }

  return (
    <div className="card p-6 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Capital requests</div>
        <div className="font-display text-xl font-semibold text-ink-100">Request / fulfill liquidity</div>
      </div>
      {role !== "OWNER" && role !== "APPROVER" ? (
        <div className="flex flex-wrap gap-2">
          <input className="input w-32" value={requestAmount} onChange={(e) => setRequestAmount(e.target.value)} />
          <button className="btn-primary" onClick={submitRequest} disabled={busy}>
            Request capital upward
          </button>
        </div>
      ) : null}
      <ul className="space-y-2 text-sm">
        {requests.length === 0 ? (
          <li className="text-ink-200">No open capital requests.</li>
        ) : (
          requests.map((r) => (
            <li key={r.requestId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-600/60 p-3">
              <span className="font-mono text-xs">
                #{r.requestId} · {r.amountEth} ETH from {r.bank.slice(0, 10)}…
              </span>
              {canFulfill ? (
                <button className="btn-ghost text-xs" onClick={() => fulfill(r.requestId)} disabled={busy}>
                  Fulfill
                </button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function AllocationPanel({
  world,
  national,
  local,
  onAfter,
  currentBankId,
  role,
}: {
  world: BankDTO | null;
  national: BankDTO[];
  local: BankDTO[];
  onAfter: () => void;
  currentBankId?: string;
  role: string;
}) {
  const isOwner = role === "OWNER";
  const defaultFrom = isOwner ? world?.id ?? "" : currentBankId ?? "";
  const [fromBankId, setFromBankId] = useState(defaultFrom);
  const [toBankId, setToBankId] = useState("");
  const [amount, setAmount] = useState("0.05");
  const [submitting, setSubmitting] = useState(false);
  const { isConnected } = useAccount();
  const onChain = contractsConfigured();
  const { write, busy: chainBusy } = useOnChainTx(onAfter);

  useEffect(() => {
    if (!fromBankId) setFromBankId(defaultFrom);
  }, [defaultFrom, fromBankId]);

  const sourceOptions = isOwner
    ? world
      ? [world]
      : []
    : national.filter((n) => n.id === currentBankId);
  const targetOptions = isOwner
    ? national
    : local.filter((l) => l.parentBankId === currentBankId);

  async function submit() {
    const amt = Number(amount);
    if (!(amt > 0)) {
      toast.error("Enter a positive amount");
      return;
    }

    if (onChain) {
      if (!isConnected) {
        toast.error("Connect MetaMask with the matching persona wallet");
        return;
      }
      if (isOwner) {
        if (!contractAddresses.worldBank || !contractAddresses.nationalBank) {
          toast.error("Run deploy + sync:env");
          return;
        }
        write({
          address: contractAddresses.worldBank,
          abi: worldBankAbi,
          functionName: "allocate",
          args: [contractAddresses.nationalBank, parseEther(amount)],
        });
        return;
      }
      if (!contractAddresses.nationalBank || !contractAddresses.localBank) {
        toast.error("Run deploy + sync:env");
        return;
      }
      write({
        address: contractAddresses.nationalBank,
        abi: nationalBankAbi,
        functionName: "allocate",
        args: [contractAddresses.localBank, parseEther(amount)],
      });
      return;
    }

    if (!fromBankId || !toBankId) {
      toast.error("Select source and destination");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/api/banks/allocate", {
        fromBankId,
        toBankId,
        amount: amt,
      });
      toast.success(`Allocated ${amt} ETH`);
      onAfter();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Allocation failed");
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || chainBusy;

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Capital flow</div>
          <div className="font-display text-xl font-semibold text-ink-100">
            Allocate reserve down the hierarchy
          </div>
          <p className="mt-1 text-sm text-ink-200">
            {onChain
              ? isOwner
                ? "On-chain: WorldBankReserve.allocate → National Bank contract."
                : "On-chain: NationalBank.allocate → Local Bank contract."
              : isOwner
                ? "Move funds from the World Reserve to a National Bank."
                : "Move funds from your National Bank to one of your Local Banks."}
          </p>
        </div>
        <span className="badge-gold">
          <Shuffle className="h-3.5 w-3.5" />
          {onChain ? "On-chain" : isOwner ? "Governor" : "NB Admin"}
        </span>
      </div>

      {onChain ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="label">From → To</label>
            <div className="input text-xs text-ink-200">
              {isOwner
                ? `World Bank → ${contractAddresses.nationalBank?.slice(0, 10)}…`
                : `National → ${contractAddresses.localBank?.slice(0, 10)}…`}
            </div>
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
          <div className="flex items-end">
            <button className="btn-primary w-full" onClick={submit} disabled={busy}>
              <Shuffle className="h-4 w-4" />
              {busy ? "Confirm in wallet…" : "Allocate on-chain"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="label">From</label>
            <select
              className="input"
              value={fromBankId}
              onChange={(e) => setFromBankId(e.target.value)}
            >
              <option value="">Select…</option>
              {sourceOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} · {b.reserve.toFixed(0)} ETH
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">To</label>
            <select
              className="input"
              value={toBankId}
              onChange={(e) => setToBankId(e.target.value)}
            >
              <option value="">Select…</option>
              {targetOptions.map((b) => (
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
          <div className="flex items-end">
            <button className="btn-primary w-full" onClick={submit} disabled={busy}>
              <Shuffle className="h-4 w-4" />
              {busy ? "Allocating…" : "Allocate"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RegisterPanels({
  canNational,
  canLocal,
  national,
  onAfter,
  currentBankId,
  role,
}: {
  canNational: boolean;
  canLocal: boolean;
  national: BankDTO[];
  onAfter: () => void;
  currentBankId?: string;
  role: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {canNational ? (
        <RegisterNationalForm onAfter={onAfter} />
      ) : null}
      {canLocal ? (
        <RegisterLocalForm
          national={national}
          defaultParentId={role === "NATIONAL_BANK_ADMIN" ? currentBankId : undefined}
          lockParent={role === "NATIONAL_BANK_ADMIN"}
          onAfter={onAfter}
        />
      ) : null}
    </div>
  );
}

function RegisterNationalForm({ onAfter }: { onAfter: () => void }) {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [reserve, setReserve] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const onChain = contractsConfigured();
  const { isConnected } = useAccount();
  const { write, busy: chainBusy } = useOnChainTx(onAfter);

  async function submit() {
    if (!name || !wallet || !jurisdiction) {
      toast.error("Fill all fields");
      return;
    }
    if (onChain && contractAddresses.worldBank) {
      if (!isConnected) {
        toast.error("Connect MetaMask (World Governor)");
        return;
      }
      write({
        address: contractAddresses.worldBank,
        abi: worldBankAbi,
        functionName: "registerNationalBank",
        args: [wallet as `0x${string}`, name, jurisdiction],
      });
      try {
        await api.post("/api/banks/register-national", {
          name,
          walletAddress: wallet,
          jurisdiction,
          reserve: Number(reserve) || 0,
        });
      } catch {
        /* off-chain mirror optional */
      }
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/api/banks/register-national", {
        name,
        walletAddress: wallet,
        jurisdiction,
        reserve: Number(reserve) || 0,
      });
      toast.success(`Registered ${name}`);
      setName("");
      setWallet("");
      setJurisdiction("");
      setReserve("0");
      onAfter();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
        <Plus className="h-4 w-4 text-gold-400" />
        Register a National Bank
      </div>
      <div className="font-display text-xl font-semibold text-ink-100">
        Tier 2 onboarding
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <label className="label">Display name</label>
          <input
            className="input"
            placeholder="e.g. Kenya National Bank"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Wallet address</label>
          <input
            className="input font-mono"
            placeholder="0x…"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Jurisdiction</label>
          <input
            className="input"
            placeholder="Country"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Initial reserve (ETH, optional)</label>
          <input
            className="input"
            inputMode="decimal"
            value={reserve}
            onChange={(e) => setReserve(e.target.value)}
          />
        </div>
      </div>
      <button className="btn-primary mt-5" onClick={submit} disabled={submitting || chainBusy}>
        <Plus className="h-4 w-4" />
        {submitting || chainBusy ? "Registering…" : onChain ? "Register on-chain" : "Register"}
      </button>
    </div>
  );
}

function RegisterLocalForm({
  national,
  defaultParentId,
  lockParent,
  onAfter,
}: {
  national: BankDTO[];
  defaultParentId?: string;
  lockParent?: boolean;
  onAfter: () => void;
}) {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [city, setCity] = useState("");
  const [parentBankId, setParentBankId] = useState(defaultParentId ?? "");
  const [reserve, setReserve] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const onChain = contractsConfigured();
  const { isConnected } = useAccount();
  const { write, busy: chainBusy } = useOnChainTx(onAfter);

  useEffect(() => {
    if (defaultParentId && !parentBankId) setParentBankId(defaultParentId);
  }, [defaultParentId, parentBankId]);

  async function submit() {
    if (!name || !wallet || !jurisdiction || !city || !parentBankId) {
      toast.error("Fill all fields");
      return;
    }
    if (onChain && contractAddresses.nationalBank) {
      if (!isConnected) {
        toast.error("Connect MetaMask (National Governor)");
        return;
      }
      write({
        address: contractAddresses.nationalBank,
        abi: nationalBankAbi,
        functionName: "registerLocalBank",
        args: [wallet as `0x${string}`, name, city],
      });
      try {
        await api.post("/api/banks/register-local", {
          name,
          walletAddress: wallet,
          jurisdiction,
          city,
          parentBankId,
          reserve: Number(reserve) || 0,
        });
      } catch {
        /* optional mirror */
      }
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/api/banks/register-local", {
        name,
        walletAddress: wallet,
        jurisdiction,
        city,
        parentBankId,
        reserve: Number(reserve) || 0,
      });
      toast.success(`Registered ${name}`);
      setName("");
      setWallet("");
      setCity("");
      setJurisdiction("");
      setReserve("0");
      if (!lockParent) setParentBankId("");
      onAfter();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
        <Plus className="h-4 w-4 text-gold-400" />
        Register a Local Bank
      </div>
      <div className="font-display text-xl font-semibold text-ink-100">
        Tier 3 onboarding
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <label className="label">Parent National Bank</label>
          <select
            className="input"
            value={parentBankId}
            onChange={(e) => setParentBankId(e.target.value)}
            disabled={lockParent}
          >
            <option value="">Select…</option>
            {national.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Display name</label>
          <input
            className="input"
            placeholder="e.g. Rajshahi Local Bank"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Wallet address</label>
          <input
            className="input font-mono"
            placeholder="0x…"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Jurisdiction</label>
            <input
              className="input"
              placeholder="Country"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              className="input"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Initial reserve (ETH, optional)</label>
          <input
            className="input"
            inputMode="decimal"
            value={reserve}
            onChange={(e) => setReserve(e.target.value)}
          />
        </div>
      </div>
      <button className="btn-primary mt-5" onClick={submit} disabled={submitting || chainBusy}>
        <Plus className="h-4 w-4" />
        {submitting || chainBusy ? "Registering…" : onChain ? "Register on-chain" : "Register"}
      </button>
    </div>
  );
}

function AccountCompliancePanel() {
  const [clientWallet, setClientWallet] = useState("");
  const { isConnected } = useAccount();
  const { write, busy } = useOnChainTx();

  function freeze() {
    if (!isConnected || !contractAddresses.localBank || !clientWallet) {
      toast.error("Connect wallet and enter client address");
      return;
    }
    write({
      address: contractAddresses.localBank,
      abi: localBankAdminAbi,
      functionName: "freezeAccount",
      args: [clientWallet as `0x${string}`],
    });
  }

  function unfreeze() {
    if (!isConnected || !contractAddresses.localBank || !clientWallet) return;
    write({
      address: contractAddresses.localBank,
      abi: localBankAdminAbi,
      functionName: "unfreezeAccount",
      args: [clientWallet as `0x${string}`],
    });
  }

  return (
    <div className="card p-6 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Compliance</div>
        <div className="font-display text-xl font-semibold text-ink-100">Freeze / unfreeze client</div>
        <p className="mt-1 text-sm text-ink-200">
          Block or restore a retail borrower wallet from requesting new loans.
        </p>
      </div>
      <input
        className="input font-mono"
        placeholder="Borrower wallet 0x…"
        value={clientWallet}
        onChange={(e) => setClientWallet(e.target.value)}
      />
      <div className="flex gap-2">
        <button className="btn-danger" onClick={freeze} disabled={busy}>
          Freeze account
        </button>
        <button className="btn-ghost" onClick={unfreeze} disabled={busy}>
          Unfreeze
        </button>
      </div>
    </div>
  );
}
