import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
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
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([
        api.get<BanksResponse>("/api/banks"),
        api.get<BankStats>("/api/banks/stats"),
      ]);
      setData(b);
      setStats(s);
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
            hint: `${(data?.worldBank?.reserve ?? 0).toFixed(0)} ETH reserve`,
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
  const [amount, setAmount] = useState("10");
  const [submitting, setSubmitting] = useState(false);

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
    if (!fromBankId || !toBankId) {
      toast.error("Select source and destination");
      return;
    }
    const amt = Number(amount);
    if (!(amt > 0)) {
      toast.error("Enter a positive amount");
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

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Capital flow</div>
          <div className="font-display text-xl font-semibold text-ink-100">
            Allocate reserve down the hierarchy
          </div>
          <p className="mt-1 text-sm text-ink-200">
            {isOwner
              ? "Move funds from the World Reserve to a National Bank."
              : "Move funds from your National Bank to one of your Local Banks."}
          </p>
        </div>
        <span className="badge-gold">
          <Shuffle className="h-3.5 w-3.5" />
          {isOwner ? "Governor" : "NB Admin"}
        </span>
      </div>

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
          <button className="btn-primary w-full" onClick={submit} disabled={submitting}>
            <Shuffle className="h-4 w-4" />
            {submitting ? "Allocating…" : "Allocate"}
          </button>
        </div>
      </div>
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

  async function submit() {
    if (!name || !wallet || !jurisdiction) {
      toast.error("Fill all fields");
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
      <button className="btn-primary mt-5" onClick={submit} disabled={submitting}>
        <Plus className="h-4 w-4" />
        {submitting ? "Registering…" : "Register"}
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

  useEffect(() => {
    if (defaultParentId && !parentBankId) setParentBankId(defaultParentId);
  }, [defaultParentId, parentBankId]);

  async function submit() {
    if (!name || !wallet || !jurisdiction || !city || !parentBankId) {
      toast.error("Fill all fields");
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
      <button className="btn-primary mt-5" onClick={submit} disabled={submitting}>
        <Plus className="h-4 w-4" />
        {submitting ? "Registering…" : "Register"}
      </button>
    </div>
  );
}
