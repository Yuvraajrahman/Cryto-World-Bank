import { useEffect, useState } from "react";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";

/**
 * Route: `/bank/local?tab=aml` — plan I.34
 */
export default function AmlAlertsPage() {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("OPEN");
  const [sheet, setSheet] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [auditNote, setAuditNote] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get(`/api/local-bank/aml?status=${status}`);
      setAlerts(d.alerts || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [status]);

  async function openDetail(id) {
    try {
      const d = await api.get(`/api/local-bank/aml/${id}`);
      setDetail(d);
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    }
  }

  async function act(action) {
    if (!detail?.alert || reason.trim().length < 3) return;
    setBusy(true);
    try {
      const r = await api.post(`/api/local-bank/aml/${detail.alert.id}/${action}`, {
        reason: reason.trim(),
      });
      setAuditNote(r.auditId || r.sarRef || "recorded");
      toast.show(`${action} recorded`, { variant: "success" });
      setSheet(null);
      setReason("");
      setDetail(null);
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Compliance</p>
        <h1 className="client-title">AML alert review</h1>
        <p className="client-lede">
          Isolation Forest flags on client activity — dismiss, escalate a SAR, or freeze.
        </p>
      </header>

      {auditNote ? (
        <div className="notice">
          Action recorded for audit: <code>{auditNote}</code>
        </div>
      ) : null}

      <div className="ops-toolbar">
        <label className="ops-filter">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="OPEN">Open</option>
            <option value="DISMISSED">Dismissed</option>
            <option value="ESCALATED">Escalated</option>
            <option value="FROZEN">Frozen</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>

      {loading && alerts.length === 0 ? (
        <StateMessage title="Loading alerts…" description="Anomaly queue for this branch." />
      ) : null}

      {error && alerts.length === 0 ? (
        <StateMessage
          title="AML queue unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      ) : null}

      {!loading && alerts.length === 0 && !error ? (
        <StateMessage
          variant="empty"
          title="No alerts"
          description={status === "OPEN" ? "No open AML flags — all caught up." : "Nothing in this filter."}
        />
      ) : null}

      <div className="ops-split">
        <ul className="ops-stack">
          {alerts.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={`ops-row glass${detail?.alert?.id === a.id ? " ops-row-active" : ""}`}
                onClick={() => void openDetail(a.id)}
              >
                <div>
                  <strong>{a.clientName}</strong>
                  <span>
                    Score {(a.anomalyScore * 100).toFixed(0)} ·{" "}
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
                <Badge icon="alert">{a.status}</Badge>
              </button>
            </li>
          ))}
        </ul>

        <Glass className="client-panel ops-detail" level={2}>
          {!detail ? (
            <StateMessage
              variant="empty"
              title="Select an alert"
              description="Open a row to see model output and client history."
            />
          ) : (
            <>
              <Badge icon="alert">Score {(detail.alert.anomalyScore * 100).toFixed(0)}</Badge>
              <h2 className="client-panel-title" style={{ fontSize: "1.25rem" }}>
                {detail.alert.clientName}
              </h2>
              <p className="client-lede">{detail.alert.reason}</p>
              <code style={{ fontSize: 12 }}>{detail.alert.clientWallet}</code>
              {detail.model ? (
                <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-2)" }}>
                  Isolation Forest {detail.model.isolationForestScore} ·{" "}
                  {detail.model.flag ? "FLAGGED" : "below threshold"}
                </p>
              ) : null}

              {(detail.clientHistory || []).length > 0 ? (
                <ul className="ops-stack" style={{ marginTop: 12 }}>
                  {detail.clientHistory.map((h) => (
                    <li key={h.id} className="ops-row glass">
                      <div>
                        <strong>{h.id}</strong>
                        <span>{h.status}</span>
                      </div>
                      <code>{Number(h.amount).toFixed(3)} USDC</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-3)" }}>No loan history</p>
              )}

              {detail.alert.status === "OPEN" ? (
                <div className="quick-actions" style={{ marginTop: 14 }}>
                  <Button type="button" onClick={() => setSheet("dismiss")} disabled={busy}>
                    Dismiss
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    showArrow={false}
                    onClick={() => setSheet("escalate")}
                    disabled={busy}
                  >
                    Escalate SAR
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    showArrow={false}
                    onClick={() => setSheet("freeze")}
                    disabled={busy}
                  >
                    Freeze
                  </Button>
                </div>
              ) : (
                <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-3)" }}>
                  Resolved: {detail.alert.resolutionNote || detail.alert.status}
                </p>
              )}
            </>
          )}
        </Glass>
      </div>

      {["dismiss", "escalate", "freeze"].map((action) => (
        <Sheet
          key={action}
          open={sheet === action}
          onClose={() => !busy && setSheet(null)}
          title={
            action === "dismiss"
              ? "Dismiss alert"
              : action === "escalate"
                ? "Escalate / generate SAR"
                : "Freeze account"
          }
        >
          {action === "freeze" ? (
            <p className="client-lede">
              Freezing blocks client access. Confirm only if the anomaly warrants an immediate hold
              (demo records off-chain; wire LocalBank.freezeAccount for production).
            </p>
          ) : null}
          <Input
            label="Reason (audit log)"
            as="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="quick-actions" style={{ marginTop: 12 }}>
            <Button
              type="button"
              onClick={() => void act(action)}
              disabled={busy || reason.trim().length < 3}
            >
              Confirm {action}
            </Button>
            <Button
              type="button"
              variant="ghost"
              showArrow={false}
              onClick={() => setSheet(null)}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        </Sheet>
      ))}
    </div>
  );
}
