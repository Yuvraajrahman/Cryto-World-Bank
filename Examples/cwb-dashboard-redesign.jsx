import { useState, useEffect, Fragment } from 'react';
import {
  Globe, Landmark, Building2, User, Sun, Moon, Copy, Check, LogOut,
  Home, ClipboardList, Layers, Wallet2, Coins, ShieldAlert, Settings,
  Send, Users, ArrowDownToLine, PiggyBank, Percent, Clock, CheckCircle2,
  RefreshCw, ArrowUpRight, Banknote, ChevronRight, Info, X,
} from 'lucide-react';

/* ================================================================== */
/* Roles, navigation, and glossary                                     */
/* ================================================================== */

const ROLE_ORDER = ['world', 'national', 'local', 'client'];

const ROLE_META = {
  world: { label: 'World Bank', icon: Globe, badge: 'World Bank admin', scope: 'Global' },
  national: { label: 'National Bank', icon: Landmark, badge: 'National Bank admin', scope: 'Bangladesh' },
  local: { label: 'Local Bank', icon: Building2, badge: 'Local Bank admin', scope: 'Dhaka' },
  client: { label: 'Client', icon: User, badge: 'Client', scope: 'Account ending 4471' },
};

const HIERARCHY_DEPTH = { world: 0, national: 1, local: 2, client: 3 };

const TIERS = [
  { key: 'world', label: 'World Bank', icon: Globe, desc: 'Holds the global reserve and approves credit lines for National Banks.' },
  { key: 'national', label: 'National Bank', icon: Landmark, desc: 'Manages reserve for one country, and approves Local Banks and larger loans.' },
  { key: 'local', label: 'Local Bank', icon: Building2, desc: 'Runs a branch, approves everyday client loans, and keeps local reserve.' },
  { key: 'client', label: 'Client', icon: User, desc: 'Deposits, borrows, and repays — everyday banking.' },
];

const NAV_META = {
  overview: { label: 'Overview', icon: Home },
  approvals: { label: 'Approvals', icon: ClipboardList },
  credit: { label: 'Credit & capital', icon: Layers },
  alerts: { label: 'Alerts', icon: ShieldAlert },
  settings: { label: 'Settings', icon: Settings },
  loans: { label: 'My loans', icon: ClipboardList },
  borrow: { label: 'Borrow & repay', icon: Send },
};

const NETWORK_META = {
  world: { label: 'National banks', icon: Landmark },
  national: { label: 'Local banks', icon: Building2 },
  local: { label: 'Clients', icon: Users },
};

const NAV_BY_ROLE = {
  world: ['overview', 'approvals', 'credit', 'network', 'alerts', 'settings'],
  national: ['overview', 'approvals', 'credit', 'network', 'alerts', 'settings'],
  local: ['overview', 'approvals', 'credit', 'network', 'alerts', 'settings'],
  client: ['overview', 'loans', 'borrow', 'settings'],
};

function navMeta(key, role) {
  return key === 'network' ? NETWORK_META[role] : NAV_META[key];
}

const GLOSSARY = {
  reserve: 'Funds this account holds right now — the money backing everything it lends or sends onward.',
  reserveRatio: "The share of this account's lending that's backed by reserve. 100% means fully covered.",
  sentDown: 'Money this account has already sent down to the tier below it.',
  availableToLend: "Reserve that isn't committed yet — free to lend or send further down the chain.",
  credit: 'Pre-approved lending limits between banks in the network, like a standing credit line.',
  sar: 'Suspicious Activity Report — a compliance flag raised when an account shows unusual behavior.',
  utilization: "How much of your credit limit you're currently using.",
};

/* ================================================================== */
/* Per-role content                                                    */
/* ================================================================== */

