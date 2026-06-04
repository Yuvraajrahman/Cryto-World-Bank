# Diagram Update Plan for Pre-thesis v29

**Synced with:** `updated_diagram_integration_in_latex.md`, `diagram upgrades for each chapter to be made.md`  
**Thesis source:** `Documentation/2nd Phase (Bokhtiar)/Improvements/Pre-thesis_v29_final.tex`  
**Output root (diagram sessions 2–5):** `Documentation/2nd Phase (Bokhtiar)/Improvements/v29/`  
**Legacy fork source:** `Documentation/2nd Phase (Bokhtiar)/Improvements/Diagrams/mermaid-src/improved diagrams/`

---

## A. Document control

| Field | Value |
|-------|--------|
| Plan version | 1.1 — Sessions 1–5 complete |
| Date | 4 June 2026 |
| Existing figures in `.tex` | 32 |
| Figures to UPDATE (substantive) | 22 |
| Figures OK (minor only) | 4 (see D4.13; treat `fig-sdlc-agile` / `fig-banking-modules` as UPDATE for phase labels) |
| NEW figures | 18 |
| Explicit placeholder (no PDF) | 1 — oracle at ~line 1534 |
| **Total diagram deliverables** | **50** (32 refresh + 18 new) |

### Five-session map

| Session | Scope | Deliverable |
|---------|--------|-------------|
| **1** (complete) | Planning only | This file + `updated_diagram_integration_in_latex.md` |
| **2** (complete) | Chapter 3 | 33 `.mmd` + PDFs (incl. `fig-seq-chat-chatbot` alias) |
| **3** (complete) | Chapter 4 | 12 `.mmd` + PDFs |
| **4** (complete) | Chapter 5 | 4 `.mmd` + PDFs (2 charts) |
| **5** (complete) | Ch1, Ch2, Appendix | 11 `.mmd` + PDFs |

**Entry rule:** Before each session, re-read this file’s checklist for that session. Tick items in **Changelog** (Section I) when PDFs render.

**PDF policy:** v29-only until LaTeX integration — do not copy to `Diagrams/mermaid-pdf/improved diagrams/` until user requests `.tex` update.

---

## B. Global style contract (mandatory for sessions 2–5)

All `.mmd` files MUST conform to this contract. Copy `mmdc-config.json`, `mmdc-charts-config.json`, `mmdc-puppeteer.json` from `Diagrams/` into `v29/` in Session 2.

### Palette (from `Diagrams/mmdc-config.json`)

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#FFFFFF` | Canvas |
| Primary fill | `#F2F2F2` | Main nodes |
| Secondary fill | `#E2E2E2` | Alternate nodes |
| Tertiary / cluster | `#FAFAFA` | Subgraph backgrounds |
| Text | `#111111` | Labels |
| Border | `#1F1F1F` | All boxes, actors |
| Lines | `#3F3F3F` | Edges (theme also forces `#1F1F1F` strokes) |

No colour accents (no blue/green/red fills). Charts `fig-revenue-by-tier`, `fig-apr-spread` use `mmdc-charts-config.json` + B&W SVG post-process per `build-improved-diagrams.sh`.

### Typography

- **Font:** Inter, Helvetica Neue, Helvetica, Arial (ACM-adjacent sans-serif).
- **Weight:** 500 on labels via themeCSS.
- **Titles:** Front matter `--- title: ... ---` on every file.

### Notation

| Symbol | Meaning |
|--------|---------|
| Solid border / solid edge | Implemented (Phase I) or live path |
| Dashed border / dashed edge | Planned (Phase II–III) or fallback path |
| Badge `I` / `II` / `III` / `IV` | Implementation phase |
| `3/15` on contract boxes | Three implemented, twelve planned |
| USDC | Default denomination on retail flows (not ETH) |

### Layout

- Prefer `flowchart TB` or `LR`; `sequenceDiagram` for interactions; `erDiagram` for ERD/EER.
- Max ~12 nodes per panel; split into (a)/(b) subgraphs if needed.
- Use `classDef` consistently:

```mermaid
classDef node fill:#F2F2F2,stroke:#1F1F1F,stroke-width:1.2px,color:#111111
classDef layer fill:#FAFAFA,stroke:#1F1F1F,stroke-width:1.4px,color:#111111
classDef planned fill:#FAFAFA,stroke:#1F1F1F,stroke-width:1px,color:#111111,stroke-dasharray:5 5
```

