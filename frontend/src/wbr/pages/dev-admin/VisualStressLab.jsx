/**
 * Interactive 4-tier visual stress lab — sliders + red/white/green risk coloring.
 */
import { useMemo, useState, useEffect } from "react";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { computeVisualEconomy, formatCompactUsdc } from "./visualEconomy";

const PRESETS = [
  { id: "balanced", label: "Balanced 1B", total: 1_000_000_000, worldDeploy: 85, nbR: 15, lbR: 15, demand: 65, upward: 5 },
  { id: "hot", label: "Hot lending", total: 1_000_000_000, worldDeploy: 90, nbR: 15, lbR: 15, demand: 95, upward: 2 },
  { id: "tight", label: "Tight reserves", total: 100_000_000, worldDeploy: 92, nbR: 12, lbR: 12, demand: 88, upward: 8 },
  { id: "surplus", label: "High surplus", total: 1_000_000_000, worldDeploy: 70, nbR: 25, lbR: 25, demand: 40, upward: 20 },
];

function SliderRow({ label, value, min, max, step, suffix, onChange, hint }) {
  return (
    <label className="vis-slider">
      <div className="vis-slider-head">
        <span>{label}</span>
        <strong>
          {value}
          {suffix}
        </strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint ? <span className="vis-slider-hint">{hint}</span> : null}
    </label>
  );
}

