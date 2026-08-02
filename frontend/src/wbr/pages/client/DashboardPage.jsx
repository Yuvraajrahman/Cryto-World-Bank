import { Link } from "react-router-dom";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import Glass from "../../components/ui/Glass";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import Icon from "../../components/ui/Icon";
import StateMessage from "../../components/ui/StateMessage";
import { useClientHome } from "../../hooks/useClientHome";
import { useMyGroups } from "../../hooks/useGroups";
import { useSession } from "@/lib/store";
import { contractAddresses } from "@/lib/contracts";

function formatEth(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  if (v >= 100) return `${v.toFixed(1)} ETH`;
  if (v >= 1) return `${v.toFixed(2)} ETH`;
  return `${v.toFixed(3)} ETH`;
}

function OperatorHome({ user }) {
  const isLocal =
    user?.role === "APPROVER" ||
    user?.role === "LOCAL_BANK_ADMIN";
  const isWorld = user?.role === "OWNER";
  const isNational = user?.role === "NATIONAL_BANK_ADMIN";
  const isRegulator = user?.role === "REGULATOR";
  const links = isRegulator
    ? [
        {
          to: "/audit",
          label: "Audit portal",
          desc: "Solvency, compliance & export",
          icon: "eye",
        },
      ]
    : isLocal
    ? [
        {
          to: "/bank/local/dashboard",
          label: "Local dashboard",
          desc: "Capital, loan book, queues",
          icon: "home",
        },
        {
          to: "/bank/local/approvals",
          label: "Approvals",
          desc: "Loan queue & Authority Brief",
          icon: "loan",
        },
        {
          to: "/bank/local/kyc-review",
          label: "KYC review",
          desc: "Income & identity docs",
          icon: "passport",
        },
        {
          to: "/bank/local/aml-alerts",
          label: "AML alerts",
          desc: "Anomaly flags & SAR",
          icon: "alert",
        },
        ...(user?.role === "LOCAL_BANK_ADMIN"
          ? [
              {
                to: "/bank/local/users",
                label: "Staff",
                desc: "Approvers & operators",
                icon: "group",
              },
              {
                to: "/bank/world/multisig",
                label: "World multisig",
                desc: "Co-sign if you are a Safe signer",
                icon: "wallet",
              },
            ]
          : []),
      ]
    : isWorld
      ? [
          {
            to: "/bank/world/dashboard",
            label: "World dashboard",
            desc: "Global reserve & health",
            icon: "home",
          },
          {
            to: "/bank/world/national-banks",
            label: "National Banks",
            desc: "Register & pause jurisdictions",
            icon: "node",
          },
          {
            to: "/bank/world/multisig",
            label: "Multisig",
            desc: "2-of-3 Safe console",
            icon: "wallet",
          },
          {
            to: "/bank/world/governance",
            label: "Governance",
            desc: "Proposals & timelock",
            icon: "settings",
          },
          {
            to: "/bank/national/dashboard",
            label: "National desk",
            desc: "Oversight of a jurisdiction",
            icon: "eye",
          },
        ]
      : isNational
      ? [
          {
            to: "/bank/national/dashboard",
            label: "National dashboard",
            desc: "Jurisdiction capital & queues",
            icon: "home",
          },
          {
            to: "/bank/national/local-banks",
            label: "Local Banks",
            desc: "Register, pause, parameters",
            icon: "node",
          },
          {
            to: "/bank/national/capital-allocation",
            label: "Capital allocation",
            desc: "Push funds & fulfill requests",
            icon: "wallet",
          },
          {
            to: "/bank/national/sar-review",
            label: "SAR review",
            desc: "Escalations from Local AML",
            icon: "alert",
          },
          {
            to: "/bank/national/settings",
            label: "Settings",
            desc: "Rates & reserve ratio",
            icon: "settings",
          },
          {
            to: "/bank/world/multisig",
            label: "World multisig",
            desc: "Co-sign 2-of-3 Safe txs",
            icon: "wallet",
          },
        ]
      : [
          { to: "/app/approvals", label: "Approvals", desc: "Loan queue & decisions", icon: "loan" },
          { to: "/app/banks", label: "Banks", desc: "Hierarchy & capital", icon: "node" },
          { to: "/app/loans", label: "Loans", desc: "Portfolio overview", icon: "eye" },
          { to: "/app/assistant", label: "AI agent", desc: "Ops assistant", icon: "agent" },
        ];
  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Operator</p>
        <h1 className="client-title">
          Welcome back, {user?.displayName?.split(" ")[0] || "admin"}.
        </h1>
        <p className="client-lede">
          {isRegulator
            ? "Open the read-only regulatory audit portal for solvency, logs, and exports."
            : isLocal
            ? "Open Local Bank operations for capital, approvals, KYC, and AML."
            : isWorld
              ? "Open World Bank operations for nationals, multisig, and governance."
              : isNational
                ? "Open National Bank operations for Local Banks, capital, SAR, and policy."
                : "Use the links below for bank operations."}
        </p>
        <Badge>{user?.role?.replaceAll("_", " ")}</Badge>
      </header>
      <div className="quick-grid">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="quick-card glass">
            <Icon name={l.icon} size={22} />
            <strong>{l.label}</strong>
            <span>{l.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RetailHome() {
  const { data, loading, error, refresh } = useClientHome();
  const { groups } = useMyGroups();
  const { address } = useAccount();
  const ethBal = useBalance({ address });
  const musdcAddr = contractAddresses.mockUsdc || undefined;
  const usdcBal = useBalance({
    address,
    token: musdcAddr && musdcAddr.startsWith("0x") ? musdcAddr : undefined,
    query: { enabled: Boolean(musdcAddr && address) },
  });

  if (loading && !data) {
    return (
      <div className="client-page">
        <StateMessage title="Loading your home…" description="Pulling profile, loans, and limits." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="client-page">
        <StateMessage
          title="Couldn’t load dashboard"
          description={error.message || "Try again shortly."}
          action={{ label: "Retry", onClick: () => void refresh() }}
        />
      </div>
    );
  }

  const user = data.user;
  const kycPending =
    data.kyc?.kyc1Status === "PENDING" || data.kyc?.kyc1Status === "NOT_STARTED";
  const isNew =
    !data.loans?.activeCount &&
    !(data.transactions?.length > 0) &&
    (user?.isFirstTime || !data.kyc?.onboardingComplete);

  const ethDisplay = ethBal.data
    ? `${Number(formatEther(ethBal.data.value)).toFixed(3)} ETH`
    : "—";
  const usdcDisplay = usdcBal.data
    ? `${Number(usdcBal.data.formatted).toFixed(2)} ${usdcBal.data.symbol}`
    : "—";

  const limits = data.limits;
  const used6 = limits?.sixMonth?.borrowed ?? 0;
  const cap6 = limits?.sixMonth?.limit ?? 5;
  const limitPct = cap6 > 0 ? Math.min(100, Math.round((used6 / cap6) * 100)) : 0;

  const credit = data.credit;
  const next = data.loans?.nextPayment;

  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Client home</p>
        <h1 className="client-title">
          Hello, {user?.displayName?.split(" ")[0] || "there"}.
        </h1>
        <p className="client-lede">
          Balances, credit, and borrowing limits in one place — verifiable against the reserve.
        </p>
        <div className="client-hero-badges">
          <Badge icon={kycPending ? "clock" : "check"}>
            KYC {String(data.kyc?.kyc1Status || "—").toLowerCase()}
          </Badge>
          {credit?.available ? (
            <Badge icon="passport">
              {credit.riskTier} · {credit.creditScore}
            </Badge>
          ) : (
            <Badge icon="passport">Passport · Bronze</Badge>
          )}
        </div>
      </header>

      {kycPending ? (
        <div className="notice warn" style={{ marginBottom: 20 }}>
          KYC Level 1 is <strong>pending</strong>. You can explore, but loan applications stay locked
          until an approver clears your documents.{" "}
          <Link to="/app/settings">View status</Link>
        </div>
      ) : null}

      <div className="quick-actions">
        <Button as={Link} to="/app/loans/apply" disabled={kycPending}>
          Apply for loan
        </Button>
        <Button as={Link} to="/app/groups" variant="ghost" showArrow={false}>
          Group lending
        </Button>
        <Button as={Link} to="/app/savings" variant="ghost" showArrow={false}>
          Deposit to savings
        </Button>
        <Button as={Link} to="/app/installments" variant="ghost" showArrow={false}>
          Make a payment
        </Button>
        <Button as={Link} to="/app/loans/limits" variant="ghost" showArrow={false}>
          Borrowing limits
        </Button>
        <Button as={Link} to="/app/assistant" variant="ghost" showArrow={false}>
          AI agent
        </Button>
      </div>

      <div className="client-snap-row">
        <StatCard label="ETH balance" value={ethDisplay} delay={0} />
        <StatCard label="Stablecoin" value={usdcDisplay} delay={60} />
        <StatCard
          label="Active loans"
          value={String(data.loans?.activeCount ?? 0)}
          delay={120}
        />
        <StatCard
          label="Outstanding"
          value={formatEth(data.loans?.outstandingEth)}
          delay={180}
        />
      </div>

      <div className="client-grid-2">
        <Glass className="client-panel">
          <p className="eyebrow">Borrowing limit</p>
          <h2 className="client-panel-title">
            {formatEth(used6)} <span className="muted">/ {formatEth(cap6)}</span>
          </h2>
          <p className="client-lede" style={{ margin: "0 0 12px" }}>
            Six-month rolling cap · {limitPct}% used
            {limits?.oneYear ? ` · 1y remaining ${formatEth(limits.oneYear.remaining)}` : ""}
          </p>
          <div className="limit-bar" aria-hidden>
            <div className="limit-bar-fill" style={{ width: `${limitPct}%` }} />
          </div>
          <Link to="/app/loans/history" className="text-link">
            View loans →
          </Link>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Credit Passport</p>
          <h2 className="client-panel-title">
            {credit?.riskTier || "Bronze"}
            {credit?.creditScore != null ? (
              <span className="muted"> · {credit.creditScore}</span>
            ) : null}
          </h2>
          <p className="client-lede" style={{ margin: "0 0 12px" }}>
            {credit?.available
              ? "Score updates as you repay on time."
              : "SBT passport will appear once the Credit Passport contract syncs."}
          </p>
          <Link to="/app/passport" className="text-link">
            Open passport →
          </Link>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Savings</p>
          <h2 className="client-panel-title">{formatEth(data.savings?.vaultEth ?? 0)}</h2>
          <p className="client-lede" style={{ margin: "0 0 12px" }}>
            Variable vault, fixed deposits, and checking.
          </p>
          <Link to="/app/savings" className="text-link">
            Open savings →
          </Link>
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Your groups</p>
          {groups?.length ? (
            <>
              <h2 className="client-panel-title">{groups[0].name}</h2>
              <p className="client-lede" style={{ margin: "0 0 12px" }}>
                {groups.length} circle{groups.length === 1 ? "" : "s"} · {groups[0].status}
                {groups[0].pendingRequest ? " · consent pending" : ""}
              </p>
              <Link to={`/app/groups/${groups[0].id}`} className="text-link">
                Open group →
              </Link>
            </>
          ) : (
            <>
              <h2 className="client-panel-title">None yet</h2>
              <p className="client-lede" style={{ margin: "0 0 12px" }}>
                Form a circle or join with an invite code.
              </p>
              <Link to="/app/groups" className="text-link">
                Group lending →
              </Link>
            </>
          )}
        </Glass>

        <Glass className="client-panel">
          <p className="eyebrow">Next payment</p>
          {next ? (
            <>
              <h2 className="client-panel-title">{formatEth(next.amount)}</h2>
              <p className="client-lede" style={{ margin: "0 0 12px" }}>
                Due {new Date(next.dueDate).toLocaleDateString()}
              </p>
              <Link to="/app/installments" className="text-link">
                Pay installment →
              </Link>
            </>
          ) : (
            <>
              <h2 className="client-panel-title">None due</h2>
              <p className="client-lede" style={{ margin: 0 }}>
                No upcoming installments on active loans.
              </p>
            </>
          )}
        </Glass>
      </div>

      {isNew ? (
        <section className="client-section">
          <h2 className="client-section-title">Quick start</h2>
          <div className="quick-grid">
            <Link to="/app/loans/apply" className="quick-card glass">
              <Icon name="loan" size={22} />
              <strong>Apply for a loan</strong>
              <span>Collateral or credit-based once KYC clears.</span>
            </Link>
            <Link to="/app/assistant" className="quick-card glass">
              <Icon name="agent" size={22} />
              <strong>Ask the AI agent</strong>
              <span>Limits, rates, and how the tiers work.</span>
            </Link>
            <Link to="/app/settings" className="quick-card glass">
              <Icon name="settings" size={22} />
              <strong>Finish profile</strong>
              <span>Phone, prefs, and KYC Level 2 upgrade.</span>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="client-section">
        <div className="client-section-head">
          <h2 className="client-section-title">Recent activity</h2>
          <Link to="/app/notifications" className="text-link">
            Notifications ({data.unreadCount ?? 0})
          </Link>
        </div>
        {(data.transactions || []).length === 0 ? (
          <Glass className="client-panel">
            <p className="client-lede" style={{ margin: 0 }}>
              No transactions yet. Disbursements, repayments, and deposits will show up here.
            </p>
          </Glass>
        ) : (
          <ul className="activity-list">
            {data.transactions.slice(0, 8).map((tx) => (
              <li key={tx.id} className="activity-row glass">
                <div>
                  <strong>{tx.type?.replaceAll("_", " ")}</strong>
                  <span>{new Date(tx.at).toLocaleString()}</span>
                </div>
                <code>{formatEth(tx.amount)}</code>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * Route: `/app/dashboard` — plan C.10 Client Home
 */
export default function DashboardPage() {
  const user = useSession((s) => s.user);
  if (user?.role && user.role !== "BORROWER") {
    return <OperatorHome user={user} />;
  }
  return <RetailHome />;
}