### Platform facts (canonical labels)

- **Tiers:** T1 World Bank Reserve → T2 National Bank → T3 Local Bank → T4 Client  
- **Contracts:** 15 modular (3 implemented, 12 planned)  
- **DB:** 20 PostgreSQL entities, 3NF  
- **Agent:** Qwen3-8B, 17 MCP tools, human confirmation gate, EIP-7702 session keys  
- **Oracles:** Chainlink Functions (primary), commit-reveal (fallback), Automation, Price Feeds, PoR, CCIP  
- **Networks:** Polygon zkEVM Cardona (retail), Ethereum Sepolia (institutional)  
- **ML:** RF + Isolation Forest + stacking meta-learner + SHAP  

---

## C. Master inventory

| ID | Basename (.mmd / .pdf) | Action | Session | LaTeX label | ~Line | Macro | Prio |
|----|------------------------|--------|---------|-------------|-------|-------|------|
| D1.01 | `fig-proposed-solution-overview` | NEW | 5 | `fig:proposed-solution` | 741 | OnePage | P1 |
| D1.02 | `fig-capital-flow-directions` | NEW | 5 | `fig:capital-flow-directions` | 802 | OnePage | P1 |
| D1.03 | `fig-five-stage-retail-funnel` | NEW | 5 | `fig:five-stage-funnel` | 2052 | OnePage | P2 |
| D1.04 | `fig-methodology-phase-roadmap` | NEW | 5 | `fig:methodology-roadmap` | 857 | OnePage | P2 |
| D1.05 | `fig-stablecoin-mica-positioning` | NEW | 5 | `fig:stablecoin-mica` | 887 | OnePage | P2 |
| D2.01 | `fig-prisma-review-flow` | NEW | 5 | `fig:prisma-flow` | ~1200 | OnePage | P2 |
| D2.02 | `fig-protocol-comparison-matrix` | NEW | 5 | `fig:protocol-matrix` | 1214 | OnePage | P2 |
| D2.03 | `fig-ftx-vs-onchain-reserves` | NEW | 5 | `fig:ftx-vs-por` | 1250 | OnePage | P2 |
| D3.01 | `fig-three-layer-arch` | UPDATE | 2 | `fig:three-layer-arch` | 1364 | OnePage | P0 |
| D3.02 | `fig-component-architecture` | UPDATE | 2 | `fig:component-diagram` | 1375 | OnePage | P0 |
| D3.03 | `fig-blockchain-stack` | UPDATE | 2 | `fig:blockchain-stack` | 1384 | OnePage | P0 |
| D3.04 | `fig-oracle-architecture` | NEW | 2 | `fig:oracle-architecture` | 1532 | OnePage | P0 |
| D3.05 | `fig-cross-chain-bridge-ccip` | NEW | 2 | `fig:bridge-ccip` | 2174 | OnePage | P1 |
| D3.06 | `fig-banking-modules` | UPDATE | 2 | `fig:banking-modules` | 2506 | OnePage | P1 |
| D3.07 | `fig-hierarchical-banking` | UPDATE | 2 | `fig:four-tier` | 2484 | OnePage | P1 |
| D3.08 | `fig-multi-entity-ops` | UPDATE | 2 | `fig:multi-entity-ops` | 2183 | OnePage | P1 |
| D3.09 | `fig-tier-model` | UPDATE | 2 | `fig:tier-model` | 2022 | OnePage | P1 |
| D3.10 | `fig-compliance-identity` | UPDATE | 2 | `fig:compliance-identity` | 1865 | OnePage | P1 |
| D3.11 | `fig-kinked-rate-curve` | NEW | 2 | `fig:kinked-rate` | 2073 | OnePage | P1 |
| D3.12 | `fig-liquidation-engine` | NEW | 2 | `fig:liquidation` | 2098 | OnePage | P1 |
| D3.13 | `fig-savings-vault-loop` | NEW | 2 | `fig:savings-vault-loop` | 2103 | OnePage | P1 |
| D3.14 | `fig-credit-passport-sbt` | NEW | 2 | `fig:credit-passport` | 2125 | OnePage | P1 |
| D3.15 | `fig-governance-dual-path` | NEW | 2 | `fig:governance-dual-path` | 2568 | OnePage | P2 |
| D3.16 | `fig-prototype-scope-matrix` | NEW | 2 | `fig:prototype-scope` | 1302 | OnePage | P2 |
| D3.17a | `fig-core-system-graph` | NEW split | 2 | `fig:core-system-graph` | 1543 | OnePage | P0 |
| D3.17b | `fig-erd-core` | UPDATE | 2 | `fig:erd` | 1572 | OnePage | P0 |
| D3.18 | `fig-erd-extended` | UPDATE | 2 | `fig:erd-extended` | 1579 | OnePage | P0 |
| D3.19 | `fig-eer-model` | UPDATE | 2 | `fig:eer` | 1589 | OnePage | P0 |
| D3.20 | `fig-defense-in-depth` | UPDATE | 2 | `fig:defense-in-depth` | 2693 | OnePage | P1 |
| D3.21 | `fig-security-controls` | UPDATE | 2 | `fig:security-controls` | 2700 | OnePage | P1 |
| D3.22 | `fig-usecase-actors` | UPDATE | 2 | `fig:usecase` | 2382 | OnePage | P0 |
| D3.23 | `fig-activity-lending` | UPDATE | 2 | `fig:act-lending` | 2393 | OnePage | P1 |
| D3.24 | `fig-activity-onboarding-id` | UPDATE | 2 | `fig:act-onboarding` | 2401 | OnePage | P1 |
| D3.25 | `fig-activity-aux` | UPDATE | 2 | `fig:act-aux` | 2409 | OnePage | P0 |
| D3.26 | `fig-activity-sar-aml` | NEW | 2 | `fig:sar-aml` | 2428 | OnePage | P1 |
| D3.27 | `fig-dfd-suite` | UPDATE | 2 | `fig:dfd-suite` | 2436 | OnePage | P1 |
| D3.28 | `fig-seq-loan-flow` | UPDATE | 2 | `fig:seq-loan-flow` | 2448 | OnePage | P1 |
| D3.29 | `fig-seq-installment-income` | UPDATE | 2 | `fig:seq-installment-income` | 2456 | OnePage | P1 |
| D3.30 | `fig-seq-banking-data` | UPDATE | 2 | `fig:seq-banking-data` | 2464 | OnePage | P1 |
| D3.31 | `fig-seq-agent-banking` | UPDATE (rename) | 2 | `fig:seq-chat-bot` | 2472 | OnePage | P0 |
| D3.32 | `fig-seq-agent-confirm-gate` | NEW | 2 | `fig:seq-confirm-gate` | — | OnePage | P1 |
| D4.01 | `fig-agile-process` | UPDATE | 3 | `fig:agile-process` | 2812 | OnePage | P1 |
| D4.02 | `fig-aiml-pipeline` | UPDATE | 3 | `fig:aiml-pipeline` | 2831 | OnePage | P0 |
| D4.03 | `fig-agent-six-step-pipeline` | NEW | 3 | `fig:agent-pipeline` | 2862 | OnePage | P0 |
| D4.04 | `fig-mcp-tool-server` | NEW | 3 | `fig:mcp-tools` | 2868 | OnePage | P0 |
| D4.05 | `fig-three-tier-prompt` | NEW | 3 | `fig:three-tier-prompt` | 2957 | OnePage | P1 |
| D4.06 | `fig-lifecycle-hook-middleware` | NEW | 3 | `fig:lifecycle-middleware` | 3112 | OnePage | P1 |
| D4.07 | `fig-realtime-dashboard` | UPDATE | 3 | `fig:realtime-dashboard` | 3256 | OnePage | P1 |
| D4.08 | `fig-tx-state-machine` | UPDATE | 3 | `fig:tx-state-machine` | 3278 | OnePage | P1 |
| D4.09 | `fig-sdlc-agile` | UPDATE | 3 | `fig:methodology-technical` | 3325 | OnePage | P1 |
| D4.10 | `fig-design-decisions` | UPDATE | 3 | `fig:design-decisions` | 3612 | OnePage | P1 |
| D4.11 | `fig-eip7702-session-scope` | NEW | 3 | `fig:eip7702-scope` | — | OnePage | P1 |
| D4.12 | `fig-abm-simulation-manifest` | NEW | 3 | `fig:abm-sim` | 3222 | OnePage | P1 |
| D5.01 | `fig-revenue-by-tier` | UPDATE | 4 | `fig:revenue-by-tier` | 4136 | HalfWidth | P1 |
| D5.02 | `fig-apr-spread` | UPDATE | 4 | `fig:apr-spread` | 4205 | HalfWidth | P1 |
| D5.03 | `fig-mica-genius-compliance-map` | NEW | 4 | `fig:mica-genius` | 4258 | OnePage | P2 |
| D5.04 | `fig-sylhet-accessibility-journey` | NEW | 4 | `fig:accessibility-journey` | 4360 | OnePage | P2 |
| D-A.01 | `fig-local-llm-compact` | UPDATE | 5 | `fig:local-llm-mermaid` | 4518 | OnePage | P0 |
| D-A.02 | `fig-local-llm` | UPDATE | 5 | `fig:local-llm-tikz` | 4525 | OnePage | P0 |
| D-A.03 | `fig-agent-safety-four-layers` | NEW | 5 | `fig:agent-safety-layers` | 4511 | OnePage | P1 |

