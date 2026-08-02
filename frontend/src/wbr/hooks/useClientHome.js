import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Retail client home aggregate — GET /api/profile/home
 */
export function useClientHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api.get("/api/profile/home");
      setData(payload);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
