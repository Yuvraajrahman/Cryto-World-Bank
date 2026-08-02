import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

const POLL_MS = 8_000;

/**
 * Notifications list with optional category / unread filter + polling.
 */
export function useNotifications({ category = null, unreadOnly = false } = {}) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "50");
      if (category) qs.set("category", category);
      if (unreadOnly) qs.set("unreadOnly", "1");
      const payload = await api.get(`/api/notifications?${qs.toString()}`);
      setItems(payload.items || []);
      setUnreadCount(payload.unreadCount ?? 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [category, unreadOnly]);

  useEffect(() => {
    setLoading(true);
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  async function markRead(id) {
    await api.post(`/api/notifications/${id}/read`);
    await refresh();
  }

  async function markUnread(id) {
    await api.post(`/api/notifications/${id}/unread`);
    await refresh();
  }

  async function markAllRead() {
    await api.post("/api/notifications/read-all");
    await refresh();
  }

  return {
    items,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markUnread,
    markAllRead,
  };
}
