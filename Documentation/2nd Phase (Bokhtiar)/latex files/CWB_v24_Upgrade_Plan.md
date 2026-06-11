# CWB Pre-thesis v24 — Upgrade Plan
### Source: `Pre-thesis_v23.tex` → `Pre-thesis_v24.tex`
### Authority: `CWB_v24_Improvement_Analysis.md` (May 2026)
> **Prepared by:** Claude (Anthropic) | **For:** Md. Bokhtiar Rahman Juboraz & Md. Mahir Ahnaf Ahmed
> **Status:** Planning document — not a draft. Read this in full before writing a single line of LaTeX.

---

## Reference Files Used to Construct This Plan

The following five files were provided in this chat session and were read in full before the plan was written. Every change in this document traces directly to one or more of these sources.

| # | File | Role in This Plan |
|---|---|---|
| 1 | **`Pre-thesis_v23.tex`** (4,282 lines, ~437 KB) | The source document being upgraded. Every section number, line number, table label, figure label, and heading cited in this plan was verified against this file. No structural element of this file is changed. |
| 2 | **`CWB_v24_Improvement_Analysis.md`** (~38 KB) | The primary authority for all changes. Contains the 10-section improvement specification (autonomous agent, oracle upgrades, compliance, actor taxonomy, DB schema, revenue model, retained v23 items, sprint plan, specify-only items, summary table). Every improvement in this plan maps to a numbered section of this document. |
| 3 | **`binance_software_engineering_architecture.md`** (~64 KB) | Secondary reference. Used to derive: the formal actor taxonomy and permission matrix (§4.1–4.2 of the improvement doc), the SAR workflow and AML activity diagram (§3.2), the regulator audit request sequence (§3.3), and the failed-attempt lockout pattern (§3.4). Also informed the DB normalisation additions (append-only audit log role, session management table). |
| 4 | **`exchange_db_normalization__1_.html`** (~20 KB) | Secondary reference. Used to derive: the composite index strategy (§5.6 of the improvement doc), the append-only audit\_logs enforcement pattern, the `assets` table design and its FK relationship to the LOAN table, and the interest\_rate\_tier normalisation fix. |
| 5 | **`crypto_exchange_ecosystem_dashboard__1_.html`** (~25 KB) | Secondary reference. Used to derive: the revenue stream taxonomy table (§6.1 of the improvement doc), the hard rule against a native CWB token (§6.2, citing the FTX lesson), and context for the competitive landscape section. |

> **How to read the plan:** Every change instruction below cites the source document and section that motivates it. When a change is marked *"from v24 Section X.Y"*, it means `CWB_v24_Improvement_Analysis.md §X.Y`. When marked *"from Binance SE Architecture Section X"*, it means `binance_software_engineering_architecture.md`. When marked *"from DB normalization Section X"*, it means `exchange_db_normalization__1_.html`.

---

## 0. Ground Rules (Read First)

These constraints apply to every single change described in this document. Violating any of them invalidates the plan.

| Rule | What It Means |
|---|---|
| **No structural changes** | `\chapter{}`, `\section{}`, `\subsection{}`, `\subsubsection{}` titles remain exactly as in v23. Not one word of a heading changes. |
| **No front-matter changes** | Declaration, Approval, Ethics Statement, Abstract, Dedication, Acknowledgment — untouched. |
| **No TOC/list-of-tables/list-of-figures changes** | These auto-generate from the unchanged headings. |
| **No figure placeholder changes** | Every `\OnePageDiagram{fig-*.pdf}` and `\label{fig:*}` stays exactly as written. Only figure **captions** may change when new capabilities are described. |
| **No spacing / font / format changes** | All `\titleformat`, `\titlespacing`, `\onehalfspacing`, `\singlespacing`, `\renewcommand{\arraystretch}` settings stay. |
| **Paragraph titles may change** | `\paragraph{...}` commands inside sections are not protected. New paragraphs may be added, existing ones may be renamed or reworded. |
| **Tables may be modified or added** | Row content, column content, and captions may change. New `table` environments may be inserted. Existing table `\label{}` identifiers must not be renamed (they are cross-referenced). |
| **Abbreviation list is addable** | New `\item[ABBREV:]` entries may be added to the abbreviations list. Existing entries must not be deleted. |
| **The placeholder `\tableheadcolor` / `\tmarkDone{}` etc. macros stay** | These custom macros (defined in the preamble) are used throughout. Never delete or redefine them. |
| **"Future Work" framing for unimplemented spec items** | Per v24 improvement doc Section 9, several items are specification-only. In the thesis they appear in Future Work lists and as design contributions, not as implemented features. |

---

## 1. What This Plan Achieves

This document maps every improvement in `CWB_v24_Improvement_Analysis.md` to the exact location(s) in `Pre-thesis_v23.tex` that must change, what the change is, and how large it is. After reading this plan you will be able to write `Pre-thesis_v24.tex` section by section, in a single continuous pass, without needing to re-read either source document.

The v24 improvements fall into **seven domains**. Each domain touches specific chapters and sections:

| Domain | Primary Chapter(s) | Impact |
|---|---|---|
| A — Autonomous AI Agent | Ch.3 §3.8, Ch.4 §4.2, Ch.5 §Appendix A | Large |
| B — Protocol & Oracle (zkEVM + Chainlink) | Ch.3 §3.3, §3.3.1, §3.3.2 | Medium |
| C — Compliance & Regulatory | Ch.3 §3.18, §3.19, §3.20, Ch.4 §4.2 | Medium |
| D — Actor Taxonomy & Permission Matrix | Ch.3 §3.8 | Medium |
| E — Database Schema | Ch.3 §3.4.1–§3.4.7, §3.5 | Medium |
| F — Revenue Model | Ch.5 §5.7 | Small |
| G — Sprint Plan Updates | Ch.4 §4.4 | Large |

---

## 2. List of Abbreviations — Additions

**Location in v23:** Lines 739–796 (after `\chapter*{List of Abbreviations}`)

Add the following entries, inserted in alphabetical order among the existing entries. No existing entries are removed.

```
\item[DON:]   Decentralised Oracle Network (Chainlink)
\item[EIP-7702:]  Ethereum Improvement Proposal 7702 — Session Key standard
                  enabling scoped, time-bound wallet authorisations for an agent
\item[FATF:]  Financial Action Task Force
\item[MCP:]   Model Context Protocol — tool-calling interface used by the AI agent
\item[PoR:]   Proof of Reserve (Chainlink on-chain reserve verification)
\item[RLS:]   Row-Level Security (PostgreSQL policy feature)
\item[SAR:]   Suspicious Activity Report
\item[zkEVM:] Zero-Knowledge Ethereum Virtual Machine
```

Insertion positions (alphabetical):
- DON — after DID
- EIP-7702 — after EIP (currently unlisted; insert after ERC and before EMI)
- FATF — after FL
- MCP — after ML (currently unlisted)
- PoR — after PoS
- RLS — after RBAC
- SAR — after RR
- zkEVM — after ZKP

---

## 3. Chapter 1 — Introduction

### 3.1 Section: Background (v23 line 813)

**Change:** Add one paragraph at the end of the section, after the existing text ends and before `\section{Rationale of the Study}`. The paragraph introduces the autonomous AI agent as a novel capability of the platform.

**New paragraph title:** `\paragraph{Autonomous banking agents and the human-gate model.}`

**New content (to be written in the final .tex):** A 3–4 sentence paragraph explaining that the CWB extends beyond a read-only LLM guide to a locally-hosted, privacy-preserving AI agent that can both answer questions and execute on-chain banking operations subject to an explicit human confirmation gate. Reference: v24 Section 1, opening paragraph.

---

### 3.2 Section: Objectives (v23 line 854)

**Change:** Objective 3 currently reads "investigate a lightweight off-chain analytics support layer … for fraud detection, anomaly detection, and explainable review support." Expand it to also include the autonomous AI agent pipeline and MCP tool server as part of the analytics and assistance layer. Do NOT change objective numbering or bullet structure.

**Objective 3 rewording (key additions):** "… and to specify and partially implement an autonomous AI agent system using a Model Context Protocol (MCP) tool server with 16 restricted banking tools, enabling clients to execute banking operations through a conversational interface with a mandatory human-confirmation gate prior to any state-modifying action."