**v29 paths:** `v29/mermaid-src/<basename>.mmd` → `v29/mermaid-pdf/<basename>.pdf`

**Legacy path (fork only):** `Diagrams/mermaid-src/improved diagrams/<basename>.mmd`

---

## D. Filename and label decisions (frozen)

| Topic | Decision |
|-------|----------|
| Three-layer file | **Keep** `fig-three-layer-arch` basename for LaTeX; diagram title = “Four-Layer Architecture”; caption already says four layers |
| ERD duplicate | **Split:** `fig-core-system-graph` (relationship graph only) + `fig-erd-core` (full attributes). Update line 1543 to use `fig-core-system-graph.pdf` at integration |
| Chat sequence | **New** `fig-seq-agent-banking.mmd`; at integration either replace `fig-seq-chat-chatbot.pdf` path or keep legacy filename as symlink/copy |
| Oracle | **New** `fig-oracle-architecture.mmd`; replaces prose `oracle_architecture.png` |
| `fig:local-llm-tikz` | Mermaid only today — rename label to `fig:local-llm-expanded` when editing `.tex` |
| D3.31 LaTeX | Still `\OnePageDiagram{fig-seq-chat-chatbot.pdf}` until integration; PDF content = agent banking |

---

## E. Per-chapter specifications

### Chapter 1 — Introduction (Session 5)

