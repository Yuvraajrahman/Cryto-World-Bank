import { useEffect, useMemo, useState } from "react";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import Input from "../../components/ui/Input";
import StateMessage from "../../components/ui/StateMessage";
import { useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";

function pct(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `${(Number(n) * 100).toFixed(1)}%`;
}

function formatEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  if (v >= 100) return `${v.toFixed(1)} ETH`;
  if (v >= 1) return `${v.toFixed(2)} ETH`;
  return `${v.toFixed(3)} ETH`;
}

/**
 * `/audit` — plan L.43 Regulatory Read-Only Audit Portal
 */
export default function AuditPortalPage() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [tabs, setTabs] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportJob, setExportJob] = useState(null);
  const [exportBusy, setExportBusy] = useState(false);

  async function loadSummary() {
    setLoading(true);
    try {
      const s = await api.get("/api/audit/summary");
      setSummary(s);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs() {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({ tab, limit: "120" });
      if (q.trim()) params.set("q", q.trim());
      if (entity.trim()) params.set("entity", entity.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const d = await api.get(`/api/audit/logs?${params}`);
      setLogs(d.entries || []);
      setTotal(d.total || 0);
      setTabs(d.tabs || []);
    } catch (err) {
      toast.show(err?.message || "Failed to load logs", { variant: "error" });
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  useEffect(() => {
    void loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tab switch reloads; filters use Apply
  }, [tab]);

  const compliance = summary?.compliance;
  const solvency = summary?.solvency;

  const exportProgress = exportJob?.progress ?? 0;
  const exportReady = exportJob?.status === "READY";

  async function startExport() {
    setExportBusy(true);
    setExportJob(null);
    try {
      const r = await api.post("/api/audit/export", {
        tab,
        q: q.trim() || undefined,
        entity: entity.trim() || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setExportJob({ id: r.exportId, status: r.status, progress: r.progress || 5 });
      toast.show("Export started — packaging audit data", { variant: "success" });
    } catch (err) {
      toast.show(err.message || "Export failed", { variant: "error" });
      setExportBusy(false);
    }
  }

  useEffect(() => {
    if (!exportJob?.id || exportJob.status === "READY" || exportJob.status === "FAILED") {
      if (exportJob?.status === "READY" || exportJob?.status === "FAILED") {
        setExportBusy(false);
      }
      return undefined;
    }
    const t = setInterval(async () => {
      try {
        const j = await api.get(`/api/audit/export/${exportJob.id}`);
        setExportJob(j);
        if (j.status === "READY" || j.status === "FAILED") {
          setExportBusy(false);
        }
      } catch {
        /* keep polling */
      }
    }, 500);
    return () => clearInterval(t);
  }, [exportJob?.id, exportJob?.status]);

  function downloadPackage() {
    if (!exportJob?.packageBase64) return;
    const blob = new Blob([exportJob.packageBase64], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportJob.downloadName || `cwb-audit-${exportJob.id}.pkg.b64`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const institutions = useMemo(() => solvency?.institutions || [], [solvency]);

  if (loading && !summary) {
    return (
      <div className="client-page">
        <StateMessage title="Loading audit portal…" />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="client-page">
        <StateMessage
          title="Audit data unavailable"
          description={error.message || "Could not reach the regulator API."}
          action={{ label: "Retry", onClick: () => void loadSummary() }}
        />
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Regulatory Authority · A6</p>
        <h1 className="client-title">Audit portal</h1>
        <p className="client-lede">
          System-wide solvency, compliance, and filterable audit logs. All actions are view or export
          only.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge>Read-only</Badge>
          <Badge>{summary?.access || "REGULATOR"}</Badge>
        </div>
      </header>

      <section className="stat-row" aria-label="Solvency summary">
        <StatCard
          label="Reserve ratio"
          value={solvency?.reserveRatio?.display || pct(solvency?.reserveRatio?.value)}
          hint={`Min ${solvency?.reserveRatio?.minimumDisplay || "20%"}`}
        />
        <StatCard
          label="Capital under mgmt"
          value={solvency?.capitalUnderManagement?.display || "—"}
        />
        <StatCard
          label="Loans outstanding"
          value={solvency?.loansOutstanding?.display || "—"}
        />
        <StatCard label="Default rate" value={solvency?.defaultRate?.display || "—"} />
      </section>

      <section className="stat-row" aria-label="Compliance summary">
        <StatCard
          label="KYC completion"
          value={pct(compliance?.kyc?.completionRate)}
          hint={`${compliance?.kyc?.kyc1Approved ?? 0} approved · ${compliance?.kyc?.kyc1Pending ?? 0} pending`}
        />
        <StatCard
          label="AML open"
          value={String(compliance?.aml?.open ?? 0)}
          hint={`${compliance?.aml?.total ?? 0} total alerts`}
        />
        <StatCard
          label="SAR (N / W)"
          value={`${compliance?.sarByTier?.national ?? 0} / ${compliance?.sarByTier?.world ?? 0}`}
          hint={`Local open-ish ${compliance?.sarByTier?.local ?? 0}`}
        />
        <StatCard
          label="Loan book"
          value={`${compliance?.loanBook?.active ?? 0} active`}
          hint={`${compliance?.loanBook?.pending ?? 0} pending · ${compliance?.loanBook?.defaulted ?? 0} defaulted`}
        />
      </section>

      {institutions.length ? (
        <Glass className="ops-detail" style={{ marginBottom: 20 }}>
          <p className="eyebrow">Institution capital (granular)</p>
          <ul className="ops-stack">
            {institutions.map((inst) => (
              <li key={inst.id} className="ops-row">
                <div>
                  <strong>{inst.name}</strong>
                  <span>
                    {inst.type} · {inst.countryCode || "—"}
                  </span>
                </div>
                <div className="ops-row-meta">
                  <code>{formatEth(inst.reserveEth)} reserve</code>
                  <span>
                    lent {formatEth(inst.lentEth)} · loans {inst.activeLoanCount}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Glass>
      ) : null}

      <Glass style={{ marginBottom: 20 }}>
        <div className="ops-toolbar" style={{ marginBottom: 12 }}>
          <p className="eyebrow" style={{ margin: 0 }}>
            Audit logs
          </p>
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>{total} matching</span>
        </div>

        <div className="ops-log-tabs" role="tablist" aria-label="Log type">
          {(tabs.length
            ? tabs
            : [
                { key: "ALL", label: "All" },
                { key: "RISK", label: "Loan risk" },
                { key: "AGENT", label: "Agent" },
                { key: "RBAC", label: "RBAC" },
                { key: "SAR", label: "SAR" },
              ]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`ops-log-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ops-toolbar" style={{ marginTop: 12 }}>
          <Input
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Event, payload…"
          />
          <Input
            label="Entity / wallet"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            placeholder="0x… or user id"
          />
          <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <div style={{ alignSelf: "end" }}>
            <Button type="button" variant="ghost" showArrow={false} onClick={() => void loadLogs()}>
              Apply filters
            </Button>
          </div>
        </div>

        {logsLoading ? (
          <StateMessage title="Loading logs…" />
        ) : logs.length === 0 ? (
          <StateMessage title="No matching audit entries" description="Widen filters or change tab." />
        ) : (
          <ul className="ops-stack" style={{ marginTop: 16 }}>
            {logs.map((row) => (
              <li key={`${row.source}_${row.id}`} className="ops-row">
                <div>
                  <strong>{row.eventType}</strong>
                  <span>
                    {row.category} · {row.source} ·{" "}
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                  </span>
                  {row.actorLabel || row.entity ? (
                    <span>
                      {row.actorLabel || "—"}
                      {row.entity ? ` · ${row.entity}` : ""}
                    </span>
                  ) : null}
                </div>
                <div className="ops-row-meta">
                  <Badge>{row.category}</Badge>
                  <code>{row.id.slice(0, 12)}</code>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Glass>

      <Glass>
        <p className="eyebrow">Encrypted audit package</p>
        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 12 }}>
          Export a read-only package of the current filter set. Packaging and encryption run in the
          background so the portal stays responsive.
        </p>
        <div className="ops-toolbar">
          <Button type="button" disabled={exportBusy} onClick={() => void startExport()}>
            {exportBusy ? "Exporting…" : "Export audit package"}
          </Button>
          {exportReady ? (
            <Button type="button" variant="ghost" showArrow={false} onClick={downloadPackage}>
              Download package
            </Button>
          ) : null}
        </div>
        {exportJob ? (
          <div className="ops-export-progress" aria-live="polite">
            <div className="ops-export-bar">
              <div className="ops-export-fill" style={{ width: `${exportProgress}%` }} />
            </div>
            <span>
              {exportJob.status} · {exportProgress}%
              {exportJob.packageHash ? ` · sha256 ${exportJob.packageHash.slice(0, 12)}…` : ""}
            </span>
            {exportJob.error ? <span className="notice error">{exportJob.error}</span> : null}
          </div>
        ) : null}
      </Glass>
    </div>
  );
}
