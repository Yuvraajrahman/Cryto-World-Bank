import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAccount, useChainId, useSignMessage, useSwitchChain } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import PublicShell from "../components/layout/PublicShell";
import Glass from "../components/ui/Glass";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import { useToast } from "../components/ui/Toast";
import { useWalletConnection } from "../hooks/useWalletConnection";
import { useHardhatNetwork } from "@/hooks/useHardhatNetwork";
import { HARDHAT_ACCOUNTS } from "@shared/hardhat-accounts";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import { useOnboardingStore } from "../hooks/onboardingStore";

const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    hint: "Browser extension / mobile app",
    install: "https://metamask.io/download/",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    hint: "Scan with a mobile wallet",
    install: null,
  },
  {
    id: "safe",
    name: "Safe",
    hint: "Institutional multisig (World / National)",
    install: "https://app.safe.global/",
  },
];

function buildSiweMessage({ address, chainId, nonce, domain, uri }) {
  const issuedAt = new Date().toISOString();
  return `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in to WorldBankReserve. This signature does not spend gas or move funds.

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}

function resolvePostLoginPath(user, returnTo, nextStepPath) {
  const role = user?.role;
  if (role === "DEV_ADMIN") {
    return returnTo?.startsWith("/dev-admin") ? returnTo : "/dev-admin";
  }
  if (role === "REGULATOR") {
    return returnTo?.startsWith("/audit") ? returnTo : "/audit";
  }
  if (role && role !== "BORROWER" && role !== "GUEST") {
    if (
      returnTo?.startsWith("/app") ||
      returnTo?.startsWith("/bank") ||
      returnTo?.startsWith("/audit") ||
      returnTo?.startsWith("/dev-admin")
    ) {
      return returnTo;
    }
    return "/app/dashboard";
  }
  const onboardingPath = nextStepPath();
  if (onboardingPath !== "/app/dashboard") return onboardingPath;
  if (user?.isFirstTime) return "/onboarding/register";
  return returnTo || "/app/dashboard";
}

function LoginContent() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") || "/app/dashboard";
  const sessionExpired = params.get("reason") === "expired";
  const toast = useToast();
  const { connect, status: walletStatus } = useWalletConnection();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const setSession = useSession((s) => s.setSession);
  const sessionToken = useSession((s) => s.token);
  const sessionUser = useSession((s) => s.user);
  const nextStepPath = useOnboardingStore((s) => s.nextStepPath);
  const syncFromApi = useOnboardingStore((s) => s.syncFromApi);
  const hydrateFromApi = useOnboardingStore((s) => s.hydrateFromApi);
  const { setupHardhat, isLocalDev } = useHardhatNetwork();

  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(null);
  const [pendingPersona, setPendingPersona] = useState(null);

  const requiredChain = isLocalDev ? hardhat : sepolia;
  const wrongNetwork = isConnected && chainId !== requiredChain.id;
  const hasInjected = typeof window !== "undefined" && Boolean(window.ethereum);

  useEffect(() => {
    if (sessionToken) {
      navigate(resolvePostLoginPath(sessionUser, returnTo, nextStepPath), { replace: true });
    }
  }, [sessionToken, sessionUser, navigate, returnTo, nextStepPath]);

  const networkLabel = useMemo(
    () => (isLocalDev ? "Hardhat Local (31337)" : "Sepolia"),
    [isLocalDev],
  );

  const handleConnect = async () => {
    setError(null);
    await connect();
  };

  const signInSiwe = useCallback(async () => {
    if (!address) {
      setError("Connect a wallet first.");
      return;
    }
    if (wrongNetwork) {
      setError(`Switch to ${networkLabel} before signing.`);
      return;
    }
    setPhase("signing");
    setError(null);
    try {
      const { nonce } = await api.get("/api/auth/nonce");
      const domain = window.location.host;
      const uri = window.location.origin;
      const message = buildSiweMessage({
        address,
        chainId,
        nonce,
        domain,
        uri,
      });
      const signature = await signMessageAsync({ message });
      const r = await api.post("/api/auth/verify", { message, signature });
      setSession({ token: r.token, user: r.user });
      setPhase("success");
      toast.show("Signed in", { variant: "success" });
      try {
        const status = await syncFromApi();
        if (status) hydrateFromApi(status);
      } catch {
        /* local nextStepPath still works */
      }
      navigate(resolvePostLoginPath(r.user, returnTo, nextStepPath), { replace: true });
    } catch (err) {
      setPhase("error");
      const msg =
        err?.shortMessage ||
        err?.message ||
        (typeof err === "string" ? err : "Signature rejected or verify failed");
      setError(msg);
      toast.show("Sign-in failed", { variant: "error" });
    }
  }, [
    address,
    chainId,
    navigate,
    networkLabel,
    returnTo,
    setSession,
    signMessageAsync,
    toast,
    wrongNetwork,
    nextStepPath,
    syncFromApi,
    hydrateFromApi,
  ]);

  async function switchNetwork() {
    try {
      if (isLocalDev) {
        await setupHardhat();
      } else {
        await switchChainAsync({ chainId: sepolia.id });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not switch network");
    }
  }

  async function devPersonaLogin(persona) {
    try {
      setPendingPersona(persona.address);
      const r = await api.post("/api/auth/dev-login", {
        wallet: persona.address,
        role: persona.role,
      });
      setSession({ token: r.token, user: r.user });
      toast.show(`Signed in as ${r.user.displayName}`, { variant: "success" });
      try {
        await syncFromApi();
      } catch {
        /* ignore */
      }
      navigate(resolvePostLoginPath(r.user, returnTo, nextStepPath), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dev login failed");
      toast.show("Dev login failed", { variant: "error" });
    } finally {
      setPendingPersona(null);
    }
  }

  return (
    <>
      <header className="page-hero">
        <p className="eyebrow center">Sign in</p>
        <h1>
          Connect. Sign. <em>Enter</em> your tier.
        </h1>
        <p className="section-lede center">
          Wallet signature login (SIWE) — no gas cost. We only use it to establish your session.
        </p>
      </header>

      {sessionExpired ? (
        <div className="notice warn">
          Your session expired. Connect and sign in again to continue
          {returnTo && returnTo !== "/app/dashboard" ? " where you left off" : ""}.
        </div>
      ) : null}

      <div className="login-wrap">
        <Glass className="login-card">
          <h2>Supported wallets</h2>
          <div className="wallet-list">
            {WALLETS.map((w) => (
              <Glass
                key={w.id}
                as="button"
                type="button"
                interactive
                className="wallet-option"
                onClick={() => {
                  if (w.id === "metamask" && !hasInjected && w.install) {
                    window.open(w.install, "_blank", "noopener,noreferrer");
                    return;
                  }
                  void handleConnect();
                }}
              >
                <span className="wallet-option-icon">
                  <Icon name="wallet" size={20} />
                </span>
                <span className="wallet-option-text">
                  <strong>{w.name}</strong>
                  <span>
                    {!hasInjected && w.id === "metamask"
                      ? "Not detected — tap to install"
                      : w.hint}
                  </span>
                </span>
                <Icon name="chevronRight" size={16} />
              </Glass>
            ))}
          </div>

          <div className={`notice${wrongNetwork ? " warn" : isConnected ? " ok" : ""}`}>
            {isConnected ? (
              <>
                Connected as{" "}
                <strong>
                  {address?.slice(0, 6)}…{address?.slice(-4)}
                </strong>
                {connector?.name ? ` via ${connector.name}` : ""}. Network: chain {chainId}.
              </>
            ) : (
              <>
                Please connect to <strong>{networkLabel}</strong> after choosing a wallet.
              </>
            )}
          </div>

          {wrongNetwork ? (
            <div className="notice warn">
              Wrong network. Switch to {networkLabel} to continue.
              <div style={{ marginTop: 12 }}>
                <Button variant="primary" size="sm" type="button" onClick={() => void switchNetwork()}>
                  Switch network
                </Button>
              </div>
            </div>
          ) : null}

          <div className="notice">
            Signing proves you control this address. It does <strong>not</strong> submit a
            transaction or spend ETH — only a personal message signature.
          </div>

          {error ? <div className="notice error">{error}</div> : null}

          <Button
            variant="primary"
            block
            type="button"
            disabled={
              !isConnected || wrongNetwork || phase === "signing" || walletStatus === "connecting"
            }
            onClick={() => void signInSiwe()}
          >
            {phase === "signing" ? "Waiting for signature…" : "Sign in with wallet"}
          </Button>

          {isLocalDev ? (
            <>
              <p className="eyebrow" style={{ marginTop: 8 }}>
                Local demo personas
              </p>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                Skip SIWE on Hardhat — mint a JWT for a seed role. Connect the matching MetaMask
                account afterward for on-chain actions.
              </p>
              <div className="persona-grid">
                {HARDHAT_ACCOUNTS.map((p) => (
                  <button
                    key={p.address}
                    type="button"
                    className="persona-btn"
                    disabled={pendingPersona === p.address}
                    onClick={() => void devPersonaLogin(p)}
                  >
                    <strong>{p.label}</strong>
                    <span>
                      {p.role} · {p.address.slice(0, 6)}…{p.address.slice(-4)}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </Glass>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13.5, color: "var(--text-3)" }}>
          New here?{" "}
          <Link to="/about" style={{ color: "var(--signal-bright)" }}>
            Learn how it works
          </Link>
        </p>
      </div>
    </>
  );
}

/**
 * Route: `/login` — plan A.4 Connect Wallet / Login
 */
export default function LoginPage() {
  return (
    <PublicShell
      navLinks={[
        { label: "How it works", href: "/about" },
        { label: "Reserve", href: "/reserve" },
        { label: "Home", href: "/" },
      ]}
    >
      <LoginContent />
    </PublicShell>
  );
}