const CONFIG = {
  world: {
    title: 'World Bank dashboard',
    subtitle: 'Approve National Bank credit lines, issue reserve, and keep global liquidity healthy.',
    actions: [
      { label: 'Review approvals', primary: true, target: 'approvals' },
      { label: 'Issue reserve', target: 'credit' },
      { label: 'Send capital to Nationals', target: 'credit' },
    ],
    kpis: [
      { label: 'Sent to Nationals', value: '2.10M', unit: 'USDC', icon: ArrowDownToLine, tone: 'muted', tip: 'sentDown' },
      { label: 'Reserve', value: '4.82M', unit: 'USDC', icon: PiggyBank, tone: 'accent', tip: 'reserve' },
      { label: 'Available to lend', value: '2.72M', unit: 'USDC', icon: Coins, tone: 'brass', tip: 'availableToLend' },
      { label: 'Reserve ratio', value: '100.0', unit: '%', icon: Percent, tone: 'accent', tip: 'reserveRatio' },
    ],
    loanBookTitle: 'Global loan book',
    loanBook: [
      { label: 'Active loans', value: '3' },
      { label: 'Active value', value: '19.2K USDC' },
      { label: 'Default rate', value: '0.4%' },
      { label: 'National banks', value: '14' },
    ],
    creditDesc: 'Interbank lending, reserve issuance, currency exchange, and capital sent to National Banks.',
    creditActions: ['Credit lines', 'Currency exchange', 'Capital allocation', 'Issue reserve'],
    quickLinks: ['Compliance alerts', 'Global interest rates', 'Reserve details'],
    workQueue: { items: [] },
    workQueueEmptyText: 'No approvals, capital requests, or compliance alerts waiting on you right now.',
    activeLoansList: [
      { name: 'National Bank — Kenya', amount: '12.4K USDC', rate: '6.2%' },
      { name: 'National Bank — Peru', amount: '6.8K USDC', rate: '5.9%' },
    ],
    rosterTitle: 'National banks in the network',
    rosterEntity: 'National Bank',
    rosterCols: ['Sent down', 'Reserve'],
    ratioTip: 'reserveRatio',
    roster: [
      { name: 'National Bank — Bangladesh', sub: 'Bangladesh', status: 'ACTIVE', ratio: 5.6, col1: '0', col2: '267.6K' },
      { name: 'National Bank — Kenya', sub: 'Kenya', status: 'ACTIVE', ratio: 6.1, col1: '12.4K', col2: '188.2K' },
      { name: 'National Bank — Philippines', sub: 'Philippines', status: 'ACTIVE', ratio: 4.9, col1: '0', col2: '342.0K' },
      { name: 'National Bank — Peru', sub: 'Peru', status: 'ACTIVE', ratio: 5.3, col1: '6.8K', col2: '205.4K' },
      { name: 'National Bank — Nigeria', sub: 'Nigeria · onboarding', status: 'PENDING', ratio: 0, col1: '0', col2: '0' },
    ],
  },

  national: {
    title: 'Bangladesh National Bank dashboard',
    subtitle: 'Approve credit for clients and Local Banks, and manage capital across the country.',
    actions: [
      { label: 'Review approvals', primary: true, target: 'approvals' },
      { label: 'Request capital from World Bank', target: 'credit' },
      { label: 'Send capital to Locals', target: 'credit' },
    ],
    kpis: [
      { label: 'Sent to Locals', value: '0', unit: 'USDC', icon: ArrowDownToLine, tone: 'muted', tip: 'sentDown' },
      { label: 'Reserve', value: '267.6K', unit: 'USDC', icon: PiggyBank, tone: 'accent', tip: 'reserve' },
      { label: 'Available to lend', value: '227.4K', unit: 'USDC', icon: Coins, tone: 'brass', tip: 'availableToLend' },
      { label: 'Reserve ratio', value: '100.0', unit: '%', icon: Percent, tone: 'accent', tip: 'reserveRatio' },
    ],
    loanBookTitle: 'Bangladesh loan book',
    loanBook: [
      { label: 'Active loans', value: '0' },
      { label: 'Active value', value: '0 USDC' },
      { label: 'Default rate', value: '0.0%' },
      { label: 'Local banks', value: '8' },
    ],
    creditDesc: 'Interbank lending, deposits sent up to World Bank, currency exchange, and capital sent down to Local Banks.',
    creditActions: ['Credit lines', 'Currency exchange', 'Capital allocation', 'Request capital from World Bank'],
    quickLinks: ['Compliance alerts', 'Bangladesh interest rates', 'Reserve details'],
    workQueue: { items: [] },
    workQueueEmptyText: 'No approvals, capital requests, or compliance alerts waiting on you right now.',
    activeLoansList: [],
    rosterTitle: 'Local banks in Bangladesh',
    rosterEntity: 'Local Bank',
    rosterCols: ['Sent down', 'Reserve'],
    ratioTip: 'reserveRatio',
    roster: [
      { name: 'Local Bank — Dhaka', sub: 'Dhaka', status: 'ACTIVE', ratio: 26.1, col1: '0', col2: '25.0K' },
      { name: 'Local Bank — Chattogram', sub: 'Chattogram', status: 'ACTIVE', ratio: 26.1, col1: '0', col2: '50.0K' },
      { name: 'Local Bank — Gazipur', sub: 'Gazipur', status: 'ACTIVE', ratio: 26.1, col1: '0', col2: '8.9K' },
      { name: 'Local Bank — Khulna', sub: 'Khulna', status: 'ACTIVE', ratio: 26.1, col1: '0', col2: '8.6K' },
      { name: 'Local Bank — Rangpur', sub: 'Rangpur', status: 'ACTIVE', ratio: 26.1, col1: '0', col2: '21.0K' },
      { name: 'Local Bank — Rajshahi', sub: 'Rajshahi', status: 'ACTIVE', ratio: 26.1, col1: '0', col2: '49.6K' },
      { name: 'Local Bank — Comilla', sub: 'Comilla', status: 'ACTIVE', ratio: 26.1, col1: '0', col2: '45.0K' },
      { name: 'Local Bank — Pallabi', sub: 'Pallabi', status: 'ACTIVE', ratio: 26.1, col1: '0', col2: '19.2K' },
    ],
  },

  local: {
    title: 'Dhaka Local Bank dashboard',
    subtitle: 'Approve client loans, manage your branch reserve, and request capital from the National Bank.',
    actions: [
      { label: 'Review approvals', primary: true, target: 'approvals' },
      { label: 'Request capital from National Bank', target: 'credit' },
      { label: 'Send capital to clients', target: 'credit' },
    ],
    kpis: [
      { label: 'Sent to clients', value: '0', unit: 'USDC', icon: ArrowDownToLine, tone: 'muted', tip: 'sentDown' },
      { label: 'Reserve', value: '25.0K', unit: 'USDC', icon: PiggyBank, tone: 'accent', tip: 'reserve' },
      { label: 'Available to lend', value: '18.4K', unit: 'USDC', icon: Coins, tone: 'brass', tip: 'availableToLend' },
      { label: 'Reserve ratio', value: '26.1', unit: '%', icon: Percent, tone: 'accent', tip: 'reserveRatio' },
    ],
    loanBookTitle: 'Branch loan book',
    loanBook: [
      { label: 'Active loans', value: '2' },
      { label: 'Active value', value: '2.9K USDC' },
      { label: 'Default rate', value: '0.0%' },
      { label: 'Clients', value: '42' },
    ],
    creditDesc: 'Client lending, deposits sent up to the National Bank, and currency exchange.',
    creditActions: ['Credit lines', 'Currency exchange', 'Request capital from National Bank', 'Send capital to clients'],
    quickLinks: ['Compliance alerts', 'Branch interest rates', 'Reserve details'],
    workQueue: {
      items: [
        { name: 'Farhan Hossain', type: 'Loan approval', amount: '2,100 USDC', submitted: '2h ago' },
        { name: 'Sultana Begum', type: 'Loan approval', amount: '800 USDC', submitted: '1d ago' },
      ],
    },
    workQueueEmptyText: 'No approvals, capital requests, or compliance alerts waiting on you right now.',
    activeLoansList: [
      { name: 'Rahim Al Amin', amount: '3.5K USDC', rate: '9.5%' },
      { name: 'Nadia Islam', amount: '1.2K USDC', rate: '9.5%' },
    ],
    rosterTitle: 'Your clients',
    rosterEntity: 'Client',
    rosterCols: ['Loan', 'Limit'],
    ratioTip: 'utilization',
    roster: [
      { name: 'Rahim Al Amin', sub: 'Client', status: 'ACTIVE', ratio: 70, col1: '3.5K', col2: '5.0K' },
      { name: 'Nadia Islam', sub: 'Client', status: 'ACTIVE', ratio: 60, col1: '1.2K', col2: '2.0K' },
      { name: 'Karim Chowdhury', sub: 'Client', status: 'ACTIVE', ratio: 0, col1: '0', col2: '3.0K' },
      { name: 'Sultana Begum', sub: 'Client', status: 'PENDING', ratio: 53, col1: '800', col2: '1.5K' },
      { name: 'Farhan Hossain', sub: 'Client', status: 'ACTIVE', ratio: 84, col1: '2.1K', col2: '2.5K' },
    ],
  },

  client: {
    title: 'Your account',
    subtitle: 'Track your balance, manage your loan, and request new credit.',
    actions: [
      { label: 'Request a loan', primary: true, target: 'borrow' },
      { label: 'Repay loan', target: 'borrow' },
    ],
    kpis: [
      { label: 'Wallet balance', value: '1,240', unit: 'USDC', icon: Wallet2, tone: 'accent' },
      { label: 'Active loan', value: '3,500', unit: 'USDC', icon: Banknote, tone: 'muted' },
      { label: 'Credit limit', value: '5,000', unit: 'USDC', icon: Coins, tone: 'muted' },
      { label: 'Utilization', value: '70.0', unit: '%', icon: Percent, tone: 'brass', tip: 'utilization' },
    ],
    loanBookTitle: 'Your loan summary',
    loanBook: [
      { label: 'Principal', value: '3,500 USDC' },
      { label: 'Remaining balance', value: '2,940 USDC' },
      { label: 'Next payment', value: '210 USDC · Sep 5' },
      { label: 'APR', value: '9.5%' },
    ],
    quickLinks: ['Payment history', 'Loan agreement', 'Support'],
    workQueue: { items: [] },
    workQueueEmptyText: 'Nothing needs your attention right now.',
    activeLoansList: [{ name: 'Personal loan', amount: '3,500 USDC', rate: '9.5%' }],
    rosterTitle: null,
  },
};

