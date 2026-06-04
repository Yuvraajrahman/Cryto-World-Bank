# Diagram Upgrades for Pre-thesis v29 (`Pre-thesis_v29_final.tex`)

**Document purpose:** Audit every figure currently imported from `Diagrams/mermaid-src/improved diagrams/` against the v29 thesis text, list required updates per diagram, and specify **new diagrams** that the paper describes but does not yet visualize.  
**Source of truth:** `Documentation/2nd Phase (Bokhtiar)/Improvements/Pre-thesis_v29_final.tex` (February 2026 pre-thesis).  
**Diagram sources:** `Documentation/2nd Phase (Bokhtiar)/Improvements/Diagrams/mermaid-src/improved diagrams/*.mmd` → rendered to `Diagrams/mermaid-pdf/improved diagrams/*.pdf`.

**Platform summary (for diagram authors):** Crypto World Bank (CWB) is a **four-tier institutional DeFi banking prototype** (World Bank Reserve → National Bank → Local Bank → Client) with **fifteen modular smart contracts** (three implemented, twelve planned), **20 PostgreSQL entities**, **Chainlink stack** (Functions, Automation, Price Feeds, PoR, CCIP), **MCP autonomous agent** (Qwen3-8B, 17 tools, human confirmation gate, EIP-7702 session keys), and **AI/ML** (Random Forest + Isolation Forest + stacking meta-learner + SHAP). Primary testnet: **Polygon zkEVM Cardona**; institutional: **Ethereum Sepolia**. Retail denomination target: **USDC**, not ETH.

**Legend for status columns:**
| Status | Meaning |
|--------|---------|
| **UPDATE** | Figure exists in v29 but mermaid content is stale vs. v29 narrative |
| **NEW** | No figure in v29 yet; text explicitly needs or implies one |
| **OK** | Largely aligned; only minor caption/label polish |

---

## Executive summary

| Category | Count |
|----------|------:|
| Existing figures in v29 | 32 |
| Figures requiring substantive mermaid updates | 22 |
| Figures OK with minor edits | 4 |
| **New figures recommended** | **18** (6 high priority) |
| Explicit LaTeX placeholder (no file yet) | 1 (`oracle_architecture`) |

**Highest-impact gaps (do these first):**
1. **Four-layer architecture** — thesis says four layers + Chainlink; `fig-three-layer-arch` still shows three.
2. **Autonomous agent / MCP** — entire Methodology + Appendix rewritten for Qwen3-8B + 17 MCP tools; `fig-local-llm*`, `fig-seq-chat-chatbot`, `fig-activity-aux` still show read-only RAG / LM Studio / QLoRA.
3. **Nine-actor use case** — text specifies AI Agent + Chainlink DON + Regulator + Auditor; diagram has seven legacy actors.
4. **Oracle architecture** — Section `\ref{sec:oracle-architecture}` has a **pending figure** only in prose.
5. **ERD completeness** — `SESSIONS`, `AGENT_ACTION_LOG`, `INTEREST_RATE_TIER`, `ASSETS`, and multi-entity tables are in text but not in ERD figures.

---

## Chapter 1 — Introduction

*No figures are embedded in Chapter 1 today. Several sections are diagram-dense in prose only.*

### Recommended new diagrams

| ID | Proposed file | Priority | Insert location (v29) | What to show |
|----|---------------|----------|------------------------|--------------|
| **D1.01** | `fig-proposed-solution-overview.mmd` | **High** | After `\section{Proposed Solution}` (~line 739), before `\subsection{Banking Functions}` | Four institutional tiers (T1–T4) + six banking functions ring (deposit, credit, payment, risk, liquidity, ancillary) + optional “multi-entity” callouts (SyndicatedLoan, GroupLendingPool, IBLP, UpwardDeposit). |
| **D1.02** | `fig-capital-flow-directions.mmd` | **High** | After `\subsubsection{Cross-Tier Lending System}` / `\paragraph{Can a group of entities...}` (~line 790) | Three flow directions on one canvas: **downward** allocation, **same-tier** IBLP, **upward** UpwardDepositFacility; label asymmetric rates \(r_{\text{up}} < r_{\text{down}} - \delta\). |
| **D1.03** | `fig-five-stage-retail-funnel.mmd` | Medium | `\subsection{Five-Stage Conversion Funnel}` (`\ref{sec:funnel}`, ~line 2052) | Stages 1–5: browse → ERC-4337 account → KYC → first USDC loan → power user; hide “crypto” until stage 5. |
| **D1.04** | `fig-methodology-phase-roadmap.mmd` | Medium | `\section{Methodology in Brief}` (~line 857) | Phase I–IV swimlane: contracts, agent, Chainlink Functions, Certora/Foundry/simulation; map to SDLC figure in Ch4 (`fig-sdlc-agile`) without duplicating detail. |
| **D1.05** | `fig-stablecoin-mica-positioning.mmd` | Low | `\subsection{Stablecoin-First Lending}` (`\ref{sec:stablecoin-first}`, ~line 887) | USDC numeraire + MiCA/GENIUS + mBridge/Agora as settlement rails; CWB as lending layer on top (composable, not replacement). |

