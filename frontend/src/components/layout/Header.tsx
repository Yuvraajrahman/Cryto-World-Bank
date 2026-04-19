import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link, NavLink } from "react-router-dom";
import { Wordmark } from "@/components/ui/Logo";
import { ShieldCheck } from "lucide-react";

const publicLinks = [
  { to: "/#features", label: "Platform" },
  { to: "/#security", label: "Security" },
  { to: "/#hierarchy", label: "Hierarchy" },
  { to: "/#about", label: "About" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/60 bg-ink-950/70 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {publicLinks.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="text-sm text-ink-200 transition-colors hover:text-gold-300"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs text-ink-200 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-400" />
            Testnet · Audited primitives
          </span>
          <Link to="/app/dashboard" className="btn-primary">
            Launch App
          </Link>
        </div>
      </div>
    </header>
  );
}

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-700/60 bg-ink-950/75 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/">
            <Wordmark />
          </Link>
          <div className="hidden h-6 w-px bg-gold-700/30 md:block" />
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { to: "/app/dashboard", label: "Overview" },
              { to: "/app/reserve", label: "Reserve" },
              { to: "/app/loans", label: "Loans" },
              { to: "/app/market", label: "Markets" },
            ].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    isActive ? "text-gold-300" : "text-ink-200 hover:text-gold-300"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ConnectButton
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            showBalance={{ smallScreen: false, largeScreen: true }}
            chainStatus="icon"
          />
        </div>
      </div>
    </header>
  );
}