const LOAN_HISTORY = [
  { name: 'Personal loan', sub: 'Opened Jun 2026', amount: '3,500 USDC', status: 'ACTIVE' },
  { name: 'Emergency credit', sub: 'Closed Feb 2026', amount: '900 USDC', status: 'INACTIVE' },
];

/* ================================================================== */
/* Style helpers                                                       */
/* ================================================================== */

function toneClasses(tone) {
  const map = {
    muted: { wrap: 'bg-surface-alt', icon: 'text-muted' },
    accent: { wrap: 'bg-accent-soft', icon: 'text-accent' },
    brass: { wrap: 'bg-brass-soft', icon: 'text-brass' },
  };
  return map[tone] || map.muted;
}

function statusClasses(status) {
  if (status === 'ACTIVE') return 'badge-active';
  if (status === 'PENDING') return 'badge-pending';
  return 'badge-inactive';
}

/* ================================================================== */
/* Small building blocks                                               */
/* ================================================================== */

function InfoDot({ id, text, openTip, setOpenTip }) {
  if (!text) return null;
  const isOpen = openTip === id;
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpenTip(isOpen ? null : id); }}
        className="info-dot inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border text-xs leading-none"
        aria-label="More info"
      >
        <Info size={10} />
      </button>
      {isOpen && (
        <span className="tooltip-pop absolute z-50 top-5 left-1/2 rounded-lg border px-3 py-2 text-xs leading-snug shadow-lg w-52">
          {text}
        </span>
      )}
    </span>
  );
}

