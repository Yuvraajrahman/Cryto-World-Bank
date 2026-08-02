import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";

/**
 * Guard for `/bank/world/*` — World Bank governor (OWNER).
 */
export default function RequireWorldAdmin() {
  const role = useSession((s) => s.role ?? s.user?.role);

  if (role !== "OWNER") {
    return (
      <AccessDenied
        title="World Bank governor only"
        description={
          role
            ? `Your role (${String(role).replaceAll("_", " ")}) cannot open global governance. Sign in with the World Bank OWNER wallet.`
            : "Sign in with the World Bank OWNER wallet to continue."
        }
        homeTo="/app/dashboard"
      />
    );
  }

  return <Outlet />;
}