#### D1.01 `fig-proposed-solution-overview` — NEW, P1

**Must show:**
- Four tiers T1–T4 in hierarchy
- Six banking functions ring: deposit, credit, payment, risk, liquidity, ancillary
- Callouts: SyndicatedLoan, GroupLendingPool, IBLP, UpwardDeposit (dashed/planned ok)

**Done when:** Single-page flowchart; greyscale; readable at `\OnePageDiagram` scale.

#### D1.02 `fig-capital-flow-directions` — NEW, P1

**Must show:**
- Downward allocation (WB → NB → LB → Client)
- Same-tier IBLP horizontal flow
- Upward UpwardDepositFacility
- Label \(r_{\text{up}} < r_{\text{down}} - \delta\)

#### D1.03–D1.05 — NEW, P2

See audit table; funnel stages 1–5; Phase I–IV swimlane; USDC + MiCA/GENIUS positioning.

---

### Chapter 2 — Literature Review (Session 5)

#### D2.01 `fig-prisma-review-flow` — NEW, P2

PRISMA: identification → screening → included → synthesis themes (hierarchy, ML, inclusion, security).

#### D2.02–D2.03 — NEW, P2

Optional heatmap vs Table `tab:protocol-comparison`; FTX opaque vs CWB PoR (neutral tone).

---

### Chapter 3 — System Architecture (Session 2)

#### D3.01 `fig-three-layer-arch` — UPDATE, P0

**Must show:**
1. Four layers: Presentation, Smart-Contract, Off-Chain Services, **Chainlink Infrastructure**
2. Chainlink subgraph: Functions DON, Automation, Price Feeds, PoR, CCIP
3. Presentation: ERC-4337, Wagmi, agent widget
4. Off-chain: MCP Tool Server, Qwen3-8B, **20 entities** (not 15+)
5. Contracts: badge **3 implemented / 12 planned**

**Fork from:** `fig-three-layer-arch.mmd`

#### D3.02 `fig-component-architecture` — UPDATE, P0

**Must show:**
- MCP Tool Server (17 tools)
- Agent middleware: confirmation audit hook, injection scanner, toolset scoper
- Chainlink Automation & PoR separate from Functions
- PostgreSQL: 20 entities, 3NF
- Solid = prototype; dashed = planned
- All 15 contract boxes OR legend “3 live, 12 planned”