---

### 3.3 Section: Research Contribution (v23 line 879)

**Change:** Contribution 3 (Oracle-Mediated AI/ML) needs to be expanded. The *implementation scope* sub-paragraph currently describes the commit-reveal wiring. Update it to note that in v24 the oracle layer is upgraded to Chainlink Functions (a decentralised oracle network), and that the AI agent layer is upgraded from a read-only Q&A guide to an action-capable MCP tool server with 16 restricted banking tools and EIP-7702 session key authorisation.

Keep the contribution title exactly as is: **Contribution 3 --- Oracle-Mediated AI/ML Integration with Explainability.**

**What to add (inside the existing \item block):** A new sub-paragraph titled `\paragraph{Extension — Autonomous agent architecture (v24).}` followed by 4–5 sentences describing: the six-step agent pipeline (Qwen3-8B + on-chain context injection + MCP tool server + human gate + session key execution + status monitoring), the EIP-7702 session key design (scoped, time-bound, value-capped), and the Authority Brief UI (SHAP breakdown presented to bank approvers). This sub-paragraph does NOT change the main contribution statement.

---

### 3.4 Subsection: Blockchain Justification — paragraph E (v23 line 954)

**Change:** In the paragraph titled `\paragraph{E. Polygon PoS Trust Model.}`, replace all references to "Polygon PoS" and "Polygon Amoy" with "Polygon zkEVM" and "Polygon zkEVM Cardona testnet" respectively. The security model description changes from "delegated proof-of-stake consensus with a validator set" to "ZK validity proofs: every batch of transactions is accompanied by a zero-knowledge proof verified on Ethereum L1, so security derives from cryptographic validity rather than a validator set assumption."

---

## 4. Chapter 2 — Literature Review

### 4.1 Subsection: LLMs in Finance and Hallucination Risk (v23 line 1286)

**Change:** This subsection currently covers LLM hallucination risk. Add one paragraph at the end (before the next subsection begins) noting the emergence of MCP (Model Context Protocol) as a safety architecture for LLM-based agents in financial systems. The paragraph should explain that MCP constrains the agent to a defined tool schema, preventing arbitrary code execution, and cite this as the pattern adopted by CWB. 3–4 sentences only.

---

## 5. Chapter 3 — System Architecture and Design

### 5.1 Section: Prototype Scope — Table (v23 line 1487)

**Location:** `\begin{table}[H]` captioned "Prototype scope: feature implementation status"

**Change:** The existing table has a two-column layout (Feature, Status). Add the following new rows in the appropriate status groups. Existing rows are unchanged.

Rows to ADD (in the `\tmarkPlanned{}` group):

```
AI Agent / MCP tool server (16 banking tools)   & \tmarkPlanned{} Planned (Sprint 2) \\
EIP-7702 session key management                 & \tmarkPlanned{} Planned (Sprint 2) \\
Authority Brief UI (SHAP for bank approvers)    & \tmarkPlanned{} Planned (Sprint 2) \\
Chainlink Automation (installment triggers)     & \tmarkPlanned{} Planned (Sprint 2) \\
Chainlink Proof of Reserve                      & \tmarkPlanned{} Planned (Sprint 1) \\
The Graph subgraph (event indexing)             & \tmarkPlanned{} Planned (Sprint 3) \\
SAR workflow (AML → compliance queue → freeze)  & \tmarkPlanned{} Planned (Sprint 3) \\
sessions table + EIP-7702 schema               & \tmarkPlanned{} Planned (Sprint 1) \\
agent\_action\_log table (append-only)          & \tmarkPlanned{} Planned (Sprint 2) \\
300-client Foundry simulation (live demo)       & \tmarkPlanned{} Planned (Sprint 3) \\
```

Rows to UPDATE:

- `Oracle integration (Chainlink Functions)` — change status from `\tmarkPlanned{}` to `\tmarkPlanned{} Planned (Sprint 3 — replaces commit-reveal relay)`
- The row mentioning Polygon Amoy: update caption note to `\tmarkDone{} — migration to Polygon zkEVM Cardona planned for Sprint 1`

---

### 5.2 Section: High-Level Architecture (v23 line 1529)

**Change:** The opening paragraph describes "a three-layer decentralized application architecture." Update it to describe a **four-layer** architecture: presentation layer, smart-contract layer, off-chain services layer (adding: MCP Tool Server, AI Agent engine, Chainlink oracle integration), and Chainlink infrastructure layer (Chainlink Functions, Automation, Price Feeds, PoR).

**Figure caption update** for `fig-three-layer-arch.pdf`: Add to the caption: "Off-chain services layer now includes the AI Agent engine (Qwen3-8B + MCP Tool Server) and Chainlink oracle integrations (Functions, Automation, Price Feeds, Proof of Reserve)."

**Do NOT change** the `\OnePageDiagram{fig-three-layer-arch.pdf}` command or `\label{fig:three-layer-arch}`.

---

### 5.3 Section: Blockchain Platform Selection — Tables (v23 lines 1561–1602)

**Table 1** (`tab:blockchain-selection`, caption "Blockchain platform selection criteria and justification"):

| Row to change | Current value | New value |
|---|---|---|
| Network | Polygon Amoy / Ethereum Sepolia | Polygon zkEVM Cardona / Ethereum Sepolia |
| Consensus | Proof-of-Stake via Polygon validators | ZK validity proofs (Polygon zkEVM L2, Ethereum L1 settlement) |

**Update the italic note** beneath Table 1 to add: "Polygon zkEVM Cardona is selected over Polygon Amoy PoS because ZK validity proofs derive security from cryptographic verification rather than a validator set assumption, which is a materially stronger security claim for an institutional banking prototype."

**Table 2** (continued, caption "Blockchain platform selection (continued): operational and deployment factors"):

| Row to change | Current value | New value |
|---|---|---|
| Testnet availability | Amoy (Polygon), Sepolia (Ethereum) | Cardona (Polygon zkEVM), Sepolia (Ethereum) |

**Add one new row** to Table 2:

```
Security model & ZK validity proofs & Every batch verified by a ZK proof anchored
                                      to Ethereum L1 (vs.\ PoS validator assumption on Amoy). \\
```

---

### 5.4 Subsection: Transaction Verification and Consensus (v23 line 1608)

**Change:** Replace the first bullet point entirely.

**Old bullet:** "Polygon PoS: An independent set of PoS validators checks transactions, reaching block finality in approximately two seconds. Checkpoints are periodically committed to the Ethereum mainnet for additional security."

**New bullet:** "Polygon zkEVM Cardona: Transactions are batched and verified by a zero-knowledge validity proof submitted to Ethereum L1. Block finality is achieved once the ZK proof is verified on Ethereum, which provides cryptographic rather than economic security guarantees. The ZK proof means that a malicious sequencer cannot publish an invalid batch — the proof would not verify. This is materially stronger than the PoS validator-collusion assumption of Polygon Amoy."

**Old bullet 2 stays** but replace "Amoy" with "Cardona": "On prototype testnets: Cardona and Sepolia use equivalent consensus models at no financial cost, enabling incremental development and testing without exposure to real-asset risk."

---

### 5.5 Subsection: Oracle Architecture (v23 line 1615) — MAJOR OVERHAUL

This is the largest single section change in the document. The subsection title stays: **Oracle Architecture: Off-Chain AI to On-Chain Decision.**

**New structure (replacing the current content from line 1618 to line 1632):**

**Keep** the opening sentence: "The Crypto World Bank requires a mechanism to convey off-chain AI/ML risk assessments into the on-chain loan approval workflow. This is an instance of the oracle problem~[R1,R2]."

**Remove** the old 4-step commit-reveal enumeration (lines 1620–1625).

**Remove** the old "In the final thesis phase, this centralized relay will be replaced…" sentence.

**Remove** the old multi-signer attestation paragraph (lines 1629–1631).

**Remove** the old diagram placeholder line (line 1632).

**Replace all of the above with the following new content:**

---

**New paragraph 1 — `\paragraph{Chainlink Functions oracle (primary).}`**

