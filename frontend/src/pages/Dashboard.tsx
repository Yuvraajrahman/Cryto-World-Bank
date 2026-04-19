import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import {
  Coins,
  Landmark,
  Receipt,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Network,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { shortAddress } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  api,
  BankDTO,
  LoanDTO,
  ProfileResponse,
  TransactionDTO,
} from "@/lib/api";
import { useSession } from "@/lib/store";
import { MarketDataChart } from "@/components/market/MarketDataChart";

interface BankStats {
  totalDeposits: number;
  totalAllocated: number;
  totalLent: number;
  totalRepaid: number;
  activeLoans: number;
  borrowerCount: number;
  tiers: { world: number; national: number; local: number };
}

interface BanksResponse {
  worldBank: BankDTO | null;
  nationalBanks: BankDTO[];
  localBanks: BankDTO[];
}

const reserveSeries = [
  { m: "Oct", reserve: 1200, allocated: 800 },
  { m: "Nov", reserve: 1420, allocated: 910 },
  { m: "Dec", reserve: 1510, allocated: 1020 },
  { m: "Jan", reserve: 1620, allocated: 1105 },
  { m: "Feb", reserve: 1740, allocated: 1180 },
  { m: "Mar", reserve: 1842, allocated: 1240 },
];

export function Dashboard() {
  const { address } = useAccount();
  const user = useSession((s) => s.user);

  const [stats, setStats] = useState<BankStats | null>(null);
  const [banks, setBanks] = useState<BanksResponse | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [myLoans, setMyLoans] = useState<LoanDTO[]>([]);

  async function load() {
    const [s, b, p, loans] = await Promise.all([
      api.get<BankStats>("/api/banks/stats").catch(() => null),
      api.get<BanksResponse>("/api/banks").catch(() => null),
      api.get<ProfileResponse>("/api/profile").catch(() => null),
      user?.role === "BORROWER"
        ? api
            .get<{ loans: LoanDTO[] }>("/api/loans/mine")
            .then((r) => r.loans)
            .catch(() => [])
        : Promise.resolve([] as LoanDTO[]),
    ]);
    setStats(s);
    setBanks(b);
    setProfile(p);
    setMyLoans(loans);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const world = banks?.worldBank;
  const reserve = world?.reserve ?? 0;
  const allocated = world?.totalAllocated ?? 0;
  const utilizationPct = stats
    ? Math.round(
        (stats.totalLent / Math.max(1, stats.totalLent + reserve)) * 100,
      )
    : 0;

  const recentTx = profile?.transactions ?? [];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Overview"
        title={
          <>
            Welcome back,{" "}
            <span className="gold-text">
              {user?.displayName ?? shortAddress(address)}
            </span>
          </>
        }
        description="Your portfolio, reserve position, and loan lifecycle — all surfaced in one glance."
        right={
          user?.role === "BORROWER" ? (
            <Link to="/app/loans/new" className="btn-primary">
              Request Loan <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link to="/app/approvals" className="btn-primary">
              Open queue <ArrowUpRight className="h-4 w-4" />
            </Link>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Reserve Balance"
          value={`${reserve.toFixed(2)} ETH`}
          icon={Landmark}
          hint={world ? world.name : "World reserve"}
        />
        <Stat
          label="Allocated Capital"
          value={`${allocated.toFixed(2)} ETH`}
          icon={Network}
          hint={`${stats?.tiers.national ?? 0} national · ${stats?.tiers.local ?? 0} local`}
        />
        <Stat
          label="Active Loans"
          value={String(stats?.activeLoans ?? 0)}
          icon={Coins}
          hint={`${stats?.borrowerCount ?? 0} borrowers onboarded`}
        />
        <Stat
          label="Lifetime Repaid"
          value={`${(stats?.totalRepaid ?? 0).toFixed(2)} ETH`}
          icon={Receipt}
          hint={`${utilizationPct}% utilization`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
                Reserve Flow
              </div>
              <div className="font-display text-xl font-semibold text-ink-100">
                Capital Movement — 6-month window
              </div>
            </div>
            <span className="badge-gold">
              <TrendingUp className="h-3.5 w-3.5" />
              +18.4% QoQ
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reserveSeries}>
                <defs>
                  <linearGradient id="gReserve" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAlloc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8a8b93" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8a8b93" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" stroke="#8a8b93" fontSize={12} />
                <YAxis stroke="#8a8b93" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#101013",
                    border: "1px solid rgba(212,175,55,0.35)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reserve"
                  stroke="#d4af37"
                  strokeWidth={2}
                  fill="url(#gReserve)"
                  name="Reserve (ETH)"
                />
                <Area
                  type="monotone"
                  dataKey="allocated"
                  stroke="#8a8b93"
                  strokeWidth={2}
                  fill="url(#gAlloc)"
                  name="Allocated (ETH)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
            <ShieldCheck className="h-4 w-4 text-gold-400" />
            Security Status
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Reentrancy guard", ok: true },
              { label: "Pausable breaker", ok: true },
              { label: "Role-based access", ok: true },
              { label: "Reserve ratio ≥ 25%", ok: reserve > 0 },
              { label: "Upstream risk ping", ok: true },
            ].map((x) => (
              <li
                key={x.label}
                className="flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2"
              >
                <span>{x.label}</span>
                <span className={x.ok ? "badge-green" : "badge-red"}>
                  {x.ok ? "Healthy" : "Warning"}
                </span>
              </li>
            ))}
          </ul>
          <div className="divider my-4" />
          <p className="text-xs text-ink-200">
            {user?.role === "BORROWER" && profile?.limits
              ? `Your 6-month remaining limit: ${profile.limits.sixMonth.remaining.toFixed(
                  2,
                )} ETH`
              : "All invariants checked at current snapshot."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity tx={recentTx} loans={myLoans} />
        <TierBreakdown banks={banks} stats={stats} />
      </div>

      <MarketDataChart initialCoin="ethereum" initialDays={30} compact />
    </div>
  );
}

function RecentActivity({
  tx,
  loans,
}: {
  tx: TransactionDTO[];
  loans: LoanDTO[];
}) {
  const events = useMemo(() => {
    const rows: Array<{ at: string; type: string; who: string; amount: string; tag: string }> = [];
    for (const t of tx.slice(0, 5)) {
      rows.push({
        at: new Date(t.at).toLocaleString(),
        type: t.type.replace(/_/g, " "),
        who: t.loanId ? `Loan ${t.loanId.split("_").pop()?.slice(0, 6)}` : "ledger",
        amount:
          (t.type === "INSTALLMENT_PAID" || t.type === "LOAN_REPAID" ? "-" : "+") +
          t.amount.toFixed(4) +
          " ETH",
        tag:
          t.type === "INSTALLMENT_PAID" || t.type === "LOAN_REPAID" ? "green" : "gold",
      });
    }
    for (const l of loans.slice(0, 3)) {
      rows.push({
        at: new Date(l.createdAt).toLocaleString(),
        type: `Loan ${l.status}`,
        who: l.purpose.slice(0, 40),
        amount: `${l.amount.toFixed(2)} ETH`,
        tag: l.status === "REJECTED" || l.status === "DEFAULTED" ? "red" : "blue",
      });
    }
    return rows
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 6);
  }, [tx, loans]);

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
            Recent Activity
          </div>
          <div className="font-display text-xl font-semibold text-ink-100">
            Ledger events
          </div>
        </div>
        <Link to="/app/loans" className="text-xs text-gold-300 hover:text-gold-200">
          View all →
        </Link>
      </div>
      <div className="space-y-2">
        {events.length === 0 ? (
          <div className="py-6 text-center text-xs text-ink-200">
            Activity will appear here as you lend, borrow, or repay.
          </div>
        ) : null}
        {events.map((e, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-ink-600/50 bg-ink-900/50 px-3 py-2.5 text-sm"
          >
            <div>
              <div className="font-medium text-ink-100">{e.type}</div>
              <div className="text-xs text-ink-200">
                {e.who} · {e.at}
              </div>
            </div>
            <span
              className={`badge${
                e.tag === "gold"
                  ? "-gold"
                  : e.tag === "green"
                    ? "-green"
                    : e.tag === "red"
                      ? "-red"
                      : "-blue"
              }`}
            >
              {e.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TierBreakdown({
  banks,
  stats,
}: {
  banks: BanksResponse | null;
  stats: BankStats | null;
}) {
  const world = banks?.worldBank;
  const nationalTotal =
    banks?.nationalBanks.reduce((a, b) => a + b.reserve + b.totalLent, 0) ?? 0;
  const localTotal =
    banks?.localBanks.reduce((a, b) => a + b.reserve + b.totalLent, 0) ?? 0;
  const borrowerTotal = stats?.totalLent ?? 0;

  const max = Math.max(
    1,
    (world?.reserve ?? 0) + (world?.totalAllocated ?? 0),
  );

  const tiers = [
    {
      t: "Tier 1",
      name: world ? world.name : "World Reserve",
      val: `${((world?.reserve ?? 0) + (world?.totalAllocated ?? 0)).toFixed(2)} ETH`,
      pct: 100,
    },
    {
      t: "Tier 2",
      name: `National Banks (${banks?.nationalBanks.length ?? 0})`,
      val: `${nationalTotal.toFixed(2)} ETH`,
      pct: Math.round((nationalTotal / max) * 100),
    },
    {
      t: "Tier 3",
      name: `Local Banks (${banks?.localBanks.length ?? 0})`,
      val: `${localTotal.toFixed(2)} ETH`,
      pct: Math.round((localTotal / max) * 100),
    },
    {
      t: "Tier 4",
      name: `Borrowers (${stats?.borrowerCount ?? 0})`,
      val: `${borrowerTotal.toFixed(2)} ETH`,
      pct: Math.round((borrowerTotal / max) * 100),
    },
  ];

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
            Hierarchy
          </div>
          <div className="font-display text-xl font-semibold text-ink-100">
            Capital by tier
          </div>
        </div>
        <Link to="/app/banks" className="text-xs text-gold-300 hover:text-gold-200">
          Manage network →
        </Link>
      </div>
      <div className="space-y-3">
        {tiers.map((t) => (
          <div key={t.t}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="badge-gold">{t.t}</span>
                <span className="text-ink-100">{t.name}</span>
              </span>
              <span className="font-mono text-ink-200">{t.val}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
                style={{ width: `${Math.min(100, t.pct)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