#### D3.03 `fig-blockchain-stack` — UPDATE, P0

**Must show:**
- L1: Polygon zkEVM Cardona + Ethereum Sepolia (remove Polygon PoS retail)
- L3: 20 tables
- L4: SSE agent stream, EIP-7702
- L2: LiquidationEngine as planned (dashed)

#### D3.04 `fig-oracle-architecture` — NEW, P0

**Must show:**
- Primary: ML service → Chainlink Functions DON → `commitRiskScore` on LoanController
- Fallback: commit-reveal FastAPI relay (dashed)
- Sidecars: Automation (installments), Price Feeds (BDT/USD, ETH/USD), PoR on WorldBankReserve
- Trust comparison: single relay vs DON

#### D3.05 `fig-cross-chain-bridge-ccip` — NEW, P1

CCIP; messages: reserve updates + SBT mirror only; loans single-chain per client.

#### D3.06 `fig-banking-modules` — UPDATE, P1

Six banking product contracts; phase badges I/II/III per module.

#### D3.07 `fig-hierarchical-banking` — UPDATE, P1

USDC amounts; bps/spreads; cascading repayment; IBLP + UpwardDeposit subgraphs.

#### D3.08 `fig-multi-entity-ops` — UPDATE, P1

Panels (a)–(f); `settlePartial`; NettingEngine default path; Phase II vs III labels.

#### D3.09 `fig-tier-model` — UPDATE, P1

USDC bands: 50 / 250 / 1k / 5k / 25k (T4); Credit Passport SBT link.

#### D3.10 `fig-compliance-identity` — UPDATE, P1

USDC KYC limits; Groth16 KYCVerifier; ERC-4337 Paymaster bootstrap (2 tx cap); zkAML planned vs KYC PoC.

#### D3.11–D3.16 — NEW

| ID | Key content |
|----|-------------|
| D3.11 | Kinked curve \(U^*\), \(r_0\), \(r_1\), \(r_2\); retail 80% vs IBLP 90% kink |
| D3.12 | Four HF variants + `liquidate()` bonus + hierarchical queue |
| D3.13 | SavingsVault loop; NetInterest split; ERC-4626 / ERC-7540 |
| D3.14 | SBT schema; `ICreditPassport.getScore()`; GDPR annotation |
| D3.15 | TimeLock 24–48h vs Security Council 4-of-7 |
| D3.16 | Optional ✅/⏳/○ from `tab:prototype-scope` |

#### D3.17a/b — ERD split, P0

**fig-core-system-graph (NEW file):**
- Relationship graph only; hierarchy + lending subgraph
- No duplicate of full attribute ERD

**fig-erd-core (UPDATE):**
- Add SESSIONS, AGENT_ACTION_LOG, INTEREST_RATE_TIER, ASSETS
- BORROWER → CLIENT annotation (planned rename)
- Footer: **20 entities**

#### D3.18 `fig-erd-extended` — UPDATE, P0

All multi-entity tables; FKs to LOAN/BANK_USER; optional `audit_logs`.

#### D3.19 `fig-eer-model` — UPDATE, P0

AGENT_ACTION_LOG → CHAT_MESSAGE confirmation FK; BANK_USER disjoint specialization.

#### D3.20–D3.21 — Security, P1

Defense-in-depth: agent controls L2, Chainlink Functions L3, Security Council L5. Security-controls: map to threat table (LLM01, blind signing, SAR freeze, `functionPaused`).

#### D3.22 `fig-usecase-actors` — UPDATE, P0

**Nine actors:** A1 Retail Client (single node with «includes» KYC sub-states OR three A1* stereotypes per Table `tab:actor-taxonomy`), A2–A4 bank admins, **A5 AI Agent**, A6 Regulator, **A7 Chainlink DON**, A8 Validator, A9 Auditor.

**New use cases:** agent write + confirmation, ML score commit, PoR read, SAR review, netting batch dispute.

**Do NOT** revert to seven legacy actors (Visitor, Borrower, Approver split).

#### D3.23–D3.25 — Activities, P0–P1

| ID | Updates |
|----|---------|
| D3.23 | SCORE_REVEALED gate, SBT on final installment, group pool branch, USDC |
| D3.24 | EIP-712, five-stage funnel, zkKYC vs full KYC |
| D3.25 | Panel (b): six-step agent pipeline (not QLoRA RAG) |

