import { Link } from "react-router-dom";
import PublicShell from "../components/layout/PublicShell";
import Glass from "../components/ui/Glass";
import Button from "../components/ui/Button";
import Accordion from "../components/ui/Accordion";
import { useScrollReveal } from "../hooks/useScrollReveal";

const LIFECYCLE = [
  { title: "Request", body: "Client submits a collateral- or credit-based loan application from their wallet." },
  { title: "ML risk score", body: "A commit-reveal risk score is produced off-chain; only the commitment hits the chain first." },
  { title: "Approver decision", body: "Local Bank Approver reviews the Authority Brief (score + SHAP) and approves or rejects." },
  { title: "Disbursement", body: "On approval, funds move on-chain from the Local Bank pool to the client." },
  { title: "Installments", body: "A repayment schedule is created; each payment updates credit standing." },
  { title: "Repayment complete", body: "Loan closes; Credit Passport score adjusts based on on-time performance." },
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
    q: "Are there fees to connect or view reserves?",
    a: "Connecting a wallet and browsing public reserve data is free. Loan disbursement and repayments incur normal network gas; protocol interest is shown before you confirm.",
  },
  {
    q: "What is the security model?",
    a: "Role-based access control on-chain, pausable modules, Slither/Mythril-audited contracts, and Chainlink Proof of Reserve for solvency attestation. Critical World Bank actions can require Safe multisig.",
  },
  {
    q: "What happens on default?",
    a: "Collateralized loans may be liquidated per health-factor rules. Credit-based loans primarily downgrade the Credit Passport (SBT) score and reduce future limits rather than seizing unrelated assets.",
  },
  {
    q: "What data is on-chain vs off-chain?",
    a: "Balances, roles, loan state, and document hashes are on-chain. KYC images, chat transcripts, and detailed ML features stay off-chain with access limited to authorized bank roles and regulators.",
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
    <PublicShell>
      <header className="page-hero">
        <p className="eyebrow center">How it works</p>
        <h1>
          Four tiers. One <em>open</em> reserve.
        </h1>
        <p className="section-lede center">
          Understand the hierarchy, loan lifecycle, KYC levels, and Credit Passport before you
          connect a wallet.
        </p>
      </header>

      <section className="section" id="tiers">
        <SectionHead
          eyebrow="The Hierarchy"
          title='Capital cascades through <em>four tiers</em> of accountability.'
          lede="Every reserve balance narrows in scope as it moves down the chain — broad at the top, personal at the bottom, transparent throughout."
        />
        <div className="cascade">
          <div className="cascade-line" />
          <div className="cascade-pulse" />
          {[
            ["Tier 1 · Global", "World Bank", "Global reserve custody, proof-of-reserve attestation, and national bank registration."],
            ["Tier 2 · Country", "National Bank", "Capital allocation to local branches, rate policy, and reserve ratio settings."],
            ["Tier 3 · Branch", "Local Bank", "Loan approval, KYC review, and day-to-day community lending decisions."],
            ["Tier 4 · You", "Client", "Borrow, save, and build credit — collateral-based or credit-based."],
          ].map(([tag, name, desc], i) => (
            <Glass key={name} className={`tier-card tier-${i + 1}`}>
              <span className="tier-tag">{tag}</span>
              <span className="tier-name">{name}</span>
              <p>{desc}</p>
            </Glass>
          ))}
        </div>
      </section>

      <section className="section" id="lifecycle">
        <SectionHead
          eyebrow="Loan Lifecycle"
          title="From request to repayment, <em>every step</em> is accountable."
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
          eyebrow="Identity"
          title="KYC unlocks <em>limits</em>, not noise."
          lede="Level 1 gets you started. Level 2 opens higher tiers, group lending, and larger credit-based loans."
        />
        <div className="compare-grid">
          <Glass className="compare-card">
            <p className="eyebrow">Level 1</p>
            <h3>Essential</h3>
            <ul>
              <li>Government ID + selfie</li>
              <li>Unlocks Bronze / Silver small loans</li>
              <li>Collateral-based applications available</li>
              <li>Document hash recorded on-chain</li>
            </ul>
          </Glass>
          <Glass className="compare-card">
            <p className="eyebrow">Level 2</p>
            <h3>Enhanced</h3>
            <ul>
              <li>Proof of address + income</li>
              <li>Gold → Diamond eligibility path</li>
              <li>Group lending & higher limits</li>
              <li>Optional video verification</li>
            </ul>
          </Glass>
        </div>
      </section>

      <section className="section" id="credit">
        <SectionHead
          eyebrow="Credit Passport"
          title="A soulbound score that <em>travels</em> with you."
          lede="Your SBT tier gates uncollateralized borrowing and modifies interest. Score range is 0–1000."
        />
        <div className="data-cards">
          {CREDIT_TIERS.map((row) => (
            <Glass key={row.tier} className="data-card">
              <div className="data-card-title">{row.tier}</div>
              <div className="data-card-row"><span>Score</span><span>{row.score}</span></div>
              <div className="data-card-row"><span>Max loan</span><span>{row.max}</span></div>
              <div className="data-card-row"><span>Rate mod</span><span>{row.rate}</span></div>
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
        <SectionHead eyebrow="FAQ" title="Straight answers before you <em>connect</em>." />
        <Accordion items={FAQ} />
      </section>

      <section className="final-cta">
        <Glass className="final-cta-card">
          <p className="eyebrow center">Ready</p>
          <h2>Connect a wallet when you&apos;re ready.</h2>
          <p>Sign in with your wallet — no gas for the login signature — then finish KYC when you want to borrow.</p>
          <div className="hero-cta">
            <Button as={Link} to="/login" variant="primary">
              Connect Wallet
            </Button>
            <Button as={Link} to="/reserve" variant="ghost" showArrow={false}>
              View reserve transparency
            </Button>
          </div>
        </Glass>
      </section>
    </PublicShell>
  );
}