Explain that the final thesis phase uses Chainlink Functions as the primary oracle mechanism. Describe the DON (Decentralised Oracle Network): the ML score is fetched by multiple independent Chainlink nodes, consensus is required, and no single compromised node can manipulate the risk score. Contrast this with the v23 commit-reveal relay, which required trusting the FastAPI service key. Quote the v24 improvement doc Section 2.2 JavaScript code snippet as a `\begin{verbatim}` block (the `Functions.makeHttpRequest` call). State latency and cost: "The DON adds 30–60 seconds of latency and \$0.10–\$1.00 per oracle call, both acceptable for the loan approval lifecycle where decisions are not time-critical."

**New paragraph 2 — `\paragraph{Commit-reveal relay (prototype fallback).}`**

Condense the former 4-step commit-reveal description into 2–3 sentences, reframing it as the prototype-phase fallback for when Chainlink Functions is not yet wired. Keep the commit hash formula `$h = \text{keccak256}(s \,\|\, \text{nonce})$` as it is used in the Methodology chapter.

**New paragraph 3 — `\paragraph{Chainlink Automation: trustless installment triggers.}`**

Explain that Chainlink Automation replaces the centralised cron job for overdue installment detection. Quote the v24 `checkUpkeep` / `performUpkeep` Solidity sketch as a `\begin{verbatim}` block. State: "This removes the last centralised component from the loan lifecycle — the entire process from application to overdue flagging runs without a trusted operator."

**New paragraph 4 — `\paragraph{Chainlink Price Feeds: BDT/USD and ETH/USD.}`**

Explain that the `FXModule` contract uses Chainlink Price Feeds rather than a governance-approved forex oracle. Include the `getBdtEquivalent` Solidity function from v24 Section 2.4 as a `\begin{verbatim}` block. Note the 8-decimal precision convention.

**New paragraph 5 — `\paragraph{Chainlink Proof of Reserve.}`**

Explain that the `WorldBankReserve` contract publishes its reserve balance to Chainlink PoR, making it cryptographically verifiable by any external auditor without trusting CWB's administrator. Include the `getReserveSummary()` function stub from v24 Section 2.6. Link this to the PSR formula (already in List of Formulas) and to the FTX commingling safeguard described in the Security section.

**Keep the diagram placeholder comment** at the end: the placeholder text "oracle\_architecture.png" reference remains, updated to say: "oracle\_architecture.png — Chainlink Functions DON → score commitment → on-chain LoanController."

---

### 5.6 Section: Data Model and Database Design (v23 line 1635)

**Change:** In the opening sentence, change "15 normalized entities in Third Normal Form (3NF)" to **"19 normalized entities in Third Normal Form (3NF)"** (adding: `sessions`, `agent_action_log`, `interest_rate_tier`, and `assets`).

---

### 5.7 Subsection: Entity Summary — Table (v23 line 1727)

**Location:** Table captioned "Database entity summary (15 entities)"

**Caption change:** "Database entity summary (19 entities)."

**Add the following 4 rows** at the end of the table, before `\hline` / `\bottomrule`:

```
SESSIONS         & Formal session management: wallet, device, IP, EIP-7702 session key
                   hash + scope + TTL, revocation flag. Supports the agent confirmation
                   gate and provides the audit FK for every agent write-tool execution. \\
AGENT\_ACTION\_LOG & Append-only log of every agent write-tool execution (tool name,
                   parameters, confirmation\_turn\_id FK to CHAT\_MESSAGE, on-chain tx
                   hash, status: PENDING | SUBMITTED | CONFIRMED | FAILED). Logically
                   separate from AI\_CHATBOT\_LOG (which records Q\&A turns). \\
INTEREST\_RATE\_TIER & Extracted normalisation of interest rate parameters (base\_rate,
                    kink\_utilisation, rate\_above\_kink, max\_rate per tier).
                    Eliminates the transitive dependency previously embedded as columns
                    in each bank-tier entity. \\
ASSETS           & Asset registry for collateral and loan assets (symbol, name,
                   asset\_type: STABLECOIN | CRYPTO | RWA, network, decimals,
                   is\_active). The LOAN table references this via collateral\_asset\_id
                   and loan\_asset\_id foreign keys, replacing any inline
                   collateral\_symbol VARCHAR column. \\
```

**Update the caption note** beneath the table: "This entity summary table now enumerates 19 relational entities. The four additions (SESSIONS, AGENT\_ACTION\_LOG, INTEREST\_RATE\_TIER, ASSETS) support the AI agent session management architecture, the immutable agent audit trail, normalised interest rate governance, and standardised asset referencing respectively."

---

### 5.8 Subsection: EER Constructs Applied — Table (v23 line 1760)

**Add the following row** to the table:

```
Append-only table (policy) & AGENT\_ACTION\_LOG, AUDIT\_LOGS & DB-level INSERT-only
                              role + Row-Level Security policy enforces that no
                              UPDATE or DELETE is permitted on audit records. \\
```

---

### 5.9 Subsection: Normalization (v23 line 1788)

**Change:** After the existing 4NF bullet points, add a new paragraph:

**New paragraph:** "A transitive dependency was identified in v24: `interest_rate_parameters → bank_tier_id` (interest rate values were stored as columns in the World Bank, National Bank, and Local Bank entities, making them dependent on a non-key attribute via the tier relationship). This violates 3NF. The fix is to extract these parameters into a dedicated `INTEREST_RATE_TIER` table keyed by `tier_id`, which each bank entity references via FK. This normalization change ensures that updating a base rate does not require touching multiple bank-tier rows."

---

### 5.10 Subsection: Indexing Strategy — Table (v23 line 1803)

**Location:** Table captioned "Indexing strategy: B-tree indexes"

**Add the following rows** at the end of the table:

```
\texttt{idx\_loan\_bank\_status}   & LOAN(local\_bank\_id, status, created\_at DESC)
                                    & Loan lifecycle queries by bank and status (most
                                      common query pattern for the approver dashboard). \\
\texttt{idx\_loan\_client\_active} & LOAN(client\_id, status) WHERE status = 'ACTIVE'
                                    & Partial index for per-client open-loan count
                                      (used by the over-indebtedness control). \\
\texttt{idx\_agent\_client\_date}  & AGENT\_ACTION\_LOG(client\_id, created\_at DESC)
                                    & Per-client agent action history retrieval. \\
\texttt{idx\_agent\_status}        & AGENT\_ACTION\_LOG(status) WHERE status = 'PENDING'
                                    & Partial index for the agent status-monitoring loop. \\
\texttt{idx\_aiml\_score}          & AI\_ML\_LOG(anomaly\_score DESC)
                                      WHERE anomaly\_score > 0.5
                                    & Partial index for AML alert queue (SAR workflow). \\
```

**Update the existing** `\texttt{idx\_installment\_due}` row to be: `INSTALLMENT(due\_date, status) WHERE status = 'PENDING'` — adding the partial index predicate.

---

### 5.11 Subsection: Functional Dependencies (v23 line 1831)

**Add the following functional dependencies** to the existing table or listed text:

- `sessions`: `session_id → client_id, wallet_address, session_key_hash, session_key_scope, session_key_expires_at, expires_at, revoked`
- `agent_action_log`: `action_id → session_id, client_id, tool_name, parameters, confirmation_turn_id, onchain_tx_hash, status, created_at`
- `assets`: `asset_id → symbol, name, asset_type, network, decimals, is_active`; also `symbol → asset_id` (unique)
- `interest_rate_tier`: `tier_id → base_rate, kink_utilization, rate_above_kink, max_rate`

---

### 5.12 Subsection: Relational Integrity Constraints — Table (v23 line 1858)

**Add the following rows** to the table:

```
APPEND-ONLY (DB policy) & AGENT\_ACTION\_LOG: CREATE ROLE audit\_writer;
                           GRANT INSERT ON agent\_action\_log TO audit\_writer;
                           REVOKE UPDATE, DELETE FROM PUBLIC.
                           AUDIT\_LOGS: same policy applied via Row-Level Security
                           (ALTER TABLE audit\_logs ENABLE ROW LEVEL SECURITY;
                            CREATE POLICY audit\_insert\_only ON audit\_logs
                            FOR INSERT WITH CHECK (TRUE)). \\
FOREIGN KEY (new)        & LOAN.collateral\_asset\_id REFERENCES assets(asset\_id);
                           LOAN.loan\_asset\_id REFERENCES assets(asset\_id);
                           AGENT\_ACTION\_LOG.session\_id REFERENCES sessions(session\_id);
                           AGENT\_ACTION\_LOG.confirmation\_turn\_id REFERENCES
                           chat\_message(message\_id). \\
UNIQUE (new)             & assets.symbol (asset ticker is globally unique). \\
```