### LaTeX integration notes (Ch1)
- Add `\begin{figure}` blocks with `\OnePageDiagram{fig-....pdf}` and labels `fig:proposed-solution`, `fig:capital-flow-directions`, etc.
- Cross-reference from `\section{Research Contribution}` and `\section{Methodology in Brief}`.

---

## Chapter 2 — Literature Review

*No figures today; PRISMA framing and comparative table are central.*

### Recommended new diagrams

| ID | Proposed file | Priority | Insert location | What to show |
|----|---------------|----------|-----------------|--------------|
| **D2.01** | `fig-prisma-review-flow.mmd` | Medium | After `\section{Review of Existing Research}` or before `\section{Literature Review Summary}` | PRISMA-style flow: identification → screening → included papers → synthesis themes (hierarchy, ML, inclusion, security). |
| **D2.02** | `fig-protocol-comparison-matrix.mmd` | Low | Adjacent to Table `\ref{tab:protocol-comparison}` (~line 1214) | Visual heatmap of same 11 dimensions (Aave, Compound, Maker, Maple, Goldfinch, CWB); optional if table is sufficient for examiners. |
| **D2.03** | `fig-ftx-vs-onchain-reserves.mmd` | Low | Paragraph “Positioning against failed centralized exchanges” (~line 1250) | FTX opaque custody vs. CWB on-chain PoR + tier reserve ratios (conceptual, not accusatory graphic). |

---

## Chapter 3 — System Architecture and Design

*32 existing figures; bulk of update work.*

### 3.1 — Architecture & platform stack

