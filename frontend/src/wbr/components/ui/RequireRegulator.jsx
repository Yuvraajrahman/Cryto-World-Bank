import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";

/**
 * Guard for `/audit` — Regulatory Authority (A6) only.
 */
export default function RequireRegulator() {
  const role = useSession((s) => s.role ?? s.user?.role);

  if (role !== "REGULATOR") {
    return (
      <AccessDenied
        title="Regulatory Authority only"
        description={
          role
            ? `Your role (${String(role).replaceAll("_", " ")}) cannot open the read-only audit portal. Sign in with the Regulatory Authority wallet.`
            : "Sign in with the Regulatory Authority wallet to continue."
        }
        homeTo="/app/dashboard"
      />
    );
  }

  return <Outlet />;
}
