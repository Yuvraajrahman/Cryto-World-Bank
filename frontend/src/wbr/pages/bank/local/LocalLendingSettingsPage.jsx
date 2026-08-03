import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";

/**
 * Route: `/bank/local/lending-settings` — Local Bank kinked rate + LTV authority
 */
export default function LocalLendingSettingsPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    baseRateBps: "",
    slope1Bps: "",
    slope2Bps: "",
    kinkBps: "",
    maxLtvBps: "",
    note: "",
  });
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/local-bank/lending-settings");
      setData(d);
      const m = d.rateModel || {};
      setForm({
        baseRateBps: String(m.baseRateBps ?? 300),
        slope1Bps: String(m.slope1Bps ?? 500),
        slope2Bps: String(m.slope2Bps ?? 7500),
        kinkBps: String(m.kinkBps ?? 8000),
        maxLtvBps: String(m.maxLtvBps ?? 5000),
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
      await api.post("/api/local-bank/lending-settings", {
        baseRateBps: Number(form.baseRateBps),
        slope1Bps: Number(form.slope1Bps),
        slope2Bps: Number(form.slope2Bps),
        kinkBps: Number(form.kinkBps),
        maxLtvBps: Number(form.maxLtvBps),
        note: form.note || undefined,
      });
      toast.show("Lending parameters updated", { variant: "success" });
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
        <StateMessage title="Loading lending settings…" description="Kinked borrow APR and LTV cap." />
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

  const previews = data?.previews || {};

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Local Bank</p>
        <h1 className="client-title">Lending rate model</h1>
        <p className="client-lede">
          Adjust kinked utilization APR and collateral LTV for this branch&apos;s loan pool.
        </p>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button as={Link} to="/bank/local/dashboard" variant="ghost" showArrow={false}>
            Back to dashboard
          </Button>
          <Button type="button" onClick={() => setSheet(true)}>
            Edit parameters
          </Button>
        </div>
      </header>

      {data?.governanceNote ? <p className="client-lede">{data.governanceNote}</p> : null}

      <Glass className="client-panel" level={2}>
        <h2 className="client-panel-title">Current model</h2>
        <ul className="ops-stack">
          <li className="ops-row glass">
            <span>Base rate</span>
            <strong>{data?.rateModel?.baseRateBps ?? "—"} bps</strong>
          </li>
          <li className="ops-row glass">
            <span>Slope 1 / Slope 2</span>
            <strong>
              {data?.rateModel?.slope1Bps ?? "—"} / {data?.rateModel?.slope2Bps ?? "—"} bps
            </strong>
          </li>
          <li className="ops-row glass">
            <span>Kink</span>
            <strong>{data?.rateModel?.kinkBps ?? "—"} bps</strong>
          </li>
          <li className="ops-row glass">
            <span>Max LTV</span>
            <strong>{data?.rateModel?.maxLtvBps ?? "—"} bps</strong>
          </li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-2)" }}>
          Preview APR @ 50% util: {previews.at50UtilBps ?? "—"} bps · @ kink:{" "}
          {previews.atKinkBps ?? "—"} bps · @ 100%: {previews.at100UtilBps ?? "—"} bps
        </p>
      </Glass>

      <Sheet open={sheet} onClose={() => !busy && setSheet(false)} title="Edit lending parameters">
        <Input
          label="Base rate (bps)"
          value={form.baseRateBps}
          onChange={(e) => setForm((f) => ({ ...f, baseRateBps: e.target.value }))}
        />
        <Input
          label="Slope 1 (bps)"
          value={form.slope1Bps}
          onChange={(e) => setForm((f) => ({ ...f, slope1Bps: e.target.value }))}
        />
        <Input
          label="Slope 2 (bps)"
          value={form.slope2Bps}
          onChange={(e) => setForm((f) => ({ ...f, slope2Bps: e.target.value }))}
        />
        <Input
          label="Kink (bps)"
          value={form.kinkBps}
          onChange={(e) => setForm((f) => ({ ...f, kinkBps: e.target.value }))}
        />
        <Input
          label="Max LTV (bps)"
          value={form.maxLtvBps}
          onChange={(e) => setForm((f) => ({ ...f, maxLtvBps: e.target.value }))}
        />
        <Input
          label="Audit note"
          as="textarea"
          rows={2}
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void save()} disabled={busy}>
            Save
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(false)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