#### D3.26 `fig-activity-sar-aml` — NEW, P1

iForest → AI_ML_LOG → Kafka `aml-alert` → officer → `freezeAccount`.

#### D3.27 `fig-dfd-suite` — UPDATE, P1

agent_action_log, sessions, Chainlink DON external entity, ML Functions + commit-reveal paths.

#### D3.28–D3.30 — Sequences, P1

| ID | Updates |
|----|---------|
| D3.28 | Functions primary / commit-reveal fallback; Authority Brief; approver signs disbursement |
| D3.29 | Chainlink Automation `checkUpkeep`; income hash on-chain only |
| D3.30 | AggregatorV3Interface 8-dec BDT; ICreditPassport + rolling windows |

#### D3.31 `fig-seq-agent-banking` — UPDATE, P0

Replace chatbot narrative. Flow: SSE → 3-tier context → tool call → **HTTP 403 without confirmation** → MCP write → EIP-7702 sign → `agent_action_log`. Optional panel (a) bank WebSocket.

**Integration note:** `.tex` still references `fig-seq-chat-chatbot.pdf` — use that PDF basename OR update path at integration.

#### D3.32 `fig-seq-agent-confirm-gate` — NEW, P1

Sequence: middleware confirmation audit hook; independent of model output.

---

### Chapter 4 — Methodology (Session 3)

#### D4.01 `fig-agile-process` — UPDATE, P1

Phase I–IV deliverables; not sprint-only; MCP Phase II, Functions Phase III, Certora Phase IV.

#### D4.02 `fig-aiml-pipeline` — UPDATE, P0

Panel (b): Functions DON primary, commit-reveal fallback, stacking meta-learner, thresholds 0.4/0.7. Panel (a): 18+4 features, BCCC-DeFi.

#### D4.03 `fig-agent-six-step-pipeline` — NEW, P0

Swimlane: user → SSE → context → Q&A vs action → confirmation → MCP write → monitor tx.

#### D4.04 `fig-mcp-tool-server` — NEW, P0

9 read / 8 write tools; toolsets: `read_only`, `loan_actions`, `account_management`.

#### D4.05 `fig-three-tier-prompt` — NEW, P1

Stable / Context / Volatile + prefix cache note.

#### D4.06 `fig-lifecycle-hook-middleware` — NEW, P1

Injection scan → confirmation audit (II) → session key scope (III) → AML pre-check (IV).

#### D4.07–D4.10 — UPDATE, P1

| ID | Updates |
|----|---------|
| D4.07 | zkEVM Cardona; RiskScoreCommitted, FunctionPaused; SAR queue |
| D4.08 | Full backend states + frontend 5-state UX overlay |
| D4.09 | Foundry, Certora, 300-client sim, Tenderly |
| D4.10 | zkEVM vs Amoy, Functions vs relay, Qwen3 local vs API, USDC-first, EIP-7702 vs 4337-only |

#### D4.11–D4.12 — NEW, P1

EIP-7702 JSON scope (tools, 500 USDC cap, 24h TTL, revoke). ABM: 300 clients, 6 banks, SEED=42, manifest JSON → RQ4/RQ5.

---

### Chapter 5 — Market Analysis (Session 4)

#### D5.01 `fig-revenue-by-tier` — UPDATE, P1

USDC units; illustrative/simulation-backed footnote in diagram title or caption note.

#### D5.02 `fig-apr-spread` — UPDATE, P1

Kinked utilization vs APR if applicable; testnet assumptions label.

#### D5.03–D5.04 — NEW, P2

MiCA/GENIUS → CWB pool + PoR + audit_logs. Sylhet journey: mobile → Bengali agent → USDC loan → confirmation gate.

---

### Appendix — Technology Stack (Session 5)

#### D-A.01 `fig-local-llm-compact` — UPDATE, P0 (critical)

**Caption already correct; diagram must match:**
UI → Express SSE → context assembly → Qwen3-8B → read path | write path + confirmation → MCP → chain.

**Remove:** LM Studio-only path.

#### D-A.02 `fig-local-llm` — UPDATE, P0 (critical)

Add: ChromaDB RAG, MCP server, PostgreSQL (sessions, agent_action_log), EIP-7702 signer, injection scanner, 403 middleware.

#### D-A.03 `fig-agent-safety-four-layers` — NEW, P1

Four levels from prose §4511: tool schema, human gate, session key scope, injection + middleware.

