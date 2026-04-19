import { SectionHeader } from "@/components/ui/SectionHeader";
import { ShieldAlert, Sparkles, Sigma, Info } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const shapFeatures = [
  { feature: "prior_default_count", contribution: 0.35 },
  { feature: "principal_wei", contribution: 0.25 },
  { feature: "term_months", contribution: 0.05 },
  { feature: "tx_count_6m", contribution: -0.15 },
  { feature: "monthly_income_usd", contribution: -0.22 },
];

export function RiskConsole() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Risk · planned"
        title="AI Risk Console"
        description="Approver-facing view of the off-chain risk model. Currently stubbed — real Random Forest + Isolation Forest + SHAP integration lands in Sprint 3."
        right={
          <span className="badge-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Placeholder model
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="stat">
          <div className="stat-label">Risk score</div>
          <div className="stat-value gold-text">0.28</div>
          <div className="text-xs text-emerald-400">APPROVE</div>
        </div>
        <div className="stat">
          <div className="stat-label">Anomaly score</div>
          <div className="stat-value">0.12</div>
          <div className="text-xs text-ink-200">Isolation Forest</div>
        </div>
        <div className="stat">
          <div className="stat-label">Model</div>
          <div className="stat-value text-xl">stub-v0</div>
          <div className="text-xs text-ink-200">swap-in interface ready</div>
        </div>
        <div className="stat">
          <div className="stat-label">Upstream</div>
          <div className="stat-value text-xl">/api/risk</div>
          <div className="text-xs text-ink-200">FastAPI · :8000</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">SHAP Attribution</div>
              <div className="font-display text-xl font-semibold text-ink-100">
                What moved the decision
              </div>
            </div>
            <span className="badge-gold">
              <Sigma className="h-3.5 w-3.5" />
              Explainable
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapFeatures} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#8a8b93" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  stroke="#8a8b93"
                  fontSize={12}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    background: "#101013",
                    border: "1px solid rgba(212,175,55,0.35)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="contribution" radius={[0, 8, 8, 0]}>
                  {shapFeatures.map((f, i) => (
                    <rect key={i} fill={f.contribution > 0 ? "#d4af37" : "#3aa675"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
            <ShieldAlert className="h-4 w-4 text-gold-400" />
            Current subject
          </div>
          <div className="font-display text-xl font-semibold text-ink-100">Loan #1024</div>
          <div className="mt-1 text-xs text-ink-200">0x7Af…921 · Dhaka LB</div>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Principal", "5.00 ETH"],
              ["Term", "12 months"],
              ["Prior defaults", "0"],
              ["Tx count (6m)", "38"],
              ["Monthly income", "$1,400 (verified)"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2"
              >
                <span className="text-ink-200">{k}</span>
                <span className="font-mono text-ink-100">{v}</span>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-gold-700/30 bg-gold-900/10 p-3 text-xs text-gold-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Final approvals are always human. The model's role is to surface
            evidence, not to overrule the approver.
          </div>
        </div>
      </div>
    </div>
  );
}
