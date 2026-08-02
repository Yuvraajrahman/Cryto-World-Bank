import { useEffect, useState } from "react";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";

/** `/bank/world/governance` — plan K.42 */
export default function GovernancePage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    parameter: "minReserveRatio",
    currentValue: "0.15",
    proposedValue: "0.18",
    justification: "",
  });

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/world-bank/governance");
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

  async function create() {
    setBusy(true);
    try {
      await api.post("/api/world-bank/governance", form);
      toast.show("Proposal created", { variant: "success" });
      setSheet(false);
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function vote(id, support) {
    setBusy(true);
    try {
      await api.post(`/api/world-bank/governance/${id}/vote`, { support });
      toast.show(support ? "Voted for" : "Voted against", { variant: "success" });
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
      await api.post(`/api/world-bank/governance/${id}/execute`);
      toast.show("Proposal executed", { variant: "success" });
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
        <StateMessage title="Loading governance…" description="Proposals and timelock." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Governance unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      </div>
    );
  }

  const active = (data.proposals || []).filter((p) =>
    ["VOTING", "PASSED_TIMELOCK"].includes(p.status),
  );
  const history = (data.proposals || []).filter((p) =>
    ["EXECUTED", "DEFEATED", "EXPIRED"].includes(p.status),
  );

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Governance</p>
        <h1 className="client-title">Parameters & timelock voting</h1>
        <p className="client-lede">
          Propose system-wide changes, vote, then execute after timelock.{" "}
          {data.votersNote}
        </p>
      </header>

      <Glass className="client-panel" level={2}>
        <Badge icon="settings">Live params</Badge>
        <div className="client-grid-2" style={{ marginTop: 10 }}>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>Min reserve ratio</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>
              {((data.globalParams?.minReserveRatio ?? 0.15) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <span className="muted" style={{ fontSize: 12 }}>World APR</span>
            <p style={{ margin: "4px 0 0", fontSize: 22 }}>
              {data.globalParams?.worldAprBps ?? 300} bps
            </p>
          </div>
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => setSheet(true)}>
            New proposal
          </Button>
        </div>
      </Glass>

      <section className="client-section">
        <h2 className="client-section-title">Active proposals</h2>
        {active.length === 0 ? (
          <StateMessage variant="empty" title="No active proposals" description="Create one to start a vote." />
        ) : (
          <ul className="ops-stack">
            {active.map((p) => {
              const forN = p.votesFor?.length || 0;
              const againstN = p.votesAgainst?.length || 0;
              const timelockOpen =
                p.status === "PASSED_TIMELOCK" &&
                (!p.timelockEndsAt || new Date(p.timelockEndsAt).getTime() <= Date.now());
              const timelockWait =
                p.status === "PASSED_TIMELOCK" &&
                p.timelockEndsAt &&
                new Date(p.timelockEndsAt).getTime() > Date.now();
              return (
                <li key={p.id} className="ops-row glass" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <strong>{p.title}</strong>
                    <span>
                      {p.parameter}: {p.currentValue} → {p.proposedValue}
                    </span>
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-2)" }}>
                      {p.justification}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-3)" }}>
                      For {forN} · Against {againstN}
                      {p.status === "VOTING"
                        ? ` · votes close ${new Date(p.votingEndsAt).toLocaleString()}`
                        : null}
                      {timelockWait
                        ? ` · execute after ${new Date(p.timelockEndsAt).toLocaleString()}`
                        : null}
                    </p>
                  </div>
                  <div className="ops-row-meta">
                    <Badge icon={p.status === "VOTING" ? "clock" : "check"}>{p.status}</Badge>
                    {p.status === "VOTING" ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          showArrow={false}
                          disabled={busy}
                          onClick={() => void vote(p.id, true)}
                        >
                          For
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          showArrow={false}
                          disabled={busy}
                          onClick={() => void vote(p.id, false)}
                        >
                          Against
                        </Button>
                      </>
                    ) : null}
                    {timelockOpen ? (
                      <Button
                        type="button"
                        size="sm"
                        showArrow={false}
                        disabled={busy}
                        onClick={() => void execute(p.id)}
                      >
                        Execute
                      </Button>
                    ) : null}
                    {timelockWait ? (
                      <Button type="button" size="sm" showArrow={false} disabled>
                        Timelock…
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
        {history.length === 0 ? (
          <StateMessage variant="empty" title="No history yet" description="Executed and defeated proposals appear here." />
        ) : (
          <ul className="ops-stack">
            {history.map((p) => (
              <li key={p.id} className="ops-row glass">
                <div>
                  <strong>{p.title}</strong>
                  <span>
                    {p.parameter} → {p.proposedValue}
                  </span>
                </div>
                <Badge>{p.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Sheet open={sheet} onClose={() => !busy && setSheet(false)} title="Create proposal">
        <div className="settings-fields">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Parameter"
            as="select"
            value={form.parameter}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                parameter: e.target.value,
                currentValue:
                  e.target.value === "worldAprBps"
                    ? String(data.globalParams?.worldAprBps ?? 300)
                    : String(data.globalParams?.minReserveRatio ?? 0.15),
              }))
            }
          >
            <option value="minReserveRatio">minReserveRatio</option>
            <option value="worldAprBps">worldAprBps</option>
          </Input>
          <Input
            label="Current value"
            value={form.currentValue}
            onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))}
          />
          <Input
            label="Proposed value"
            value={form.proposedValue}
            onChange={(e) => setForm((f) => ({ ...f, proposedValue: e.target.value }))}
          />
          <Input
            label="Justification"
            as="textarea"
            rows={3}
            value={form.justification}
            onChange={(e) => setForm((f) => ({ ...f, justification: e.target.value }))}
          />
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void create()}
            disabled={busy || form.title.length < 5 || form.justification.length < 5}
          >
            Submit proposal
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(false)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
