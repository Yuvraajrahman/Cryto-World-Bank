import DeskShell from "../../../components/layout/DeskShell";
import WorldDashboardPage from "./WorldDashboardPage";
import NationalBanksPage from "./NationalBanksPage";
import WorldFacilitiesPage from "./WorldFacilitiesPage";
import WorldTreasuryPage from "./WorldTreasuryPage";
import GovernancePage from "./GovernancePage";
import MultisigConsolePage from "./MultisigConsolePage";

const TABS = [
  { key: "overview", label: "Overview", icon: "home" },
  { key: "nationals", label: "Nationals", icon: "node" },
  { key: "facilities", label: "Facilities", icon: "savings" },
  { key: "treasury", label: "Treasury", icon: "wallet" },
  { key: "governance", label: "Governance", icon: "settings" },
  { key: "multisig", label: "Multisig", icon: "passport" },
];

/**
 * Single World Bank admin desk — all World-only features as tabs.
 * Route: `/bank/world`
 */
export default function WorldBankDesk() {
  return (
    <DeskShell
      tier="world"
      brand="World Bank Admin"
      homePath="/bank/world"
      tabs={TABS}
      defaultTab="overview"
    >
      {({ tab }) => {
        switch (tab) {
          case "nationals":
            return <NationalBanksPage />;
          case "facilities":
            return <WorldFacilitiesPage />;
          case "treasury":
            return <WorldTreasuryPage />;
          case "governance":
            return <GovernancePage />;
          case "multisig":
            return <MultisigConsolePage />;
          case "overview":
          default:
            return <WorldDashboardPage />;
        }
      }}
    </DeskShell>
  );
}
