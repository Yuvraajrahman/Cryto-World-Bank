import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Globe, Landmark, Building2, User, Sun, Moon, Copy, Check, LogOut,
  Home, ClipboardList, Layers, Wallet2, Coins, ShieldAlert, Settings,
  Send, Users, ArrowDownToLine, PiggyBank, Percent, Clock, CheckCircle2,
  RefreshCw, ArrowUpRight, Banknote, ChevronRight, ChevronDown, Info, X, AlertTriangle, Search,
} from 'lucide-react';
import { useSession } from '@/lib/store';
import { api } from '@/lib/api';
import { useTheme } from '@/wbr/theme/ThemeProvider';
import { useLabLiveData } from './useLabLiveData';
import LabOpsPanels, { ClientBorrowPanel } from './LabOpsPanels';

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

const LAB_PERSONA_IDS = new Set([
  'admin@gmail.com',
  'bangladesh',
  'local_bangladesh_dhaka',
  'client_bangladesh_dhaka_00001',
]);

function navMeta(key, role) {
  return key === 'network' ? NETWORK_META[role] : NAV_META[key];
}

function roleToPersona(userRole) {
  if (userRole === 'DEV_ADMIN' || userRole === 'OWNER') return 'world';
  if (userRole === 'NATIONAL_BANK_ADMIN') return 'national';
  if (userRole === 'LOCAL_BANK_ADMIN' || userRole === 'APPROVER') return 'local';
  if (userRole === 'BORROWER') return 'client';
  return 'world';
}

function deskHome(userRole) {
  if (userRole === 'OWNER' || userRole === 'DEV_ADMIN') return '/bank/world';
  if (userRole === 'NATIONAL_BANK_ADMIN') return '/bank/national';
  if (userRole === 'LOCAL_BANK_ADMIN' || userRole === 'APPROVER') return '/bank/local';
  return '/app';
}

function userLoginId(user) {
  return (user?.loginId || user?.id || '').toLowerCase();
}

function isLabOperator(user) {
  if (!user) return false;
  if (user.role === 'DEV_ADMIN') return true;
  const email = (user.email || '').toLowerCase();
  const loginId = userLoginId(user);
  return email === 'admin@gmail.com' || loginId === 'admin';
}

function isLabPersonaUser(user) {
  if (!user) return false;
  const email = (user.email || '').toLowerCase();
  const loginId = userLoginId(user);
  return LAB_PERSONA_IDS.has(email) || LAB_PERSONA_IDS.has(loginId);
}

function canAccessLab(user) {
  return isLabOperator(user) || isLabPersonaUser(user);
}

function shortWallet(wallet) {
  if (!wallet || typeof wallet !== 'string') return '—';
  if (wallet.length < 12) return wallet;
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}

function creditActionLabel(a) {
  return typeof a === 'string' ? a : a?.label;
}

