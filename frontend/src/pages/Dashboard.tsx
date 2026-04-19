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

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Overview"
        title={<>Welcome back, <span className="gold-text">{shortAddress(address)}</span></>}
        description="Your portfolio, reserve position, and loan lifecycle — all surfaced in one glance."
        right={
          <Link to="/app/loans/new" className="btn-primary">
            Request Loan <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Reserve Balance"
          value="1,842.50 ETH"
          icon={Landmark}
          delta={{ value: "5.8%", positive: true }}
          hint="vs. last 30 days"
        />
        <Stat
          label="Allocated Capital"
          value="1,240.00 ETH"
          icon={Network}
          delta={{ value: "3.1%", positive: true }}
          hint="67% utilization"
        />
        <Stat
          label="Active Loans"
          value="87"
          icon={Coins}
          delta={{ value: "12", positive: true }}
          hint="new this month"
        />
        <Stat
          label="Repaid (90d)"
          value="298.35 ETH"
          icon={Receipt}
          delta={{ value: "1.2%", positive: false }}
          hint="default rate"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Reserve Flow</div>
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
              { label: "Reserve ratio ≥ 25%", ok: true },
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
            All invariants checked at block height <span className="font-mono text-gold-300">#5,281,942</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity />
        <TierBreakdown />
      </div>
    </div>
  );
}

function RecentActivity() {
  const events = [
    { at: "2m ago", type: "Loan Disbursed", who: "0x7Af…921", amount: "+5.00 ETH", tag: "gold" },
    { at: "18m ago", type: "Installment Paid", who: "0x31c…0aa", amount: "-0.42 ETH", tag: "green" },
    { at: "42m ago", type: "Capital Allocated", who: "NB · Nigeria", amount: "+75.00 ETH", tag: "gold" },
    { at: "1h ago", type: "Loan Requested", who: "0xD8b…e11", amount: "12.00 ETH", tag: "blue" },
    { at: "3h ago", type: "Repayment Recorded", who: "LB · Dhaka", amount: "-4.50 ETH", tag: "green" },
  ];
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Recent Activity</div>
          <div className="font-display text-xl font-semibold text-ink-100">Ledger events</div>
        </div>
        <Link to="/app/loans" className="text-xs text-gold-300 hover:text-gold-200">
          View all →
        </Link>
      </div>
      <div className="space-y-2">
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
            <span className={`badge${e.tag === "gold" ? "-gold" : e.tag === "green" ? "-green" : "-blue"}`}>
              {e.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TierBreakdown() {
  const tiers = [
    { t: "Tier 1", name: "World Bank Reserve", val: "1,842.50 ETH", pct: 100 },
    { t: "Tier 2", name: "National Banks (3)", val: "1,110.00 ETH", pct: 60 },
    { t: "Tier 3", name: "Local Banks (12)", val: "720.00 ETH", pct: 39 },
    { t: "Tier 4", name: "Borrowers (213)", val: "480.00 ETH", pct: 26 },
  ];
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Hierarchy</div>
          <div className="font-display text-xl font-semibold text-ink-100">Capital by tier</div>
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
                style={{ width: `${t.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
