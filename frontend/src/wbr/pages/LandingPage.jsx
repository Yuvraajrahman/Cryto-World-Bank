import { useRef } from "react";
import { Link } from "react-router-dom";
import PublicShell from "../components/layout/PublicShell";
import StickyMobileCTA from "../components/layout/StickyMobileCTA";
import Hero from "../components/landing/Hero";
import TierCascade from "../components/landing/TierCascade";
import ProductGrid from "../components/landing/ProductGrid";
import TransparencySection from "../components/landing/TransparencySection";
import FinalCTA from "../components/landing/FinalCTA";

const LANDING_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Tiers", href: "#tiers" },
  { label: "Transparency", href: "#transparency" },
  { label: "About", href: "/about" },
];

/**
 * Route: `/` — plan A.1 Landing / Home
 */
export default function LandingPage() {
  const heroRef = useRef(null);

  return (
    <PublicShell
      navLinks={LANDING_LINKS}
      stickySlot={<StickyMobileCTA targetRef={heroRef} href="/login" label="Get Started" />}
    >
      <Hero ref={heroRef} />
      <TierCascade />
      <ProductGrid />
      <TransparencySection />
      <FinalCTA />
    </PublicShell>
  );
}
