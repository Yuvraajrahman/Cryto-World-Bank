import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";

const LOCAL_STAFF = new Set([
  "APPROVER",
  "LOCAL_BANK_ADMIN",
  "NATIONAL_BANK_ADMIN",
  "OWNER",
  "DEV_ADMIN",
]);

/**
 * Guard for `/bank/local/*` — Local Bank approvers/admins (and higher for oversight).
 */
export default function RequireLocalStaff() {
  const role = useSession((s) => s.role ?? s.user?.role);

  if (!role || !LOCAL_STAFF.has(role)) {
    return (
      <AccessDenied
        title="Local Bank staff only"
        description={
          role
            ? `Your role (${String(role).replaceAll("_", " ")}) cannot open branch operations. Sign in with an Approver or Local Bank Admin wallet.`
            : "Sign in with an Approver or Local Bank Admin wallet to continue."
        }
        homeTo="/app/dashboard"
      />
    );
  }

  return <Outlet />;
}
