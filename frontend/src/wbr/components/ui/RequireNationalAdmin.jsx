import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";

const NATIONAL_ROLES = new Set(["NATIONAL_BANK_ADMIN", "OWNER"]);

/**
 * Guard for `/bank/national/*` — National Bank Admin (+ World Owner oversight).
 */
export default function RequireNationalAdmin() {
  const role = useSession((s) => s.role ?? s.user?.role);

  if (!role || !NATIONAL_ROLES.has(role)) {
    return (
      <AccessDenied
        title="National Bank admin only"
        description={
          role
            ? `Your role (${String(role).replaceAll("_", " ")}) cannot open jurisdiction operations. Sign in with a National Bank Admin wallet.`
            : "Sign in with a National Bank Admin wallet to continue."
        }
        homeTo="/app/dashboard"
      />
    );
  }

  return <Outlet />;
}
