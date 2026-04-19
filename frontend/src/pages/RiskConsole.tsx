import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  ShieldAlert,
  Sparkles,
  Sigma,
  Info,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, LoanDTO, UserDTO } from "@/lib/api";

interface RiskResponse {
  riskScore: number;
  anomalyScore: number;
  recommendation: "APPROVE" | "REVIEW" | "REJECT";
  upstream: boolean;
  model?: string;
  shap?: Array<{ feature: string; contribution: number }>;
  disclaimer?: string;
}

interface HealthResponse {
  ok: boolean;
  upstream: unknown;
}

export function RiskConsole() {
  const [loans, setLoans] = useState<LoanDTO[]>([]);
  const [borrowers, setBorrowers] = useState<Record<string, UserDTO>>({});
  const [selectedId, setSelectedId] = useState<string>("");
  const [score, setScore] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  async function loadQueue() {
    setLoading(true);
    try {
      const r = await api.get<{ loans: LoanDTO[] }>("/api/loans/queue");
      setLoans(r.loans);
      if (!selectedId && r.loans[0]) setSelectedId(r.loans[0].id);
      const ids = Array.from(
        new Set(r.loans.map((l) => l.borrowerId).filter(Boolean)),
      ) as string[];
      const map: Record<string, UserDTO> = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const u = await api.get<UserDTO>(`/api/profile/users/${id}`);
            map[id] = u;
          } catch {
            /* ignore */
          }
        }),
      );
      setBorrowers(map);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function loadHealth() {
    try {
      const h = await api.get<HealthResponse>("/api/risk/health");
      setHealth(h);
    } catch {
      setHealth({ ok: false, upstream: null });
    }
  }

  async function runScore(loan: LoanDTO | undefined) {
    if (!loan) return;
    setScoring(true);
    try {
      const borrower = loan.borrowerId ? borrowers[loan.borrowerId] : undefined;
      const r = await api.post<RiskResponse>("/api/risk/score", {
        loanId: loan.id,
        features: {
          principalEth: loan.amount,
          termMonths: loan.termMonths,
          priorDefaults: 0,
          consecutivePaidLoans: borrower?.consecutivePaidLoans ?? 0,
          monthlyIncomeUsd: borrower?.monthlyIncomeUsd ?? 0,
          txCount6m: 0,
        },
      });
      setScore(r);
    } finally {
      setScoring(false);
    }
  }

  useEffect(() => {
    loadQueue();
    loadHealth();
  }, []);

  useEffect(() => {
    if (selectedId) {
      const l = loans.find((x) => x.id === selectedId);
      runScore(l);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, loans.length]);

  const loan = loans.find((l) => l.id === selectedId);
  const borrower = loan?.borrowerId ? borrowers[loan.borrowerId] : undefined;

  const shap = score?.shap ?? [];

  const recommendationBadge =
    score?.recommendation === "APPROVE"
      ? "badge-green"
      : score?.recommendation === "REJECT"
        ? "badge-red"
        : "badge-gold";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Risk"
        title="AI Risk Console"
        description="Approver-facing view of the off-chain risk model. The backend tries the upstream FastAPI service first and falls back to a deterministic stub."
        right={
          <>
            <span className="badge-gold">
              <Sparkles className="h-3.5 w-3.5" />
              {score?.upstream ? "Upstream ML" : score?.model ?? "stub-v0"}
            </span>
            <button className="btn-ghost" onClick={loadQueue} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh queue
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="stat">
          <div className="stat-label">Risk score</div>
          <div className="stat-value gold-text">
            {score ? score.riskScore.toFixed(2) : "—"}
          </div>
          <div
            className={`text-xs ${
              score?.recommendation === "APPROVE"
                ? "text-emerald-400"
                : score?.recommendation === "REJECT"
                  ? "text-red-300"
                  : "text-gold-300"
            }`}
          >
            {score?.recommendation ?? "—"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Anomaly score</div>
          <div className="stat-value">
            {score ? score.anomalyScore.toFixed(2) : "—"}
          </div>
          <div className="text-xs text-ink-200">Isolation Forest</div>
        </div>
        <div className="stat">
          <div className="stat-label">Model</div>
          <div className="stat-value text-xl">{score?.model ?? "stub-v0"}</div>
          <div className="text-xs text-ink-200">
            {score?.upstream ? "Live upstream" : "Deterministic stub"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Upstream</div>
          <div className="stat-value text-xl">
            {health?.ok ? "Online" : "Offline"}
          </div>
          <div className="text-xs text-ink-200">FastAPI · :8000</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
                SHAP Attribution
              </div>
              <div className="font-display text-xl font-semibold text-ink-100">
                What moved the decision
              </div>
            </div>
            <span className="badge-gold">
              <Sigma className="h-3.5 w-3.5" />
              Explainable
            </span>
          </div>
          {shap.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shap} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#8a8b93" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    stroke="#8a8b93"
                    fontSize={12}
                    width={160}
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
                    {shap.map((f, i) => (
                      <Cell key={i} fill={f.contribution > 0 ? "#d4af37" : "#3aa675"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center text-sm text-ink-200">
              <AlertTriangle className="mb-2 h-6 w-6 text-gold-400" />
              Select a pending loan to compute a risk score.
            </div>
          )}
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
            <ShieldAlert className="h-4 w-4 text-gold-400" />
            Current subject
          </div>
          {loan ? (
            <>
              <div className="font-display text-xl font-semibold text-ink-100">
                Loan #{loan.id.split("_").pop()?.slice(0, 8)}
              </div>
              <div className="mt-1 text-xs text-ink-200">
                {borrower?.displayName ?? "Borrower"}
                {borrower?.country ? ` · ${borrower.country}` : ""}
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                {[
                  ["Principal", `${loan.amount.toFixed(2)} ETH`],
                  ["Term", `${loan.termMonths} months`],
                  ["APR", `${(loan.aprBps / 100).toFixed(2)}%`],
                  [
                    "Prior paid",
                    String(borrower?.consecutivePaidLoans ?? 0),
                  ],
                  [
                    "Monthly income",
                    borrower?.monthlyIncomeUsd
                      ? `$${borrower.monthlyIncomeUsd.toLocaleString()} (verified)`
                      : "Unverified",
                  ],
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
              <div className="mt-4">
                <label className="label">Switch subject</label>
                <select
                  className="input"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.id.split("_").pop()?.slice(0, 8)} · {l.amount.toFixed(2)} ETH
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn-primary mt-4 w-full"
                onClick={() => runScore(loan)}
                disabled={scoring}
              >
                <Sparkles className="h-4 w-4" />
                {scoring ? "Scoring…" : "Re-score"}
              </button>
            </>
          ) : (
            <div className="text-sm text-ink-200">
              No pending loans in the queue.
            </div>
          )}

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-gold-700/30 bg-gold-900/10 p-3 text-xs text-gold-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Final approvals are always human. The model's role is to surface
            evidence, not to overrule the approver.
          </div>

          {score?.recommendation ? (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-ink-600/60 bg-ink-900/60 p-3 text-sm">
              <span>Recommended</span>
              <span className={recommendationBadge}>{score.recommendation}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
