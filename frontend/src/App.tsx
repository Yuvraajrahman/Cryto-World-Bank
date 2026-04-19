import { Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "@/pages/Landing";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Reserve } from "@/pages/Reserve";
import { Loans } from "@/pages/Loans";
import { RequestLoan } from "@/pages/RequestLoan";
import { Installments } from "@/pages/Installments";
import { Market } from "@/pages/Market";
import { Chat } from "@/pages/Chat";
import { Profile } from "@/pages/Profile";
import { RiskConsole } from "@/pages/RiskConsole";
import { Admin } from "@/pages/Admin";
import { Banks } from "@/pages/Banks";
import { NotFound } from "@/pages/NotFound";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AppLayout />}>
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/reserve" element={<Reserve />} />
        <Route path="/app/banks" element={<Banks />} />
        <Route path="/app/loans" element={<Loans />} />
        <Route path="/app/loans/new" element={<RequestLoan />} />
        <Route path="/app/installments" element={<Installments />} />
        <Route path="/app/market" element={<Market />} />
        <Route path="/app/chat" element={<Chat />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/risk" element={<RiskConsole />} />
        <Route path="/app/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
