import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  CheckCircle2,
  XCircle,
  Inbox,
  FileText,
  RefreshCw,
  User,
  FileSearch,
  Sparkles,
} from "lucide-react";
import { api, LoanDTO, UserDTO } from "@/lib/api";
import { useSession } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

interface IncomeProofQueueItem {
  id: string;
  userId: string;
  fileName: string;
  mimeType: string;
  sha256: string;
  monthlyIncomeUsd?: number;
  status: "UNSUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  borrower?: UserDTO;
}

interface RiskScoreResponse {
  riskScore: number;
  anomalyScore: number;
  recommendation: "APPROVE" | "REVIEW" | "REJECT";
  upstream: boolean;
  model?: string;
  shap?: Array<{ feature: string; contribution: number }>;
}

type Tab = "LOANS" | "INCOME";

export function Approvals() {
  const role = useSession((s) => s.role);
  const canReviewLoans =
    role === "APPROVER" ||
    role === "LOCAL_BANK_ADMIN" ||
    role === "NATIONAL_BANK_ADMIN" ||
    role === "OWNER";

  const [tab, setTab] = useState<Tab>("LOANS");
  const [loans, setLoans] = useState<LoanDTO[]>([]);
  const [borrowers, setBorrowers] = useState<Record<string, UserDTO>>({});
  const [income, setIncome] = useState<IncomeProofQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [risk, setRisk] = useState<Record<string, RiskScoreResponse>>({});

  async function load() {
    setLoading(true);
    try {
      const loanRes = await api.get<{ loans: LoanDTO[] }>("/api/loans/queue");
      setLoans(loanRes.loans);
      const borrowerIds = Array.from(
        new Set(loanRes.loans.map((l) => l.borrowerId).filter(Boolean)),
      ) as string[];
      const ub: Record<string, UserDTO> = {};
      await Promise.all(
        borrowerIds.map(async (id) => {
          try {
            const r = await api.get<UserDTO>(`/api/profile/users/${id}`);
            ub[id] = r;
          } catch {
            /* ignore */
          }
        }),
      );
      setBorrowers(ub);

      const inc = await api.get<{ proofs: IncomeProofQueueItem[] }>("/api/income/queue");
      setIncome(inc.proofs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approve(loan: LoanDTO) {
    setActing(loan.id);
    try {
      await api.post(`/api/loans/${loan.id}/approve`, { termMonths: loan.termMonths });
      toast.success("Loan approved — funds released");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setActing(null);
    }
  }

  async function reject(loan: LoanDTO) {
    const reason = rejectReason[loan.id]?.trim();
    if (!reason || reason.length < 3) {
      toast.error("Enter a reason (3+ chars)");
      return;
    }
    setActing(loan.id);
    try {
      await api.post(`/api/loans/${loan.id}/reject`, { reason });
      toast.success("Loan rejected");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setActing(null);
    }
  }

  async function fetchRisk(loan: LoanDTO) {
    const borrower = loan.borrowerId ? borrowers[loan.borrowerId] : undefined;
    try {
      const r = await api.post<RiskScoreResponse>("/api/risk/score", {
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
      setRisk((prev) => ({ ...prev, [loan.id]: r }));
    } catch {
      toast.error("Risk score unavailable");
    }
  }

  async function reviewIncome(id: string, decision: "APPROVED" | "REJECTED") {
    const notes = rejectReason[id]?.trim();
    if (decision === "REJECTED" && (!notes || notes.length < 3)) {
      toast.error("Reviewer note required for rejection");
      return;
    }
    setActing(id);
    try {
      await api.post(`/api/income/${id}/review`, { decision, notes });
      toast.success(`Income proof ${decision.toLowerCase()}`);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Review failed");
    } finally {
      setActing(null);
    }
  }

  const loanCount = loans.length;
  const incomeCount = income.length;

  const filtered = useMemo(() => (tab === "LOANS" ? loans : []), [tab, loans]);

  if (!canReviewLoans) {
    return (
      <div className="space-y-8">
        <SectionHeader
          eyebrow="Review"
          title="Approvals Queue"
          description="Only approvers, bank admins, and the governor can review the queue."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Review"
        title="Approvals Queue"
        description="Pending loan requests and income proofs routed to your role. Decisions are signed and logged immediately."
        right={
          <button className="btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="inline-flex rounded-xl border border-ink-600/60 bg-ink-900/60 p-1">
        <button
          className={`rounded-lg px-4 py-2 text-sm ${
            tab === "LOANS"
              ? "bg-gold-900/20 text-gold-200"
              : "text-ink-200 hover:text-ink-100"
          }`}
          onClick={() => setTab("LOANS")}
        >
          <Inbox className="mr-2 inline h-4 w-4" />
          Loan requests
          <span className="ml-2 rounded-full bg-ink-800 px-2 py-0.5 text-[10px]">
            {loanCount}
          </span>
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm ${
            tab === "INCOME"
              ? "bg-gold-900/20 text-gold-200"
              : "text-ink-200 hover:text-ink-100"
          }`}
          onClick={() => setTab("INCOME")}
        >
          <FileText className="mr-2 inline h-4 w-4" />
          Income proofs
          <span className="ml-2 rounded-full bg-ink-800 px-2 py-0.5 text-[10px]">
            {incomeCount}
          </span>
        </button>
      </div>

      {tab === "LOANS" ? (
        filtered.length === 0 && !loading ? (
          <EmptyState
            icon={Inbox}
            title="No pending loan requests"
            description="When a borrower submits a request funded by your bank, it will appear here."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((l) => {
              const borrower = l.borrowerId ? borrowers[l.borrowerId] : undefined;
              const isOpen = expanded === l.id;
              const r = risk[l.id];
              return (
                <div
                  key={l.id}
                  className="card p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-700/40 bg-gold-900/20 text-gold-300">
                        <User className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-medium text-ink-100">
                          {borrower?.displayName ?? "Borrower"}{" "}
                          <span className="ml-1 text-xs font-normal text-ink-200">
                            · {l.category ?? "Uncategorized"}
                          </span>
                        </div>
                        <div className="text-xs text-ink-200">
                          {borrower?.country ?? "—"} · requested {formatDateTime(l.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="text-right">
                        <div className="font-mono text-gold-300">
                          {l.amount.toFixed(4)} ETH
                        </div>
                        <div className="text-xs text-ink-200">
                          {l.termMonths} mo · {(l.aprBps / 100).toFixed(2)}% APR
                        </div>
                      </div>
                      <button
                        className="btn-ghost"
                        onClick={() => setExpanded(isOpen ? null : l.id)}
                      >
                        <FileSearch className="h-4 w-4" />
                        {isOpen ? "Hide" : "Review"}
                      </button>
                    </div>
                  </div>

                  {isOpen ? (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl border border-ink-600/60 bg-ink-900/60 p-3 text-sm">
                        <div className="text-xs uppercase tracking-[0.22em] text-ink-200">
                          Purpose
                        </div>
                        <div className="mt-1 text-ink-100">{l.purpose}</div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        {[
                          ["Prior paid", `${borrower?.consecutivePaidLoans ?? 0}`],
                          [
                            "Lifetime borrowed",
                            `${(borrower?.totalBorrowedLifetime ?? 0).toFixed(2)} ETH`,
                          ],
                          [
                            "Income / mo",
                            borrower?.monthlyIncomeUsd
                              ? `$${borrower.monthlyIncomeUsd.toLocaleString()}`
                              : "Unverified",
                          ],
                          ["Gas cost", l.gasCostEth ? `${l.gasCostEth} ETH` : "—"],
                        ].map(([k, v]) => (
                          <div
                            key={k}
                            className="rounded-lg border border-ink-600/60 bg-ink-950/60 px-3 py-2"
                          >
                            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-200">
                              {k}
                            </div>
                            <div className="mt-0.5 font-mono text-sm text-ink-100">{v}</div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-gold-700/30 bg-gold-900/10 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold-300">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI risk signal
                          </div>
                          <button className="btn-ghost text-xs" onClick={() => fetchRisk(l)}>
                            {r ? "Re-run" : "Fetch risk score"}
                          </button>
                        </div>
                        {r ? (
                          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-200">
                                Risk
                              </div>
                              <div className="font-mono text-lg text-ink-100">
                                {r.riskScore.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-200">
                                Anomaly
                              </div>
                              <div className="font-mono text-lg text-ink-100">
                                {r.anomalyScore.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-200">
                                Decision
                              </div>
                              <div
                                className={`mt-0.5 text-sm ${
                                  r.recommendation === "APPROVE"
                                    ? "badge-green"
                                    : r.recommendation === "REJECT"
                                      ? "badge-red"
                                      : "badge-gold"
                                }`}
                              >
                                {r.recommendation}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-gold-100/80">
                            Click to fetch the ML risk score. Sprint 3 integrates SHAP
                            feature attribution.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="label">Rejection reason (if rejecting)</label>
                        <input
                          className="input"
                          placeholder="e.g. Unverified income, incomplete purpose"
                          value={rejectReason[l.id] ?? ""}
                          onChange={(e) =>
                            setRejectReason((r) => ({ ...r, [l.id]: e.target.value }))
                          }
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="btn-primary"
                          onClick={() => approve(l)}
                          disabled={acting === l.id}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {acting === l.id ? "Approving…" : "Approve & fund"}
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => reject(l)}
                          disabled={acting === l.id}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )
      ) : income.length === 0 && !loading ? (
        <EmptyState
          icon={FileText}
          title="Nothing to review"
          description="Uploaded income proofs waiting for review will show up here."
        />
      ) : (
        <div className="space-y-3">
          {income.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-700/40 bg-gold-900/20 text-gold-300">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-medium text-ink-100">
                      {p.borrower?.displayName ?? p.userId}
                      <span className="ml-2 text-xs text-ink-200">
                        · {p.borrower?.country ?? "—"}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-ink-200">
                      {p.fileName} · SHA-256 {p.sha256.slice(0, 12)}…
                    </div>
                    {p.monthlyIncomeUsd ? (
                      <div className="text-xs text-gold-300">
                        Claimed income: ${p.monthlyIncomeUsd.toLocaleString()} / mo
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    className="btn-ghost"
                    href={`${
                      import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"
                    }/api/income/${p.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileSearch className="h-4 w-4" />
                    View file
                  </a>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                <input
                  className="input"
                  placeholder="Reviewer note (required if rejecting)"
                  value={rejectReason[p.id] ?? ""}
                  onChange={(e) =>
                    setRejectReason((r) => ({ ...r, [p.id]: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <button
                    className="btn-primary"
                    onClick={() => reviewIncome(p.id, "APPROVED")}
                    disabled={acting === p.id}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => reviewIncome(p.id, "REJECTED")}
                    disabled={acting === p.id}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