| ID | Current file | Status | Location in v29 | Required updates |
|----|--------------|--------|-----------------|------------------|
| **D3.01** | `fig-three-layer-arch.mmd` | **UPDATE** | `\section{High-Level Architecture}`, Fig. `\ref{fig:three-layer-arch}` (~1362) | **Rename conceptually to four-layer.** Add subgraph **Chainlink Infrastructure**: Functions (DON), Automation, Price Feeds, PoR, CCIP. Presentation layer: add **ERC-4337 / Wagmi**, agent widget. Off-chain: **MCP Tool Server**, **Qwen3-8B**, drop “15+ tables” → **20 entities**. Smart-contract: note **3 implemented / 12 planned** badge on contract boxes. |
| **D3.02** | `fig-component-architecture.mmd` | **UPDATE** | Fig. `\ref{fig:component-diagram}` (~1373) | Add nodes: **MCP Tool Server (17 tools)**, **Agent middleware** (confirmation audit hook, injection scanner, toolset scoper), **Chainlink Automation & PoR** separate from Functions. PostgreSQL label: **20 entities, 3NF**. Dashed edges: prototype (solid) vs planned (dashed). Fix caption mismatch: thesis still says “three-contract prototype view” but diagram already shows 15 contracts — align caption *or* split into `fig-component-prototype.mmd` + `fig-component-target.mmd`. |
| **D3.03** | `fig-blockchain-stack.mmd` | **UPDATE** | Fig. `\ref{fig:blockchain-stack}` (~1382) | L1: **Polygon zkEVM Cardona** (retail) + **Ethereum Sepolia** (institutional); remove “Polygon PoS (retail)”. L3: **20 tables**. L4: add **SSE agent stream**, **EIP-7702**. L2: list **LiquidationEngine** if shown as planned module. |
| **D3.04** | `fig-oracle-architecture.mmd` | **NEW (explicit gap)** | `\subsection{Oracle Architecture}` `\ref{sec:oracle-architecture}` (~1446); prose cites `oracle_architecture.png` (~1534) | **Primary path:** Chainlink Functions DON → `commitRiskScore` / score on `LoanController`. **Fallback:** commit-reveal FastAPI relay. Sidecars: Automation (installments), Price Feeds (BDT/USD, ETH/USD), PoR on `WorldBankReserve`. Show trust comparison (single relay vs DON). |
| **D3.05** | `fig-cross-chain-bridge-ccip.mmd` | **NEW** | `\section{Cross-Chain Bridge Architecture}` `\ref{sec:bridge}` (~2167) | Chainlink CCIP; messages allowed: reserve updates + SBT mirror only; loans single-chain per client. |
| **D3.06** | `fig-banking-modules.mmd` | **UPDATE** | Fig. `\ref{fig:banking-modules}` (~2506) | Verify all **six banking product** contracts + link to SavingsVault/FixedDeposit/GroupLending/FX/Insurance/CurrentAccount sections. Mark implementation phase (I/II/III). |
| **D3.07** | `fig-hierarchical-banking.mmd` | **UPDATE** | Fig. `\ref{fig:four-tier}` (~2482) | Replace **ETH** amounts with **USDC** (or “USDC eq.”). Rates as bps/spreads consistent with kinked model. Show **cascading repayment** arrows clearly. Keep IBLP + UpwardDepositFacility subgraphs (already present — good). |
| **D3.08** | `fig-multi-entity-ops.mmd` | **UPDATE** | Fig. `\ref{fig:multi-entity-ops}` (~2181) | Confirm panels (a)–(f) match v29 contract names and add **settlePartial** / default path on NettingEngine per ~2326. Label **Phase II vs III** on each panel. |
| **D3.09** | `fig-tier-model.mmd` | **UPDATE** | Fig. `\ref{fig:tier-model}` (~2022) | Align loan bands with Table `\ref{tab:borrower-tiers}`: retail **0.01–10 ETH** in table but text pushes **USDC** — use **USDC** bands (50 / 250 / 1k / 5k / 25k from `\ref{tab:credit-tiers}`) for T4; institutional tiers in USDC/ETH per `\ref{sec:stablecoin-first}`. Add **Credit Passport SBT** link on T4. |
| **D3.10** | `fig-compliance-identity.mmd` | **UPDATE** | Fig. `\ref{fig:compliance-identity}` (~1865) | KYC ladder limits in **USDC** not ETH. Add **Groth16 KYCVerifier** (Appendix C) deployed path. Panel (d) ERC-4337: show **pre-KYC Paymaster bootstrap** (2 txs cap). zkAML panel: mark **planned** vs KYC **PoC**. |
| **D3.11** | `fig-kinked-rate-curve.mmd` | **NEW** | `\section{Kinked Interest Rate Model}` `\ref{sec:kinked-rate}` (~2058) | Piecewise curve with \(U^*\), \(r_0\), \(r_1\), \(r_2\); retail vs IBLP kink 80% vs 90%. |
| **D3.12** | `fig-liquidation-engine.mmd` | **NEW** | `\section{Liquidation Engine}` `\ref{sec:liquidation}` (~2075) | Four HF variants (retail OC, group pool, credit-based no-HF, institutional reserve HF) + `liquidate()` bonus + hierarchical queue. |
| **D3.13** | `fig-savings-vault-loop.mmd` | **NEW** | `\section{SavingsVault and FixedDeposit}` `\ref{sec:savings-vault}` (~2103) | Closed loop: deposits → lend → interest → NetInterest split (depositor / insurance / protocol); ERC-4626 / ERC-7540 callouts. |
| **D3.14** | `fig-credit-passport-sbt.mmd` | **NEW** | `\section{On-Chain Credit Passport}` `\ref{sec:credit-passport}` (~2120) | SBT schema fields + `ICreditPassport.getScore()` + tier table link; non-revocable default record (GDPR note as annotation). |
| **D3.15** | `fig-governance-dual-path.mmd` | **NEW** | `\section{Governance Framework}` (~2568) | Standard **TimeLock 24–48h** vs **Security Council 4-of-7** emergency path; Safe multisig roles. |
| **D3.16** | `fig-prototype-scope-matrix.mmd` | Low | Table `\ref{tab:prototype-scope}` (~1302) | Optional visual of ✅ / ⏳ / ○ from table columns (reduces wall of text). |

### 3.2 — Data model

| ID | Current file | Status | Location | Required updates |
|----|--------------|--------|----------|------------------|
| **D3.17** | `fig-erd-core.mmd` | **UPDATE** | Figs. `\ref{fig:core-system-graph}` & `\ref{fig:erd}` (~1541–1574) — **same PDF used twice** | Add entities: **`SESSIONS`**, **`AGENT_ACTION_LOG`**, **`INTEREST_RATE_TIER`**, **`ASSETS`**. Rename annotation **BORROWER → CLIENT** (planned). Fix duplicate figure: consider `fig-core-system-graph.mmd` (graph view) separate from `fig-erd-core.mmd` (full attributes). Update entity count **20**. |
| **D3.18** | `fig-erd-extended.mmd` | **UPDATE** | Fig. `\ref{fig:erd-extended}` (~1577) | Ensure all multi-entity tables from `\ref{sec:multi-entity-consistency}` (~2334) with FKs to LOAN/BANK_USER. Add **`audit_logs`** if regulator flow is visualized. |
| **D3.19** | `fig-eer-model.mmd` | **UPDATE** | Fig. `\ref{fig:eer}` (~1587) | Add weak entity / specialization for **AGENT_ACTION_LOG** → **CHAT_MESSAGE** confirmation FK. **BANK_USER** disjoint specialization unchanged. |

### 3.3 — Security

