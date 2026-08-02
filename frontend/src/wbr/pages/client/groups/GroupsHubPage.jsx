import { Link } from "react-router-dom";
import Glass from "../../../components/ui/Glass";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Icon from "../../../components/ui/Icon";
import StateMessage from "../../../components/ui/StateMessage";
import { useMyGroups } from "../../../hooks/useGroups";

/**
 * Route: `/app/groups` — hub for create / join / open dashboards
 */
export default function GroupsHubPage() {
  const { groups, loading, error, refresh } = useMyGroups();

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Group lending</p>
        <h1 className="client-title">Borrow together</h1>
        <p className="client-lede">
          Form a circle of 3–20 members, apply for a shared loan, and record unanimous consent
          off-chain. Solo loans stay under Loans.
        </p>
      </header>

      <div className="quick-actions">
        <Button as={Link} to="/app/groups/create">
          Create group
        </Button>
        <Button as={Link} to="/app/groups/join" variant="ghost" showArrow={false}>
          Join with code
        </Button>
      </div>

      {error ? (
        <StateMessage
          variant="error"
          title="Could not load groups"
          description="Check that the API is running, then retry."
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      ) : null}

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">Your groups</h2>
        </div>

        {loading ? (
          <StateMessage variant="empty" title="Loading groups" description="Fetching your circles…" />
        ) : null}

        {!loading && !groups.length && !error ? (
          <Glass className="client-panel">
            <Badge icon="group">Empty</Badge>
            <h2 className="client-panel-title">No groups yet</h2>
            <p className="client-lede">
              Create a circle or join with invite code <code className="mono">WBR-DEMO</code> from
              the seed.
            </p>
            <Button as={Link} to="/app/groups/join" variant="ghost" showArrow={false}>
              Join demo group
            </Button>
          </Glass>
        ) : null}

        <div className="group-list">
          {groups.map((g) => (
            <Link key={g.id} to={`/app/groups/${g.id}`} className="group-list-item glass">
              <div>
                <strong>{g.name}</strong>
                <p className="client-lede" style={{ margin: "4px 0 0" }}>
                  {g.memberCount} members · {g.status}
                  {g.pendingRequest ? " · consent pending" : ""}
                  {g.activeRequest ? " · loan active" : ""}
                </p>
              </div>
              <Icon name="chevronRight" size={18} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
