import { useEffect, useState } from "react";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";

function formatEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${Number(n).toFixed(3)} ETH`;
}

function short(w) {
  if (!w) return "—";
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

/** `/bank/world/multisig` — plan K.41 (2-of-3) */
export default function MultisigConsolePage() {
  const toast = useToast();
  const user = useSession((s) => s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    toBankId: "bank_nb_bd",
    amount: "10",
  });

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/world-bank/multisig");
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
  }, []);

  async function propose() {
    setBusy(true);
    try {
      await api.post("/api/world-bank/multisig/propose", {
        title: form.title || `Allocate ${form.amount} ETH`,
        description: form.description || "World → National capital allocation",
        action: "ALLOCATE_CAPITAL",
        payload: { toBankId: form.toBankId, amount: Number(form.amount) },
      });
      toast.show("Multisig proposal created", { variant: "success" });
      setSheet(null);
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function sign(id) {
    setBusy(true);
    try {
      const r = await api.post(`/api/world-bank/multisig/${id}/sign`);
      toast.show(
        r.ready ? "Threshold met — ready to execute" : "Signature recorded",
        { variant: "success" },
      );
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function execute(id) {
    setBusy(true);
    try {
      await api.post(`/api/world-bank/multisig/${id}/execute`);
      toast.show("Transaction executed", { variant: "success" });
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
        <StateMessage title="Loading Safe…" description="Signers, pending txs, reserve." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Multisig unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      </div>
    );
  }

  const thr = data.threshold || 2;
  const myWallet = (user?.wallet || "").toLowerCase();

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Custody</p>
        <h1 className="client-title">Global reserve & Safe multisig</h1>
        <p className="client-lede">
          Threshold is <strong>{thr}-of-{data.signerCount}</strong> (MVT target). Co-sign pending
          actions or propose a new allocation.
        </p>
        <div className="client-hero-badges">
          <Badge icon={data.viewerIsSigner ? "check" : "alert"}>
            {data.viewerIsSigner ? "You are a signer" : "Read-only viewer"}
          </Badge>
        </div>
      </header>

      <Glass className="client-panel" level={3}>
        <Badge icon="wallet">Global reserve</Badge>
        <h2 className="client-panel-title">{formatEth(data.reserve?.availableEth)}</h2>
        <p className="client-lede">
          Allocatable after minimum: {formatEth(data.reserve?.availableToAllocateEth)}
        </p>
      </Glass>

      <section className="client-section">
        <h2 className="client-section-title">Signer set</h2>
        <ul className="ops-stack">
          {(data.signers || []).map((s) => (
            <li key={s.wallet} className="ops-row glass">
              <div>
                <strong>{s.displayName}</strong>
                <span>{short(s.wallet)}</span>
              </div>
              {s.wallet.toLowerCase() === myWallet ? <Badge icon="check">You</Badge> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">Pending transactions</h2>
          {data.viewerIsSigner ? (
            <Button type="button" size="sm" showArrow={false} onClick={() => setSheet("propose")}>
              Propose
            </Button>
          ) : null}
        </div>
        {(data.pending || []).length === 0 ? (
          <StateMessage variant="empty" title="No pending txs" description="Queue is clear." />
        ) : (
          <ul className="ops-stack">
            {data.pending.map((tx) => {
              const signed = tx.signatures.some((w) => w.toLowerCase() === myWallet);
              const ready = tx.signatures.length >= thr;
              return (
                <li key={tx.id} className="ops-row glass">
                  <div>
                    <strong>{tx.title}</strong>
                    <span>
                      {tx.description} · {tx.signatures.length}/{thr} signatures
                    </span>
                    <div className="limit-bar" style={{ marginTop: 8, maxWidth: 180 }}>
                      <div
                        className="limit-bar-fill"
                        style={{ width: `${Math.min(100, (tx.signatures.length / thr) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="ops-row-meta">
                    <Badge icon={ready ? "check" : "clock"}>{ready ? "Ready" : "Collecting"}</Badge>
                    {data.viewerIsSigner && !signed ? (
                      <Button
                        type="button"
                        size="sm"
                        showArrow={false}
                        disabled={busy}
                        onClick={() => void sign(tx.id)}
                      >
                        Co-sign
                      </Button>
                    ) : null}
                    {data.viewerIsSigner && ready ? (
                      <Button
                        type="button"
                        size="sm"
                        showArrow={false}
                        disabled={busy}
                        onClick={() => void execute(tx.id)}
                      >
                        Execute
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="client-section">
        <h2 className="client-section-title">History</h2>
        <ul className="ops-stack">
          {(data.history || []).slice(0, 8).map((tx) => (
            <li key={tx.id} className="ops-row glass">
              <div>
                <strong>{tx.title}</strong>
                <span>{tx.status} · {tx.executedAt ? new Date(tx.executedAt).toLocaleString() : "—"}</span>
              </div>
              <Badge>{tx.status}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="client-section">
        <h2 className="client-section-title">Reserve by National Bank</h2>
        <ul className="ops-stack">
          {(data.reserve?.byNationalBank || []).map((nb) => (
            <li key={nb.id} className="ops-row glass">
              <div>
                <strong>{nb.name}</strong>
                <span>Allocated {formatEth(nb.allocatedEth)}</span>
              </div>
              <code>{formatEth(nb.reserveEth)}</code>
            </li>
          ))}
        </ul>
      </section>

      <Sheet open={sheet === "propose"} onClose={() => !busy && setSheet(null)} title="Propose allocation">
        <div className="settings-fields">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Description"
            as="textarea"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="National Bank"
            as="select"
            value={form.toBankId}
            onChange={(e) => setForm((f) => ({ ...f, toBankId: e.target.value }))}
          >
            {(data.reserve?.byNationalBank || []).map((nb) => (
              <option key={nb.id} value={nb.id}>
                {nb.name}
              </option>
            ))}
          </Input>
          <Input
            label="Amount (ETH)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void propose()} disabled={busy || Number(form.amount) <= 0}>
            Create proposal
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
