import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";

function formatEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${Number(n).toFixed(3)} ETH`;
}

function pct(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${(Number(n) * 100).toFixed(1)}%`;
}

/**
 * Route: `/bank/national/local-banks` — plan J.36
 */
export default function LocalBanksPage() {
  const toast = useToast();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    walletAddress: "",
    city: "",
    jurisdiction: "Bangladesh",
    reserve: "0",
  });
  const [paramsForm, setParamsForm] = useState({ name: "", aprBps: "800" });

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/national-bank/local-banks");
      setBanks(d.banks || []);
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

  async function register() {
    setBusy(true);
    try {
      await api.post("/api/national-bank/local-banks", {
        name: form.name,
        walletAddress: form.walletAddress,
        city: form.city,
        jurisdiction: form.jurisdiction,
        reserve: Number(form.reserve) || 0,
      });
      toast.show("Local Bank registered", { variant: "success" });
      setSheet(null);
      setForm({ name: "", walletAddress: "", city: "", jurisdiction: "Bangladesh", reserve: "0" });
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function togglePause() {
    if (!target) return;
    setBusy(true);
    try {
      const paused = (target.status || "ACTIVE") === "PAUSED";
      await api.post(
        `/api/national-bank/local-banks/${target.id}/${paused ? "unpause" : "pause"}`,
      );
      toast.show(paused ? "Unpaused" : "Paused", { variant: "success" });
      setSheet(null);
      setTarget(null);
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function saveParams() {
    if (!target) return;
    setBusy(true);
    try {
      await api.post(`/api/national-bank/local-banks/${target.id}/params`, {
        name: paramsForm.name || undefined,
        aprBps: Number(paramsForm.aprBps),
      });
      toast.show("Parameters updated", { variant: "success" });
      setSheet(null);
      setTarget(null);
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
        <p className="eyebrow">Hierarchy</p>
        <h1 className="client-title">Local Bank management</h1>
        <p className="client-lede">
          Register branches under this National Bank, pause in emergencies, and tune APR.
        </p>
      </header>

      <div className="quick-actions">
        <Button type="button" onClick={() => setSheet("register")}>
          Register Local Bank
        </Button>
      </div>

      {loading && banks.length === 0 ? (
        <StateMessage title="Loading roster…" description="Child Local Banks." />
      ) : null}
      {error && banks.length === 0 ? (
        <StateMessage
          title="Roster unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      ) : null}
      {!loading && banks.length === 0 && !error ? (
        <StateMessage variant="empty" title="No Local Banks" description="Register the first branch." />
      ) : null}

      <ul className="ops-stack">
        {banks.map((lb) => (
          <li key={lb.id} className="ops-row glass">
            <div>
              <strong>{lb.name}</strong>
              <span>
                {lb.city} · ratio {pct(lb.capital?.reserveRatio)} · book{" "}
                {formatEth(lb.loanBook?.activeValueEth)}
              </span>
              <code style={{ display: "block", fontSize: 11, marginTop: 4 }}>{lb.walletAddress}</code>
            </div>
            <div className="ops-row-meta">
              <Badge icon={(lb.status || "ACTIVE") === "PAUSED" ? "alert" : "check"}>
                {lb.status || "ACTIVE"}
              </Badge>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                showArrow={false}
                onClick={() => {
                  setTarget(lb);
                  setParamsForm({ name: lb.name, aprBps: String(lb.aprBps ?? 800) });
                  setSheet("params");
                }}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                showArrow={false}
                onClick={() => {
                  setTarget(lb);
                  setSheet("pause");
                }}
              >
                {(lb.status || "ACTIVE") === "PAUSED" ? "Unpause" : "Pause"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Sheet open={sheet === "register"} onClose={() => !busy && setSheet(null)} title="Register Local Bank">
        <div className="settings-fields">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input
            label="Admin wallet"
            value={form.walletAddress}
            onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))}
            placeholder="0x…"
          />
          <Input label="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          <Input
            label="Jurisdiction"
            value={form.jurisdiction}
            onChange={(e) => setForm((f) => ({ ...f, jurisdiction: e.target.value }))}
          />
          <Input
            label="Initial reserve (ETH)"
            type="number"
            value={form.reserve}
            onChange={(e) => setForm((f) => ({ ...f, reserve: e.target.value }))}
          />
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void register()}
            disabled={
              busy ||
              form.name.length < 2 ||
              form.city.length < 2 ||
              !/^0x[a-fA-F0-9]{40}$/.test(form.walletAddress)
            }
          >
            Confirm register
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={sheet === "pause"}
        onClose={() => !busy && setSheet(null)}
        title={(target?.status || "ACTIVE") === "PAUSED" ? "Unpause Local Bank" : "Pause Local Bank"}
      >
        <p className="client-lede">
          {(target?.status || "ACTIVE") === "PAUSED"
            ? `Restore lending operations for ${target?.name}?`
            : `Emergency pause ${target?.name}? New allocations and lending at this branch should stop until unpaused.`}
        </p>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void togglePause()} disabled={busy}>
            Confirm
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === "params"} onClose={() => !busy && setSheet(null)} title="Edit parameters">
        <div className="settings-fields">
          <Input
            label="Display name"
            value={paramsForm.name}
            onChange={(e) => setParamsForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Borrow APR (bps)"
            type="number"
            value={paramsForm.aprBps}
            onChange={(e) => setParamsForm((f) => ({ ...f, aprBps: e.target.value }))}
          />
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void saveParams()} disabled={busy}>
            Save
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
