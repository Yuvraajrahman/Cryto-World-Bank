import { SectionHeader } from "@/components/ui/SectionHeader";
import { CalendarClock, CheckCircle2, Coins, CircleDollarSign } from "lucide-react";

export function Installments() {
  const installments = Array.from({ length: 12 }).map((_, i) => ({
    idx: i + 1,
    due: new Date(2026, 2 + i, 15).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    amount: 0.4521,
    paid: i < 4,
    txHash: i < 4 ? `0x${Math.random().toString(16).slice(2, 10)}…${Math.random().toString(16).slice(2, 6)}` : null,
  }));

  const paid = installments.filter((x) => x.paid).length;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Lifecycle"
        title="Installment Schedule"
        description="Your repayment plan lives on-chain. Pay a single installment, prepay, or audit any transition at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="stat">
          <div className="stat-label">Loan</div>
          <div className="stat-value">#1024</div>
        </div>
        <div className="stat">
          <div className="stat-label">Progress</div>
          <div className="stat-value">{paid} / {installments.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Remaining</div>
          <div className="stat-value">
            {((installments.length - paid) * installments[0].amount).toFixed(3)} ETH
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Next due</div>
          <div className="stat-value">{installments[paid]?.due ?? "—"}</div>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Repayment timeline</div>
            <div className="font-display text-xl font-semibold text-ink-100">12-month schedule</div>
          </div>
          <button className="btn-primary">
            <CircleDollarSign className="h-4 w-4" />
            Pay next installment
          </button>
        </div>

        <div className="relative">
          <div aria-hidden className="absolute left-3.5 top-0 h-full w-px bg-gold-700/30" />
          <ul className="space-y-3">
            {installments.map((x) => (
              <li
                key={x.idx}
                className="relative flex items-center justify-between rounded-xl border border-ink-600/60 bg-ink-900/60 px-4 py-3 pl-10"
              >
                <span
                  aria-hidden
                  className={`absolute left-2 flex h-4 w-4 items-center justify-center rounded-full border ${
                    x.paid
                      ? "border-emerald-500/70 bg-emerald-500/30"
                      : "border-gold-600/60 bg-gold-700/10"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      x.paid ? "bg-emerald-300" : "bg-gold-300"
                    }`}
                  />
                </span>
                <div className="flex items-center gap-4">
                  <div className="font-mono text-sm text-ink-200">#{x.idx.toString().padStart(2, "0")}</div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-ink-100">
                      <CalendarClock className="h-3.5 w-3.5 text-gold-400" />
                      {x.due}
                    </div>
                    {x.txHash ? (
                      <div className="mt-0.5 font-mono text-[11px] text-ink-200">tx {x.txHash}</div>
                    ) : (
                      <div className="mt-0.5 text-xs text-ink-200">Awaiting payment</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink-100">{x.amount.toFixed(4)} ETH</span>
                  {x.paid ? (
                    <span className="badge-green">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Paid
                    </span>
                  ) : (
                    <button className="btn-ghost text-xs">
                      <Coins className="h-3.5 w-3.5" />
                      Pay
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