| ID | Current file | Status | Location | Required updates |
|----|--------------|--------|----------|------------------|
| **D3.20** | `fig-defense-in-depth.mmd` | **UPDATE** | Fig. `\ref{fig:defense-in-depth}` (~2691) | L2: **confirmation audit hook**, **prompt injection scanner**, **toolset scoping**, **EIP-7702 scope pre-check**. L3: **Chainlink Functions** as primary oracle; **stacking meta-learner**; agent **human-gate** (not just hallucination guard). L5: **Security Council** + demo key rotation. |
| **D3.21** | `fig-security-controls.mmd` | **UPDATE** | Fig. `\ref{fig:security-controls}` (~2698) | Map controls to expanded threat table (~2754): LLM01 injection, blind signing, SAR freeze, granular `functionPaused`. |

### 3.4 — System modeling (UML)

| ID | Current file | Status | Location | Required updates |
|----|--------------|--------|----------|------------------|
| **D3.22** | `fig-usecase-actors.mmd` | **UPDATE** | Fig. `\ref{fig:usecase}` (~2380) | Replace 7 actors with **9**: A1 Retail Client, A2 Local Bank Admin, A3 National Bank Admin, A4 World Bank Admin, **A5 AI Agent**, A6 Regulatory Authority, **A7 Chainlink DON**, A8 Blockchain Validator, A9 External Auditor. Add use cases: **agent write with confirmation**, **ML score commit**, **PoR read**, **SAR review**, **netting batch dispute**. |
| **D3.23** | `fig-activity-lending.mmd` | **UPDATE** | Fig. `\ref{fig:act-lending}` (~2391) | Incorporate **SCORE_REVEALED** gate, **SBT** update on final installment, **group pool** branch, **USDC** denomination. |
| **D3.24** | `fig-activity-onboarding-id.mmd` | **UPDATE** | Fig. `\ref{fig:act-onboarding}` (~2399) | EIP-712 profile updates; **five-stage funnel** alignment; zkKYC vs full KYC paths. |
| **D3.25** | `fig-activity-aux.mmd` | **UPDATE** | Fig. `\ref{fig:act-aux}` (~2407) | Panel (b): replace “QLoRA RAG chatbot” with **agent six-step pipeline** (Q&A vs action vs confirmation). Panel (a): optional merge with agent chat. |
| **D3.26** | `fig-activity-sar-aml.mmd` | **NEW** | `\paragraph{SAR activity flow}` (~2415) | Five-step SAR: iForest → `AI_ML_LOG` → Kafka `aml-alert` → officer → `freezeAccount`. |
| **D3.27** | `fig-dfd-suite.mmd` | **UPDATE** | Fig. `\ref{fig:dfd-suite}` (~2434) | Level-1: add **agent_action_log**, **sessions**, **Chainlink DON** external entity, **ML service** commit-reveal + Functions path. |
| **D3.28** | `fig-seq-loan-flow.mmd` | **UPDATE** | Fig. `\ref{fig:seq-loan-flow}` (~2446) | Branch: **Chainlink Functions** (primary) vs commit-reveal (fallback). Add **Authority Brief** to approver UI. Approver still signs disbursement (no full auto-approve). |
| **D3.29** | `fig-seq-installment-income.mmd` | **UPDATE** | Fig. `\ref{fig:seq-installment-income}` (~2454) | Installment: **Chainlink Automation** `checkUpkeep` path. Income: document hash only on-chain. |
| **D3.30** | `fig-seq-banking-data.mmd` | **UPDATE** | Fig. `\ref{fig:seq-banking-data}` (~2462) | Market data: **AggregatorV3Interface** 8-decimal BDT. Borrowing limit: **ICreditPassport** + rolling windows. |
| **D3.31** | `fig-seq-chat-chatbot.mmd` | **UPDATE** | Fig. `\ref{fig:seq-chat-bot}` (~2470) | Replace with **`fig-seq-agent-banking.mmd`**: SSE → context assembly (3-tier prompt) → tool call → **403 if no confirmation** → MCP write → EIP-7702 sign → `agent_action_log`. Keep bank WebSocket panel (a) or split file. |
| **D3.32** | `fig-seq-agent-confirm-gate.mmd` | **NEW** | Cross-ref `\ref{sec:aiml-support}` agent pipeline | Sequence focused on HTTP 403 confirmation audit hook (middleware), independent of model output. |

---

## Chapter 4 — Methodology

