import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";

/** Roles that may open legacy AppLayout ops tools (not retail client). */
const OPERATOR = new Set([
  "APPROVER",
  "LOCAL_BANK_ADMIN",
  "NATIONAL_BANK_ADMIN",
  "OWNER",
  "DEV_ADMIN",
  "REGULATOR",
]);

/**
 * Blocks BORROWER (and anonymous) from legacy `/app/*` ops pages that bypass tier desks.
 */
export default function RequireOperator() {
  const role = useSession((s) => s.role ?? s.user?.role);

  if (!role || !OPERATOR.has(role)) {
    return (
      <AccessDenied
        title="Operator tools only"
        description={
          role === "BORROWER"
            ? "Retail clients use the client app under /app/dashboard. Bank operations live on the World, National, or Local desks."
            : "Sign in with an operator role to continue."
        }
        homeTo={role === "BORROWER" ? "/app/dashboard" : "/login"}
      />
    );
  }

  return <Outlet />;
}
