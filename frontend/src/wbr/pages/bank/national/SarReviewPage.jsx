import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";

/**
 * Route: `/bank/national/sar-review` — plan J.38 SAR queue
 */
export default function SarReviewPage() {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("ESCALATED");
  const [sheet, setSheet] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [auditNote, setAuditNote] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get(`/api/national-bank/sar?status=${status}`);
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
      const d = await api.get(`/api/national-bank/sar/${id}`);
      setDetail(d);
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    }
  }

  async function act(action) {
    if (!detail?.alert || reason.trim().length < 3) return;
    setBusy(true);
    try {
      let path;
      let body = { reason: reason.trim() };
      if (action === "resolve") {
        path = `/api/national-bank/sar/${detail.alert.id}/resolve`;
      } else if (action === "freeze") {
        path = `/api/national-bank/sar/${detail.alert.id}/resolve`;
        body = { reason: reason.trim(), action: "freeze" };
      } else {
        path = `/api/national-bank/sar/${detail.alert.id}/escalate-world`;
      }
      const r = await api.post(path, body);
      setAuditNote(r.auditId || r.worldRef || "recorded");
      toast.show(
        action === "resolve"
          ? "SAR closed"
          : action === "freeze"
            ? "SAR closed and account frozen"
            : "Escalated to World Bank",
        { variant: "success" },
      );
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
        <h1 className="client-title">SAR review</h1>
        <p className="client-lede">
          Suspicious Activity Reports escalated from Local Bank AML desks. Close with a note or
          escalate to World Bank.
        </p>
      </header>

      {auditNote ? (
        <div className="notice">
          Action recorded: <code>{auditNote}</code>
        </div>
      ) : null}

      <div className="ops-toolbar">
        <label className="ops-filter">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ESCALATED">Open (escalated)</option>
            <option value="CLOSED">Closed</option>
            <option value="ESCALATED_WORLD">World escalated</option>
            <option value="all">All SAR statuses</option>
          </select>
        </label>
      </div>

      {loading && alerts.length === 0 ? (
        <StateMessage title="Loading SARs…" description="Escalations from child Local Banks." />
      ) : null}
      {error && alerts.length === 0 ? (
        <StateMessage
          title="SAR queue unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      ) : null}
      {!loading && alerts.length === 0 && !error ? (
        <StateMessage
          variant="empty"
          title="No SARs"
          description={
            status === "ESCALATED"
              ? "No escalations awaiting National review."
              : "Nothing in this filter."
          }
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
                    {a.localBank?.name || a.bankId} · score {(a.anomalyScore * 100).toFixed(0)}
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
              title="Select a SAR"
              description="Open a row for evidence, history, and decisions."
            />
          ) : (
            <>
              <Badge icon="alert">{detail.alert.sarRef}</Badge>
              <h2 className="client-panel-title" style={{ fontSize: "1.25rem" }}>
                {detail.alert.clientName}
              </h2>
              <p className="client-lede">{detail.alert.reason}</p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-2)" }}>
                Branch: {detail.alert.localBank?.name || detail.alert.bankId}
              </p>
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

              {detail.alert.status === "ESCALATED" ? (
                <div className="quick-actions" style={{ marginTop: 14 }}>
                  <Button type="button" onClick={() => setSheet("resolve")} disabled={busy}>
                    Close SAR
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    showArrow={false}
                    onClick={() => setSheet("freeze")}
                    disabled={busy}
                  >
                    Close &amp; freeze account
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    showArrow={false}
                    onClick={() => setSheet("world")}
                    disabled={busy}
                  >
                    Escalate to World
                  </Button>
                  <Button
                    as={Link}
                    to="/bank/local/aml-alerts"
                    variant="ghost"
                    showArrow={false}
                  >
                    Local AML
                  </Button>
                </div>
              ) : (
                <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-3)" }}>
                  {detail.alert.resolutionNote || detail.alert.status}
                </p>
              )}
            </>
          )}
        </Glass>
      </div>

      <Sheet open={sheet === "resolve"} onClose={() => !busy && setSheet(null)} title="Close SAR">
        <Input
          label="Resolution note"
          as="textarea"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void act("resolve")}
            disabled={busy || reason.trim().length < 3}
          >
            Confirm close
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === "freeze"} onClose={() => !busy && setSheet(null)} title="Close SAR and freeze account">
        <p className="client-lede">
          Closes the SAR and marks the client account frozen (off-chain + on-chain when configured).
        </p>
        <Input
          label="Resolution note"
          as="textarea"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void act("freeze")}
            disabled={busy || reason.trim().length < 3}
          >
            Confirm freeze
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === "world"} onClose={() => !busy && setSheet(null)} title="Escalate to World Bank">
        <p className="client-lede">
          Forward this SAR to World Bank compliance. A World SAR reference will be recorded for the
          governance queue (Section K).
        </p>
        <Input
          label="Escalation reason"
          as="textarea"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void act("world")}
            disabled={busy || reason.trim().length < 3}
          >
            Confirm escalate
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
