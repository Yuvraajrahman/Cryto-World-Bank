import { Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "@/pages/Landing";
import { About } from "@/pages/About";
import { ReservePublic } from "@/pages/ReservePublic";
import { Login } from "@/pages/Login";
import { OnboardingRegister } from "@/pages/OnboardingRegister";
import { OnboardingKyc1 } from "@/pages/OnboardingKyc1";
import { OnboardingKyc2 } from "@/pages/OnboardingKyc2";
import { OnboardingConsent } from "@/pages/OnboardingConsent";
import { OnboardingComplete } from "@/pages/OnboardingComplete";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppShell as ClientAppShell } from "@/pages/ClientAppShell";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import { Notifications } from "@/pages/Notifications";
import { LoanApplyHub } from "@/pages/LoanApplyHub";
import { LoanApplyCollateral } from "@/pages/LoanApplyCollateral";
import { LoanApplyCredit } from "@/pages/LoanApplyCredit";
import ClientRequestLoan from "@/pages/ClientRequestLoan";
import LocalRequestLoan from "@/pages/LocalRequestLoan";
import NationalRequestLoan from "@/pages/NationalRequestLoan";
import { LoanHistory } from "@/pages/LoanHistory";
import { LoanDetail } from "@/pages/LoanDetail";
import { LoanPay } from "@/pages/LoanPay";
import { LoanLimits } from "@/pages/LoanLimits";
import { InstallmentsRedirect } from "@/pages/InstallmentsRedirect";
import { GroupsHub } from "@/pages/GroupsHub";
import { CreateGroup } from "@/pages/CreateGroup";
import { JoinGroup } from "@/pages/JoinGroup";
import { GroupDashboard } from "@/pages/GroupDashboard";
import { GroupApply } from "@/pages/GroupApply";
import { GroupConsent } from "@/pages/GroupConsent";
import { Savings } from "@/pages/Savings";
import { FixedDeposit } from "@/pages/FixedDeposit";
import { Checking } from "@/pages/Checking";
import { Convert } from "@/pages/Convert";
import { Exchange } from "@/pages/Exchange";
import { Statement } from "@/pages/Statement";
import { Passport } from "@/pages/Passport";
import { Agent } from "@/pages/Agent";
import { BankChat } from "@/pages/BankChat";
import { Reserve } from "@/pages/Reserve";
import { Market } from "@/pages/Market";
import { RiskConsole } from "@/pages/RiskConsole";
import { Admin } from "@/pages/Admin";
import { Banks } from "@/pages/Banks";
import { Simulation } from "@/pages/Simulation";
import { NotFound } from "@/pages/NotFound";
import { RequireBorrower } from "@/pages/RequireBorrower";
import { RequireLocalStaff } from "@/pages/RequireLocalStaff";
import { RequireLocalAdmin } from "@/pages/RequireLocalAdmin";
import { BankOperatorShell } from "@/pages/BankOperatorShell";
import { LocalBankDashboard } from "@/pages/LocalBankDashboard";
import { LocalApprovals } from "@/pages/LocalApprovals";
import { LocalLoanDecision } from "@/pages/LocalLoanDecision";
import { LocalKycReview } from "@/pages/LocalKycReview";
import { LocalStaffUsers } from "@/pages/LocalStaffUsers";
import { LocalAmlAlerts } from "@/pages/LocalAmlAlerts";
import { LocalLendingSettings } from "@/pages/LocalLendingSettings";
import { RequireNationalAdmin } from "@/pages/RequireNationalAdmin";
import { NationalOperatorShell } from "@/pages/NationalOperatorShell";
import { NationalBankDashboard } from "@/pages/NationalBankDashboard";
import { NationalLocalBanks } from "@/pages/NationalLocalBanks";
import { NationalCapitalAllocation } from "@/pages/NationalCapitalAllocation";
import { NationalSettings } from "@/pages/NationalSettings";
import { NationalSarReview } from "@/pages/NationalSarReview";
import { NationalApprovals } from "@/pages/NationalApprovals";
import { NationalLoanDecision } from "@/pages/NationalLoanDecision";
import { RequireWorldAdmin } from "@/pages/RequireWorldAdmin";
import { RequireWorldMultisig } from "@/pages/RequireWorldMultisig";
import { WorldOperatorShell } from "@/pages/WorldOperatorShell";
import { WorldBankDashboard } from "@/pages/WorldBankDashboard";
import { WorldNationalBanks } from "@/pages/WorldNationalBanks";
import { WorldTreasury } from "@/pages/WorldTreasury";
import { NationalTreasury } from "@/pages/NationalTreasury";
import { LocalTreasury } from "@/pages/LocalTreasury";
import { LocalFacilities } from "@/pages/LocalFacilities";
import { NationalFacilities } from "@/pages/NationalFacilities";
import { WorldFacilities } from "@/pages/WorldFacilities";

