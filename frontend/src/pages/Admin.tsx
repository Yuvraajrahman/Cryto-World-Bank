import { useState } from "react";
import toast from "react-hot-toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  AlertTriangle,
  Pause,
  Play,
  UserPlus,
  KeyRound,
  Gauge,
  ShieldCheck,
} from "lucide-react";

export function Admin() {
  const [paused, setPaused] = useState(false);
  const [apr, setApr] = useState(300);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Governance"
        title="Admin Controls"
        description="Governor-only controls for the reserve, bank registry, and rate parameters. Actions emit public events; unauthorized calls revert on-chain."
        right={
          <span className="badge-gold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Governor role
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
            <Gauge className="h-4 w-4 text-gold-400" />
            Reserve APR
          </div>
          <div className="font-display text-xl font-semibold text-ink-100">
            Tier 1 → Tier 2 lending rate
          </div>
          <div className="mt-4">
            <label className="label">Basis points (100 = 1.00%)</label>
            <input
              type="number"
              className="input"
              min={0}
              max={5000}
              value={apr}
              onChange={(e) => setApr(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-ink-200">Safety cap: 50.00% (5000 bps)</p>
          </div>
          <button className="btn-primary mt-4" onClick={() => toast.success(`APR set to ${(apr / 100).toFixed(2)}%`)}>
            Update rate
          </button>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
            <UserPlus className="h-4 w-4 text-gold-400" />
            Register a bank
          </div>
          <div className="font-display text-xl font-semibold text-ink-100">
            Add National Bank
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Wallet address</label>
              <input className="input" placeholder="0x…" />
            </div>
            <div>
              <label className="label">Display name</label>
              <input className="input" placeholder="Bangladesh National Bank" />
            </div>
            <div>
              <label className="label">Jurisdiction</label>
              <input className="input" placeholder="Bangladesh" />
            </div>
          </div>
          <button className="btn-primary mt-4" onClick={() => toast.success("Registration transaction prepared")}>
            Register
          </button>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink-200">
            <AlertTriangle className="h-4 w-4 text-gold-400" />
            Emergency
          </div>
          <div className="font-display text-xl font-semibold text-ink-100">System breaker</div>
          <p className="mt-1 text-xs text-ink-200">
            Pausing halts allocations, repayments, and loan lifecycle actions at every tier. Use
            only during a confirmed incident.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-ink-600/60 bg-ink-900/60 px-4 py-3">
            <span className="text-sm text-ink-200">Current state</span>
            <span className={paused ? "badge-red" : "badge-green"}>
              {paused ? "Paused" : "Live"}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className={paused ? "btn-primary" : "btn-danger"}
              onClick={() => {
                setPaused((p) => !p);
                toast(paused ? "System resumed" : "System paused");
              }}
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {paused ? "Unpause" : "Pause"}
            </button>
            <button className="btn-ghost">
              <KeyRound className="h-4 w-4" />
              Rotate keys
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Audit log</div>
            <div className="font-display text-xl font-semibold text-ink-100">Recent governor actions</div>
          </div>
          <span className="text-xs text-ink-200">Block #5,281,942</span>
        </div>
        <ul className="space-y-2 text-sm">
          {[
            { at: "Mar 21 · 14:02", who: "0xDEa…b17", action: "Allocated 120 ETH → Bangladesh NB" },
            { at: "Mar 19 · 11:45", who: "0xDEa…b17", action: "Registered Lagos Local Bank" },
            { at: "Mar 17 · 09:20", who: "0xDEa…b17", action: "Updated lendingAprBps 300 → 320" },
            { at: "Mar 16 · 16:38", who: "0xDEa…b17", action: "Revoked inactive National Bank" },
          ].map((e, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-ink-600/50 bg-ink-900/50 px-3 py-2.5"
            >
              <div>
                <div className="font-medium text-ink-100">{e.action}</div>
                <div className="text-xs text-ink-200">
                  by <span className="font-mono text-gold-300">{e.who}</span> · {e.at}
                </div>
              </div>
              <span className="badge">onchain</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
