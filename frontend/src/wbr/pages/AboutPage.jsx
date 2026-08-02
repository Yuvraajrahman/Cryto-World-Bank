import { Link } from "react-router-dom";
import PublicShell from "../components/layout/PublicShell";
import Glass from "../components/ui/Glass";
import Button from "../components/ui/Button";
import Accordion from "../components/ui/Accordion";
import { useScrollReveal } from "../hooks/useScrollReveal";

const ABOUT_LINKS = [
  { label: "Structure", href: "#tiers" },
  { label: "Lending", href: "#lifecycle" },
  { label: "Identity", href: "#kyc" },
  { label: "Credit", href: "#credit" },
  { label: "FAQ", href: "#faq" },
];

const TIERS = [
  {
    tag: "Tier 1 · Global",
    name: "World Bank",
    desc: "Custodies the global reserve, issues solvency attestations, and charters national institutions.",
  },
  {
    tag: "Tier 2 · Country",
    name: "National Bank",
    desc: "Sets jurisdictional policy, holds country reserves, and capitalises local branches.",
  },
  {
    tag: "Tier 3 · Branch",
    name: "Local Bank",
    desc: "Conducts KYC review, credit decisions, and day-to-day client servicing.",
  },
  {
    tag: "Tier 4 · Client",
    name: "Client account",
    desc: "Access collateral or credit facilities, deposit products, and a portable credit record.",
  },
];

const LIFECYCLE = [
  {
    title: "Application",
    body: "Submit a facility request from your account — collateral-backed, credit-based, or combined.",
  },
  {
    title: "Risk assessment",
    body: "An off-chain risk assessment is committed on-chain first; supporting detail is revealed only at bank review.",
  },
  {
    title: "Credit decision",
    body: "A Local Bank approver evaluates the brief and records an approval or decline with rationale.",
  },
  {
    title: "Disbursement",
    body: "Upon approval, funds settle on-chain from the branch pool to the client wallet.",
  },
  {
    title: "Servicing",
    body: "An instalment schedule is established; each payment updates the client’s credit standing.",
  },
  {
    title: "Discharge",
    body: "When the obligation is settled, the Credit Passport reflects performance in good standing.",
  },
];

const CREDIT_TIERS = [
  { tier: "Bronze", score: "0–199", max: "$50", rate: "Base" },
  { tier: "Silver", score: "200–399", max: "$250", rate: "−0.25%" },
  { tier: "Gold", score: "400–599", max: "$1,000", rate: "−0.75%" },
  { tier: "Platinum", score: "600–799", max: "$5,000", rate: "−1.25%" },
  { tier: "Diamond", score: "800–1000", max: "$25,000", rate: "−2.0%" },
];

const FAQ = [
  {
    q: "Are there fees to open an account or inspect reserves?",
    a: "Browsing public reserves and authenticating with a wallet incurs no protocol fee. Disbursements and repayments use ordinary network gas; interest and terms are disclosed before confirmation.",
  },
  {
    q: "What is the security model?",
    a: "Role-based access on-chain, pausable modules, independently audited contracts, and Chainlink Proof of Reserve for solvency attestation. Material World Bank actions may require a Safe multisig.",
  },
  {
    q: "What occurs in the event of default?",
    a: "Collateralised facilities may be liquidated under health-factor rules. Credit-based facilities primarily reduce Credit Passport standing and future limits rather than seizing unrelated assets.",
  },
  {
    q: "What is recorded on-chain versus held privately?",
    a: "Balances, roles, loan state, and document hashes are on-chain. KYC imagery, correspondence, and detailed risk features remain off-chain, limited to authorised bank roles and regulators.",
  },
];

function SectionHead({ eyebrow, title, lede }) {
  const { ref, className, style } = useScrollReveal();
  return (
    <div ref={ref} className={`section-head ${className}`} style={style}>
      <p className="eyebrow center">{eyebrow}</p>
      <h2 className="section-title center" dangerouslySetInnerHTML={{ __html: title }} />
      {lede ? <p className="section-lede center">{lede}</p> : null}
    </div>
  );
}

/**
 * Route: `/about` — plan A.2 How It Works / About
 */
