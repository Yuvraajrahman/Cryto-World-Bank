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
 * Route: `/bank/local?tab=kyc` — plan I.32
 */
export default function KycReviewPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [reason, setReason] = useState("");
  const [escalate, setEscalate] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/local-bank/kyc-queue");
      setItems(d.items || []);
      setError(null);
      if (selected) {
        const still = (d.items || []).find((i) => i.id === selected.id);
        setSelected(still || null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function decide(decision) {
    if (!selected) return;
    if (decision === "REJECTED" && reason.trim().length < 3) return;
    setBusy(true);
    try {
      await api.post(`/api/local-bank/kyc-queue/${selected.id}/review`, {
        decision,
        reason: reason.trim() || undefined,
        escalateAml: escalate || undefined,
      });
      toast.show(decision === "APPROVED" ? "Approved" : "Rejected", { variant: "success" });
      setSheet(null);
      setReason("");
      setEscalate(false);
      setSelected(null);
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
        <p className="eyebrow">Documents</p>
        <h1 className="client-title">KYC & income review</h1>
        <p className="client-lede">
          Review pending identity and income submissions. Flag suspected fraud into the AML queue.
        </p>
      </header>

      {loading && items.length === 0 ? (
        <StateMessage title="Loading queue…" description="KYC and income proofs." />
      ) : null}

      {error && items.length === 0 ? (
        <StateMessage
          title="Queue unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      ) : null}

      {!loading && items.length === 0 && !error ? (
        <StateMessage
          variant="empty"
          title="Nothing to review"
          description="No pending KYC or income documents."
        />
      ) : null}

      <div className="ops-split">
        <ul className="ops-stack">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`ops-row glass${selected?.id === item.id ? " ops-row-active" : ""}`}
                onClick={() => setSelected(item)}
              >
                <div>
                  <strong>{item.applicant?.displayName || "Applicant"}</strong>
                  <span>
                    {item.kind} · {item.documentType} ·{" "}
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
                <Badge icon="clock">{item.status}</Badge>
              </button>
            </li>
          ))}
        </ul>

        <Glass className="client-panel ops-detail" level={2}>
          {!selected ? (
            <StateMessage
              variant="empty"
              title="Select a document"
              description="Open an item from the queue to review."
            />
          ) : (
            <>
              <Badge>{selected.kind}</Badge>
              <h2 className="client-panel-title" style={{ fontSize: "1.25rem" }}>
                {selected.applicant?.displayName || "Applicant"}
              </h2>
              <p className="client-lede">
                {selected.documentType}
                {selected.fileName ? ` · ${selected.fileName}` : ""}
              </p>
              <code style={{ fontSize: 12 }}>{selected.applicant?.wallet}</code>
              <div className="ops-doc-preview glass">
                <p style={{ margin: 0, color: "var(--text-3)", fontSize: 13 }}>
                  {selected.kind === "INCOME"
                    ? "Income proof on file (binary stored off-chain). Preview omitted in demo — approve or reject from metadata."
                    : "KYC package pending operator decision. On-chain hash linkage ships with production storage."}
                </p>
              </div>
              <div className="quick-actions" style={{ marginTop: 12 }}>
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
                  as={Link}
                  to="/bank/local?tab=aml"
                  variant="ghost"
                  showArrow={false}
                >
                  AML queue
                </Button>
              </div>
            </>
          )}
        </Glass>
      </div>

      <Sheet open={sheet === "approve"} onClose={() => !busy && setSheet(null)} title="Approve document">
        <label className="ops-check">
          <input type="checkbox" checked={escalate} onChange={(e) => setEscalate(e.target.checked)} />
          Also escalate AML alert
        </label>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void decide("APPROVED")} disabled={busy}>
            Confirm approve
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === "reject"} onClose={() => !busy && setSheet(null)} title="Reject document">
        <Input
          label="Reason (required)"
          as="textarea"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <label className="ops-check">
          <input type="checkbox" checked={escalate} onChange={(e) => setEscalate(e.target.checked)} />
          Escalate to AML
        </label>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void decide("REJECTED")}
            disabled={busy || reason.trim().length < 3}
          >
            Confirm reject
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