function mergeLiveConfig(role, liveConfig) {
  const base = CONFIG[role];
  if (!liveConfig) return base;

  const mergedKpis = (liveConfig.kpis || base.kpis || []).map((k, i) => {
    const fallback = base.kpis?.find((b) => b.label === k.label) || base.kpis?.[i] || {};
    return {
      ...fallback,
      ...k,
      icon: k.icon || fallback.icon || Coins,
      tone: k.tone || fallback.tone || 'muted',
    };
  });

  return {
    ...base,
    ...liveConfig,
    kpis: mergedKpis,
    actions: base.actions,
    quickLinks: liveConfig.quickLinks || base.quickLinks,
    workQueueEmptyText: liveConfig.workQueueEmptyText || base.workQueueEmptyText,
    loanBookTitle: liveConfig.loanBookTitle || base.loanBookTitle,
    ratioTip: liveConfig.ratioTip || base.ratioTip,
    workQueue: liveConfig.workQueue || base.workQueue,
    roster: liveConfig.roster ?? base.roster,
    activeLoansList: liveConfig.activeLoansList ?? base.activeLoansList,
    creditActions: liveConfig.creditActions || base.creditActions,
  };
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
    creditActions: [
      { label: 'Facilities desk', panel: 'facilities' },
      { label: 'Treasury FX', panel: 'exchange' },
      { label: 'Allocate capital', panel: 'allocate' },
      { label: 'Governance', panel: 'governance' },
    ],
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
    creditActions: [
      { label: 'Facilities desk', panel: 'facilities' },
      { label: 'Treasury FX', panel: 'exchange' },
      { label: 'Allocate capital', panel: 'allocate' },
      { label: 'Request from World', panel: 'request' },
    ],
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
    creditActions: [
      { label: 'Facilities desk', panel: 'facilities' },
      { label: 'Treasury FX', panel: 'exchange' },
      { label: 'Request from National', panel: 'request' },
    ],
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
          Four tiers, one shared ledger. Approvals and capital move down the chain; repayments and reserve reporting move back up — and every tier&apos;s reserve is verifiable on-chain.
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

export default function DemoLabDashboard() {
  const navigate = useNavigate();
  const token = useSession((s) => s.token);
  const user = useSession((s) => s.user);
  const setSession = useSession((s) => s.setSession);
  const reset = useSession((s) => s.reset);
  const { resolved, setPreference } = useTheme();

  const [role, setRole] = useState(() => roleToPersona(user?.role));
  const [activeNav, setActiveNav] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [openTip, setOpenTip] = useState(null);
  const [showHow, setShowHow] = useState(false);
  const [switchBusy, setSwitchBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [approveBusyId, setApproveBusyId] = useState(null);
  const [approveError, setApproveError] = useState(null);
  const [creditPanel, setCreditPanel] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [creditMenuOpen, setCreditMenuOpen] = useState(false);
  const creditBtnRef = useRef(null);
  const [creditMenuPos, setCreditMenuPos] = useState({ top: 0, left: 0 });

  const dark = resolved === 'dark';
  const { liveConfig, loading, error, refresh, alerts } = useLabLiveData(role);

  useEffect(() => {
    if (user?.role) setRole(roleToPersona(user.role));
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!NAV_BY_ROLE[role].includes(activeNav)) setActiveNav('overview');
    setCreditPanel(null);
    setSelectedBank(null);
    setCreditMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (!creditMenuOpen) return undefined;
    function place() {
      const el = creditBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCreditMenuPos({ top: r.bottom + 6, left: Math.max(8, r.left) });
    }
    place();
    function onKey(e) {
      if (e.key === 'Escape') setCreditMenuOpen(false);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [creditMenuOpen]);

  function openCreditMenu() {
    setActiveNav('credit');
    setCreditMenuOpen(true);
    requestAnimationFrame(() => {
      const el = creditBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCreditMenuPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 280)) });
    });
  }

  function toggleCreditMenu() {
    setCreditMenuOpen((open) => {
      if (open) return false;
      requestAnimationFrame(() => {
        const el = creditBtnRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setCreditMenuPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 280)) });
      });
      setActiveNav('credit');
      return true;
    });
  }

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const cfg = useMemo(() => mergeLiveConfig(role, liveConfig), [role, liveConfig]);
  const meta = ROLE_META[role];
  const RoleIcon = meta.icon;
  const isClient = role === 'client';

  if (!token) {
    return <Navigate to="/login?returnTo=/lab" replace />;
  }
  if (!canAccessLab(user)) {
    return <Navigate to={deskHome(user?.role)} replace />;
  }

  function handleCopy() {
    const w = user?.wallet || '';
    try { navigator.clipboard.writeText(w); } catch (e) { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function goTo(key) {
    if (key === 'credit') {
      toggleCreditMenu();
      return;
    }
    setCreditMenuOpen(false);
    setActiveNav(key);
    requestAnimationFrame(() => {
      document.getElementById('sec-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function signOut() {
    reset();
    navigate('/login');
  }

  function toggleTheme() {
    setPreference(dark ? 'light' : 'dark');
  }

  async function switchPersona(persona) {
    if (persona === role || switchBusy) return;
    setSwitchBusy(true);
    setToast(null);
    try {
      const res = await api.post('/api/auth/demo-lab/switch', { persona });
      setSession({ token: res.token, user: res.user });
      setRole(persona);
      setToast({ tone: 'ok', text: `Switched to ${ROLE_META[persona].label}` });
    } catch (err) {
      setToast({
        tone: 'err',
        text: err?.message || err?.error || 'Could not switch persona',
      });
    } finally {
      setSwitchBusy(false);
    }
  }

  async function handleApprove(item) {
    if (!item?.id) {
      setApproveError('Missing loan id');
      return;
    }
    if (role !== 'national' && role !== 'local') return;
    setApproveBusyId(item.id);
    setApproveError(null);
    try {
      await api.post(`/api/loans/${item.id}/approve`, { note: 'Lab approve' });
      await refresh();
      setToast({ tone: 'ok', text: `Approved ${item.name || item.id}` });
    } catch (err) {
      setApproveError(err?.message || err?.error || 'Approve failed');
    } finally {
      setApproveBusyId(null);
    }
  }

  function openOpsPanel(panel, bank = null) {
    setSelectedBank(bank);
    setCreditPanel(panel);
    setCreditMenuOpen(false);
    setActiveNav('credit');
    requestAnimationFrame(() => {
      document.getElementById('sec-ops')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleCreditAction(action) {
    const panel = typeof action === 'object' ? action.panel : null;
    if (panel) {
      openOpsPanel(panel, selectedBank);
      return;
    }
    setCreditMenuOpen(false);
  }

  function handleBankAction(action, bank) {
    openOpsPanel(action, bank);
  }

  function handleOpsDone(meta) {
    void refresh();
    if (meta?.openPanel) {
      openOpsPanel(meta.openPanel, meta.bank || selectedBank);
    }
  }

  function handleRequestLoan() {
    if (role === 'client') {
      goTo('borrow');
      return;
    }
    openOpsPanel('request');
  }

  const liveAlerts = alerts || [];

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
          --bg:#050508;
          --surface:#0C0C10;
          --surface-alt:#141418;
          --border:rgba(201,168,106,0.16);
          --ink:#F4EFE4;
          --muted:#A89F90;
          --faint:#6E675C;
          --accent:#C9A86A;
          --accent-strong:#EED6A3;
          --accent-soft:rgba(201,168,106,0.12);
          --on-accent:#1A1408;
          --brass:#D4AF37;
          --brass-soft:rgba(212,175,55,0.14);
          --gold-glow:rgba(201,168,106,0.38);
          --gold-line:rgba(201,168,106,0.22);
        }

        [data-theme="dark"] .bg-app {
          background:
            radial-gradient(ellipse 90% 55% at 50% -8%, rgba(201,168,106,0.09), transparent 58%),
            radial-gradient(ellipse 60% 40% at 100% 0%, rgba(212,175,55,0.05), transparent 45%),
            var(--bg);
        }
        [data-theme="dark"] .bg-surface {
          background: linear-gradient(165deg, rgba(201,168,106,0.04) 0%, transparent 42%), var(--surface);
          box-shadow: inset 0 1px 0 rgba(238,214,163,0.07);
        }
        [data-theme="dark"] .bg-surface-alt {
          background: linear-gradient(180deg, rgba(201,168,106,0.06) 0%, transparent 100%), var(--surface-alt);
        }
        [data-theme="dark"] header.bg-surface {
          background: linear-gradient(180deg, rgba(18,18,24,0.96) 0%, rgba(12,12,16,0.98) 100%);
          border-bottom-color: var(--gold-line);
          backdrop-filter: blur(14px);
          box-shadow: 0 1px 0 rgba(238,214,163,0.06), 0 8px 32px -12px rgba(0,0,0,0.65);
        }
        [data-theme="dark"] .rounded-xl.border-base.bg-surface,
        [data-theme="dark"] .rounded-lg.border-base {
          border-color: rgba(201,168,106,0.14);
        }
        [data-theme="dark"] .rounded-xl.border-base.bg-surface:hover {
          border-color: rgba(201,168,106,0.22);
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
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        [data-theme="dark"] .btn-primary,
        [data-theme="dark"] .btn-primary-sm {
          background: linear-gradient(180deg, #E8CF98 0%, #C9A86A 48%, #A8874A 100%);
          color: #1A1408;
          border: 1px solid rgba(238,214,163,0.35);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.22),
            0 4px 18px -6px var(--gold-glow);
        }
        [data-theme="dark"] .btn-primary:hover,
        [data-theme="dark"] .btn-primary-sm:hover {
          background: linear-gradient(180deg, #F5E4BC 0%, #D4B87A 52%, #B8944F 100%);
          color: #120E06;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.28),
            0 6px 22px -4px var(--gold-glow);
        }
        .btn-secondary { border: 1px solid var(--border); color: var(--ink); }
        .btn-secondary:hover { background: var(--surface-alt); }
        .btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }
        [data-theme="dark"] .btn-secondary,
        [data-theme="dark"] .btn-secondary-sm {
          border-color: rgba(201,168,106,0.22);
          background: rgba(201,168,106,0.04);
        }
        [data-theme="dark"] .btn-secondary:hover,
        [data-theme="dark"] .btn-secondary-sm:hover {
          background: rgba(201,168,106,0.1);
          border-color: rgba(201,168,106,0.32);
          color: var(--accent-strong);
        }
        .btn-primary-sm { background: var(--accent); color: var(--on-accent); }
        .btn-primary-sm:hover { background: var(--accent-strong); }
        .btn-primary-sm:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-secondary-sm { border: 1px solid var(--border); color: var(--muted); }
        .btn-secondary-sm:hover { background: var(--surface-alt); color: var(--ink); }

        .badge-active { background: var(--accent-soft); color: var(--accent-strong); }
        .badge-pending { background: var(--brass-soft); color: var(--brass); }
        .badge-inactive { background: var(--surface-alt); color: var(--muted); }
        [data-theme="dark"] .badge-active {
          background: rgba(201,168,106,0.16);
          color: var(--accent-strong);
          border: 1px solid rgba(201,168,106,0.24);
        }
        [data-theme="dark"] .badge-pending {
          background: rgba(212,175,55,0.14);
          color: #EED6A3;
          border: 1px solid rgba(212,175,55,0.28);
        }

        .chip-dashed { border: 1px dashed var(--border); }
        [data-theme="dark"] .chip-dashed {
          border-color: rgba(201,168,106,0.2);
          background: rgba(201,168,106,0.03);
        }

        .nav-tab-active { border-color: var(--accent); color: var(--accent-strong); }
        .nav-tab-inactive { border-color: transparent; color: var(--muted); }
        .nav-tab-inactive:hover { color: var(--ink); }
        [data-theme="dark"] .nav-tab-active {
          border-color: var(--accent);
          color: var(--accent-strong);
          background: rgba(201,168,106,0.08);
        }
        [data-theme="dark"] .nav-tab-inactive:hover { color: var(--accent-strong); }

        .info-dot { border-color: var(--faint); color: var(--faint); }
        .info-dot:hover { color: var(--ink); border-color: var(--muted); }
        .tooltip-pop { background: var(--surface); border-color: var(--border); color: var(--muted); transform: translateX(-50%); }

        .stamp-past { border-color: var(--accent); color: var(--accent-strong); background: var(--accent-soft); }
        .stamp-current { border-color: var(--accent-strong); color: var(--on-accent); background: var(--accent); transform: rotate(-4deg); box-shadow: 0 0 0 3px var(--accent-soft); }
        .stamp-future { border-style: dashed; border-color: var(--border); color: var(--faint); background: transparent; }
        .trail-line-past { background: var(--accent); opacity: 0.4; }
        .trail-line-future { background: var(--border); }
        [data-theme="dark"] .stamp-current {
          background: linear-gradient(180deg, #EED6A3 0%, #C9A86A 100%);
          color: #1A1408;
          box-shadow: 0 0 0 3px rgba(201,168,106,0.2), 0 4px 16px -4px var(--gold-glow);
        }
        [data-theme="dark"] .trail-line-past { opacity: 0.55; }

        .hover-row:hover { background: var(--surface-alt); }
        [data-theme="dark"] .hover-row:hover { background: rgba(201,168,106,0.06); }
        .row-tip {
          display: none;
          position: absolute;
          left: 1.25rem;
          bottom: calc(100% - 0.15rem);
          z-index: 30;
          width: min(22rem, 80vw);
          padding: 0.75rem 0.9rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: 0 12px 28px rgba(16, 24, 20, 0.14);
          pointer-events: none;
        }
        [data-theme="dark"] .row-tip {
          border-color: rgba(201,168,106,0.22);
          box-shadow: 0 16px 40px -8px rgba(0,0,0,0.75), 0 0 0 1px rgba(201,168,106,0.08);
        }
        tr.bank-row:hover .row-tip { display: block; }
        .credit-menu {
          position: fixed;
          z-index: 80;
          min-width: 17rem;
          max-width: min(22rem, calc(100vw - 1rem));
          padding: 0.4rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: 0 14px 32px rgba(16, 24, 20, 0.18);
        }
        [data-theme="dark"] .credit-menu {
          border-color: rgba(201,168,106,0.24);
          background: linear-gradient(180deg, #141418 0%, #0C0C10 100%);
          box-shadow: 0 20px 48px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,106,0.1);
        }
        .credit-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          text-align: left;
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink);
        }
        .credit-menu-item:hover { background: var(--surface-alt); }
        .credit-menu-item-active { background: var(--accent); color: var(--on-accent); }
        .credit-menu-item-active:hover { background: var(--accent-strong); color: var(--on-accent); }
        [data-theme="dark"] .credit-menu-item:hover { background: rgba(201,168,106,0.1); }
        [data-theme="dark"] .credit-menu-item-active {
          background: linear-gradient(180deg, #EED6A3 0%, #C9A86A 100%);
          color: #1A1408;
        }
        [data-theme="dark"] .credit-menu-item-active:hover {
          background: linear-gradient(180deg, #F5E4BC 0%, #D4B87A 100%);
          color: #120E06;
        }

        .modal-backdrop { background: rgba(10, 15, 12, 0.55); }
        [data-theme="dark"] .modal-backdrop { background: rgba(2, 2, 4, 0.78); }
        .progress-track { background: var(--surface-alt); }
        .progress-fill { background: var(--accent); }
        [data-theme="dark"] .progress-fill {
          background: linear-gradient(90deg, #A8874A 0%, #EED6A3 50%, #C9A86A 100%);
        }
        [data-theme="dark"] .font-mono-data.text-2xl { color: var(--accent-strong); }
        [data-theme="dark"] .text-accent { color: var(--accent-strong); }
        [data-theme="dark"] .bg-accent-soft { background: rgba(201,168,106,0.12); }
        [data-theme="dark"] .bg-brass-soft {
          background: rgba(212,175,55,0.1);
          border-color: rgba(212,175,55,0.2);
        }
        [data-theme="dark"] .tooltip-pop {
          border-color: rgba(201,168,106,0.2);
          box-shadow: 0 12px 32px -8px rgba(0,0,0,0.7);
        }

        button:focus-visible, a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        [data-theme="dark"] button:focus-visible,
        [data-theme="dark"] a:focus-visible { outline-color: var(--accent-strong); }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {openTip && <div className="fixed inset-0 z-40" onClick={() => setOpenTip(null)} />}
      {creditMenuOpen && (
        <div
          className="fixed inset-0 z-[70]"
          onClick={() => setCreditMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      {showHow && <HowItWorksModal onClose={() => setShowHow(false)} />}

      {toast && (
        <div
          className={`fixed top-4 right-4 z-[90] max-w-sm rounded-lg border px-3.5 py-2.5 text-sm shadow-lg ${
            toast.tone === 'err' ? 'bg-surface border-base text-brass' : 'bg-surface border-base text-ink'
          }`}
          role="status"
        >
          {toast.text}
        </div>
      )}

      {/* ---------------- Top bar ---------------- */}
      <header className="sticky top-0 z-30 bg-surface border-b border-base">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center btn-primary">
              <Landmark size={17} />
            </div>
            <div>
              <div className="font-display font-semibold text-base leading-tight">
                Crypto World Bank <span className="text-accent">Lab</span>
              </div>
              <div className="text-xs text-faint leading-tight">{meta.label}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="rounded-md p-2 text-muted hover:text-ink hover:bg-surface-alt transition-colors" aria-label="Toggle dark mode">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={signOut} className="btn-secondary-sm hidden sm:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        <div className="border-t border-base">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 flex-wrap">
            {NAV_BY_ROLE[role].map((key) => {
              const { icon: Icon, label } = navMeta(key, role);
              const active = key === activeNav || (key === 'credit' && creditPanel);
              const isCredit = key === 'credit' && !isClient;

              if (isCredit) {
                return (
                  <button
                    key={key}
                    ref={creditBtnRef}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={creditMenuOpen}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCreditMenu();
                    }}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${active || creditMenuOpen ? 'nav-tab-active' : 'nav-tab-inactive'}`}
                  >
                    <Icon size={14} /> {label}
                    <ChevronDown size={13} className={`transition-transform ${creditMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                );
              }

              return (
                <button
                  key={key}
                  type="button"
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

      {creditMenuOpen && !isClient && (
        <div
          className="credit-menu"
          role="menu"
          style={{ top: creditMenuPos.top, left: creditMenuPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 pt-1.5 pb-2 border-b border-base mb-1">
            <div className="text-xs font-medium text-ink">Credit &amp; capital</div>
            <p className="text-[11px] text-muted leading-snug mt-0.5">
              {cfg.creditDesc || 'Capital, facilities, and treasury tools.'}
            </p>
          </div>
          {(cfg.creditActions || []).map((a) => {
            const itemLabel = creditActionLabel(a);
            const panel = typeof a === 'object' ? a.panel : null;
            const itemActive = panel && panel === creditPanel;
            return (
              <button
                key={itemLabel}
                type="button"
                role="menuitem"
                onClick={() => handleCreditAction(a)}
                className={`credit-menu-item ${itemActive ? 'credit-menu-item-active' : ''}`}
              >
                <span>{itemLabel}</span>
                <ChevronRight size={14} />
              </button>
            );
          })}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ---------------- Demo role switcher ---------------- */}
        <div className="chip-dashed rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted">
            <span className="font-medium text-ink">Demo mode.</span> Preview the dashboard as any tier in the network.
            {switchBusy && <span className="ml-2 text-faint">Switching…</span>}
          </div>
          <div className="flex items-center flex-wrap gap-1.5">
            {ROLE_ORDER.map((r) => {
              const m = ROLE_META[r];
              const Icon = m.icon;
              const active = r === role;
              return (
                <button
                  key={r}
                  type="button"
                  disabled={switchBusy}
                  onClick={() => switchPersona(r)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${active ? 'btn-primary border-transparent' : 'btn-secondary'}`}
                >
                  <Icon size={12} /> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-base bg-surface px-4 py-3 text-sm text-muted flex items-center gap-2">
            <RefreshCw size={14} className="animate-spin text-accent" /> Loading live lab data…
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-base bg-surface px-4 py-3 text-sm text-brass flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Could not load live data</div>
              <div className="text-xs text-muted mt-0.5">{error?.message || String(error)}</div>
              <button type="button" onClick={() => refresh()} className="mt-2 text-xs font-medium text-accent">
                Retry
              </button>
            </div>
          </div>
        )}

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
                  onClick={() => {
                    if (a.target === 'borrow' && a.label.toLowerCase().includes('request')) {
                      handleRequestLoan();
                      return;
                    }
                    if (a.target === 'credit') {
                      openCreditMenu();
                      return;
                    }
                    goTo(a.target);
                  }}
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
              const Icon = k.icon || Coins;
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
            onRefresh={refresh}
            setToast={setToast}
            homeBankId={user?.bankId || liveConfig?.homeBankId}
          />
        ) : (
          <InstitutionalSections
            cfg={cfg}
            role={role}
            openTip={openTip}
            setOpenTip={setOpenTip}
            onApprove={handleApprove}
            onRefresh={refresh}
            onBankAction={handleBankAction}
            approveBusyId={approveBusyId}
            approveError={approveError}
          />
        )}

        {!isClient && creditPanel && (
          <LabOpsPanels
            role={role}
            panel={creditPanel}
            bank={selectedBank}
            banks={(cfg.roster || []).filter((r) => r.id && !String(r.id).startsWith('q-'))}
            availableToAllocate={cfg.availableToAllocate}
            onClose={() => {
              setCreditPanel(null);
              setSelectedBank(null);
            }}
            onDone={handleOpsDone}
            setToast={setToast}
          />
        )}

        {/* ---------------- Alerts ---------------- */}
        {!isClient && (
          <section id="sec-alerts" className="rounded-xl border border-base bg-surface p-5">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={15} className="text-brass" />
              <h2 className="font-display text-sm font-semibold">Compliance alerts</h2>
              <InfoDot id="alerts-tip" text={GLOSSARY.sar} openTip={openTip} setOpenTip={setOpenTip} />
            </div>
            <p className="text-xs text-muted mb-4">Flags raised automatically when an account shows unusual activity.</p>
            {liveAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="h-10 w-10 rounded-full flex items-center justify-center mb-3 bg-accent-soft">
                  <CheckCircle2 size={17} className="text-accent" />
                </div>
                <div className="text-sm font-medium">All clear</div>
                <p className="mt-1 text-xs text-muted max-w-xs">Nothing needs review right now.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {liveAlerts.slice(0, 8).map((a) => (
                  <div key={a.id || a.sarRef} className="flex items-center justify-between gap-2 rounded-lg border border-base px-3.5 py-2.5">
                    <div>
                      <div className="text-sm font-medium">{a.clientName || a.id}</div>
                      <div className="text-xs text-muted">{a.sarRef || a.status || 'SAR'} · {a.severity || a.reason || '—'}</div>
                    </div>
                    <span className="badge-pending inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium">
                      {a.status || 'OPEN'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ---------------- Settings / account ---------------- */}
        <section id="sec-settings" className="rounded-xl border border-base bg-surface p-5">
          <h2 className="font-display text-sm font-semibold mb-4">Account</h2>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 flex-wrap">
            <div>
              <div className="text-xs text-muted mb-1">Display name</div>
              <div className="text-sm font-medium">{user?.displayName || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Role</div>
              <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium bg-surface-alt">
                <Check size={12} className="text-accent" /> {user?.role || meta.badge}
              </span>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Login ID</div>
              <div className="text-sm font-mono-data">{user?.loginId || user?.id || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Wallet address</div>
              <button onClick={handleCopy} className="btn-secondary-sm inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono-data transition-colors">
                {shortWallet(user?.wallet)} {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <div className="sm:ml-auto">
              <button type="button" onClick={signOut} className="btn-secondary-sm inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </section>

        {/* ---------------- Quick links ---------------- */}
        {cfg.quickLinks?.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-4">
            {cfg.quickLinks.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  if (String(l).toLowerCase().includes('alert')) goTo('alerts');
                  else if (String(l).toLowerCase().includes('reserve')) {
                    openCreditMenu();
                  } else goTo('overview');
                }}
                className="btn-secondary-sm inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors"
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ================================================================== */
/* Institutional layout: World / National / Local                      */
/* ================================================================== */

function InstitutionalSections({
  cfg,
  role,
  openTip,
  setOpenTip,
  onApprove,
  onRefresh,
  onBankAction,
  approveBusyId,
  approveError,
}) {
  const networkMeta = NETWORK_META[role];
  const canApprove = role === 'national' || role === 'local';
  const isClientRoster = cfg.rosterKind === 'clients' || role === 'local';
  const canManageRoster = role === 'world' || role === 'national' || isClientRoster;
  const [rosterQuery, setRosterQuery] = useState('');

  useEffect(() => {
    setRosterQuery('');
  }, [role, cfg.rosterTitle]);

  const filteredRoster = useMemo(() => {
    const rows = cfg.roster || [];
    const q = rosterQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        r.name,
        r.sub,
        r.status,
        r.col1,
        r.col2,
        r.id,
        r.specs?.loginId,
        r.specs?.wallet,
        r.specs?.bankName,
        r.specs?.kycStatus,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [cfg.roster, rosterQuery]);
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
          {approveError && (
            <div className="mb-3 rounded-lg border border-base px-3 py-2 text-xs text-brass flex items-center gap-1.5">
              <AlertTriangle size={12} /> {approveError}
            </div>
          )}
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
                <div key={item.id || item.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-base px-3.5 py-2.5">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted">{item.type} · {item.amount} · {item.submitted}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" className="btn-secondary-sm inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors">Review</button>
                    {canApprove && (
                      <button
                        type="button"
                        disabled={!!approveBusyId}
                        onClick={() => onApprove?.(item)}
                        className="btn-primary-sm inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
                      >
                        {approveBusyId === item.id ? 'Approving…' : 'Approve'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Loan book (credit tools live in top nav dropdown) ---------------- */}
      <section id="sec-credit" className="rounded-xl border border-base bg-surface p-5 space-y-5">
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
            <button
              type="button"
              onClick={() => onRefresh?.()}
              className="btn-secondary-sm inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            >
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
                    <div key={i.id || i.name} className="flex items-center justify-between text-sm rounded-lg border border-base px-3 py-2">
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
      </section>

      {/* ---------------- Network roster ---------------- */}
      {cfg.rosterTitle && (
        <section id="sec-network" className="rounded-xl border border-base bg-surface overflow-hidden">
          <div className="px-5 py-3.5 border-b border-base flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-sm font-semibold flex items-center gap-2">
              <networkMeta.icon size={15} className="text-accent" /> {cfg.rosterTitle}
              <span className="text-xs font-body font-normal text-muted">
                {rosterQuery.trim()
                  ? `${filteredRoster.length} of ${(cfg.roster || []).length}`
                  : `${(cfg.roster || []).length}`}
              </span>
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="relative flex-1 sm:w-72">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
                <input
                  type="search"
                  value={rosterQuery}
                  onChange={(e) => setRosterQuery(e.target.value)}
                  placeholder={
                    isClientRoster
                      ? 'Search clients by name, login ID, bank…'
                      : `Search ${String(cfg.rosterEntity || 'rows').toLowerCase()}…`
                  }
                  className="w-full rounded-lg border border-base bg-surface pl-8 pr-3 py-2 text-sm text-ink outline-none focus:border-[var(--accent)]"
                />
              </label>
              {canManageRoster && cfg.rosterCanManage !== false ? (
                <button
                  type="button"
                  onClick={() => onBankAction?.('manage', filteredRoster[0] || cfg.roster?.[0] || null)}
                  className="text-xs font-medium text-accent hover:opacity-80 shrink-0"
                >
                  Manage
                </button>
              ) : null}
            </div>
          </div>
          <div className="overflow-visible max-h-[32rem] overflow-y-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="sticky top-0 bg-surface z-[1]">
                <tr className="text-left text-xs border-b border-base text-faint">
                  <th className="px-5 py-2 font-medium">{cfg.rosterEntity}</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium">
                    <span className="inline-flex items-center gap-1">
                      {isClientRoster ? 'Activity' : 'Ratio'}{' '}
                      {!isClientRoster && (
                        <InfoDot id="ratio-tip" text={GLOSSARY[cfg.ratioTip]} openTip={openTip} setOpenTip={setOpenTip} />
                      )}
                    </span>
                  </th>
                  <th className="px-5 py-2 font-medium text-right">{cfg.rosterCols[0]}</th>
                  <th className="px-5 py-2 font-medium text-right">{cfg.rosterCols[1]}</th>
                  {canManageRoster && cfg.rosterCanManage !== false ? (
                    <th className="px-5 py-2 font-medium text-right">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted">
                      {rosterQuery.trim()
                        ? `No matches for “${rosterQuery.trim()}”.`
                        : `No ${String(cfg.rosterEntity || 'rows').toLowerCase()} found.`}
                    </td>
                  </tr>
                ) : (
                  filteredRoster.map((r) => {
                  const specs = r.specs || {};
                  return (
                    <tr key={r.id || r.name} className="hover-row bank-row border-t border-base relative">
                      <td className="px-5 py-3 relative">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted">{r.sub}</div>
                        {canManageRoster && r.specs ? (
                          <div className="row-tip text-xs text-muted space-y-1.5">
                            <div className="font-medium text-ink text-sm">{r.name}</div>
                            {isClientRoster || r.specs?.kind === 'client' ? (
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono-data">
                                <span>Login ID</span>
                                <span className="text-right text-ink">{r.specs.loginId || '—'}</span>
                                <span>Branch</span>
                                <span className="text-right text-ink">{r.specs.bankName || '—'}</span>
                                <span>Outstanding</span>
                                <span className="text-right text-ink">{shortMoneyTip(r.specs.reserve)}</span>
                                <span>Active loans</span>
                                <span className="text-right text-ink">{r.specs.activeLoanCount ?? 0}</span>
                                <span>Loan requests</span>
                                <span className="text-right text-ink">{r.specs.loanRequests ?? 0}</span>
                                <span>KYC</span>
                                <span className="text-right text-ink">{r.specs.kycStatus || '—'}</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono-data">
                                <span>Reserve</span>
                                <span className="text-right text-ink">{shortMoneyTip(specs.reserve)}</span>
                                <span>Available</span>
                                <span className="text-right text-ink">{shortMoneyTip(specs.available)}</span>
                                <span>Sent down</span>
                                <span className="text-right text-ink">{shortMoneyTip(specs.sentDown)}</span>
                                <span>Loan requests</span>
                                <span className="text-right text-ink">{specs.loanRequests ?? 0}</span>
                                <span>Capital requests</span>
                                <span className="text-right text-ink">{specs.capitalRequests ?? 0}</span>
                              </div>
                            )}
                            {specs.nearMinimum ? (
                              <div className="text-brass">Near minimum reserve ratio</div>
                            ) : null}
                          </div>
                        ) : null}
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
                      {canManageRoster && cfg.rosterCanManage !== false ? (
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex flex-wrap justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => onBankAction?.('manage', r)}
                              className="btn-secondary-sm rounded-md px-2 py-1 text-[11px] font-medium"
                            >
                              Manage
                            </button>
                            {!isClientRoster && r.specs?.kind !== 'client' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onBankAction?.('allocate', r)}
                                  className="btn-primary-sm rounded-md px-2 py-1 text-[11px] font-medium"
                                >
                                  Allocate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onBankAction?.('exchange', r)}
                                  className="btn-secondary-sm rounded-md px-2 py-1 text-[11px] font-medium"
                                >
                                  Exchange
                                </button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function shortMoneyTip(n) {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toFixed(v >= 100 ? 0 : 2);
}

/* ================================================================== */
/* Client layout                                                       */
/* ================================================================== */

function ClientSections({ cfg, openTip, setOpenTip, onRefresh, setToast, homeBankId }) {
  const loan = cfg.loanBook;
  const loanHistory = cfg.loanHistory?.length ? cfg.loanHistory : LOAN_HISTORY;
  const utilization =
    cfg.utilization != null
      ? Number(cfg.utilization)
      : parseFloat(cfg.kpis.find((k) => k.label === 'Utilization')?.value || '0');

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
            {loanHistory.map((l) => (
              <div key={l.name + (l.sub || '')} className="flex items-center justify-between rounded-lg border border-base px-3.5 py-2.5">
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
        <p className="text-xs text-muted mb-4">
          Request credit from your Local Bank, or repay an active loan by installment or in full.
        </p>
        <ClientBorrowPanel
          homeBankId={homeBankId || 'bank_lb_bangladesh_dhaka'}
          setToast={setToast}
          onDone={() => onRefresh?.()}
        />
      </section>
    </>
  );
}
