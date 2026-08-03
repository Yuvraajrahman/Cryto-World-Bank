import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";

/**
 * Guard for `/dev-admin` — permanent Super Admin (DEV_ADMIN).
 */
export default function RequireDevAdmin() {
  const role = useSession((s) => s.role ?? s.user?.role);

  if (role !== "DEV_ADMIN") {
    return (
      <AccessDenied
        title="Super Admin only"
        description={
          role
            ? `Your role (${String(role).replaceAll("_", " ")}) cannot open the Super Admin console.`
            : "Sign in with the Super Admin account (admin@gmail.com) to continue."
        }
        homeTo="/login"
      />
    );
  }

  return <Outlet />;
}
