import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";

/**
 * Layout guard: pure retail client routes (groups, apply, deposits, passport).
 * Staff still reach /app/dashboard (operator home) and ops routes under AppLayout.
 */
export default function RequireBorrower() {
  const role = useSession((s) => s.role ?? s.user?.role);

  if (role && role !== "BORROWER" && role !== "GUEST" && role !== "DEV_ADMIN") {
    return (
      <AccessDenied
        title="Retail clients only"
        description={`Your role (${String(role).replaceAll("_", " ")}) cannot use this client flow. Open the operator tools from the dashboard, or sign in with a borrower wallet.`}
        homeTo="/app/dashboard"
      />
    );
  }

  return <Outlet />;
}