function TierCard({ tier, total }) {
  const barMax = Math.max(total, 1);
  const reserveW = Math.min(100, (tier.reserve / barMax) * 100);
  const allocW = Math.min(100 - reserveW, (tier.allocated / barMax) * 100);
  const lentW = Math.min(100 - reserveW - allocW, (tier.lent / barMax) * 100);

  return (
    <div className={`vis-tier risk-${tier.risk}`} data-tier={tier.id}>
      <div className="vis-tier-top">
        <div>
          <h3>{tier.label}</h3>
          <p>{tier.subtitle}</p>
        </div>
        <span className={`vis-pill risk-${tier.risk}`}>
          {tier.risk === "stable" ? "Stable" : tier.risk === "watch" ? "Watch" : "Stress"}
        </span>
      </div>
      <div className="vis-bar" aria-hidden>
        <i className="seg reserve" style={{ width: `${reserveW}%` }} />
        <i className="seg alloc" style={{ width: `${allocW}%` }} />
        <i className="seg lent" style={{ width: `${lentW}%` }} />
      </div>
      <div className="vis-metrics">
        <div>
          <span>Reserve</span>
          <strong>{formatCompactUsdc(tier.reserve)}</strong>
        </div>
        <div>
          <span>{tier.id === "local" ? "Idle / pool" : "Allocated"}</span>
          <strong>{formatCompactUsdc(tier.allocated || tier.capacity)}</strong>
        </div>
        <div>
          <span>Lent</span>
          <strong>{formatCompactUsdc(tier.lent)}</strong>
        </div>
        <div>
          <span>Util</span>
          <strong>{(tier.utilBps / 100).toFixed(1)}%</strong>
        </div>
      </div>
      <ul className="vis-notes">
        {tier.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

export default function VisualStressLab({ config, onApplyToRunForm }) {
  const [totalCapitalUsdc, setTotal] = useState(1_000_000_000);
  const [worldDeployPct, setWorldDeploy] = useState(85);
  const [nationalReservePct, setNbR] = useState(15);
  const [localReservePct, setLbR] = useState(15);
  const [loanDemandPct, setDemand] = useState(70);
  const [upwardSurplusPct, setUpward] = useState(5);

  useEffect(() => {
    if (config?.minReserveRatio != null) {
      const floor = Math.round(config.minReserveRatio * 100);
      setNbR((v) => Math.max(v, floor));
      setLbR((v) => Math.max(v, floor));
      const maxDeploy = Math.round((1 - config.minReserveRatio) * 100);
      setWorldDeploy((v) => Math.min(v, maxDeploy));
    }
  }, [config?.minReserveRatio]);

  const model = useMemo(
    () =>
      computeVisualEconomy(
        {
          totalCapitalUsdc,
          worldDeployPct,
          nationalReservePct,
          localReservePct,
          loanDemandPct,
          upwardSurplusPct,
        },
        config || {
          baseRateBps: 300,
          slope1Bps: 500,
          slope2Bps: 7500,
          kinkBps: 8000,
          minReserveRatio: 0.15,
        },
      ),
    [
      totalCapitalUsdc,
      worldDeployPct,
      nationalReservePct,
      localReservePct,
      loanDemandPct,
      upwardSurplusPct,
      config,
    ],
  );

  const minRPct = Math.round((config?.minReserveRatio ?? 0.15) * 100);
  const maxDeployPct = 100 - minRPct;

  function applyPreset(p) {
    setTotal(p.total);
    setWorldDeploy(Math.min(p.worldDeploy, maxDeployPct));
    setNbR(Math.max(p.nbR, minRPct));
    setLbR(Math.max(p.lbR, minRPct));
    setDemand(p.demand);
    setUpward(p.upward);
  }

  return (
    <Glass className={`client-panel vis-lab risk-system-${model.systemRisk}`} level={2}>
      <div className="client-section-head">
        <div>
          <h2 className="client-panel-title">Visual stress lab</h2>
          <p className="client-lede" style={{ margin: 0 }}>
            Live what-if across World → National → Local → Clients. Green = stable, white/amber =
            watch, red = stress (kink, funding gap, or thin reserve).
          </p>
        </div>
        <Badge icon={model.systemRisk === "stable" ? "check" : "alert"}>
          System: {model.systemRisk}
        </Badge>
      </div>

      <div className="vis-layout">
        <div className="vis-controls">
          <div className="quick-actions" style={{ marginBottom: 12 }}>
            {PRESETS.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="ghost"
                showArrow={false}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <SliderRow
            label="Total World reserve"
            value={totalCapitalUsdc}
            min={10_000_000}
            max={1_000_000_000}
            step={10_000_000}
            suffix={` (${formatCompactUsdc(totalCapitalUsdc)} USDC)`}
            onChange={setTotal}
            hint="Paper-scale demo capital (up to 1B)."
          />
          <SliderRow
            label="World deploy to nationals"
            value={worldDeployPct}
            min={40}
            max={maxDeployPct}
            step={1}
            suffix="%"
            onChange={setWorldDeploy}
            hint={`Max ${maxDeployPct}% so World keeps ≥${minRPct}% reserve.`}
          />
          <SliderRow
            label="National reserve ratio"
            value={nationalReservePct}
            min={minRPct}
            max={45}
            step={1}
            suffix="%"
            onChange={setNbR}
          />
          <SliderRow
            label="Local reserve ratio"
            value={localReservePct}
            min={minRPct}
            max={45}
            step={1}
            suffix="%"
            onChange={setLbR}
          />
          <SliderRow
            label="Loan demand vs local pool"
            value={loanDemandPct}
            min={10}
            max={120}
            step={1}
            suffix="%"
            onChange={setDemand}
            hint=">100% creates a funding gap (red)."
          />
          <SliderRow
            label="Upward surplus parked"
            value={upwardSurplusPct}
            min={0}
            max={40}
            step={1}
            suffix="%"
            onChange={setUpward}
            hint="Idle local capacity sent upward — reduces lendable pool."
          />

          <div className="vis-live-stats">
            <div>
              <span>Borrow APR</span>
              <strong>{(model.aprBps / 100).toFixed(2)}%</strong>
            </div>
            <div>
              <span>Local util</span>
              <strong>{(model.utilBps / 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span>Kink</span>
              <strong>{(model.kinkBps / 100).toFixed(0)}%</strong>
            </div>
            <div>
              <span>Funding gap</span>
              <strong>{formatCompactUsdc(model.fundingGap)}</strong>
            </div>
          </div>

          {typeof onApplyToRunForm === "function" ? (
            <Button
              type="button"
              style={{ marginTop: 12 }}
              onClick={() =>
                onApplyToRunForm({
                  totalCapitalUsdc: String(totalCapitalUsdc),
                })
              }
            >
              Use this capital in Run form
            </Button>
          ) : null}
        </div>

        <div className="vis-stage">
          <div className="vis-flow" aria-hidden>
            <span>World</span>
            <i />
            <span>National</span>
            <i />
            <span>Local</span>
            <i />
            <span>Clients</span>
          </div>
          <div className="vis-tiers">
            {model.tiers.map((t) => (
              <TierCard key={t.id} tier={t} total={model.total} />
            ))}
          </div>
          <ul className="vis-alerts">
            {model.alerts.map((a) => (
              <li key={a.text} className={`risk-${a.level}`}>
                {a.text}
              </li>
            ))}
          </ul>
          <div className="vis-legend">
            <span>
              <i className="swatch reserve" /> Reserve
            </span>
            <span>
              <i className="swatch alloc" /> Allocated / idle
            </span>
            <span>
              <i className="swatch lent" /> Lent
            </span>
            <span>
              <i className="swatch stable" /> Stable
            </span>
            <span>
              <i className="swatch watch" /> Watch
            </span>
            <span>
              <i className="swatch stress" /> Stress
            </span>
          </div>
        </div>
      </div>
    </Glass>
  );
}
