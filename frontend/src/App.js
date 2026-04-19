import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { Approvals } from "@/pages/Approvals";
import { AIAssistant } from "@/pages/AIAssistant";
import { NotFound } from "@/pages/NotFound";
export function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsxs(Route, { element: _jsx(AppLayout, {}), children: [_jsx(Route, { path: "/app", element: _jsx(Navigate, { to: "/app/dashboard", replace: true }) }), _jsx(Route, { path: "/app/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/app/reserve", element: _jsx(Reserve, {}) }), _jsx(Route, { path: "/app/banks", element: _jsx(Banks, {}) }), _jsx(Route, { path: "/app/loans", element: _jsx(Loans, {}) }), _jsx(Route, { path: "/app/loans/new", element: _jsx(RequestLoan, {}) }), _jsx(Route, { path: "/app/installments", element: _jsx(Installments, {}) }), _jsx(Route, { path: "/app/market", element: _jsx(Market, {}) }), _jsx(Route, { path: "/app/chat", element: _jsx(Chat, {}) }), _jsx(Route, { path: "/app/assistant", element: _jsx(AIAssistant, {}) }), _jsx(Route, { path: "/app/approvals", element: _jsx(Approvals, {}) }), _jsx(Route, { path: "/app/profile", element: _jsx(Profile, {}) }), _jsx(Route, { path: "/app/risk", element: _jsx(RiskConsole, {}) }), _jsx(Route, { path: "/app/admin", element: _jsx(Admin, {}) })] }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }));
}
