import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Glass from "../ui/Glass";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import LogoMark from "../ui/LogoMark";
import ThemeToggle from "../ui/ThemeToggle";
import MobileMenuSheet from "./MobileMenuSheet";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { useToast } from "../ui/Toast";

const DEFAULT_LINKS = [
  { label: "How it works", href: "/about" },
  { label: "Reserve", href: "/reserve" },
  { label: "Product", href: "/#product" },
  { label: "Login", href: "/login" },
];

function NavAnchor({ href, children, onClick }) {
  if (href.startsWith("/") && !href.includes("#")) {
    return (
      <Link to={href} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
}

export default function Navbar({ links = DEFAULT_LINKS }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { status, address, connect } = useWalletConnection();
  const toast = useToast();
  const wasConnected = useRef(status === "connected");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = () => setMenuOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [menuOpen]);

  useEffect(() => {
    if (status === "connected" && address && !wasConnected.current) {
      toast.show("Wallet connected", { variant: "success" });
    }
    wasConnected.current = status === "connected";
  }, [status, address, toast]);

  const handleConnect = async () => {
    await connect();
  };

  const label =
    status === "connected" && address
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : status === "connecting"
        ? "Connecting…"
        : "Connect Wallet";

  return (
    <>
      <nav className="navbar">
        <Glass as="div" className={`nav-inner${scrolled ? " scrolled" : ""}`}>
          <Link className="logo" to="/">
            <LogoMark />
            Crypto World Bank
          </Link>

          <div className="nav-links">
            {links.map((link) => (
              <NavAnchor key={link.href + link.label} href={link.href}>
                {link.label}
              </NavAnchor>
            ))}
          </div>

          <div className="nav-actions">
            <ThemeToggle />
            <Button as={Link} to="/login" variant="primary" size="sm" showArrow={false} className="nav-cta">
              Open an account
            </Button>
          </div>

          <div className="nav-mobile-actions">
            <ThemeToggle />
            <button
              type="button"
              className="icon-btn nav-menu-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Icon name={menuOpen ? "close" : "menu"} size={18} />
            </button>
          </div>
        </Glass>
      </nav>

      <MobileMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={links}
        walletLabel={label}
        walletStatus={status}
        onConnect={handleConnect}
      />
    </>
  );
}