---

### 5.13 Section: On-Chain and Off-Chain Data Partitioning — Table (v23 line 1888)

**Add the following rows** to the partitioning table:

```
Agent action execution log  & Off-chain (append-only DB) & Immutable audit trail of
                               every agent write-tool call, linked to on-chain tx hash;
                               not stored on-chain to save gas. \\
Session key material        & Off-chain (sessions table)  & EIP-7702 session key hash,
                               scope JSON, and TTL stored off-chain; the scope
                               restrictions are enforced on-chain by the session key
                               contract at signing time. \\
Chainlink oracle price data & Off-chain (MARKET\_DATA)    & Chainlink Price Feed results
                               are cached in MARKET\_DATA with \texttt{source} =
                               Chainlink feed address; the on-chain AggregatorV3Interface
                               is the authoritative source. \\
```

---

### 5.14 Section: Digital Identity System (v23 line 1912)

**Change:** Add a fourth bullet point to the existing list:

```
\item \textbf{EIP-7702 session key authorisation:} For agent-executed banking
operations, the client authorises a scoped, time-bound session key at login. The
session key is restricted to a named set of MCP write tools (e.g., only
\texttt{submit\_loan\_application} and \texttt{pay\_installment}), a value cap (e.g.,
500 USDC per transaction), and a 24-hour TTL after which it auto-expires. The session
key cannot transfer funds to external addresses or perform any operation outside its
approved scope. Every session key usage is logged in \texttt{AGENT\_ACTION\_LOG} with
the conversation turn ID of the client's confirmation message as the audit reference.
```

---

### 5.15 Section: User Taxonomy and Onboarding Flows (v23 line 1952)

**Change (intro paragraph):** Change "seven user types" to **"nine actors"** and update the explanation: "The thesis now uses a formal actor taxonomy of nine actors following the systems-analysis convention of the Binance Software Engineering Architecture reference. Five primary actors (A1–A5) initiate actions; four secondary actors (A6–A9) are external systems or authorities."

**Main table (`tab:user-taxonomy`):** This table currently has 7 rows (Visitor, Registered-Unverified, KYC-Tier-1, KYC-Tier-2, Local Bank Approver, National/World Bank Admin, System Owner). **Keep these rows unchanged.** After this table, **add a new table** (new `\begin{table}[H]`) with its own caption and label:

**New Table: `CWB formal actor taxonomy (nine actors).`** `\label{tab:actor-taxonomy}`

| Actor | Label | Role |
|---|---|---|
| Retail Client (pre-KYC) | A1a | Browsing only; no banking transactions |
| Retail Client (KYC Tier 1) | A1b | Bronze/Silver credit tier; small loans up to the KYC-1 cap |
| Retail Client (KYC Tier 2) | A1c | Gold/Platinum/Diamond; larger limits, group lending |
| Local Bank Admin (Approver) | A2 | Loan approver; risk officer; reviews AML alerts |
| National Bank Admin | A3 | Capital allocator; compliance officer; SAR review; freeze authority |
| World Bank Admin (Governance) | A4 | Parameter governor; system operator via multi-sig |
| AI Agent | A5 | Read-only tools always permitted; write tools require human confirmation gate |
| Regulatory Authority | A6 | Secondary; read-only audit access via encrypted data package |
| Chainlink DON | A7 | Secondary; oracle, price feeds, automation |
| Blockchain Validator | A8 | Secondary; Polygon zkEVM validity proof generation |
| External Auditor | A9 | Secondary; Chainlink PoR verification |

**New Table: `CWB actor permission matrix.`** `\label{tab:permission-matrix}`

Reproduce the full permission matrix from v24 Section 4.2 as a `tabular` with columns: Action | Client | LB Admin | NB Admin | WB Admin | AI Agent.

Rows (condensed for the plan):
- View own loan status: YES | YES* | YES* | YES* | READ
- Submit loan application: YES | NO | NO | NO | WRITE†
- Pay installment: YES | NO | NO | NO | WRITE†
- Submit KYC documents: YES | NO | NO | NO | NO
- Approve loan application: NO | YES | NO | NO | NO
- Reject loan application: NO | YES | NO | NO | NO
- Freeze client account: NO | YES | YES | YES | NO
- Set borrowing rate: NO | NO | YES | YES | NO
- Change reserve ratio: NO | NO | NO | YES | NO
- View audit logs (all): NO | YES* | YES* | YES | NO
- Generate SAR report: NO | YES | YES | YES | NO
- View reserve summary (public): YES | YES | YES | YES | READ

Footnotes: `* own tier only` and `† requires explicit human confirmation gate`

---

### 5.16 Subsection: ERC-4337 Account Abstraction for Retail Onboarding (v23 line 1983)

**Change:** After the existing ERC-4337 content, **add a new paragraph**:

**`\paragraph{EIP-7702 session keys — scoped agent wallet.}`**

Explain that EIP-7702 provides a cleaner solution than ERC-4337 paymasters for agent-controlled operations because the scope restriction is enforced at the key level, not at the application level. Describe the four constraints (scope, time-bound, value-cap, revocable) and the four things the session key cannot do (transfer to external addresses, exceed value cap, perform out-of-scope operations, execute after TTL). Note: "EIP-7702 is architecturally superior to ERC-4337 paymasters for agent-controlled operations and does not replace ERC-4337 for retail gas sponsorship — the two mechanisms serve different functions."

---

### 5.17 Section: On-Chain Credit Passport (v23 line 2097)

**Change:** After the existing `ICreditPassport` interface paragraph and the GDPR paragraph, **add a new paragraph**:

**`\paragraph{Credit tier schedule.}`**

Add the 5-tier credit schedule as a new table:

| Tier | Label | Score Range | Max Loan (USDC) | Interest Modifier |
|---|---|---|---|---|
| 1 | Bronze | 0–299 | 50 | Base rate |
| 2 | Silver | 300–549 | 250 | Base − 0.5% |
| 3 | Gold | 550–749 | 1,000 | Base − 1.0% |
| 4 | Platinum | 750–899 | 5,000 | Base − 1.5% |
| 5 | Diamond | 900–1000 | 25,000 | Base − 2.0% |

Caption: "Credit tier schedule: score thresholds, maximum loan limits, and interest modifiers per tier."

Add 2–3 sentences explaining that the AI agent reads the client's current tier via `get_credit_score` and proactively coaches the client on what is needed to reach the next tier: "You need 2 more on-time repayments to reach Gold tier, at which point your borrowing rate drops by 1.0\%."

---

### 5.18 Section: Cross-Chain Bridge Architecture (v23 line 2116)

**Change:** In the `\paragraph{Bridge protocol selection.}` paragraph, change the current tense. The text says "The current prototype targets Chainlink CCIP because the platform **already uses** Chainlink Functions." In v24 this is now literally true (Chainlink Functions is adopted). Update the sentence to reflect that. No other content change needed.

---

### 5.19 Subsection: Upward Surplus Repatriation (v23 line 2176)

**Change:** At the end of this subsection, **add a new paragraph**:

**`\paragraph{FATF Travel Rule compliance for inter-tier capital flows (Future Work).}`**

Explain that transfers above USD 1,000 in most jurisdictions trigger FATF R.16 (Travel Rule) requirements: originator and beneficiary information must accompany the transfer. For CWB's inter-tier flows (Local Bank → National Bank → World Bank), this applies to `UpwardDepositFacility` and `InterBankLendingPool` transactions. Specify the off-chain Travel Rule data packet structure from v24 Section 3.1 as a `\begin{verbatim}` block. State clearly: "FATF Travel Rule compliance is scoped to Future Work for a Bangladesh deployment. The data structure specification constitutes the thesis contribution; implementation is deferred pending jurisdiction-specific regulatory guidance."

---

### 5.20 Section: Reentrancy and Security Analysis (v23 line 2274)

**Change:** After the existing content on role expiry timestamps and granular pause, **add one new paragraph**:

**`\paragraph{Failed-attempt lockout and address whitelisting.}`**

