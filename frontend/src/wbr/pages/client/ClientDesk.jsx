import DeskShell from "../../components/layout/DeskShell";
import DashboardPage from "./DashboardPage";
import SavingsPage from "./deposits/SavingsPage";
import FixedDepositPage from "./deposits/FixedDepositPage";
import CheckingPage from "./deposits/CheckingPage";
import ConvertPage from "./deposits/ConvertPage";
import ExchangePage from "./deposits/ExchangePage";
import StatementPage from "./deposits/StatementPage";
import HistoryPage from "./loans/HistoryPage";
import ApplyHubPage from "./loans/ApplyHubPage";
import LimitsPage from "./loans/LimitsPage";
import LoanDetailPage from "./loans/LoanDetailPage";
import GroupsHubPage from "./groups/GroupsHubPage";
import PassportPage from "./PassportPage";
import AgentPage from "./AgentPage";
import SettingsPage from "./SettingsPage";
import NotificationsPage from "./NotificationsPage";
import RequestLoanPage from "../shared/RequestLoanPage";
import { useSession } from "@/lib/store";
import { Navigate } from "react-router-dom";

const CLIENT_TABS = [
  { key: "overview", label: "Overview", icon: "home" },
  { key: "accounts", label: "Accounts", icon: "savings" },
  { key: "borrow", label: "Borrow", icon: "loan" },
  { key: "groups", label: "Groups", icon: "group" },
  { key: "fx", label: "FX", icon: "wallet" },
  { key: "passport", label: "Passport", icon: "passport" },
  { key: "assistant", label: "Assistant", icon: "agent" },
  { key: "settings", label: "Settings", icon: "settings" },
];

const OPERATOR_HOME = {
  OWNER: "/bank/world",
  DEV_ADMIN: "/dev-admin",
  NATIONAL_BANK_ADMIN: "/bank/national",
  LOCAL_BANK_ADMIN: "/bank/local",
  APPROVER: "/bank/local",
  REGULATOR: "/audit",
};

/**
 * Client desk — all retail features as tabs (desktop).
 * Staff who land on /app are redirected to their bank desk.
 * Route: `/app`
 */
export default function ClientDesk() {
  const user = useSession((s) => s.user);
  const role = user?.role;

  if (role && OPERATOR_HOME[role]) {
    return <Navigate to={OPERATOR_HOME[role]} replace />;
  }

  return (
    <DeskShell
      tier="client"
      brand="Client Banking"
      homePath="/app"
      tabs={CLIENT_TABS}
      defaultTab="overview"
    >
      {({ tab, params, setTab }) => {
        const loanId = params.get("loan");
        const account = params.get("account") || "savings";
        const fx = params.get("fx") || "convert";
        const borrow = params.get("view") || "history";

        switch (tab) {
          case "accounts":
            return (
              <div className="desk-panel">
                <div className="desk-panel-head">
                  <div>
                    <h1>Accounts</h1>
                    <p>Savings, fixed deposits, checking, and statements.</p>
                  </div>
                  <div className="quick-actions">
                    {[
                      ["savings", "Savings"],
                      ["fixed", "Fixed"],
                      ["checking", "Checking"],
                      ["statement", "Statement"],
                    ].map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        className={`btn btn-sm${account === k ? " btn-primary" : " btn-ghost"}`}
                        onClick={() => setTab("accounts", { account: k })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {account === "fixed" ? (
                  <FixedDepositPage />
                ) : account === "checking" ? (
                  <CheckingPage />
                ) : account === "statement" ? (
                  <StatementPage />
                ) : (
                  <SavingsPage />
                )}
              </div>
            );
          case "borrow":
            if (loanId) {
              return <LoanDetailPage loanId={loanId} />;
            }
            return (
              <div className="desk-panel">
                <div className="desk-panel-head">
                  <div>
                    <h1>Borrow</h1>
                    <p>Apply, track loans, and manage limits.</p>
                  </div>
                  <div className="quick-actions">
                    {[
                      ["history", "History"],
                      ["apply", "Apply"],
                      ["request", "Request"],
                      ["limits", "Limits"],
                    ].map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        className={`btn btn-sm${borrow === k ? " btn-primary" : " btn-ghost"}`}
                        onClick={() => setTab("borrow", { view: k, loan: null })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {borrow === "apply" ? (
                  <ApplyHubPage />
                ) : borrow === "request" ? (
                  <RequestLoanPage
                    title="Request a loan"
                    onDone={(r) =>
                      setTab("borrow", {
                        view: "history",
                        loan: r?.loan?.id || null,
                      })
                    }
                  />
                ) : borrow === "limits" ? (
                  <LimitsPage />
                ) : (
                  <HistoryPage />
                )}
              </div>
            );
          case "groups":
            return <GroupsHubPage />;
          case "fx":
            return (
              <div className="desk-panel">
                <div className="desk-panel-head">
                  <div>
                    <h1>FX & convert</h1>
                    <p>USD → USDC on-ramp and retail exchange.</p>
                  </div>
                  <div className="quick-actions">
                    <button
                      type="button"
                      className={`btn btn-sm${fx === "convert" ? " btn-primary" : " btn-ghost"}`}
                      onClick={() => setTab("fx", { fx: "convert" })}
                    >
                      Convert USD
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm${fx === "exchange" ? " btn-primary" : " btn-ghost"}`}
                      onClick={() => setTab("fx", { fx: "exchange" })}
                    >
                      Exchange
                    </button>
                  </div>
                </div>
                {fx === "exchange" ? <ExchangePage /> : <ConvertPage />}
              </div>
            );
          case "passport":
            return <PassportPage />;
          case "assistant":
            return <AgentPage />;
          case "settings":
            return (
              <div className="desk-panel">
                <SettingsPage />
                <NotificationsPage />
              </div>
            );
          case "overview":
          default:
            return <DashboardPage />;
        }
      }}
    </DeskShell>
  );
}
