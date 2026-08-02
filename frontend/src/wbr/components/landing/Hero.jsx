import { forwardRef } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

/**
 * Landing hero — brand-first, one headline, one line of support, CTA pair.
 * Visual anchor is the reserve seal (not a stats dashboard).
 */
const Hero = forwardRef(function Hero(_props, ref) {
  return (
    <header className="hero" ref={ref}>
      <div className="hero-seal" aria-hidden="true">
        <svg viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="54" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.25" />
          <circle cx="60" cy="60" r="42" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
          <rect x="28" y="38" width="64" height="6" rx="3" fill="currentColor" />
          <rect x="34" y="50" width="52" height="6" rx="3" fill="currentColor" opacity="0.78" />
          <rect x="40" y="62" width="40" height="6" rx="3" fill="currentColor" opacity="0.56" />
          <rect x="46" y="74" width="28" height="6" rx="3" fill="currentColor" opacity="0.36" />
        </svg>
      </div>

      <p className="hero-brand">Crypto World Bank</p>
      <p className="eyebrow">Institutional digital reserve</p>
      <h1>
        Capital under
        <br />
        <em>disciplined custody.</em>
      </h1>
      <p className="hero-sub">
        Lending, deposits, and credit through a four-tier banking hierarchy — World, National,
        Local, and Client — with reserve solvency attested on-chain and open to public inspection.
      </p>
      <div className="hero-cta">
        <Button as={Link} to="/login" variant="primary">
          Open an account
        </Button>
        <Button as={Link} to="/reserve" variant="ghost" showArrow={false}>
          Inspect reserves
        </Button>
      </div>
      <p className="trust-strip">
        <span>Sepolia deployment</span>
        <span className="dot" />
        <span>Independently audited contracts</span>
        <span className="dot" />
        <span>Chainlink Proof of Reserve</span>
      </p>
    </header>
  );
});

export default Hero;
