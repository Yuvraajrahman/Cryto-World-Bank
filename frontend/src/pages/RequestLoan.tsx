import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, Coins, Info, FilePlus2, Shield } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function RequestLoan() {
  const nav = useNavigate();
  const [principal, setPrincipal] = useState("2.5");
  const [termMonths, setTermMonths] = useState(12);
  const [purpose, setPurpose] = useState("Working capital");
  const [category, setCategory] = useState("Small Business");
  const [submitting, setSubmitting] = useState(false);

  const apr = 0.08;
  const { interest, total, monthly } = useMemo(() => {
    const p = Number(principal) || 0;
    const int = (p * apr * termMonths) / 12;
    const tot = p + int;
    const m = termMonths > 0 ? tot / termMonths : 0;
    return { interest: int, total: tot, monthly: m };
  }, [principal, termMonths]);

  async function submit() {
    try {
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 900));
      toast.success("Loan request submitted — awaiting approver review");
      nav("/app/loans");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Apply"
        title="Request a Loan"
        description="Submit an on-chain loan request to your Local Bank. Approvals are logged immutably; repayment schedules are auto-generated above the threshold."
      />

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
              <p className="mt-1 text-xs text-ink-200">Between 0.1 and 500 ETH</p>
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
              <select className="input">
                <option>Dhaka Local Bank</option>
                <option>Chittagong Local Bank</option>
                <option>Lagos Local Bank</option>
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
            </div>
          </div>

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
            <button className="btn-primary" onClick={submit} disabled={submitting}>
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
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Cost preview</div>
              <div className="font-display text-xl font-semibold text-ink-100">Loan summary</div>
            </div>
            <span className="badge-gold">
              <Coins className="h-3.5 w-3.5" />
              {(apr * 100).toFixed(2)}% APR
            </span>
          </div>

          <dl className="space-y-3">
            {[
              { k: "Principal", v: `${Number(principal || 0).toFixed(2)} ETH` },
              { k: "Interest", v: `${interest.toFixed(4)} ETH` },
              { k: "Total owed", v: `${total.toFixed(4)} ETH`, highlight: true },
              { k: "Monthly installment", v: `${monthly.toFixed(4)} ETH` },
              { k: "# Installments", v: Number(principal) >= 100 ? "12 (auto)" : "1 (lump sum)" },
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
              Loans {">"} 100 ETH auto-schedule 12 monthly installments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
