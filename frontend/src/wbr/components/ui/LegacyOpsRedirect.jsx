import { Navigate } from "react-router-dom";
import { useSession } from "@/lib/store";

/**
 * Redirects legacy `/app/facilities` and `/app/multisig` to the correct tier desk.
 */
export function LegacyFacilitiesRedirect() {
  const role = useSession((s) => s.role ?? s.user?.role);
  if (role === "OWNER" || role === "DEV_ADMIN") {
    return <Navigate to="/bank/world/facilities" replace />;
  }
  if (role === "NATIONAL_BANK_ADMIN") {
    return <Navigate to="/bank/national/facilities" replace />;
  }
  if (role === "LOCAL_BANK_ADMIN") {
    return <Navigate to="/bank/local/facilities" replace />;
  }
  return <Navigate to="/app/dashboard" replace />;
}

export function LegacyMultisigRedirect() {
  return <Navigate to="/bank/world/multisig" replace />;
}

export function LegacyApprovalsRedirect() {
  const role = useSession((s) => s.role ?? s.user?.role);
  if (role === "NATIONAL_BANK_ADMIN" || role === "OWNER" || role === "DEV_ADMIN") {
    return <Navigate to="/bank/national/approvals" replace />;
  }
  return <Navigate to="/bank/local/approvals" replace />;
}
