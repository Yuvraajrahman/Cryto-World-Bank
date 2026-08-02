import { useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import StickyMobileCTA from '../components/layout/StickyMobileCTA';
import Hero from '../components/landing/Hero';
import TierCascade from '../components/landing/TierCascade';
import ProductGrid from '../components/landing/ProductGrid';
import TransparencySection from '../components/landing/TransparencySection';
import FinalCTA from '../components/landing/FinalCTA';
import { ToastProvider } from '../components/ui/Toast';
import '../styles/global.css';

/**
 * Route: `/`  (frontend-development-plan.md, page A.1 — Landing / Home)
 * Access: Anonymous Visitor
 *
 * Mobile-first: this is the reference implementation for how every other
 * public page should be assembled — ToastProvider at the root, Navbar +
 * MobileMenuSheet handling their own responsive switch, StickyMobileCTA
 * watching the hero, ambient bg-orbs/grain behind everything.
 */
export default function LandingPage() {
  const heroRef = useRef(null);

  return (
    <ToastProvider>
      <div className="bg-orbs">
        <div className="orb orb-gold" />
        <div className="orb orb-signal" />
        <div className="orb orb-signal-2" />
      </div>
      <div className="grain" />

      <Navbar />
      <Hero ref={heroRef} />
      <TierCascade />
      <ProductGrid />
      <TransparencySection />
      <FinalCTA />
      <Footer />

      <StickyMobileCTA targetRef={heroRef} href="#connect" />
    </ToastProvider>
  );
}
