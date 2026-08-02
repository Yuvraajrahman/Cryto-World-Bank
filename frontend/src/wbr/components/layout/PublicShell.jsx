import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastProvider } from "../ui/Toast";
import "../../global.css";

const DEFAULT_LINKS = [
  { label: "How it works", href: "/about" },
  { label: "Reserve", href: "/reserve" },
  { label: "Product", href: "/#product" },
  { label: "Login", href: "/login" },
];

/**
 * Shared chrome for every public (Group A) page.
 */
export default function PublicShell({ children, navLinks = DEFAULT_LINKS, stickySlot = null }) {
  return (
    <div className="wbr-root">
      <ToastProvider>
        <div className="bg-orbs" aria-hidden>
          <div className="orb orb-gold" />
          <div className="orb orb-signal" />
          <div className="orb orb-signal-2" />
        </div>
        <div className="grain" aria-hidden />
        <Navbar links={navLinks} />
        <main>{children}</main>
        <Footer />
        {stickySlot}
      </ToastProvider>
    </div>
  );
}