---

## F. P0 implementation order (cross-session)

Execute within Session 2/3/5 as applicable:

1. **D3.04** Oracle (closes placeholder)
2. **D3.01–D3.03** Stack trilogy
3. **D-A.01–D-A.02** Agent diagrams (Session 5 but P0 — consider early pull into Session 3 if agent work batches)
4. **D3.22, D3.31, D4.03–D4.06** Agent/MCP set
5. **D3.17a/b, D3.18, D3.19** ERD/EER split
6. **D3.11–D3.14, D3.26** Domain NEW figures
7. **D1.01–D1.02** Ch1 overview
8. Remaining P2 NEW figures

---

## G. Session checklists

### Session 2 — Chapter 3 (38 files)

**Prerequisite:** `v29/build-v29-diagrams.sh` + mmdc configs copied.

| Order | File | ID | Status |
|------:|------|-----|--------|
| 1 | `fig-oracle-architecture.mmd` | D3.04 | ☑ |
| 2 | `fig-three-layer-arch.mmd` | D3.01 | ☑ |
| 3 | `fig-component-architecture.mmd` | D3.02 | ☑ |
| 4 | `fig-blockchain-stack.mmd` | D3.03 | ☑ |
| 5 | `fig-core-system-graph.mmd` | D3.17a | ☑ |
| 6 | `fig-erd-core.mmd` | D3.17b | ☑ |
| 7 | `fig-erd-extended.mmd` | D3.18 | ☑ |
| 8 | `fig-eer-model.mmd` | D3.19 | ☑ |
| 9 | `fig-usecase-actors.mmd` | D3.22 | ☑ |
| 10 | `fig-seq-agent-banking.mmd` | D3.31 | ☑ |
| 11 | `fig-activity-aux.mmd` | D3.25 | ☑ |
| 12 | `fig-compliance-identity.mmd` | D3.10 | ☑ |
| 13 | `fig-tier-model.mmd` | D3.09 | ☑ |
| 14 | `fig-multi-entity-ops.mmd` | D3.08 | ☑ |
| 15 | `fig-hierarchical-banking.mmd` | D3.07 | ☑ |
| 16 | `fig-banking-modules.mmd` | D3.06 | ☑ |
| 17 | `fig-cross-chain-bridge-ccip.mmd` | D3.05 | ☑ |
| 18 | `fig-kinked-rate-curve.mmd` | D3.11 | ☑ |
| 19 | `fig-liquidation-engine.mmd` | D3.12 | ☑ |
| 20 | `fig-savings-vault-loop.mmd` | D3.13 | ☑ |
| 21 | `fig-credit-passport-sbt.mmd` | D3.14 | ☑ |
| 22 | `fig-activity-sar-aml.mmd` | D3.26 | ☑ |
| 23 | `fig-defense-in-depth.mmd` | D3.20 | ☑ |
| 24 | `fig-security-controls.mmd` | D3.21 | ☑ |
| 25 | `fig-activity-lending.mmd` | D3.23 | ☑ |
| 26 | `fig-activity-onboarding-id.mmd` | D3.24 | ☑ |
| 27 | `fig-dfd-suite.mmd` | D3.27 | ☑ |
| 28 | `fig-seq-loan-flow.mmd` | D3.28 | ☑ |
| 29 | `fig-seq-installment-income.mmd` | D3.29 | ☑ |
| 30 | `fig-seq-banking-data.mmd` | D3.30 | ☑ |
| 31 | `fig-seq-agent-confirm-gate.mmd` | D3.32 | ☑ |
| 32 | `fig-governance-dual-path.mmd` | D3.15 | ☑ |
| 33 | `fig-prototype-scope-matrix.mmd` | D3.16 | ☑ |

**Session 2 acceptance:** All ☐ checked; `mmdc` renders without error; P0 files visually match “Must show” bullets; PDFs only under `v29/mermaid-pdf/`.

**D3.31 integration alias:** Also export/copy as `fig-seq-chat-chatbot.pdf` if keeping legacy `.tex` path unchanged before integration.

---

### Session 3 — Chapter 4 (12 files)

