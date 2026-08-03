/**
 * Super Admin console — permanent DEV_ADMIN platform administrator.
 * Single-page global administrator console (tabs).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";
import LogoMark from "../../components/ui/LogoMark";
import ThemeToggle from "../../components/ui/ThemeToggle";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import Input from "../../components/ui/Input";
import Sheet from "../../components/ui/Sheet";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import SimulationTab from "./SimulationTab";
import "../../global.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "simulation", label: "Simulation" },
  { id: "users", label: "Users" },
  { id: "banks", label: "Banks" },
  { id: "loans", label: "Loans" },
  { id: "ops", label: "Ops" },
];

const ROLES = [
  "OWNER",
  "NATIONAL_BANK_ADMIN",
  "LOCAL_BANK_ADMIN",
  "APPROVER",
  "BORROWER",
  "REGULATOR",
  "DEV_ADMIN",
];

function formatUsdc(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M USDC`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(2)}K USDC`;
  return `${v.toLocaleString()} USDC`;
}

function short(w) {
  if (!w) return "—";
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

function DevAdminInner() {
  const toast = useToast();
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const reset = useSession((s) => s.reset);
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [banks, setBanks] = useState({ nationalBanks: [], localBanks: [], worldBank: null });
  const [loans, setLoans] = useState([]);
  const [kycQueue, setKycQueue] = useState([]);
  const [aml, setAml] = useState([]);
  const [staff, setStaff] = useState([]);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loanStatus, setLoanStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [newNb, setNewNb] = useState({ name: "", walletAddress: "0x", jurisdiction: "", reserve: "0" });
  const [newLb, setNewLb] = useState({
    name: "",
    walletAddress: "0x",
    jurisdiction: "",
    city: "",
    parentBankId: "",
    reserve: "0",
  });
  const [alloc, setAlloc] = useState({
    toType: "NATIONAL",
    toId: "",
    amount: "1000000",
    note: "",
  });

  const loadOverview = useCallback(async () => {
    const r = await api.get("/api/dev-admin/overview");
    setOverview(r);
  }, []);

  const loadUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (roleFilter) params.set("role", roleFilter);
    const r = await api.get(`/api/dev-admin/users?${params}`);
    setUsers(r.users || []);
  }, [q, roleFilter]);

  const loadBanks = useCallback(async () => {
    const r = await api.get("/api/dev-admin/banks");
    setBanks(r);
    if (!newLb.parentBankId && r.nationalBanks?.[0]) {
      setNewLb((s) => ({ ...s, parentBankId: r.nationalBanks[0].id }));
    }
  }, [newLb.parentBankId]);

  const loadLoans = useCallback(async () => {
    const params = new URLSearchParams();
    if (loanStatus) params.set("status", loanStatus);
    const r = await api.get(`/api/dev-admin/loans?${params}`);
    setLoans(r.loans || []);
  }, [loanStatus]);

  const loadOps = useCallback(async () => {
    const [k, a, s] = await Promise.all([
      api.get("/api/dev-admin/kyc-queue"),
      api.get("/api/dev-admin/aml"),
      api.get("/api/dev-admin/staff"),
    ]);
    setKycQueue(k.items || []);
    setAml(a.alerts || []);
    setStaff(s.staff || []);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        if (tab === "overview") await loadOverview();
        if (tab === "users") await loadUsers();
        if (tab === "banks") await loadBanks();
        if (tab === "loans") await loadLoans();
        if (tab === "ops") await loadOps();
      } catch (err) {
        toast.show(err?.message || "Load failed", { variant: "error" });
      }
    })();
  }, [tab, loadOverview, loadUsers, loadBanks, loadLoans, loadOps, toast]);

  function logout() {
    reset();
    if (isConnected) disconnect();
    navigate("/login");
  }

  async function saveUser() {
    if (!editUser) return;
    setBusy(true);
    try {
      await api.patch(`/api/dev-admin/users/${editUser.id}`, {
        ...editDraft,
        bankId: editDraft.bankId ? editDraft.bankId : null,
      });
      toast.show("User updated", { variant: "success" });
      setEditUser(null);
      await loadUsers();
      if (tab === "overview") await loadOverview();
    } catch (err) {
      toast.show(err?.message || "Update failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(u) {
    if (!window.confirm(`Delete user ${u.displayName} (${u.id})? This also removes their loans.`)) return;
    setBusy(true);
    try {
      await api.delete(`/api/dev-admin/users/${u.id}`);
      toast.show("User deleted", { variant: "success" });
      await loadUsers();
    } catch (err) {
      toast.show(err?.message || "Delete failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function createNational() {
    setBusy(true);
    try {
      await api.post("/api/dev-admin/banks/national", {
        name: newNb.name,
        walletAddress: newNb.walletAddress,
        jurisdiction: newNb.jurisdiction,
        reserve: Number(newNb.reserve) || 0,
      });
      toast.show("National bank created", { variant: "success" });
      setNewNb({ name: "", walletAddress: "0x", jurisdiction: "", reserve: "0" });
      await loadBanks();
    } catch (err) {
      toast.show(err?.message || "Create failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function createLocal() {
    setBusy(true);
    try {
      await api.post("/api/dev-admin/banks/local", {
        name: newLb.name,
        walletAddress: newLb.walletAddress,
        jurisdiction: newLb.jurisdiction,
        city: newLb.city,
        parentBankId: newLb.parentBankId,
        reserve: Number(newLb.reserve) || 0,
      });
      toast.show("Local bank created", { variant: "success" });
      await loadBanks();
    } catch (err) {
      toast.show(err?.message || "Create failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function allocateAnyone() {
    setBusy(true);
    try {
      await api.post("/api/dev-admin/allocate", {
        toType: alloc.toType,
        toId: alloc.toId.trim(),
        amount: Number(alloc.amount),
        note: alloc.note || undefined,
      });
      toast.show(`Allocated ${formatUsdc(Number(alloc.amount))}`, { variant: "success" });
      await loadOverview();
      await loadBanks();
    } catch (err) {
      toast.show(err?.message || "Allocate failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function syncBanksFromDb() {
    setBusy(true);
    try {
      const r = await api.post("/api/dev-admin/banks/sync", {});
      toast.show(`Synced ${r.count ?? 0} banks from DB`, { variant: "success" });
      await loadBanks();
      await loadOverview();
    } catch (err) {
      toast.show(err?.message || "Sync failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function patchBankStatus(bank, status) {
    setBusy(true);
    try {
      await api.patch(`/api/dev-admin/banks/${bank.id}`, { status });
      toast.show(`${bank.name} → ${status}`, { variant: "success" });
      await loadBanks();
    } catch (err) {
      toast.show(err?.message || "Patch failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function deleteBank(bank) {
    if (!window.confirm(`Delete ${bank.name} (${bank.id})?`)) return;
    setBusy(true);
    try {
      await api.delete(`/api/dev-admin/banks/${bank.id}`);
      toast.show("Bank deleted", { variant: "success" });
      await loadBanks();
    } catch (err) {
      toast.show(err?.message || "Delete failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function approveLoan(id) {
    setBusy(true);
    try {
      await api.post(`/api/dev-admin/loans/${id}/approve`, {});
      toast.show("Loan approved", { variant: "success" });
      await loadLoans();
    } catch (err) {
      toast.show(err?.message || "Approve failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function rejectLoan(id) {
    setBusy(true);
    try {
      await api.post(`/api/dev-admin/loans/${id}/reject`, { reason: "Rejected by DEV_ADMIN" });
      toast.show("Loan rejected", { variant: "success" });
      await loadLoans();
    } catch (err) {
      toast.show(err?.message || "Reject failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function deleteLoan(id) {
    if (!window.confirm(`Delete loan ${id}?`)) return;
    setBusy(true);
    try {
      await api.delete(`/api/dev-admin/loans/${id}`);
      toast.show("Loan deleted", { variant: "success" });
      await loadLoans();
    } catch (err) {
      toast.show(err?.message || "Delete failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function forceKyc(u, which, status) {
    setBusy(true);
    try {
      await api.post(`/api/dev-admin/kyc/${u.id}/force-status`, { [which]: status });
      toast.show(`Forced ${which} → ${status}`, { variant: "success" });
      await loadOps();
    } catch (err) {
      toast.show(err?.message || "KYC force failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function dismissAml(id) {
    setBusy(true);
    try {
      await api.post(`/api/dev-admin/aml/${id}/dismiss`, { note: "Dismissed by DEV_ADMIN" });
      toast.show("AML dismissed", { variant: "success" });
      await loadOps();
    } catch (err) {
      toast.show(err?.message || "Dismiss failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  const allBanksList = useMemo(() => {
    const list = [];
    if (banks.worldBank) list.push(banks.worldBank);
    for (const n of banks.nationalBanks || []) list.push(n);
    for (const l of banks.localBanks || []) list.push(l);
    return list;
  }, [banks]);

  return (
    <div className="wbr-root">
      <div className="bg-orbs" aria-hidden>
        <div className="orb orb-gold" />
        <div className="orb orb-signal" />
      </div>
      <div className="grain" aria-hidden />

      <header className="app-topbar">
        <div className="app-topbar-inner">
          <Link to="/dev-admin" className="app-brand" aria-label="Super Admin home">
            <LogoMark />
            <span className="app-brand-name">Super Admin</span>
          </Link>
          <div className="app-topbar-actions">
            <Badge>SUPER ADMIN</Badge>
            <span className="app-net-pill">{short(user?.wallet)}</span>
            <ThemeToggle />
            <Button type="button" variant="ghost" showArrow={false} onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="app-main" style={{ paddingBottom: 48 }}>
        <div className="notice warn" role="status">
          Temporary developer admin — remove before production. Full mutate/delete access to demo
          data.
        </div>

        <header className="client-hero" style={{ marginTop: 16 }}>
          <p className="eyebrow">Development</p>
          <h1 className="client-title">Global admin console</h1>
          <p className="client-lede">
            Users, banks, loans, KYC, and AML across all tiers. Signed in as {user?.displayName}.
          </p>
        </header>

        <div className="quick-actions" style={{ marginTop: 12, marginBottom: 8 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`notif-chip${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && overview ? (
          <div className="client-section" style={{ gap: 20 }}>
            <div className="stats-row">
              <StatCard label="Users" value={String(overview.users?.total ?? 0)} />
              <StatCard label="Banks" value={String(
                (overview.banks?.national || 0) + (overview.banks?.local || 0) + (overview.banks?.world || 0),
              )} />
              <StatCard label="Loans" value={String(overview.loans?.total ?? 0)} />
              <StatCard label="Pending loans" value={String(overview.queues?.pendingLoans ?? 0)} />
            </div>
            <div className="stats-row" style={{ marginTop: 0 }}>
              <StatCard
                label="World reserve"
                value={formatUsdc(overview.capital?.worldReserveUsdc ?? overview.capital?.worldReserveEth)}
              />
              <StatCard label="Outstanding" value={formatUsdc(overview.loans?.outstandingEth)} />
              <StatCard label="KYC pending" value={String(overview.queues?.kycPending ?? 0)} />
              <StatCard label="AML open" value={String(overview.queues?.amlOpen ?? 0)} />
            </div>
            <Glass className="client-panel">
              <p className="eyebrow">Distribute World reserve (USDC)</p>
              <p className="client-lede">
                Super Admin can allocate to any national bank, local bank, or client User ID.
              </p>
              <div className="client-grid-2" style={{ marginTop: 12 }}>
                <label className="field">
                  <span className="field-label">Target type</span>
                  <select
                    className="field-input"
                    value={alloc.toType}
                    onChange={(e) => setAlloc({ ...alloc, toType: e.target.value })}
                  >
                    <option value="NATIONAL">National bank</option>
                    <option value="LOCAL">Local bank</option>
                    <option value="CLIENT">Client</option>
                  </select>
                </label>
                <Input
                  label={alloc.toType === "CLIENT" ? "Client User ID / loginId" : "Bank ID"}
                  value={alloc.toId}
                  onChange={(e) => setAlloc({ ...alloc, toId: e.target.value })}
                  placeholder={
                    alloc.toType === "CLIENT"
                      ? "client_bangladesh_dhaka_00001"
                      : "bank_nb_bangladesh"
                  }
                />
                <Input
                  label="Amount (USDC)"
                  value={alloc.amount}
                  onChange={(e) => setAlloc({ ...alloc, amount: e.target.value })}
                />
                <Input
                  label="Note"
                  value={alloc.note}
                  onChange={(e) => setAlloc({ ...alloc, note: e.target.value })}
                />
              </div>
              <div className="quick-actions" style={{ marginTop: 12 }}>
                <Button type="button" disabled={busy || !alloc.toId.trim()} onClick={() => void allocateAnyone()}>
                  Allocate
                </Button>
                <Button type="button" variant="ghost" showArrow={false} disabled={busy} onClick={() => void syncBanksFromDb()}>
                  Sync banks from DB
                </Button>
              </div>
            </Glass>
            <Glass className="client-panel">
              <p className="eyebrow">Quick links</p>
              <div className="quick-actions">
                <Button type="button" variant="ghost" showArrow={false} onClick={() => setTab("users")}>
                  Manage users
                </Button>
                <Button type="button" variant="ghost" showArrow={false} onClick={() => setTab("loans")}>
                  Loan decisions
                </Button>
                <Button type="button" variant="ghost" showArrow={false} onClick={() => setTab("ops")}>
                  KYC / AML ops
                </Button>
                <Button as={Link} to="/app/admin" variant="ghost" showArrow={false}>
                  Legacy on-chain admin
                </Button>
              </div>
            </Glass>
          </div>
        ) : null}

        {tab === "simulation" ? <SimulationTab /> : null}

        {tab === "users" ? (
          <div className="client-section">
            <Glass className="client-panel">
              <div className="client-grid-2">
                <Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="name, wallet, email…" />
                <label className="field">
                  <span className="field-label">Role</span>
                  <select
                    className="field-input"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="quick-actions" style={{ marginTop: 10 }}>
                <Button type="button" onClick={() => void loadUsers()} disabled={busy}>
                  Refresh
                </Button>
              </div>
            </Glass>
            <div className="ops-list">
              {users.map((u) => (
                <div key={u.id} className="ops-row">
                  <div>
                    <strong>{u.displayName}</strong>
                    <span>
                      {u.role} · {short(u.wallet)} · {u.bankId || "no bank"} · KYC1 {u.kyc1Status || "—"}
                    </span>
                    <code>{u.id}</code>
                  </div>
                  <div className="ops-row-meta">
                    <Button
                      type="button"
                      variant="ghost"
                      showArrow={false}
                      onClick={() => {
                        setEditUser(u);
                        setEditDraft({
                          displayName: u.displayName,
                          role: u.role,
                          bankId: u.bankId || "",
                          kyc1Status: u.kyc1Status || "NOT_STARTED",
                          kyc2Status: u.kyc2Status || "NOT_STARTED",
                          onboardingComplete: Boolean(u.onboardingComplete),
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      showArrow={false}
                      disabled={busy || u.id === user?.id}
                      onClick={() => void deleteUser(u)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "banks" ? (
          <div className="client-section" style={{ gap: 16 }}>
            <Glass className="client-panel">
              <p className="eyebrow">Register national</p>
              <div className="client-grid-2">
                <Input label="Name" value={newNb.name} onChange={(e) => setNewNb({ ...newNb, name: e.target.value })} />
                <Input
                  label="Jurisdiction"
                  value={newNb.jurisdiction}
                  onChange={(e) => setNewNb({ ...newNb, jurisdiction: e.target.value })}
                />
                <Input
                  label="Wallet"
                  value={newNb.walletAddress}
                  onChange={(e) => setNewNb({ ...newNb, walletAddress: e.target.value })}
                />
                <Input
                  label="Reserve (USDC)"
                  type="number"
                  value={newNb.reserve}
                  onChange={(e) => setNewNb({ ...newNb, reserve: e.target.value })}
                />
              </div>
              <Button type="button" style={{ marginTop: 10 }} disabled={busy} onClick={() => void createNational()}>
                Create national
              </Button>
            </Glass>

            <Glass className="client-panel">
              <p className="eyebrow">Register local</p>
              <div className="client-grid-2">
                <Input label="Name" value={newLb.name} onChange={(e) => setNewLb({ ...newLb, name: e.target.value })} />
                <Input label="City" value={newLb.city} onChange={(e) => setNewLb({ ...newLb, city: e.target.value })} />
                <Input
                  label="Jurisdiction"
                  value={newLb.jurisdiction}
                  onChange={(e) => setNewLb({ ...newLb, jurisdiction: e.target.value })}
                />
                <Input
                  label="Wallet"
                  value={newLb.walletAddress}
                  onChange={(e) => setNewLb({ ...newLb, walletAddress: e.target.value })}
                />
                <label className="field">
                  <span className="field-label">Parent national</span>
                  <select
                    className="field-input"
                    value={newLb.parentBankId}
                    onChange={(e) => setNewLb({ ...newLb, parentBankId: e.target.value })}
                  >
                    {(banks.nationalBanks || []).map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  label="Reserve (USDC)"
                  type="number"
                  value={newLb.reserve}
                  onChange={(e) => setNewLb({ ...newLb, reserve: e.target.value })}
                />
              </div>
              <Button type="button" style={{ marginTop: 10 }} disabled={busy} onClick={() => void createLocal()}>
                Create local
              </Button>
            </Glass>

            <div className="ops-list">
              {allBanksList.map((b) => (
                <div key={b.id} className="ops-row">
                  <div>
                    <strong>
                      {b.name} · {b.tier}
                    </strong>
                    <span>
                      {formatUsdc(b.reserve)} reserve · {b.status || "ACTIVE"} · {b.jurisdiction || b.city || "—"}
                    </span>
                    <code>{b.id}</code>
                  </div>
                  <div className="ops-row-meta">
                    {b.tier !== "WORLD" ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          showArrow={false}
                          disabled={busy}
                          onClick={() =>
                            void patchBankStatus(b, b.status === "PAUSED" ? "ACTIVE" : "PAUSED")
                          }
                        >
                          {b.status === "PAUSED" ? "Unpause" : "Pause"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          showArrow={false}
                          disabled={busy}
                          onClick={() => void deleteBank(b)}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Badge>Protected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "loans" ? (
          <div className="client-section">
            <Glass className="client-panel">
              <label className="field">
                <span className="field-label">Status filter</span>
                <select
                  className="field-input"
                  value={loanStatus}
                  onChange={(e) => setLoanStatus(e.target.value)}
                >
                  <option value="">All</option>
                  {["PENDING", "ACTIVE", "APPROVED", "REPAID", "REJECTED", "DEFAULTED"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="button" style={{ marginTop: 10 }} onClick={() => void loadLoans()}>
                Refresh
              </Button>
            </Glass>
            <div className="ops-list">
              {loans.map((l) => (
                <div key={l.id} className="ops-row">
                  <div>
                    <strong>
                      {l.id} · {formatUsdc(l.amount)} · {l.status}
                    </strong>
                    <span>
                      {l.kind} · lender {l.lenderBankId} · borrower {l.borrowerId || "—"}
                    </span>
                    <span>{l.purpose}</span>
                  </div>
                  <div className="ops-row-meta">
                    {l.status === "PENDING" ? (
                      <>
                        <Button type="button" showArrow={false} disabled={busy} onClick={() => void approveLoan(l.id)}>
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          showArrow={false}
                          disabled={busy}
                          onClick={() => void rejectLoan(l.id)}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      showArrow={false}
                      disabled={busy}
                      onClick={() => void deleteLoan(l.id)}
                    >
                      Delete
                    </Button>
                    {l.status === "PENDING" && l.kind === "BORROWER" ? (
                      <Button
                        as={Link}
                        to={`/bank/local/approvals/${l.id}`}
                        variant="ghost"
                        showArrow={false}
                      >
                        Open UI
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "ops" ? (
          <div className="client-section" style={{ gap: 16 }}>
            <Glass className="client-panel">
              <p className="eyebrow">KYC pending</p>
              <div className="ops-list">
                {kycQueue.length === 0 ? <p className="client-lede">No pending KYC.</p> : null}
                {kycQueue.map((u) => (
                  <div key={u.id} className="ops-row">
                    <div>
                      <strong>{u.displayName}</strong>
                      <span>
                        KYC1 {u.kyc1Status} · KYC2 {u.kyc2Status}
                      </span>
                    </div>
                    <div className="ops-row-meta">
                      <Button
                        type="button"
                        showArrow={false}
                        disabled={busy}
                        onClick={() => void forceKyc(u, "kyc1Status", "APPROVED")}
                      >
                        Approve L1
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        showArrow={false}
                        disabled={busy}
                        onClick={() => void forceKyc(u, "kyc2Status", "APPROVED")}
                      >
                        Approve L2
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>

            <Glass className="client-panel">
              <p className="eyebrow">AML alerts</p>
              <div className="ops-list">
                {aml.map((a) => (
                  <div key={a.id} className="ops-row">
                    <div>
                      <strong>
                        {a.clientName} · {a.status}
                      </strong>
                      <span>
                        score {a.anomalyScore} · {a.reason}
                      </span>
                      <code>{a.id}</code>
                    </div>
                    <div className="ops-row-meta">
                      {a.status === "OPEN" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          showArrow={false}
                          disabled={busy}
                          onClick={() => void dismissAml(a.id)}
                        >
                          Dismiss
                        </Button>
                      ) : (
                        <Badge>{a.status}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Glass>

            <Glass className="client-panel">
              <p className="eyebrow">Staff (all branches)</p>
              <div className="ops-list">
                {staff.map((s) => (
                  <div key={s.id} className="ops-row">
                    <div>
                      <strong>{s.displayName}</strong>
                      <span>
                        {s.role} · {s.status} · bank {s.bankId}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          </div>
        ) : null}
      </main>

      <Sheet
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        title={editUser ? `Edit ${editUser.displayName}` : "Edit user"}
      >
        {editUser ? (
          <div className="stack-form">
            <Input
              label="Display name"
              value={editDraft.displayName || ""}
              onChange={(e) => setEditDraft({ ...editDraft, displayName: e.target.value })}
            />
            <label className="field">
              <span className="field-label">Role</span>
              <select
                className="field-input"
                value={editDraft.role || "BORROWER"}
                onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Bank ID"
              value={editDraft.bankId || ""}
              onChange={(e) => setEditDraft({ ...editDraft, bankId: e.target.value })}
            />
            <label className="field">
              <span className="field-label">KYC1</span>
              <select
                className="field-input"
                value={editDraft.kyc1Status || "NOT_STARTED"}
                onChange={(e) => setEditDraft({ ...editDraft, kyc1Status: e.target.value })}
              >
                {["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">KYC2</span>
              <select
                className="field-input"
                value={editDraft.kyc2Status || "NOT_STARTED"}
                onChange={(e) => setEditDraft({ ...editDraft, kyc2Status: e.target.value })}
              >
                {["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <div className="quick-actions">
              <Button type="button" disabled={busy} onClick={() => void saveUser()}>
                Save
              </Button>
              <Button type="button" variant="ghost" showArrow={false} onClick={() => setEditUser(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}

export default function DevAdminPage() {
  return (
    <ToastProvider>
      <DevAdminInner />
    </ToastProvider>
  );
}
