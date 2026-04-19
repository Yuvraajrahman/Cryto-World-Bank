import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Coins,
  Info,
  FilePlus2,
  Shield,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { api, BankDTO, BorrowingLimits } from "@/lib/api";

export function RequestLoan() {
  const nav = useNavigate();
  const [principal, setPrincipal] = useState("2.5");
  const [termMonths, setTermMonths] = useState(12);
  const [purpose, setPurpose] = useState("Working capital for a small business");
  const [category, setCategory] = useState("Working Capital");
  const [submitting, setSubmitting] = useState(false);
  const [localBanks, setLocalBanks] = useState<BankDTO[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [limits, setLimits] = useState<BorrowingLimits | null>(null);
  const [gasEth, setGasEth] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [banks, lim] = await Promise.all([
        api.get<{ worldBank: BankDTO; nationalBanks: BankDTO[]; localBanks: BankDTO[] }>(
          "/api/banks",
        ),
        api
          .get<BorrowingLimits>("/api/profile/limits")
          .catch(() => null),
      ]);
      setLocalBanks(banks.localBanks);
      if (!selectedBankId && banks.localBanks[0]) setSelectedBankId(banks.localBanks[0].id);
      setLimits(lim);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Simulate gas estimation — small ETH cost that refreshes every few seconds.
    setGasEth(Number((0.002 + Math.random() * 0.003).toFixed(5)));
    const t = setInterval(() => setGasEth(Number((0.002 + Math.random() * 0.003).toFixed(5))), 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apr = 0.08;
  const principalNum = Number(principal) || 0;
  const { interest, total, monthly, finalAmount } = useMemo(() => {
    const int = (principalNum * apr * termMonths) / 12;
    const tot = principalNum + int;
    const m = termMonths > 0 ? tot / termMonths : 0;
    return { interest: int, total: tot, monthly: m, finalAmount: principalNum - gasEth };
  }, [principalNum, termMonths, gasEth]);

  const limitsWarning = useMemo(() => {
    if (!limits) return null;
    if (principalNum <= 0) return null;
    if (principalNum > limits.sixMonth.remaining) {
      return {
        kind: "error",
        text: `Exceeds 6-month remaining limit (${limits.sixMonth.remaining.toFixed(2)} ETH).`,
      };
    }
    if (principalNum > limits.oneYear.remaining) {
      return {
        kind: "error",
        text: `Exceeds 1-year remaining limit (${limits.oneYear.remaining.toFixed(2)} ETH).`,
      };
    }
    if (limits.activeLoanCount >= limits.maxActiveLoans) {
      return {
        kind: "error",
        text: `You already have ${limits.activeLoanCount} of ${limits.maxActiveLoans} allowed active loans. Repay one before requesting more.`,
      };
    }
    const bank = localBanks.find((b) => b.id === selectedBankId);
    if (bank && principalNum > bank.reserve) {
      return {
        kind: "error",
        text: `${bank.name} currently has only ${bank.reserve.toFixed(2)} ETH in reserve.`,
      };
    }
    return { kind: "ok", text: "Within limits." };
  }, [principalNum, limits, localBanks, selectedBankId]);

  async function submit() {
    if (!selectedBankId) {
      toast.error("Select a local bank");
      return;
    }
    if (limitsWarning?.kind === "error") {
      toast.error(limitsWarning.text);
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/api/loans", {
        amount: principalNum,
        termMonths,
        purpose,
        localBankId: selectedBankId,
        category,
      });
      toast.success("Loan request submitted — awaiting approver review");
      nav("/app/loans");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Apply"
        title="Request a Loan"
        description="Submit an on-chain loan request to your Local Bank. Approvals are logged immutably; repayment schedules are auto-generated above the 100 ETH threshold."
        right={
          <button className="btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {limits ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="stat">
            <div className="stat-label">6-month remaining</div>
            <div className="stat-value">{limits.sixMonth.remaining.toFixed(2)} ETH</div>
            <div className="text-xs text-ink-200">of {limits.sixMonth.limit.toFixed(2)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">1-year remaining</div>
            <div className="stat-value">{limits.oneYear.remaining.toFixed(2)} ETH</div>
            <div className="text-xs text-ink-200">of {limits.oneYear.limit.toFixed(2)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Active loans</div>
            <div className="stat-value">
              {limits.activeLoanCount} / {limits.maxActiveLoans}
            </div>
            <div className="text-xs text-ink-200">
              {limits.exceptionApplied ? "Good-history exception" : "Standard cap"}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Gas cost (est.)</div>
            <div className="stat-value">{gasEth.toFixed(5)} ETH</div>
            <div className="text-xs text-ink-200">
              Deducted from disbursed amount
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="label">Principal (ETH)</label>
              <input
                inputMode="decimal"
                className="input"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
              <p className="mt-1 text-xs text-ink-200">
                Between 0.1 and 500 ETH
                {limits ? ` · max ${Math.min(limits.sixMonth.remaining, limits.oneYear.remaining).toFixed(2)} ETH` : ""}
              </p>
            </div>
            <div>
              <label className="label">Term (months)</label>
              <input
                type="number"
                min={1}
                max={60}
                className="input"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-ink-200">Maximum 60 months</p>
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Small Business</option>
                <option>Agriculture</option>
                <option>Education</option>
                <option>Housing</option>
                <option>Working Capital</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Local Bank</label>
              <select
                className="input"
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
              >
                {localBanks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} · {b.reserve.toFixed(0)} ETH capacity
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Purpose</label>
              <textarea
                rows={3}
                className="input resize-none"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
              <p className="mt-1 text-xs text-ink-200">10–500 characters</p>
            </div>
          </div>

          {limitsWarning ? (
            <div
              className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                limitsWarning.kind === "error"
                  ? "border-red-700/40 bg-red-900/10 text-red-200"
                  : "border-emerald-700/30 bg-emerald-900/10 text-emerald-200"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {limitsWarning.kind === "error" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {limitsWarning.text}
              </span>
            </div>
          ) : null}

          <div className="mt-6 rounded-xl border border-gold-700/30 bg-gold-900/10 p-4 text-xs text-gold-200">
            <div className="mb-1 flex items-center gap-2 font-medium">
              <Shield className="h-4 w-4" />
              Integrity notice
            </div>
            Your request is cryptographically signed by your wallet and emits a public
            <span className="mx-1 font-mono">LoanRequested</span>
            event on chain. Approvers see the same payload you see.
          </div>

          <div className="mt-6 flex gap-3">
            <button
              className="btn-primary"
              onClick={submit}
              disabled={submitting || limitsWarning?.kind === "error"}
            >
              <FilePlus2 className="h-4 w-4" />
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
            <button className="btn-ghost" onClick={() => nav(-1)}>
              Cancel
            </button>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
                Cost preview
              </div>
              <div className="font-display text-xl font-semibold text-ink-100">
                Loan summary
              </div>
            </div>
            <span className="badge-gold">
              <Coins className="h-3.5 w-3.5" />
              {(apr * 100).toFixed(2)}% APR
            </span>
          </div>

          <dl className="space-y-3">
            {[
              { k: "Principal", v: `${principalNum.toFixed(4)} ETH` },
              { k: "Gas cost (est.)", v: `${gasEth.toFixed(5)} ETH` },
              { k: "Net to wallet", v: `${Math.max(0, finalAmount).toFixed(4)} ETH` },
              { k: "Interest", v: `${interest.toFixed(4)} ETH` },
              { k: "Total owed", v: `${total.toFixed(4)} ETH`, highlight: true },
              { k: "Monthly installment", v: `${monthly.toFixed(4)} ETH` },
              {
                k: "# Installments",
                v: principalNum >= 100 ? `${termMonths} (auto)` : "1 (lump sum)",
              },
            ].map((r) => (
              <div
                key={r.k}
                className="flex items-center justify-between rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-2.5 text-sm"
              >
                <dt className="text-ink-200">{r.k}</dt>
                <dd
                  className={`font-mono ${
                    r.highlight ? "gold-text text-base font-semibold" : "text-ink-100"
                  }`}
                >
                  {r.v}
                </dd>
              </div>
            ))}
          </dl>

          <div className="divider my-5" />

          <div className="space-y-2 text-xs text-ink-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-gold-400" />
              Reviewed by a human approver + optional ML risk score
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-gold-400" />
              Funds disbursed directly to your wallet on approval
            </div>
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 text-gold-400" />
              Loans ≥ 100 ETH auto-schedule monthly installments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
