import { forwardRef } from 'react';
import Button from '../ui/Button';

/**
 * forwardRef so the page can watch this section with an IntersectionObserver
 * and surface <StickyMobileCTA> once it scrolls out of view.
 */
const Hero = forwardRef(function Hero(_props, ref) {
  return (
    <header className="hero" ref={ref}>
      <p className="eyebrow">Decentralized Reserve Banking</p>
      <h1>
        Capital, held
        <br />
        <em>in the open.</em>
      </h1>
      <p className="hero-sub">
        WorldBankReserve routes lending and deposits through four accountable tiers — World,
        National, Local, Client — with every reserve balance verifiable on-chain.
      </p>
      <div className="hero-cta">
        <Button variant="primary" href="#connect">
          Connect Wallet
        </Button>
        <Button variant="ghost" href="#tiers" showArrow={false}>
          Learn how it works
        </Button>
      </div>
      <p className="trust-strip">
        <span>Sepolia Testnet</span>
        <span className="dot" />
        <span>Slither &amp; Mythril Audited</span>
        <span className="dot" />
        <span>Chainlink Proof of Reserve</span>
      </p>
    </header>
  );
});

export default Hero;