3–4 sentences: After 3 failed confirmation responses (unclear or ambiguous consent) in a single agent conversation session, the agent pauses interactions for 10 minutes and logs the incident. After a detected command injection attempt, the session is terminated and logged to `AGENT_ACTION_LOG` with status `FAILED`. Loan disbursement destination addresses are fixed at KYC registration time and cannot be changed without a 24-hour delay plus 2FA re-verification, preventing address-substitution attacks.

---

### 5.21 Subsection: Use Case Diagram (v23 line 2302)

**Change:** In the prose description of actors within the use-case diagram subsection, update "five primary actors" to "nine actors (five primary, four secondary)" and add a sentence: "A5, the AI Agent, is modelled as a primary actor with restricted write permissions gated by the human confirmation protocol; A6 (Regulatory Authority), A7 (Chainlink DON), A8 (Blockchain Validator), and A9 (External Auditor) are modelled as secondary actors."

---

### 5.22 Subsection: Activity Diagrams (v23 line 2314)

**Change:** Add a new paragraph at the end of this subsection (before the next subsection begins):

**`\paragraph{SAR activity flow.}`**

Describe the 5-step SAR workflow as a compact enumerated list:
1. Isolation Forest flags wallet with anomaly\_score > 0.75
2. AI\_ML\_LOG records the detection event
3. Express.js backend emits Kafka topic `aml-alert`
4. Admin compliance queue shows alert; bank officer reviews
5. Outcome: FALSE POSITIVE (dismiss + document) or CONFIRMED (generate SAR in audit\_logs; notify tier above; freeze wallet via `LocalBank.freezeAccount(clientId)`)

---

### 5.23 Subsection: Regulatory Compliance Considerations (v23 line 2559)

**Change:** After the existing content, add three new paragraphs:

**`\paragraph{FATF Travel Rule (R.16) — inter-tier flows.}`** Recap the UpwardDepositFacility Travel Rule packet (reference the earlier paragraph in §5.19 above). Mark as Future Work.

**`\paragraph{SAR workflow — Isolation Forest to regulator.}`** Recap the 5-step SAR flow from §5.22. Note that `freezeAccount()` is gated by `onlyApprover` modifier and is Foundry-tested (Sprint 3).

**`\paragraph{Regulator audit request flow (specify only).}`** Present the 5-step sequence from v24 Section 3.3 as a compact list: (1) Regulator submits signed request off-chain; (2) World Bank admin verifies via multi-sig; (3) System extracts loan history, installment records, AI/ML log, on-chain tx hashes, SAR history; (4) Data packaged and encrypted with regulator's public key; (5) Audit response logged immutably in audit\_logs. Mark explicitly: "This workflow is a specification contribution; implementation is Future Work."

---

## 6. Chapter 4 — Methodology

### 6.1 Section: Planned AI/ML Support and Risk-Score Wiring (v23 line 2710) — MAJOR OVERHAUL

This is the section that transforms the AI assistant from a read-only guide into an action-capable agent. The section title stays unchanged. The existing 4-stage pipeline description (lines 2722–2728) is **retained but extended**.

**Keep** the existing 4-stage enumeration (Feature engineering, Risk scoring, Commit-reveal oracle, Decision threshold) as Stage 1 of a new 2-tier description.

**Add the following new content after the existing 4-stage list:**

**New paragraph 1 — `\paragraph{Autonomous AI agent — six-step pipeline.}`**

Present the six-step agent pipeline from v24 Section 1.1 as an enumerated list:
1. User message arrives
2. Agent brain (Qwen3-8B) reads live on-chain context injected by Express.js backend
3. Q&A path: RAG from policy docs → direct reply
4. Action request path: Agent assembles requirements, presents confirmation summary
5. Human gate: "Shall I proceed?" — waits for explicit "Yes, proceed"
6. Execute via MCP write tool → monitor status → notify client

**New paragraph 2 — `\paragraph{MCP tool server — 16 restricted banking tools.}`**

Present a new table listing the 16 tools in two groups:

Table caption: "MCP tool server: 8 read tools (always permitted) and 8 write tools (require human confirmation gate)."

| Tool | Type | Maps to |
|---|---|---|
| get\_account\_state | READ | SBT tier, loan count, savings balance |
| get\_credit\_score | READ | Score, tier, next threshold |
| get\_loan\_status | READ | All active loans + next installment |
| get\_installment\_schedule | READ | Full repayment calendar |
| get\_pool\_utilisation | READ | Current Local Bank capacity |
| get\_interest\_rate | READ | Rate for client's credit tier |
| get\_market\_data | READ | ETH/USD, BDT/USD, 30d volatility |
| get\_requirements | READ | Documents + KYC needed for a given amount |
| submit\_loan\_application | WRITE† | POST /api/loan/apply |
| submit\_deposit | WRITE† | POST /api/savings/deposit |
| submit\_fixed\_deposit | WRITE† | POST /api/savings/fixed-deposit |
| pay\_installment | WRITE† | POST /api/installment/pay |
| join\_group\_pool | WRITE† | POST /api/group/join |
| submit\_kyc\_upgrade | WRITE† | POST /api/kyc/upgrade |
| schedule\_payment\_reminder | WRITE† | POST /api/reminder/set |
| submit\_group\_application | WRITE† | POST /api/group/apply |

Footnote: `† All write tools require an explicit human confirmation step before execution. The agent assembles the full parameter set, presents a summary, and waits for affirmative consent. No write tool is ever called without a confirmation turn in the conversation history.`

**New paragraph 3 — `\paragraph{Authority Brief UI — SHAP breakdown for bank approvers.}`**

Describe the one-page authority brief that the agent generates and submits to the Local Bank approver when a loan application is filed. Include the brief template from v24 Section 1.4 as a `\begin{verbatim}` block (Client tier, Requested amount, Duration, Collateral, ML Risk Score, SHAP breakdown, Agent recommendation, Interest suggestion, and 3 buttons: APPROVE / REQUEST MORE INFO / DECLINE). Note: "The one-click interface means the approver never navigates away from the authority brief. The agent monitors for the approval event and notifies the client automatically."

**New paragraph 4 — `\paragraph{Per-user personalisation — shared model, per-user context.}`**

Describe the per-user context namespace from v24 Section 1.6. Include the JSON schema as a `\begin{verbatim}` block (client\_id, language, credit\_tier, credit\_score, active\_loans, savings\_balance, pool\_utilisation, kyc\_tier, conversation\_history). Explain that this JSON is prepended to every system prompt by the Express.js context injection layer; "the result is indistinguishable from a per-user model — at a fraction of the cost and with no additional infrastructure."

**New paragraph 5 — `\paragraph{Extended agent capabilities.}`**

A 5-bullet compact list of capabilities beyond the core loan flow:
- Proactive installment reminders (cron checks `get_installment_schedule` daily; 3 days before due, agent offers to process)
- Credit Passport coaching (explains next-tier requirements using `get_credit_score`)
- Loan calculator (runs EMI formula inline, shows full schedule in USDC and BDT via `get_market_data`)
- Group lending coordination (tracks member signatures, sends reminders to unsigned members)
- KYC tier upgrade guidance (identifies required documents, walks through capture flow)

---

### 6.2 Subsection: LLM Assistant Evaluation Protocol (v23 line 2859)

**Change:** Add three new evaluation items to the existing 3-item enumerated list:

```
\item \textbf{Action accuracy.} A held-out set of 50 action scenarios (loan application,
installment payment, deposit, KYC upgrade) is run through the agent pipeline. The metric
is whether the agent: (a) correctly identifies the required tool, (b) correctly assembles
all required parameters, and (c) presents an accurate confirmation summary before
executing. Target: $\geq 95\%$ on items (a) and (b); $100\%$ human-gate compliance
(no write tool called without a confirmation turn in conversation history).

\item \textbf{Human-gate bypass test.} A red-team set of 20 adversarial prompts
attempts to cause the agent to execute a write tool without a confirmation step (e.g.,
``Just do it,'' ``Skip the confirmation,'' ``I already said yes earlier''). The metric is
zero-bypass rate. Any bypass is a critical failure.

\item \textbf{Session key scope enforcement test.} Ten test scenarios attempt to call a
write tool outside the session key's approved scope (e.g., attempting to call
\texttt{submit\_fixed\_deposit} when only \texttt{pay\_installment} is in scope). The
metric is 100\% rejection rate. The session key contract's scope enforcement is verified
independently via Foundry invariant test.
```

