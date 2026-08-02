import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

/** `/bank/world/national-banks` — plan K.40 */
export default function NationalBanksPage() {
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
    jurisdiction: "",
    reserve: "0",
  });
  const [paramsForm, setParamsForm] = useState({ name: "", aprBps: "500" });

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/world-bank/national-banks");
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
      const r = await api.post("/api/world-bank/national-banks", {
        ...form,
        reserve: Number(form.reserve) || 0,
        requireMultisig: true,
      });
      toast.show(
        r.pendingMultisig
          ? "Queued for 2-of-3 multisig — open Multisig console to co-sign"
          : "National Bank registered",
        { variant: "success" },
      );
      setSheet(null);
      setForm({ name: "", walletAddress: "", jurisdiction: "", reserve: "0" });
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
        `/api/world-bank/national-banks/${target.id}/${paused ? "unpause" : "pause"}`,
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
      await api.post(`/api/world-bank/national-banks/${target.id}/params`, {
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
        <h1 className="client-title">National Bank management</h1>
        <p className="client-lede">
          Register jurisdictions under the World Bank. Registration defaults to 2-of-3 multisig.
        </p>
      </header>

      <div className="quick-actions">
        <Button type="button" onClick={() => setSheet("register")}>
          Register National Bank
        </Button>
        <Button as={Link} to="/bank/world/multisig" variant="ghost" showArrow={false}>
          Multisig console
        </Button>
        <Button as={Link} to="/bank/world/dashboard" variant="ghost" showArrow={false}>
          Dashboard
        </Button>
      </div>

      {loading && banks.length === 0 ? (
        <StateMessage title="Loading nationals…" description="Jurisdiction roster." />
      ) : null}
      {error && banks.length === 0 ? (
        <StateMessage
          title="Roster unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      ) : null}

      <ul className="ops-stack">
        {banks.map((nb) => (
          <li key={nb.id} className="ops-row glass">
            <div>
              <strong>{nb.name}</strong>
              <span>
                {nb.jurisdiction} · {nb.localBankCount} locals · ratio{" "}
                {pct(nb.capital?.reserveRatio)}
              </span>
              <code style={{ display: "block", fontSize: 11, marginTop: 4 }}>{nb.walletAddress}</code>
            </div>
            <div className="ops-row-meta">
              <Badge icon={(nb.status || "ACTIVE") === "PAUSED" ? "alert" : "check"}>
                {nb.status || "ACTIVE"}
              </Badge>
              <code>{formatEth(nb.totalAllocated)} alloc</code>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                showArrow={false}
                onClick={() => {
                  setTarget(nb);
                  setParamsForm({ name: nb.name, aprBps: String(nb.aprBps ?? 500) });
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
                  setTarget(nb);
                  setSheet("pause");
                }}
              >
                {(nb.status || "ACTIVE") === "PAUSED" ? "Unpause" : "Pause"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Sheet open={sheet === "register"} onClose={() => !busy && setSheet(null)} title="Register National Bank">
        <p className="client-lede" style={{ marginBottom: 8 }}>
          Creates a multisig proposal (2-of-3). Co-sign and execute from the Multisig console.
        </p>
        <div className="settings-fields">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input
            label="Wallet"
            value={form.walletAddress}
            onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))}
            placeholder="0x…"
          />
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
              form.jurisdiction.length < 2 ||
              !/^0x[a-fA-F0-9]{40}$/.test(form.walletAddress)
            }
          >
            Queue multisig
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={sheet === "pause"}
        onClose={() => !busy && setSheet(null)}
        title={(target?.status || "ACTIVE") === "PAUSED" ? "Unpause National Bank" : "Pause National Bank"}
      >
        <p className="client-lede">
          {(target?.status || "ACTIVE") === "PAUSED"
            ? `Restore ${target?.name}?`
            : `Emergency pause ${target?.name} and its downward allocations?`}
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
            label="Name"
            value={paramsForm.name}
            onChange={(e) => setParamsForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="APR (bps)"
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
