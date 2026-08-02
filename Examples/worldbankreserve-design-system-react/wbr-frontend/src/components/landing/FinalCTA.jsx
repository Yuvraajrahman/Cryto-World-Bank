import Glass from '../ui/Glass';
import Button from '../ui/Button';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function FinalCTA() {
  const { ref, className, style } = useScrollReveal();

  return (
    <section className="final-cta">
      <Glass ref={ref} className={`final-cta-card ${className}`} style={style}>
        <p className="eyebrow center">Get Started</p>
        <h2>Connect a wallet. See your tier in seconds.</h2>
        <p>
          No paperwork to start — connect, complete KYC when you&apos;re ready to borrow, and the
          rest of the reserve opens up.
        </p>
        <div className="hero-cta">
          <Button variant="primary" href="#connect">
            Connect Wallet
          </Button>
          <Button variant="ghost" href="#transparency" showArrow={false}>
            View reserve transparency
          </Button>
        </div>
      </Glass>
    </section>
  );
}
