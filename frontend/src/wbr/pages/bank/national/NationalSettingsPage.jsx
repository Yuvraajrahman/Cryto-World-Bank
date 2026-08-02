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
 * Route: `/bank/national/settings` — plan J.38 settings
 */
export default function NationalSettingsPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    aprBps: "",
    minReserveRatio: "",
    kinkBps: "",
    kinkMultiplierBps: "",
    note: "",
  });
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/national-bank/settings");
      setData(d);
      setForm({
        aprBps: String(d.params?.aprBps ?? 500),
        minReserveRatio: String(Math.round((d.params?.minReserveRatio ?? 0.15) * 1000) / 10),
        kinkBps: String(d.params?.kinkBps ?? 8000),
        kinkMultiplierBps: String(d.params?.kinkMultiplierBps ?? 15000),
        note: "",
      });
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    setBusy(true);
    try {
      await api.post("/api/national-bank/settings", {
        aprBps: Number(form.aprBps),
        minReserveRatio: Number(form.minReserveRatio) / 100,
        kinkBps: Number(form.kinkBps),
        kinkMultiplierBps: Number(form.kinkMultiplierBps),
        note: form.note || undefined,
      });
      toast.show("Parameters updated", { variant: "success" });
      setSheet(false);
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
        <StateMessage title="Loading settings…" description="Rate and reserve parameters." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Settings unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      </div>
    );
  }

  const p = data.params;

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Policy</p>
        <h1 className="client-title">Rate & reserve settings</h1>
        <p className="client-lede">
          Jurisdiction baselines for lending APR and minimum reserve ratio.{" "}
          {data.governanceNote}
        </p>
      </header>

      <Glass className="client-panel" level={2}>
        <Badge icon="settings">Current</Badge>
        <div className="client-grid-2" style={{ marginTop: 12 }}>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Lending APR</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{p.aprBps} bps</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Min reserve ratio</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>
              {(p.minReserveRatio * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Kink utilization</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{p.kinkBps} bps</p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Kink multiplier</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>{p.kinkMultiplierBps} bps</p>
          </div>
        </div>
        <div className="quick-actions" style={{ marginTop: 14 }}>
          <Button type="button" onClick={() => setSheet(true)}>
            Propose change
          </Button>
        </div>
      </Glass>

      <section className="client-section">
        <h2 className="client-section-title">Change history</h2>
        {(data.history || []).length === 0 ? (
          <StateMessage variant="empty" title="No changes yet" description="Edits will appear here." />
        ) : (
          <ul className="ops-stack">
            {data.history.map((h) => (
              <li key={h.id} className="ops-row glass">
                <div>
                  <strong>{h.field}</strong>
                  <span>
                    {h.fromValue} → {h.toValue}
                    {h.note ? ` · ${h.note}` : ""}
                  </span>
                </div>
                <code>{h.at ? new Date(h.at).toLocaleDateString() : "—"}</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Sheet open={sheet} onClose={() => !busy && setSheet(false)} title="Update parameters">
        <p className="client-lede" style={{ marginBottom: 8 }}>
          Demo applies immediately. Production would require multisig / timelock confirmation.
        </p>
        <div className="settings-fields">
          <Input
            label="APR (bps)"
            type="number"
            value={form.aprBps}
            onChange={(e) => setForm((f) => ({ ...f, aprBps: e.target.value }))}
          />
          <Input
            label="Min reserve ratio (%)"
            type="number"
            step="0.1"
            value={form.minReserveRatio}
            onChange={(e) => setForm((f) => ({ ...f, minReserveRatio: e.target.value }))}
          />
          <Input
            label="Kink point (bps)"
            type="number"
            value={form.kinkBps}
            onChange={(e) => setForm((f) => ({ ...f, kinkBps: e.target.value }))}
          />
          <Input
            label="Kink multiplier (bps)"
            type="number"
            value={form.kinkMultiplierBps}
            onChange={(e) => setForm((f) => ({ ...f, kinkMultiplierBps: e.target.value }))}
          />
          <Input
            label="Note"
            as="textarea"
            rows={2}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void save()} disabled={busy}>
            Confirm update
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(false)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
