# Defence readiness audit — Crypto World Bank

**Date:** 2026-08-02  
**Sources:** `v38.tex` MVT + feature inventory; `Examples/frontend-development-plan.md` (47 pages); live FE/BE/Postgres/Hardhat.  
**Scope:** Core demo pages **1–43**. Stretch **44–47** not in build.

---

## Executive verdict

The prototype is **defence-demonstrable** for the Must / MVT story: four-tier hierarchy, retail loan lifecycle (JSON + contracts present), Authority Brief, gated agent, World/National/Local ops, groups, deposits UI, regulator audit, Postgres seed + audit logs.

Frame honestly: **hybrid persistence** (Prisma + `backend/.data/*.json`), **ML FastAPI optional** (`/api/risk/health` → `ok:false` when upstream down; brief still returns stub SHAP), **multisig console is off-chain JSON** alongside on-chain `GovernorMultisig2of3`, Sepolia indexer often **403** (non-blocking when Hardhat local is used).

---

## 1. MVT checklist (v38)

| # | MVT item | Status | Evidence / notes |
|---|----------|--------|------------------|
| 1 | Four-tier bank contracts | **Pass** | `WorldBankReserve`, `NationalBank`, `LocalBank`, `LoanController` + deploy script |
| 2 | Loan lifecycle E2E | **Partial** | API approve/reject/pay on JSON loans; on-chain path via LoanController; queue empty unless PENDING seeded |
| 3 | Reserve + borrowing limits | **Pass** | Limits enforced on create; reserve metrics on bank dashboards + public `/reserve` |
| 4 | ML RF+IF+stacking | **Partial** | `/api/risk` present; health fails without FastAPI — stub path used |
| 5 | SHAP + Authority Brief UI | **Pass** | `/api/brief/:loanId` + Local decision page |
| 6 | Risk assessment audit row | **Pass** | Postgres `AUDIT_LOGS` + synthetic `LOAN_RISK_ASSESSMENT` in regulator portal |
| 7 | Commit–reveal score gate | **Partial** | `/api/oracle/commit-reveal`; `/status/:loanId` errors on string JSON loan ids (needs on-chain numeric id) |
| 8 | BCCC fraud benchmark | **Partial** | Referenced in risk/brief docs; not re-validated in this smoke |
| 9 | 300-client sim / gas table | **Partial** | `/app/simulation` legacy route; Hardhat gas reporter deps present; Foundry-style archive incomplete |
| 10 | README reproduction | **Pass** | Root + PHASE1–3 / SEPOLIA docs |
| 11 | MCP agent 3–5 tools + gate | **Pass** | `/api/agent` + FE `/app/assistant`; `AgentActionLog` in PG (7 sessions) |
| 12 | LLM eval protocol | **N/A (Should)** | Not required for Must |
| 13 | Slither + Mythril | **Fail / missing artifacts** | No archived reports found in repo root docs |
| 14 | Foundry fuzz/invariants | **Fail / missing** | No `foundry.toml` in tree |
| 15 | Safe 2-of-3 World admin | **Partial** | Custom `GovernorMultisig2of3` + JSON `/bank/world/multisig` console (not Gnosis Safe UI) |
| 16 | Tenderly alerts | **N/A (Should)** | Not configured in demo |

---

## 2. Feature groups (high-level)

| Area | Status | Persistence |
|------|--------|-------------|
| Hierarchy / RBAC / personas | Pass | Postgres users + JWT |
| Public reserve transparency | Pass | Prisma `InstitutionCapital` |
| Onboarding KYC funnel | Pass | Postgres User KYC fields |
| Retail loans / installments | Pass (demo) | **JSON** `state.json` |
| Groups + consent | Pass | **Postgres** `LoanGroup*` |
| Deposits / FD / checking | Pass (demo) | **JSON** `deposits.json` (+ chain SavingsVault exists) |
| Credit passport | Pass (demo score) | API `/api/passport/me` demo source |
| Local / National / World ops | Pass | JSON ops + JSON banks tree |
| AML / SAR | Pass | `local-ops.json` |
| Regulator `/audit` | Pass | PG audits + ops SAR + read-only RBAC |
| Stretch FX / syndication / liquidation | **Not built** | — |

**Postgres snapshot (smoke):** 11 users, 9 institutions, 10 audit logs, 12 loan groups, 0 chain events (Sepolia 403), REGULATOR seeded.

---

## 3. Page inventory (Examples 1–43)

All core routes return SPA **200** via Vite. Functional API smoke (correct paths):

