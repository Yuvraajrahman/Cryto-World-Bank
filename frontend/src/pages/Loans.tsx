import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FilePlus2, Coins, ArrowUpRight, Filter } from "lucide-react";
import { api, LoanDTO, LoanStatus } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { useSession } from "@/lib/store";

const statusStyle: Record<LoanStatus, string> = {
  PENDING: "badge-blue",
  APPROVED: "badge-gold",
  ACTIVE: "badge-gold",
  REPAID: "badge-green",
  REJECTED: "badge-red",
  DEFAULTED: "badge-red",
};

export function Loans() {
  const user = useSession((s) => s.user);
  const [loans, setLoans] = useState<LoanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LoanStatus | "ALL">("ALL");

  async function load() {
    setLoading(true);
    try {
      if (user?.role === "BORROWER") {
        const r = await api.get<{ loans: LoanDTO[] }>("/api/loans/mine");
        setLoans(r.loans);
      } else if (user?.bankId) {
        const r = await api.get<{ loans: LoanDTO[] }>(`/api/loans/bank/${user.bankId}`);
        setLoans(r.loans);
      } else {
        setLoans([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.bankId]);

  const filtered = useMemo(
    () => (statusFilter === "ALL" ? loans : loans.filter((l) => l.status === statusFilter)),
    [loans, statusFilter],
  );

  const totals = useMemo(() => {
    const total = loans.length;
    const active = loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED").length;
    const outstanding = loans
      .filter((l) => l.status === "ACTIVE" || l.status === "APPROVED")
      .reduce((acc, l) => {
        if (!l.isInstallment) return acc + l.amount;
        const unpaid = l.installments.filter((i) => !i.paid).reduce((a, i) => a + i.amount, 0);
        return acc + unpaid;
      }, 0);
    const lifetimeRepaid = loans
      .filter((l) => l.status === "REPAID")
      .reduce((acc, l) => acc + l.amount, 0);
    return { total, active, outstanding, lifetimeRepaid };
  }, [loans]);

  const isBorrower = user?.role === "BORROWER";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Loans"
        title={isBorrower ? "Your Loan Portfolio" : "Bank Loan Portfolio"}
        description={
          isBorrower
            ? "Every loan you've requested, approved, or repaid — with an immutable on-chain link for each state transition."
            : "Loans currently funded by your bank. Every state transition is signed and auditable."
        }
        right={
          <>
            <select
              className="btn-ghost"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LoanStatus | "ALL")}
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="APPROVED">Approved</option>
              <option value="REPAID">Repaid</option>
              <option value="REJECTED">Rejected</option>
            </select>
            {isBorrower ? (
              <Link to="/app/loans/new" className="btn-primary">
                <FilePlus2 className="h-4 w-4" />
                Request Loan
              </Link>
            ) : (
              <Link to="/app/approvals" className="btn-primary">
                <Filter className="h-4 w-4" />
                Review Queue
              </Link>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="stat">
          <div className="stat-label">Total Loans</div>
          <div className="stat-value">{totals.total}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Currently Active</div>
          <div className="stat-value">{totals.active}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{totals.outstanding.toFixed(2)} ETH</div>
        </div>
        <div className="stat">
          <div className="stat-label">Lifetime Repaid</div>
          <div className="stat-value">{totals.lifetimeRepaid.toFixed(2)} ETH</div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-700/50 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-ink-200">
            <Coins className="h-4 w-4 text-gold-400" />
            {loading
              ? "Loading…"
              : `Showing ${filtered.length} of ${loans.length} loan${loans.length === 1 ? "" : "s"}`}
          </div>
          <span className="text-xs text-ink-200">
            Sorted by <span className="text-gold-300">Newest</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/60 text-[11px] uppercase tracking-[0.2em] text-ink-200">
              <tr>
                <th className="px-6 py-3 text-left">Loan</th>
                <th className="px-6 py-3 text-left">Principal</th>
                <th className="px-6 py-3 text-left">Term</th>
                <th className="px-6 py-3 text-left">APR</th>
                <th className="px-6 py-3 text-left">Purpose</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-ink-700/50 transition-colors hover:bg-ink-800/40">
                  <td className="px-6 py-4 font-mono text-gold-300">
                    #{l.id.split("_").pop()?.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-ink-100">{l.amount.toFixed(2)} ETH</td>
                  <td className="px-6 py-4 text-ink-200">{l.termMonths} mo</td>
                  <td className="px-6 py-4 text-ink-200">
                    {(l.aprBps / 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-ink-100 max-w-[260px] truncate" title={l.purpose}>
                    {l.purpose}
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusStyle[l.status]}>{l.status}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-ink-200">
                    {formatDateTime(l.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={isBorrower ? "/app/installments" : "/app/approvals"}
                      className="inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200"
                    >
                      Details <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-ink-200"
                  >
                    No loans yet.{" "}
                    {isBorrower ? (
                      <Link to="/app/loans/new" className="text-gold-300 hover:text-gold-200">
                        Request your first loan →
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
