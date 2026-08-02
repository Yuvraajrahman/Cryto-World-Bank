import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const r = await api.get("/api/loans/mine");
      setLoans(r.loans || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  return { loans, loading, error, refresh };
}

export function useLoan(loanId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!loanId) return;
    setError(null);
    try {
      const r = await api.get(`/api/loans/${loanId}`);
      setData(r);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  return { data, loan: data?.loan, loading, error, refresh };
}

export function useBorrowingLimits() {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const r = await api.get("/api/profile/limits");
      setLimits(r);
    } catch (err) {
      setError(err);
      setLimits(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  return { limits, loading, error, refresh };
}
