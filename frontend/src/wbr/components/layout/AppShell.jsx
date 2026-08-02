import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useBalance, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import LogoMark from "../ui/LogoMark";
import Icon from "../ui/Icon";
import ThemeToggle from "../ui/ThemeToggle";
import Badge from "../ui/Badge";
import TabBar from "./TabBar";
import { ToastProvider } from "../ui/Toast";
import { useSession } from "@/lib/store";
import { api } from "@/lib/api";
import { isPreferredChain, networkLabel } from "../../lib/explorer";
import "../../global.css";

const TAB_ITEMS = [
  { key: "home", label: "Home", icon: "home", path: "/app/dashboard" },
  { key: "loans", label: "Loans", icon: "loan", path: "/app/loans/history" },
  { key: "groups", label: "Groups", icon: "group", path: "/app/groups" },
  { key: "more", label: "More", icon: "settings", path: "/app/settings" },
];

function shortWallet(w) {
  if (!w) return "—";
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

/**
 * Authenticated shell for Section C (design.md §11 Group C).
 */
export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSession((s) => s.token);
  const user = useSession((s) => s.user);
  const reset = useSession((s) => s.reset);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: ethBal } = useBalance({ address });
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!token) return;
    try {
      const r = await api.get("/api/notifications?limit=1");
      setUnread(r.unreadCount ?? 0);
    } catch {
      /* ignore — 401 handled in api */
    }
  }, [token]);

  useEffect(() => {
    void refreshUnread();
    const id = setInterval(() => void refreshUnread(), 20_000);
    return () => clearInterval(id);
  }, [refreshUnread, location.pathname]);

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
  const activeTab =
    location.pathname.startsWith("/app/groups")
      ? "groups"
      : location.pathname.startsWith("/app/loans")
        ? "loans"
        : location.pathname.startsWith("/app/settings") ||
            location.pathname.startsWith("/app/notifications") ||
            location.pathname.startsWith("/app/savings") ||
            location.pathname.startsWith("/app/deposits") ||
            location.pathname.startsWith("/app/account") ||
            location.pathname.startsWith("/app/passport") ||
            location.pathname.startsWith("/app/assistant") ||
            location.pathname.startsWith("/app/chat")
          ? "more"
          : "home";

  const kycPending =
    user?.role === "BORROWER" &&
    (user?.kyc1Status === "PENDING" ||
      user?.kyc1Status === "NOT_STARTED" ||
      (!user?.onboardingComplete && user?.isFirstTime));

  function onLogout() {
    reset();
    if (isConnected) disconnect();
    navigate("/login");
  }

  const ethDisplay =
    ethBal?.formatted != null
      ? `${Number(ethBal.formatted).toFixed(3)} ETH`
      : null;

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
            <Link to="/app/dashboard" className="app-brand" aria-label="Home">
              <LogoMark />
              <span className="app-brand-name">World Bank Reserve</span>
            </Link>

            <nav className="app-desktop-nav glass" aria-label="Primary">
              {TAB_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`app-desktop-nav-link${activeTab === item.key ? " active" : ""}`}
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
              {ethDisplay ? <span className="app-bal-pill">{ethDisplay}</span> : null}
              {user?.role === "BORROWER" ? (
                <Badge icon={kycPending ? "clock" : "check"}>
                  {kycPending ? "KYC pending" : "KYC"}
                </Badge>
              ) : (
                <Badge>{user?.role?.replaceAll("_", " ") || "Staff"}</Badge>
              )}
              <code className="app-wallet">{shortWallet(wallet)}</code>
              <Link
                to="/app/notifications"
                className="icon-btn app-bell"
                aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
              >
                <Icon name="bell" size={18} />
                {unread > 0 ? <span className="app-bell-dot">{unread > 9 ? "9+" : unread}</span> : null}
              </Link>
              <Link to="/app/settings" className="icon-btn" aria-label="Settings">
                <Icon name="settings" size={18} />
              </Link>
              <ThemeToggle />
              <button type="button" className="btn btn-ghost app-logout" onClick={onLogout}>
                Log out
              </button>
            </div>
          </div>
        </header>

        {wrongNet ? (
          <div className="notice warn" style={{ margin: "8px var(--section-pad-x) 0" }}>
            Wrong network ({networkLabel(chainId)}). Use Hardhat local (31337) or Sepolia for demo.{" "}
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
          <Outlet context={{ refreshUnread, unread }} />
        </main>

        <div className="app-tabbar-wrap">
          <TabBar
            items={TAB_ITEMS}
            active={activeTab}
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