| ID | Current file | Status | Location | Required updates |
|----|--------------|--------|----------|------------------|
| **D4.01** | `fig-agile-process.mmd` | **UPDATE** | Fig. `\ref{fig:agile-process}` (~2810) | Phase labels **I–IV** (not only 2-week sprints); deliverables: MCP agent Phase II, Chainlink Functions Phase III, Certora Phase IV. |
| **D4.02** | `fig-aiml-pipeline.mmd` | **UPDATE** | Fig. `\ref{fig:aiml-pipeline}` (~2828) | Panel (b): **Chainlink Functions DON** primary; commit-reveal as fallback. Add **stacking meta-learner** (logistic on \(p_f\) + anomaly). Threshold bands 0.4 / 0.7. Panel (a): 18+4 features, BCCC-DeFi dataset callout. |
| **D4.03** | `fig-agent-six-step-pipeline.mmd` | **NEW** | `\paragraph{Autonomous AI agent — six-step pipeline}` (~2851) | Swimlane: user → SSE → context inject → Q&A vs action → confirmation → MCP write → monitor tx. |
| **D4.04** | `fig-mcp-tool-server.mmd` | **NEW** | Table `\ref{tab:mcp-tools}` (~2868) | Diagram: 9 read / 8 write tools grouped by toolset (`read_only`, `loan_actions`, `account_management`). |
| **D4.05** | `fig-three-tier-prompt.mmd` | **NEW** | `\paragraph{Three-tier system prompt assembly}` (~2957) | Stable / Context / Volatile tiers + prefix cache note. |
| **D4.06** | `fig-lifecycle-hook-middleware.mmd` | **NEW** | `\paragraph{Lifecycle hook middleware}` (~3112) | Chain: injection scan → confirmation audit (Phase II) → session key scope (III) → AML pre-check (IV). |
| **D4.07** | `fig-realtime-dashboard.mmd` | **UPDATE** | Fig. `\ref{fig:realtime-dashboard}` (~3254) | Polygon **zkEVM Cardona**; events include `RiskScoreCommitted`, `FunctionPaused`; SAR queue consumer. |
| **D4.08** | `fig-tx-state-machine.mmd` | **UPDATE** | Fig. `\ref{fig:tx-state-machine}` (~3276) | Align states with text: DRAFT → PENDING_KYC → PENDING_LIMIT → PENDING_SCORE → PENDING_APPROVAL → ACTIVE → CLOSED/DEFAULTED/LIQUIDATED; parallel **frontend** 5-state UX overlay. |
| **D4.09** | `fig-sdlc-agile.mmd` | **UPDATE** | Fig. `\ref{fig:methodology-technical}` (~3323) | Pre-thesis 1 = Req/Arch/Design complete; overlay Foundry, Certora, 300-client simulation, Tenderly. |
| **D4.10** | `fig-design-decisions.mmd` | **UPDATE** | Fig. `\ref{fig:design-decisions}` (~3612) | Add decisions: zkEVM vs Amoy PoS, Chainlink Functions vs relay, Qwen3-8B local vs API, USDC-first, EIP-7702 vs 4337-only. |
| **D4.11** | `fig-eip7702-session-scope.mmd` | **NEW** | Technology stack table + `\ref{sec:aiml-support}` | Session key JSON scope: tool list + 500 USDC cap + 24h TTL + revocation. |
| **D4.12** | `fig-abm-simulation-manifest.mmd` | **NEW** | `\section{On-Chain Economic Feasibility Simulation}` `\ref{sec:abm-sim}` (~3222) | 300 clients, 6 banks, SEED=42, manifest JSON output → evaluation RQ4/RQ5. |

### Minor / OK

| ID | File | Status | Note |
|----|------|--------|------|
| **D4.13** | `fig-sdlc-agile.mmd` | OK | See D4.09 for content refresh only. |

---

## Chapter 5 — Market Analysis and Feasibility

| ID | Current file | Status | Location | Required updates |
|----|--------------|--------|----------|------------------|
| **D5.01** | `fig-revenue-by-tier.mmd` | **UPDATE** | Fig. `\ref{fig:revenue-by-tier}` (~4136) | Confirm **USDC** revenue units; tie to spread taxonomy in `\section{Revenue Projection}`. Mark **illustrative / simulation-backed** where applicable. |
| **D5.02** | `fig-apr-spread.mmd` | **UPDATE** | Fig. `\ref{fig:apr-spread}` (~4205) | Show **kinked utilization** effect if chart is utilization vs APR; label testnet assumptions. |
| **D5.03** | `fig-mica-genius-compliance-map.mmd` | **NEW** | `\section{MiCA and GENIUS Act Compliance Mapping}` (~4258) | Map EMT requirements → CWB stablecoin pool + PoR + audit_logs (high-level). |
| **D5.04** | `fig-sylhet-accessibility-journey.mmd` | **NEW** | `\section{Accessibility Assessment}` (~4360) | User journey: mobile → agent (Bengali) → USDC loan → confirmation gate. |

---

## Appendix — Technology Stack (LLM)

