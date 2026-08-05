import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import LogoMark from "../ui/LogoMark";
import Icon from "../ui/Icon";
import ThemeToggle from "../ui/ThemeToggle";
import Badge from "../ui/Badge";
import TabBar from "./TabBar";
import { ToastProvider } from "../ui/Toast";
import { useSession } from "@/lib/store";
import { isPreferredChain, networkLabel } from "../../lib/explorer";
import "../../global.css";

/* Same chrome order as National: Home → Approvals → Liquidity → Compliance */
const ALL_TAB_ITEMS = [
  { key: "home", label: "Home", icon: "home", path: "/bank/local/dashboard" },
  { key: "approvals", label: "Approvals", icon: "loan", path: "/bank/local/approvals" },
  { key: "facilities", label: "Facilities", icon: "node", path: "/bank/local/facilities", adminOnly: true },
  { key: "treasury", label: "Treasury", icon: "wallet", path: "/bank/local/treasury", adminOnly: true },
  { key: "kyc", label: "KYC", icon: "passport", path: "/bank/local/kyc-review" },
  { key: "aml", label: "AML", icon: "alert", path: "/bank/local/aml-alerts" },
];

function shortWallet(w) {
  if (!w) return "—";
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

function activeKey(pathname) {
  if (pathname.startsWith("/bank/local/approvals")) return "approvals";
  if (pathname.startsWith("/bank/local/treasury")) return "treasury";
  if (pathname.startsWith("/bank/local/facilities")) return "facilities";
  if (pathname.startsWith("/bank/local/kyc-review")) return "kyc";
  if (pathname.startsWith("/bank/local/aml-alerts")) return "aml";
  if (pathname.startsWith("/bank/local/users")) return "home";
  return "home";
}

/**
 * Authenticated shell for Local Bank operator routes (plan §I, design.md §11 I–L).
 */
export default function BankOperatorShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSession((s) => s.token);
  const user = useSession((s) => s.user);
  const reset = useSession((s) => s.reset);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!token) {
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  const wallet = user?.wallet || address;
  const wrongNet = isConnected && chainId != null && !isPreferredChain(chainId);
  const tab = activeKey(location.pathname);
  const isAdmin =
    user?.role === "LOCAL_BANK_ADMIN" ||
    user?.role === "NATIONAL_BANK_ADMIN" ||
    user?.role === "OWNER" ||
    user?.role === "DEV_ADMIN";
  // Treasury + facilities APIs are admin-only (not APPROVER).
  const TAB_ITEMS = ALL_TAB_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  function onLogout() {
    reset();
    if (isConnected) disconnect();
    navigate("/login");
  }

  return (
    <div className="wbr-root" data-tier="local">
      <ToastProvider>
        <div className="bg-orbs" aria-hidden>
          <div className="orb orb-gold" />
          <div className="orb orb-signal" />
        </div>
        <div className="grain" aria-hidden />

        <header className="app-topbar">
          <div className="app-topbar-inner">
            <Link to="/bank/local/dashboard" className="app-brand" aria-label="Local Bank home">
              <LogoMark />
              <span className="app-brand-name">Local Bank Ops</span>
            </Link>

            <nav className="app-desktop-nav glass" aria-label="Operator">
              {TAB_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`app-desktop-nav-link${tab === item.key ? " active" : ""}`}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </Link>
              ))}
              {isAdmin ? (
                <Link
                  to="/bank/local/users"
                  className={`app-desktop-nav-link${location.pathname.startsWith("/bank/local/users") ? " active" : ""}`}
                >
                  <Icon name="group" size={16} />
                  Staff
                </Link>
              ) : null}
            </nav>

            <div className="app-topbar-actions">
              <span className={`app-net-pill${wrongNet ? " warn" : ""}`}>
                {networkLabel(chainId)}
              </span>
              <Badge>{user?.role?.replaceAll("_", " ") || "Staff"}</Badge>
              <code className="app-wallet">{shortWallet(wallet)}</code>
              <ThemeToggle />
              <button type="button" className="btn btn-ghost app-logout" onClick={onLogout}>
                Log out
              </button>
            </div>
          </div>
        </header>

        {wrongNet ? (
          <div className="notice warn" style={{ margin: "8px var(--section-pad-x) 0" }}>
            Wrong network ({networkLabel(chainId)}). Use Hardhat local (31337) or Sepolia.{" "}
            <button
              type="button"
              className="text-link"
              style={{ background: "none", border: 0, cursor: "pointer", padding: 0, marginRight: 8 }}
              onClick={() => switchChain?.({ chainId: hardhat.id })}
            >
              Switch to Hardhat
            </button>
            <button
              type="button"
              className="text-link"
              style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}
              onClick={() => switchChain?.({ chainId: sepolia.id })}
            >
              Switch to Sepolia
            </button>
          </div>
        ) : null}

        <main className="app-main">
          <Outlet />
        </main>

        <div className="app-tabbar-wrap">
          <TabBar
            items={TAB_ITEMS}
            active={tab}
            onChange={(key) => {
              const item = TAB_ITEMS.find((t) => t.key === key);
              if (item) navigate(item.path);
            }}
          />
        </div>
      </ToastProvider>
    </div>
  );
}
