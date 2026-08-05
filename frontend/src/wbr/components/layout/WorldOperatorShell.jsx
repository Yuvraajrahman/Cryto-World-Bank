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

const ALL_TAB_ITEMS = [
  { key: "home", label: "Home", icon: "home", path: "/bank/world/dashboard" },
  { key: "nationals", label: "Nationals", icon: "node", path: "/bank/world/national-banks" },
  { key: "treasury", label: "Treasury", icon: "wallet", path: "/bank/world/treasury" },
  { key: "facilities", label: "Facilities", icon: "node", path: "/bank/world/facilities" },
  { key: "multisig", label: "Multisig", icon: "wallet", path: "/bank/world/multisig" },
  { key: "gov", label: "Governance", icon: "settings", path: "/bank/world/governance" },
];

const SIGNER_TAB_ITEMS = [
  { key: "multisig", label: "Multisig", icon: "wallet", path: "/bank/world/multisig" },
];

function shortWallet(w) {
  if (!w) return "—";
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

function activeKey(pathname) {
  if (pathname.startsWith("/bank/world/national-banks")) return "nationals";
  if (pathname.startsWith("/bank/world/treasury")) return "treasury";
  if (pathname.startsWith("/bank/world/facilities")) return "facilities";
  if (pathname.startsWith("/bank/world/multisig")) return "multisig";
  if (pathname.startsWith("/bank/world/governance")) return "gov";
  return "home";
}

export default function WorldOperatorShell() {
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

  const isOwner = user?.role === "OWNER";
  const TAB_ITEMS = isOwner ? ALL_TAB_ITEMS : SIGNER_TAB_ITEMS;
  const wallet = user?.wallet || address;
  const wrongNet = isConnected && chainId != null && !isPreferredChain(chainId);
  const tab = activeKey(location.pathname);

  function onLogout() {
    reset();
    if (isConnected) disconnect();
    navigate("/login");
  }

  return (
    <div className="wbr-root">
      <ToastProvider>
        <div className="bg-orbs" aria-hidden>
          <div className="orb orb-gold" />
          <div className="orb orb-signal" />
        </div>
        <div className="grain" aria-hidden />

        <header className="app-topbar">
          <div className="app-topbar-inner">
            <Link
              to={isOwner ? "/bank/world/dashboard" : "/bank/world/multisig"}
              className="app-brand"
              aria-label="World Bank home"
            >
              <LogoMark />
              <span className="app-brand-name">World Bank Ops</span>
            </Link>

            <nav className="app-desktop-nav glass" aria-label="World operator">
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
            </nav>

            <div className="app-topbar-actions">
              <span className={`app-net-pill${wrongNet ? " warn" : ""}`}>
                {networkLabel(chainId)}
              </span>
              <Badge>{isOwner ? "OWNER" : "Multisig signer"}</Badge>
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
