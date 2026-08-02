import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/store";
import AccessDenied from "./AccessDenied";
import StateMessage from "./StateMessage";
import { api } from "@/lib/api";

/**
 * Guard for `/bank/world/multisig` — OWNER or wallets in the 2-of-3 signer set.
 */
export default function RequireWorldMultisig() {
  const role = useSession((s) => s.role ?? s.user?.role);
  const token = useSession((s) => s.token);
  const [state, setState] = useState(role === "OWNER" ? "ok" : "loading");

  useEffect(() => {
    if (role === "OWNER") {
      setState("ok");
      return;
    }
    if (!token) {
      setState("deny");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await api.get("/api/world-bank/multisig");
        if (!cancelled) setState("ok");
      } catch {
        if (!cancelled) setState("deny");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role, token]);

  if (state === "loading") {
    return (
      <div className="client-page">
        <StateMessage title="Checking signer access…" description="Validating Safe membership." />
      </div>
    );
  }

  if (state === "deny") {
    return (
      <AccessDenied
        title="Multisig signers only"
        description="This console is for World Bank OWNER or wallets in the 2-of-3 signer set."
        homeTo="/app/dashboard"
      />
    );
  }

  return <Outlet />;
}
