import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { mockReserveSummary } from "../data/mockReserveSummary";

/**
 * Public reserve summary for Landing (A.1).
 * GET /api/public/reserve-summary (Postgres InstitutionCapital). Falls back to mock if API is down.
 */
export function useReserveSummary() {
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
    source: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await api.get("/api/public/reserve-summary");
        if (!cancelled) {
          setState({ status: "success", data, error: null, source: "api" });
        }
      } catch (err) {
        if (!cancelled) {
          // Graceful degrade per plan A.1
          setState({
            status: "success",
            data: mockReserveSummary,
            error: err,
            source: "cache",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