function TierTrail({ role }) {
  const depth = HIERARCHY_DEPTH[role];
  return (
    <div className="flex items-center flex-1 min-w-0">
      {TIERS.map((t, i) => {
        const state = i < depth ? 'past' : i === depth ? 'current' : 'future';
        const Icon = t.icon;
        return (
          <Fragment key={t.key}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center stamp stamp-${state}`}>
                <Icon size={15} />
              </div>
              <span className={`text-xs whitespace-nowrap ${state === 'current' ? 'font-semibold text-accent' : 'text-faint'}`}>
                {t.label}
              </span>
            </div>
            {i < TIERS.length - 1 && (
              <div className={`h-px flex-1 min-w-6 mx-1 mb-4 ${i < depth ? 'trail-line-past' : 'trail-line-future'}`} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function HowItWorksModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-backdrop absolute inset-0" onClick={onClose} />
      <div className="relative bg-surface border border-base rounded-xl max-w-md w-full p-6 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink" aria-label="Close">
          <X size={18} />
        </button>
        <h3 className="font-display text-lg font-semibold mb-1 pr-6">How money flows through CWB</h3>
        <p className="text-sm text-muted mb-4">
          Four tiers, one shared ledger. Approvals and capital move down the chain; repayments and reserve reporting move back up — and every tier's reserve is verifiable on-chain.
        </p>
        <div className="space-y-3.5">
          {TIERS.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.key} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-accent-soft">
                  <Icon size={14} className="text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div className="text-xs text-muted mt-0.5">{t.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Main component                                                      */
/* ================================================================== */

export default function BankDashboard() {
  const [role, setRole] = useState('national');
  const [dark, setDark] = useState(true);
  const [activeNav, setActiveNav] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [openTip, setOpenTip] = useState(null);
  const [showHow, setShowHow] = useState(false);

  useEffect(() => {
    if (!NAV_BY_ROLE[role].includes(activeNav)) setActiveNav('overview');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const cfg = CONFIG[role];
  const meta = ROLE_META[role];
  const RoleIcon = meta.icon;
  const isClient = role === 'client';

  function handleCopy() {
    try { navigator.clipboard.writeText('0x9ecf1234567890abcdef1234567890ab60b3'); } catch (e) { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function goTo(key) {
    setActiveNav(key);
    requestAnimationFrame(() => {
      document.getElementById('sec-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <div data-theme={dark ? 'dark' : 'light'} className="min-h-screen bg-app text-ink font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        [data-theme="light"] {
          --bg:#F7F3EA; --surface:#FFFFFF; --surface-alt:#F0EAD9; --border:#E4DAC0;
          --ink:#1C2620; --muted:#6B7268; --faint:#9B9C8E;
          --accent:#0F6E4F; --accent-strong:#0B4F3A; --accent-soft:#E3F0E9; --on-accent:#FFFFFF;
          --brass:#95711E; --brass-soft:#F6ECD4;
        }
        [data-theme="dark"] {
          --bg:#0E1712; --surface:#15211A; --surface-alt:#1B2A21; --border:#28392D;
          --ink:#EDEAE0; --muted:#9CA79C; --faint:#6C7A6C;
          --accent:#35B489; --accent-strong:#5FCBA2; --accent-soft:#173328; --on-accent:#08150F;
          --brass:#E0B45C; --brass-soft:#2E2717;
        }

        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono-data { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }

        .bg-app { background: var(--bg); }
        .bg-surface { background: var(--surface); }
        .bg-surface-alt { background: var(--surface-alt); }
        .border-base { border-color: var(--border); }
        .text-ink { color: var(--ink); }
        .text-muted { color: var(--muted); }
        .text-faint { color: var(--faint); }
        .text-accent { color: var(--accent-strong); }
        .bg-accent-soft { background: var(--accent-soft); }
        .bg-brass-soft { background: var(--brass-soft); }
        .text-brass { color: var(--brass); }

        .btn-primary { background: var(--accent); color: var(--on-accent); }
        .btn-primary:hover { background: var(--accent-strong); color: var(--on-accent); }
        .btn-secondary { border: 1px solid var(--border); color: var(--ink); }
        .btn-secondary:hover { background: var(--surface-alt); }
        .btn-primary-sm { background: var(--accent); color: var(--on-accent); }
        .btn-primary-sm:hover { background: var(--accent-strong); }
        .btn-secondary-sm { border: 1px solid var(--border); color: var(--muted); }
        .btn-secondary-sm:hover { background: var(--surface-alt); color: var(--ink); }

        .badge-active { background: var(--accent-soft); color: var(--accent-strong); }
        .badge-pending { background: var(--brass-soft); color: var(--brass); }
        .badge-inactive { background: var(--surface-alt); color: var(--muted); }

        .chip-dashed { border: 1px dashed var(--border); }

        .nav-tab-active { border-color: var(--accent); color: var(--accent-strong); }
        .nav-tab-inactive { border-color: transparent; color: var(--muted); }
        .nav-tab-inactive:hover { color: var(--ink); }

        .info-dot { border-color: var(--faint); color: var(--faint); }
        .info-dot:hover { color: var(--ink); border-color: var(--muted); }
        .tooltip-pop { background: var(--surface); border-color: var(--border); color: var(--muted); transform: translateX(-50%); }

        .stamp-past { border-color: var(--accent); color: var(--accent-strong); background: var(--accent-soft); }
        .stamp-current { border-color: var(--accent-strong); color: var(--on-accent); background: var(--accent); transform: rotate(-4deg); box-shadow: 0 0 0 3px var(--accent-soft); }
        .stamp-future { border-style: dashed; border-color: var(--border); color: var(--faint); background: transparent; }
        .trail-line-past { background: var(--accent); opacity: 0.4; }
        .trail-line-future { background: var(--border); }

        .hover-row:hover { background: var(--surface-alt); }

        .modal-backdrop { background: rgba(10, 15, 12, 0.55); }
        .progress-track { background: var(--surface-alt); }
        .progress-fill { background: var(--accent); }

        button:focus-visible, a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {openTip && <div className="fixed inset-0 z-40" onClick={() => setOpenTip(null)} />}
      {showHow && <HowItWorksModal onClose={() => setShowHow(false)} />}

      {/* ---------------- Top bar ---------------- */}
      <header className="sticky top-0 z-10 bg-surface border-b border-base">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center btn-primary">
              <Landmark size={17} />
            </div>
            <div>
              <div className="font-display font-semibold text-base leading-tight">
                Ledger<span className="text-accent">Chain</span>
              </div>
              <div className="text-xs text-faint leading-tight">{meta.label}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className="rounded-md p-2 text-muted hover:text-ink hover:bg-surface-alt transition-colors" aria-label="Toggle dark mode">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => goTo('settings')} className="btn-secondary-sm hidden sm:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        <div className="border-t border-base">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto">
            {NAV_BY_ROLE[role].map((key) => {
              const { icon: Icon, label } = navMeta(key, role);
              const active = key === activeNav;
              return (
                <button
                  key={key}
                  onClick={() => goTo(key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${active ? 'nav-tab-active' : 'nav-tab-inactive'}`}
                >
                  <Icon size={14} /> {label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ---------------- Demo role switcher ---------------- */}
        <div className="chip-dashed rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted">
            <span className="font-medium text-ink">Demo mode.</span> Preview the dashboard as any tier in the network.
          </div>
          <div className="flex items-center flex-wrap gap-1.5">
            {ROLE_ORDER.map((r) => {
              const m = ROLE_META[r];
              const Icon = m.icon;
              const active = r === role;
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${active ? 'btn-primary border-transparent' : 'btn-secondary'}`}
                >
                  <Icon size={12} /> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- Overview: tier trail, banner, actions, KPIs ---------------- */}
        <section id="sec-overview" className="space-y-3.5">
          <div className="rounded-xl border border-base bg-surface p-5">
            <div className="flex items-start justify-between gap-4 mb-5">
              <TierTrail role={role} />
              <button onClick={() => setShowHow(true)} className="inline-flex items-center gap-1 text-xs font-medium text-accent shrink-0 whitespace-nowrap pt-1">
                <Info size={12} /> How this works
              </button>
            </div>

            <div className="text-xs font-medium tracking-wide uppercase mb-1.5 flex items-center gap-1.5 text-accent">
              <RoleIcon size={12} /> {meta.label} · {meta.scope}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">{cfg.title}</h1>
            <p className="mt-1.5 text-sm text-muted max-w-xl">{cfg.subtitle}</p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {cfg.actions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => goTo(a.target)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${a.primary ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {a.label} {a.primary && <ArrowUpRight size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {cfg.kpis.map((k) => {
              const t = toneClasses(k.tone);
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-xl border border-base bg-surface p-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-3 ${t.wrap}`}>
                    <Icon size={15} className={t.icon} />
                  </div>
                  <div className="font-mono-data text-2xl font-semibold tracking-tight">
                    {k.value}
                    <span className="text-sm font-body font-normal ml-1 text-muted">{k.unit}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted flex items-center gap-1">
                    {k.label}
                    {k.tip && <InfoDot id={`kpi-${k.label}`} text={GLOSSARY[k.tip]} openTip={openTip} setOpenTip={setOpenTip} />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {isClient ? (
          <ClientSections
            cfg={cfg}
            openTip={openTip}
            setOpenTip={setOpenTip}
          />
        ) : (
          <InstitutionalSections
            cfg={cfg}
            role={role}
            openTip={openTip}
            setOpenTip={setOpenTip}
          />
        )}

        {/* ---------------- Alerts ---------------- */}
        <section id="sec-alerts" className="rounded-xl border border-base bg-surface p-5">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={15} className="text-brass" />
            <h2 className="font-display text-sm font-semibold">Compliance alerts</h2>
            <InfoDot id="alerts-tip" text={GLOSSARY.sar} openTip={openTip} setOpenTip={setOpenTip} />
          </div>
          <p className="text-xs text-muted mb-4">Flags raised automatically when an account shows unusual activity.</p>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mb-3 bg-accent-soft">
              <CheckCircle2 size={17} className="text-accent" />
            </div>
            <div className="text-sm font-medium">All clear</div>
            <p className="mt-1 text-xs text-muted max-w-xs">Nothing needs review right now.</p>
          </div>
        </section>

        {/* ---------------- Settings / account ---------------- */}
        <section id="sec-settings" className="rounded-xl border border-base bg-surface p-5">
          <h2 className="font-display text-sm font-semibold mb-4">Account</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div>
              <div className="text-xs text-muted mb-1">Role</div>
              <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium bg-surface-alt">
                <Check size={12} className="text-accent" /> {meta.badge}
              </span>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Wallet address</div>
              <button onClick={handleCopy} className="btn-secondary-sm inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono-data transition-colors">
                0x9ecf...60b3 {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <div className="sm:ml-auto">
              <button className="btn-secondary-sm inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </section>

        {/* ---------------- Quick links ---------------- */}
        <div className="flex flex-wrap gap-2 pb-4">
          {cfg.quickLinks.map((l) => (
            <button key={l} className="btn-secondary-sm inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors">
              {l}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ================================================================== */
/* Institutional layout: World / National / Local                      */
/* ================================================================== */

function InstitutionalSections({ cfg, role, openTip, setOpenTip }) {
  const networkMeta = NETWORK_META[role];
  return (
    <>
      {/* ---------------- Approvals ---------------- */}
      <section id="sec-approvals" className="rounded-xl border border-base bg-surface overflow-hidden">
        <div className="px-5 py-3.5 border-b border-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-accent" />
            <h2 className="font-display text-sm font-semibold">Approvals</h2>
          </div>
          {cfg.workQueue.items.length === 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium badge-active">
              <CheckCircle2 size={11} /> All caught up
            </span>
          ) : (
            <span className="text-xs font-medium text-brass">{cfg.workQueue.items.length} waiting on you</span>
          )}
        </div>
        <div className="p-5">
          {cfg.workQueue.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="h-10 w-10 rounded-full flex items-center justify-center mb-3 bg-surface-alt">
                <Clock size={17} className="text-faint" />
              </div>
              <div className="text-sm font-medium">All caught up</div>
              <p className="mt-1 text-xs text-muted max-w-xs">{cfg.workQueueEmptyText}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cfg.workQueue.items.map((item) => (
                <div key={item.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-base px-3.5 py-2.5">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted">{item.type} · {item.amount} · {item.submitted}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="btn-secondary-sm inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors">Review</button>
                    <button className="btn-primary-sm inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Credit & capital ---------------- */}
      <section id="sec-credit" className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div className="lg:col-span-2 rounded-xl border border-base bg-surface p-5 space-y-5">
          <div>
            <h2 className="font-display text-sm font-semibold mb-3">{cfg.loanBookTitle}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {cfg.loanBook.map((item) => (
                <div key={item.label}>
                  <div className="text-xs text-muted mb-1">{item.label}</div>
                  <div className="font-mono-data text-lg font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-base pt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold">Pending &amp; active loans</h2>
              <button className="btn-secondary-sm inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-faint">Pending</div>
                {cfg.workQueue.items.length === 0 ? (
                  <p className="text-sm text-muted">No pending loan requests.</p>
                ) : (
                  <div className="space-y-2">
                    {cfg.workQueue.items.map((i) => (
                      <div key={i.name} className="flex items-center justify-between text-sm rounded-lg border border-base px-3 py-2">
                        <span>{i.name}</span>
                        <span className="font-mono-data text-muted">{i.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-faint">Active</div>
                {cfg.activeLoansList.length === 0 ? (
                  <p className="text-sm text-muted">No active loans yet.</p>
                ) : (
                  <div className="space-y-2">
                    {cfg.activeLoansList.map((i) => (
                      <div key={i.name} className="flex items-center justify-between text-sm rounded-lg border border-base px-3 py-2">
                        <span>{i.name}</span>
                        <span className="font-mono-data text-muted">{i.amount} · {i.rate}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-base bg-surface p-5">
          <h2 className="font-display text-sm font-semibold mb-2 flex items-center gap-1.5">
            Credit &amp; capital
            <InfoDot id="credit-tip" text={GLOSSARY.credit} openTip={openTip} setOpenTip={setOpenTip} />
          </h2>
          <p className="text-xs text-muted mb-3.5">{cfg.creditDesc}</p>
          <div className="space-y-1.5">
            {cfg.creditActions.map((a, i) => (
              <button
                key={a}
                className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium border transition-colors ${
                  i === cfg.creditActions.length - 1 ? 'btn-primary border-transparent' : 'btn-secondary'
                }`}
              >
                {a} <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Network roster ---------------- */}
      {cfg.rosterTitle && (
        <section id="sec-network" className="rounded-xl border border-base bg-surface overflow-hidden">
          <div className="px-5 py-3.5 border-b border-base flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold flex items-center gap-2">
              <networkMeta.icon size={15} className="text-accent" /> {cfg.rosterTitle}
            </h2>
            <button className="text-xs font-medium text-accent hover:opacity-80">Manage</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs border-b border-base text-faint">
                  <th className="px-5 py-2 font-medium">{cfg.rosterEntity}</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Ratio <InfoDot id="ratio-tip" text={GLOSSARY[cfg.ratioTip]} openTip={openTip} setOpenTip={setOpenTip} />
                    </span>
                  </th>
                  <th className="px-5 py-2 font-medium text-right">{cfg.rosterCols[0]}</th>
                  <th className="px-5 py-2 font-medium text-right">{cfg.rosterCols[1]}</th>
                </tr>
              </thead>
              <tbody>
                {cfg.roster.map((r) => (
                  <tr key={r.name} className="hover-row border-t border-base">
                    <td className="px-5 py-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted">{r.sub}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClasses(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full progress-track">
                          <div className="h-1.5 rounded-full progress-fill" style={{ width: Math.min(r.ratio, 100) + '%' }} />
                        </div>
                        <span className="font-mono-data text-xs text-muted">{r.ratio}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono-data">{r.col1}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{r.col2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

/* ================================================================== */
/* Client layout                                                       */
/* ================================================================== */

function ClientSections({ cfg, openTip, setOpenTip }) {
  const loan = cfg.loanBook;
  const utilization = parseFloat(cfg.kpis.find((k) => k.label === 'Utilization')?.value || '0');

  return (
    <>
      {/* ---------------- My loans ---------------- */}
      <section id="sec-loans" className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div className="lg:col-span-2 rounded-xl border border-base bg-surface p-5">
          <h2 className="font-display text-sm font-semibold mb-4">{cfg.loanBookTitle}</h2>
          <div className="grid grid-cols-2 gap-5 mb-5">
            {loan.map((item) => (
              <div key={item.label}>
                <div className="text-xs text-muted mb-1">{item.label}</div>
                <div className="font-mono-data text-lg font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted mb-1.5">
              <span className="inline-flex items-center gap-1">Credit used <InfoDot id="util-tip" text={GLOSSARY.utilization} openTip={openTip} setOpenTip={setOpenTip} /></span>
              <span className="font-mono-data">{utilization}%</span>
            </div>
            <div className="h-2 rounded-full progress-track">
              <div className="h-2 rounded-full progress-fill" style={{ width: Math.min(utilization, 100) + '%' }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-base bg-surface p-5">
          <h2 className="font-display text-sm font-semibold mb-3">Loan history</h2>
          <div className="space-y-2">
            {LOAN_HISTORY.map((l) => (
              <div key={l.name} className="flex items-center justify-between rounded-lg border border-base px-3.5 py-2.5">
                <div>
                  <div className="text-sm font-medium">{l.name}</div>
                  <div className="text-xs text-muted">{l.sub}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono-data text-sm">{l.amount}</span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClasses(l.status)}`}>{l.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Borrow & repay ---------------- */}
      <section id="sec-borrow" className="rounded-xl border border-base bg-surface p-5">
        <h2 className="font-display text-sm font-semibold mb-1">Borrow &amp; repay</h2>
        <p className="text-xs text-muted mb-4">Manage your loan or request new credit — funds move straight to your wallet.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-lg border border-base p-4">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3 bg-accent-soft">
              <ArrowUpRight size={15} className="text-accent" />
            </div>
            <div className="text-sm font-semibold mb-1">Request a loan</div>
            <p className="text-xs text-muted mb-3">Borrow up to your available credit limit, funded instantly.</p>
            <button className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors">Request now</button>
          </div>
          <div className="rounded-lg border border-base p-4">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3 bg-surface-alt">
              <Banknote size={15} className="text-muted" />
            </div>
            <div className="text-sm font-semibold mb-1">Repay loan</div>
            <p className="text-xs text-muted mb-3">Make a payment toward your active loan, in full or in part.</p>
            <button className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors">Make a payment</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {['Payment methods', 'Statements'].map((l) => (
            <button key={l} className="btn-secondary-sm inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors">{l}</button>
          ))}
        </div>
      </section>
    </>
  );
}
