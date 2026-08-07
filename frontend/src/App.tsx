import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { Landing } from "@/pages/Landing";
import { About } from "@/pages/About";
import { ReservePublic } from "@/pages/ReservePublic";
import { Login } from "@/pages/Login";
import { OnboardingRegister } from "@/pages/OnboardingRegister";
import { OnboardingKyc1 } from "@/pages/OnboardingKyc1";
import { OnboardingKyc2 } from "@/pages/OnboardingKyc2";
import { OnboardingConsent } from "@/pages/OnboardingConsent";
import { OnboardingComplete } from "@/pages/OnboardingComplete";
import { RequireLocalStaff } from "@/pages/RequireLocalStaff";
import { RequireNationalAdmin } from "@/pages/RequireNationalAdmin";
import { RequireWorldAdmin } from "@/pages/RequireWorldAdmin";
import { RequireWorldMultisig } from "@/pages/RequireWorldMultisig";
import { RequireRegulator } from "@/pages/RequireRegulator";
import { RequireDevAdmin } from "@/pages/RequireDevAdmin";
import { RegulatorShell } from "@/pages/RegulatorShell";
import { RegulatoryAudit } from "@/pages/RegulatoryAudit";
import DevAdmin from "@/pages/DevAdmin";
import { NotFound } from "@/pages/NotFound";

import WorldBankDesk from "@/wbr/pages/bank/world/WorldBankDesk";
import NationalBankDesk from "@/wbr/pages/bank/national/NationalBankDesk";
import LocalBankDesk from "@/wbr/pages/bank/local/LocalBankDesk";
import ClientDesk from "@/wbr/pages/client/ClientDesk";
import MultisigConsolePage from "@/wbr/pages/bank/world/MultisigConsolePage";
import DeskShell from "@/wbr/components/layout/DeskShell";

