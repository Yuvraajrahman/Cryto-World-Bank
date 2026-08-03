/**
 * Phase 2B — Super Admin economy simulation panel (Dev Admin tab).
 * Off-chain Postgres simulation (contract-rule parity) via local Docker or cloud DB.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import StatCard from "../../components/ui/StatCard";
import StateMessage from "../../components/ui/StateMessage";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";
import VisualStressLab from "./VisualStressLab";
import FundBanksPanel from "./FundBanksPanel";

const TIER_KEYS = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

function formatUsdc(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B USDC`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M USDC`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K USDC`;
  return `${v.toLocaleString()} USDC`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function SimulationTab() {
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [history, setHistory] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [latestRun, setLatestRun] = useState(null);
  const [optimizePreview, setOptimizePreview] = useState(null);
  const [contrast, setContrast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [runStatus, setRunStatus] = useState(null);
  const pollCancel = useRef(false);

  const [runForm, setRunForm] = useState({
    totalCapitalUsdc: "100000000",
    seed: "42",
    clientMultiplier: "1",
    simulatedDays: "365",
    sampleNationals: "8",
    sampleLocalsPerNational: "4",
    clientsPerLocal: "6",
    resetSample: true,
  });

  const [rateForm, setRateForm] = useState({
    baseRateBps: "",
    slope1Bps: "",
    slope2Bps: "",
    kinkBps: "",
    minReserveRatio: "",
    note: "",
  });

  const [tierMods, setTierMods] = useState({});
  const [optimizeTarget, setOptimizeTarget] = useState("1000000000");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, run, runs] = await Promise.all([
        api.get("/api/dev-admin/simulation/config"),
        api.get("/api/dev-admin/simulation/runs/latest").catch(() => null),
        api.get("/api/dev-admin/simulation/runs?limit=8").catch(() => ({ runs: [] })),
      ]);
      setConfig(cfg.config);
      setHistory(cfg.history || []);
      setRecentRuns(runs?.runs || []);
      setRateForm({
        baseRateBps: String(cfg.config.baseRateBps),
        slope1Bps: String(cfg.config.slope1Bps),
        slope2Bps: String(cfg.config.slope2Bps),
        kinkBps: String(cfg.config.kinkBps),
        minReserveRatio: String(cfg.config.minReserveRatio),
        note: "",
      });
      const mods = { ...(cfg.config.tierModifiers || {}) };
      for (const k of TIER_KEYS) {
        if (mods[k] == null) mods[k] = 0;
      }
      setTierMods(mods);
      if (run?.run) setLatestRun(run.run);
    } catch (err) {
      toast.show(err.message || "Failed to load simulation", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
    return () => {
      pollCancel.current = true;
    };
  }, [load]);

  async function pollUntilDone(runId) {
    pollCancel.current = false;
    setRunStatus("RUNNING");
    const started = Date.now();
    for (let i = 0; i < 120; i++) {
      if (pollCancel.current) return null;
      await sleep(800);
      const { run } = await api.get(`/api/dev-admin/simulation/runs/${runId}`);
      setRunStatus(run.status);
      setLatestRun(run);
      if (run.status === "COMPLETED" || run.status === "FAILED") {
        setRunStatus(`${run.status} (${Math.round((Date.now() - started) / 1000)}s)`);
        return run;
      }
    }
    toast.show("Simulation still running — refresh later", { variant: "warning" });
    return null;
  }

  async function saveRates() {
    setBusy(true);
    try {
      await api.patch("/api/dev-admin/simulation/config", {
        baseRateBps: Number(rateForm.baseRateBps),
        slope1Bps: Number(rateForm.slope1Bps),
        slope2Bps: Number(rateForm.slope2Bps),
        kinkBps: Number(rateForm.kinkBps),
        minReserveRatio: Number(rateForm.minReserveRatio),
        tierModifiers: Object.fromEntries(
          TIER_KEYS.map((k) => [k, Number(tierMods[k] ?? 0)]),
        ),
        note: rateForm.note || undefined,
      });
      toast.show("Rate model + tier modifiers saved to Postgres", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err.message || "Save failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function runSimulation() {
    setBusy(true);
    setContrast(null);
    try {
      const payload = {
        totalCapitalUsdc: Number(runForm.totalCapitalUsdc),
        seed: Number(runForm.seed),
        clientMultiplier: Number(runForm.clientMultiplier),
        simulatedDays: Number(runForm.simulatedDays),
        sampleNationals: Number(runForm.sampleNationals),
        sampleLocalsPerNational: Number(runForm.sampleLocalsPerNational),
        clientsPerLocal: Number(runForm.clientsPerLocal),
        resetSample: Boolean(runForm.resetSample),
        async: true,
      };
      const started = await api.post("/api/dev-admin/simulation/run", payload);
      const run = await pollUntilDone(started.runId);
      if (run?.status === "COMPLETED") {
        const v = run.verificationJson;
        toast.show(
          v?.pass ? "Simulation complete — stable" : "Simulation complete — see warnings",
          { variant: v?.pass ? "success" : "warning" },
        );
      } else if (run?.status === "FAILED") {
        toast.show("Simulation failed", { variant: "error" });
      }
      await load();
    } catch (err) {
      toast.show(err.message || "Simulation failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function runContrast() {
    setBusy(true);
    setRunStatus("CONTRAST…");
    try {
      const r = await api.post("/api/dev-admin/simulation/contrast", {
        randomSeed: Number(runForm.seed) || 42,
      });
      setContrast(r);
      setLatestRun({
        id: r.optimized1B.summary.runId,
        summaryJson: r.optimized1B.summary,
        verificationJson: r.optimized1B.verification,
        status: "COMPLETED",
        startedAt: new Date().toISOString(),
      });
      toast.show("Contrast runs finished (100M random vs 1B optimized)", { variant: "success" });
      await load();
    } catch (err) {
      toast.show(err.message || "Contrast failed", { variant: "error" });
    } finally {
      setRunStatus(null);
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
    return (
      <StateMessage
        title="Loading simulation…"
        description="Config and latest run from Postgres."
      />
    );
  }

  const summary = latestRun?.summaryJson;
  const verification = latestRun?.verificationJson;

  return (
    <div className="ops-stack" style={{ gap: 20 }}>
      <p className="client-lede">
        Off-chain Postgres simulation (contract-rule parity) — capital flows, loans, installments,
        interbank/upward samples. Writes to Docker Postgres when using{" "}
        <code>./scripts/start-everything.sh</code>. Does not broadcast on-chain allocateCapital for
        every bank.
      </p>

      <VisualStressLab
        config={config}
        onApplyToRunForm={(patch) => setRunForm((f) => ({ ...f, ...patch }))}
      />

      <FundBanksPanel />

      {runStatus ? (
        <Badge icon="activity">Status: {runStatus}</Badge>
      ) : null}

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
              label="Client multiplier (0.1–2)"
              type="number"
              value={runForm.clientMultiplier}
              onChange={(e) => setRunForm((f) => ({ ...f, clientMultiplier: e.target.value }))}
            />
            <Input
              label="Simulated days"
              type="number"
              value={runForm.simulatedDays}
              onChange={(e) => setRunForm((f) => ({ ...f, simulatedDays: e.target.value }))}
            />
            <Input
              label="Sample nationals"
              type="number"
              value={runForm.sampleNationals}
              onChange={(e) => setRunForm((f) => ({ ...f, sampleNationals: e.target.value }))}
            />
            <Input
              label="Locals per national"
              type="number"
              value={runForm.sampleLocalsPerNational}
              onChange={(e) =>
                setRunForm((f) => ({ ...f, sampleLocalsPerNational: e.target.value }))
              }
            />
            <Input
              label="Clients per local"
              type="number"
              value={runForm.clientsPerLocal}
              onChange={(e) => setRunForm((f) => ({ ...f, clientsPerLocal: e.target.value }))}
            />
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={runForm.resetSample}
                onChange={(e) => setRunForm((f) => ({ ...f, resetSample: e.target.checked }))}
              />
              Reset prior sim-tagged loans before run (idempotent)
            </label>
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
                Quick 10M
              </Button>
              <Button
                type="button"
                variant="ghost"
                showArrow={false}
                disabled={busy}
                onClick={() => setRunForm((f) => ({ ...f, totalCapitalUsdc: "100000000" }))}
              >
                100M
              </Button>
              <Button
                type="button"
                variant="ghost"
                showArrow={false}
                disabled={busy}
                onClick={() => setRunForm((f) => ({ ...f, totalCapitalUsdc: "1000000000" }))}
              >
                1B
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
              Save rates + tiers to Postgres
            </Button>
          </div>
        </Glass>
      </div>

      <Glass className="client-panel" level={2}>
        <h2 className="client-panel-title">Tier modifiers (bps)</h2>
        <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 8 }}>
          Added to kinked borrow APR (Bronze→Diamond). Negative = discount.
        </p>
        <div className="client-grid-2">
          {TIER_KEYS.map((k) => (
            <Input
              key={k}
              label={k}
              type="number"
              value={String(tierMods[k] ?? 0)}
              onChange={(e) => setTierMods((m) => ({ ...m, [k]: e.target.value }))}
            />
          ))}
        </div>
      </Glass>

      <Glass className="client-panel" level={2}>
        <h2 className="client-panel-title">Optimize for scale</h2>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>
          Heuristic: scale slope/base with capital so expected util stays ~65% (under 80% kink) and
          reserve floor holds. Preview before apply — never auto-applies.
        </p>
        <div className="ops-toolbar">
          <Input
            label="Target capital (USDC)"
            type="number"
            value={optimizeTarget}
            onChange={(e) => setOptimizeTarget(e.target.value)}
          />
          <div className="quick-actions">
            <Button
              type="button"
              variant="ghost"
              showArrow={false}
              disabled={busy}
              onClick={() => void previewOptimize()}
            >
              Preview optimize
            </Button>
            <Button type="button" disabled={busy || !optimizePreview} onClick={() => void applyOptimize()}>
              Apply optimized config
            </Button>
            <Button type="button" variant="ghost" showArrow={false} disabled={busy} onClick={() => void runContrast()}>
              Contrast: 100M random vs 1B optimized
            </Button>
          </div>
        </div>
        {optimizePreview ? (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 13, color: "var(--text-2)" }}>
              Expected utilization ~{(optimizePreview.expectedUtilizationBps / 100).toFixed(0)}%
              (under kink) · reserve ≥ {(optimizePreview.optimized.minReserveRatio * 100).toFixed(0)}%
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

        {contrast ? (
          <div className="client-grid-2" style={{ marginTop: 16 }}>
            <div className="glass" style={{ padding: 12 }}>
              <strong>100M random</strong>
              <Badge icon={contrast.random100M.verification.pass ? "check" : "alert"}>
                {contrast.random100M.verification.pass ? "PASS" : "REVIEW"}
              </Badge>
              <p style={{ fontSize: 13 }}>
                Loans {contrast.random100M.summary.loansCreated} · peak util{" "}
                {(contrast.random100M.summary.maxUtilizationBps / 100).toFixed(1)}%
              </p>
            </div>
            <div className="glass" style={{ padding: 12 }}>
              <strong>1B optimized</strong>
              <Badge icon={contrast.optimized1B.verification.pass ? "check" : "alert"}>
                {contrast.optimized1B.verification.pass ? "PASS" : "REVIEW"}
              </Badge>
              <p style={{ fontSize: 13 }}>
                Loans {contrast.optimized1B.summary.loansCreated} · peak util{" "}
                {(contrast.optimized1B.summary.maxUtilizationBps / 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ) : null}
      </Glass>

      {summary ? (
        <>
          <div className="client-snap-row">
            <StatCard label="Capital injected" value={formatUsdc(summary.totalCapitalUsdc)} />
            <StatCard label="Loans" value={String(summary.loansCreated)} />
            <StatCard
              label="Paid / late inst."
              value={`${summary.installmentsPaid} / ${summary.installmentsLate}`}
            />
            <StatCard label="Peak util." value={`${(summary.maxUtilizationBps / 100).toFixed(1)}%`} />
          </div>

          {summary.interestToDepositors != null ? (
            <div className="client-snap-row">
              <StatCard label="Interest → depositors" value={formatUsdc(summary.interestToDepositors)} />
              <StatCard label="Interest → insurance" value={formatUsdc(summary.interestToInsurance)} />
              <StatCard label="Interest → protocol" value={formatUsdc(summary.interestToProtocol)} />
              <StatCard label="Net interest" value={formatUsdc(summary.netInterestUsdc)} />
            </div>
          ) : null}

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
                {summary.tierSnapshots.slice(0, 10).map((t) => (
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
          description="Run a simulation to write capital flows and loan data into Postgres."
        />
      )}

      {recentRuns.length > 0 ? (
        <Glass className="client-panel" level={2}>
          <h2 className="client-panel-title">Recent simulation runs (audit strip)</h2>
          <ul className="ops-stack">
            {recentRuns.map((r) => (
              <li key={r.id} className="ops-row glass">
                <div>
                  <strong>{r.id}</strong>
                  <span>
                    {r.status} · {formatUsdc(r.totalCapitalUsdc)} · seed {r.seed} ·{" "}
                    {r.startedAt ? new Date(r.startedAt).toLocaleString() : "—"}
                  </span>
                </div>
                <Badge icon={r.status === "COMPLETED" ? "check" : "activity"}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Glass>
      ) : null}

      {history.length > 0 ? (
        <Glass className="client-panel" level={2}>
          <h2 className="client-panel-title">Config history</h2>
          <ul className="ops-stack">
            {history.slice(0, 8).map((h) => (
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