| ID | Current file | Status | Location | Required updates |
|----|--------------|--------|----------|------------------|
| **D-A.01** | `fig-local-llm-compact.mmd` | **UPDATE (critical)** | Fig. `\ref{fig:local-llm-mermaid}` (~4516) | **Caption already describes MCP + Qwen3-8B + human gate; diagram does not.** Replace LM Studio-only path with: UI → Express SSE → **context assembly** → Qwen3-8B → (read path \| write path + confirmation) → MCP → chain. |
| **D-A.02** | `fig-local-llm.mmd` | **UPDATE (critical)** | Fig. `\ref{fig:local-llm-tikz}` (~4523) | Expand to show: **ChromaDB RAG**, **MCP server**, **PostgreSQL** (`sessions`, `agent_action_log`), **EIP-7702 signer**, **injection scanner**, **403 middleware**. |
| **D-A.03** | `fig-agent-safety-four-layers.mmd` | **NEW** | `\paragraph{Security and limitations}` (~4511) | Four levels from text: tool schema, human gate, session key scope, injection + middleware. |

---

## Master checklist: existing mermaid files → action

| # | Mermaid file | Action |
|---|--------------|--------|
| 1 | `fig-three-layer-arch.mmd` | UPDATE → four layers + Chainlink |
| 2 | `fig-component-architecture.mmd` | UPDATE → agent/MCP; prototype vs target |
| 3 | `fig-blockchain-stack.mmd` | UPDATE → zkEVM Cardona, 20 tables |
| 4 | `fig-erd-core.mmd` | UPDATE → new entities; split from system graph |
| 5 | `fig-erd-extended.mmd` | UPDATE → FK completeness |
| 6 | `fig-eer-model.mmd` | UPDATE → agent audit FK |
| 7 | `fig-compliance-identity.mmd` | UPDATE → USDC limits, Paymaster bootstrap |
| 8 | `fig-tier-model.mmd` | UPDATE → USDC + credit tiers |
| 9 | `fig-multi-entity-ops.mmd` | UPDATE → phase labels, settlePartial |
| 10 | `fig-usecase-actors.mmd` | UPDATE → nine actors |
| 11 | `fig-activity-lending.mmd` | UPDATE |
| 12 | `fig-activity-onboarding-id.mmd` | UPDATE |
| 13 | `fig-activity-aux.mmd` | UPDATE → agent pipeline panel |
| 14 | `fig-dfd-suite.mmd` | UPDATE |
| 15 | `fig-seq-loan-flow.mmd` | UPDATE → Chainlink Functions + Authority Brief |
| 16 | `fig-seq-installment-income.mmd` | UPDATE → Automation |
| 17 | `fig-seq-banking-data.mmd` | UPDATE |
| 18 | `fig-seq-chat-chatbot.mmd` | UPDATE → rename/refocus agent+MCP |
| 19 | `fig-hierarchical-banking.mmd` | UPDATE → USDC |
| 20 | `fig-banking-modules.mmd` | UPDATE → phase badges |
| 21 | `fig-defense-in-depth.mmd` | UPDATE → agent + Chainlink controls |
| 22 | `fig-security-controls.mmd` | UPDATE → threat table mapping |
| 23 | `fig-agile-process.mmd` | UPDATE → Phase I–IV |
| 24 | `fig-aiml-pipeline.mmd` | UPDATE → Functions + stacking |
| 25 | `fig-realtime-dashboard.mmd` | UPDATE |
| 26 | `fig-tx-state-machine.mmd` | UPDATE |
| 27 | `fig-sdlc-agile.mmd` | UPDATE |
| 28 | `fig-design-decisions.mmd` | UPDATE |
| 29 | `fig-revenue-by-tier.mmd` | UPDATE |
| 30 | `fig-apr-spread.mmd` | UPDATE |
| 31 | `fig-local-llm-compact.mmd` | **UPDATE (critical)** |
| 32 | `fig-local-llm.mmd` | **UPDATE (critical)** |

---

## Suggested implementation order (for diagram authors)

1. **D3.04** Oracle architecture (closes explicit placeholder).  
2. **D3.01–D3.03** Stack + component + blockchain (establishes canonical platform picture).  
3. **D-A.01–D-A.02** Agent diagrams (largest caption/diagram mismatch).  
4. **D3.22, D3.31, D4.03–D4.06** Agent/MCP methodology set.  
5. **D3.17–D3.19** ERD/EER (data model examiners expect consistency).  
6. **D3.11–D3.14, D3.26** Domain-specific new figures (liquidation, SBT, SAR, kinked rate).  
7. **D1.01–D1.02** Chapter 1 overview figures.  
8. Remaining **NEW**/low-priority figures (PRISMA, MiCA map, accessibility).

---

## Rendering & LaTeX workflow reminders

1. Edit `.mmd` under `Diagrams/mermaid-src/improved diagrams/`.  
2. Render to PDF in `Diagrams/mermaid-pdf/improved diagrams/` (same basename).  
3. v29 loads via `\OnePageDiagram{fig-....pdf}` and `\graphicspath` (lines 50–57 of `Pre-thesis_v29_final.tex`).  
4. For new figures: add `\begin{figure}[H]`, `\caption{...}`, `\label{fig:...}`, and reference from prose.  
5. Resolve duplicate **fig-erd-core.pdf** usage: assign `fig-core-system-graph.pdf` for `\ref{fig:core-system-graph}` only.

