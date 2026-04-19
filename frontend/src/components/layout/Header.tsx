import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link, NavLink } from "react-router-dom";
import { Wordmark } from "@/components/ui/Logo";
import { LogOut, ShieldCheck } from "lucide-react";
import { useSession } from "@/lib/store";
import { shortAddress } from "@/lib/utils";
import toast from "react-hot-toast";

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
  const { user, token, reset } = useSession();
  const navLinks: Array<{ to: string; label: string }> = [
    { to: "/app/dashboard", label: "Overview" },
    { to: "/app/reserve", label: "Reserve" },
    { to: "/app/loans", label: "Loans" },
    { to: "/app/market", label: "Markets" },
  ];

  function signOut() {
    reset();
    toast("Signed out");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-700/60 bg-ink-950/75 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/">
            <Wordmark />
          </Link>
          <div className="hidden h-6 w-px bg-gold-700/30 md:block" />
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/app/dashboard"}
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

        <div className="flex items-center gap-3">
          {token && user ? (
            <>
              <span className="hidden rounded-lg border border-ink-600/60 bg-ink-900/60 px-3 py-1.5 text-xs text-ink-200 sm:inline-flex">
                <span className="mr-2 text-gold-300">{user.displayName}</span>
                <span className="font-mono">{shortAddress(user.wallet, 4)}</span>
              </span>
              <button onClick={signOut} className="btn-ghost" title="Sign out">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <ConnectButton
              accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
              showBalance={{ smallScreen: false, largeScreen: true }}
              chainStatus="icon"
            />
          )}
        </div>
      </div>
    </header>
  );
}
