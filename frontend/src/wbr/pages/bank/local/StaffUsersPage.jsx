import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StateMessage from "../../../components/ui/StateMessage";
import AccessDenied from "../../../components/ui/AccessDenied";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";

/**
 * Route: `/bank/local/users` — plan I.33 (LOCAL_BANK_ADMIN+)
 */
export default function StaffUsersPage() {
  const role = useSession((s) => s.role ?? s.user?.role);
  const toast = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    wallet: "",
    displayName: "",
    role: "APPROVER",
  });
  const [target, setTarget] = useState(null);

  const allowed =
    role === "LOCAL_BANK_ADMIN" || role === "NATIONAL_BANK_ADMIN" || role === "OWNER";

  async function load() {
    setLoading(true);
    try {
      const d = await api.get("/api/local-bank/staff");
      setStaff(d.staff || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (allowed) void load();
  }, [allowed]);

  if (!allowed) {
    return (
      <AccessDenied
        title="Admin only"
        description="Staff management requires Local Bank Admin (or higher)."
        homeTo="/bank/local/dashboard"
      />
    );
  }

  async function addStaff() {
    setBusy(true);
    try {
      await api.post("/api/local-bank/staff", form);
      toast.show("Staff added", { variant: "success" });
      setSheet(null);
      setForm({ wallet: "", displayName: "", role: "APPROVER" });
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function suspend() {
    if (!target) return;
    setBusy(true);
    try {
      await api.post(`/api/local-bank/staff/${target.id}/suspend`);
      toast.show("Suspended", { variant: "success" });
      setSheet(null);
      setTarget(null);
      await load();
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function activate(row) {
    setBusy(true);
    try {
      await api.post(`/api/local-bank/staff/${row.id}/activate`);
      toast.show("Activated", { variant: "success" });
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
        <p className="eyebrow">Staff</p>
        <h1 className="client-title">Bank users & approvers</h1>
        <p className="client-lede">
          Manage which wallets hold Operator or Approver roles at this Local Bank.
        </p>
      </header>

      <div className="quick-actions">
        <Button type="button" onClick={() => setSheet("add")}>
          Add staff
        </Button>
      </div>

      {loading && staff.length === 0 ? (
        <StateMessage title="Loading staff…" description="Role roster for this branch." />
      ) : null}

      {error && staff.length === 0 ? (
        <StateMessage
          title="Staff list unavailable"
          description={error.message}
          action={{ label: "Retry", onClick: () => void load() }}
        />
      ) : null}

      {!loading && staff.length === 0 && !error ? (
        <StateMessage variant="empty" title="No staff recorded" description="Add an approver to start." />
      ) : null}

      <ul className="ops-stack">
        {staff.map((row) => (
          <li key={row.id} className="ops-row glass">
            <div>
              <strong>{row.displayName}</strong>
              <span>
                {row.role.replaceAll("_", " ")} · added{" "}
                {row.addedAt ? new Date(row.addedAt).toLocaleDateString() : "—"}
              </span>
              <code style={{ display: "block", fontSize: 11, marginTop: 4 }}>{row.wallet}</code>
            </div>
            <div className="ops-row-meta">
              <Badge icon={row.status === "ACTIVE" ? "check" : "alert"}>{row.status}</Badge>
              {row.status === "ACTIVE" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  showArrow={false}
                  disabled={busy}
                  onClick={() => {
                    setTarget(row);
                    setSheet("suspend");
                  }}
                >
                  Suspend
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  showArrow={false}
                  disabled={busy}
                  onClick={() => void activate(row)}
                >
                  Activate
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Sheet open={sheet === "add"} onClose={() => !busy && setSheet(null)} title="Add staff member">
        <div className="settings-fields">
          <Input
            label="Display name"
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          />
          <Input
            label="Wallet"
            value={form.wallet}
            onChange={(e) => setForm((f) => ({ ...f, wallet: e.target.value }))}
            placeholder="0x…"
          />
          <Input
            label="Role"
            as="select"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="APPROVER">Approver</option>
            <option value="LOCAL_BANK_ADMIN">Local Bank Admin</option>
          </Input>
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button
            type="button"
            onClick={() => void addStaff()}
            disabled={busy || form.displayName.length < 2 || !/^0x[a-fA-F0-9]{40}$/.test(form.wallet)}
          >
            Confirm add
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === "suspend"} onClose={() => !busy && setSheet(null)} title="Suspend access">
        <p className="client-lede">
          Suspend {target?.displayName}? The branch must keep at least one active approver.
        </p>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Button type="button" onClick={() => void suspend()} disabled={busy}>
            Confirm suspend
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => setSheet(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
