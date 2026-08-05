import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";

/** Roles allowed for local capital facilities / treasury (matches facilities + treasury APIs). */
const LOCAL_ADMIN = new Set([
  "LOCAL_BANK_ADMIN",
  "NATIONAL_BANK_ADMIN",
  "OWNER",
  "DEV_ADMIN",
]);

/**
 * Guard for admin-only local ops (treasury FX, interbank/upward facilities).
 * Approvers can use approvals/KYC/AML but not capital desks.
 */
export default function RequireLocalAdmin() {
  const role = useSession((s) => s.role ?? s.user?.role);

  if (!role || !LOCAL_ADMIN.has(role)) {
    return (
      <AccessDenied
        title="Local Bank admin only"
        description={
          role
            ? `Your role (${String(role).replaceAll("_", " ")}) cannot open treasury or liquidity facilities. Sign in as Local Bank Admin.`
            : "Sign in as Local Bank Admin to continue."
        }
        homeTo="/bank/local/dashboard"
      />
    );
  }

  return <Outlet />;
}
