import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import StateMessage from "../../../components/ui/StateMessage";
import EligibilityChecklist from "../../../components/groups/EligibilityChecklist";
import { useToast } from "../../../components/ui/Toast";
import { api } from "@/lib/api";
import { useGroup } from "../../../hooks/useGroups";

/**
 * Route: `/app/groups/:groupId`
 */
export default function GroupDashboardPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { group, loading, error, refresh } = useGroup(groupId);
  const [leaveBusy, setLeaveBusy] = useState(false);

  async function onLeave() {
    if (!group || leaveBusy) return;
    setLeaveBusy(true);
    try {
      await api.post(`/api/groups/${group.id}/leave`, {});
      toast.show("Left group", { variant: "success" });
      navigate("/app/groups");
    } catch (err) {
      toast.show(
        err?.code === "active_group_loan"
          ? "Cannot leave while a group loan is active"
          : err?.code === "organizer_cannot_leave"
            ? "Organizer must transfer role or close the group first"
            : err?.message || "Leave failed",
        { variant: "error" },
      );
    } finally {
      setLeaveBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="client-page">
        <StateMessage variant="empty" title="Loading group" description="Fetching roster and loans…" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="client-page">
        <StateMessage
          variant="error"
          title="Group unavailable"
          description="Not found, or you are not a member."
          action={{ label: "Back to groups", onClick: () => navigate("/app/groups") }}
        />
      </div>
    );
  }

  const pending = group.requests?.find((r) => r.status === "AWAITING_CONSENT");
  const active = group.requests?.find((r) => r.status === "ACTIVE");

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Group · {group.status}</p>
        <h1 className="client-title">{group.name}</h1>
        <p className="client-lede">
          Invite <code className="mono">{group.inviteCode}</code> · {group.members?.length || 0}{" "}
          members · role {group.myRole || "—"}
          {group.activeShareEth != null
            ? ` · ≈ ${group.activeShareEth.toFixed(4)} ETH share each`
            : ""}
        </p>
        <Link to="/app/groups" className="text-link">
          ← All groups
        </Link>
      </header>

      {group.delinquent ? (
        <div className="notice warn">
          Mutual liability: an installment on the linked group loan appears overdue. Members share
          exposure until the schedule is current.
        </div>
      ) : null}

      <div className="quick-actions">
        <Button as={Link} to={`/app/groups/${group.id}/apply`} disabled={Boolean(pending)}>
          Apply for group loan
        </Button>
        {pending ? (
          <Button
            as={Link}
            to={`/app/groups/${group.id}/consent?requestId=${pending.id}`}
            variant="ghost"
            showArrow={false}
          >
            Review consent
          </Button>
        ) : null}
        <Button type="button" variant="ghost" showArrow={false} onClick={() => void refresh()}>
          Refresh
        </Button>
        <Button type="button" variant="ghost" showArrow={false} onClick={() => void onLeave()} disabled={leaveBusy}>
          {leaveBusy ? "Leaving…" : "Leave group"}
        </Button>
      </div>

      <div className="client-grid-2">
        <Glass className="client-panel">
          <p className="eyebrow">Members</p>
          <ul className="member-roster">
            {(group.members || []).map((m) => (
              <li key={m.id}>
                <div>
                  <strong>{m.displayName || m.walletAddress || m.userId}</strong>
                  <span className="member-meta">
                    {m.role}
                    {m.shareEth != null ? ` · liability ${m.shareEth.toFixed(4)} ETH` : ""}
                    {m.walletAddress
                      ? ` · ${m.walletAddress.slice(0, 6)}…${m.walletAddress.slice(-4)}`
                      : ""}
                  </span>
                  {m.retailLoanId ? (
                    <>
                      {" "}
                      <Link to={`/app/loans/${m.retailLoanId}`} className="text-link">
                        view loan share
                      </Link>
                    </>
                  ) : null}
                </div>
                <Badge>{m.role === "ORGANIZER" ? "org" : "member"}</Badge>
              </li>
            ))}
          </ul>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Eligibility</p>
          <EligibilityChecklist eligibility={group.eligibility} dense />
          {active ? (
            <p className="client-lede" style={{ marginTop: 12 }}>
              Active loan: {active.totalAmountEth} ETH total, split into one installment
              loan per member (see "view loan share" next to each member above).
            </p>
          ) : null}
          {pending ? (
            <p className="client-lede" style={{ marginTop: 12 }}>
              Pending consent for {pending.totalAmountEth} ETH · {pending.termMonths} mo
            </p>
          ) : null}
        </Glass>
      </div>
    </div>
  );
}
