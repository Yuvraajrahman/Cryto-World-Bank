import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  CalendarClock,
  CheckCircle2,
  Coins,
  CircleDollarSign,
  AlertTriangle,
  Clock,
  Receipt,
} from "lucide-react";
import { api, LoanDTO } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";

export function Installments() {
  const [loans, setLoans] = useState<LoanDTO[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get<{ loans: LoanDTO[] }>("/api/loans/mine");
      const active = r.loans.filter(
        (l) => l.status === "ACTIVE" || l.status === "APPROVED",
      );
      setLoans(active);
      if (active.length > 0 && !activeId) {
        setActiveId(active[0].id);
      } else if (active.length === 0) {
        setActiveId(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loan = useMemo(() => loans.find((l) => l.id === activeId), [loans, activeId]);

  async function pay(index: number) {
    if (!loan) return;
    setPaying(index);
    try {
      await api.post(`/api/loans/${loan.id}/installments/${index}/pay`);
      toast.success(`Installment #${index} paid`);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(null);
    }
  }

  async function payFull() {
    if (!loan) return;
    setPaying(0);
    try {
      await api.post(`/api/loans/${loan.id}/repay`);
      toast.success("Loan fully repaid");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Repayment failed");
    } finally {
      setPaying(null);
    }
  }

  if (!loading && loans.length === 0) {
    return (
      <div className="space-y-8">
        <SectionHeader
          eyebrow="Lifecycle"
          title="Installment Schedule"
          description="Your repayment plan lives on-chain. Pay a single installment, prepay, or audit any transition at a glance."
        />
        <EmptyState
          icon={Receipt}
          title="No active loans yet"
          description="Once an approver accepts a request, your installment schedule will show up here."
          action={
            <Link to="/app/loans/new" className="btn-primary">
              Request a loan
            </Link>
          }
        />
      </div>
    );
  }

  const paidCount = loan?.installments.filter((x) => x.paid).length ?? 0;
  const total = loan?.installments.length ?? 0;
  const next = loan?.installments.find((x) => !x.paid);
  const daysToNext = next
    ? Math.ceil((new Date(next.dueDate).getTime() - Date.now()) / 86400000)
    : null;
  const overdue = daysToNext !== null && daysToNext < 0;
  const outstanding =
    loan?.installments.filter((i) => !i.paid).reduce((a, i) => a + i.amount, 0) ?? 0;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Lifecycle"
        title="Installment Schedule"
        description="Your repayment plan lives on-chain. Pay a single installment, prepay, or audit any transition at a glance."
        right={
          loans.length > 1 ? (
            <select
              className="btn-ghost"
              value={activeId ?? ""}
              onChange={(e) => setActiveId(e.target.value)}
            >
              {loans.map((l) => (
                <option key={l.id} value={l.id}>
                  Loan #{l.id.split("_").pop()?.slice(0, 8)} — {l.amount} ETH
                </option>
              ))}
            </select>
          ) : null
        }
      />

      {loan ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="stat">
              <div className="stat-label">Loan</div>
              <div className="stat-value">#{loan.id.split("_").pop()?.slice(0, 8)}</div>
              <div className="text-xs text-ink-200">{loan.amount.toFixed(2)} ETH</div>
            </div>
            <div className="stat">
              <div className="stat-label">Progress</div>
              <div className="stat-value">
                {paidCount} / {total || 1}
              </div>
              <div className="text-xs text-ink-200">
                {loan.isInstallment ? "installments paid" : "single payment"}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Outstanding</div>
              <div className="stat-value">
                {(loan.isInstallment ? outstanding : loan.amount).toFixed(3)} ETH
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">{loan.isInstallment ? "Next due" : "Deadline"}</div>
              <div className="stat-value">
                {loan.isInstallment
                  ? next
                    ? new Date(next.dueDate).toLocaleDateString()
                    : "Done"
                  : loan.deadline
                    ? new Date(loan.deadline).toLocaleDateString()
                    : "—"}
              </div>
              {daysToNext !== null ? (
                <div className={`text-xs ${overdue ? "text-red-300" : "text-ink-200"}`}>
                  {overdue
                    ? `${Math.abs(daysToNext)} day(s) overdue`
                    : `${daysToNext} day(s) remaining`}
                </div>
              ) : null}
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
                  Repayment timeline
                </div>
                <div className="font-display text-xl font-semibold text-ink-100">
                  {loan.isInstallment
                    ? `${loan.termMonths}-month schedule`
                    : "Single payment"}
                </div>
              </div>
              {loan.isInstallment ? (
                next ? (
                  <button
                    className="btn-primary"
                    onClick={() => pay(next.index)}
                    disabled={paying !== null}
                  >
                    <CircleDollarSign className="h-4 w-4" />
                    {paying === next.index
                      ? "Paying…"
                      : `Pay installment #${next.index}`}
                  </button>
                ) : (
                  <span className="badge-green">All paid</span>
                )
              ) : (
                <button
                  className="btn-primary"
                  onClick={payFull}
                  disabled={paying !== null}
                >
                  <CircleDollarSign className="h-4 w-4" />
                  {paying !== null ? "Paying…" : "Repay loan"}
                </button>
              )}
            </div>

            {loan.isInstallment ? (
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute left-3.5 top-0 h-full w-px bg-gold-700/30"
                />
                <ul className="space-y-3">
                  {loan.installments.map((x) => {
                    const isNext = next?.index === x.index;
                    const d = new Date(x.dueDate);
                    const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
                    const isOverdue = !x.paid && days < 0;
                    return (
                      <li
                        key={x.index}
                        className={`relative flex items-center justify-between rounded-xl border bg-ink-900/60 px-4 py-3 pl-10 ${
                          isNext
                            ? "border-gold-700/50"
                            : isOverdue
                              ? "border-red-700/40"
                              : "border-ink-600/60"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute left-2 flex h-4 w-4 items-center justify-center rounded-full border ${
                            x.paid
                              ? "border-emerald-500/70 bg-emerald-500/30"
                              : isOverdue
                                ? "border-red-500/70 bg-red-500/30"
                                : "border-gold-600/60 bg-gold-700/10"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              x.paid
                                ? "bg-emerald-300"
                                : isOverdue
                                  ? "bg-red-300"
                                  : "bg-gold-300"
                            }`}
                          />
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="font-mono text-sm text-ink-200">
                            #{x.index.toString().padStart(2, "0")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-ink-100">
                              <CalendarClock className="h-3.5 w-3.5 text-gold-400" />
                              {d.toLocaleDateString()}
                              {!x.paid ? (
                                <span
                                  className={`text-xs ${
                                    isOverdue ? "text-red-300" : "text-ink-200"
                                  }`}
                                >
                                  · {isOverdue ? `overdue ${-days}d` : `${days}d`}
                                </span>
                              ) : null}
                            </div>
                            {x.txHash ? (
                              <div className="mt-0.5 font-mono text-[11px] text-ink-200">
                                tx {x.txHash.slice(0, 10)}…{x.txHash.slice(-4)}
                              </div>
                            ) : (
                              <div className="mt-0.5 text-xs text-ink-200">
                                {isOverdue ? (
                                  <span className="inline-flex items-center gap-1 text-red-300">
                                    <AlertTriangle className="h-3 w-3" /> Overdue
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Awaiting payment
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-ink-100">
                            {x.amount.toFixed(4)} ETH
                          </span>
                          {x.paid ? (
                            <span className="badge-green">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Paid
                            </span>
                          ) : (
                            <button
                              className="btn-ghost text-xs"
                              onClick={() => pay(x.index)}
                              disabled={paying !== null}
                            >
                              <Coins className="h-3.5 w-3.5" />
                              {paying === x.index ? "Paying…" : "Pay"}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-ink-600/60 bg-ink-900/60 p-6 text-sm text-ink-200">
                This is a single-payment loan. You can repay{" "}
                <span className="font-mono text-gold-300">
                  {loan.amount.toFixed(4)} ETH
                </span>{" "}
                any time before{" "}
                {loan.deadline ? new Date(loan.deadline).toLocaleDateString() : "the deadline"}.
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
