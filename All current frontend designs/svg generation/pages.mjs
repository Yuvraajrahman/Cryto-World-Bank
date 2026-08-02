/**
 * Page capture map — edit routes / personas / dirs here when UI pages change.
 * `dir` is relative to `All current frontend designs/`.
 * Set `stretch: true` for pages that should write a placeholder instead of a live screenshot.
 */

export const PERSONAS = {
  anon: null,
  borrower: {
    wallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    role: "BORROWER",
  },
  aisha: {
    wallet: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    role: "BORROWER",
  },
  approver: {
    wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    role: "APPROVER",
  },
  lb: {
    wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    role: "LOCAL_BANK_ADMIN",
  },
  nb: {
    wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    role: "NATIONAL_BANK_ADMIN",
  },
  owner: {
    wallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    role: "OWNER",
  },
  regulator: {
    wallet: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    role: "REGULATOR",
  },
};

/** @type {Array<{n:number,slug:string,route:string,persona:string,dir:string,title:string,stretch?:boolean}>} */
export const PAGES = [
  { n: 1, slug: "landing", route: "/", persona: "anon", dir: "Phase-I-Foundation/A-Public", title: "Landing / Home" },
  { n: 2, slug: "about", route: "/about", persona: "anon", dir: "Phase-I-Foundation/A-Public", title: "How It Works / About" },
  { n: 3, slug: "reserve-public", route: "/reserve", persona: "anon", dir: "Phase-I-Foundation/A-Public", title: "Reserve Transparency (Public)" },
  { n: 4, slug: "login", route: "/login", persona: "anon", dir: "Phase-I-Foundation/A-Public", title: "Connect Wallet / Login" },

  { n: 5, slug: "onboarding-register", route: "/onboarding/register", persona: "aisha", dir: "Phase-II-Core-Banking/B-Onboarding", title: "Registration" },
  { n: 6, slug: "onboarding-kyc-1", route: "/onboarding/kyc-1", persona: "aisha", dir: "Phase-II-Core-Banking/B-Onboarding", title: "KYC Level 1" },
  { n: 7, slug: "onboarding-kyc-2", route: "/onboarding/kyc-2", persona: "aisha", dir: "Phase-II-Core-Banking/B-Onboarding", title: "KYC Level 2" },
  { n: 8, slug: "onboarding-consent", route: "/onboarding/consent", persona: "borrower", dir: "Phase-II-Core-Banking/B-Onboarding", title: "Consent & Risk Disclosure" },
  { n: 9, slug: "onboarding-complete", route: "/onboarding/complete", persona: "borrower", dir: "Phase-II-Core-Banking/B-Onboarding", title: "Onboarding Complete" },

  { n: 10, slug: "client-dashboard", route: "/app/dashboard", persona: "borrower", dir: "Phase-II-Core-Banking/C-Retail-Core", title: "Client Home Dashboard" },
  { n: 11, slug: "settings", route: "/app/settings", persona: "borrower", dir: "Phase-II-Core-Banking/C-Retail-Core", title: "Profile & Account Settings" },
  { n: 12, slug: "notifications", route: "/app/notifications", persona: "borrower", dir: "Phase-II-Core-Banking/C-Retail-Core", title: "Notifications Center" },

  { n: 13, slug: "loan-apply-collateral", route: "/app/loans/apply/collateral", persona: "borrower", dir: "Phase-II-Core-Banking/D-Lending", title: "Loan Apply (Collateral)" },
  { n: 14, slug: "loan-apply-credit", route: "/app/loans/apply/credit", persona: "borrower", dir: "Phase-II-Core-Banking/D-Lending", title: "Loan Apply (Credit)" },
  { n: 15, slug: "loan-detail", route: "/app/loans/__LOAN_ID__", persona: "borrower", dir: "Phase-II-Core-Banking/D-Lending", title: "Loan Detail / Status" },
  { n: 16, slug: "loan-history", route: "/app/loans/history", persona: "borrower", dir: "Phase-II-Core-Banking/D-Lending", title: "Loan History & Transactions" },
  { n: 17, slug: "loan-pay", route: "/app/loans/__LOAN_ID__/pay", persona: "borrower", dir: "Phase-II-Core-Banking/D-Lending", title: "Installment Payment" },
  { n: 18, slug: "loan-limits", route: "/app/loans/limits", persona: "borrower", dir: "Phase-II-Core-Banking/D-Lending", title: "Borrowing Limits" },

  { n: 19, slug: "groups-hub", route: "/app/groups", persona: "borrower", dir: "Phase-II-Core-Banking/E-Groups", title: "Groups Hub" },
  { n: 19, slug: "groups-create", route: "/app/groups/create", persona: "borrower", dir: "Phase-II-Core-Banking/E-Groups", title: "Create Group" },
  { n: 19, slug: "groups-join", route: "/app/groups/join", persona: "borrower", dir: "Phase-II-Core-Banking/E-Groups", title: "Join Group" },
  { n: 20, slug: "group-apply", route: "/app/groups/grp_demo_wbr/apply", persona: "borrower", dir: "Phase-II-Core-Banking/E-Groups", title: "Group Loan Application" },
  { n: 21, slug: "group-consent", route: "/app/groups/grp_demo_wbr/consent", persona: "borrower", dir: "Phase-II-Core-Banking/E-Groups", title: "Group Consent / Multisig" },
  { n: 22, slug: "group-dashboard", route: "/app/groups/grp_demo_wbr", persona: "borrower", dir: "Phase-II-Core-Banking/E-Groups", title: "Group Dashboard" },

  { n: 23, slug: "savings", route: "/app/savings", persona: "borrower", dir: "Phase-II-Core-Banking/F-Deposits", title: "Savings Vault" },
  { n: 24, slug: "fixed-deposit", route: "/app/deposits/fixed", persona: "borrower", dir: "Phase-II-Core-Banking/F-Deposits", title: "Fixed Deposit" },
  { n: 25, slug: "checking", route: "/app/account/checking", persona: "borrower", dir: "Phase-II-Core-Banking/F-Deposits", title: "Current / Checking" },

  { n: 26, slug: "passport", route: "/app/passport", persona: "borrower", dir: "Phase-II-Core-Banking/G-Identity", title: "Credit Passport (SBT)" },

  { n: 27, slug: "agent", route: "/app/assistant", persona: "borrower", dir: "Phase-III-AI-and-Agent/H-Support", title: "AI Banking Agent Chat" },
  { n: 28, slug: "bank-chat", route: "/app/chat", persona: "borrower", dir: "Phase-III-AI-and-Agent/H-Support", title: "Client–Bank Live Chat" },

  { n: 29, slug: "local-dashboard", route: "/bank/local/dashboard", persona: "approver", dir: "Phase-II-Core-Banking/I-Local-Bank", title: "Local Bank Dashboard" },
  { n: 30, slug: "local-approvals", route: "/bank/local/approvals", persona: "approver", dir: "Phase-II-Core-Banking/I-Local-Bank", title: "Loan Approval Queue" },
  { n: 31, slug: "local-loan-decision", route: "/bank/local/approvals/loan_defence_pending_demo", persona: "approver", dir: "Phase-II-Core-Banking/I-Local-Bank", title: "Loan Decision Detail" },
  { n: 32, slug: "local-kyc-review", route: "/bank/local/kyc-review", persona: "approver", dir: "Phase-II-Core-Banking/I-Local-Bank", title: "Income / KYC Doc Review" },
  { n: 33, slug: "local-staff", route: "/bank/local/users", persona: "lb", dir: "Phase-II-Core-Banking/I-Local-Bank", title: "Bank User & Approver Mgmt" },
  { n: 34, slug: "local-aml", route: "/bank/local/aml-alerts", persona: "approver", dir: "Phase-II-Core-Banking/I-Local-Bank", title: "Local AML Alert Review" },

  { n: 35, slug: "national-dashboard", route: "/bank/national/dashboard", persona: "nb", dir: "Phase-II-Core-Banking/J-National", title: "National Bank Dashboard" },
  { n: 36, slug: "national-local-banks", route: "/bank/national/local-banks", persona: "nb", dir: "Phase-II-Core-Banking/J-National", title: "Local Bank Registration" },
  { n: 37, slug: "national-capital", route: "/bank/national/capital-allocation", persona: "nb", dir: "Phase-II-Core-Banking/J-National", title: "Capital Allocation" },
  { n: 38, slug: "national-settings", route: "/bank/national/settings", persona: "nb", dir: "Phase-II-Core-Banking/J-National", title: "Rates / Settings" },
  { n: 38, slug: "national-sar", route: "/bank/national/sar-review", persona: "nb", dir: "Phase-II-Core-Banking/J-National", title: "SAR Review" },

  { n: 39, slug: "world-dashboard", route: "/bank/world/dashboard", persona: "owner", dir: "Phase-II-Core-Banking/K-World", title: "World Bank Admin Dashboard" },
  { n: 40, slug: "world-nationals", route: "/bank/world/national-banks", persona: "owner", dir: "Phase-II-Core-Banking/K-World", title: "National Bank Registration" },
  { n: 41, slug: "world-multisig", route: "/bank/world/multisig", persona: "owner", dir: "Phase-II-Core-Banking/K-World", title: "Global Reserve & Multisig" },
  { n: 42, slug: "world-governance", route: "/bank/world/governance", persona: "owner", dir: "Phase-II-Core-Banking/K-World", title: "Governance / Timelock" },

  { n: 43, slug: "audit", route: "/audit", persona: "regulator", dir: "Phase-IV-Verification/L-Regulator", title: "Regulatory Audit Portal" },

  { n: 44, slug: "fx", route: "/fx", persona: "anon", dir: "Stretch-M-Not-In-Demo", title: "Retail FX", stretch: true },
  { n: 45, slug: "treasury-fx-swap", route: "/bank/treasury/fx-swap", persona: "anon", dir: "Stretch-M-Not-In-Demo", title: "Treasury FX Swap", stretch: true },
  { n: 46, slug: "syndicated-loans", route: "/bank/syndicated-loans", persona: "anon", dir: "Stretch-M-Not-In-Demo", title: "Syndicated Loan / Tranche", stretch: true },
  { n: 47, slug: "liquidations", route: "/bank/liquidations", persona: "anon", dir: "Stretch-M-Not-In-Demo", title: "Liquidation Monitor", stretch: true },

  { n: 90, slug: "legacy-banks", route: "/app/banks", persona: "owner", dir: "Legacy-Extra-Routes", title: "Legacy Banks (AppLayout)" },
  { n: 91, slug: "legacy-admin", route: "/app/admin", persona: "owner", dir: "Legacy-Extra-Routes", title: "Legacy Admin (AppLayout)" },
  { n: 92, slug: "legacy-risk", route: "/app/risk", persona: "owner", dir: "Legacy-Extra-Routes", title: "Legacy Risk Console (AppLayout)" },
];