---

---

## Reflection for the `.tex` project (beyond diagrams)

This section audits whether the **audit report itself** is complete and whether **`Pre-thesis_v29_final.tex` needs edits** even before redrawing mermaid files. Several issues are **prose/caption bugs in LaTeX**, not fixable by PDF replacement alone.

### Verdict

| Area | Status |
|------|--------|
| Diagram audit report (mermaid ↔ figures) | **Sound** — priorities and file mapping are correct |
| `.tex` internal consistency | **Needs work** — stale v15/v23 fragments, layer/contract count drift, entity count conflict |
| Figure environments in `.tex` | **Needs work** — one explicit missing figure, duplicate ERD PDF, misleading labels, outdated captions |
| Original audit report gaps | **Addressed below** — actor taxonomy nuance, `.tex`-only fix list, rename recommendation |

**Recommendation:** Treat deliverables as **two tracks**: (A) redraw/render diagrams per this document; (B) patch `.tex` prose, captions, and figure blocks in parallel so examiners are not reading text that contradicts the updated figures.

---

### A. `.tex` fixes that do not require new diagrams (high priority)

| # | Location (~line) | Issue | Suggested fix |
|---|------------------|-------|----------------|
| T1 | 1371 | Says component diagram shows **“three layers”** and **“nine-contract”** target; line 1360 says **four-layer** and line 1369 says **fifteen** contracts | Replace paragraph with: four-layer stack; **3 implemented / 15 target** contracts; point to updated `fig-component-architecture` when ready |
| T2 | 1364–1366 | Figure file still named `fig-three-layer-arch` but caption describes **four** layers | After mermaid update: rename to `fig-four-layer-arch.pdf` *or* keep filename and add footnote “legacy filename; depicts four layers” |
| T3 | 1543 + 1572 | **Same PDF** (`fig-erd-core.pdf`) for `\ref{fig:core-system-graph}` and `\ref{fig:erd}` with **different captions** | Split files: `fig-core-system-graph.pdf` (relationship graph only) + `fig-erd-core.pdf` (attribute ERD); update `\OnePageDiagram{...}` paths |
| T4 | 1534 | Oracle section ends with prose-only **`oracle_architecture.png`** — no `\begin{figure}` | Add `\begin{figure}` + `\OnePageDiagram{fig-oracle-architecture.pdf}` + `\label{fig:oracle-architecture}`; remove orphan `.png` filename from prose |
| T5 | 1598 vs 1640–1644 | Table caption **“20 entities”** vs screenshot footer **“19 Normalized Entities”** vs footnote **“19 relational entities”** while listing SESSIONS, AGENT_ACTION_LOG, etc. | Reconcile count (intended **20** per Ch3 intro and tech stack); fix `\TableScreenshotEnd` and footnote to match enumerated rows |
| T6 | 859, 3337 | Phase I says **“19 entities”**; elsewhere **20** | Standardise on **20** (or 19 + footnote explaining deferred entity) everywhere |
| T7 | 666, 676, 684 | Contributions still cite **Polygon Amoy** deployment | Align with Cardona migration narrative: “deployed on Amoy; **migrating to** Cardona (Phase I)” or update addresses if already migrated |
| T8 | 1437 | Table footnote still recommends **“Polygon PoS”** after Cardona selection (line 1411 contradicts) | Rewrite footnote to zkEVM Cardona as primary; PoS/Amoy as fallback only (match line 3674) |
| T9 | 2611 | Business SLA: **“Polygon PoS validator consensus”** | Change to **zkEVM validity proofs / Ethereum L1** |
| T10 | 1092, 2473 | Literature + seq. diagram caption still describe **QLoRA-tuned** generic assistant | Update to **Qwen3-8B + MCP + human confirmation gate** (QLoRA may remain as optional fine-tuning in Future Work, line 4435) |
| T11 | 1028 | **“nine-contract architecture”** in literature synthesis | **Fifteen** modular contracts (or “three implemented, fifteen specified”) |
| T12 | 2338 | “grows from **nine to fifteen**” | Clarify historical v15 count vs current canonical **fifteen** to avoid examiner confusion |
| T13 | 2694, 2701 | Figure captions still say **“v15”** and omit agent/Chainlink controls | Refresh captions to match v29 (`fig-defense-in-depth`, `fig-security-controls`) even before redrawing |
| T14 | 4514–4527 | `\label{fig:local-llm-tikz}` but figure is **`fig-local-llm.pdf`** (mermaid, not TikZ) | Rename label to `fig:local-llm-expanded` or add real TikZ figure; avoid “tikz” in label if none exists |
| T15 | Abstract / Ch1 org (~691) | Chapter 3 blurb says **“20 normalized entities”** — ensure table/list matches | Same as T5 |

