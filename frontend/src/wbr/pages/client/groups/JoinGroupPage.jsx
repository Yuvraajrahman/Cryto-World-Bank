import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import StateMessage from "../../../components/ui/StateMessage";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";

/**
 * Route: `/app/groups/join`
 */
export default function JoinGroupPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [code, setCode] = useState("WBR-DEMO");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);

  async function onPreview(e) {
    e.preventDefault();
    if (!code.trim() || previewBusy) return;
    setPreviewBusy(true);
    setPreview(null);
    try {
      const r = await api.get(`/api/groups/preview?inviteCode=${encodeURIComponent(code.trim())}`);
      setPreview(r.preview);
    } catch (err) {
      toast.show(
        err?.code === "group_not_found" ? "Invalid invite code" : err?.message || "Preview failed",
        { variant: "error" },
      );
    } finally {
      setPreviewBusy(false);
    }
  }

  async function onJoin() {
    if (!preview || busy) return;
    setBusy(true);
    try {
      const r = await api.post("/api/groups/join", { inviteCode: code.trim() });
      toast.show(r.alreadyMember ? "Already a member" : "Joined group", { variant: "success" });
      navigate(`/app/groups/${r.groupId}`);
    } catch (err) {
      const msg =
        err?.code === "group_full"
          ? "Group is full"
          : err?.code === "group_not_found"
            ? "Invalid invite code"
            : err?.message || "Could not join";
      toast.show(msg, { variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Join</p>
        <h1 className="client-title">Enter invite code</h1>
        <p className="client-lede">
          Preview the circle before you join. Seed demo uses <code className="mono">WBR-DEMO</code>.
        </p>
        <Link to="/app/groups" className="text-link">
          ← Back to groups
        </Link>
      </header>

      <Glass className="client-panel">
        <form className="stack-form" onSubmit={onPreview}>
          <Input
            label="Invite code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setPreview(null);
            }}
            placeholder="WBR-XXXXXX"
            required
          />
          <Button type="submit" disabled={previewBusy || !code.trim()} block>
            {previewBusy ? "Looking up…" : "Preview group"}
          </Button>
        </form>
      </Glass>

      {preview ? (
        <Glass className="client-panel">
          <Badge>{preview.status}</Badge>
          <h2 className="client-panel-title">{preview.name}</h2>
          <p className="client-lede">
            {preview.memberCount} / {preview.maxMembers} members · min {preview.minMembers} to apply
          </p>
          {preview.termsJson?.initialTerms ? (
            <p className="client-lede">Terms: {preview.termsJson.initialTerms}</p>
          ) : (
            <p className="client-lede">No custom terms on file.</p>
          )}
          <div className="quick-actions" style={{ marginTop: 12 }}>
            <Button type="button" onClick={() => void onJoin()} disabled={busy}>
              {busy ? "Joining…" : "Confirm join"}
            </Button>
          </div>
        </Glass>
      ) : null}
    </div>
  );
}
