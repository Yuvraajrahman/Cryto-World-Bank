import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { mockReserveTransparency } from "../data/mockReserveTransparency";

/**
 * Public reserve transparency (A.3).
 * GET /api/public/reserve-transparency (Postgres). Mock fallback if API is down.
 */
export function useReserveTransparency() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const payload = await api.get("/api/public/reserve-transparency");
      setData(payload);
      setSource("api");
      setStatus("success");
    } catch (err) {
      setError(err);
      setData(mockReserveTransparency);
      setSource("cache");
      setStatus("success");
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const stale =
    data &&
    Date.now() - new Date(data.syncedAt).getTime() >
      (data.staleAfterMinutes ?? 30) * 60_000;

  return { status, data, error, stale: Boolean(stale), source, reload };
}