import { WorldMultisig } from "@/pages/WorldMultisig";
import { WorldGovernance } from "@/pages/WorldGovernance";
import { RequireRegulator } from "@/pages/RequireRegulator";
import { RegulatorShell } from "@/pages/RegulatorShell";
import { RequireOperator } from "@/pages/RequireOperator";
import {
  LegacyFacilitiesRedirect,
  LegacyMultisigRedirect,
  LegacyApprovalsRedirect,
} from "@/wbr/components/ui/LegacyOpsRedirect";
import { RequireDevAdmin } from "@/pages/RequireDevAdmin";
import DevAdmin from "@/pages/DevAdmin";
import { RegulatoryAudit } from "@/pages/RegulatoryAudit";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/reserve" element={<ReservePublic />} />
      <Route path="/login" element={<Login />} />

      <Route path="/onboarding/register" element={<OnboardingRegister />} />
      <Route path="/onboarding/kyc-1" element={<OnboardingKyc1 />} />
      <Route path="/onboarding/kyc-2" element={<OnboardingKyc2 />} />
      <Route path="/onboarding/consent" element={<OnboardingConsent />} />
      <Route path="/onboarding/complete" element={<OnboardingComplete />} />

      <Route element={<ClientAppShell />}>
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/settings" element={<Settings />} />
        <Route path="/app/profile" element={<Navigate to="/app/settings" replace />} />
        <Route path="/app/notifications" element={<Notifications />} />

        <Route element={<RequireBorrower />}>
          <Route path="/app/assistant" element={<Agent />} />
          <Route path="/app/chat" element={<BankChat />} />

          <Route path="/app/loans" element={<Navigate to="/app/loans/history" replace />} />
          <Route path="/app/loans/history" element={<LoanHistory />} />
          <Route path="/app/loans/apply" element={<LoanApplyHub />} />
          <Route path="/app/loans/apply/collateral" element={<LoanApplyCollateral />} />
          <Route path="/app/loans/apply/credit" element={<LoanApplyCredit />} />
          <Route path="/app/loans/request" element={<ClientRequestLoan />} />
          <Route path="/app/loans/limits" element={<LoanLimits />} />
          <Route path="/app/loans/new" element={<Navigate to="/app/loans/apply" replace />} />
          <Route path="/app/loans/:loanId/pay" element={<LoanPay />} />
          <Route path="/app/loans/:loanId" element={<LoanDetail />} />
          <Route path="/app/installments" element={<InstallmentsRedirect />} />

          <Route path="/app/groups" element={<GroupsHub />} />
          <Route path="/app/groups/create" element={<CreateGroup />} />
          <Route path="/app/groups/join" element={<JoinGroup />} />
          <Route path="/app/groups/:groupId" element={<GroupDashboard />} />
          <Route path="/app/groups/:groupId/apply" element={<GroupApply />} />
          <Route path="/app/groups/:groupId/consent" element={<GroupConsent />} />

          <Route path="/app/savings" element={<Savings />} />
          <Route path="/app/deposits/fixed" element={<FixedDeposit />} />
          <Route path="/app/account/checking" element={<Checking />} />
          <Route path="/app/account/convert" element={<Convert />} />
          <Route path="/app/account/exchange" element={<Exchange />} />
          <Route path="/app/account/statement" element={<Statement />} />
          <Route path="/app/passport" element={<Passport />} />
        </Route>
      </Route>

      <Route element={<BankOperatorShell />}>
        <Route element={<RequireLocalStaff />}>
          <Route path="/bank/local/dashboard" element={<LocalBankDashboard />} />
          <Route path="/bank/local/request-loan" element={<LocalRequestLoan />} />
          <Route path="/bank/local/approvals" element={<LocalApprovals />} />
          <Route path="/bank/local/approvals/:loanId" element={<LocalLoanDecision />} />
          <Route path="/bank/local/kyc-review" element={<LocalKycReview />} />
          <Route path="/bank/local/users" element={<LocalStaffUsers />} />
          <Route path="/bank/local/aml-alerts" element={<LocalAmlAlerts />} />
          <Route element={<RequireLocalAdmin />}>
            <Route path="/bank/local/lending-settings" element={<LocalLendingSettings />} />
            <Route path="/bank/local/treasury" element={<LocalTreasury />} />
            <Route path="/bank/local/facilities" element={<LocalFacilities />} />
          </Route>
        </Route>
      </Route>

      <Route element={<NationalOperatorShell />}>
        <Route element={<RequireNationalAdmin />}>
          <Route path="/bank/national/dashboard" element={<NationalBankDashboard />} />
          <Route path="/bank/national/request-loan" element={<NationalRequestLoan />} />
          <Route path="/bank/national/approvals" element={<NationalApprovals />} />
          <Route path="/bank/national/approvals/:loanId" element={<NationalLoanDecision />} />
          <Route path="/bank/national/treasury" element={<NationalTreasury />} />
          <Route path="/bank/national/facilities" element={<NationalFacilities />} />
          <Route path="/bank/national/local-banks" element={<NationalLocalBanks />} />
          <Route path="/bank/national/capital-allocation" element={<NationalCapitalAllocation />} />
          <Route path="/bank/national/settings" element={<NationalSettings />} />
          <Route path="/bank/national/sar-review" element={<NationalSarReview />} />
        </Route>
      </Route>

      <Route element={<WorldOperatorShell />}>
        <Route element={<RequireWorldAdmin />}>
          <Route path="/bank/world/dashboard" element={<WorldBankDashboard />} />
          <Route path="/bank/world/national-banks" element={<WorldNationalBanks />} />
          <Route path="/bank/world/treasury" element={<WorldTreasury />} />
          <Route path="/bank/world/facilities" element={<WorldFacilities />} />
          <Route path="/bank/world/governance" element={<WorldGovernance />} />
        </Route>
        <Route element={<RequireWorldMultisig />}>
          <Route path="/bank/world/multisig" element={<WorldMultisig />} />
        </Route>
      </Route>

      <Route element={<RegulatorShell />}>
        <Route element={<RequireRegulator />}>
          <Route path="/audit" element={<RegulatoryAudit />} />
        </Route>
      </Route>

      {/* Super Admin console */}
      <Route element={<RequireDevAdmin />}>
        <Route path="/dev-admin" element={<DevAdmin />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route element={<RequireOperator />}>
          <Route path="/app/reserve" element={<Reserve />} />
          <Route path="/app/banks" element={<Banks />} />
          <Route path="/app/simulation" element={<Simulation />} />
          <Route path="/app/market" element={<Market />} />
          <Route path="/app/risk" element={<RiskConsole />} />
          <Route path="/app/facilities" element={<LegacyFacilitiesRedirect />} />
          <Route path="/app/approvals" element={<LegacyApprovalsRedirect />} />
          <Route path="/app/multisig" element={<LegacyMultisigRedirect />} />
        </Route>
        <Route element={<RequireDevAdmin />}>
          <Route path="/app/admin" element={<Admin />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
