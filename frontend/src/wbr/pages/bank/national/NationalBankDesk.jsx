import DeskShell from "../../../components/layout/DeskShell";
import NationalDashboardPage from "./NationalDashboardPage";
import NationalApprovalsPage from "./NationalApprovalsPage";
import LoanDecisionPage from "../local/LoanDecisionPage";
import NationalFacilitiesPage from "./NationalFacilitiesPage";
import NationalTreasuryPage from "./NationalTreasuryPage";
import CapitalAllocationPage from "./CapitalAllocationPage";
import LocalBanksPage from "./LocalBanksPage";
import SarReviewPage from "./SarReviewPage";
import NationalSettingsPage from "./NationalSettingsPage";
import RequestLoanPage from "../../shared/RequestLoanPage";

const TABS = [
  { key: "overview", label: "Overview", icon: "home" },
  { key: "approvals", label: "Approvals", icon: "loan" },
  { key: "facilities", label: "Facilities", icon: "savings" },
  { key: "treasury", label: "Treasury", icon: "wallet" },
  { key: "capital", label: "Capital", icon: "wallet" },
  { key: "request", label: "Request World", icon: "node" },
  { key: "locals", label: "Local banks", icon: "node" },
  { key: "sar", label: "SAR", icon: "alert" },
  { key: "settings", label: "Settings", icon: "settings" },
];

/**
 * National Bank desk — same chrome as Local; National-only: locals roster, SAR, capital push.
 * Route: `/bank/national`
 */
export default function NationalBankDesk() {
  return (
    <DeskShell
      tier="national"
      brand="National Bank"
      homePath="/bank/national"
      tabs={TABS}
      defaultTab="overview"
    >
      {({ tab, params, setTab }) => {
        const loanId = params.get("loan");

        if (tab === "approvals" && loanId) {
          return (
            <LoanDecisionPage
              loanId={loanId}
              apiBase="/api/national-bank/approvals"
              queuePath="/bank/national?tab=approvals"
            />
          );
        }

        switch (tab) {
          case "approvals":
            return (
              <NationalApprovalsPage
                getDecisionHref={(id) => `/bank/national?tab=approvals&loan=${encodeURIComponent(id)}`}
              />
            );
          case "facilities":
            return <NationalFacilitiesPage />;
          case "treasury":
            return <NationalTreasuryPage />;
          case "capital":
            return <CapitalAllocationPage />;
          case "request":
            return (
              <RequestLoanPage
                title="Request liquidity from World Bank"
                backTo="/bank/national?tab=overview"
                onDone={() => setTab("overview")}
              />
            );
          case "locals":
            return <LocalBanksPage />;
          case "sar":
            return <SarReviewPage />;
          case "settings":
            return <NationalSettingsPage />;
          case "overview":
          default:
            return <NationalDashboardPage />;
        }
      }}
    </DeskShell>
  );
}
