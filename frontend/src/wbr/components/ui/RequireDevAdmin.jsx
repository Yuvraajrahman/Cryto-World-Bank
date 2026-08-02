import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";

/**
 * TEMPORARY — remove RequireDevAdmin + /dev-admin before production.
 * Guard for `/dev-admin` — DEV_ADMIN role only.
 */
export default function RequireDevAdmin() {
  const role = useSession((s) => s.role ?? s.user?.role);

  if (role !== "DEV_ADMIN") {
    return (
      <AccessDenied
        title="Developer admin only"
        description={
          role
            ? `Your role (${String(role).replaceAll("_", " ")}) cannot open the temporary global admin console.`
            : "Sign in with the Dev Admin (temporary) Hardhat persona."
        }
        homeTo="/login"
      />
    );
  }

  return <Outlet />;
}
