import { forwardRef } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

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
        <Button as={Link} to="/login" variant="primary">
          Connect Wallet
        </Button>
        <Button as={Link} to="/about" variant="ghost" showArrow={false}>
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
