import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import LogoMark from "../ui/LogoMark";
import Icon from "../ui/Icon";
import ThemeToggle from "../ui/ThemeToggle";
import Badge from "../ui/Badge";
import { ToastProvider } from "../ui/Toast";
import { useSession } from "@/lib/store";
import { isPreferredChain, networkLabel } from "../../lib/explorer";
import "../../global.css";
import "../../desk.css";

function shortWallet(w) {
  if (!w) return "—";
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

/**
 * Desktop Material banking desk — one page, horizontal feature tabs.
 * @param {{
 *   tier: 'world'|'national'|'local'|'client'|'regulator',
 *   brand: string,
 *   homePath: string,
 *   tabs: Array<{ key: string, label: string, icon: string, adminOnly?: boolean }>,
 *   defaultTab?: string,
 *   isAdmin?: boolean,
 *   children: (ctx: { tab: string, setTab: (k: string) => void, params: URLSearchParams, setParams }) => React.ReactNode
 * }} props
 */
export default function DeskShell({
  tier,
  brand,
  homePath,
  tabs,
  defaultTab = "overview",
  isAdmin = true,
  children,
}) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
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
        to={`/login?returnTo=${encodeURIComponent(homePath)}`}
        replace
      />
    );
  }

  const visibleTabs = tabs.filter((t) => !t.adminOnly || isAdmin);
  const tabKeys = new Set(visibleTabs.map((t) => t.key));
  const rawTab = params.get("tab") || defaultTab;
  const tab = tabKeys.has(rawTab) ? rawTab : defaultTab;

  function setTab(next, extra = {}) {
    const nextParams = new URLSearchParams(params);
    nextParams.set("tab", next);
    Object.entries(extra).forEach(([k, v]) => {
      if (v == null || v === "") nextParams.delete(k);
      else nextParams.set(k, String(v));
    });
    if (next !== "approvals") nextParams.delete("loan");
    setParams(nextParams, { replace: true });
  }

  const wallet = user?.wallet || address;
  const wrongNet = isConnected && chainId != null && !isPreferredChain(chainId);

  function onLogout() {
    reset();
    if (isConnected) disconnect();
    navigate("/login");
  }

  return (
    <div className="wbr-root desk-root" data-tier={tier}>
      <ToastProvider>
        <div className="bg-orbs desk-orbs" aria-hidden>
          <div className="orb orb-gold" />
          <div className="orb orb-signal" />
        </div>
        <div className="grain" aria-hidden />

        <header className="desk-topbar">
          <div className="desk-topbar-inner">
            <Link to={homePath} className="app-brand" aria-label={`${brand} home`}>
              <span className="desk-logo-3d" aria-hidden>
                <LogoMark />
              </span>
              <span className="app-brand-name">{brand}</span>
            </Link>

            <div className="desk-topbar-meta">
              <Badge tone="tier">{user?.role?.replaceAll("_", " ") || "—"}</Badge>
              {wallet ? (
                <span className="app-wallet desk-wallet">{shortWallet(wallet)}</span>
              ) : null}
              {wrongNet ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    switchChain?.({
                      chainId: import.meta.env.DEV ? hardhat.id : sepolia.id,
                    })
                  }
                >
                  Switch to {networkLabel(import.meta.env.DEV ? hardhat.id : sepolia.id)}
                </button>
              ) : null}
              <ThemeToggle />
              <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
                Sign out
              </button>
            </div>
          </div>

          <nav className="desk-tabs" aria-label={`${brand} features`}>
            {visibleTabs.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`desk-tab${tab === item.key ? " active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                <span className="desk-tab-icon" aria-hidden>
                  <Icon name={item.icon} size={18} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </header>

        <main className="desk-main app-main">
          {typeof children === "function"
            ? children({ tab, setTab, params, setParams })
            : children}
        </main>
      </ToastProvider>
    </div>
  );
}
