import { useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Sheet from "../../../components/ui/Sheet";
import StatusStepper from "../../../components/ui/StatusStepper";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";

/**
 * Route: `/app/groups/create`
 */
export default function CreateGroupPage() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [invites, setInvites] = useState("");
  const [terms, setTerms] = useState("");
  const [busy, setBusy] = useState(false);
  const [txState, setTxState] = useState("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [created, setCreated] = useState(null);

  function openConfirm(e) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setTxState("idle");
    setConfirmOpen(true);
  }

  async function onConfirm() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setTxState("signing");
    try {
      await new Promise((r) => setTimeout(r, 250));
      setTxState("pending");
      const inviteList = invites
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const r = await api.post("/api/groups", {
        name: name.trim(),
        invites: inviteList.length ? inviteList : undefined,
        terms: terms.trim() || undefined,
      });
      setTxState("success");
      setCreated(r.group);
      setConfirmOpen(false);
      toast.show("Group created", { variant: "success" });
    } catch (err) {
      setTxState("error");
      toast.show(err?.message || "Could not create group", { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <div className="client-page">
        <header className="client-hero">
          <p className="eyebrow">Invite code</p>
          <h1 className="client-title">{created.name}</h1>
          <p className="client-lede">Share this code so others can join.</p>
        </header>
        <Glass className="client-panel">
          <p className="eyebrow">Invite code</p>
          <p className="invite-code mono">{created.inviteCode}</p>
          <div className="quick-actions">
            <Button
              type="button"
              showArrow={false}
              onClick={() => {
                void navigator.clipboard?.writeText(created.inviteCode);
                toast.show("Copied", { variant: "success" });
              }}
            >
              Copy code
            </Button>
            <Button as={Link} to={`/app/groups/${created.id}`} variant="ghost" showArrow={false}>
              Open dashboard
            </Button>
          </div>
        </Glass>
      </div>
    );
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">New group</p>
        <h1 className="client-title">Create a lending circle</h1>
        <p className="client-lede">
          You become the organizer. Need at least 3 members before applying for a group loan.
        </p>
        <Link to="/app/groups" className="text-link">
          ← Back to groups
        </Link>
      </header>

      <Glass className="client-panel">
        <p className="eyebrow">Over-indebtedness rules</p>
        <ul className="rules-list">
          <li>Group size: 3–20 members</li>
          <li>Max 2 simultaneous active group loans</li>
          <li>30-day cooling-off after a group loan ends</li>
          <li>Per-member DTI on their share ≤ 0.40</li>
        </ul>
      </Glass>

      <Glass className="client-panel">
        <form className="stack-form" onSubmit={openConfirm}>
          <Input
            label="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dhaka Traders Circle"
            required
          />
          <Input
            label="Optional initial terms"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Mutual liability, meeting cadence, …"
            as="textarea"
            rows={3}
          />
          <Input
            label="Optional invites (wallet, email, or user id)"
            value={invites}
            onChange={(e) => setInvites(e.target.value)}
            placeholder="comma-separated"
          />
          <Button type="submit" disabled={busy || !name.trim()} block>
            Review &amp; create
          </Button>
        </form>
      </Glass>

      <Sheet
        open={confirmOpen}
        onClose={() => (!busy ? setConfirmOpen(false) : null)}
        title="Confirm new group"
      >
        <p className="client-lede">
          Create “{name.trim()}” with you as organizer
          {invites.trim() ? " and the listed invites" : ""}.
        </p>
        <StatusStepper state={txState} errorStep="pending" />
        <div className="quick-actions" style={{ marginTop: 16 }}>
          <Button type="button" disabled={busy} onClick={() => void onConfirm()}>
            {busy ? "Creating…" : "Confirm"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            showArrow={false}
            disabled={busy}
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
