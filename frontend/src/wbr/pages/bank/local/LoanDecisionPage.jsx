import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

/**
 * Authority Brief — Local or National (via apiBase / queuePath props).
 */
export default function LoanDecisionPage({
  apiBase = "/api/local-bank/approvals",
  queuePath = "/bank/local/approvals",
}) {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(null); // approve | reject | info
  const [reason, setReason] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const d = await api.get(`${apiBase}/${loanId}`);
      setData(d);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [loanId, apiBase]);

  async function onApprove() {
    setBusy(true);
    try {
      await api.post(`/api/loans/${loanId}/approve`, {});
      toast.show("Loan approved", { variant: "success" });
      setSheet(null);
      navigate(queuePath);
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onReject() {
    if (reason.trim().length < 3) return;
    setBusy(true);
    try {
      await api.post(`/api/loans/${loanId}/reject`, { reason: reason.trim() });
      toast.show("Loan rejected", { variant: "success" });
      setSheet(null);
      navigate(queuePath);
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onRequestInfo() {
    if (infoMsg.trim().length < 3) return;
    setBusy(true);
    try {
      await api.post(`${apiBase}/${loanId}/request-info`, {
        message: infoMsg.trim(),
      });
      toast.show("Info requested", { variant: "success" });
      setSheet(null);
      setInfoMsg("");
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="client-page">
        <StateMessage title="Loading brief…" description="Risk score, SHAP, and history." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Brief unavailable"
          description={error.message}
          action={{ label: "Back to queue", onClick: () => navigate(queuePath) }}
        />
      </div>
    );
  }

  const loan = data.loan;
  const brief = data.authorityBrief;
  const borrower = data.borrower;
  const requesterBank = data.requesterBank;
  const limits = data.limits;
  const isLocalLiquidity = loan.kind === "LOCAL_FROM_NATIONAL";
  const titleName =
    loan.applicantLabel ||
    borrower?.displayName ||
    requesterBank?.name ||
    "Applicant";

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Authority Brief</p>
        <h1 className="client-title">{titleName}</h1>
        <p className="client-lede">
          {formatUsdc(loan.amount)} · {loan.termMonths} mo ·{" "}
          {loan.kindLabel || String(loan.loanType || "loan")} · {loan.status}
        </p>
        <div className="client-hero-badges">
          {isLocalLiquidity ? (
            <Badge icon="node">{requesterBank?.city || requesterBank?.name || "Local bank"}</Badge>
          ) : (
            <>
              <Badge icon="passport">KYC1 {borrower?.kyc1Status || "—"}</Badge>
              <Badge icon="check">KYC2 {borrower?.kyc2Status || "—"}</Badge>
            </>
          )}
        </div>
      </header>

      <Glass className="client-panel" level={3}>
        <Badge icon={brief.recommendation === "APPROVE" ? "check" : "alert"}>
          {brief.recommendation}
        </Badge>
        <h2 className="client-panel-title">
          {(brief.riskScore * 100).toFixed(0)}
          <span className="muted"> risk score</span>
        </h2>
        <p className="client-lede">{brief.headline}</p>
        <p style={{ margin: 0, color: "var(--text-2)", fontSize: 14 }}>{brief.interpretation}</p>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-3)" }}>
          Audit: <code>{brief.auditRef}</code>
        </p>
      </Glass>

      <section className="client-section">
        <h2 className="client-section-title">SHAP drivers</h2>
        <ul className="ops-stack">
          {(brief.shap || []).map((s) => (
            <li key={s.feature} className="ops-row glass">
              <div>
                <strong>{s.feature}</strong>
                <span>{s.direction}</span>
              </div>
              <code>{(s.magnitude * 100).toFixed(0)}%</code>
            </li>
          ))}
        </ul>
      </section>

      <div className="client-grid-2">
        <Glass className="client-panel" level={2}>
          <h2 className="client-panel-title" style={{ fontSize: "1.15rem" }}>
            Model signals
          </h2>
          <p style={{ margin: 0, fontSize: 14 }}>
            RF fraud prob: <strong>{(brief.randomForestFraudProb * 100).toFixed(1)}%</strong>
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>
            Isolation Forest:{" "}
            <strong>{brief.isolationForestAnomaly ? "Anomaly flagged" : "No anomaly"}</strong>
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-3)" }}>{brief.disclaimer}</p>
        </Glass>
        <Glass className="client-panel" level={2}>
          <h2 className="client-panel-title" style={{ fontSize: "1.15rem" }}>
            {isLocalLiquidity ? "Requester bank" : "Limits"}
          </h2>
          {isLocalLiquidity ? (
            <>
              <p style={{ margin: 0, fontSize: 14 }}>
                <strong>{requesterBank?.name || "—"}</strong>
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 14 }}>{requesterBank?.city || "—"}</p>
            </>
          ) : limits ? (
            <>
              <p style={{ margin: 0, fontSize: 14 }}>
                6-month used {formatUsdc(limits.sixMonth?.borrowed)} /{" "}
                {formatUsdc(limits.sixMonth?.limit)}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 14 }}>
                Fits request:{" "}
                <strong>
                  {(limits.sixMonth?.remaining ?? 0) >= loan.amount ? "Yes" : "No — over cap"}
                </strong>
              </p>
            </>
          ) : (
            <p style={{ margin: 0, color: "var(--text-3)" }}>No limit projection</p>
          )}
        </Glass>
      </div>

      {(data.history || []).length > 0 ? (
        <section className="client-section">
          <h2 className="client-section-title">Prior loans</h2>
          <ul className="ops-stack">
            {data.history.map((h) => (
              <li key={h.id} className="ops-row glass">
                <div>
                  <strong>{h.id}</strong>
                  <span>{h.status}</span>
                </div>
                <code>{formatUsdc(h.amount)}</code>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {loan.status === "PENDING" || loan.status === "INFO_REQUESTED" ? (
        <div className="ops-decision-bar glass">
          <Button type="button" onClick={() => setSheet("approve")} disabled={busy}>
            Approve
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            onClick={() => setSheet("reject")}
            disabled={busy}
          >
            Reject
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            onClick={() => setSheet("info")}
            disabled={busy}
          >
            Request info
          </Button>
        </div>
      ) : (
        <StateMessage title={`Already ${loan.status}`} description="Return to the queue for open items." />
      )}

      <div className="quick-actions">
        <Button as={Link} to={queuePath} variant="ghost" showArrow={false}>
          Back to queue
        </Button>
      </div>

      <Sheet open={sheet === "approve"} onClose={() => !busy && setSheet(null)} title="Confirm approve">
        <p className="client-lede">
          Approve {formatUsdc(loan.amount)} for {titleName}? This records disbursement against
          lender reserve.
        </p>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void onApprove()} disabled={busy}>
            {busy ? "Working…" : "Confirm approve"}
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === "reject"} onClose={() => !busy && setSheet(null)} title="Reject loan">
        <Input
          label="Reason (shown to applicant)"
          as="textarea"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void onReject()} disabled={busy || reason.trim().length < 3}>
            Confirm reject
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === "info"} onClose={() => !busy && setSheet(null)} title="Request more info">
        <Input
          label="Message to applicant"
          as="textarea"
          rows={3}
          value={infoMsg}
          onChange={(e) => setInfoMsg(e.target.value)}
        />
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void onRequestInfo()}
            disabled={busy || infoMsg.trim().length < 3}
          >
            Send request
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
