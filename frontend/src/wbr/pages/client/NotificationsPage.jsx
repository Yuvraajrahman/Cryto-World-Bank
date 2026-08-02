import { useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/ui/Icon";
import Glass from "../../components/ui/Glass";
import StateMessage from "../../components/ui/StateMessage";
import { useToast } from "../../components/ui/Toast";
import { useNotifications } from "../../hooks/useNotifications";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "loan", label: "Loan" },
  { key: "kyc", label: "KYC" },
  { key: "payment", label: "Payment" },
  { key: "agent", label: "Agent" },
  { key: "chat", label: "Chat" },
];

function groupByDate(items) {
  const groups = new Map();
  for (const item of items) {
    const day = new Date(item.createdAt).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day).push(item);
  }
  return [...groups.entries()];
}

/**
 * Route: `/app/notifications` — plan C.12 Notifications Center
 */
export default function NotificationsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const outlet = useOutletContext() || {};
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const category = filter !== "all" && filter !== "unread" ? filter : null;
  const unreadOnly = filter === "unread";
  const { items, unreadCount, loading, error, refresh, markRead, markUnread, markAllRead } =
    useNotifications({ category, unreadOnly });

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    return items.filter((item) => {
      if (q) {
        const hay = `${item.title || ""} ${item.body || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (dateRange !== "all") {
        const t = new Date(item.createdAt).getTime();
        const day = 86400_000;
        if (dateRange === "today" && now - t > day) return false;
        if (dateRange === "7d" && now - t > 7 * day) return false;
        if (dateRange === "30d" && now - t > 30 * day) return false;
      }
      return true;
    });
  }, [items, search, dateRange]);

  const grouped = useMemo(() => groupByDate(filteredItems), [filteredItems]);

  async function onOpen(item) {
    try {
      if (!item.read) {
        await markRead(item.id);
        outlet.refreshUnread?.();
      }
    } catch {
      /* still navigate */
    }
    if (item.href) navigate(item.href);
  }

  async function onMarkAll() {
    try {
      await markAllRead();
      outlet.refreshUnread?.();
      toast.show("All marked as read", { variant: "success" });
    } catch (err) {
      toast.show(err.message || "Failed", { variant: "error" });
    }
  }

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Inbox</p>
        <h1 className="client-title">Notifications</h1>
        <p className="client-lede">
          Loan status, payments, KYC, and agent confirmations — {unreadCount} unread.
        </p>
        <div className="settings-row-actions">
          <Button type="button" variant="ghost" showArrow={false} onClick={() => void onMarkAll()}>
            Mark all read
          </Button>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => void refresh()}>
            Refresh
          </Button>
        </div>
      </header>

      <div className="notif-filters" role="tablist" aria-label="Filter notifications">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            className={`notif-chip${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="notif-search-row">
        <input
          className="field-input"
          type="search"
          placeholder="Search title or body…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search notifications"
        />
        <select
          className="field-input"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          aria-label="Date range"
        >
          <option value="all">Any time</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      <Glass className="client-panel notif-panel">
      {loading && items.length === 0 ? (
        <StateMessage variant="empty" title="Loading…" description="Fetching your inbox." />
      ) : null}

      {error && items.length === 0 ? (
        <StateMessage
          title="Notifications unavailable"
          description={error.message || "Try again."}
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      ) : null}

      {!loading && !error && filteredItems.length === 0 ? (
        <StateMessage
          variant="empty"
          title={items.length ? "No matches" : "You're all caught up"}
          description={
            items.length
              ? "Try a different search or date range."
              : "New loan, KYC, and payment events will land here."
          }
          action={{ label: "Go home", onClick: () => navigate("/app/dashboard") }}
        />
      ) : null}

      {grouped.map(([day, rows]) => (
        <section key={day} className="client-section">
          <h2 className="client-section-title" style={{ fontSize: "0.95rem" }}>
            {day}
          </h2>
          <ul className="notif-list">
            {rows.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`notif-row glass${item.read ? "" : " unread"}`}
                  onClick={() => void onOpen(item)}
                >
                  <span className="notif-icon" aria-hidden>
                    <Icon
                      name={
                        item.category === "loan"
                          ? "loan"
                          : item.category === "kyc"
                            ? "passport"
                            : item.category === "agent"
                              ? "agent"
                              : item.category === "payment"
                                ? "wallet"
                                : "bell"
                      }
                      size={18}
                    />
                  </span>
                  <span className="notif-body">
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                    <span className="notif-meta">
                      <Badge>{item.category}</Badge>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>
                  <span className="notif-actions">
                    {item.read ? (
                      <span
                        role="button"
                        tabIndex={0}
                        className="text-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          void markUnread(item.id).then(() => outlet.refreshUnread?.());
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            void markUnread(item.id).then(() => outlet.refreshUnread?.());
                          }
                        }}
                      >
                        Unread
                      </span>
                    ) : (
                      <span className="notif-dot" aria-label="Unread" />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      </Glass>

      <p className="client-lede" style={{ marginTop: 24 }}>
        Prefer email? Adjust channels in <Link to="/app/settings">Settings</Link>.
      </p>
    </div>
  );
}