| Pages | Route prefix | FE shell | Primary APIs | Smoke |
|-------|--------------|----------|--------------|-------|
| 1–4 | `/`, `/about`, `/reserve`, `/login` | PublicShell (WBR) | public reserve | Pass |
| 5–9 | `/onboarding/*` | OnboardingShell | onboarding | Pass |
| 10–12 | `/app/dashboard|settings|notifications` | Client AppShell (WBR) | profile, notifications | Pass |
| 13–18 | `/app/loans/*` | WBR | `/api/loans/mine`, create, pay | Pass |
| 19–22 | `/app/groups/*` | WBR | `/api/groups/mine` | Pass (`grp_demo_wbr`) |
| 23–25 | savings / FD / checking | WBR | `/api/deposits/*` | Pass |
| 26 | `/app/passport` | WBR | `/api/passport/me` | Pass |
| 27–28 | `/app/assistant`, `/app/chat` | WBR | agent, chat threads | Pass |
| 29–34 | `/bank/local/*` | BankOperatorShell | local-bank/* | Pass (PENDING loan for #31) |
| 35–38 | `/bank/national/*` | NationalOperatorShell | national-bank/* | Pass |
| 39–42 | `/bank/world/*` | WorldOperatorShell | world-bank/* | Pass |
| 43 | `/audit` | RegulatorShell | audit/* | Pass; OWNER denied 403 |

**Stretch 44–47:** no real pages (SPA falls through to NotFound chrome but routes not implemented).

**Legacy AppLayout (non-plan):** `/app/banks`, `/app/admin`, `/app/risk`, `/app/simulation`, `/app/facilities`, `/app/market`, `/app/approvals`, `/app/multisig`, `/app/reserve` — old Tailwind sidebar chrome; **UI inconsistent** with Examples glass system.

---

## 4. UI consistency (Examples / design.md)

| Criterion | Core WBR pages (1–43) | Legacy AppLayout |
|-----------|----------------------|------------------|
| Void + glass, gold/signal | Yes (`.wbr-root`, glass cards) | No (Tailwind ink/gold cards) |
| Public pill nav / ops topbar + tab bar | Yes | Sidebar layout |
| Liquid/spring motion + reduced-motion | Present in global.css | Limited |
| Persistent regulator read-only banner | Yes on `/audit` | N/A |

**Recommendation for defence:** Demo only WBR routes (Sections A–L). Avoid navigating legacy `/app/banks` unless asked.

---

## 5. EVM / connectivity

- Hardhat `:8545` was up during audit; API also indexes Sepolia addresses → noisy **403** logs (non-fatal).  
- Prefer Hardhat + MockUSDC for live signing demos.  
- `chainEvents` count 0 under Sepolia 403 — use local chain for event sync demo if required.

---

## 6. Blockers fixed / residual

| Issue | Action |
|-------|--------|
| Empty local approval queue | Seeded `loan_defence_pending_demo` PENDING @ `bank_lb_dhaka` in `state.json` |
| Oracle status on JSON loan id | Residual **Partial** — use numeric on-chain loan id for commit–reveal demo |
| ML upstream down | Residual **Partial** — Authority Brief stub still works |
| Slither/Mythril/Foundry archives | Residual — generate before final defence if claiming MVT 13–14 |

No stretch FX work performed (out of scope).

---

## 7. Paper update recommendations

See companion section in this file below (do **not** edit `v38.tex` automatically).

---

## 8. SVG design pack

Generated under [`All current frontend designs/`](../All%20current%20frontend%20designs/) — **53 SVGs** + [`00-index.md`](../All%20current%20frontend%20designs/00-index.md).

- Live captures for pages **1–43** (+ group create/join variants + 3 legacy AppLayout pages)
- Stretch **44–47** placeholders
- Each SVG footer includes `http://127.0.0.1:5173…` route
- Regenerator: `All current frontend designs/svg generation/` (`./regenerate.sh` or `node …/capture-page-svgs.mjs`; uses system Chrome via Playwright)

---

## Paper update recommendations (for author — no TeX edits applied)

1. **UI scope:** State that the defence frontend implements **43 core screens** (Examples plan A–L) plus **4 stretch screens deferred**; the “8 wireframes” in the UI design subsection are illustrative, not the full page count.  
2. **MVT demo substitutes (already partly in paper — tighten status):** Hardhat `31337` + MockUSDC; commit–reveal relay vs Chainlink DON; custom `GovernorMultisig2of3` + ops console vs production Gnosis Safe; Node cron vs Chainlink Automation.  
3. **Hybrid persistence:** Document that Phase II retail loans, AML, national/world ops queues, and retail deposits currently use **append/update JSON stores under `backend/.data/`**, while institutions, users, groups, audit logs, and agent sessions use **PostgreSQL**. On-chain remains authoritative for capital/loan events when connected.  
4. **Regulatory access:** Explicitly map feature “regulatory audit access” to role **`REGULATOR`**, route **`/audit`**, and read-only API `/api/audit/*`.  
5. **Dual role enums:** Clarify `UserRole` (API/JWT) vs `BankUserRole` (institution staff) in the data chapter.  
6. **Update MVT table statuses** to Demonstrated / Partial / Deferred per Section 1 above (especially items 7, 13, 14, 15).  
7. **Mark Stretch/Future as out of defence build:** retail FX, treasury FX swap, syndicated/tranched loans, liquidation monitor, full 17-tool MCP, zkKYC, GraphSAGE.  
8. **Agent:** Confirm MVT is 3–5 tools + human gate (implemented), not the full suite.  
9. **Evaluation artifacts:** If claiming Slither/Mythril/Foundry, add appendix paths to archived reports or demote those checklist rows until reports exist.  
10. **Indexer:** Note Sepolia public RPC flakiness; demo path uses local Hardhat RPC for reliable event sync.