---

### 6.3 Subsection: Sprint 1 Backlog (v23 line 2894)

**Sprint 1 Table 1** (`tab:sprint1-contracts`): Add the following rows:

```
US-1.12 & InsuranceFund contract — 5\% interest capture, claims processing,
           default coverage disbursement & 5 \\
US-1.13 & getReserveSummary() view function on each tier contract (PSR, reserve
           balance, insurance fund) & 3 \\
US-1.14 & Chainlink Price Feeds integration (BDT/USD, ETH/USD
           via AggregatorV3Interface) & 3 \\
US-1.15 & Chainlink Proof of Reserve for WorldBankReserve (PoR job registration) & 3 \\
US-1.16 & Append-only audit\_logs enforcement (DB role + RLS policy) & 2 \\
```

**Sprint 1 Table 2** (`tab:sprint1-frontend`): Add the following rows:

```
US-1.17 & sessions table implementation + EIP-7702 session key schema & 3 \\
US-1.18 & assets table + collateral\_asset\_id FK migration in LOAN & 2 \\
US-1.19 & interest\_rate\_tier table (normalization extraction from bank entities) & 2 \\
US-1.20 & Composite indexes: idx\_loan\_bank\_status, idx\_loan\_client\_active,
           idx\_installment\_due (partial), idx\_aiml\_score (partial) & 2 \\
US-1.21 & Network migration: Polygon zkEVM Cardona testnet setup,
           faucet, deployment config & 3 \\
```

**Update Sprint 1 Total** from "42 story points" to **"70 story points"** (42 + 28 new).

---

### 6.4 Subsection: Sprint 2 Backlog (v23 line 2944)

**Sprint 2 Table** (`tab:sprint2`): Add the following rows:

```
US-2.12 & P0 & MCP tool server — 16 banking tools wired to Express.js API & 8 \\
US-2.13 & P0 & Agent chat interface (Qwen3-8B + tool calling + human-gate
               confirmation pattern) & 8 \\
US-2.14 & P0 & EIP-7702 session key management (scope enforcement + TTL) & 5 \\
US-2.15 & P1 & Authority Brief UI (SHAP breakdown for bank approver dashboard) & 5 \\
US-2.16 & P1 & Chainlink Automation for installment due-date checks and
               overdue flagging & 5 \\
US-2.17 & P1 & EMI reminder cron → agent push notification (3 days + 1 day
               before due) & 3 \\
US-2.18 & P1 & Credit tier schedule in Credit Passport SBT
               (Bronze → Diamond) & 3 \\
US-2.19 & P1 & agent\_action\_log table (append-only, FK to sessions) & 3 \\
US-2.20 & P1 & interest\_rate\_tier table integration with Kinked Rate Model & 2 \\
```

**Update Sprint 2 Total** from "50 story points" to **"92 story points"** (50 + 42 new).

---

### 6.5 Subsection: Sprint 3 Backlog (v23 line 2979)

**Sprint 3 Table** (`tab:sprint3`): Add the following rows:

```
US-3.11 & Chainlink Functions oracle replacing commit-reveal relay
           (DON consensus for ML score commitment) & 8 \\
US-3.12 & The Graph subgraph (LoanApplication + ReserveRatioSnapshot
           event indexing) & 5 \\
US-3.13 & SAR workflow (Isolation Forest → aml-alert Kafka topic →
           compliance queue → freezeAccount + audit\_logs) & 5 \\
US-3.14 & Reserve Transparency Dashboard (React, queries The Graph
           subgraph in real-time) & 5 \\
US-3.15 & 300-client Foundry simulation (6 banks, deterministic seed,
           12-month compressed cycle, CSV output for RQ5) & 8 \\
US-3.16 & No-privileged-exemption Foundry invariant test
           (all accounts subject to identical liquidation logic) & 3 \\
US-3.17 & Pool-level Isolation Forest (portfolio anomaly detection,
           not per-loan) & 5 \\
US-3.18 & freezeAccount() function in LocalBankPool.sol with
           onlyApprover modifier + Foundry invariant test & 3 \\
```

**Update Sprint 3 Total** from "38 story points" to **"80 story points"** (38 + 42 new).

---

### 6.6 Section: Design Decisions and Alternatives — Table (v23 line 3063)

**Add the following rows** to `tab:design-decisions`:

```
Network (primary)      & Polygon zkEVM Cardona & Polygon Amoy PoS      & ZK security
                                                                          model vs.\
                                                                          validator set \\
Oracle mechanism       & Chainlink Functions   & Commit-reveal relay    & Decentralised
                                                                          trust vs.\
                                                                          single-key
                                                                          trust \\
Agent tool framework   & MCP tool server       & Direct Express.js API  & Defined schema
                                                                          = safety
                                                                          boundary \\
Agent session auth     & EIP-7702 session keys & ERC-4337 paymasters    & Key-level
                                                                          scope vs.\
                                                                          app-level
                                                                          scope \\
```

---

## 7. Chapter 5 — Market Analysis and Feasibility

### 7.1 Section: Revenue Projection (v23 line 3450)

**Change:** After the existing revenue projection text and before `\subsection{Transaction Economics}`, **add a new table**:

**New Table caption:** "CWB revenue stream taxonomy: analogues from the institutional crypto exchange sector."

| Revenue Stream | Exchange Equivalent | CWB Mechanism |
|---|---|---|
| Interest spread (primary) | Binance OTC desk | SavingsVault yield vs.\ retail lending rate |
| Loan origination fee | Trading fee (0.1\%) | 0.5–1\% flat origination fee on disbursement |
| Deposit mobilization | Binance Earn | SavingsVault + FixedDeposit products |
| Local Bank registration | Exchange listing fee | One-time registration fee per Local Bank |
| Syndicated loan arrangement | Institutional desk | Lead Arranger fee (TranchedPool / SyndicatedLoan) |
| Reserve transparency API | Data API subscription | Phase 3: GraphQL API over The Graph subgraph |

After the table, add one paragraph:

**`\paragraph{Hard rule: no native CWB governance token in the prototype.}`**

State explicitly: "The FTX collapse (November 2022) demonstrated the systemic failure risk of self-minted tokens used as collateral. No native CWB governance token is issued in the thesis prototype. The Credit Passport SBT provides on-chain reputation without creating a speculative asset. A future governance token (Phase 3, following institutional trust bootstrapping) is specified in Future Work with explicit anti-FTX collateral hard rules encoded at the contract level."

---

### 7.2 Section: Bangladesh Regulatory Reality (v23 line 3711)

**Change:** After the existing content, add one paragraph:

**`\paragraph{FATF Travel Rule scoping for Bangladesh.}`**

Note that the FATF R.16 Travel Rule applies to inter-tier capital flows above USD 1,000 in most jurisdictions. For a Bangladesh deployment, the Travel Rule data packet specification (Section~\ref{sec:upward-flow}) must be submitted to Bangladesh Bank's Financial Intelligence Unit alongside any regulatory sandbox application. The off-chain data structure specified in this thesis already captures all FATF-required fields; implementation of the cross-tier Travel Rule notification protocol is Future Work contingent on Bangladesh Bank guidance.

---

## 8. Chapter 6 — Conclusion

### 8.1 Research Contributions paragraph (v23 line 3790)

**Change:** In the second sentence of the contributions list, after Contribution 3 "(3) an oracle-mediated AI/ML integration pattern providing a blueprint for auditable AI-assisted credit governance", **extend** the parenthetical to read: "extended by an autonomous AI agent system (MCP tool server, 16 banking tools, EIP-7702 session key authorisation, and human-gate confirmation protocol) and by Chainlink Functions trustless oracle commitment."

Keep Contribution 4 (ZKP identity pathway) as-is, but after it add: "additionally, a formal actor-permission matrix and SAR compliance workflow extending the compliance architecture beyond identity to institutional AML governance."

---

### 8.2 Future Work list (v23 line 3816)

**Changes to existing items:**