export default function AboutPage() {
  return (
    <PublicShell navLinks={ABOUT_LINKS}>
      <header className="page-hero">
        <p className="page-hero-brand">Crypto World Bank</p>
        <p className="eyebrow center">Operating model</p>
        <h1>
          How the institution
          <br />
          <em>is organised.</em>
        </h1>
        <p className="section-lede center">
          An overview of the four-tier hierarchy, lending lifecycle, identity requirements, and
          Credit Passport — before you establish an account.
        </p>
      </header>

      <section className="section" id="tiers">
        <SectionHead
          eyebrow="Institutional architecture"
          title="Four tiers of <em>accountability.</em>"
          lede="Reserve capital is custodied at the apex and allocated through national and local institutions — with defined authority at every level."
        />
        <div className="cascade">
          <div className="cascade-line" />
          <div className="cascade-pulse" />
          {TIERS.map((tier, i) => (
            <Glass key={tier.name} className={`tier-card tier-${i + 1}`}>
              <span className="tier-tag">{tier.tag}</span>
              <span className="tier-name">{tier.name}</span>
              <p>{tier.desc}</p>
            </Glass>
          ))}
        </div>
      </section>

      <section className="section" id="lifecycle">
        <SectionHead
          eyebrow="Credit lifecycle"
          title="From application to <em>discharge.</em>"
          lede="Every facility follows a governed path — assessed, decided by a local bank, settled on-chain, and reflected in the client’s credit record."
        />
        <div className="lifecycle">
          {LIFECYCLE.map((step, i) => (
            <Glass key={step.title} className="lifecycle-step">
              <span className="lifecycle-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </Glass>
          ))}
        </div>
      </section>

      <section className="section" id="kyc">
        <SectionHead
          eyebrow="Identity verification"
          title="KYC that governs <em>access,</em> not noise."
          lede="Begin with essential verification. Enhance your profile when you require higher credit tiers, group facilities, or larger uncollateralised limits."
        />
        <div className="compare-grid">
          <Glass className="compare-card">
            <p className="eyebrow">Level 1</p>
            <h3>Essential</h3>
            <ul>
              <li>Government identification and biometric selfie</li>
              <li>Bronze and Silver facility eligibility</li>
              <li>Collateral-backed applications</li>
              <li>Document hash recorded on-chain</li>
            </ul>
          </Glass>
          <Glass className="compare-card">
            <p className="eyebrow">Level 2</p>
            <h3>Enhanced</h3>
            <ul>
              <li>Proof of address and income</li>
              <li>Gold through Diamond eligibility</li>
              <li>Group credit and higher limits</li>
              <li>Optional video verification</li>
            </ul>
          </Glass>
        </div>
      </section>

      <section className="section" id="credit">
        <SectionHead
          eyebrow="Credit Passport"
          title="A portable record of <em>standing.</em>"
          lede="Your on-chain Credit Passport governs uncollateralised borrowing capacity and interest modifiers. Scores range from 0 to 1000."
        />
        <div className="data-cards">
          {CREDIT_TIERS.map((row) => (
            <Glass key={row.tier} className="data-card">
              <div className="data-card-title">{row.tier}</div>
              <div className="data-card-row">
                <span>Score</span>
                <span>{row.score}</span>
              </div>
              <div className="data-card-row">
                <span>Max loan</span>
                <span>{row.max}</span>
              </div>
              <div className="data-card-row">
                <span>Rate mod</span>
                <span>{row.rate}</span>
              </div>
            </Glass>
          ))}
        </div>
        <div className="data-table-wrap desktop-only-table glass">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Score range</th>
                <th>Max uncollateralized</th>
                <th>Interest modifier</th>
              </tr>
            </thead>
            <tbody>
              {CREDIT_TIERS.map((row) => (
                <tr key={row.tier}>
                  <td>{row.tier}</td>
                  <td>{row.score}</td>
                  <td>{row.max}</td>
                  <td>{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" id="faq">
        <SectionHead
          eyebrow="Due diligence"
          title="Material questions, <em>answered plainly.</em>"
          lede="Fees, security, default treatment, and data residency — summarised before you authenticate."
        />
        <Accordion items={FAQ} />
      </section>

      <section className="final-cta">
        <Glass className="final-cta-card">
          <p className="eyebrow center">Client onboarding</p>
          <h2>Establish your account.</h2>
          <p>
            Authenticate with your wallet to enter your assigned tier. Complete identity verification
            when you require credit facilities; deposit services and reserve inspection remain
            available earlier.
          </p>
          <div className="hero-cta">
            <Button as={Link} to="/login" variant="primary">
              Open an account
            </Button>
            <Button as={Link} to="/reserve" variant="ghost" showArrow={false}>
              Inspect reserves
            </Button>
          </div>
        </Glass>
      </section>
    </PublicShell>
  );
}