| Order | File | ID | Status |
|------:|------|-----|--------|
| 1 | `fig-aiml-pipeline.mmd` | D4.02 | ☐ |
| 2 | `fig-agent-six-step-pipeline.mmd` | D4.03 | ☐ |
| 3 | `fig-mcp-tool-server.mmd` | D4.04 | ☐ |
| 4 | `fig-three-tier-prompt.mmd` | D4.05 | ☐ |
| 5 | `fig-lifecycle-hook-middleware.mmd` | D4.06 | ☐ |
| 6 | `fig-agile-process.mmd` | D4.01 | ☐ |
| 7 | `fig-realtime-dashboard.mmd` | D4.07 | ☐ |
| 8 | `fig-tx-state-machine.mmd` | D4.08 | ☐ |
| 9 | `fig-sdlc-agile.mmd` | D4.09 | ☐ |
| 10 | `fig-design-decisions.mmd` | D4.10 | ☐ |
| 11 | `fig-eip7702-session-scope.mmd` | D4.11 | ☐ |
| 12 | `fig-abm-simulation-manifest.mmd` | D4.12 | ☐ |

---

### Session 4 — Chapter 5 (4 files)

| File | ID | Status |
|------|-----|--------|
| `fig-revenue-by-tier.mmd` | D5.01 | ☐ |
| `fig-apr-spread.mmd` | D5.02 | ☐ |
| `fig-mica-genius-compliance-map.mmd` | D5.03 | ☐ |
| `fig-sylhet-accessibility-journey.mmd` | D5.04 | ☐ |

**Note:** Charts use `mmdc-charts-config.json`; verify legibility at 0.5\linewidth.

---

### Session 5 — Ch1, Ch2, Appendix (11 files)

| File | ID | Status |
|------|-----|--------|
| `fig-proposed-solution-overview.mmd` | D1.01 | ☐ |
| `fig-capital-flow-directions.mmd` | D1.02 | ☐ |
| `fig-five-stage-retail-funnel.mmd` | D1.03 | ☐ |
| `fig-methodology-phase-roadmap.mmd` | D1.04 | ☐ |
| `fig-stablecoin-mica-positioning.mmd` | D1.05 | ☐ |
| `fig-prisma-review-flow.mmd` | D2.01 | ☐ |
| `fig-protocol-comparison-matrix.mmd` | D2.02 | ☐ |
| `fig-ftx-vs-onchain-reserves.mmd` | D2.03 | ☐ |
| `fig-local-llm-compact.mmd` | D-A.01 | ☐ |
| `fig-local-llm.mmd` | D-A.02 | ☐ |
| `fig-agent-safety-four-layers.mmd` | D-A.03 | ☐ |

---

## H. Parallel track — `.tex` fixes (do NOT execute in diagram sessions)

Diagram sessions update art only. When user opens a LaTeX session, apply prose/caption fixes from audit Section A:

| # | ~Line | Issue |
|---|-------|-------|
| T1 | 1371 | “three layers” / “nine-contract” → four layers, 3/15 contracts |
| T2 | 1364–1366 | Filename `fig-three-layer-arch` vs four-layer caption |
| T3 | 1543, 1572 | Split ERD PDFs |
| T4 | 1534 | Add `fig:oracle-architecture` figure block |
| T5–T6 | 1598, 859, 3337 | Entity count 19 vs 20 → standardise 20 |
| T7–T12 | various | Amoy→Cardona, nine→fifteen contracts, QLoRA→Qwen3+MCP |
| T13 | 2694, 2701 | v15 captions → v29 |
| T14 | 4527 | `fig:local-llm-tikz` mislabel |
| T15 | ~691 | Ch1 blurb vs entity table |

New `\begin{figure}` blocks: see `updated_diagram_integration_in_latex.md`.

---

## I. Changelog

| Date | Session | Notes |
|------|---------|-------|
| 2026-06-04 | 1 | Initial plan + integration guide created |
| 2026-06-04 | 2–5 | 60 `.mmd` sources, 61 PDFs (`build-v29-diagrams.sh`, 0 failures); alias `fig-seq-chat-chatbot.pdf` from agent banking |

---

## J. How to start the next chat

**Session 2 prompt:**

> Session 2: Update Chapter 3 diagrams per `Documentation/2nd Phase (Bokhtiar)/Improvements/v29/diagram_update_plan_for_v29.md`. Create `v29/mermaid-src/` and `v29/mermaid-pdf/`, copy mmdc configs, add `build-v29-diagrams.sh`. Do not edit `.tex`. Tick Session 2 checklist when done.

**Sync rule:** Any basename or `\label` change must update both this file and `updated_diagram_integration_in_latex.md`.