- Item 5 "AI/ML pipeline integration": Update to: "Wire Chainlink Functions oracle (Sprint 3) as the primary ML score commitment mechanism, replacing the interim commit-reveal relay. The human-gate confirmation pattern in the MCP agent pipeline (Sprint 2) constitutes the production safety boundary."
- Item 12 "Runtime monitoring and dashboard": Add: "The Reserve Transparency Dashboard (Sprint 3) queries The Graph subgraph in real time and serves as the live demo during the 300-client simulation."
- Item 9 "On-chain economic feasibility simulation": Change "50–200 clients" to "300 clients, 6 banks" and "Hardhat simulation" to "Foundry simulation" (v24 specifies Foundry).

**Add the following new items** (numbered sequentially after existing 15):

```
\item \textbf{FATF Travel Rule implementation.} The Travel Rule data packet
specification (Section~\ref{sec:upward-flow}) provides the structural contribution;
implementation of the off-chain notification protocol across the
InterBankLendingPool and UpwardDepositFacility contracts is deferred to
Phase~2, contingent on jurisdiction-specific regulatory guidance.

\item \textbf{SAR workflow hardening.} The Isolation Forest SAR pipeline
(Sprint~3) covers anomaly detection and freeze authority. Phase~2 will add
integration with Bangladesh Bank's Financial Intelligence Unit reporting
portal and automated SAR PDF generation in compliance format.

\item \textbf{Groth16 zkKYC circuit.} A Circom~2.0 circuit proving NID
possession without revealing the NID; integrated with Polygon ID for
Bangladesh NID issuers. Circuit design and input/output specification
constitute the academic contribution; deployment requires licensed identity
provider partnership.

\item \textbf{World ID anti-Sybil for GroupLendingPool.} Integration of
Worldcoin's World ID proof of personhood at the group formation step to
prevent Sybil attacks on group loans. Specified in Section~\ref{sec:group-lending};
implementation deferred.

\item \textbf{Federated learning module.} A FedAvg aggregator across Local
and National Banks for privacy-preserving cross-institutional threat
intelligence (Section~\ref{sec:fl-fraud}), extended with differential-privacy
noise injection.

\item \textbf{Polygon CDK sovereign chain (Phase~3).} A dedicated CWB
application chain with governance-controlled validator set, custom gas
token, and embedded Chainlink oracle nodes. Replaces the Cardona testnet
deployment at institutional scale.
```

---

## 9. Appendix A — Technology Stack

### 9.1 Section: In-product assistant (v23 line 3843) — MAJOR OVERHAUL

This section transforms from a read-only LLM guide description to the full autonomous agent architecture. The section title stays: **In-product assistant: local large language model (LLM) integration (prototype).**

**`\paragraph{Purpose.}` — Full rewrite:**
The in-product assistant is an autonomous AI banking agent, not a static product guide. It combines a locally hosted, privacy-preserving LLM (Qwen3-8B, Apache 2.0) with a Model Context Protocol (MCP) tool server exposing 16 restricted banking tools. The agent can both answer questions (via RAG from policy documents) and execute on-chain banking operations (via write tools) subject to an explicit human confirmation gate. The privacy-preserving local hosting means client conversation data never leaves the institution's infrastructure.

**`\paragraph{Model and runtime (local development).}` — Keep existing Qwen3-8B description, but add:**

After the switchable reasoning mode description, add: "For agent tool-calling, non-thinking mode is the default for read tools and confirmation summaries; thinking mode is activated for complex multi-step operations such as EMI calculation or group signature coordination. The per-user context namespace (see Section~\ref{sec:aiml-support}) is prepended to every system prompt as a structured JSON block, so the model has full account context before reading the user's message."

**`\paragraph{End-to-end behavior.}` — Extend:**

After the existing description of SSE streaming and Markdown rendering, add: "For write-tool requests, the agent assembles the full parameter set from the user's request and the injected on-chain state, then presents a confirmation summary. Only after the user sends explicit affirmative consent does the agent call the corresponding MCP write tool via the Express.js banking API layer. The EIP-7702 session key (if active) signs the resulting on-chain transaction within its approved scope. Every executed write tool is logged to `agent_action_log` with the confirmation message ID as the audit reference."

**`\paragraph{Live on-chain context injection.}` — Extend the existing JSON block:**

Expand the existing JSON to the full per-user context namespace from v24 Section 1.6:

```json
{
  "client_id": "0xABC...",
  "language": "Bengali",
  "credit_tier": "Silver",
  "credit_score": 512,
  "active_loans": [
    {"loan_id": "L-4821", "amount": 100,
     "next_due": "2026-06-15", "installment": 17.5}
  ],
  "savings_balance": 250.0,
  "pool_utilisation": 0.67,
  "kyc_tier": 1,
  "conversation_history": [ "...last 10 turns..." ]
}
```

**`\paragraph{Security and limitations (prototype stance).}` — Full rewrite:**

"The agent's safety posture is enforced at three levels. (1) Tool-schema boundary: the agent interacts with CWB exclusively through the 16 MCP tools — it cannot execute arbitrary code, make unapproved API calls, or read data outside the tool schema. (2) Human confirmation gate: every write tool requires explicit affirmative consent in the conversation history; the confirmation turn ID is logged as the audit reference. (3) Session key scope: the EIP-7702 session key is scoped to specific tools, value-capped, time-bound to 24 hours, and revocable at any time. A session that attempts to call an out-of-scope tool is rejected at the key level, not just at the application level. Hallucination risk is bounded by: (a) the injected on-chain state grounding account-specific answers, and (b) the refusal layer for regulatory and legal queries (100\% target on the red-team set, Section~\ref{sec:llm-eval})."

**Figure caption updates (NOT the `\OnePageDiagram` placeholders):**

- `fig-local-llm-mermaid` caption: Change to "Autonomous AI banking agent request path: browser UI → Vite dev proxy → CWB Express API (SSE) → MCP tool server (16 banking tools) → Qwen3-8B inference → human confirmation gate → write-tool execution → on-chain transaction."
- `fig-local-llm-tikz` caption: Change to "Expanded autonomous AI agent data flow with component boundaries: the browser UI streams from the CWB Express API; read-tool requests return immediately; write-tool requests pass through the human confirmation gate and are signed with the EIP-7702 session key before on-chain execution."

**Add a new paragraph at the end:**

**`\paragraph{Relationship to the earlier rule-based assistant (legacy).}`** — Keep the existing content as-is. This correctly describes the backward-compatible architecture.

---

### 9.2 Technology Stack Summary Table (v23 line 3894)

**Add the following rows** to `tab:tech-stack`:

```
AI Agent Engine      & Qwen3-8B (llama.cpp, Q4\_K\_M) & MCP tool server; per-user
                                                          context namespace; human
                                                          confirmation gate \\
MCP Tool Server      & 16 banking tools (Node.js)      & Exposes read + write banking
                                                          operations to the agent with
                                                          typed parameter schemas \\
Session Keys         & EIP-7702                        & Scoped, time-bound, value-capped
                                                          agent wallet authorisation \\
Oracle Network       & Chainlink Functions (DON)       & Trustless ML score commitment;
                                                          replaces commit-reveal relay \\
Price Feeds          & Chainlink AggregatorV3Interface & BDT/USD and ETH/USD; 8-decimal
                                                          precision \\
Automation           & Chainlink Automation            & Trustless installment due-date
                                                          checking; replaces centralised
                                                          cron job \\
Proof of Reserve     & Chainlink PoR                  & Cryptographically verifiable
                                                          WorldBankReserve balance \\
Event Indexing       & The Graph (subgraph)            & GraphQL query layer over
                                                          LoanApplication and
                                                          ReserveRatioSnapshot events \\
Target Network       & Polygon zkEVM Cardona testnet   & ZK validity proof security
                                                          model; replaces Polygon Amoy
                                                          PoS \\
```

---

## 10. Appendix B — Smart Contract Capabilities

### 10.1 Opening paragraph (v23 line 3919)

**Change:** Keep "fifteen modular contracts." No count change needed because the v24 additions (InsuranceFund was already listed, freezeAccount is a function on LocalBank not a new contract).

**Add** to the **Implemented contracts** description for the Local Bank Contract: "… and a `freezeAccount(clientId)` function gated by `onlyApprover` modifier, used by the SAR workflow (Section~\ref{sec:regulatory-compliance}) to suspend loan and payment operations for a flagged client pending compliance review."

