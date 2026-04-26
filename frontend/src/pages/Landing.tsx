import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Eye,
  Coins,
  Gauge,
  Layers,
  Fingerprint,
  Network,
  ScrollText,
  Sparkles,
  ArrowRight,
  BadgeCheck,
  Landmark,
  Banknote,
  Building2,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/Header";
import { Logo } from "@/components/ui/Logo";
import { LandingAssistantSection } from "@/components/chatbot/LandingAssistantSection";

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <Hero />
      <TrustStrip />
      <Features />
      <LandingAssistantSection />
      <Hierarchy />
      <Security />
      <Numbers />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-700/40">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-gold/40 mask-fade-b" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-radial-gold" />

      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-700/40 bg-gold-900/20 px-3 py-1 text-xs text-gold-200">
            <Sparkles className="h-3.5 w-3.5" />
            A four-tier decentralized reserve — institutional-grade, retail-accessible
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink-100 sm:text-6xl lg:text-7xl">
            The <span className="gold-text">programmable</span>
            <br />
            world bank,
            <br />
            rebuilt on-chain.
          </h1>

          <p className="mt-6 max-w-xl text-base text-ink-200 sm:text-lg">
            Crypto World Bank models a World&nbsp;Bank → National&nbsp;Bank → Local&nbsp;Bank → Borrower
            lending hierarchy on EVM smart contracts. Transparent reserves, role-based governance,
            and explainable risk analytics — baked into the protocol.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/app/dashboard" className="btn-primary text-base">
              Launch Platform <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="btn-ghost text-base">
              Explore the architecture
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 text-sm sm:max-w-md">
            {[
              { k: "4-tier", v: "Hierarchical lending" },
              { k: "<$0.01", v: "Cost on Layer-2" },
              { k: "24/7", v: "On-chain audit trail" },
            ].map((x) => (
              <div key={x.k} className="rounded-xl border border-ink-600/60 bg-ink-900/60 p-3">
                <div className="gold-text font-display text-xl font-semibold">{x.k}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-200">{x.v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-5"
        >
          <ReserveVisual />
        </motion.div>
      </div>
    </section>
  );
}

function ReserveVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-6 rounded-[2rem] bg-radial-gold opacity-80 blur-2xl" aria-hidden />
      <div className="relative card-gold overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Global Reserve</div>
              <div className="font-display text-lg font-semibold text-ink-100">CWB · Tier&nbsp;1</div>
            </div>
          </div>
          <span className="badge-gold">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        </div>

        <div className="mt-6 rounded-xl border border-ink-600/70 bg-ink-900/80 p-5">
          <div className="flex items-baseline justify-between">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-200">Reserve balance</div>
            <div className="text-[11px] text-ink-200">testnet · sepolia</div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-ink-100">1,842.50</span>
            <span className="gold-text text-lg font-semibold">ETH</span>
          </div>
          <div className="mt-1 text-xs text-ink-200">≈ $3.68M at $2,000 / ETH</div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Allocated", value: "1,240.00" },
            { label: "Outstanding", value: "940.15" },
            { label: "Repaid", value: "298.35" },
          ].map((x) => (
            <div key={x.label} className="rounded-lg border border-ink-600/60 bg-ink-900/60 p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-200">{x.label}</div>
              <div className="mt-1 text-base font-semibold text-ink-100">{x.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2">
          {[
            { bank: "Bangladesh National Bank", apr: "3.00%", alloc: "420 ETH" },
            { bank: "Nigeria National Bank", apr: "3.00%", alloc: "380 ETH" },
            { bank: "Indonesia National Bank", apr: "3.00%", alloc: "310 ETH" },
          ].map((x) => (
            <div
              key={x.bank}
              className="flex items-center justify-between rounded-lg border border-ink-600/50 bg-ink-900/50 px-3 py-2 text-xs"
            >
              <span className="flex items-center gap-2 text-ink-100">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> {x.bank}
              </span>
              <span className="flex gap-3 font-mono text-ink-200">
                <span>{x.alloc}</span>
                <span className="text-gold-300">{x.apr}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg border border-gold-700/30 bg-gold-900/10 px-3 py-2 text-[11px] text-gold-200">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Reserve invariants enforced by smart contract
          </span>
          <span className="font-mono">0xA4E…8F21</span>
        </div>
      </div>
    </div>
  );
}

function TrustStrip() {
  const items = [
    "OpenZeppelin Access Control",
    "ReentrancyGuard",
    "Pausable Emergency Brake",
    "SIWE Wallet Auth",
    "Role-Based Governance",
    "EIP-1193 Compatible",
  ];
  return (
    <section className="border-b border-ink-700/40 bg-ink-900/40">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-6 text-xs uppercase tracking-[0.22em] text-ink-200">
        <span className="text-gold-400">Security primitives</span>
        {items.map((i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gold-500" />
            {i}
          </span>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Layers,
      title: "Four-tier capital hierarchy",
      body: "Capital flows World → National → Local → Borrower with configurable APRs at every tier (3% / 5% / 8%), producing a natural term structure.",
    },
    {
      icon: Eye,
      title: "Transparent reserves, always",
      body: "Every deposit, allocation, and repayment is a public on-chain event. No quarterly self-reports — the ledger is the source of truth.",
    },
    {
      icon: Gauge,
      title: "Programmable lending lifecycle",
      body: "Loan request, approval, disbursement, and installment repayment are orchestrated by smart contracts, with installment schedules auto-generated above a configurable threshold.",
    },
    {
      icon: ShieldCheck,
      title: "Defense-in-depth security",
      body: "AccessControl roles, ReentrancyGuard, Pausable breaker, and planned static analysis (Slither) + symbolic execution (Mythril) checks.",
    },
    {
      icon: Network,
      title: "Cross-tier & same-tier flows",
      body: "Architecture ready for interbank lending pools and upward surplus repatriation — the full multi-directional banking model.",
    },
    {
      icon: ScrollText,
      title: "Explainable risk (planned)",
      body: "Off-chain Random Forest + Isolation Forest with SHAP attributions. Approvers see every feature that moved a decision.",
    },
  ];

  return (
    <section id="features" className="border-b border-ink-700/40">
      <div className="container-page py-20">
        <div className="mb-12 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400">
            <span className="h-px w-8 bg-gold-500/50" />
            The Platform
          </div>
          <h2 className="font-display text-4xl font-semibold text-ink-100 sm:text-5xl">
            Built for <span className="gold-text">institutional depth</span>,
            accessible like retail finance.
          </h2>
          <p className="mt-4 text-ink-200">
            Every primitive on the platform is designed to feel premium while making the rules of
            the system plainly visible to anyone who looks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card card-hover p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold-700/40 bg-gold-900/20 text-gold-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 font-display text-xl font-semibold text-ink-100">{title}</h3>
              <p className="text-sm text-ink-200">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Hierarchy() {
  const tiers = [
    {
      icon: Landmark,
      tier: "Tier 1",
      name: "World Bank Reserve",
      apr: "3.00% APR",
      body: "Custodian of the global reserve. Allocates capital to registered National Banks.",
    },
    {
      icon: Building2,
      tier: "Tier 2",
      name: "National Bank",
      apr: "5.00% APR",
      body: "Borrows from the reserve, lends to Local Banks in its jurisdiction.",
    },
    {
      icon: Banknote,
      tier: "Tier 3",
      name: "Local Bank",
      apr: "8.00% APR",
      body: "Runs the retail loan lifecycle — request, approval, disbursement, installments.",
    },
    {
      icon: Users,
      tier: "Tier 4",
      name: "Borrower",
      apr: "0.1 – 500 ETH",
      body: "Requests loans from Local Banks. Builds on-chain repayment history.",
    },
  ];

  return (
    <section id="hierarchy" className="border-b border-ink-700/40 bg-gradient-to-b from-transparent to-ink-900/40">
      <div className="container-page py-20">
        <div className="mb-12 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400">
            <span className="h-px w-8 bg-gold-500/50" />
            The Hierarchy
          </div>
          <h2 className="font-display text-4xl font-semibold text-ink-100 sm:text-5xl">
            Capital flows, <span className="gold-text">with boundaries</span>.
          </h2>
          <p className="mt-4 text-ink-200">
            Every tier has a role, a rate, and a public balance sheet. The system can cascade
            repayments upward with interest — the same way real development finance works.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map(({ icon: Icon, tier, name, apr, body }, i) => (
            <div key={name} className="relative">
              <div className="card card-hover h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="badge-gold">{tier}</span>
                  <span className="font-mono text-xs text-ink-200">{apr}</span>
                </div>
                <Icon className="mt-5 h-8 w-8 text-gold-300" />
                <div className="mt-3 font-display text-xl font-semibold text-ink-100">{name}</div>
                <p className="mt-1 text-sm text-ink-200">{body}</p>
              </div>
              {i < tiers.length - 1 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gold-700/40 lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    {
      icon: Lock,
      title: "Smart contract hardening",
      points: [
        "Solidity 0.8.24 with built-in overflow protection",
        "OpenZeppelin AccessControl + ReentrancyGuard + Pausable",
        "Governor role required for allocations & rate changes",
        "Emergency withdraw only when system is paused",
      ],
    },
    {
      icon: Fingerprint,
      title: "Wallet-bound identity",
      points: [
        "Sign-In With Ethereum (EIP-4361) — no passwords stored",
        "Nonce-challenged, time-limited JWTs",
        "Role binding on-chain, not in a central DB",
        "Key rotation is literally wallet replacement",
      ],
    },
    {
      icon: Eye,
      title: "Auditable by design",
      points: [
        "Every state change emits a public event",
        "Off-chain indexer mirrors events into Postgres for analytics",
        "Planned static analysis (Slither) + symbolic exec (Mythril)",
        "Planned formal property verification (Certora)",
      ],
    },
  ];

  return (
    <section id="security" className="border-b border-ink-700/40">
      <div className="container-page py-20">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gold-400">
              <span className="h-px w-8 bg-gold-500/50" />
              Security
            </div>
            <h2 className="font-display text-4xl font-semibold text-ink-100 sm:text-5xl">
              Security <span className="gold-text">baked into the protocol</span>.
            </h2>
            <p className="mt-4 text-ink-200">
              We don't bolt security on — it is the substrate. Audited primitives, wallet-native
              auth, and an open public ledger for every move the system makes.
            </p>
          </div>
          <span className="badge-gold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Defense in depth
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, points }) => (
            <div key={title} className="card card-hover p-6">
              <Icon className="h-6 w-6 text-gold-300" />
              <h3 className="mt-4 font-display text-xl font-semibold text-ink-100">{title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-200">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Numbers() {
  const stats = [
    { k: "$55B+", v: "DeFi lending TVL today" },
    { k: "1.4B", v: "Adults still unbanked" },
    { k: "$4.5T", v: "MSME financing gap" },
    { k: "6.49%", v: "Avg. remittance fee today" },
  ];

  return (
    <section className="border-b border-ink-700/40 bg-ink-900/40">
      <div className="container-page py-16">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map(({ k, v }) => (
            <div key={k} className="text-center">
              <div className="font-display text-4xl font-semibold gold-text sm:text-5xl">{k}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-ink-200">{v}</div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-ink-200">
          Sources: DeFiLlama; World Bank Global Findex 2021; IFC MSME Finance Gap;
          World Bank Migration &amp; Development Brief 40.
        </p>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="about" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial-gold" />
      <div className="container-page relative py-24 text-center">
        <Coins className="mx-auto mb-6 h-10 w-10 text-gold-300" />
        <h2 className="font-display text-4xl font-semibold text-ink-100 sm:text-5xl">
          Ready to see <span className="gold-text">transparent lending</span> at work?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-ink-200">
          Launch the app on Sepolia or Polygon Amoy testnets — no real funds required. Connect a
          wallet, explore the reserve, file a loan request, and watch the hierarchy respond.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/app/dashboard" className="btn-primary text-base">
            Enter the Platform <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/Yuvraajrahman/Cryto-World-Bank"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-base"
          >
            View source
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink-700/50 bg-ink-950">
      <div className="container-page flex flex-col items-center justify-between gap-6 py-10 md:flex-row">
        <div className="flex items-center gap-3 text-xs text-ink-200">
          <Logo size={22} />
          <span>© 2026 Crypto World Bank · BRAC University prototype · Testnet only</span>
        </div>
        <div className="flex gap-6 text-xs text-ink-200">
          <a href="#security" className="hover:text-gold-300">Security</a>
          <a href="#hierarchy" className="hover:text-gold-300">Hierarchy</a>
          <a href="#features" className="hover:text-gold-300">Platform</a>
        </div>
      </div>
    </footer>
  );
}
