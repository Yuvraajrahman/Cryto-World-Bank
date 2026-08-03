/**
 * Phase 2B — Super Admin economy simulation panel (Dev Admin tab).
 */
import { useCallback, useEffect, useState } from "react";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import StatCard from "../../components/ui/StatCard";
import StateMessage from "../../components/ui/StateMessage";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";

function formatUsdc(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B USDC`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M USDC`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K USDC`;
  return `${v.toLocaleString()} USDC`;
}

export default function SimulationTab() {
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [history, setHistory] = useState([]);
  const [latestRun, setLatestRun] = useState(null);
  const [optimizePreview, setOptimizePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [runForm, setRunForm] = useState({
    totalCapitalUsdc: "100000000",
    seed: "42",
    clientMultiplier: "1",
    simulatedDays: "365",
    sampleNationals: "5",
    sampleLocalsPerNational: "3",
    clientsPerLocal: "4",
  });

  const [rateForm, setRateForm] = useState({
    baseRateBps: "",
    slope1Bps: "",
    slope2Bps: "",
    kinkBps: "",
    minReserveRatio: "",
    note: "",
  });

  const [optimizeTarget, setOptimizeTarget] = useState("1000000000");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, run] = await Promise.all([
        api.get("/api/dev-admin/simulation/config"),
        api.get("/api/dev-admin/simulation/runs/latest").catch(() => null),
      ]);
      setConfig(cfg.config);
      setHistory(cfg.history || []);
      setRateForm({
        baseRateBps: String(cfg.config.baseRateBps),
        slope1Bps: String(cfg.config.slope1Bps),
        slope2Bps: String(cfg.config.slope2Bps),
        kinkBps: String(cfg.config.kinkBps),
        minReserveRatio: String(cfg.config.minReserveRatio),
        note: "",
      });
      if (run?.run) setLatestRun(run.run);
    } catch (err) {
      toast.show(err.message || "Failed to load simulation", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveRates() {
    setBusy(true);
    try {
      await api.patch("/api/dev-admin/simulation/config", {
        baseRateBps: Number(rateForm.baseRateBps),
        slope1Bps: Number(rateForm.slope1Bps),
        slope2Bps: Number(rateForm.slope2Bps),
        kinkBps: Number(rateForm.kinkBps),
        minReserveRatio: Number(rateForm.minReserveRatio),
        note: rateForm.note || undefined,
      });
      toast.show("Rate model saved to Neon", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err.message || "Save failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function runSimulation() {
    setBusy(true);
    try {
      const result = await api.post("/api/dev-admin/simulation/run", {
        totalCapitalUsdc: Number(runForm.totalCapitalUsdc),
        seed: Number(runForm.seed),
        clientMultiplier: Number(runForm.clientMultiplier),
        simulatedDays: Number(runForm.simulatedDays),
        sampleNationals: Number(runForm.sampleNationals),
        sampleLocalsPerNational: Number(runForm.sampleLocalsPerNational),
        clientsPerLocal: Number(runForm.clientsPerLocal),
      });
      setLatestRun({
        id: result.summary.runId,
        summaryJson: result.summary,
        verificationJson: result.verification,
        status: "COMPLETED",
        startedAt: new Date().toISOString(),
      });
      toast.show(
        result.verification.pass ? "Simulation complete — stable" : "Simulation complete — see warnings",
        { variant: result.verification.pass ? "success" : "warning" },
      );
      await load();
    } catch (err) {
      toast.show(err.message || "Simulation failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function previewOptimize() {
    setBusy(true);
    try {
      const r = await api.post("/api/dev-admin/simulation/optimize", {
        targetCapitalUsdc: Number(optimizeTarget),
      });
      setOptimizePreview(r);
    } catch (err) {
      toast.show(err.message || "Optimize failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function applyOptimize() {
    setBusy(true);
    try {
      await api.post("/api/dev-admin/simulation/optimize/apply", {
        targetCapitalUsdc: Number(optimizeTarget),
        note: `Optimized for ${optimizeTarget} USDC demo`,
      });
      toast.show("Optimized config applied", { variant: "success" });
      setOptimizePreview(null);
      await load();
    } catch (err) {
      toast.show(err.message || "Apply failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function revertHistory(id) {
    setBusy(true);
    try {
      await api.post(`/api/dev-admin/simulation/config/revert/${id}`);
      toast.show("Reverted", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err.message || "Revert failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !config) {
    return <StateMessage title="Loading simulation…" description="Config and latest run from Neon." />;
  }

  const summary = latestRun?.summaryJson;
  const verification = latestRun?.verificationJson;

  return (
    <div className="ops-stack" style={{ gap: 20 }}>
      <p className="client-lede">
        Phase 2 economy simulator — capital flows, loans, installments, interbank/upward samples. Results
        persist in Neon for Vercel demos.
      </p>

      <div className="client-grid-2">
        <Glass className="client-panel" level={2}>
          <h2 className="client-panel-title">Run simulation</h2>
          <div className="ops-stack">
            <Input
              label="Total capital (USDC)"
              type="number"
              value={runForm.totalCapitalUsdc}
              onChange={(e) => setRunForm((f) => ({ ...f, totalCapitalUsdc: e.target.value }))}
            />
            <Input
              label="Random seed"
              type="number"
              value={runForm.seed}
              onChange={(e) => setRunForm((f) => ({ ...f, seed: e.target.value }))}
            />
            <Input
              label="Simulated days"
              type="number"
              value={runForm.simulatedDays}
              onChange={(e) => setRunForm((f) => ({ ...f, simulatedDays: e.target.value }))}
            />
            <Input
              label="Sample nationals / locals / clients"
              value={`${runForm.sampleNationals} / ${runForm.sampleLocalsPerNational} / ${runForm.clientsPerLocal}`}
              readOnly
              onFocus={() => {}}
            />
            <div className="quick-actions">
              <Button type="button" disabled={busy} onClick={() => void runSimulation()}>
                Run simulation
              </Button>
              <Button
                type="button"
                variant="ghost"
                showArrow={false}
                disabled={busy}
                onClick={() =>
                  setRunForm((f) => ({
                    ...f,
                    totalCapitalUsdc: "10000000",
                    seed: String(Math.floor(Math.random() * 99999)),
                  }))
                }
              >
                Quick 10M test
              </Button>
            </div>
          </div>
        </Glass>

        <Glass className="client-panel" level={2}>
          <h2 className="client-panel-title">Kinked rate model</h2>
          <div className="ops-stack">
            <Input
              label="Base rate (bps)"
              value={rateForm.baseRateBps}
              onChange={(e) => setRateForm((f) => ({ ...f, baseRateBps: e.target.value }))}
            />
            <Input
              label="Slope 1 (bps)"
              value={rateForm.slope1Bps}
              onChange={(e) => setRateForm((f) => ({ ...f, slope1Bps: e.target.value }))}
            />
            <Input
              label="Slope 2 (bps)"
              value={rateForm.slope2Bps}
              onChange={(e) => setRateForm((f) => ({ ...f, slope2Bps: e.target.value }))}
            />
            <Input
              label="Kink (bps)"
              value={rateForm.kinkBps}
              onChange={(e) => setRateForm((f) => ({ ...f, kinkBps: e.target.value }))}
            />
            <Input
              label="Min reserve ratio (0–1)"
              value={rateForm.minReserveRatio}
              onChange={(e) => setRateForm((f) => ({ ...f, minReserveRatio: e.target.value }))}
            />
            <Button type="button" disabled={busy} onClick={() => void saveRates()}>
              Save to Neon
            </Button>
          </div>
        </Glass>
      </div>

      <Glass className="client-panel" level={2}>
        <h2 className="client-panel-title">Optimize for scale</h2>
        <div className="ops-toolbar">
          <Input
            label="Target capital (USDC)"
            type="number"
            value={optimizeTarget}
            onChange={(e) => setOptimizeTarget(e.target.value)}
          />
          <div className="quick-actions">
            <Button type="button" variant="ghost" showArrow={false} disabled={busy} onClick={() => void previewOptimize()}>
              Preview optimize
            </Button>
            <Button type="button" disabled={busy || !optimizePreview} onClick={() => void applyOptimize()}>
              Apply optimized config
            </Button>
          </div>
        </div>
        {optimizePreview ? (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 13, color: "var(--text-2)" }}>
              Expected utilization ~{(optimizePreview.expectedUtilizationBps / 100).toFixed(0)}% (under kink)
            </p>
            <ul style={{ fontSize: 13, margin: "8px 0", paddingLeft: 18 }}>
              {optimizePreview.rationale?.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="client-grid-2" style={{ marginTop: 8 }}>
              <div>
                <strong>Current base / slope2</strong>
                <p>
                  {optimizePreview.current.baseRateBps} / {optimizePreview.current.slope2Bps} bps
                </p>
              </div>
              <div>
                <strong>Optimized base / slope2</strong>
                <p>
                  {optimizePreview.optimized.baseRateBps} / {optimizePreview.optimized.slope2Bps} bps
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Glass>

      {summary ? (
        <>
          <div className="client-snap-row">
            <StatCard label="Capital injected" value={formatUsdc(summary.totalCapitalUsdc)} />
            <StatCard label="Loans" value={String(summary.loansCreated)} />
            <StatCard label="Paid / late inst." value={`${summary.installmentsPaid} / ${summary.installmentsLate}`} />
            <StatCard label="Peak util." value={`${(summary.maxUtilizationBps / 100).toFixed(1)}%`} />
          </div>

          {verification ? (
            <Glass className="client-panel" level={2}>
              <div className="client-section-head">
                <h2 className="client-panel-title">Phase 3 stability report</h2>
                <Badge icon={verification.pass ? "check" : "alert"}>
                  {verification.pass ? "PASS" : "REVIEW"}
                </Badge>
              </div>
              <ul className="ops-stack">
                {verification.checks?.map((c) => (
                  <li key={c.id} className="ops-row glass">
                    <div>
                      <strong>{c.label}</strong>
                      <span>{c.detail}</span>
                    </div>
                    <Badge icon={c.pass ? "check" : "alert"}>{c.pass ? "PASS" : "FAIL"}</Badge>
                  </li>
                ))}
              </ul>
            </Glass>
          ) : null}

          {(summary.tierSnapshots || []).length > 0 ? (
            <Glass className="client-panel" level={2}>
              <h2 className="client-panel-title">Tier snapshots (sample)</h2>
              <ul className="ops-stack">
                {summary.tierSnapshots.slice(0, 8).map((t) => (
                  <li key={t.institutionId} className="ops-row glass">
                    <div>
                      <strong>{t.name}</strong>
                      <span>
                        {t.tier} · reserve {(t.reserveRatio * 100).toFixed(1)}% · util{" "}
                        {(t.utilizationBps / 100).toFixed(1)}%
                      </span>
                    </div>
                    <code>{formatUsdc(t.reserveUsdc + t.allocatedUsdc + t.lentUsdc)}</code>
                  </li>
                ))}
              </ul>
            </Glass>
          ) : null}
        </>
      ) : (
        <StateMessage
          variant="empty"
          title="No simulation runs yet"
          description="Run a simulation to populate Neon with capital flows and loan data."
        />
      )}

      {history.length > 0 ? (
        <Glass className="client-panel" level={2}>
          <h2 className="client-panel-title">Config history</h2>
          <ul className="ops-stack">
            {history.slice(0, 5).map((h) => (
              <li key={h.id} className="ops-row glass">
                <div>
                  <strong>{h.field}</strong>
                  <span>{new Date(h.createdAt).toLocaleString()}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  showArrow={false}
                  disabled={busy}
                  onClick={() => void revertHistory(h.id)}
                >
                  Revert
                </Button>
              </li>
            ))}
          </ul>
        </Glass>
      ) : null}
    </div>
  );
}
