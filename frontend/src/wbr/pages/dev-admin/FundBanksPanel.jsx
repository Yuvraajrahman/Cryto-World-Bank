/**
 * Bulk fund World reserve → National / Local banks (or clients).
 * Checkbox list + [All] to distribute the same amount to every selected target at once.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Sheet from "../../components/ui/Sheet";
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

const FUND_TYPES = [
  { id: "NATIONAL", label: "National banks" },
  { id: "LOCAL", label: "Local banks" },
  { id: "CLIENT", label: "Clients" },
];

export default function FundBanksPanel() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [worldReserve, setWorldReserve] = useState(0);
  const [nationalBanks, setNationalBanks] = useState([]);
  const [localBanks, setLocalBanks] = useState([]);
  const [clientCount, setClientCount] = useState(0);
  const [toType, setToType] = useState("NATIONAL");
  /** When true, every bank/client of the type gets the amount. */
  const [allChecked, setAllChecked] = useState(true);
  /** Selected bank ids when All is unchecked (multi-select). */
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("1000000");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const [banks, overview] = await Promise.all([
      api.get("/api/dev-admin/banks"),
      api.get("/api/dev-admin/overview"),
    ]);
    setNationalBanks(banks.nationalBanks || []);
    setLocalBanks(banks.localBanks || []);
    setWorldReserve(overview.capital?.worldReserveUsdc ?? overview.capital?.worldReserveEth ?? 0);
    setClientCount(overview.users?.byRole?.BORROWER ?? 0);
  }, []);

  useEffect(() => {
    void load().catch(() => {});
  }, [load]);

  useEffect(() => {
    if (!open) return;
    void load().catch((err) => toast.show(err?.message || "Failed to load banks", { variant: "error" }));
  }, [open, load, toast]);

  const fullList = useMemo(() => {
    if (toType === "NATIONAL") return nationalBanks;
    if (toType === "LOCAL") return localBanks;
    return [];
  }, [toType, nationalBanks, localBanks]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fullList;
    return fullList.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q) ||
        b.jurisdiction?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q),
    );
  }, [fullList, search]);

  const targetCount = useMemo(() => {
    if (toType === "CLIENT") {
      if (allChecked) return clientCount || 0;
      return clientId.trim() ? 1 : 0;
    }
    if (allChecked) return fullList.length;
    return selectedIds.size;
  }, [toType, allChecked, clientCount, clientId, fullList.length, selectedIds]);

  const amountNum = Number(amount) || 0;
  const totalCost = amountNum * targetCount;
  const overBudget = totalCost > worldReserve + 1e-9;
  const canSubmit = amountNum > 0 && targetCount > 0 && !overBudget;

  function switchType(id) {
    setToType(id);
    setAllChecked(true);
    setSelectedIds(new Set());
    setClientId("");
    setSearch("");
  }

  function toggleAll(checked) {
    setAllChecked(checked);
    if (checked) setSelectedIds(new Set());
  }

  function toggleBank(id) {
    setAllChecked(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const body = {
        toType,
        amountPerTarget: amountNum,
        note: note || undefined,
      };

      if (toType === "CLIENT") {
        if (allChecked) {
          body.all = true;
        } else {
          body.all = false;
          body.targetIds = [clientId.trim()];
        }
      } else if (allChecked) {
        body.all = true;
      } else {
        body.all = false;
        body.targetIds = Array.from(selectedIds);
      }

      const r = await api.post("/api/dev-admin/allocate/bulk", body);
      toast.show(
        `Distributed ${formatUsdc(amountNum)} × ${r.fundedCount} → ${formatUsdc(r.totalUsdc)}`,
        { variant: "success" },
      );
      setWorldReserve(r.worldReserveUsdc ?? worldReserve - r.totalUsdc);
      await load();
      setOpen(false);
    } catch (err) {
      toast.show(err?.message || err?.error || "Fund failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  const typeCountLabel =
    toType === "CLIENT"
      ? clientCount || "…"
      : toType === "NATIONAL"
        ? nationalBanks.length
        : localBanks.length;

  return (
    <>
      <Glass className="client-panel fund-panel" level={2}>
        <div className="client-section-head">
          <div>
            <h2 className="client-panel-title">Fund banks &amp; clients</h2>
            <p className="client-lede" style={{ margin: 0 }}>
              Distribute one amount to many banks at once. Check <strong>All</strong>, enter the
              amount per bank, submit — World reserve is debited and Postgres reserves update
              immediately.
            </p>
          </div>
          <Button type="button" onClick={() => setOpen(true)}>
            Fund
          </Button>
        </div>
        <div className="fund-panel-meta">
          <Badge icon="activity">World reserve: {formatUsdc(worldReserve || null)}</Badge>
          <span className="fund-panel-hint">
            National / Local / Clients → ☐ All → amount each → Submit.
          </span>
        </div>
      </Glass>

      <Sheet open={open} onClose={() => !busy && setOpen(false)} title="Distribute to banks">
        <div className="fund-sheet ops-stack">
          <p className="client-lede" style={{ marginTop: 0 }}>
            World reserve available: <strong>{formatUsdc(worldReserve)}</strong>
          </p>

          <div className="fund-type-tabs" role="tablist">
            {FUND_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                className={`ops-log-tab${toType === t.id ? " active" : ""}`}
                aria-selected={toType === t.id}
                onClick={() => switchType(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className={`fund-all-check${allChecked ? " on" : ""}`}>
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
            />
            <span>
              <strong>All</strong> — distribute this amount to every{" "}
              {toType === "NATIONAL" ? "national bank" : toType === "LOCAL" ? "local bank" : "client"}{" "}
              ({typeCountLabel})
            </span>
          </label>

          {toType !== "CLIENT" ? (
            <>
              {!allChecked ? (
                <Input
                  label="Search banks"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, country, id…"
                />
              ) : null}
              <div className="fund-bank-list" role="group" aria-label="Banks">
                {filteredList.slice(0, allChecked ? 12 : 120).map((b) => {
                  const checked = allChecked || selectedIds.has(b.id);
                  return (
                    <label
                      key={b.id}
                      className={`fund-bank-row check${checked ? " selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={allChecked}
                        onChange={() => toggleBank(b.id)}
                      />
                      <span>
                        <strong>{b.name}</strong>
                        <small>
                          {b.jurisdiction || b.city || "—"} · {formatUsdc(b.reserve)} reserve
                        </small>
                      </span>
                    </label>
                  );
                })}
                {allChecked && fullList.length > 12 ? (
                  <p className="fund-bank-more">
                    …and {fullList.length - 12} more (all {fullList.length} will receive the amount)
                  </p>
                ) : null}
                {!allChecked && filteredList.length === 0 ? (
                  <p className="client-lede">No banks match — uncheck All and pick banks, or clear search.</p>
                ) : null}
              </div>
              {!allChecked ? (
                <p className="fund-panel-hint">
                  Unchecked All — tick individual banks below (or re-check All for everyone).
                  Selected: {selectedIds.size}
                </p>
              ) : null}
            </>
          ) : null}

          {toType === "CLIENT" && !allChecked ? (
            <Input
              label="Client user id or login"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="user id…"
            />
          ) : null}

          {toType === "CLIENT" && allChecked ? (
            <p className="client-lede">
              Will credit checking for all <strong>{clientCount}</strong> borrower clients with the
              amount below.
            </p>
          ) : null}

          <Input
            label="Amount each (USDC)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
          />
          <Input
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Demo liquidity injection"
          />

          <div className={`fund-cost${overBudget ? " over" : ""}`}>
            <div>
              <span>Banks / targets</span>
              <strong>{targetCount}</strong>
            </div>
            <div>
              <span>Each</span>
              <strong>{formatUsdc(amountNum)}</strong>
            </div>
            <div>
              <span>Total debit</span>
              <strong>{formatUsdc(totalCost)}</strong>
            </div>
          </div>
          {overBudget ? (
            <p className="fund-warn">
              Total exceeds World reserve — lower the amount or uncheck All and fund fewer banks.
            </p>
          ) : (
            <p className="fund-panel-hint" style={{ margin: 0 }}>
              After: {formatUsdc(Math.max(0, worldReserve - totalCost))} left in World reserve.
            </p>
          )}

          <div className="fund-actions">
            <Button type="button" variant="ghost" showArrow={false} disabled={busy} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={busy || !canSubmit} onClick={() => void submit()}>
              {busy
                ? "Distributing…"
                : allChecked
                  ? `Distribute to all ${targetCount}`
                  : `Distribute to ${targetCount}`}
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
