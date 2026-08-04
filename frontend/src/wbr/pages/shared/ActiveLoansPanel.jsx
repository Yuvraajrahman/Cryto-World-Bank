/**
 * Active + pending loans for a lending bank (Local / National / World dashboards).
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

export default function ActiveLoansPanel({
  bankId,
  title = "Loan book",
  decisionBasePath,
}) {
  const toast = useToast();
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!bankId) return;
    const [all, queue] = await Promise.all([
      api.get(`/api/loans/bank/${bankId}`),
      api.get("/api/loans/queue").catch(() => ({ loans: [] })),
    ]);
    const loans = all.loans || [];
    setSummary(all.summary || null);
    setActive(loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED"));
    const q = (queue.loans || []).filter((l) => l.lenderBankId === bankId);
    setPending(q.length ? q : loans.filter((l) => l.status === "PENDING" || l.status === "INFO_REQUESTED"));
  }, [bankId]);

  useEffect(() => {
    void load().catch((err) => toast.show(err?.message || "Failed to load loans", { variant: "error" }));
  }, [load, toast]);

  async function approve(id) {
    setBusy(true);
    try {
      const r = await api.post(`/api/loans/${id}/approve`, {});
      toast.show(`Approved · lender reserve now ${formatUsdc(r.lenderReserveUsdc)}`, {
        variant: "success",
      });
      await load();
    } catch (err) {
      toast.show(err?.message || "Approve failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function reject(id) {
    setBusy(true);
    try {
      await api.post(`/api/loans/${id}/reject`, { reason: "Rejected by bank operator" });
      toast.show("Rejected", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err?.message || "Reject failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Glass className="client-panel" level={2}>
      <div className="client-section-head">
        <div>
          <h2 className="client-panel-title">{title}</h2>
          <p className="client-lede" style={{ margin: 0 }}>
            Pending requests await approval (cuts reserve). Active loans are the funded book.
          </p>
        </div>
        <div className="quick-actions">
          {summary ? (
            <Badge>
              {summary.pending} pending · {summary.active} active ·{" "}
              {formatUsdc(summary.activeValueUsdc)}
            </Badge>
          ) : null}
          <Button type="button" variant="ghost" showArrow={false} disabled={busy} onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </div>

      <h3 className="client-section-title" style={{ marginTop: 16 }}>
        Pending
      </h3>
      {pending.length === 0 ? (
        <p className="client-lede">No pending loan requests.</p>
      ) : (
        <ul className="activity-list">
          {pending.map((l) => (
            <li key={l.id} className="activity-row glass">
              <div>
                <strong>
                  {formatUsdc(l.amount)} · {l.kind?.replaceAll("_", " ")}
                </strong>
                <span>
                  {l.termMonths} mo · {l.installments?.length || "—"} installments · {l.purpose}
                  {l.borrowerId ? ` · client ${l.borrowerId}` : ""}
                  {l.bankRequesterId ? ` · bank ${l.bankRequesterId}` : ""}
                </span>
              </div>
              <div className="quick-actions">
                {decisionBasePath ? (
                  <Button as={Link} to={`${decisionBasePath}/${l.id}`} variant="ghost" showArrow={false}>
                    Review
                  </Button>
                ) : null}
                <Button type="button" disabled={busy} onClick={() => void approve(l.id)}>
                  Approve
                </Button>
                <Button type="button" variant="ghost" showArrow={false} disabled={busy} onClick={() => void reject(l.id)}>
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="client-section-title" style={{ marginTop: 20 }}>
        Active loans
      </h3>
      {active.length === 0 ? (
        <p className="client-lede">No active loans yet.</p>
      ) : (
        <ul className="activity-list">
          {active.slice(0, 40).map((l) => (
            <li key={l.id} className="activity-row glass">
              <div>
                <strong>{formatUsdc(l.amount)}</strong>
                <span>
                  {l.status} · {l.termMonths} mo · approved{" "}
                  {l.approvedAt ? new Date(l.approvedAt).toLocaleString() : "—"}
                </span>
              </div>
              <Badge icon="check">{l.id.slice(0, 12)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Glass>
  );
}