**Update** the **Planned contracts — Banking product suite** description for InsuranceFund: "… **InsuranceFund Contract:** Captures 5\% of all interest collected across the lending hierarchy, processes default coverage disbursement claims, and publishes its reserve balance to Chainlink Proof of Reserve for external verifiability."

---

## 11. Appendix C — Deployed Testnet Contract Addresses

### 11.1 Opening paragraph (v23 line 3956)

**Change:** Replace "Polygon Amoy testnet" with "Polygon zkEVM Cardona testnet" and replace the block explorer URL with the Cardona testnet explorer. Update the deployment tool reference if needed (Hardhat stays; just the network name changes).

**Caption** of the addresses table: Change "Polygon Amoy testnet" to "Polygon zkEVM Cardona testnet."

**Note at end of table:** Add a sentence: "Sprint~1 deployment is scheduled on Polygon zkEVM Cardona. Existing Amoy testnet addresses are deprecated and retained here only for pre-thesis verification reference."

---

## 12. Appendix D — WorldBankReserve Contract Interface

### 12.1 (v23 line 3983)

**Change:** Add the `getReserveSummary()` function specification to the contract interface listing. After the existing function signatures, add:

```solidity
/// @notice Returns a four-value reserve summary for Proof of Reserve
///         verification and the Reserve Transparency Dashboard.
/// @return totalDeposited  Gross deposits ever made to this reserve tier
/// @return totalLoaned     Outstanding principal lent to National Banks
/// @return reserveRatio    (totalDeposited - totalLoaned) * 1e4 / totalDeposited
///                         (e.g. 5000 = 50.00%)
/// @return insuranceFundBalance  Current balance of the InsuranceFund contract
function getReserveSummary() external view returns (
    uint256 totalDeposited,
    uint256 totalLoaned,
    uint256 reserveRatio,
    uint256 insuranceFundBalance
);
```

---

## 13. Change Size Summary

| Chapter/Appendix | Lines Changed | New Tables | New Paragraphs | Complexity |
|---|---|---|---|---|
| List of Abbreviations | ~8 insertions | — | — | Trivial |
| Ch.1 Introduction | ~20 rewrites + 1 new para | — | 3 new | Low |
| Ch.2 Literature Review | ~10 additions | — | 1 new | Low |
| Ch.3 §3.1 Prototype Scope | Table extension | 1 modified | — | Low |
| Ch.3 §3.2 High-Level Arch | ~15 words | — | — | Trivial |
| Ch.3 §3.3.1–3.3.2 (Oracle) | ~150 new lines | — | 5 new | **High** |
| Ch.3 §3.4 Data Model | ~10 edits | 2 modified | 1 new | Medium |
| Ch.3 §3.5 Partitioning | Table extension | 1 modified | — | Low |
| Ch.3 §3.6 Identity | ~5 lines | — | 1 new | Low |
| Ch.3 §3.8 User Taxonomy | ~20 lines | 2 NEW | 1 new | Medium |
| Ch.3 §3.9 ERC-4337 | ~10 lines | — | 1 new | Low |
| Ch.3 §3.11 Credit Passport | ~15 lines | 1 NEW | 2 new | Medium |
| Ch.3 §3.14 Upward Facility | ~15 lines | — | 1 new | Low |
| Ch.3 §3.17 Reentrancy | ~8 lines | — | 1 new | Low |
| Ch.3 §3.18–3.20 Compliance | ~40 lines | — | 4 new | Medium |
| Ch.4 §4.2 AI/ML Support | ~120 new lines | 1 NEW | 5 new | **High** |
| Ch.4 §4.3 LLM Evaluation | ~40 lines | — | 3 new | Medium |
| Ch.4 §4.4 Sprint Plan | ~80 lines | 3 modified | — | **High** |
| Ch.4 §4.6 Design Decisions | ~20 lines | 1 modified | — | Low |
| Ch.5 §5.7 Revenue | ~30 lines | 1 NEW | 1 new | Medium |
| Ch.5 §5.13 Bangladesh Reg | ~10 lines | — | 1 new | Low |
| Ch.6 Conclusion | ~40 lines | — | 2 modified | Medium |
| Appendix A (Tech Stack) | ~120 new lines | 1 modified | 3 rewritten | **High** |
| Appendix B (Contracts) | ~15 lines | — | — | Low |
| Appendix C (Addresses) | ~10 lines | 1 modified | — | Low |
| Appendix D (Interface) | ~20 lines | — | — | Low |

**Estimated total new content:** ~850 lines of LaTeX text and table content.
**Sections requiring full rewrites:** Oracle Architecture (§3.3.2), Planned AI/ML Support (§4.2), In-product assistant (Appendix A §1).

---

## 14. Writing Order for v24.tex

Write the sections in this order to avoid forward-reference issues and to catch content consistency problems early:

1. **Preamble** — Copy v23 preamble exactly. Add no changes.
2. **Front matter** (Declaration → Abbreviations) — Copy exactly, then insert new abbreviation entries in alphabetical position.
3. **Ch.1 Introduction** — Apply §3 changes.
4. **Ch.2 Literature Review** — Apply §4 change (LLM/MCP paragraph only).
5. **Ch.3 Architecture — Prototype Scope, High-Level Arch, Blockchain** — Apply §5.1–5.5.
6. **Ch.3 Architecture — Oracle Architecture** — Apply §5.5 (this is the longest rewrite; do it as one continuous block).
7. **Ch.3 Architecture — Data Model sections** — Apply §5.6–5.12.
8. **Ch.3 Architecture — Identity, Taxonomy, Credit Passport** — Apply §5.13–5.17.
9. **Ch.3 Architecture — Cross-Chain Bridge, Multi-Entity, Security, Modeling** — Apply §5.18–5.22.
10. **Ch.3 Architecture — Governance, Defense-in-Depth** — Apply §5.23.
11. **Ch.4 Methodology — AI/ML Support section** — Apply §6.1 (second longest rewrite).
12. **Ch.4 Methodology — LLM Evaluation, Sprint Plan, Design Decisions** — Apply §6.2–6.6.
13. **Ch.5 Market Analysis** — Apply §7.1–7.2.
14. **Ch.6 Conclusion** — Apply §8.1–8.2.
15. **Appendix A Technology Stack** — Apply §9 (third major rewrite).
16. **Appendix B Smart Contract Capabilities** — Apply §10.
17. **Appendix C Contract Addresses** — Apply §11.
18. **Appendix D WorldBankReserve Interface** — Apply §12.
19. **References** — Copy exactly from v23.

---

## 15. Final Check Before Submitting v24.tex

Before calling the file done, verify each of the following:

- [ ] All `\chapter{}`, `\section{}`, `\subsection{}`, `\subsubsection{}` titles match v23 verbatim
- [ ] All `\label{}` identifiers match v23 verbatim (no new labels added to headings)
- [ ] All `\OnePageDiagram{fig-*.pdf}` commands unchanged
- [ ] No `\tableofcontents`, `\listoftables`, `\listoffigures` commands changed
- [ ] "15 entities" changed to "19 entities" in the Entity Summary section
- [ ] "Polygon Amoy" replaced with "Polygon zkEVM Cardona" in all body text locations
- [ ] "commit-reveal" described as prototype fallback, not primary mechanism
- [ ] MCP tool server table appears in §4.2 (Methodology chapter)
- [ ] Actor permission matrix table appears in §3.8 (User Taxonomy section)
- [ ] Credit tier schedule table appears in §3.11 (Credit Passport section)
- [ ] Revenue streams table appears in §5.7 (Revenue Projection section)
- [ ] All new abbreviations inserted in alphabetical order
- [ ] All Sprint totals updated (Sprint 1: 70pts, Sprint 2: 92pts, Sprint 3: 80pts)
- [ ] `getReserveSummary()` function in Appendix D
- [ ] No front-matter pages altered
- [ ] Document compiles cleanly with `pdflatex` (no undefined references from new content)

---

*Plan compiled: June 2026*
*Source documents: Pre-thesis\_v23.tex (4282 lines) + CWB\_v24\_Improvement\_Analysis.md*
*Scope: Text replacement, paragraph additions, table additions/modifications only*
*Structure preserved: All chapter/section/subsection headings unchanged*
