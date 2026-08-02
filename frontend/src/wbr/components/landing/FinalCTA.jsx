import { Link } from "react-router-dom";
import Glass from "../ui/Glass";
import Button from "../ui/Button";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export default function FinalCTA() {
  const { ref, className, style } = useScrollReveal();

  return (
    <section className="final-cta">
      <Glass ref={ref} className={`final-cta-card ${className}`} style={style}>
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
  );
}
