import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatUsdc } from "@/lib/formatMoney";

export const LAB_PERSONAS = ["world", "national", "local", "client"];

function pct(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return (Number(n) * 100).toFixed(1);
}

function shortMoney(n) {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toFixed(v >= 100 ? 0 : 2);
}

function ago(iso) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(ms / 60000))}m ago`;
  if (h < 48) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isBangladeshBank(b) {
  const hay = `${b.id || ""} ${b.name || ""} ${b.jurisdiction || ""} ${b.city || ""}`.toLowerCase();
  return hay.includes("bangladesh") || hay.includes("dhaka") || hay.includes("_bd");
}

function sortRoster(list) {
  return [...list].sort((a, b) => {
    const pa = isBangladeshBank(a) ? 0 : 1;
    const pb = isBangladeshBank(b) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

function buildBankRow(b, { col1, col2, loanReqs = [], capitalReqs = [] }) {
  const capital = b.capital || {};
  const reserve = capital.reserveEth ?? b.reserve ?? 0;
  const available = capital.availableToAllocateEth ?? capital.availableEth ?? 0;
  const sentDown = b.totalAllocated ?? 0;
  const ratioPct = Number(((capital.reserveRatio || 0) * 100).toFixed(1));
  const pendingLoans = loanReqs.slice(0, 5).map((l) => ({
    id: l.id,
    amount: l.amount,
    kind: l.kind,
  }));
  return {
    id: b.id,
    name: b.name,
    sub: b.city || b.jurisdiction || "—",
    status: b.status || "ACTIVE",
    ratio: ratioPct,
    col1,
    col2,
    specs: {
      reserve,
      available,
      sentDown,
      ratioPct,
      nearMinimum: Boolean(capital.nearMinimum),
      loanRequests: loanReqs.length,
      capitalRequests: capitalReqs.length,
      pendingLoans,
      localBankCount: b.localBankCount,
      wallet: b.walletAddress,
    },
  };
}

/**
 * Loads live dashboard payloads for the active lab persona.
 */
export function useLabLiveData(persona) {
  const [data, setData] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loansMine, setLoansMine] = useState([]);
  const [deposits, setDeposits] = useState(null);
  const [loanQueue, setLoanQueue] = useState([]);
  const [capitalRequests, setCapitalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (persona === "world") {
        const [dash, sar, queue] = await Promise.all([
          api.get("/api/world-bank/dashboard"),
          api.get("/api/world-bank/sar?status=ESCALATED_WORLD").catch(() => ({ alerts: [] })),
          api.get("/api/loans/queue").catch(() => ({ loans: [] })),
        ]);
        setData(dash);
        setApprovals([]);
        setAlerts(sar.alerts || []);
        setLoansMine([]);
        setDeposits(null);
        setLoanQueue(queue.loans || []);
        setCapitalRequests([]);
      } else if (persona === "national") {
        const [dash, queue, sar, capital, loanQ] = await Promise.all([
          api.get("/api/national-bank/dashboard"),
          api.get("/api/national-bank/approvals").catch(() => ({ loans: [] })),
          api.get("/api/national-bank/sar").catch(() => ({ alerts: [] })),
          api.get("/api/national-bank/capital").catch(() => ({ requests: [] })),
          api.get("/api/loans/queue").catch(() => ({ loans: [] })),
        ]);
        setData(dash);
        setApprovals(queue.loans || queue.items || []);
        setAlerts(sar.alerts || []);
        setLoansMine([]);
        setDeposits(null);
        setLoanQueue(loanQ.loans || []);
        setCapitalRequests(
          (capital.requests || []).filter((r) => r.status === "OPEN" || !r.status),
        );
      } else if (persona === "local") {
        const [dash, queue, aml, clientsRes] = await Promise.all([
          api.get("/api/local-bank/dashboard"),
          api.get("/api/local-bank/approvals").catch(() => ({ loans: [] })),
          api.get("/api/local-bank/aml").catch(() => ({ alerts: [] })),
          // Lab: all clients under the same National (Bangladesh), not only this branch
          api.get("/api/local-bank/clients?scope=national").catch(() => ({ clients: [], totalCount: 0 })),
        ]);
        setData({
          ...dash,
          clients: {
            ...(dash.clients || {}),
            totalCount: clientsRes.totalCount ?? (clientsRes.clients || []).length,
            list: clientsRes.clients || dash.clients?.list || [],
            scope: clientsRes.scope || "national",
          },
        });
        setApprovals(queue.loans || queue.items || []);
        setAlerts(aml.alerts || []);
        setLoansMine([]);
        setDeposits(null);
        setLoanQueue([]);
        setCapitalRequests([]);
      } else {
        const [home, mine, dep] = await Promise.all([
          api.get("/api/profile/home"),
          api.get("/api/loans/mine").catch(() => ({ loans: [] })),
          api.get("/api/deposits/summary").catch(() => null),
        ]);
        setData(home);
        setApprovals([]);
        setAlerts([]);
        setLoansMine(mine.loans || []);
        setDeposits(dep);
        setLoanQueue([]);
        setCapitalRequests([]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [persona]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const liveConfig = useMemo(() => {
    if (!data) return null;

    if (persona === "world") {
      const capital = data.capital || {};
      const s = data.system || {};
      const nationals = sortRoster(data.nationalBanks || []);
      const requestsByBank = {};
      for (const l of loanQueue) {
        const key = l.bankRequesterId || l.borrowerBankId || l.borrowerId;
        if (!key) continue;
        if (!requestsByBank[key]) requestsByBank[key] = [];
        requestsByBank[key].push(l);
      }
      return {
        title: "World Bank dashboard",
        subtitle:
          "Approve National Bank credit lines, issue reserve, and keep global liquidity healthy.",
        availableToAllocate: capital.availableToAllocateEth ?? 0,
        kpis: [
          {
            label: "Sent to Nationals",
            value: shortMoney(data.bank?.totalAllocated),
            unit: "USDC",
            tip: "sentDown",
          },
          {
            label: "Reserve",
            value: shortMoney(capital.reserveEth),
            unit: "USDC",
            tip: "reserve",
          },
          {
            label: "Available to lend",
            value: shortMoney(capital.availableToAllocateEth),
            unit: "USDC",
            tip: "availableToLend",
          },
          {
            label: "Reserve ratio",
            value: pct(capital.reserveRatio),
            unit: "%",
            tip: "reserveRatio",
          },
        ],
        loanBook: [
          { label: "Active loans", value: String(s.activeLoanCount ?? 0) },
          { label: "Active value", value: formatUsdc(s.activeLoanValueEth) },
          { label: "Default rate", value: pct(s.defaultRate) + "%" },
          { label: "National banks", value: String(s.nationalCount ?? nationals.length) },
        ],
        workQueue: {
          items: [
            ...loanQueue.slice(0, 8).map((l) => ({
              id: l.id,
              name: l.borrowerName || l.bankRequesterId || l.id,
              type: l.kind === "NATIONAL_FROM_WORLD" ? "NB liquidity" : "Loan",
              amount: formatUsdc(l.amount),
              submitted: ago(l.createdAt || l.submittedAt),
            })),
            ...(alerts || []).slice(0, 4).map((a) => ({
              id: a.id,
              name: a.clientName || a.id,
              type: "World SAR",
              amount: a.sarRef || "—",
              submitted: ago(a.createdAt || a.updatedAt),
            })),
          ],
        },
        activeLoansList: nationals
          .filter((n) => (n.totalAllocated || 0) > 0)
          .slice(0, 6)
          .map((n) => ({
            name: n.name,
            amount: formatUsdc(n.totalAllocated),
            rate: pct(n.capital?.reserveRatio) + "% ratio",
          })),
        rosterTitle: "National banks in the network",
        rosterEntity: "National Bank",
        rosterCols: ["Sent down", "Reserve"],
        roster: nationals.map((n) =>
          buildBankRow(n, {
            col1: shortMoney(n.totalAllocated),
            col2: shortMoney(n.capital?.reserveEth ?? n.reserve),
            loanReqs: requestsByBank[n.id] || [],
          }),
        ).map((row) => {
          const src = nationals.find((n) => n.id === row.id);
          if (!src) return row;
          return {
            ...row,
            sub: `${row.sub}${src.localBankCount != null ? ` · ${src.localBankCount} locals` : ""}`,
          };
        }),
        creditDesc:
          "Interbank lending, reserve issuance, currency exchange, and capital sent to National Banks.",
        creditActions: [
          { label: "Facilities desk", panel: "facilities" },
          { label: "Treasury FX", panel: "exchange" },
          { label: "Allocate capital", panel: "allocate" },
          { label: "Governance", panel: "governance" },
        ],
      };
    }

    if (persona === "national") {
      const capital = data.capital || {};
      const j = data.jurisdiction || {};
      const locals = sortRoster(data.localBanks || []);
      const loanByBank = {};
      for (const l of [...loanQueue, ...approvals]) {
        const key = l.bankRequesterId || l.borrower?.bankId;
        if (!key) continue;
        if (!loanByBank[key]) loanByBank[key] = [];
        loanByBank[key].push(l);
      }
      const capByBank = {};
      for (const r of capitalRequests) {
        const key = r.fromBankId || r.bankId;
        if (!key) continue;
        if (!capByBank[key]) capByBank[key] = [];
        capByBank[key].push(r);
      }
      return {
        title: `${data.bank?.name || "Bangladesh National Bank"} dashboard`,
        subtitle:
          "Approve credit for clients and Local Banks, and manage capital across the country.",
        availableToAllocate: capital.availableToAllocateEth ?? 0,
        kpis: [
          {
            label: "Sent to Locals",
            value: shortMoney(data.bank?.totalAllocated),
            unit: "USDC",
            tip: "sentDown",
          },
          {
            label: "Reserve",
            value: shortMoney(capital.reserveEth),
            unit: "USDC",
            tip: "reserve",
          },
          {
            label: "Available to lend",
            value: shortMoney(capital.availableToAllocateEth),
            unit: "USDC",
            tip: "availableToLend",
          },
          {
            label: "Reserve ratio",
            value: pct(capital.reserveRatio),
            unit: "%",
            tip: "reserveRatio",
          },
        ],
        loanBook: [
          { label: "Active loans", value: String(j.activeLoanCount ?? 0) },
          { label: "Active value", value: formatUsdc(j.activeLoanValueEth) },
          { label: "Default rate", value: pct(j.defaultRate) + "%" },
          { label: "Local banks", value: String(j.localBankCount ?? locals.length) },
        ],
        workQueue: {
          items: (approvals || []).slice(0, 12).map((l) => ({
            id: l.id,
            name: l.borrowerName || l.borrower?.displayName || l.id,
            type: l.kind === "BANK" || String(l.kind || "").includes("LOCAL") ? "LB liquidity" : "Client loan",
            amount: formatUsdc(l.amount),
            submitted: ago(l.createdAt || l.submittedAt),
          })),
        },
        activeLoansList: [],
        rosterTitle: "Local banks in Bangladesh",
        rosterEntity: "Local Bank",
        rosterCols: ["Book", "Reserve"],
        roster: locals.map((lb) =>
          buildBankRow(lb, {
            col1: shortMoney(lb.loanBook?.activeValueEth),
            col2: shortMoney(lb.reserve ?? lb.capital?.reserveEth),
            loanReqs: loanByBank[lb.id] || [],
            capitalReqs: capByBank[lb.id] || [],
          }),
        ),
        creditDesc:
          "Interbank lending, upward deposits to World Bank, treasury FX, and capital to Local Banks.",
        creditActions: [
          { label: "Facilities desk", panel: "facilities" },
          { label: "Treasury FX", panel: "exchange" },
          { label: "Allocate capital", panel: "allocate" },
          { label: "Request from World", panel: "request" },
        ],
      };
    }

    if (persona === "local") {
      const capital = data.capital || {};
      const book = data.loanBook || {};
      const clientList = data.clients?.list || [];
      return {
        title: `${data.bank?.name || "Dhaka Local Bank"} dashboard`,
        subtitle:
          "Approve client loans, manage branch reserve, and request capital from the National Bank.",
        availableToAllocate: capital.availableEth ?? 0,
        kpis: [
          {
            label: "Sent to clients",
            value: shortMoney(book.activeValueEth),
            unit: "USDC",
            tip: "sentDown",
          },
          {
            label: "Reserve",
            value: shortMoney(capital.reserveEth),
            unit: "USDC",
            tip: "reserve",
          },
          {
            label: "Available to lend",
            value: shortMoney(capital.availableEth),
            unit: "USDC",
            tip: "availableToLend",
          },
          {
            label: "Reserve ratio",
            value: pct(capital.reserveRatio),
            unit: "%",
            tip: "reserveRatio",
          },
        ],
        loanBook: [
          { label: "Active loans", value: String(book.activeCount ?? 0) },
          { label: "Active value", value: formatUsdc(book.activeValueEth) },
          { label: "Delinquency", value: pct(book.delinquencyRate) + "%" },
          {
            label: "Clients",
            value: String(data.clients?.totalCount ?? data.clients?.activeCount ?? clientList.length),
          },
        ],
        workQueue: {
          items: (approvals || []).slice(0, 12).map((l) => ({
            id: l.id,
            name: l.borrowerName || l.borrower?.displayName || l.id,
            type: "Loan approval",
            amount: formatUsdc(l.amount),
            submitted: ago(l.createdAt || l.submittedAt),
          })),
        },
        activeLoansList: (book.upcomingMaturities || []).slice(0, 6).map((m) => ({
          name: m.id,
          amount: formatUsdc(m.amount),
          rate: m.deadline ? new Date(m.deadline).toLocaleDateString() : "—",
        })),
        rosterTitle:
          data.clients?.scope === "national"
            ? "Clients in Bangladesh (all local banks)"
            : `Clients at ${data.bank?.name || "this branch"}`,
        rosterEntity: "Client",
        rosterCols: ["Outstanding", "KYC"],
        rosterKind: "clients",
        roster: clientList.map((c) => ({
          id: c.id,
          name: c.name || c.loginId || c.id,
          sub: [c.loginId, c.bankName].filter(Boolean).join(" · ") || c.country || "Client",
          status: c.status || "INACTIVE",
          ratio: c.pendingLoanCount
            ? Math.min(100, Number(c.pendingLoanCount) * 25)
            : c.activeLoanCount
              ? 100
              : 0,
          col1: shortMoney(c.outstandingUsdc),
          col2: c.kycStatus || "—",
          specs: {
            reserve: c.outstandingUsdc || 0,
            available: 0,
            sentDown: c.outstandingUsdc || 0,
            ratioPct: 0,
            nearMinimum: false,
            loanRequests: c.pendingLoanCount || 0,
            capitalRequests: 0,
            pendingLoans: [],
            kycStatus: c.kycStatus,
            activeLoanCount: c.activeLoanCount || 0,
            wallet: c.wallet,
            loginId: c.loginId,
            bankName: c.bankName,
            kind: "client",
          },
        })),
        creditDesc: "Client lending, upward deposits to National, and treasury FX.",
        creditActions: [
          { label: "Facilities desk", panel: "facilities" },
          { label: "Treasury FX", panel: "exchange" },
          { label: "Request from National", panel: "request" },
        ],
      };
    }

    // client
    const limits = data.limits || {};
    const credit = data.credit || {};
    const used = limits?.sixMonth?.borrowed ?? 0;
    const cap = limits?.sixMonth?.limit ?? 5;
    const util = cap > 0 ? Math.round((used / cap) * 1000) / 10 : 0;
    const active = loansMine.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED");
    const outstanding = active.reduce(
      (s, l) => s + (Number(l.outstandingEth ?? l.amount) || 0),
      0,
    );
    const next = data.loans?.nextPayment;
    return {
      title: "Your account",
      subtitle: "Track balances, manage loans, and request credit — live from the CWB API.",
      kpis: [
        { label: "Checking USDC", value: shortMoney(deposits?.checkingUsdc ?? 0), unit: "USDC" },
        { label: "Active loan", value: shortMoney(outstanding), unit: "USDC" },
        { label: "Credit limit", value: shortMoney(cap), unit: "USDC" },
        { label: "Utilization", value: String(util), unit: "%", tip: "utilization" },
      ],
      loanBook: [
        { label: "Active loans", value: String(active.length) },
        { label: "Outstanding", value: formatUsdc(outstanding) },
        {
          label: "Next payment",
          value: next
            ? `${formatUsdc(next.amount)} · ${new Date(next.dueDate).toLocaleDateString()}`
            : "None",
        },
        { label: "Risk tier", value: credit.riskTier || "Bronze" },
      ],
      loanHistory: loansMine.slice(0, 8).map((l) => ({
        name: l.id,
        sub: l.status,
        amount: formatUsdc(l.amount ?? l.outstandingEth),
        status:
          l.status === "ACTIVE" || l.status === "APPROVED"
            ? "ACTIVE"
            : l.status === "PENDING"
              ? "PENDING"
              : "INACTIVE",
      })),
      utilization: util,
      creditDesc: null,
      creditActions: [],
      workQueue: { items: [] },
      activeLoansList: active.slice(0, 4).map((l) => ({
        name: l.id,
        amount: formatUsdc(l.outstandingEth ?? l.amount),
        rate: l.apr != null ? `${(Number(l.apr) * 100).toFixed(1)}%` : "—",
      })),
      rosterTitle: null,
      roster: [],
    };
  }, [persona, data, approvals, alerts, loansMine, deposits, loanQueue, capitalRequests]);

  return {
    liveConfig,
    loading,
    error,
    refresh,
    approvals,
    alerts,
    data,
    deposits,
    loansMine,
  };
}
