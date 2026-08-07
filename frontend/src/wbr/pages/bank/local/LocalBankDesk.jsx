import DeskShell from "../../../components/layout/DeskShell";
import LocalDashboardPage from "./LocalDashboardPage";
import ApprovalsQueuePage from "./ApprovalsQueuePage";
import LoanDecisionPage from "./LoanDecisionPage";
import LocalFacilitiesPage from "./LocalFacilitiesPage";
import LocalTreasuryPage from "./LocalTreasuryPage";
import KycReviewPage from "./KycReviewPage";
import AmlAlertsPage from "./AmlAlertsPage";
import StaffUsersPage from "./StaffUsersPage";
import LocalLendingSettingsPage from "./LocalLendingSettingsPage";
import RequestLoanPage from "../../shared/RequestLoanPage";
import { useSession } from "@/lib/store";

const TABS = [
  { key: "overview", label: "Overview", icon: "home" },
  { key: "approvals", label: "Approvals", icon: "loan" },
  { key: "facilities", label: "Facilities", icon: "savings", adminOnly: true },
  { key: "treasury", label: "Treasury", icon: "wallet", adminOnly: true },
  { key: "request", label: "Request National", icon: "node", adminOnly: true },
  { key: "kyc", label: "KYC", icon: "passport" },
  { key: "aml", label: "AML", icon: "alert" },
  { key: "staff", label: "Staff", icon: "group", adminOnly: true },
  { key: "settings", label: "Lending", icon: "settings", adminOnly: true },
];

/**
 * Local Bank desk — same layout as National; Local-only: KYC, AML, staff, lending settings.
 * Route: `/bank/local`
 */
export default function LocalBankDesk() {
  const user = useSession((s) => s.user);
  const isAdmin =
    user?.role === "LOCAL_BANK_ADMIN" ||
    user?.role === "NATIONAL_BANK_ADMIN" ||
    user?.role === "OWNER" ||
    user?.role === "DEV_ADMIN";

  return (
    <DeskShell
      tier="local"
      brand="Local Bank"
      homePath="/bank/local"
      tabs={TABS}
      defaultTab="overview"
      isAdmin={isAdmin}
    >
      {({ tab, params, setTab }) => {
        const loanId = params.get("loan");

        if (tab === "approvals" && loanId) {
          return (
            <LoanDecisionPage
              loanId={loanId}
              apiBase="/api/local-bank/approvals"
              queuePath="/bank/local?tab=approvals"
            />
          );
        }

        switch (tab) {
          case "approvals":
            return (
              <ApprovalsQueuePage
                getDecisionHref={(id) => `/bank/local?tab=approvals&loan=${encodeURIComponent(id)}`}
              />
            );
          case "facilities":
            return <LocalFacilitiesPage />;
          case "treasury":
            return <LocalTreasuryPage />;
          case "request":
            return (
              <RequestLoanPage
                title="Request liquidity from National Bank"
                backTo="/bank/local?tab=overview"
                onDone={() => setTab("overview")}
              />
            );
          case "kyc":
            return <KycReviewPage />;
          case "aml":
            return <AmlAlertsPage />;
          case "staff":
            return <StaffUsersPage />;
          case "settings":
            return <LocalLendingSettingsPage />;
          case "overview":
          default:
            return <LocalDashboardPage />;
        }
      }}
    </DeskShell>
  );
}
