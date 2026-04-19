import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAccount } from "wagmi";
import { WalletGate } from "@/components/layout/WalletGate";

export function AppLayout() {
  const { isConnected } = useAccount();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-grid-gold/10">
          <div className="container-page py-8 sm:py-10">
            {isConnected ? <Outlet /> : <WalletGate />}
          </div>
        </main>
      </div>
    </div>
  );
}