---

### B. `.tex` figure blocks to add when diagrams exist

| Figure label | Insert after (~line) | File | Also update prose `\ref{...}` |
|--------------|----------------------|------|-------------------------------|
| `fig:oracle-architecture` | 1532 (end of `\ref{sec:oracle-architecture}`) | `fig-oracle-architecture.pdf` | Replace `oracle_architecture.png` mention |
| `fig:bridge-ccip` | ~2174 (`\ref{sec:bridge}`) | `fig-cross-chain-bridge-ccip.pdf` | Optional short intro sentence |
| `fig:kinked-rate` | ~2073 | `fig-kinked-rate-curve.pdf` | |
| `fig:liquidation` | ~2098 | `fig-liquidation-engine.pdf` | |
| `fig:credit-passport` | ~2125 | `fig-credit-passport-sbt.pdf` | |
| `fig:sar-aml` | ~2428 | `fig-activity-sar-aml.pdf` | Reference from SAR paragraph |
| `fig:agent-pipeline` | ~2862 (after six-step list) | `fig-agent-six-step-pipeline.pdf` | Reduces duplication with appendix |
| `fig:proposed-solution` | ~741 | `fig-proposed-solution-overview.pdf` | Ch1 currently figure-free |
| `fig:capital-flow-directions` | ~802 | `fig-capital-flow-directions.pdf` | Complements `fig:four-tier` in Ch3 |

*Lower priority Ch1/Ch2/Ch5 figures:* D1.03–D1.05, D2.01–D2.03, D5.03–D5.04 — add only if page budget allows.

---

### C. Corrections to the original audit report (meta-improvements)

| Topic | Refinement |
|-------|------------|
| **Actor count** | v29 Table `\ref{tab:actor-taxonomy}` uses **nine actor IDs** (A1a–A1c collapse to “Retail Client” in the use-case **diagram** caption). Diagram update should either show **one A1** with «includes» sub-states or **three A1\*** stereotypes — not revert to seven legacy actors (Visitor, Borrower, Approver split). |
| **Use case vs table** | Permission matrix (`\ref{tab:permission-matrix}`) and actor table are **ahead of** `fig-usecase-actors` — diagram is the laggard, not the tables. |
| **fig-local-llm-tikz** | Report should state explicitly: **no TikZ diagram is compiled today**; only mermaid PDFs. Either implement TikZ per appendix promise or fix label/caption. |
| **“Four OK” figures** | Downgrade confidence: `fig-sdlc-agile` and `fig-banking-modules` still need caption/phase alignment in **`.tex`** even if mermaid geometry is fine. |
| **Entity audit** | Footnote lists four new entities but claims 19 total — likely **20** with one entity omitted from table rows; verify against `\ref{tab:db-entities}` row list when editing ERD. |
| **Literature vs implementation** | Ch2 (~1092) still describes pre-agent assistant; diagram work should be paired with **one paragraph** sync in `.tex`. |

---

### D. Suggested `.tex` edit order (parallel to diagram order)

1. **T1, T4, T5–T6, T13–T15** — prose/caption consistency (1–2 hours, no graphics).  
2. **T3** — split ERD figure references when new PDFs exist.  
3. **T7–T12** — network/contract/LLM terminology pass (Amoy → Cardona, nine → fifteen, QLoRA → Qwen3+MCP).  
4. Insert **new `\begin{figure}`** blocks (Section B) as PDFs land.  
5. Recompile and run **List of Figures** check: no duplicate captions, no “Missing file” boxes from `\ThesisIncludeGraphics`.

---

### E. Optional LaTeX hygiene (lower priority)

- Consider `\graphicspath` comment at top: document that **improved diagrams/** is canonical for v29.  
- For very tall mermaid PDFs, `fig-core-system-graph` on `[p]` float is correct pattern — keep when splitting ERD.  
- `fig-revenue-by-tier` / `fig-apr-spread` use `\HalfWidthDiagram` — ensure updated charts remain legible at `0.5\linewidth`.  
- TikZ package is loaded (line 100) but unused for LLM figures — either use it for `fig:local-llm-expanded` or remove misleading “tikz” label.

---

## Document control

| Field | Value |
|-------|--------|
| Thesis version | v29 (`Pre-thesis_v29_final.tex`) |
| Audit date | 4 June 2026 (diagram audit); 4 June 2026 (`.tex` reflection added) |
| Existing figures audited | 32 |
| New figures recommended | 18 |
| `.tex` prose/caption fixes (no new art) | 15 tracked (Section A) |
| Critical mismatches | Three-layer vs four-layer; LLM/MCP diagrams vs appendix captions; seven vs nine actors; oracle placeholder; **entity 19/20 drift; nine vs fifteen contracts** |
