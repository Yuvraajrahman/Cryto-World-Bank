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

const TAB_ITEMS = [{ key: "audit", label: "Audit", icon: "eye", path: "/audit" }];

function shortWallet(w) {
  if (!w) return "—";
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

/**
 * Shell for Regulatory Authority (plan §L) — read-only audit portal.
 */
export default function RegulatorShell() {
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
            <Link to="/audit" className="app-brand" aria-label="Regulatory audit home">
              <LogoMark />
              <span className="app-brand-name">Regulator Audit</span>
            </Link>

            <nav className="app-desktop-nav glass" aria-label="Regulator">
              {TAB_ITEMS.map((item) => (
                <Link key={item.key} to={item.path} className="app-desktop-nav-link active">
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="app-topbar-actions">
              <span className={`app-net-pill${wrongNet ? " warn" : ""}`}>
                {networkLabel(chainId)}
              </span>
              <Badge>Read-only</Badge>
              <Badge>{user?.role?.replaceAll("_", " ") || "Regulator"}</Badge>
              <code className="app-wallet">{shortWallet(wallet)}</code>
              <ThemeToggle />
              <button type="button" className="btn btn-ghost app-logout" onClick={onLogout}>
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="ops-readonly-banner" role="status">
          Read-only regulatory access — you can view and export audit data. No approvals, allocations,
          or configuration changes are available.
        </div>

        {wrongNet ? (
          <div className="notice warn" style={{ margin: "8px var(--section-pad-x) 0" }}>
            Wrong network ({networkLabel(chainId)}). Use Hardhat local (31337) or Sepolia.{" "}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => switchChain?.({ chainId: hardhat.id })}
            >
              Switch to Hardhat
            </button>
            <button
              type="button"
              className="btn btn-ghost"
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
            active="audit"
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
