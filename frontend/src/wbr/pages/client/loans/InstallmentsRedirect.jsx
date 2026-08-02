import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useState } from "react";

/** Legacy `/app/installments` → first due loan pay page or history. */
export default function InstallmentsRedirect() {
  const [to, setTo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await api.get("/api/loans/mine");
        const active = (r.loans || []).find(
          (l) =>
            (l.status === "ACTIVE" || l.status === "APPROVED") &&
            (l.installments || []).some((i) => !i.paid),
        );
        if (!cancelled) setTo(active ? `/app/loans/${active.id}/pay` : "/app/loans/history");
      } catch {
        if (!cancelled) setTo("/app/loans/history");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!to) return null;
  return <Navigate to={to} replace />;
}