/** Map legacy multi-page bank URLs → single desk `?tab=` */
function LegacyBankRedirect({
  base,
  map,
}: {
  base: string;
  map: Record<string, string>;
}) {
  const { pathname } = useLocation();
  const { loanId } = useParams();
  const rest = pathname.replace(base, "").replace(/^\//, "");
  const first = rest.split("/")[0] || "overview";
  const tab = map[first] || map["*"] || "overview";
  const qs = new URLSearchParams({ tab });
  if (loanId) qs.set("loan", loanId);
  return <Navigate to={`${base}?${qs}`} replace />;
}

const WORLD_MAP = {
  dashboard: "overview",
  "national-banks": "nationals",
  facilities: "facilities",
  treasury: "treasury",
  governance: "governance",
  multisig: "multisig",
  "*": "overview",
};

const NATIONAL_MAP = {
  dashboard: "overview",
  approvals: "approvals",
  facilities: "facilities",
  treasury: "treasury",
  "capital-allocation": "capital",
  "request-loan": "request",
  "local-banks": "locals",
  "sar-review": "sar",
  settings: "settings",
  "*": "overview",
};

const LOCAL_MAP = {
  dashboard: "overview",
  approvals: "approvals",
  facilities: "facilities",
  treasury: "treasury",
  "request-loan": "request",
  "kyc-review": "kyc",
  "aml-alerts": "aml",
  users: "staff",
  "lending-settings": "settings",
  "*": "overview",
};

const CLIENT_MAP = {
  dashboard: "overview",
  savings: "accounts",
  deposits: "accounts",
  account: "accounts",
  loans: "borrow",
  groups: "groups",
  passport: "passport",
  assistant: "assistant",
  chat: "assistant",
  settings: "settings",
  notifications: "settings",
  "*": "overview",
};

function LegacyClientRedirect() {
  const { pathname } = useLocation();
  const { loanId } = useParams();
  const rest = pathname.replace(/^\/app\/?/, "");
  const first = rest.split("/")[0] || "dashboard";
  const tab =
    (CLIENT_MAP as Record<string, string>)[first] || CLIENT_MAP["*"] || "overview";
  const qs = new URLSearchParams({ tab });
  if (first === "account" && rest.includes("convert")) qs.set("fx", "convert");
  if (first === "account" && rest.includes("exchange")) {
    qs.set("tab", "fx");
    qs.set("fx", "exchange");
  }
  if (first === "account" && rest.includes("checking")) qs.set("account", "checking");
  if (first === "account" && rest.includes("statement")) qs.set("account", "statement");
  if (first === "deposits") qs.set("account", "fixed");
  if (first === "savings") qs.set("account", "savings");
  if (loanId) qs.set("loan", loanId);
  if (first === "loans" && rest.includes("apply")) qs.set("view", "apply");
  if (first === "loans" && rest.includes("limits")) qs.set("view", "limits");
  if (first === "loans" && rest.includes("request")) qs.set("view", "request");
  return <Navigate to={`/app?${qs}`} replace />;
}

function SignerMultisigDesk() {
  return (
    <DeskShell
      tier="world"
      brand="World Multisig"
      homePath="/bank/world?tab=multisig"
      tabs={[{ key: "multisig", label: "Multisig", icon: "passport" }]}
      defaultTab="multisig"
    >
      {() => <MultisigConsolePage />}
    </DeskShell>
  );
}

export function App() {
  return (
    <Routes>
      {/* Public + auth onboarding — keep */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/reserve" element={<ReservePublic />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding/register" element={<OnboardingRegister />} />
      <Route path="/onboarding/kyc-1" element={<OnboardingKyc1 />} />
      <Route path="/onboarding/kyc-2" element={<OnboardingKyc2 />} />
      <Route path="/onboarding/consent" element={<OnboardingConsent />} />
      <Route path="/onboarding/complete" element={<OnboardingComplete />} />

      {/* 4 desktop desks */}
      <Route path="/app" element={<ClientDesk />} />
      <Route path="/app/dashboard" element={<Navigate to="/app?tab=overview" replace />} />
      <Route path="/app/*" element={<LegacyClientRedirect />} />

      <Route element={<RequireLocalStaff />}>
        <Route path="/bank/local" element={<LocalBankDesk />} />
        <Route
          path="/bank/local/approvals/:loanId"
          element={<LegacyBankRedirect base="/bank/local" map={LOCAL_MAP} />}
        />
        <Route path="/bank/local/*" element={<LegacyBankRedirect base="/bank/local" map={LOCAL_MAP} />} />
      </Route>

      <Route element={<RequireNationalAdmin />}>
        <Route path="/bank/national" element={<NationalBankDesk />} />
        <Route
          path="/bank/national/approvals/:loanId"
          element={<LegacyBankRedirect base="/bank/national" map={NATIONAL_MAP} />}
        />
        <Route
          path="/bank/national/*"
          element={<LegacyBankRedirect base="/bank/national" map={NATIONAL_MAP} />}
        />
      </Route>

      <Route element={<RequireWorldMultisig />}>
        <Route path="/bank/world/multisig" element={<SignerMultisigDesk />} />
      </Route>
      <Route element={<RequireWorldAdmin />}>
        <Route path="/bank/world" element={<WorldBankDesk />} />
        <Route path="/bank/world/dashboard" element={<Navigate to="/bank/world?tab=overview" replace />} />
        <Route path="/bank/world/national-banks" element={<Navigate to="/bank/world?tab=nationals" replace />} />
        <Route path="/bank/world/facilities" element={<Navigate to="/bank/world?tab=facilities" replace />} />
        <Route path="/bank/world/treasury" element={<Navigate to="/bank/world?tab=treasury" replace />} />
        <Route path="/bank/world/governance" element={<Navigate to="/bank/world?tab=governance" replace />} />
      </Route>

      <Route element={<RegulatorShell />}>
        <Route element={<RequireRegulator />}>
          <Route path="/audit" element={<RegulatoryAudit />} />
        </Route>
      </Route>

      <Route element={<RequireDevAdmin />}>
        <Route path="/dev-admin" element={<DevAdmin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
