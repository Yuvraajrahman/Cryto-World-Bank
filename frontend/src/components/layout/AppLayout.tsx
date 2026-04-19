import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAccount } from "wagmi";
import { WalletGate } from "@/components/layout/WalletGate";
import { useSession } from "@/lib/store";
import { useEffect } from "react";
import { api, UserDTO } from "@/lib/api";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

export function AppLayout() {
  const { isConnected, address } = useAccount();
  const { token, user, setUser, reset } = useSession();

  // Keep session.user in sync with the backend. This also validates that the
  // JWT we persisted is still accepted after a hot-reload.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .get<{ user: UserDTO }>("/api/auth/me")
      .then((r) => {
        if (!cancelled) setUser(r.user);
      })
      .catch(() => {
        if (!cancelled) reset();
      });
    return () => {
      cancelled = true;
    };
  }, [token, setUser, reset]);

  const authed = Boolean(token) || (isConnected && Boolean(address));

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-grid-gold/10">
          <div className="container-page py-8 sm:py-10">
            {authed && user ? <Outlet /> : <WalletGate />}
          </div>
        </main>
      </div>
      {authed && user ? <ChatbotWidget /> : null}
    </div>
  );
}
