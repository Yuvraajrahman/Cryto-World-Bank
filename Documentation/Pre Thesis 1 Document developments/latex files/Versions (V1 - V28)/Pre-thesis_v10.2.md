# Pre-thesis v10.2 (Markdown export)

Generated from [`Pre-thesis_v10.tex`](Pre-thesis_v10.tex) via **pandoc** (`-t gfm`) plus local post-processing. Tables render as **GitHub-Flavored Markdown pipe tables**; HTML table wrappers from LaTeX are stripped to anchors + tables; diagram figures that exist in the repo include an **embedded image** (`![…](…)`). TikZ **bar charts** without raster files include a **pipe table of the plotted coordinates** taken from the `.tex` source. The rendered PDF is [`Pre-thesis_v10.pdf`](Pre-thesis_v10.pdf).

**Math:** formulas use `$...$` / `$$...$$` as emitted by pandoc.

---

## QC manifest: figures and tables

Entries parsed from `Pre-thesis_v10.lof` and `Pre-thesis_v10.lot` (auxiliary files produced by LaTeX).

### Figures

- **Figure 3.1** — PDF p.38 — Component diagram showing interactions between the presentation layer, smart contract layer, off-chain backend services, and external systems.
- **Figure 3.2** — PDF p.41 — Core system graph: Crypto World Bank entity relationship model showing the four-tier banking hierarchy (World Bank $\rightarrow$ National Bank $\rightarrow$ Local Bank $\rightarrow$ BANK_USER), the central BORROWER entity, and the lending-lifecycle sub-graph (LOAN_REQUEST, TRANSACTION, INCOME_PROOF, INSTALLMENT, CHAT_MESSAGE, AI_ML_LOG).
- **Figure 3.3** — PDF p.42 — Entity-Relationship Diagram (ERD) for the Crypto World Bank database: all 15 normalized tables (3NF) with primary keys (PK), foreign keys (FK), data types, and relationship connectors. Crow's-foot notation indicates cardinality.
- **Figure 3.4** — PDF p.43 — Enhanced Entity-Relationship (EER) diagram: full data model showing generalization/specialization (BANK_USER $\rightarrow$ National/Local subtypes), weak entity (INSTALLMENT), multi-valued attribute (INCOME_PROOF), aggregation (Loan-Centric cluster), and participation constraints. Panel borders group related constructs.
- **Figure 3.5** — PDF p.52 — Use case diagram for the Crypto World Bank platform, showing interactions among four primary actors (World Bank Admin, National Bank, Local Bank Approver, Borrower) across 29 identified use cases, including registration, loan request, approval workflow, and repayment.
- **Figure 3.6** — PDF p.53 — Activity Diagram - Loan Request to Repayment Flow
- **Figure 3.7** — PDF p.54 — Activity diagram illustrating the hierarchical capital flow from the World Bank Reserve through National Bank to Local Bank tiers, including reserve ratio checks and loan disbursement decision points.
- **Figure 3.8** — PDF p.55 — Activity Diagram Income Verification Flow
- **Figure 3.9** — PDF p.56 — Activity Diagram Chat System Flow
- **Figure 3.10** — PDF p.57 — Activity Diagram AI Chatbot Interaction Flow
- **Figure 3.11** — PDF p.58 — Activity diagram showing the market data viewing flow, in which authenticated users fetch live cryptocurrency price feeds via the off-chain API layer before interacting with loan sizing interfaces.
- **Figure 3.12** — PDF p.59 — Activity Diagram Profile Management Flow
- **Figure 3.13** — PDF p.60 — Dataflow Diagram (Context Diagram Level - 0)
- **Figure 3.14** — PDF p.60 — Level-1 data flow diagram decomposing the core lending subsystem, showing input/output data flows among borrowers, approvers, the smart contract layer, the PostgreSQL database, and the AI/ML monitoring service.
- **Figure 3.15** — PDF p.60 — Level-1 data flow diagram (continued) covering the deposit mobilization, interbank lending, and FX conversion subsystems, with data stores for on-chain state and off-chain analytics.
- **Figure 3.16** — PDF p.61 — Sequence Diagram 1 Loan Request, AI Risk Check, and Approval Decision
- **Figure 3.17** — PDF p.61 — Sequence Diagram 1B Reject Path - alt Reject
- **Figure 3.18** — PDF p.62 — Sequence Diagram 2 Installment Payment Loop
- **Figure 3.19** — PDF p.62 — Sequence Diagram 3 Income Verification
- **Figure 3.20** — PDF p.63 — Sequence Diagram 4 Chat System
- **Figure 3.21** — PDF p.63 — Sequence Diagram 5 AI Chatbot Interaction
- **Figure 3.22** — PDF p.64 — Sequence Diagram 6 Hierarchical Banking
- **Figure 3.23** — PDF p.64 — Sequence Diagram 7 Market Data Retrieval
- **Figure 3.24** — PDF p.65 — Sequence Diagram 8 Borrowing Limit Calculation
- **Figure 3.25** — PDF p.65 — Four-tier hierarchical capital flow with cascading repayment.
- **Figure 4.1** — PDF p.74 — Agile/Scrum process flow: standard flowchart notation showing the sprint cycle from Product Backlog through Planning, Development (2--3 weeks), Weekly Sync, Sprint Review, Retrospective, and Potentially Shippable Increment, with a feedback loop back to the Product Backlog.
- **Figure 4.2** — PDF p.77 — Sprint story-point distribution: (a) 155 total points across three sprints; (b--d) per-sprint breakdown by epic. Proportions match the sprint backlog tables.
- **Figure 4.3** — PDF p.77 — Technical development methodology: swimlane view of the three-sprint plan across four technology layers (Blockchain/Solidity, Frontend/React, Backend/Express, AI/ML/FastAPI). Green cells indicate implemented and testnet-verified components; white cells indicate planned work.
- **Figure 4.4** — PDF p.81 — Sprint submission workflow: standard flowchart showing the sequence from backlog refinement through development, code review, integration testing, sprint review, retrospective, and final deliverable submission, with rework loops for failed review and test gates.
- **Figure 4.5** — PDF p.83 — SDLC stage mapping: the seven standard software development life cycle stages (right) mapped to project activities and deliverables (left), with an iteration arrow indicating the Agile feedback loop across all stages.
- **Figure 4.6** — PDF p.85 — Design decisions and alternatives: Panel A shows AI/ML component selections (fraud detection, anomaly detection, explainability); Panel B shows technology stack selections (frontend, smart contract platform, database, UI framework). Blue-filled nodes represent selected first choices; outlined nodes represent evaluated alternatives.
- **Figure 5.1** — PDF p.102 — Annual revenue projection by tier (USD millions, at \$2{,}500/ETH conservative mid-point).
- **Figure 5.2** — PDF p.103 — Hierarchical interest rate spread (APR) across the four-tier lending structure.
- **Figure A.1** — PDF p.113 — Compact Mermaid source for the local LLM path (full detail: optionalAuth, featureKey prompts, and upstream URL live in the project repository).
- **Figure A.2** — PDF p.113 — Local LLM assistant data flow: browser UI streams from the CWB API, which proxies to a local OpenAI-compatible model server. The path is the same in principle for both landing and in-app UIs, with optional user context when authenticated.

### Tables

- **Table 1.1** — PDF p.13 — Borrower tier access rules. — QC: `Documentation/Tables/1.1.png`
- **Table 1.2** — PDF p.13 — Tiered Borrower Access Rules by Borrower Type and Loan Size — QC: `Documentation/Tables/1.2.png`
- **Table 1.3** — PDF p.17 — Market segments. — QC: `Documentation/Tables/1.3.png`
- **Table 1.4** — PDF p.17 — Market Sizing: TAM, SAM, and SOM for the Crypto World Bank — QC: `Documentation/Tables/1.4.png`
- **Table 1.5** — PDF p.18 — Target customer segment profile. — QC: _no `Documentation/Tables/1.5.png` in repo_
- **Table 1.6** — PDF p.18 — Target Retail Customer Segment Profile and Constraints — QC: _no `Documentation/Tables/1.6.png` in repo_
- **Table 1.7** — PDF p.19 — Partner categories and roles. — QC: _no `Documentation/Tables/1.7.png` in repo_
- **Table 1.8** — PDF p.19 — Partner Ecosystem: External Dependencies and Integration Points — QC: _no `Documentation/Tables/1.8.png` in repo_
- **Table 2.1** — PDF p.28 — Literature review summary (Part A): DeFi lending, fraud detection, and XAI. — QC: _no `Documentation/Tables/2.1.png` in repo_
- **Table 2.2** — PDF p.28 — Literature Review Summary (Part 1): DeFi Lending and Hierarchical Architecture — QC: _no `Documentation/Tables/2.2.png` in repo_
- **Table 2.3** — PDF p.29 — Literature review summary (Part B): DeFi protocol systematisation and adaptive lending. — QC: _no `Documentation/Tables/2.3.png` in repo_
- **Table 2.4** — PDF p.29 — Literature Review Summary (Part 2): Governance, Settlement, and Institutional Adoption — QC: _no `Documentation/Tables/2.4.png` in repo_
- **Table 2.5** — PDF p.30 — Literature review summary (Part C): blockchain P2P lending, privacy-preserving ML, and smart contract auditing. — QC: _no `Documentation/Tables/2.5.png` in repo_
- **Table 2.6** — PDF p.30 — Literature Review Summary (Part 3): Cross-Border Settlement and Security Tooling — QC: _no `Documentation/Tables/2.6.png` in repo_
- **Table 2.7** — PDF p.31 — Literature review summary (Part D): CBDC design, cross-border settlement, and multi-chain DeFi. — QC: _no `Documentation/Tables/2.7.png` in repo_
- **Table 2.8** — PDF p.31 — Literature Review Summary (Part 4): Risk Monitoring and AI/ML in Finance — QC: _no `Documentation/Tables/2.8.png` in repo_
- **Table 2.9** — PDF p.32 — Literature review summary (Part E): multi-chain DeFi, smart microfinance, gas optimisation, and SHAP-based credit models. — QC: _no `Documentation/Tables/2.9.png` in repo_
- **Table 2.10** — PDF p.32 — Literature Review Summary (Part 5): Institutional Adoption and Financial Inclusion — QC: _no `Documentation/Tables/2.10.png` in repo_
- **Table 2.11** — PDF p.33 — Comparative protocol analysis: existing DeFi lending protocols vs. the Crypto World Bank (CWB). {✓ = implemented/present; ◐ = designed/partial; ○ = planned; ✗ = absent.} — QC: _no `Documentation/Tables/2.11.png` in repo_
- **Table 3.1** — PDF p.36 — Prototype scope: feature implementation status as of pre-thesis submission. ✓ = Implemented and testnet-verified; ◐ = Designed or partially scaffolded; ○ = Planned for final thesis phase. — QC: `Documentation/Tables/3.1.png`
- **Table 3.2** — PDF p.38 — Blockchain platform selection criteria and justification. — QC: `Documentation/Tables/3.2.png`
- **Table 3.3** — PDF p.38 — Blockchain Platform Selection: Comparison of EVM-Compatible Networks — QC: `Documentation/Tables/3.3.png`
- **Table 3.4** — PDF p.39 — Blockchain platform selection (continued): operational and deployment factors. — QC: `Documentation/Tables/3.4.png`
- **Table 3.5** — PDF p.39 — Blockchain Platform Selection (Continued): Operational and Deployment Factors — QC: `Documentation/Tables/3.5.png`
- **Table 3.6** — PDF p.44 — Database entity summary (15 entities). — QC: `Documentation/Tables/3.6.png`
- **Table 3.7** — PDF p.44 — Database Entity Summary: 15 Normalized Entities in the Relational Schema — QC: `Documentation/Tables/3.7.png`
- **Table 3.8** — PDF p.45 — EER constructs applied: specialisation, hierarchy, and constraints. — QC: `Documentation/Tables/3.8.png`
- **Table 3.9** — PDF p.45 — EER Constructs Applied: Specialization, Hierarchy, and Constraints — QC: `Documentation/Tables/3.9.png`
- **Table 3.10** — PDF p.46 — Indexing strategy: B-tree indexes for time-window and high-frequency queries. — QC: `Documentation/Tables/3.10.png`
- **Table 3.11** — PDF p.46 — Indexing Strategy: B-tree Indexes for Time-Window and High-Frequency Queries — QC: _no `Documentation/Tables/3.11.png` in repo_
- **Table 3.12** — PDF p.47 — Representative functional dependencies. — QC: _no `Documentation/Tables/3.12.png` in repo_
- **Table 3.13** — PDF p.47 — Functional Dependencies in the Core Lending and Identity Schema — QC: _no `Documentation/Tables/3.13.png` in repo_
- **Table 3.14** — PDF p.47 — Relational integrity constraints. — QC: _no `Documentation/Tables/3.14.png` in repo_
- **Table 3.15** — PDF p.47 — Relational Integrity Constraints: Referential and Domain Rules — QC: _no `Documentation/Tables/3.15.png` in repo_
- **Table 3.16** — PDF p.48 — Data partitioning between on-chain and off-chain storage. — QC: _no `Documentation/Tables/3.16.png` in repo_
- **Table 3.17** — PDF p.48 — On-Chain vs. Off-Chain Data Partitioning: State, Analytics, and Privacy Boundaries — QC: _no `Documentation/Tables/3.17.png` in repo_
- **Table 3.18** — PDF p.70 — Network membership governance. — QC: _no `Documentation/Tables/3.18.png` in repo_
- **Table 3.19** — PDF p.70 — Banking Product Suite: Deposit, Credit, and Ancillary Contract Specifications — QC: _no `Documentation/Tables/3.19.png` in repo_
- **Table 3.20** — PDF p.70 — Business network governance. — QC: _no `Documentation/Tables/3.20.png` in repo_
- **Table 3.21** — PDF p.70 — Security Threat Model: Vulnerability Classes, Attack Vectors, and Mitigations — QC: _no `Documentation/Tables/3.21.png` in repo_
- **Table 3.22** — PDF p.71 — Technology infrastructure governance. — QC: _no `Documentation/Tables/3.22.png` in repo_
- **Table 3.23** — PDF p.71 — Governance Framework: Operational, Business, and Technology Governance Layers — QC: _no `Documentation/Tables/3.23.png` in repo_
- **Table 3.24** — PDF p.73 — Threat model and security controls mapping — QC: _no `Documentation/Tables/3.24.png` in repo_
- **Table 4.1** — PDF p.78 — Sprint 1 backlog: smart contract development (21 pts). — QC: `Documentation/Tables/4.1.png`
- **Table 4.2** — PDF p.78 — Agile Sprint Plan: Three-Sprint Development Timeline and Deliverables — QC: `Documentation/Tables/4.2.png`
- **Table 4.3** — PDF p.78 — Sprint 1 backlog: frontend foundation (13 pts) and database schema (8 pts). — QC: `Documentation/Tables/4.3.png`
- **Table 4.4** — PDF p.78 — Technology Stack: Primary Choices and Justifications — QC: `Documentation/Tables/4.4.png`
- **Table 4.5** — PDF p.79 — Sprint 2 backlog: lending and communication features (50 pts). — QC: `Documentation/Tables/4.5.png`
- **Table 4.6** — PDF p.79 — Technology Stack (Continued): Framework and Tooling Selection — QC: `Documentation/Tables/4.6.png`
- **Table 4.7** — PDF p.80 — Sprint 3 backlog: AI/ML security and polish (38 pts). — QC: _no `Documentation/Tables/4.7.png` in repo_
- **Table 4.8** — PDF p.80 — Technology Stack: Second-Choice Alternatives and Trade-offs — QC: _no `Documentation/Tables/4.8.png` in repo_
- **Table 4.9** — PDF p.82 — SDLC stage mapping. — QC: _no `Documentation/Tables/4.9.png` in repo_
- **Table 4.10** — PDF p.82 — Technology Stack: Additional Alternative Evaluations — QC: _no `Documentation/Tables/4.10.png` in repo_
- **Table 4.11** — PDF p.84 — Design decisions and alternatives considered. — QC: _no `Documentation/Tables/4.11.png` in repo_
- **Table 4.12** — PDF p.84 — Software Testing Strategy: Acceptance Criteria Across Four Test Layers — QC: _no `Documentation/Tables/4.12.png` in repo_
- **Table 5.1** — PDF p.90 — Market segments with supporting data. — QC: `Documentation/Tables/5.1.png`
- **Table 5.2** — PDF p.90 — Market Sizing: DeFi Lending TVL, Remittances, and MSME Financing Gap — QC: `Documentation/Tables/5.2.png`
- **Table 5.3** — PDF p.91 — Target customer segment profile. — QC: `Documentation/Tables/5.3.png`
- **Table 5.4** — PDF p.91 — Target Customer Segment: Retail Borrower Profile and Product Fit — QC: _no `Documentation/Tables/5.4.png` in repo_
- **Table 5.5** — PDF p.92 — Partner categories and roles. — QC: `Documentation/Tables/5.5.png`
- **Table 5.6** — PDF p.92 — Partner Ecosystem: Integration Partners and External Dependencies (Chapter 5) — QC: `Documentation/Tables/5.6.png`
- **Table 5.7** — PDF p.93 — Detailed competitive landscape analysis (Part 1). — QC: `Documentation/Tables/5.7.png`
- **Table 5.8** — PDF p.93 — Competitive Landscape (Part 1): DeFi Lending and Payment Rail Protocols — QC: `Documentation/Tables/5.8.png`
- **Table 5.9** — PDF p.94 — Detailed competitive landscape analysis (Part 2). — QC: `Documentation/Tables/5.9.png`
- **Table 5.10** — PDF p.94 — Competitive Landscape (Part 2): Inclusion Wallets and Institutional Blockchain Systems — QC: `Documentation/Tables/5.10.png`
- **Table 5.11** — PDF p.95 — Detailed competitive landscape analysis (Part 3): multi-tier capital flow as differentiating feature. — QC: `Documentation/Tables/5.11.png`
- **Table 5.12** — PDF p.95 — Competitive Landscape (Part 3): Multi-Tier Capital Flow as Differentiating Feature — QC: _no `Documentation/Tables/5.12.png` in repo_
- **Table 5.13** — PDF p.96 — Risk taxonomy and mitigation. — QC: _no `Documentation/Tables/5.13.png` in repo_
- **Table 5.14** — PDF p.96 — Risk Taxonomy: Technical, Financial, Regulatory, and Operational Risk Categories — QC: _no `Documentation/Tables/5.14.png` in repo_
- **Table 5.15** — PDF p.97 — Technical feasibility assessment. — QC: _no `Documentation/Tables/5.15.png` in repo_
- **Table 5.16** — PDF p.97 — Technical Feasibility Assessment: Infrastructure Readiness and Ecosystem Maturity — QC: _no `Documentation/Tables/5.16.png` in repo_
- **Table 5.17** — PDF p.98 — Economic feasibility --- zero-cost prototype. — QC: _no `Documentation/Tables/5.17.png` in repo_
- **Table 5.18** — PDF p.98 — Economic Feasibility: Cost Drivers vs. Revenue Potential on Layer-2 Networks — QC: _no `Documentation/Tables/5.18.png` in repo_
- **Table 5.19** — PDF p.99 — Revenue projection assumptions. — QC: _no `Documentation/Tables/5.19.png` in repo_
- **Table 5.20** — PDF p.99 — Revenue Projection by Tier (Base Case, USD Millions) — QC: _no `Documentation/Tables/5.20.png` in repo_
- **Table 5.21** — PDF p.99 — System-wide annual revenue summary. — QC: _no `Documentation/Tables/5.21.png` in repo_
- **Table 5.22** — PDF p.99 — Revenue Projection Assumptions and Sensitivity Inputs — QC: _no `Documentation/Tables/5.22.png` in repo_
- **Table 5.23** — PDF p.101 — Default rate sensitivity scenarios with economic basis. — QC: _no `Documentation/Tables/5.23.png` in repo_
- **Table 5.24** — PDF p.102 — Interest rate parameters. — QC: _no `Documentation/Tables/5.24.png` in repo_
- **Table 5.25** — PDF p.102 — Tiered Interest Rate Parameters: APR Spreads Across the Four-Tier Hierarchy — QC: _no `Documentation/Tables/5.25.png` in repo_
- **Table 5.26** — PDF p.104 — Go-to-market phases. — QC: _no `Documentation/Tables/5.26.png` in repo_
- **Table 5.27** — PDF p.104 — Value Proposition and Go-to-Market: User Benefits Mapped to Platform Features — QC: _no `Documentation/Tables/5.27.png` in repo_
- **Table A.1** — PDF p.114 — Technology stack summary. — QC: _no `Documentation/Tables/A.1.png` in repo_
- **Table A.2** — PDF p.114 — Local LLM Assistant Integration: Components, Configuration, and Prototype Stance — QC: _no `Documentation/Tables/A.2.png` in repo_
- **Table B.1** — PDF p.116 — Deployed smart contract addresses, Polygon Amoy testnet (as of pre-thesis submission). — QC: _no `Documentation/Tables/B.1.png` in repo_

---

# Main body

<div class="center">

**Decentralized Crypto World Bank**\
A Blockchain-Based Banking Platform\
with AI-Enhanced Security and Assistance

by

**Md. Bokhtiar Rahman Juboraz**\
20301138\
**Md. Mahir Ahnaf Ahmed**\
20301083

A pre-thesis 1 report submitted to the Department of Computer Science
and Engineering\
in partial fulfillment of the requirements for the degree of\
**B.Sc. in Computer Science**

------------------------------------------------------------------------

\
Department of Computer Science and Engineering\
**BRAC University**\
February 2026

© 2026. BRAC University — All rights reserved.

</div>

# Declaration

It is hereby declared that

1.  The report submitted is our own original work while completing
    degree at BRAC University.

2.  The report does not contain material previously published or written
    by a third party, except where this is appropriately cited through
    full and accurate referencing.

3.  The report does not contain material which has been accepted, or
    submitted, for any other degree or diploma at a university or other
    institution.

4.  We have acknowledged all main sources of help.

**Student’s Full Name & Signature:**

|                             |     |                       |
|:----------------------------|:----|:----------------------|
|                             |     |                       |
| Md. Bokhtiar Rahman Juboraz |     | Md. Mahir Ahnaf Ahmed |
|                             |     |                       |

# Approval

The pre-thesis 1 report of final year project titled “Decentralized
Crypto World Bank: A Blockchain-Based Banking Platform with AI-Enhanced
Security and Assistance” submitted by

1.  Md. Bokhtiar Rahman Juboraz (20301138)

2.  Md. Mahir Ahnaf Ahmed (20301083)

Of Spring, 2026 has been accepted as satisfactory in partial fulfillment
of the requirement for the degree of B.Sc. in Computer Science on
February 20, 2026.

**Examining Committee:**

<div class="flushleft">

Supervisor:\
(Member)

</div>

<div class="flushright">

\
Mr. Annajiat Alim Rasel\
Senior Lecturer\
Department of Computer Science and Engineering\
BRAC University

</div>

<div class="flushleft">

Project Coordinator:\
(Member)

</div>

<div class="flushright">

\
Dr. Md. Golam Rabiul Alam\
Professor\
Department of Computer Science and Engineering\
BRAC University

</div>

<div class="flushleft">

Head of Department:\
(Chair)

</div>

<div class="flushright">

\
Dr. Sadia Hamid Kazi\
Chairperson and Associate Professor\
Department of Computer Science and Engineering\
BRAC University

</div>

# Ethics Statement

This project operates exclusively on public blockchain test networks
using test tokens with no real monetary value. No real financial
transactions, personal banking data, or user financial records are
involved at any stage of development or evaluation. All transaction data
used for Artificial Intelligence and Machine Learning (AI/ML) model
training and evaluation is either synthetically generated or sourced
from publicly available anonymized datasets. The platform prototype does
not process Know Your Customer (KYC) or Anti-Money Laundering (AML) data
in its current scope, and all wallet addresses used during testing are
disposable testnet addresses. We acknowledge the ethical considerations
inherent in AI-assisted financial decision-making and have incorporated
explainability mechanisms (SHapley Additive exPlanations, or SHAP) to
ensure that automated risk assessments remain transparent and auditable
by human reviewers. Future phases plan to incorporate a
privacy-preserving ZKP-based identity compliance layer in which users
prove KYC status without exposing personal data on-chain; the ethical
implications of this design will be evaluated in the final thesis.

# Abstract

Global development finance relies on multilayered institutional
structures to distribute capital across borders and communities, yet
these systems often struggle with fragmented transparency, procedural
friction, and uneven access to credit. Although decentralized finance
has demonstrated that programmable infrastructures can automate lending
and enhance auditability, existing models largely employ flat
architectures that do not reflect institutional hierarchies or
structured governance. As a result, there remains limited exploration of
how tiered financial systems might be represented within decentralized
environments while preserving oversight and adaptability. Here we
present *Crypto World Bank*, a prototype framework that models a
multi-tier institutional lending architecture on a programmable
blockchain infrastructure. We show that hierarchical capital flows,
role-based governance, and data-informed risk analytics can be
coordinated within a unified smart contract environment, enabling
transparent state visibility alongside adaptive decision support. The
Crypto World Bank implements a complete institutional banking
architecture across six functional domains—deposit mobilization, credit
allocation, payment settlement, risk intermediation, liquidity
management, and ancillary financial services—within a four-tier
hierarchical governance structure. This hybrid design illustrates how
institutional finance and decentralized systems may converge,
demonstrating that a complete, hierarchically governed banking
institution can be implemented on open blockchain infrastructure.

**Keywords:** Blockchain, Decentralized Finance, Institutional
Architecture, Financial Inclusion, Smart Contracts, AI-Augmented
Governance, Group Lending, Deposit Mobilization, Reserve Management,
Financial Sustainability

# Dedication

<div class="center">

*Dedicated to our families for their unwavering support throughout our
academic journey.*

</div>

# Acknowledgment

We would like to express our sincere gratitude to our panel members for
their guidance and support throughout this project. We also thank our
supervisor, Mr. Annajiat Alim Rasel, Senior Lecturer at the Department
of Computer Science and Engineering, BRAC University, for his guidance
and support. Finally, we thank the Department of Computer Science and
Engineering at BRAC University for providing us with the resources and
academic environment to pursue this work.

# List of Formulas

<div class="description">

$`U = \frac{L}{L + B}`$ (lending utilization; $`L`$ is lent amount,
$`B`$ is available balance/liquidity)

$`CR = \frac{C}{D}`$ (collateral-to-debt ratio)

$`LTV = \frac{\text{Loan Amount}}{\text{Collateral Value}}`$

$`APR = r_{\text{period}} \times N`$ (annualized simple rate over $`N`$
periods)

$`A = P\left(1 + \frac{r}{n}\right)^{nt}`$ (deposit growth; $`P`$
principal, $`r`$ annual rate, $`n`$ compounding frequency)

$`EMI = \frac{P \cdot r \cdot (1+r)^n}{(1+r)^n - 1}`$ (installment for
principal $`P`$, periodic rate $`r`$, $`n`$ installments)

$`HF = \frac{C \times LT}{D}`$ (liquidation trigger; if $`HF < 1.0`$
liquidation is triggered, where $`LT`$ is liquidation threshold)

$`RR = \frac{\text{Reserves}}{\text{Total Deposits}}`$ (minimum reserve
enforcement constraint)

$`CAR = \frac{\text{Tier 1 Capital}}{\text{Risk-Weighted Assets}}`$
(Basel-style prudential ratio)

$`M = \frac{1}{RR}`$ (fractional reserve multiplier approximation)

$`\text{Amount}_B = \text{Amount}_A \times \left(\frac{P_A}{P_B}\right)`$
(oracle-priced conversion between assets $`A`$ and $`B`$)

$`\text{Share}_i = \frac{\text{LoanTotal}}{N_{\text{members}}}`$

$`CS = \sum_i w_i \cdot \text{feature}_i`$ (weighted features learned
off-chain and stored as a score on-chain)

$`s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}`$ (anomaly scoring for instance
$`x`$; where $`h(x)`$ is the path length of instance $`x`$ from the root
of an isolation tree and $`c(n)`$ is the average path length for $`n`$
samples)

$`P(\text{fraud}\mid x) = \frac{1}{T}\sum_{t=1}^{T} f_t(x)`$ (ensemble
average over $`T`$ trees; where $`f_t(x)`$ is the binary fraud
prediction of the $`t`$-th decision tree)

$`\text{NetInterest} = \text{InterestCollected} - \text{DepositorYield} - \text{InsuranceAllocation}`$

$`\phi_i = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F|-|S|-1)!}{|F|!}\left[f(S \cup \{i\}) - f(S)\right]`$

</div>

# List of Abbreviations

<div class="description">

Asset-Liability Management

Artificial Intelligence

Artificial Intelligence / Machine Learning

Anti-Money Laundering

Annual Percentage Rate

Application Programming Interface

Bangladesh Rural Advancement Committee

Capital Adequacy Ratio

Central Bank Digital Currency

Collateral Ratio

Decentralized Finance

Debt Service Coverage Ratio

Equated Monthly Installment

Ethereum Virtual Machine

Foreign Exchange

Health Factor

Know Your Customer

Large Language Model

Layer 2

Loan-to-Value Ratio

Machine Learning

Net Interest Margin

Proof of Stake

QR code

Reserve Ratio

SHapley Additive exPlanations

Secured Overnight Financing Rate

Server-Sent Events

Total Value Locked

Utilization

Zero-Knowledge Proof

</div>

# Introduction

The Crypto World Bank is not a lending protocol. It is a complete
institutional banking architecture implemented on programmable
blockchain infrastructure. Where existing decentralized finance
protocols address isolated financial functions—Aave handles
collateralized lending, Uniswap handles exchange, MakerDAO issues
stablecoins—the Crypto World Bank integrates the full spectrum of
banking functions within a single, hierarchically governed platform.
These functions include deposit mobilization, credit allocation,
installment-based repayment, interbank liquidity management, foreign
exchange facilitation, group lending, reserve enforcement, and
risk-based governance—coordinated across four institutional tiers that
mirror the structural logic of real-world development finance.

The system is designed to serve three categories of participants
simultaneously. At the global level, it functions as a programmable
central reserve institution—managing capital allocation across national
jurisdictions with transparent, auditable reserve ratios enforced by
smart contract code rather than periodic audit. At the national and
regional level, it functions as a commercial and development
bank—channeling capital to local lending institutions, managing
interbank liquidity, and providing institutional borrowers with
structured credit facilities. At the individual level, it functions as a
retail bank—offering savings products, group loans, installment-based
personal lending, and digital payment services to end customers,
including the estimated 1.4 billion adults currently excluded from
formal financial systems \[14\]. The complete source code, smart
contracts, and supporting material for this project are available in our
[GitHub repository](https://github.com/Yuvraajrahman/Cryto-World-Bank).

Blockchain functions here as a coordination technology, providing
visibility of shared states, audit trails that are difficult to alter,
and programmable enforcement of rules among institutions that may have
competing interests. Governance design, security controls, and
regulatory considerations are incorporated into the platform according
to a staged implementation roadmap that includes academic validation and
regulatory sandbox pilots. Analogous hybrid institutional structures in
blockchain-based finance include the World Bank’s FundsChain programme,
which tracks fund disbursement across projects on a permissioned ledger,
and JPMorgan Kinexys, which settles multi-billion-dollar institutional
payments daily on a private EVM-compatible chain—demonstrating that open
ledger infrastructure and institutional hierarchy are not mutually
exclusive.

## Background

Understanding why such a system is necessary requires examining the
structural failures of the institutions it is designed to complement.

Capital is distributed to local borrowers through layered institutional
arrangements in which supranational development institutions such as the
World Bank and IMF, national financial intermediaries, and local lenders
collaborate to channel development finance to end borrowers. Although
this model allows risk sharing and penetrating local markets, it is
linked to great operational issues. In cross-border correspondent
banking, financial institutions are obligated to have pre-funded nostro
and vostro accounts at correspondent banks in every currency corridor,
which maroon huge amounts of capital in idle balances unable to be
invested or lent out \[24\]. Crossborder transactions are regularly
settled in two to five business days with an average cost of about \$42
per transaction by using the correspondent banking network \[25\]. The
remittance market, which is valued at about \$860 billion annually,
loses between \$48–56 billion per annum to transfer charges, with the
average cost to transfer in the world being 6.49% as of 2024, more than
the United Nations Sustainable Development Goal limit of 3% \[26\].

At the same time, it is estimated that there are 1.4 billion unbanked
adults in the world as defined by the World Bank Global Findex \[14\],
and most of them are found in the developing economies where
documentation, geographic location, and minimum balance requirements
leave out high populations of people in the formal financial sector. The
International Finance Corporation estimates that there is a financing
gap in the world of micro, small and medium enterprises at
\$4.5 trillion per year \[20\], which is unmet credit demand that cannot
be effectively met by the existing institutions through the conventional
intermediation chains.

The DeFi industry has already shown that lending, collateral management,
and interest calculation can be automated on a smart contract platform
and that all transactions are transparent, on-chain. The largest DeFi
lending protocol, Aave v3, has amassed \$26.3 billion in total value
locked across ten blockchain networks \[27\], and the DeFi lending
market has more than \$55 billion in TVL \[13\]. Nevertheless, these
protocols utilize flat, pool based designs where all the lenders feed
into one pool and all borrowers withdraw off the same
source—irrespective of institutional status, creditworthiness and
geographies. There is no current DeFi scheme that reflects the
multi-tier institutional structure, inter-tier capitals movement and
tiered borrower access provision that is typical of real-world
development finance.

## Rationale of the Study

The combination of three forces, namely: (1) the long-standing
inefficiencies in the traditional development finance, which restrict
the transparency and speed of settlement; (2) the absence of multi-tier
banking functions in existing DeFi designs, particularly deposit
mobilization and solidarity group lending alongside hierarchical
lending; (3) the possibility of integrating blockchain auditability with
lightweight analytics and monitoring support to enhance operational
control, drives this study. With an architecture that will bridge these
areas, we hope to show a plausible way forward toward transparent,
programmable, and institutionally significant banking services for
underserved populations.

## Problem Statement

The international system of the development finance works based on a
stratified system in which funds are directed down by large
supranational organizations such as the World Bank and IMF to national
institutions, which transmit them to regional and local banks, and they
are ultimately delivered to individual borrowers. This intermediary
chain brings into being a number of significant inefficiencies:

1.  **Lack of transparency.** Financial records at each tier of the
    intermediation chain are not openly accessible to participants below
    that tier. Lower-level institutions and individual borrowers cannot
    independently verify how capital is being managed, what reserve
    levels are maintained, or on what basis lending decisions are made
    at higher tiers. Reserve adequacy is predominantly self-reported and
    audited at most quarterly, providing no mechanism for real-time
    verification of institutional financial health.

2.  **Sluggish settlements and unproductive capital.** Cross-border
    money transmission requires multiple intermediaries, compliance
    verification steps, and correspondent bank confirmations that
    routinely delay settlement by two to five business days. Banks must
    also maintain pre-funded accounts at partner institutions in every
    currency corridor, locking up capital that would otherwise be
    available for lending \[24\]. An average transaction via the
    correspondent banking system costs approximately \$42, a burden that
    falls disproportionately on small-value transactions and
    participants in developing economies \[25\].

3.  **Inconsistent risk evaluation.** Fraud screening and credit
    assessment rely heavily on individual human judgment, introducing
    bias, inconsistency, and limited scalability. Because no unified and
    verifiable credit history exists across institutional tiers,
    borrowers must be re-evaluated from scratch at each stage of the
    intermediation chain, adding time and cost without improving
    accuracy.

4.  **Obstacles to access and institutional trust.** Establishing
    inter-institutional trust through legal agreements, compliance
    processes, and third-party audits is both expensive and
    time-consuming, placing smaller institutions and borrowers in
    developing countries at a particular disadvantage. According to the
    World Inequality Report 2026, the global monetary system continues
    to redirect resources from developing to wealthier economies, with
    developing-country investors receiving returns approximately three
    percentage points lower than those in developed economies \[28\]—a
    structural gap that further impedes access to international credit
    markets.

5.  **Absence of programmable savings instruments.** Traditional savings
    accounts in developing economies offer near-zero real yields due to
    inflation, currency risk, and institutional opacity. Depositors have
    no real-time visibility into whether their savings are being
    deployed responsibly or sitting idle in reserve accounts.

6.  **Inaccessibility of group credit mechanisms.** Over 1.4 billion
    unbanked individuals lack individual collateral but could access
    credit through solidarity group structures, a model demonstrated by
    BRAC, Grameen Bank, and ASA in Bangladesh. No existing DeFi protocol
    models programmable mutual liability or on-chain group repayment
    enforcement.

At the same time, the DeFi ecosystem has shown that the lending,
collateral management, and interest calculation can be completely
automated through smart contract platforms with complete transparency.
The TVL of Aave v3 is \$26.3 billion and active borrows are
\$17.7 billion \[27\]; the TVL of Compound v3 is \$1.4 billion \[29\];
and the combined DAI and USDS stablecoin issuance of MakerDAO (renamed
Sky Protocol) is approximately \$10.5 billion with projected 2026
revenue of \$611 million \[30\]. Despite this scale, these protocols
exhibit fundamental limitations in the context of institutional
development finance:

- They employ **flat, peer-to-peer**, or **over-collateralized** lending
  models, where everyone and large institutional borrowers, along with
  individual retail clients, are dealing with the undifferentiated
  liquidity pool. No existing protocol models institutional hierarchy,
  tiered capital allocation or cross-tier lending flows in as similar a
  manner as the World Bank → National Bank → Local Bank
  model of development finance.

- They are not connected with **AI-based risk analytics** and
  **explainable decision support** systems. DeFi lending decisions are
  determined solely using collateral ratio and utilization curve and no
  behavioral fraud detection, anomaly detection or explainable credit
  judgement is present.

- They do not model **role based, tiered governance** of the development
  finance institutions. It is a form of leadership, in which a majority
  of the large token holders will wield the power of decision-making,
  without the institutional role distinction (regulator, wholesale
  lender, retail lender, borrower) of hierarchical finance.

- The credit-based and emerging-market lending has also been introduced
  with other new institutional DeFi projects such as Maple Finance
  (\$2.6–3.8 billion TVL, undercollateralized institutional
  lending) \[31\] and Goldfinch (\$680 million loan originations in 18+
  developing countries) \[32\], however, are single-level projects with
  no hierarchical capital flows and no interbank lending facilities.

## Objectives

The objectives of this project are:

1.  To **design, formally specify, and partially implement** a four-tier
    lending architecture (World Bank → National Bank → Local
    Bank → Borrower) on an EVM-compatible blockchain that
    maintains institutional hierarchy and provides shared access to the
    ledger. The current prototype fully implements the Tier 1 World Bank
    Reserve contract and the lending request/approval workflow; Tier 2
    and Tier 3 contracts are specified and partially scaffolded, with
    full implementation planned for the final thesis phase.

2.  To specify and justify an extended banking product suite—including
    deposit mobilization, savings products, and solidarity group
    lending—that can be integrated on top of the hierarchical lending
    foundation.

3.  To investigate a lightweight off-chain analytics support layer,
    including fraud detection, anomaly detection, and explainable review
    support, to supplement human credit governance.

4.  To demonstrate transparent and programmable lending processes with
    configurable borrowing limits, installment payments, and role-based
    access control implemented through smart contracts.

5.  To test the prototype on public testnets (e.g., Polygon, Ethereum
    Sepolia) and verify hierarchical controls, transparency properties,
    and operational workflows.

6.  To document the design of governance mechanisms, security controls,
    regulatory considerations, and a controlled rollout pathway toward
    academic validation and potential regulatory sandbox piloting.

## Research Questions

The research questions used in the study are as follows:

1.  **RQ1:** Does a hierarchical blockchain-based lending architecture
    reflect more faithfully the real-world capital flow mechanism of
    development finance than present decentralized lending?

2.  **RQ2:** Can on-chain transparency, programmable reserve controls
    and role-based governance system make settlements less opaque and
    less frictional across institutional tiers?

3.  **RQ3:** Does a lightweight off-chain analytics layer offer
    practical and auditable support to monitor fraud and lending in such
    a system?

4.  **RQ4:** Does the proposed architecture work technically and
    operationally on current test networks in the public and yet retain
    their relevance to the real-life institutional and financial-use
    cases?

5.  **RQ5:** Can deposit-funded lending and solidarity group lending be
    represented as programmable, auditable mechanisms on-chain while
    preserving practical feasibility for retail users in developing
    economies?

## Research Contribution

This work makes four original and precisely scoped research
contributions to the field of decentralized finance and blockchain-based
development banking:

<div class="description">

We are the first to design and partially implement a four-tier
smart-contract lending hierarchy (World Bank Reserve → National
Bank → Local Bank → Borrower) on an EVM-compatible
blockchain that mirrors the capital-flow model of multilateral
development finance. No existing DeFi protocol—including Aave, Compound,
MakerDAO, Maple Finance, or Goldfinch—models institutional hierarchy or
cross-tier capital allocation; all employ flat, single-tier pool
architectures with undifferentiated liquidity.

We are the first to specify and prototype a programmable solidarity
group lending mechanism on-chain, encoding mutual liability enforcement,
group formation consent, and installment splitting into smart contract
logic. This model was previously realised only in analogue microfinance
institution (MFI) operations, such as BRAC’s 30–40 member groups and
Grameen Bank’s groups of five, where enforcement relies on social
pressure rather than programmable contract rules.

We propose an architectural pattern for integrating off-chain Random
Forest fraud detection and SHAP-based explanations into an on-chain
lending decision workflow via a trusted oracle relay, providing a
blueprint for auditable, AI-assisted credit governance in DeFi. The
design addresses the oracle problem—the challenge of securely bridging
on-chain logic with off-chain data—and specifies three concrete
integration options (centralized relay, Chainlink Functions, and
commit-reveal scheme) with explicit trust trade-offs.

We design a ZKP-based compliance architecture (zk-SNARK KYC verification
layer using Groth16 proofs via Circom and snarkjs) that allows smart
contracts to verify off-chain KYC/AML credentials without exposing
personal data on-chain. This architecture is specifically applied to a
developing-economy (Bangladesh) context with wallet-based identity
primitives, and is grounded in the Piper et al. (2025) permissioning
framework from TU Berlin.

</div>

The remainder of this paper is organized as follows. Chapter 2 surveys
the academic and industry literature on DeFi lending, hierarchical
financial architecture, AI-assisted credit assessment, and
blockchain-based financial inclusion, identifying the research gaps that
motivate this work. Chapter 3 presents the system architecture and
design, including the smart contract hierarchy, banking product
specifications, data model, security analysis, and governance framework.
Chapter 4 describes the development methodology, sprint plan, and
technology stack justification. Chapter 5 evaluates the technical,
economic, and sustainability feasibility of the proposed system.
Chapter 6 presents conclusions and future research directions.

## Blockchain Justification

The multi-party coordination and trust problem of incompatible
institutions with potential conflicting interests is the root cause of
the above problem. We argue that blockchain technology is the solution
to this kind of problems than its traditional counterparts due to the
following reasons:

1.  **Minimizing trust based consensus.** Distributed consensus
    algorithms make sure that no one can change the ledger state
    unilaterally and a trusted central operator is not required.

2.  **Programmable enforcement.** The rules of lending, such as limits
    on borrowing, installment payments and workflows are stored in smart
    contracts as deterministic self-executable programs \[58\], reducing
    the usage of manual processes and bilateral contracts.

3.  **Cryptographic auditability.** Each change of state is recorded in
    an immutable and publicly verifiable record of transactions and will
    be subject to real-time auditing by regulators, partners, and
    borrowers without expensive third-party interactions.

4.  **Composable incentive structures.** On-chain reputation systems,
    governance tokens, and programmable fee distributions can align
    incentives across all network participants. In the Crypto World
    Bank’s architecture, this takes the form of on-chain repayment
    history contributing to a borrower’s credit score, interest spread
    revenue being programmatically split between depositor yield and an
    insurance fund, and governance-controlled parameter adjustments that
    require multi-tier approval rather than unilateral decision-making.

A conventional cloud-based data architecture would delegate ledger
integrity, access control, and audit assurances to a trusted central
operator, re-establishing the same trust dependency that this project is
designed to eliminate. Blockchain eliminates this single point of trust
failure.

### Blockchain Fundamentals and the EVM Execution Model

**A. What blockchain is (technically precise).** A blockchain is an
append-only distributed ledger in which each block contains a
cryptographic hash of the previous block, a Merkle root of all
transactions in the block, a timestamp, and nonce or validator signature
data. Immutability is not absolute—it is probabilistic and
consensus-enforced: it holds as long as no coalition controlling more
than 50% of stake (in Proof-of-Stake) cooperates to rewrite
history \[R17\]. On Polygon PoS specifically, finality is achieved
through the Heimdall validator layer (a Tendermint-based BFT consensus
layer), which provides stronger finality guarantees than pure
longest-chain PoW, but still assumes that fewer than one-third of
validators are Byzantine. This trust assumption is a design constraint,
not a deficiency, and must be stated explicitly in any security
analysis.

**B. The EVM Execution Model .** The Ethereum Virtual Machine is a
stack-based, deterministic, Turing-complete virtual machine that
executes smart contract bytecode. Every operation (opcode) has a fixed
gas cost specified in the Ethereum Yellow Paper \[R7\]. Key opcodes
relevant to this system:

- `SSTORE` (write to storage): 20,000 gas for a new slot, 2,900 for
  modification—the most expensive operation class.

- `SLOAD` (read from storage): 2,100 gas (warm access), 100 gas (cold).

- `CALL` (external contract call): 700 gas base plus additional costs.

- Events (`LOG2`, `LOG3`): $`\approx`$<!-- -->375 + 8 per data
  byte—inexpensive, used for off-chain indexing.

Each installment repayment involves at minimum one `SSTORE` for updating
the loan balance, one `SSTORE` for recording payment history, and one
event emission. A 12-installment loan therefore involves at minimum 24
`SSTORE` operations. A complete retail loan lifecycle involves
approximately 27–32 individual on-chain state changes, as detailed in
Section [5.8](#sec:gas-cost).

**C. Smart contracts as state machines.** A lending smart contract is
best modeled as a finite state machine: `PENDING` → `APPROVED`
→ `ACTIVE` → `REPAYING` →
`COMPLETED | DEFAULTED`. State transitions are triggered by
role-authorized function calls, and the `nonReentrant` guard ensures
atomicity of each transition. This state machine framing strengthens the
argument that smart contracts are more auditable than off-chain systems,
because every state transition is permanent, timestamped, and publicly
verifiable.

**D. The Oracle Problem.** Smart contracts are deterministic and
isolated from external data by design. This is a feature—consensus would
break if different nodes observed different external states—but it
creates a fundamental architectural gap for any system that requires
off-chain data. The oracle problem, formally identified by
Beniiche (2020) \[R1\] and Pasdar et al. (2023) \[R2\], is the challenge
of securely bridging on-chain logic with off-chain information. For the
Crypto World Bank, the AI/ML risk scores produced by the FastAPI Random
Forest service are off-chain data that must influence on-chain lending
decisions. Three architectural options exist: (1) a centralized relay
(trusted backend calls `updateRiskScore` on-chain—simple but
re-introduces a central trust point); (2) a decentralized oracle network
such as Chainlink Functions (removes the trust assumption at the cost of
30–60 seconds latency and \$0.10–\$1.00 per call); and (3) a
commit-reveal scheme (the ML service commits a hash of the risk score
before the loan decision window, reveals it after). The current
prototype uses a centralized relay, acceptable in the testnet context;
Chainlink Functions integration is planned for the final thesis phase.

**E. Polygon PoS Trust Model.** Polygon PoS operates a delegated
proof-of-stake consensus with a validator set that, as of 2025,
comprises approximately 100 active validators. Checkpoints are
periodically submitted to Ethereum mainnet, providing a finality anchor
against which Polygon state can be independently verified. The trust
assumption is: the platform is secure as long as no coalition of
validators controlling more than one-third of staked MATIC colludes to
finalize invalid state. This assumption is weaker than Ethereum’s own
security guarantee, but substantially stronger than the central-operator
model of a traditional banking platform.

## Proposed Solution

The Crypto World Bank is based on a **four tier on-chain lending
model**:

- **Tier 1 — World Bank:** Custodian of the global crypto reserve.
  Allocates capital to registered National Banks via lending mediated by
  smart contracts.

- **Tier 2 — National Banks:** Borrow from the World Bank reserve. Lend
  to Local Banks incorporated in their jurisdiction. Aggregate the risk
  exposure at the national level.

- **Tier 3 — Local Banks:** Borrowing of National Banks. Loan
  applications by process originators from individual borrowers.
  Administer loan lifecycle using particular approvers.

- **Tier 4 — Borrowers:** Loan requests to Local Banks. Repay through
  configurable installment schedules. Construct on-chain payoff history
  which determines borrowing in the future.

The platform also incorporates:

- **Risk-sensitive borrowing limits** computed from rolling 6-month and
  1-year transaction windows.

- **Automatic installment generation** for loan amounts exceeding a
  configurable threshold (e.g., 100 ETH equivalent).

- **Off-chain AI/ML security analytics** (planned) for fraud detection
  (Random Forest), anomaly identification (Isolation Forest), and
  explainable risk assessment (SHAP).

### Banking Functions of the Platform

A functionally complete bank performs six core activities: deposit
mobilization, credit allocation, payment and settlement, risk
intermediation, liquidity management, and ancillary financial services.
The Crypto World Bank is designed to implement each of these functions
across its four-tier hierarchy.

::: description

- **Deposit Mobilization.** The process by which a bank accepts funds from savers and transforms them into productive capital. On the platform, depositors at any tier can place funds into savings products---standard savings accounts with variable yield, fixed-term deposits with locked periods and agreed APY, and institutional yield accounts for large participants. Deposits and accrual are recorded on-chain, and interest accrues automatically via deterministic rules rather than discretionary accounting.

- **Credit Allocation.** Loans flow downward through the four-tier hierarchy---from the World Bank reserve to national banks, from national banks to local banks, and from local banks to end borrowers. Each tier applies its own interest rate spread, collateral requirement, and borrowing limit, enforced by smart contract rules and supported by data-informed monitoring.

- **Payment and Settlement.** Transfers between registered accounts settle atomically in a smart contract transaction, avoiding the intermediate ``funds-in-transit'' state that commonly produces disputes in traditional systems.

- **Risk Intermediation.** Implemented through reserve-ratio enforcement constraints, role-based approval workflows, and an AI/ML monitoring layer (Random Forest for fraud detection, Isolation Forest for anomaly detection, SHAP for explainability) designed for transparent, auditable decision support.

- **Liquidity Management.** Enforced via minimum reserve ratios at each tier, with same-tier interbank lending pools for short-term liquidity balancing and planned asset-liability monitoring to detect unsafe duration gaps.

- **Ancillary Financial Services.** Includes foreign exchange, group lending, trade finance facilitation, and digital identity management. FX is designed around decentralized price oracles; group lending enables pooled collateral and mutual liability; trade finance instruments can be added as planned extensions.

:::


### Service Delivery Across Scale

The platform is designed to operate at three scales of engagement: the
global institutional level, the national and regional commercial level,
and the individual retail level.

**Global institutional level (World Bank Reserve tier).** The World Bank
Reserve functions as a programmable reserve authority by managing
system-level capital allocation and reserve constraints across
jurisdictions. This tier is designed to support transparent reporting of
reserves and enforce reserve-ratio constraints as code, reducing
informational asymmetry relative to periodic self-reporting.

**National and regional level (National Bank and Local Bank tiers).**
National Banks borrow wholesale capital from the reserve tier and
allocate it to registered Local Banks under jurisdiction-aware
governance and tiered approval workflows. The intent is to mirror
real-world development finance intermediation while improving settlement
speed and auditability through on-chain execution.

**Retail level (borrowers and depositors).** End customers interact
through Local Bank interfaces to open accounts, deposit savings, apply
for loans (including group loans), repay installments, and build an
on-chain credit history. In Bangladesh, where roughly 40% of adults lack
access to formal banking services \[54\], a mobile-accessible interface
with low transaction costs can reach users that branch-based systems do
not, while keeping loan terms and reserve behavior verifiable through
on-chain transparency.

### Cross-Tier Lending System

Capital does not necessarily flow down in the old banking system. Banks
at the same level deposit with one another regularly in the interbank
lending market (e.g., the federal funds market) and less significant
banks that have surplus cash inject the extra cash upwards with their
home institutions or central banks. The Crypto World Bank is the
extension of its hierarchical architecture to accommodate such
**multi-directional lending flows**, developing a more realistic and
robust financial ecosystem.

#### Same-Tier Lending

Banks at the same hierarchical level can lend to one another to manage
short-term liquidity:

- **National Bank $`\leftrightarrow`$ National Bank:** A national bank,
  which has excess reserves, can lend to a second party that is in a
  liquidity crunch, similar to the traditional interbank lending market.
  The lending rate is adjusted according to the supply and demand
  through national banks of the system, like the Secured Overnight
  Financing Rate (SOFR).

- **Local Bank $`\leftrightarrow`$ Local Bank:** Local banks in same or
  different national jurisdictions can share liquidity through a peer
  lending pool. This prevents local liquidity crunches when one bank
  possesses surplus deposits and the other is experiencing elevated loan
  demand.

Same-tier lending is done by an on-chain **InterBankLendingPool**
contract at every tier level in which surplus banks provide short-term
liquidity and those banks that need it are allowed to borrow at
utilization floating rates. In the current prototype, the
InterBankLendingPool is specified at the design level; the
implementation focuses on the primary top-down capital flow (World Bank
→ National Bank → Local Bank → Borrower), with
same-tier and upward lending reserved for subsequent development stages.

#### Upward Lending

Banks with excess capital of lower tier are then able to lend up the
ladder:

- **Local Banks → National Banks:** When local banks accumulate
  reserves beyond the minimum reserve ratio, they are allowed to deposit
  excess capital in their parent national bank’s liquidity pool with
  earned deposit yield. This mirrors how commercial banks save the
  surplus with central banks by means of standing deposit facilities.

- **National Banks → World Bank:** National banks may provide
  excess to the international deposit, enhancing the total capital base
  of the system. This provides a back route to well capitalized national
  banks and raises the reserve available for downward distribution to
  banks with higher demand.

The downward lending rates are higher than the upward lending rates (the
low risk of lending to a higher-level institution), developing a natural
interest rate term structure across the hierarchy.

#### Tiered Borrower Access

Different borrower classes access different tiers based on loan size and
organizational type:

| **Borrower Type** | **Accessible Tiers** | **Loan Range** | **Use Case** |
|:---|:---|:---|:---|
| Individual / End User | Local Bank only | 0.01–10 ETH | Personal, micro-enterprise |
| Small Business / SME | Local Bank, National Bank | 1–100 ETH | Working capital, equipment |
| Large Corporate | National Bank, World Bank | 50–10,000 ETH | Infrastructure, large projects |
| Institutional / Sovereign | World Bank only | 1,000+ ETH | Development programs |

Borrower tier access rules.

*This table summarizes tiered borrower access rules by mapping borrower
type and loan size to the appropriate institutional tier. The intent is
to preserve real-world banking intermediation: retail borrowers
primarily access Local Banks, while larger institutional borrowers can
be routed to higher tiers under stricter verification. This design
supports risk segmentation and prevents large actors from consuming
retail liquidity.*

Local Banks are used by the end users and retail borrowers to gain
access to the system, maintaining the hierarchical intermediation model.
Greater levels can be accessed directly by large corporate accounts and
institutional borrowers, but are subject to rigorous verification
(on-chain credit history with off-chain documentation) and a borrower
type designation in the smart contract that determines tier access
permissions.

This multi-way lending scheme—downward capital allocation, same-tier
interbank lending, upward repatriation of surpluses, and tiered access
by borrowers—generates a more detailed model of the banking flows of the
real world in the decentralized architecture. The current prototype
fully implements the downward capital distribution and tiered borrower
access components; same-tier interbank lending and upward surplus
repatriation are architecturally designed and will be implemented in
subsequent development phases.

## Methodology in Brief

Our approach was a lightweight Agile/Scrum strategy consisting of three
sprints in an 8-week development window. Sprint 1 creates smart
contract, frontend framework, wallet integration, and database schema.
Sprint 2 provides lending services (loan applications, approvals,
installments, borrowing limits), chat system, income verification, and
bank registration. Sprint 3 incorporates AI/ML fraud detection, risk
dashboard, security audit, and documentation. Solidity 0.8.20 is used in
development of smart contracts, React 18 with TypeScript on the
frontend, FastAPI on the backend, and scikit-learn on the ML models. On
Polygon and Ethereum, we deploy at zero real-cryptocurrency cost.

## Scopes and Challenges

The complete banking architecture described in this report defines both
what is implemented in the current prototype and what constitutes the
full system design, clearly distinguishing prototype scope from
architectural intent throughout.

**Scope.** This prototype is restricted to publicly available testnets,
i.e. no actual cryptocurrency is involved in the system. It encompasses
basic features including four-tier lending architecture, loan request
and approval process, installment based repayment, calculation of
borrowing limits, communication between borrowers and banks and
verification of income. The system also uses Random Forest with SHAP to
explain explainability in fraud detection and Isolation Forest to detect
anomalies. An additional feature of dual-currency is also introduced to
enhance the current banking infrastructure. The prototype, however, does
not cover mainnet deployment, fiat on/off-ramp integration, automated
KYC/AML compliance or production-scale stress testing.

**Challenges.** There are some issues that come with this system. The
unlabeled nature of DeFi lending fraud data is one of those problems, as
it limits the successful training of the model and might necessitate the
application of synthetic data or transfer learning methods. The other
issue is regulatory uncertainty, since crypto lending may have different
jurisdictional restrictions; and this risk can be partially reduced by
working the testnets only. The sensitivity of gas costs is an issue as
well, as intricate on-chain programs can be costly; to solve this, AI/ML
work requiring computation is performed off-chain. Additionally, model
interpretability is essential to regulatory compliance, especially in
describing the process of lending, which is obtained by SHAP-based
feature attribution. Last but not the least, economic sustainability
should be taken into account, because the platform should be able to
earn enough income, like interest revenues, to cover gas expenses at all
four levels. The following Chapter 5 discusses this balance in greater
depth.

### Economic Sustainability: Interest Revenue Versus Gas Costs

The most important problem facing any blockchain-based lending system is
whether the revenue earned by the lending activities will be in a
sustainable position to cover the total gas expenses of the transactions
on-chain. Every level in the hierarchy will have deposits, loan
applications, approvals, disbursements, repayment and installment
processing gas fees. One complicated smart contract interaction can cost
between \$5 and \$50 on Ethereum mainnet, based on network congestion,
but around \$0.001 to \$0.01 in Polygon PoS. At an average retail loan
of 10 ETH (\$20,000 at \$2,000/ETH) with an 8% APR, the borrower pays
\$1,600 in annual interest. With 10–15 on-chain transactions per loan
lifecycle (request, approval, disbursement, 12 monthly installments),
the overall gas costs on Polygon are under \$0.15—less than 0.01% of the
interest obtained. The platform thus provides a sustainable margin on
Layer 2 networks, but mainnet implementation would need to consider gas
optimisation or batched transaction processing to ensure it would be
viable to serve micro-loans.

### Resistance to Institutional Capture

As the Crypto World Bank grows in adoption, a critical question is
whether large capital holders and established financial
institutions—which already dominate the traditional banking system—could
migrate to the new architecture and replicate the existing patterns of
financial concentration. This risk is mitigated by the platform in a
variety of architectural ways:

- **Visible reserve ratios:** In contrast to traditional banks, where
  reserve adequacy is reported and audited quarterly, on-chain reserves
  are publicly verifiable in real time. There is no way a given
  institution can hide its real financial status to have unfair
  advantage.

- **Algorithmic interest rates:** Interest rates are determined by the
  smart contract parameters, not by opaque internal pricing committees,
  and thus no single participant can capture the entire pool of capital.

- **Immutable audit trails:** Every transaction, approval, and
  governance decision is permanently recorded on-chain, making
  regulatory capture and corruption detectable by any participant.

- **Open-source governance:** The smart contract code is publicly
  auditable, preventing hidden backdoors or preferential treatment
  encoded at the protocol level.

- **Tiered access with caps:** Borrowing limits and tier access rules
  are enforced programmatically, preventing any single entity from
  monopolizing the capital pool.

Although no system can entirely deter wealth concentration in a free
market, the detectability and programmability characteristics of
blockchain infrastructure make exploitative behavior prohibitively
expensive and highly observable by comparison to opaque intermediaries.

### Cryptocurrency Supply Constraints and Scalability

Among the most fundamental questions regarding the use of fixed-supply
cryptocurrencies (e.g. the 21 million limit of Bitcoin \[57\] or the
deflationary issue of Ethereum after the Merge) that serve as
denomination of a global lending system is what would happen when the
demand of credit exceeds the supply of underlying cryptocurrency? Three
design considerations are used to address this concern:

1.  **Stablecoin support (planned):** The platform will have ERC-20
    stablecoin support (USDC, USDT, DAI) built in, which are backed by
    fiat currencies and can be minted on demand—elastic supply with no
    on-chain transparency dumping.

2.  **Multi-chain and Layer 2 deployment:** Multi-chain interoperability
    enables the platform to operate on multiple networks simultaneously,
    sharing the demand among different token ecosystems and eliminating
    bottlenecks in supplying individual chains.

3.  **Fractional reserve design:** The hierarchical lending model is a
    hierarchical lending system, which is a fractional reserve system,
    in the sense that all the ETH deposited in the Tier 1 level can be
    lent out many times over via the multiplier effect, similar to a
    conventional banking system. The total lending capacity of the
    system is more than the gross amount of tokens supplied by a factor
    which is computed by the reserve ratio of each stage.

The fixed amount of the underlying cryptocurrency is not a weakness, but
an opportunity: it removes the monetary discretionary growth that
destabilizes buying power in traditional fiat economies. To scale, the
system uses stablecoins and multichain implementation instead of
printing money—the deflationary financial discipline that differentiates
decentralized finance and central banking.

## Market Analysis and Partnership Ecosystem

### Market Sizing

| **Segment** | **Description** | **Estimated Scale** |
|:---|:---|:---|
| Total Addressable Market (TAM) | Global DeFi lending (\$55B+) | \$55B – 5T+ |
| Serviceable Addressable Market (SAM) | Institutional and semi-institutional lending requiring hierarchical structures | \$5B – 15B |
| Serviceable Obtainable Market (SOM) | Pilot deployments in regulatory sandboxes, academic prototypes, NGO-backed microfinance | \$50 – 200M |

Market segments.

*This market sizing table quantifies the total addressable opportunity
by combining DeFi lending TVL, global remittance volume, and the MSME
financing gap. The key implication is that even a small market share
yields meaningful lending volume and social impact, justifying the
platform’s focus on low-cost settlement and credit access.*

***Sources:** (a) TAM: DefiLlama \[13\] reports DeFi lending TVL
exceeding \$55B; World Bank \[26\] values global remittances at \$860B;
IFC \[20\] estimates the MSME financing gap at \$4.5T; (b) SAM and SOM:
project-derived estimates based on industry segmentation \[18\].*

The market for **transparent, hierarchy-preserving decentralized
lending** is presently unaddressed by existing DeFi protocols, which
universally adopt flat, pool-based architectures. This represents a
significant whitespace opportunity.

### Target Customer Segment

The Crypto World Bank targets the **retail customer segment** —
individual borrowers and small businesses seeking transparent,
accessible crypto-based lending services.

| **Characteristic** | **Description** |
|:---|:---|
| Primary Users | Individual retail borrowers seeking personal or small business loans |
| Geographic Focus | Developing economies with limited traditional banking access (e.g., Bangladesh, Southeast Asia, Sub-Saharan Africa) |
| Loan Size Range | Micro to mid-range: 0.1 ETH – 500 ETH equivalent (~\$200 – \$1,000,000 at current rates) |
| User Profile | Digitally literate individuals with cryptocurrency wallet access; small business owners; gig-economy freelancers |
| Key Pain Points | High interest rates from informal lenders; lack of credit history in traditional systems; exclusion from banking due to documentation barriers |

Target customer segment profile.

*This table profiles the target retail segment and highlights
constraints that motivate the design (mobile-first UX, low fees, and
progressive credit building). It supports the thesis claim that retail
adoption is both the largest inclusion lever and the volume driver
required for sustainable platform economics.*

**Why Retail:** The retail segment represents the largest underserved
population in developing economies. According to the World Bank’s Global
Findex Database, approximately 1.4 billion adults remain unbanked, with
the majority concentrated in developing countries. By targeting retail
customers, the platform maximizes financial inclusion impact while
generating the transaction volume necessary to sustain the lending
ecosystem. The hierarchical banking model (World Bank → National
→ Local → Borrower) mirrors how traditional microfinance
institutions reach retail customers in underserved regions, but with
blockchain-enforced transparency and AI-enhanced risk assessment.

### Partner Ecosystem

| **Partner Category** | **Functional Role** | **Blockchain-Mediated Incentive** |
|:---|:---|:---|
| Financial Regulators | Regulatory sandbox approval; compliance oversight | Reduced enforcement cost through on-chain transparency and audit trails |
| Banking Institutions | Network membership as National/Local Banks | Access to diversified global reserve; reduced inter-bank settlement friction |
| Payment Gateway Providers | Fiat-to-crypto on-ramp and off-ramp services | Volume-based transaction fees; expanded market reach |
| Academic & Research Institutions | Validation of AI/ML models; publication of research findings | Access to anonymised datasets; collaborative research opportunities |
| Non-Governmental Organizations | Pilot deployment; field testing with underserved borrower populations | Transparent, low-friction credit access for beneficiaries |

Partner categories and roles.

*This partner ecosystem table identifies the external entities required
for a deployable banking workflow, such as wallet infrastructure, RPC
providers, oracle networks, and regulatory sandbox pathways. The mapping
clarifies which components are on-chain versus off-chain and where
integration risk exists.*

### Incentive Alignment Through the Blockchain Platform

The system manages and enforces partner incentives directly on the
blockchain, making the process more transparent and reliable:

- **Immutable repayment records** serve as an on-chain reputation system
  through permanent repayment records, allowing credit decisions to be
  based on actual data without relying on external credit bureaus.

- **Transparent reserve verification** enables on-chain reserve
  verification, so all participants can independently confirm that
  allocated funds are being used as intended.

- **Programmable fee structures** (with potential for future expansion)
  allow transaction fees to be distributed fairly among network
  participants according to their roles and contributions.

# Literature Review

## Preliminaries

This part defines important terminology and concepts which are employed
in the literature review and the project design.

**Decentralized Finance (DeFi).** DeFi means financial services that are
based on blockchain places that do not use conventional intermediaries.
Lending protocols allow borrowing and lending of assets via smart
contracts, at interest rates that are usually algorithmically calculated
or market utilized.

**Smart contracts.** Self-sovereign programs run on a blockchain that
execute when certain preset conditions are fulfilled. Smart contracts
are used to manage deposits in lending, loan applications, loans, loan
repayments, and interest calculations without human intermediaries.

**Over-collateralization.** Borrowing model in which borrowers are
required to give security at a higher amount than the loan amount. This
is the model that prevails in DeFi (e.g., Aave, Compound) because it
lacks credit scoring; it does not include under-collateralized lending
of the conventional finance.

**Explainable AI (XAI).** Methods that cause machine learning model
predictions interpretable to humans. SHAP and Local Interpretable
Model-agnostic Explanations (LIME) are leading techniques of assigning
importance of features to individual forecasts, which are important in
the regulatory compliance of loans.

**Proof of Stake (PoS).** A network security mechanism of validators
through postage of tokens; applied by Ethereum (after the merge) and
Polygon. PoS is more efficient than Proof of Work and allows the block
finality to be faster.

**Central Bank Digital Currency (CBDC).** A computerized variant of fiat
currency of a nation, centrally issued. CBDCs incorporate leveled
distribution models that are parallel to the multi-tier design that was
discussed in this project.

**Solidarity/Group Lending.** A credit model pioneered by the Grameen
Bank in Bangladesh in which a group of borrowers (typically 3 to 20)
jointly guarantee each other’s loans. Peer social pressure and shared
liability significantly reduce default rates, with BRAC and Grameen Bank
reporting repayment rates above 95% in solidarity group portfolios, a
figure consistently documented in the microfinance literature \[54\].

**Asset-Liability Management (ALM).** The practice of managing
mismatches between the duration and liquidity of a bank’s assets (loans)
and its liabilities (deposits). Duration mismatch, where long-term loans
are funded by short-term deposits, is a primary cause of bank runs and
liquidity crises.

**Flash Loans.** Uncollateralized loans in DeFi that must be borrowed
and repaid within a single blockchain transaction. If repayment fails,
the entire transaction reverts. Flash loans are used for arbitrage and
liquidation but are also exploited in price oracle manipulation attacks
against lending protocols.

**Zero-Knowledge Proof (ZKP).** A cryptographic method by which one
party proves to another that a statement is true without revealing any
information beyond the truth of that statement. In the context of
financial compliance, ZKPs allow a user to prove KYC verification to a
smart contract without exposing personal data on-chain.

**Health Factor (HF).** A numerical measure of the safety of a
collateralized loan position, defined as the ratio of collateral value
adjusted by the liquidation threshold to outstanding debt. When HF falls
below 1.0, the position is eligible for automated liquidation.

## Review of Existing Research

The idea of the Crypto World Bank is designed based on the examination
of peer-reviewed materials, institutional reports, and industry figures
covering more than one sphere of direct interest to our architecture:
blockchain machine learning architecture, decentralized lending protocol
architecture, security, explainable AI in finance, blockchain for
financial inclusion, smart contract security, correspondent banking
economics, monetary policy distribution effects, and real world asset
tokenization.

### Decentralized Lending and DeFi Protocol Design

In their SoK paper, Werner et al. \[1\] systematize DeFi protocol design
and found that current lending markets are homogenous, pool based, and
over-collateralized, and they do not exist institutional hierarchy—a gap
which is directly addressed by this project. Their taxonomy of DeFi
protocols indicates that there is no current system modeling that can
represent multi-tier capital flow in a similar manner to development
finance, ensuring the innovativeness of our four-level approach.

Bastankhah et al. \[2\] present a data-driven DeFi lending protocol that
is adaptive dual fast/slow control architecture which proves the dynamic
interest rate adjustment compares very well with the static utilization
curves employed by Aave and Compound \[59\]. Their experience confirms
that it is a viable method to optimize the algorithmic lending
parameters, which is justified by work we go through our adjustable
levels of interest rates, through the four levels of the hierarchy.

Li et al. \[46\] introduce a multi-chain lending model, which allocates
lending activities on various blockchain networks in order to enhance
throughput and lower single-chain congestion. Their cross-chain
settlement system certifies technical feasibility of executing lending
protocols in heterogeneous blockchain settings, directly promoting our
intended multi-chain implementation approach on Ethereum and Polygon.

Xu et al. \[47\] come up with a DeFi lending protocol evaluation system
that quantifies protocol risk by measuring such metrics as the stability
of utilization ratio, liquidation efficiency, and interest rate
responsiveness. Their assessment system gives them a flexible
methodology, which can be implemented to evaluate the performance of our
hierarchical lending layers versus the current flat-pool protocols.

Sharma et al. \[48\] introduce a peer-to-peer lending framework that is
powered by blockchain that removes intermediary overhead by the use of
smart contract-mediated loan origination and repayment. Although they
are still single-tier in architecture, the cost of their gas analysis
on-chain credentials and management of identity through optimization
strategies and borrowers guides our strategy in reducing transaction
costs in the four level hierarchy. Dao et al. \[60\] demonstrate that
credit scoring models can be adapted for DeFi lending environments,
validating the feasibility of data-informed borrowing limits within
decentralized protocols.

### Machine Learning for Blockchain Security

Palaiokrassas et al. \[3\] use machine learning on multichain DeFi fraud
over 54 million transactions in 23 protocols which show a demonstration
that the behavioral characteristics of DeFi enhance Neural Network and
XGBoost classifiers to F1-scores of 0.76–0.85 versus 0.08 using
transactional features only. Their finding that the behavioral features
are superior to raw transaction data directly informed our feature
engineering method for the random forest fraud detection model.

The algorithm of unsupervised anomaly detection presented by Liu et
al. \[6\] is the Isolation Forest algorithm. The algorithm identifies
anomalies using recursive partitioning of data, which assigns shorter
distances to outliers. We used Isolation Forest as the second detection
model when there are limited labeled fraud data to analyze wallet
behavior, it is possible to detect new patterns of attacks not
pre-labeled.

Hassan et al. \[49\] introduce blockchain and machine learning to detect
fraud with the help of a privacy-protecting and adjustment-flexible
incentive-based method. Their framework trains ML classifiers on
encrypted transaction characteristics via federated learning, whereby
the operators of the detection model never get to see the individual
transaction data. Our future extensions of our AI/ML layer involve the
privacy-preserving paradigm, in which the histories of borrower
transactions should be confidential and at the same time allow
system-wide fraud pattern recognition.

### Explainable AI in Financial Decision Systems

Direct comparison of LIME and SHAP on loan approval is given by Adom et
al. \[4\], SHAP offers more consistent and in-depth feature
attributions, which are found to be deeper via Shapley values whereas
LIME provides quicker running time but less sure descriptions across
repeated evaluations. We have used their comparison to make the decision
to implement SHAP since the main explainability technique of loan risk
measurements, trading off interpretability depth with regulatory
compliance requirements.

Gupta et al. \[56\] use interpretable models that are based on SHAP on
credit default assessment proving that SHAP feature attributions on
Gradient Boosting and Random Forest classifiers are able to score over
0.92 with complete interpretability of individual predictions. Their
approach to causing per-borrower risk explanations tells our intended
credit risk dashboard, where the approvers of loans look at SHAP
waterfall plots before lending decisions are made.

### Blockchain for Financial Inclusion

Tan \[5\] constructs a model of the International Monetary Fund (IMF)
according to which CBDCs in developing countries can bank large unbanked
populations using two-tier distribution model (central bank →
commercial banks → users) that directly parallels our four-tier
hierarchy. The paper shows that the distributed infrastructure of
digital currency can prove to be effective by use of available
institutional means, can access those populations not covered by
traditional banking—facilitating the mission of the Crypto World Bank,
which is transparent and programmable lending to underserved
populations.

The article by Alam et al. \[54\] examines how blockchain technology can
be used in the microcredit industry particularly in Bangladesh, it can
be proven that smart contract-based loan management is capable of
minimizing the administrative overhead by up to 60% as compared to
manual microfinance processes. They have analyzed the Bangladeshi
financial environment where about 40% of adult population do not have
access to formal banking—directly confirms the geographic and
demographic attractiveness of the target market of the Crypto World
Bank.

The article by Islam et al. \[53\] examines the design requirements and
challenges of Central Bank Digital Currencies, there are two levels of
retail CBDC model (central bank to commercial banks to end users) as the
distribution architecture of choice. Their analysis of interoperability
challenges between CBDC systems and existing payment infrastructure
informs our design of the dual-currency facility that bridges fiat and
cryptocurrency within participating banks.

### Group Lending and Microfinance Digitization

The solidarity group lending model, pioneered by Grameen Bank in
Bangladesh and scaled by BRAC (Bangladesh Rural Advancement Committee)
into one of the world’s largest microfinance institutions, demonstrates
that peer-monitored mutual liability can achieve repayment rates
exceeding 95% even among borrowers with no individual collateral or
formal credit history. The blockchain extension of this model replaces
social enforcement with programmable contract enforcement:
multi-signature consent, on-chain group formation, and automatic
collateral pool claims in the event of member default. Alam et
al. \[54\] show that smart contract-based loan management reduces
administrative overhead in Bangladeshi microfinance by up to 60%,
directly validating the economic case for the platform’s group lending
module. Güçük et al. \[61\] provide a broader literature review of
privacy and trust considerations in blockchain-based microlending,
reinforcing the importance of privacy-preserving mechanisms in the group
lending architecture. The convergence of solidarity lending’s social
model and blockchain’s programmable mutual liability represents a
research gap that the Crypto World Bank is designed to partially
address.

### Smart Contract Security and Governance

Atzei et al. \[7\] list Ethereum smart contract attack vectors such as
reentrancy, access control vulnerabilities, integer overflow, and access
control vulnerabilities. They were directly informed by their taxonomy
our implementation of the ReentrancyGuard by OpenZeppelin,
Solidity 0.8.20 inbuilt overflow protection, and role-based access
control modifiers. On their advice we took up their suggested
defense-in-depth strategy of combining security primitives with formal
verification with planning using static analysis (Slither) and symbolic
execution (Mythril).

The article by Wang et al. \[50\] introduces ContractWard which is an
automated vulnerability detection system that uses machine learning
classifiers (Random Forest, SVM, k-NN) to classify six types of smart
contract vulnerabilities based on the features of bytecodes.
ContractWard scores F1-reentrancy and F1-access control with 0.96 and
0.93 respectively, proving that security auditing using ML can be used
to supplement traditional static analysis tools. Our proposed security
verification pipeline will utilize the use of machine learning-based
static analysis tools.

Liao et al. \[51\] present SoliAudit, that is an integration of machine
learning classification and vulnerability assessment of smart contracts
fuzz testing. Their hybrid approach—using ML to first prioritize
probable vulnerable code paths then target fuzz testing—reduces audit
time by an estimated 70% of that spent on manual review. SoliAudit’s
methodology informs our intended security audit plan on the current
three-contract prototype and its planned extensions toward the full
nine-contract architecture.

So et al. \[52\] come up with VERISMART, an extremely accurate Ethereum
safety verifier which employs constraint-based abstract interpretation
to detect arithmetic overflow, division-by-zero and array out-of-bound
errors. VERISMART achieves 98.4% accuracy on benchmark data, but has
zero false positives, so it is a candidate tool to formally verify our
smart contract invariants (e.g., reserve ratio maintenance, cascading
interest rate limits).

### AI Security Features for Blockchain Lending

In addition to the currently existing fraud detection and anomaly
identification models in place in the platform, there are other security
features that are based on AI that can enhance the Crypto World Bank’s
resilience to threats of change:

- **Graph Neural Network (GNN) transaction analysis:** GNN-based models
  are able to analyze the graph structure of transaction to identify
  coordinated rings of fraud—groups of wallets which conspire to rig the
  borrowing limits or make circular lending patterns. A study by
  Palaiokrassas et al. \[3\] proves that graph-based features are much
  superior to flat transaction features as an indicator of DeFi fraud
  detection.

- **Federated learning for cross-bank fraud intelligence:** Hassan et
  al. \[49\] demonstrate that federated learning allows the
  collaboration between several institutions to detect and train fraud
  models without distributing raw transaction information. Deploying
  federated learning of the Crypto World Bank’s National and Local Banks
  would allow detecting threats system wide without compromising the
  privacy of the per-bank data.

- **Reinforcement learning for adaptive interest rates:** As a
  reinforcement-based learning algorithm, adaptive interest rates can be
  learned dynamically; RL agents can dynamically modify interest rate
  parameters to match the varying market conditions, utilization rates,
  and risk profiles, decreasing the lag of manual parameter governance.

- **Real-time smart contract monitoring:** ML-based monitoring agents
  (informed by ContractWard \[50\] and SoliAudit \[51\]) can
  continuously analyze incoming transactions for patterns matching known
  exploit signatures, triggering the platform’s pause mechanism before
  significant losses occur.

- **Natural language processing for income verification:** NLP models
  are able to extract and validate income information in uploaded
  documents, saving the bank officers the manual review load but not
  eliminating verification accuracy.

### Gas Cost Optimization and Layer 2 Scalability

In DeFi, Tolmach et al. \[55\] examine the optimal approaches to
minimization of gas fees, demonstrating that transaction batching,
calldata compression, and tactical time of on-chain operations can save
30–50% of gas costs on Ethereum mainnet. Their findings test our
architectural choice of deploying to Polygon PoS (where fees already are
sub-cent) and inform optimization strategies of the contemplated
Ethereum mainnet deployment. The research also finds out that
complicated multi-step operations of DeFi (analogous to our four-tier
loan lifecycle) benefit disproportionately from Layer 2 deployment due
to the multiplicative savings in gas of sequential calls of contracts.

### Correspondent Banking and Cross-Border Settlement

The Bank of International Settlement \[21\] and Financial Stability
Board \[33\] have extensively documented the structural inefficiencies
of the correspondent banking network. In the traditional model, the
banks are required to have pre-funded nostro accounts in every currency
corridor, establishing a world pool of idle capital which can not be put
into effective productive lending. SWIFT settlements and respondent
banks involves routing of messages using MT103 payment directions,
screening of compliance at all intermediates, and settlement time
extensions to two–five business days. According to the World Bank
Migration and Development Brief \[26\] it is stated that the cost of
transferring \$200 on cross-border is 6.49% on average, with Sub-Saharan
African corridors averaging more than 8%. These results encourage our
development of on-chain settlement with close to instant finality and
sub-cent transaction costs on Layer 2 networks.

### Monetary Policy Distribution and Financial Inequality

Recent empirical studies have reported the distributional impact of
monetary policy on wealth inequality. A 2025 cross-country study
spanning 49 nations (1999–2019) discovered that the relationship between
central bank asset purchases programs and greater wealth inequality,
whose outcomes are stronger in the distribution of wealth and long
lasting \[34\] than income inequality effects. The Federal Reserve’s own
2025 contractionary monetary analysis based on the U.S. metropolitan tax
data confirmed that policies harm the income of low income
employees \[35\]. These findings deliver economic incentive to the
design principles of Crypto World Bank: transparent and monetary
parameters (interest rates, reserve ratios, supply rules) that have been
algorithmically determined represented in smart contracts as opposed to
being established discretionally by central bank decisions. On-chain
transparency of the platform makes sure that all participants follow the
same interest rates and reserve conditions, which removes the
informational asymmetry permitting the Cantillon Effect—the effect that
early receivers of new money created benefit at the expense of
subsequent recipients who will suffer greater prices \[36\].

### Real-World Asset Tokenization and Institutional DeFi

The tokenization of real-world assets is an emerging convergence of
traditional and decentralized finance. The Corda platform of R3 boasts
of more than \$17 billion in tokenized real-world assets on its
permissioned ledger as of September 2025, with institutional
participants including HSBC and Bank of America \[37\]. Centrifuge has
deployed in eight blockchain networks of more than \$1 billion in
tokenized institutional fund products \[38\]. The World Bank is using
blockchain on its own public chain side to track the disbursement of
funds using its FundsChain program (based on Hyperledger Besu) which is
flown on 13 projects in 10 countries and increases to 250 projects by
mid-2026 \[39\]. These developments confirm the institutional interest
of blockchain-based financial infrastructure and the viability of
hierarchical fund distribution design models on distributed ledgers.
This institutional adoption is continued in the Crypto World Bank’s
trajectory through carrying out not only fund tracking but total
hierarchical lending system that has on-chain interest rates, reserves
and credit assessment.

## Literature Review Summary

The most important reviewed works with their methodologies, key
findings, and relevance to our project are presented in
Table [2.2](#tab:lit-summary), in the form of literature
table suggested by Michigan State University Libraries \[23\].

<a id="tab:lit-summary"></a>

| **Author Year** | **Research Focus** | **Methodology** | **Key Findings** | **Relevance to Our Project** |
|:---|:---|:---|:---|:---|
| Palaiokrassas et al. (2023) \[3\] | DeFi fraud detection | XGBoost, NN classifiers on 54M+ multi-chain transactions | F1: 0.76–0.85 vs. 0.08 with features alone | Informs Random Forest fraud modeling |
| Adom et al. (2022) \[4\] | XAI in loan approval | LIME / SHAP comparison on lending datasets | SHAP provides deeper, more consistent explainability; LIME is faster | Justifies SHAP as our primary explainability method |
| Tan (2023) \[5\] | CBDC and IMF financial inclusion | Model for developing nations | TBD | Informs dual-currency facility design |
| Liu et al. (2008) \[6\] | Anomaly detection | Isolation Forest on synthetic and real datasets | Isolation via recursive partitioning; shorter paths | Adopted as secondary unsupervised detection for wallet behaviour |
| Atzei et al. (2017) \[7\] | Smart contract security | SoK of Ethereum attack vectors | Over-reliance, access control vulnerabilities | Directly informs our security primitives and planned formal verification |

Literature review summary (Part A): DeFi lending, fraud detection, and

XAI.


<a id="tab:lit-summary"></a>

*Of the works reviewed, none model a four-tier hierarchical lending
structure, confirming the architectural novelty of this project. The
synthesis shows that DeFi and institutional finance have developed in
parallel without converging on a governance-aware, multi-tier design.*

| **Author Year** | **Research Focus** | **Methodology** | **Key Findings** | **Relevance to Our Project** |
|:---|:---|:---|:---|:---|
| Werner et al. (2022) \[1\] | DeFi protocol systematisation | SoK survey of 12+ DeFi protocol categories | Lending platforms are uniformly pool-based and overcollateralised; no institutional hierarchy exists | Identifies the core gap our four-tier architecture addresses |
| Bastankhah et al. (2023) \[2\] | Adaptive DeFi lending | Dual fast/slow control; simulation on historical data | Dynamic rate adjustment outperforms static utilisation curves | Validates algorithmic lending parameter optimisation |

Literature review summary (Part B): DeFi protocol systematisation and
adaptive lending.

*This continuation extends coverage to governance, settlement, and
institutional blockchain adoption. The key observation is that enabling
infrastructure (Layer 2 networks, oracle pricing, EVM tooling) is
mature, while the specific hierarchical banking architecture remains
architecturally unexplored.*

| **Author Year** | **Research Focus** | **Methodology** | **Key Findings** | **Relevance to Our Project** |
|:---|:---|:---|:---|:---|
| Sharma et al. (2021) \[48\] | Blockchain P2P lending | Smart contract-mediated loan origination framework | Eliminates intermediary overhead; gas cost minimisation analysis | Informs four-tier architecture for peer-to-peer lending |
| Hassan et al. (2022) \[49\] | Privacy-preserving fraud detection | Federated learning on encrypted blockchain features | ML achieves comparable accuracy to centralised models | Informs future privacy-preserving fraud detection extensions |
| Wang et al. (2020) \[50\] | Smart contract vulnerability detection | ML classifiers on bytecode features | F1: 0.96 for access control; 0.93 for data leakage | Supports our planned security verification models |
| Liao et al. (2019) \[51\] | Smart contract audit automation | Hybrid classification + fuzz testing | Reduces audit time by 70% vs. manual review | Informs our security audit strategy for three-contract architecture |

Literature review summary (Part C): blockchain P2P lending,
privacy-preserving ML, and smart contract auditing.

*This continuation captures empirical and systems findings on
cross-border settlement and security tooling, supporting the claim that
Layer 2 deployment and hybrid ML-static analysis pipelines substantially
reduce feasibility risk for an academic prototype.*

| **Author Year** | **Research Focus** | **Methodology** | **Key Findings** | **Relevance to Our Project** |
|:---|:---|:---|:---|:---|
| Islam et al. (2024) \[53\] | CBDC design requirements | Analysis of retail CBDC distribution architecture | Two-tier model preferred; interoperability challenges identified | Informs dual-currency facility design |
| BIS/FSB \[21\] | Cross-border settlement infrastructure | Analysis of cross-border payment costs and capital trapped in nostro accounts | 2–5 days avg. settlement; \$42/transfer avg. cost | Motivates four-tier settlement with near-instant finality |
| Beyer et al. (2025) \[34\] | Monetary policy and inequality | Cross-country analysis (1999–2019) | QE increases wealth inequality; effects more persistent than monetary parameters | Motivates transparent, algorithmic monetary parameters |
| World Bank (2025) \[39\] | Blockchain for development finance | Pilot on 13 projects, 10 countries | Blockchain tracking reduces reporting burden for fund distribution | Supports our planned multi-chain deployment strategy |

Literature review summary (Part D): CBDC design, cross-border
settlement, and multi-chain DeFi.

*This block summarizes works informing the platform’s risk and
monitoring approach. The synthesis justifies the choice of lightweight,
auditable ML components rather than opaque deep learning models,
prioritizing regulatory interpretability over raw detection
performance.*

| **Author Year** | **Research Focus** | **Methodology** | **Key Findings** | **Relevance to Our Project** |
|:---|:---|:---|:---|:---|
| Li et al. (2024) \[46\] | Multi-chain DeFi lending | Cross-chain model design and implementation | Multi-chain distribution improves throughput and reduces congestion | Supports our planned multi-chain deployment strategy |
| Xu et al. (2023) \[47\] | DeFi lending protocol evaluation | Quantitative risk metrics for lending protocol assessment | Utilisation ratio, liquidation efficiency, and reserve responsiveness as key metrics | Provides benchmarks for evaluating our hierarchical tiers |
| Alam et al. (2021) \[54\] | Smart micro-credit in Bangladesh | Smart contract-based microfinance | Reduces admin overhead by 60%; validates geographic and demographic markets | Directly validates our target geographic and demographic market |
| Tolmach et al. (2024) \[55\] | DeFi gas fee optimisation | Transaction batching and calldata compression analysis | Gas savings of 30–50% through optimisation strategies | Validates Layer 2 deployment and mainnet optimisation |
| Gupta et al. (2024) \[56\] | SHAP-based credit default models | SHAP, Random Forest, and Gradient Boosting classifiers | AUC above 0.92 with full interpretability | Informs per-borrower risk explanation methodology |

Literature review summary (Part E): multi-chain DeFi, smart
microfinance, gas optimisation, and SHAP-based credit models.

*This final block closes the synthesis with institutional and
inclusion-related sources. The combined evidence supports the thesis
that blockchain adoption is increasing at the institutional level while
inclusion gaps persist at the retail level, matching the platform’s
intended multi-scale scope.*

## Comparative Protocol Analysis

The literature survey above reveals that no existing DeFi protocol
combines multi-tier institutional hierarchy with AI-assisted governance
and compliance-aware identity.
Table [2.11](#tab:protocol-comparison) provides a structured
comparison of the Crypto World Bank against representative existing
protocols on eleven architectural dimensions.

<a id="tab:protocol-comparison"></a>

| **Feature** | **Aave v3** | **Compound v3** | **MakerDAO** | **Maple** | **Goldfinch** | ****CWB**** |
|:---|:--:|:--:|:--:|:--:|:--:|:--:|
| Institutional hierarchy | ✗ | ✗ | ✗ | ✗ | ✗ | **✓ 4-tier** |
| Cross-tier capital flow | ✗ | ✗ | ✗ | ✗ | ✗ | **◐ Designed** |
| Same-tier interbank lending | ✗ | ✗ | ✗ | ✗ | ✗ | **◐ Designed** |
| Solidarity group lending | ✗ | ✗ | ✗ | ✗ | Partial | **○ Planned** |
| AI/ML fraud detection | ✗ | ✗ | ✗ | Manual | Manual | **◐ Built, not integrated** |
| SHAP explainability | ✗ | ✗ | ✗ | ✗ | ✗ | **◐ Built, not integrated** |
| ZKP KYC compliance | ✗ | ✗ | ✗ | ✗ | ✗ | **○ Planned** |
| Kinked interest rate curve | ✓ | ✓ | Via gov. | ✓ | ✗ | **◐ Designed** |
| Role-based access control | Partial | Partial | Via gov. | ✓ | Partial | **✓ Implemented** |
| Developing-economy focus | ✗ | ✗ | ✗ | ✗ | ✓ | **✓ Bangladesh** |
| TVL / Status (2026) | \$26.3B | \$1.4B | \$10.5B | \$2.6B | \$680M | **Testnet** |

Comparative protocol analysis: existing DeFi lending protocols vs. the

Crypto World Bank (CWB). ✓ =

implemented/present; ◐ =

designed/partial; ○ = planned;

✗ = absent.


This comparison directly answers RQ1: no existing protocol models
institutional hierarchy, cross-tier capital flow, or solidarity group
lending in one decentralized architecture. The Crypto World Bank is
architecturally distinct across every dimension that characterizes
development banking.

### Literature Synthesis

The literature synthesis above directly informs four architectural
decisions in this work: (1) Gudgeon et al.’s (2020) \[R3\] empirical
finding that utilization above 90% causes liquidity crises motivates the
kinked interest rate model in
Section [3.7](#sec:kinked-rate); (2) Piper et
al.’s (2025) \[R8\] ZKP permissioning framework provides the technical
foundation for the compliance pathway in
Section [3.6.1](#sec:identity); (3) the empirical finding of
Howlader & Halder (2025) \[R11\] that mobile financial inclusion in
Bangladesh grew by 99% between 2004 and 2021 validates the retail-tier
accessibility argument in
Section [1.6](#sec:research-contribution); and (4) Alam et
al.’s (2021) \[54\] IEEE TENSYMP paper on blockchain microcredit in
Bangladesh provides direct prior art that this thesis advances.

## Summary of Key Findings

The following summarized findings are obtained in the literature review
and are directly informative to our design:

- **DeFi lending is structurally flat.** Available protocols (Aave,
  Compound, MakerDAO) operate pool-based or over-collateralized models
  with total value locked exceeding \$55 billion \[13\]. Institutional
  hierarchy has no comparable protocol models to development finance.
  The research by CBDC \[5\] ascertains that tiered distribution is
  workable and promotes financial inclusion.

- **Correspondent banking is inefficient in structure.** Cross-border
  settlement spends two to five days at average costs of \$42 per
  transaction \[25\]. The system traps important capital lying idle in
  nostro/vostro accounts \[24\], and remittance fees are estimated to
  consume between \$48–56 billion a year \[26\]. On-chain settlement on
  Layer 2 networks is known to cut the latency (to seconds) and the cost
  (to sub-cent levels) down.

- **ML enhances fraud detection in blockchain.** DeFi-specific
  behavioral features significantly work well as compared to
  transactional features (F1: 0.76–0.85 vs. 0.08 \[3\]). The Isolation
  Forest \[6\] allows unsupervised detection in which labeled data is
  scarce.

- **SHAP is explainable by regulators.** SHAP offers greater consistency
  and is better than the LIME in loan approval systems \[4\] in meeting
  prudential demands on open-minded automated decision-making.

- **Layered defense is needed in smart contract security.** Reentrancy,
  overflow, and vulnerabilities to access control are well
  documented \[7\]. ML-based vulnerability detection achieves F1-scores
  of above 0.93 \[50\], and hybrid ML-fuzz methods reduce audit time by
  70% \[51\]. Verification tools are formal, i.e., VERISMART achieves
  98.4% precision \[52\]. Automated primitives used with OpenZeppelin
  are recommended for production deployments to be verified.

- **Monetary policy leads to distributional inequality.** Cross-country
  evidence \[34\] and Federal Reserve research \[35\] confirm that
  quantitative easing disproportionately favors asset holders, and
  workers of lower income cover the expenses of both inflation and
  consequent tightening. Transparent, algorithmic monetary parameters
  can decrease this informational asymmetry.

- **The use of blockchains in institutions is gaining momentum.** The
  World Bank’s FundsChain \[39\], tokenized assets of R3 Corda worth
  \$17 billion \[37\], and JPMorgan Kinexys settling multi-billion
  dollars per day \[40\] reflect the fact that financial institutions
  are actively implementing blockchain on settlement, funds tracking,
  and asset tokenization.

- **Blockchain allows financial inclusion.** Approximately 1.4 billion
  adults were not banked in any country around the world \[14\], and
  DeFi was found by the World Economic Forum as a leaping frog
  technology that allows peoples to avoid the banking systems
  infrastructure \[41\]. The MiniPay wallet of Celo has onboarded
  14 million users in over 60 countries with less than cent transaction
  fees \[42\]. Blockchain-based microcredit in Bangladesh shows 60%
  decrease on administrative overhead \[54\].

- **Multi-chain lending enhances scalability.** Cross-chain lending
  models \[46\] and Layer 2 gas optimization strategies \[55\] prove the
  fact that the lending is distributed when operating on several
  networks, decreasing congestion and transaction costs by 30–50%.

- **ML can be used to detect cross-institutional fraud using privacy
  preserving ML.** Federated learning methods \[49\] are such that
  enable several lending institutions to cooperate and learn fraud
  detection models in a non-intrusive manner, i.e. no individual
  transaction data is exposed, resolving the conflict between
  institution-wide security and data privacy.

- **Group lending reduces default risk in underserved markets.**
  Microfinance research from BRAC, Grameen Bank, and ASA consistently
  reports repayment rates above 95% in solidarity group
  structures \[54\]. On-chain enforcement of mutual liability, replacing
  social pressure with programmable contract enforcement, has not been
  studied in the academic literature, representing an open research gap
  that this project begins to address.

- **Sustainable microfinance requires deposit-funded lending.**
  Literature on sustainable microfinance institutions consistently shows
  that deposit-funded lending rather than donor-funded or externally
  capitalized models is the only economically viable approach at scale.
  The platform’s banking product suite is designed to close this loop by
  mobilizing retail savings at the Local Bank tier to partially fund the
  lending pool.

The results explain why we have a four-tier architecture, AI/ML
integration (Random Forest, Isolation Forest, SHAP), cross-tier lending
structure, governance structure, and planned security verification
pipeline.

# System Architecture and Design

## Prototype Scope

Evaluators should distinguish between what has been **built and
tested**, what has been **designed and partially scaffolded**, and what
is **planned** for the final thesis phase.
Table [3.1](#tab:prototype-scope) provides this mapping for
every major platform feature.

<a id="tab:prototype-scope"></a>

| **Feature** | **Status** |
|:---|:--:|
| Four-tier role system (RBAC) | ✓ Implemented |
| World Bank Reserve contract (Tier 1) | ✓ Implemented |
| Tier 2 National Bank contracts | ◐ Designed, partial |
| Tier 3 Local Bank contracts | ◐ Designed, partial |
| Cross-tier fund transfer | ◐ Designed, unimplemented |
| Loan request / approval workflow | ✓ Implemented |
| Installment EMI auto-generation | ◐ Designed |
| SavingsVault contract | ○ Planned (final thesis) |
| FixedDeposit contract | ○ Planned (final thesis) |
| GroupLendingPool contract | ○ Planned (final thesis) |
| InterBankLendingPool | ○ Planned (final thesis) |
| AI/ML fraud detection (Random Forest) | ◐ Built, not integrated |
| SHAP explainability output | ◐ Built, not integrated |
| Oracle integration (Chainlink Functions) | ○ Planned (final thesis) |
| ZKP KYC compliance layer | ○ Planned (final thesis) |
| Testnet deployment evidence | ✓ Addresses in Appendix C |

Prototype scope: feature implementation status as of pre-thesis

submission. ✓ = Implemented

and testnet-verified; ◐ =

Designed or partially scaffolded;

○ = Planned for final thesis

phase.


This table eliminates any ambiguity between present-tense architectural
description and empirical implementation evidence throughout the
following sections.

## High-Level Architecture

The system employs a **three-layer decentralized application
architecture**:

<div class="minipage">

<div class="center">

<div class="tcolorbox">

**React 18** $`\cdot`$ **TypeScript** $`\cdot`$ **Material Design 3**
$`\cdot`$ **Wagmi** $`\cdot`$ **Viem**\
Modules: Dashboard, Deposit, Loan, Admin, Risk AI, QR

</div>

$`\boldsymbol{\downarrow}`$

<div class="tcolorbox">

**World Bank Reserve Contract** $`\cdot`$ **National Bank Contract**
$`\cdot`$ **Local Bank Contract**\
Operations: Reserve Mgmt, Hierarchical Lending, Loan Lifecycle, Access
Control, Emergency Controls

</div>

$`\boldsymbol{\downarrow}`$

<div class="tcolorbox">

**Express.js** (REST API) $`\cdot`$ **PostgreSQL** (Relational DB)
$`\cdot`$ **FastAPI** (ML Inference Service)\
AI/ML: Random Forest (Fraud) $`\cdot`$ Isolation Forest (Anomaly)
$`\cdot`$ SHAP (Explainability)\
Event Listener $`\cdot`$ Cache (Redis)

</div>

</div>

</div>

The current prototype implements three core contracts (World Bank
Reserve, National Bank, Local Bank). The complete architecture extends
to nine modular contracts covering the full banking product suite
described in
Section [3.11](#sec:banking-products), including the
SavingsVault, FixedDeposit, GroupLendingPool, FXModule, InsuranceFund,
and CurrentAccount contracts, with the remaining modules planned for
implementation in the final thesis phase.

Figure [3.1](#fig:component-diagram) shows the component
interactions across these three layers. The diagram reflects the current
three-contract prototype view; the nine-contract target architecture is
specified in Appendix B and will be reflected in an updated diagram in
the final thesis phase.



### Figure (`fig:component-diagram`)

**Caption (from manuscript):** Component diagram showing interactions between the presentation layer, smart contract layer, off-chain backend services, and external systems.

**Source file (repository):** `Documentation/Diagrams/CSE471/Component Diagram.png`

![Component diagram showing interactions between the presentation layer, smart contract layer, off-chain backend services, and external systems.](Documentation/Diagrams/CSE471/Component%20Diagram.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:component-diagram`**.




## Blockchain Platform Selection

| **Criterion** | **Selection** | **Justification** |
|:---|:---|:---|
| Platform | Ethereum Virtual Machine (EVM) | Largest developer ecosystem; battle-tested security model; extensive tooling. |
| Network | Polygon Amoy / Ethereum Sepolia | Zero-cost deployment; production-equivalent behaviour; free faucet access. |
| Consensus | Proof-of-Stake via Polygon validators | Energy-efficient; sub-2-second block finality; decentralised validator set. |
| Smart contract language | Solidity 0.8.20 | Industry standard; mature compiler with overflow protection; rich library ecosystem. |

Blockchain platform selection criteria and justification.

*This platform selection table compares candidate networks using
criteria relevant to banking workflows, including cost, finality,
throughput, and ecosystem maturity. It motivates the selection of an
EVM-compatible Layer 2 deployment for low-fee retail operations while
retaining portability to other EVM chains.*

| **Criterion** | **Selection** | **Justification** |
|:---|:---|:---|
| Gas cost | \$0.001–\$0.01 per transaction | Orders of magnitude cheaper than Ethereum mainnet (\$5–\$50); enables micro-loan economics. |
| Block finality | $`\approx`$<!-- -->2 seconds | Sub-second practical finality for retail UX; checkpointed to Ethereum for security. |
| Developer tooling | Hardhat + OpenZeppelin | Automated test suite, deployment scripts, and audited security primitives. |
| Testnet availability | Amoy (Polygon), Sepolia (Ethereum) | Free faucets; EVM-identical behaviour; no real cryptocurrency required for prototype. |
| Migration path | EVM-compatible | Same Solidity contracts deploy to any EVM chain; reduces future L2 migration cost. |

Blockchain platform selection (continued): operational and deployment
factors.

*This supplementary comparison expands the platform evaluation to
additional operational and deployment factors. The conclusion is that
Polygon PoS provides a practical balance of stability and low
transaction costs for an academic prototype, with a clear migration path
if future requirements demand alternative L2s.*

### Transaction Verification and Consensus

- **Polygon PoS:** An independent set of PoS validators checks
  transactions, reaching block finality in approximately two seconds.
  Checkpoints are periodically committed to the Ethereum mainnet for
  additional security.

- **On prototype testnets:** Amoy and Sepolia use equivalent consensus
  models at no financial cost, enabling incremental development and
  testing without exposure to real-asset risk.

### Oracle Architecture: Off-Chain AI to On-Chain Decision

The Crypto World Bank requires a mechanism to convey off-chain AI/ML
risk assessments into the on-chain loan approval workflow. This is an
instance of the oracle problem \[R1,R2\]. The prototype implements a
**commit-reveal relay** pattern, illustrated conceptually as follows:

1.  The off-chain FastAPI ML service evaluates a loan application and
    produces a risk score $`s \in [0,1]`$.

2.  Before the loan decision window opens, the service submits a
    commitment: $`h = \text{keccak256}(s \,\|\, \text{nonce})`$ to the
    `LoanController` contract via the `commitRiskScore(loanId, h)`
    function.

3.  Within the decision window, the service reveals $`s`$ and the nonce:
    `revealRiskScore(loanId, s, nonce)`.

4.  The contract verifies
    $`h = \text{keccak256}(s \,\|\, \text{nonce})`$, stores $`s`$
    immutably, and applies the governance-defined threshold: loans with
    $`s > 0.75`$ are flagged for manual review regardless of collateral
    status.

This pattern prevents score manipulation between commitment and
decision, keeps ML computation off-chain (saving gas), and creates an
immutable on-chain audit trail of every risk score used in a lending
decision. In the final thesis phase, this centralized relay will be
replaced by Chainlink Functions, removing the remaining trust assumption
at the cost of additional latency and per-call fees.

The diagram placeholder for this architecture (Figure pending):
`oracle_architecture.png`—off-chain FastAPI ML service → commit
→ reveal → on-chain LoanController.

## Data Model and Database Design

The relational database schema comprises 15 normalized entities in Third
Normal Form (3NF).
Figure [3.2](#fig:core-system-graph) presents the core system
graph showing entity relationships,
Figure [3.3](#fig:erd) presents the full Entity-Relationship
Diagram (ERD), and Figure [3.4](#fig:eer) presents the Enhanced
Entity-Relationship (EER) diagram.



### Figure (`fig:core-system-graph`)

**Caption (from manuscript):** Core system graph: Crypto World Bank entity relationship model showing the four-tier banking hierarchy (World Bank $\to$ National Bank $\to$ Local Bank $\to$ BANK_USER), the central BORROWER entity, and the lending-lifecycle sub-graph (LOAN_REQUEST, TRANSACTION, INCOME_PROOF, INSTALLMENT, CHAT_MESSAGE, AI_ML_LOG).

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

- **Node:** WORLD_BANK
- **Node:** NATIONAL_BANK
- **Node:** LOCAL_BANK
- **Node:** BANK_USER\\{\scriptsize National}
- **Node:** BANK_USER\\{\scriptsize Local}
- **Node:** BORROWER
- **Node:** LOAN_REQUEST
- **Node:** TRANSACTION
- **Node:** INCOME_PROOF
- **Node:** INSTALLMENT
- **Node:** CHAT_MESSAGE
- **Node:** AI_ML_LOG
- **Edge/node label:** \small 1:N
- **Edge/node label:** \small 1:N
- **Edge/node label:** \small 1:N
- **Edge/node label:** \small 1:N




<div class="highlightbox">

**Reading guide.** Arrows denote *one-to-many (1:N)* relationships
flowing downward through the institutional hierarchy. **BANK_USER**
specialises into *National* and *Local* variants (disjoint
generalisation—see Figure [3.4](#fig:eer)). **BORROWER** is the pivot entity: it
aggregates identity, credit history, and all transactional records.
**LOAN_REQUEST** is the *aggregation hub* for the lending lifecycle:
INSTALLMENT (weak entity), CHAT_MESSAGE (audit trail), and AI_ML_LOG
(risk scoring) all depend on it existentially. The complete attribute
sets for every entity are shown in the ERD
(Figure [3.3](#fig:erd)) and the full EER model
(Figure [3.4](#fig:eer)).

</div>



### Figure (`fig:erd`)

**Caption (from manuscript):** Entity-Relationship Diagram (ERD) for the Crypto World Bank database: all 15 normalized tables (3NF) with primary keys (PK), foreign keys (FK), data types, and relationship connectors. Crow's-foot notation indicates cardinality.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

- **Node:** WORLD_BANK
- **Node:** NATIONAL_BANK
- **Node:** LOCAL_BANK
- **Node:** AI_CHATBOT_LOG
- **Node:** MARKET_DATA
- **Node:** PROFILE_SETTINGS
- **Node:** BORROWER
- **Node:** BANK_USER
- **Node:** INCOME_PROOF
- **Node:** BORROWING_LIMIT
- **Node:** LOAN_REQUEST
- **Node:** TRANSACTION
- **Node:** CHAT_MESSAGE
- **Node:** INSTALLMENT
- **Node:** AI_ML_SECURITY_LOG




The current ERD covers the core lending and governance entities.
Extended banking entities including SavingsAccount, FixedDeposit,
LoanGroup, GroupMember, CurrentAccount, and InsuranceFund are designed
for the full system and will be incorporated into the updated data model
in the final thesis.



### Figure (`fig:eer`)

**Caption (from manuscript):** Enhanced Entity-Relationship (EER) diagram: full data model showing generalization/specialization (BANK_USER $\to$ National/Local subtypes), weak entity (INSTALLMENT), multi-valued attribute (INCOME_PROOF), aggregation (Loan-Centric cluster), and participation constraints. Panel borders group related constructs.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

- **Node:** MARKET_DATA\\{\tiny PK: market_data_id}\\{\tiny cryptocurrency_type, price_usd}
- **Node:** AI_CHATBOT_LOG\\{\tiny PK: log_id}\\{\tiny user_wallet, intent}
- **Node:** PROFILE_SETTINGS\\{\tiny PK: profile_id}\\{\tiny user_type, user_id}\\{\tiny terms_accepted}
- **Node:** WORLD_BANK\\{\tiny PK: world_bank_id}\\{\tiny total_reserve, name}
- **Node:** NATIONAL_BANK\\{\tiny PK: national_bank_id}\\{\tiny FK: world_bank_id}\\{\tiny country, total_borrowed}
- **Node:** LOCAL_BANK\\{\tiny PK: local_bank_id}\\{\tiny FK: national_bank_id}\\{\tiny city, total_lent}
- **Node:** BANK_USER\\{\tiny PK: bank_user_id}\\{\tiny wallet_address, role}\\{\tiny discriminator: bank_type}
- **Node:** NATIONAL_BANK_USER\\{\tiny FK: national_bank_id}
- **Node:** LOCAL_BANK_USER\\{\tiny FK: local_bank_id}
- **Node:** BORROWER\\{\tiny PK: borrower_id}\\{\tiny wallet_address, country}\\{\tiny consecutive_paid_loans}
- **Node:** INCOME_PROOF\\{\tiny PK: proof_id}\\{\tiny FK: borrower_id}\\{\tiny file_hash, status}
- **Node:** BORROWING_LIMIT\\{\tiny PK: limit_id}\\{\tiny FK: borrower_id (UNIQUE)}\\{\tiny six_month_remaining}\\{\tiny (derived)}
- **Node:** LOAN_REQUEST\\{\tiny PK: loan_id}\\{\tiny FK: borrower_id, local_bank_id}\\{\tiny amount, status, deadline}
- **Node:** INSTALLMENT\\{\tiny PK: loan_id + installment_number}\\{\tiny FK: loan_id (identifying)}\\{\tiny amount_due, due_date, status}
- **Node:** TRANSACTION\\{\tiny PK: transaction_id}\\{\tiny FK: borrower_id}\\{\tiny related_loan_id}\\{\tiny transaction_type, amount}
- **Node:** CHAT_MESSAGE\\{\tiny PK: message_id}\\{\tiny FK: loan_id}\\{\tiny sender_type, message_text}
- **Node:** AI_ML_SECURITY_LOG\\{\tiny PK: security_log_id}\\{\tiny FK: loan_id, transaction_id}\\{\tiny risk_type, risk_score}
- **Edge/node label:** operates 1:N
- **Edge/node label:** supervises 1:N




### Entity Summary

| **Entity** | **Role / Description** |
|:---|:---|
| WORLD_BANK | Top-level reserve holder; global lending parameters. |
| NATIONAL_BANK | Country-level banks; borrow from World Bank. |
| LOCAL_BANK | City-level banks; borrow from National Bank and lend to users. |
| BANK_USER | Bank staff with role-based permissions (approve/reject loans). |
| BORROWER | End-users requesting and repaying loans. |
| LOAN_REQUEST | Loan applications and full lifecycle tracking. |
| INSTALLMENT | Repayment schedule records (weak entity dependent on LOAN_REQUEST). |
| TRANSACTION | Financial transaction records. |
| BORROWING_LIMIT | Per-borrower limits with 6-month and 1-year rolling windows. |
| INCOME_PROOF | Income verification documents (multi-valued per borrower). |
| CHAT_MESSAGE | Borrower-bank communication records. |
| AI_CHATBOT_LOG | AI chatbot interaction records. |
| AI_ML_SECURITY | Security and ML monitoring events. |
| MARKET_DATA | Cryptocurrency price feeds. |
| PROFILE_SETTING | User profile and platform preferences. |

Database entity summary (15 entities).

*This entity summary table enumerates the relational entities used to
model hierarchical institutions, lending lifecycle, verification, and
communication. The on-chain/off-chain split implied by the entities
supports the architectural principle that high-integrity state
transitions occur on-chain while analytics and document workflows remain
off-chain.*

### EER Constructs Applied

| **EER Construct** | **Applied To** | **Notes** |
|:---|:---|:---|
| Specialisation (disjoint) | BANK_USER → NationalBankUser, LocalBankUser | A bank user belongs to exactly one bank type; enforced by CHECK constraint. |
| Generalisation | WORLD_BANK, NATIONAL_BANK, LOCAL_BANK share institution attributes | Avoids attribute duplication across institution types. |
| Weak entity | INSTALLMENT depends on LOAN_REQUEST | Existence and identity determined by parent loan. |
| Multi-valued attribute | INCOME_PROOF per BORROWER | Modelled as separate entity to maintain 1NF. |
| Aggregation | LOAN_REQUEST aggregates BORROWER + LOCAL_BANK | Captures the ternary relationship between borrower, bank, and loan. |
| Participation constraint | BORROWER must have $`\geq 1`$ LOAN_REQUEST to access services | Enforced at application layer; architecturally planned for on-chain. |

EER constructs applied: specialisation, hierarchy, and constraints.

*This table captures the EER constructs applied to represent
specialization, hierarchy, and constraints in the data model. It
demonstrates how institutional roles and banking participants are
modeled without duplicating attributes across tables, improving data
integrity and query clarity.*

### Normalization

The schema has been normalized to Third Normal Form (3NF) and checked
against Boyce-Codd Normal Form (BCNF):

- **1NF:** There are no repeating groups in any of the attributes.
  Separate entities store multi-valued attributes, such as proof of
  income.

- **2NF:** There are no partial dependencies. The full composite key
  (`loan_id`, `installment_number`) determines the non-key attributes of
  INSTALLMENT.

- **3NF:** No dependencies that go through other dependencies. Instead
  of storing redundant values like `total_borrowed` in bank entities,
  they are calculated at query time.

- **BCNF:** All determinants are candidate keys. A CHECK constraint on
  BANK_USER enforces that the generalization hierarchy’s specializations
  are not the same.

### Indexing Strategy

We use B-tree indexes (the default in PostgreSQL) for efficient
retrieval on frequently queried columns:

| **Index** | **Table / Column(s)** | **Rationale** |
|:---|:---|:---|
| `idx_loan_borrower` | LOAN_REQUEST(`borrower_id`) | High-frequency lookup for borrower loan history. |
| `idx_loan_status` | LOAN_REQUEST(`status`) | Efficient filtering of active vs. closed loans. |
| `idx_installment_due` | INSTALLMENT(`due_date`) | Range query for overdue installment detection. |
| `idx_txn_created` | TRANSACTION(`created_at`) | Time-window aggregation for 6-month and 1-year borrowing limits. |
| `idx_txn_borrower` | TRANSACTION(`borrower_id`) | Per-borrower transaction history retrieval. |
| `idx_market_symbol` | MARKET_DATA(`symbol, recorded_at`) | Composite index for price feed time-series queries. |

Indexing strategy: B-tree indexes for time-window and high-frequency
queries.

*This indexing table lists the primary indexes used to support
time-window queries (e.g., rolling 6-month/1-year transaction windows)
and high-frequency lookups. The selection emphasizes B-tree suitability
for range filtering common in risk analytics and reporting, improving
performance without complicating the schema.*

B-tree indexes are chosen for their efficiency with range queries (e.g.,
transactions within the last 6 months); hash indexes would be suitable
only for exact-match lookups.

### Functional Dependencies

| **Relation** | **Functional Dependency** | **Notes** |
|:---|:---|:---|
| LOAN_REQUEST | `loan_id` → all attributes | Primary key determines row. |
| LOAN_REQUEST | `borrower_id, local_bank_id` → status, amount, … | One active request per borrower per bank. |
| BORROWING_LIMIT | `borrower_id` → `six_month_limit, one_year_limit`, … | 1:1 with BORROWER. |
| BORROWER | `wallet_address` → `borrower_id`, all attributes | Wallet address is a unique candidate key. |
| INSTALLMENT | `loan_id, installment_number` → `amount, due_date, status` | Composite primary key; fully determined by both columns. |

Representative functional dependencies.

*This functional dependency table documents the data-level rules that
prevent inconsistent state, such as improper loan status transitions or
duplicated relationships. Explicit FDs reinforce that key banking
invariants are enforced structurally, complementing smart contract
enforcement on the on-chain side.*

### Relational Integrity Constraints

| **Constraint Type** | **Examples** |
|:---|:---|
| Primary Key | `world_bank_id`, `loan_id`, `borrower_id`, etc. |
| Foreign Key | `local_bank_id` in LOAN_REQUEST references LOCAL_BANK. |
| UNIQUE | `wallet_address` in BORROWER; `blockchain_tx_hash` in LOAN_REQUEST. |
| CHECK | BANK_USER: `(bank_type=’national’ AND national_bank_id IS NOT NULL) OR (bank_type=’local’ AND local_bank_id IS NOT NULL)`. |
| NOT NULL | Core attributes: `name`, `wallet_address`, `status`. |

Relational integrity constraints.

*This integrity constraints table summarizes referential and domain
constraints that keep loan, repayment, and identity records consistent.
These constraints reduce operational risk by preventing orphaned records
and invalid lifecycle states, which is critical for auditability in
financial systems.*

## On-Chain and Off-Chain Data Partitioning

| **Data Category** | **Storage** | **Rationale** |
|:---|:---|:---|
| Reserve balances, loan requests, approval/rejection events, repayment transactions | On-chain | Immutability, public auditability, trustless verification. |
| User profiles, income verification documents, chat messages, AI/ML inference logs | Off-chain (database) | Data privacy, query flexibility, storage cost optimisation. |
| Borrowing limit computations | Off-chain with on-chain enforcement | Complex temporal aggregation; results committed as on-chain constraints. |
| Cryptocurrency market data | Off-chain (cached) | High-frequency updates; external API dependency. |

Data partitioning between on-chain and off-chain storage.

*This partitioning table clarifies which data must live on-chain (role
bindings, reserves, and critical state transitions) versus off-chain
(documents, analytics features, and operational metadata). The
partitioning choice balances transparency and tamper-resistance with
practical storage and privacy constraints.*

## Digital Identity System

The platform’s identity model operates across two layers, combining
wallet-based authentication with off-chain document verification, and is
designed to accommodate compliance requirements in future phases.

- **Identity based on wallets:** Users authenticate via Ethereum wallet
  signatures (MetaMask, WalletConnect), eliminating the need for
  centralised credential storage.

- **Role binding:** In the smart contract permission system, wallet
  addresses are linked to hierarchical roles like Owner, National Bank,
  Local Bank, Approver, and Borrower.

- **Limits of wallet-based identity:** Wallet ownership proves
  transaction history and cryptographic control but cannot independently
  prove legal identity, jurisdiction, or age. This distinction is
  critical for regulated banking operations. A compromised or lost
  wallet requires an off-chain recovery process and on-chain role
  revocation followed by re-binding to a replacement address, a
  governance workflow that must be carefully designed to prevent
  unauthorized role escalation.

- **On-chain versus off-chain identity layers:** The system maintains
  two identity layers. On-chain identity consists of the wallet address,
  assigned role, and transaction history recorded permanently on the
  blockchain. Off-chain identity consists of document-verified income,
  KYC credentials, and AML screening results stored in the PostgreSQL
  database and linked to the wallet address by hash reference. The
  planned ZKP-based compliance extension would allow users to prove
  off-chain KYC status to the smart contract without exposing personal
  documents on-chain.

### ZKP KYC Compliance Architecture

The ZKP compliance extension uses **zk-SNARKs** (specifically Groth16
proofs via Circom 2.0 + snarkjs) to enable a borrower to prove off-chain
KYC status to the smart contract without exposing personal data
on-chain \[R8,R9\]. The architecture works as follows:

1.  An off-chain KYC provider validates the user’s NID and issues a
    signed credential:\
    $`\textit{credential} = \text{Sign}_{\text{KYC}}(\textit{wallet\_address},\, \textit{country},\, \textit{age\_over\_18},\, \textit{kyc\_passed})`$.

2.  The user generates a zk-SNARK proof that: (a) they possess a valid
    signed credential from an approved KYC provider, (b) their age is
    over 18, and (c) their country is in the permitted jurisdiction
    list—without revealing the underlying credential, NID, or personal
    data.

3.  The smart contract verifies the proof using an on-chain Groth16
    verifier:\
    `KYCVerifier.verify(proof, public_inputs)` returns `true`.

Piper et al. (2025) \[R8\] demonstrate proof generation times of 1–4
seconds on consumer hardware. On-chain verification costs approximately
200,000–300,000 gas on Ethereum, within a one-time registration budget.
The ResearchGate (2025) study reports a 97% reduction in exposed user
data versus conventional on-chain KYC. Implementation for the final
thesis phase will use Circom 2.0 circuits deployed to Polygon Amoy
testnet, tested with synthetic credential data.

## Kinked Interest Rate Model

The Crypto World Bank adopts a **kinked utilization-based interest rate
model**, following the design established by Compound Finance and
Aave v2/v3 and motivated by empirical findings from Gudgeon et
al. (2020) \[R3\]. Below an optimal utilization rate $`U^*`$ (set at 80%
for retail lending pools), the borrowing rate increases gently:

``` math
\begin{equation}
r_b(U) = r_0 + \frac{U}{U^*} \cdot r_1, \quad U \leq U^* \tag{Formula 18}
\end{equation}
```

Above $`U^*`$, the rate increases steeply to incentivize rapid repayment
and new deposits:

``` math
\begin{equation}
r_b(U) = r_0 + r_1 + \frac{U - U^*}{1 - U^*} \cdot r_2, \quad U > U^* \tag{Formula 19}
\end{equation}
```

where $`r_0`$ is the base rate, $`r_1`$ is the slope below the kink, and
$`r_2`$ is the jump multiplier above the kink. This piecewise model
prevents liquidity crises in which utilization approaches 100% and
depositors are unable to withdraw—a failure mode documented empirically
in DeFi lending markets by Gudgeon et al. (2020) \[R3\] and analyzed
theoretically by Mackinga et al. (2023) \[R4\].

## Reentrancy and Security Analysis

**Checks-Effects-Interactions (CEI) pattern.** The CEI pattern is
applied to all state-mutating functions in the lending contracts. The
three functions most vulnerable to reentrancy are:

1.  **`disburseLoan(address borrower, uint256 amount)`** — sends ETH to
    the borrower. Mitigation: update
    `loanStatus[borrower] = LoanStatus.ACTIVE` *before* calling
    `payable(borrower).transfer(amount)`, and apply `nonReentrant`.

2.  **`processInstallment(uint256 loanId)`** — updates the repayment
    schedule. CEI order: check → mark installment paid →
    emit event → release interest share.

3.  **`allocateCapital(address nationalBank, uint256 amount)`** —
    cross-tier ETH transfer. Apply both `nonReentrant` and an explicit
    `require(allocatedTo[nationalBank] + amount <= maxAllocation)` check
    before any state change.

The DAO hack (2016, $`\approx`$\$60 million) and Curve Finance
reentrancy exploit (2023, $`\approx`$\$70 million via Vyper compiler
bug) demonstrate that reentrancy is not a solved problem in DeFi, even
with guards \[R6\]. Formal verification with Certora or Mythril is
planned for the final thesis security audit.

**Flash loan scope.** Flash loan attacks primarily exploit
price-sensitive logic, specifically protocols that use on-chain pool
spot prices for collateral valuation \[R5\]. In the current prototype,
no price-sensitive logic exists because stablecoin integration is not
yet implemented, collateral valuation is not automated on-chain, and
oracle feeds have not yet been integrated. Therefore, the current
contracts do not present a meaningful flash loan attack surface. Once
stablecoin integration and oracle-based collateral pricing are
implemented (planned for the final thesis phase), mitigations must
include: (1) TWAP oracles rather than spot price reads, (2) multi-block
confirmation requirements for large collateral updates, and (3)
Chainlink price feeds with circuit breakers.

## System Modeling

This section presents the system analysis diagrams that model the
platform’s structure, behavior, and data flow.

### Use Case Diagram

The system involves four primary actors—Borrower, Bank Approver, World
Bank Admin, and National Bank—across 29 use cases.
Figure [3.5](#fig:usecase) shows the complete use case
diagram.



### Figure (`fig:usecase`)

**Caption (from manuscript):** Use case diagram for the Crypto World Bank platform, showing interactions among four primary actors (World Bank Admin, National Bank, Local Bank Approver, Borrower) across 29 identified use cases, including registration, loan request, approval workflow, and repayment.

**Source file (repository):** `Documentation/Diagrams/CSE471/Usecase diagram.png`

![Use case diagram for the Crypto World Bank platform, showing interactions among four primary actors (World Bank Admin, National Bank, Local Bank Approver, Borrower) across 29 identified use cases, including registration, loan request, approval workflow, and repayment.](Documentation/Diagrams/CSE471/Usecase%20diagram.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:usecase`**.




### Activity Diagrams

Figures [3.6](#fig:act-loan)–[3.12](#fig:act-profile) present the activity diagrams
for the platform’s seven core operational flows.



### Figure (`fig:act-loan`)

**Caption (from manuscript):** Activity Diagram - Loan Request to Repayment Flow

**Source file (repository):** `Documentation/Diagrams/CSE471/Activity Diagram - Loan Request to Repayment Flow.png`

![Activity Diagram - Loan Request to Repayment Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20-%20Loan%20Request%20to%20Repayment%20Flow.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:act-loan`**.






### Figure (`fig:act-hierarchy`)

**Caption (from manuscript):** Activity diagram illustrating the hierarchical capital flow from the World Bank Reserve through National Bank to Local Bank tiers, including reserve ratio checks and loan disbursement decision points.

**Source file (repository):** `Documentation/Diagrams/CSE471/Activity Diagram Hierarchical Banking Flow.png`

![Activity diagram illustrating the hierarchical capital flow from the World Bank Reserve through National Bank to Local Bank tiers, including reserve ratio checks and loan disbursement decision points.](Documentation/Diagrams/CSE471/Activity%20Diagram%20Hierarchical%20Banking%20Flow.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:act-hierarchy`**.






### Figure (`fig:act-income`)

**Caption (from manuscript):** Activity Diagram Income Verification Flow

**Source file (repository):** `Documentation/Diagrams/CSE471/Activity Diagram Income Verification Flow.png`

![Activity Diagram Income Verification Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20Income%20Verification%20Flow.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:act-income`**.






### Figure (`fig:act-chat`)

**Caption (from manuscript):** Activity Diagram Chat System Flow

**Source file (repository):** `Documentation/Diagrams/CSE471/Activity Diagram Chat System Flow.png`

![Activity Diagram Chat System Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20Chat%20System%20Flow.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:act-chat`**.






### Figure (`fig:act-aichatbot`)

**Caption (from manuscript):** Activity Diagram AI Chatbot Interaction Flow

**Source file (repository):** `Documentation/Diagrams/CSE471/Activity Diagram AI Chatbot Interaction Flow.png`

![Activity Diagram AI Chatbot Interaction Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20AI%20Chatbot%20Interaction%20Flow.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:act-aichatbot`**.






### Figure (`fig:act-market`)

**Caption (from manuscript):** Activity diagram showing the market data viewing flow, in which authenticated users fetch live cryptocurrency price feeds via the off-chain API layer before interacting with loan sizing interfaces.

**Source file (repository):** `Documentation/Diagrams/CSE471/activity diagram Market Data Viewing Flow.png`

![Activity diagram showing the market data viewing flow, in which authenticated users fetch live cryptocurrency price feeds via the off-chain API layer before interacting with loan sizing interfaces.](Documentation/Diagrams/CSE471/activity%20diagram%20Market%20Data%20Viewing%20Flow.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:act-market`**.






### Figure (`fig:act-profile`)

**Caption (from manuscript):** Activity Diagram Profile Management Flow

**Source file (repository):** `Documentation/Diagrams/CSE471/Activity Diagram Profile Management Flow.png`

![Activity Diagram Profile Management Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20Profile%20Management%20Flow.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:act-profile`**.




### Data Flow Diagrams

Figures [3.13](#fig:dfd-context)–[3.15](#fig:dfd-level1b) present the data flow diagrams
at the context level (Level 0) and decomposed level (Level 1).



### Figure (`fig:dfd-context`)

**Caption (from manuscript):** Dataflow Diagram (Context Diagram Level - 0)

**Source file (repository):** `Documentation/Diagrams/CSE471/Dataflow Diagram (Context Diagram Level - 0).png`

![Dataflow Diagram (Context Diagram Level - 0)](Documentation/Diagrams/CSE471/Dataflow%20Diagram%20%28Context%20Diagram%20Level%20-%200%29.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:dfd-context`**.






### Figure (`fig:dfd-level1a`)

**Caption (from manuscript):** Level-1 data flow diagram decomposing the core lending subsystem, showing input/output data flows among borrowers, approvers, the smart contract layer, the PostgreSQL database, and the AI/ML monitoring service.

**Source file (repository):** `Documentation/Diagrams/CSE471/Data flow diagram (level - 1).png`

![Level-1 data flow diagram decomposing the core lending subsystem, showing input/output data flows among borrowers, approvers, the smart contract layer, the PostgreSQL database, and the AI/ML monitoring service.](Documentation/Diagrams/CSE471/Data%20flow%20diagram%20%28level%20-%201%29.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:dfd-level1a`**.






### Figure (`fig:dfd-level1b`)

**Caption (from manuscript):** Level-1 data flow diagram (continued) covering the deposit mobilization, interbank lending, and FX conversion subsystems, with data stores for on-chain state and off-chain analytics.

**Source file (repository):** `Documentation/Diagrams/CSE471/dataflow diagram 2 (level -1).png`

![Level-1 data flow diagram (continued) covering the deposit mobilization, interbank lending, and FX conversion subsystems, with data stores for on-chain state and off-chain analytics.](Documentation/Diagrams/CSE471/dataflow%20diagram%202%20%28level%20-1%29.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:dfd-level1b`**.




### Sequence Diagrams

Figures [3.16](#fig:seq-loan)–[3.24](#fig:seq-borrowlimit) present the sequence
diagrams for the platform’s key interaction flows.



### Figure (`fig:seq-loan`)

**Caption (from manuscript):** Sequence Diagram 1 Loan Request, AI Risk Check, and Approval Decision

**Source file (repository):** `Documentation/Diagrams/CSE471/Sequence Diagram 1 Loan Request, AI Risk Check, and Approval Decision.png`

![Sequence Diagram 1 Loan Request, AI Risk Check, and Approval Decision](Documentation/Diagrams/CSE471/Sequence%20Diagram%201%20Loan%20Request%2C%20AI%20Risk%20Check%2C%20and%20Approval%20Decision.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:seq-loan`**.






### Figure (`fig:seq-reject`)

**Caption (from manuscript):** Sequence Diagram 1B Reject Path - alt Reject

**Source file (repository):** `Documentation/Diagrams/CSE471/Sequence Diagram 1B Reject Path - alt Reject.png`

![Sequence Diagram 1B Reject Path - alt Reject](Documentation/Diagrams/CSE471/Sequence%20Diagram%201B%20Reject%20Path%20-%20alt%20Reject.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:seq-reject`**.






### Figure (`fig:seq-installment`)

**Caption (from manuscript):** Sequence Diagram 2 Installment Payment Loop

**Source file (repository):** `Documentation/Diagrams/CSE471/Sequence Diagram 2 Installment Payment Loop.png`

![Sequence Diagram 2 Installment Payment Loop](Documentation/Diagrams/CSE471/Sequence%20Diagram%202%20Installment%20Payment%20Loop.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:seq-installment`**.






### Figure (`fig:seq-income`)

**Caption (from manuscript):** Sequence Diagram 3 Income Verification

**Source file (repository):** `Documentation/Diagrams/CSE471/Sequence Diagram 3 Income Verification.png`

![Sequence Diagram 3 Income Verification](Documentation/Diagrams/CSE471/Sequence%20Diagram%203%20Income%20Verification.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:seq-income`**.






### Figure (`fig:seq-chat`)

**Caption (from manuscript):** Sequence Diagram 4 Chat System

**Source file (repository):** `Documentation/Diagrams/CSE471/Sequence Diagram 4 Chat System.png`

![Sequence Diagram 4 Chat System](Documentation/Diagrams/CSE471/Sequence%20Diagram%204%20Chat%20System.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:seq-chat`**.






### Figure (`fig:seq-aichatbot`)

**Caption (from manuscript):** Sequence Diagram 5 AI Chatbot Interaction

**Source file (repository):** `Documentation/Diagrams/CSE471/Sequence Diagram 5 AI Chatbot Interaction.png`

![Sequence Diagram 5 AI Chatbot Interaction](Documentation/Diagrams/CSE471/Sequence%20Diagram%205%20AI%20Chatbot%20Interaction.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:seq-aichatbot`**.






### Figure (`fig:seq-hierarchy`)

**Caption (from manuscript):** Sequence Diagram 6 Hierarchical Banking

**Source file (repository):** `Documentation/Diagrams/CSE471/Sequence Diagram 6 Hierarchical Banking.png`

![Sequence Diagram 6 Hierarchical Banking](Documentation/Diagrams/CSE471/Sequence%20Diagram%206%20Hierarchical%20Banking.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:seq-hierarchy`**.






### Figure (`fig:seq-marketdata`)

**Caption (from manuscript):** Sequence Diagram 7 Market Data Retrieval

**Source file (repository):** `Documentation/Diagrams/CSE471/Sequence Diagram 7 Market Data Retrieval.png`

![Sequence Diagram 7 Market Data Retrieval](Documentation/Diagrams/CSE471/Sequence%20Diagram%207%20Market%20Data%20Retrieval.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:seq-marketdata`**.






### Figure (`fig:seq-borrowlimit`)

**Caption (from manuscript):** Sequence Diagram 8 Borrowing Limit Calculation

**Source file (repository):** `Documentation/Diagrams/CSE471/Sequence Diagram 8 Borrowing Limit Calculation.png`

![Sequence Diagram 8 Borrowing Limit Calculation](Documentation/Diagrams/CSE471/Sequence%20Diagram%208%20Borrowing%20Limit%20Calculation.png)

**Textual description:** see section *Figure descriptions (PNG and TikZ)* for **`fig:seq-borrowlimit`**.




### Four-Tier Capital Flow

Figure [3.25](#fig:four-tier) illustrates the hierarchical
capital flow and cascading repayment structure.



### Figure (`fig:four-tier`)

**Caption (from manuscript):** Four-tier hierarchical capital flow with cascading repayment.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)




## Auxiliary Dual-Currency Facility

The cryptocurrency exchange feature of Crypto World Bank is built upon
the cryptocurrency exchange facility that is an auxiliary facility
incorporated into the current banking infrastructures all over the
world. Instead of being a separate exchange, the platform is a service
that is provided by all participating banks as an additional service to
the existing product portfolio.

- **Integration model:** The dual-currency facility is offered by all
  participating banks as an add-on service to their existing product
  portfolio. No additional banking license or separate entity is needed.

- **Eligibility determination:** Eligibility of the dual-currency
  service is based on the bank officers managing the lending operations,
  on the basis of existing KYC/AML compliance, account status, and
  lending relationship history.

- **No defaulting of conditions:** The project does not override,
  modify, or default any existing banking conditions, regulatory
  requirements, or contractual obligations.

- **Scope:** The facility enables fiat-to-crypto and crypto-to-fiat
  conversions, cryptocurrency-denominated lending and repayment, and
  transparent on-chain transaction records—all within the governance
  structure of the participating bank.

## Banking Product Suite

This section describes the banking products that the platform is
designed to support across tiers. While the current prototype
implementation focuses primarily on hierarchical lending, the complete
system design includes deposit products, transactional accounts,
solidarity lending, and multi-currency operations.

### Savings Products

The platform offers savings products at the Local Bank tier and, by
extension, at higher tiers for institutional participants. Standard
savings accounts provide liquid deposits with variable yield tied to
platform utilization, allowing deposit pricing to respond to market
conditions rather than discretionary rate-setting. Fixed-term deposits
lock capital for defined periods (e.g., 30/90/180/365 days) in exchange
for a higher agreed yield written into the contract at deposit time.
Early withdrawal can be permitted with an automatically enforced penalty
(forfeiture of a portion of accrued interest), which is transparent and
deterministic.

The yield on standard savings accounts is algorithmically determined by
platform utilization: when loan demand is high and available liquidity
is low, savings yields rise to attract deposits; when liquidity is
abundant, yields fall. This creates a self-regulating capital cycle
where savings and lending are linked through a single on-chain formula
rather than through discretionary rate-setting committees.

Fixed-term deposits serve a distinct function in the banking
architecture: they provide the Local Bank tier with predictable,
duration-matched liabilities that can be deployed into longer-term
installment loans without creating dangerous asset-liability mismatches.
A depositor who locks funds for 180 days effectively funds the 6-month
installment tranche of a retail borrower at that tier, eliminating the
duration mismatch that causes bank runs in traditional fractional
reserve systems.

The closed-loop argument is central to the platform’s economic
sustainability: unlike donor-funded microfinance models that depend on
external capital injections, a savings-funded lending model recycles
depositor capital through the lending pool continuously. Interest earned
by the platform on loans is partially redistributed to depositors as
yield, partially retained as protocol revenue, and partially allocated
to the insurance fund, creating a self-sustaining three-way split that
does not require new token issuance or external subsidy.

### Checking and Transactional Accounts

In addition to interest-bearing savings products, the platform provides
transactional accounts (checking/current-account equivalents) for
day-to-day financial activity. Transactional accounts carry no yield but
impose no lock-in, allow transfers between registered accounts, and
serve as the primary account from which loan installments are debited
and income receipts are credited. Transfers between accounts within the
platform are settled atomically: a transaction either completes fully or
reverts, eliminating intermediate settlement ambiguity.

The atomic settlement property of on-chain transfers eliminates the
intermediate state that causes the majority of interbank disputes in
traditional banking. In the correspondent banking model, a payment can
exist in a “funds in transit” state for two to five business days during
which the sender has debited but the receiver has not credited, creating
reconciliation complexity and dispute resolution costs. On-chain
transfers settle in a single transaction: either both the debit and
credit execute or neither does, with no intermediate state possible.

For retail users in developing economies, transactional accounts on the
platform serve as a substitute for the informal cash-handling systems
that currently dominate daily financial activity. Recurring payroll
deposits, utility payment debits, and peer transfers can all be
scheduled as programmable transactions, reducing the friction of cash
management without requiring users to interact directly with smart
contracts for every operation.

### Group / Solidarity Lending

The platform implements a group lending module inspired by the
solidarity group model used in microfinance. A group of three to twenty
registered borrowers can form a lending group on-chain. Each member
contributes collateral into a shared pool; the loan application is
submitted collectively; and all members signal consent before escalation
to bank approvers. Repayment is tracked per member, and if a member
defaults beyond a grace period, the contract can automatically cover the
shortfall from the shared collateral pool under programmable mutual
liability rules. Over time, group repayment histories contribute to
credit scoring to enable progressive lending (larger loans and improved
terms after successful cycles).

The group lending module is directly inspired by the solidarity group
model developed by BRAC, the organization whose name this university
bears. BRAC’s group lending program, operating across Bangladesh and
subsequently 11 other countries, demonstrates that social collateral
(the mutual accountability of group members) can substitute for physical
collateral among populations with no formal credit history. The Crypto
World Bank translates this social model into programmable contract
logic: the mutual liability that BRAC enforces through field officer
visits and weekly group meetings is enforced by the GroupLendingPool
contract through automatic collateral claims and on-chain consent
recording.

The full group loan lifecycle proceeds as follows. First, formation:
three to twenty registered borrowers form a group on-chain, each
contributing individual collateral to a shared pool contract. Second,
application: the group submits a collective loan application specifying
the total amount, per-member share, and repayment schedule. Third,
consent: every group member must sign the application transaction before
it is escalated to a bank approver, enforcing unanimous consent and
preventing coerced participation. Fourth, approval: the bank approver
reviews the group’s aggregate credit history, income verification
documents, and shared collateral ratio before approving disbursement.
Fifth, disbursement: funds are distributed to each member’s account in
their individual share as defined by the formula
$`\text{Share}_i = \text{LoanTotal} / N_{\text{members}}`$. Sixth,
repayment: each member repays their individual installments
independently; on-chain tracking records per-member performance
transparently to all group members. Seventh, mutual liability
enforcement: if a member defaults beyond the grace period, the contract
automatically covers the shortfall from the shared collateral pool,
protecting the lending bank’s position while distributing the cost
proportionally across the group. Eighth, credit history improvement:
successful group repayment cycles are permanently recorded on-chain and
incorporated into each member’s credit score, enabling progressive
lending with larger amounts and better terms in subsequent cycles.

### Foreign Exchange and Multi-Currency Operations

A worldwide banking platform must support participants operating in
different currency environments. The platform’s FX module is designed to
use decentralized price oracle networks to obtain verifiable exchange
rates for supported asset pairs. Currency conversion can be offered at
transparent oracle-derived rates with a disclosed spread, set by
governance, that forms an additional revenue stream. To reduce
liability-side volatility for retail borrowers, the platform is designed
to support stablecoin-denominated lending (e.g., USDC/USDT) while
allowing collateral in volatile cryptoassets (e.g., ETH).

### Trade Finance Facilitation (Planned)

Trade finance instruments (letters of credit, guarantees, documentary
collections) can be added as planned extensions for import–export
participants. In a smart contract design, a buyer’s bank locks payment
in escrow, and release occurs automatically upon verified presentation
of shipping documents via trusted data sources. This extension is out of
scope for the current prototype but follows the same principles of
programmable settlement and auditable execution.

### Privacy-Preserving Identity Compliance (Planned)

The regulatory compliance requirements of a worldwide banking platform
extend beyond on-chain audit trails. Formal KYC and AML processes
require users to prove legal identity, verify source of funds, and
satisfy jurisdiction-specific screening requirements. Storing this
personal data on a public blockchain creates a fundamental tension
between regulatory compliance and user privacy.

The planned resolution is a zero-knowledge proof based KYC layer in
which a licensed identity provider performs the full KYC verification
off-chain and issues a verifiable credential to the user. The user then
presents a ZKP to the banking contracts that proves they hold a valid
credential from an approved provider without revealing any personal
information on-chain. The contract validates the proof cryptographically
and sets a `kycVerified` flag on the wallet address, enabling access to
regulated operations such as large loans, FX conversions, and
cross-border transfers. This approach satisfies regulatory requirements
while preserving on-chain privacy and avoiding the liability of storing
personal financial data in an immutable public record.

## Governance Framework

### Network Membership Governance

| **Governance Aspect** | **Implementation** |
|:---|:---|
| Member on-boarding | World Bank owner registers National Banks; National Banks register Local Banks; Local Banks designate approvers — all enforced on-chain. |
| Member off-boarding | Deactivation flags in smart contracts; cascading access revocation. |
| Regulatory oversight | Audit log emission via smart contract events; planned read-only regulator dashboard. |
| Permission structure | Hierarchical: Owner → National Bank → Local Bank → Approver → Borrower; enforced by on-chain role check modifiers. |
| Network operations | Pause/unpause mechanism for emergency response; emergency withdrawal for critical situations. |

Network membership governance.

*This governance table defines membership and onboarding rules that
control who can join the banking network and under which role. The
structure is intended to preserve institutional accountability by
separating responsibilities across tiers rather than relying on
undifferentiated token-holder governance alone.*

### Business Network Governance

| **Governance Aspect** | **Implementation** |
|:---|:---|
| Business charter | Defined in project documentation; operational parameters coded in smart contract constants. |
| Common services | Reserve management, loan lifecycle orchestration, event-driven notification system. |
| Business SLA | Testnet phase: best-effort availability. Production phase: 99.5% target uptime with multi-region deployment. |
| Regulatory compliance | Architecture designed for audit trail generation; data partitioning supports GDPR-style data subject requests. |

Business network governance.

*This business governance table outlines operational controls such as
approvals, limits, and escalation paths for higher-risk actions. The
goal is to combine programmable enforcement with human oversight,
matching real banking governance while retaining on-chain audit trails.*

### Technology Infrastructure Governance

| **Governance Aspect** | **Implementation** |
|:---|:---|
| Distributed IT structure | Client-side frontend (decentralised delivery); blockchain layer (fully decentralised); backend API (centralised, horizontally scalable). |
| Technology assessment | Continuous evaluation of EVM alternatives (L2 rollups, sidechains) for cost and performance optimisation. |
| On-chain / off-chain data services | Clearly partitioned (see Table [3.16](#tab:data-partitioning)); event listeners synchronise state between layers. |
| Risk mitigation | Smart contract pause mechanism; ReentrancyGuard; input validation; planned formal security audit. |

Technology infrastructure governance.

*This technology governance table specifies how protocol parameters and
infrastructure changes are managed, including security controls and
upgrade considerations. It supports the thesis emphasis on safe staged
rollout and maintainability under evolving regulatory and security
requirements.*

### Regulatory Compliance Considerations

As the platform is active in the regulated banking sector:

- Our prototype stage would be solely on the **public testnets** without
  attached real monetary value.

- The architecture would facilitate **audit logs generation** to be
  reviewed by regulatory regimes on the sandbox programs.

- Future production deployment would engage **regulatory sandbox
  programs** in target jurisdictions.

Although the current prototype does not process KYC/AML data, a complete
worldwide banking architecture must account for compliance at the design
level. Privacy-preserving KYC design is described in detail in
Section [3.11.6](#sec:zkp-compliance).

### Asset Tokenization

- **Current implementation:** The native blockchain currency (ETH/MATIC)
  is used as the reserve and loan currency.

- **Planned extension:** Support for ERC-20 stablecoins (USDC, USDT) for
  lending operations in USD; tokenized collateral instruments for
  lending situations where there isn’t enough collateral.

## Threat Model and Security Controls

Security threats in smart-contract banking systems are not limited to
isolated code defects; they include economic attacks, oracle
manipulation, and governance failure modes.
Table [3.24](#tab:threat-model) consolidates the primary
threat categories considered in the system design and the corresponding
controls.

<a id="tab:threat-model"></a>

| **Threat Category** | **Attack Vector** | **Implemented / Planned Mitigation** |
|:---|:---|:---|
| Reentrancy and state manipulation | External contract calls exploit inconsistent intermediate state during execution (e.g., withdraw patterns) | Use of OpenZeppelin primitives (e.g., `ReentrancyGuard`); checks-effects-interactions discipline; unit tests covering critical flows |
| Arithmetic errors | Integer overflow/underflow and unsafe math in financial logic | Solidity 0.8.x built-in overflow protection; explicit bounds checks for rates/limits |
| Oracle manipulation (planned modules) | Price feed manipulation affecting collateral valuation or FX conversion | Use decentralized oracle networks; medianization and heartbeat checks; conservative risk parameters and circuit breakers for stale / anomalous prices |
| Sybil abuse (retail / group lending) | Attackers create many wallets to bypass limits or create fraudulent groups | On-chain role binding; rate limits at Local Bank tier; planned compliance gating for higher-risk operations (Section [3.11.6](#sec:zkp-compliance)) |

| Governance capture | Privileged roles abused to register malicious banks or approve unsafe parameters | Tiered role separation (World Bank / National / Local); immutable audit trails; staged rollout and emergency pause mechanisms under governance |

| Flash-loan driven economic attacks | Atomic borrowing used to manipulate on-chain state / pricing assumptions | Conservative design for price-dependent logic; oracle protections; monitoring and pause-on-anomaly procedures (planned) |

Threat model and security controls mapping


# Methodology

This project and its planning have been structured in accordance with
the [Blockchain Olympiad Bangladesh AI
guidelines](https://bcolbd.org/uploads/guideline/BLOCKCHAIN%20OLYMPIAD%20BANGLADESH%20AI%20Guideline.pdf) \[16\]
and the final-year project evaluation rubrics.

## Development Methodology

We adopted a **lightweight Agile/Scrum** methodology tailored for an
academic prototype with a fixed two-month development window. The
iterative approach enables incremental delivery of demonstrable features
while accommodating evolving requirements inherent in research-oriented
development.
Figure [4.1](#fig:agile-process) illustrates our Agile
process.



### Figure (`fig:agile-process`)

**Caption (from manuscript):** Agile/Scrum process flow: standard flowchart notation showing the sprint cycle from Product Backlog through Planning, Development (2--3 weeks), Weekly Sync, Sprint Review, Retrospective, and Potentially Shippable Increment, with a feedback loop back to the Product Backlog.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

- **Node:** **Product Backlog**




The following points summarize how Agile will be applied:

- **Sprint Duration:** A period of 2 to 3 weeks is allocated for every
  sprint (3 sprints total).

- **Team Size:** A group of two developers will be assigned (thesis
  project). The work will be focused on the thesis project.

- **Weekly Sync:** A weekly gathering will occur to assess progress.
  Issues will be identified during these meetings. Plans will also be
  developed in these sessions alongside progress checks.

- **Sprint Planning:** Planning for the sprint will take place for one
  hour at the beginning of every sprint.

- **Sprint Review and Retrospective:** Reviewing work occurs at every
  sprint’s conclusion. A discussion on lessons learned will be conducted
  for 30 minutes.

## Planned AI/ML Support

The AI/ML implementation in this prototype phase is scoped to three
auditable, lightweight components that provide meaningful decision
support without requiring large labeled training datasets.

- **Fraud detection:** Random Forest classifiers assess
  transaction-level fraud risk based on behavioral and contextual
  features.

- **Anomaly detection:** Isolation Forest detects unusual wallet
  behavior without requiring labeled fraud samples, making it suitable
  for data-scarce DeFi environments.

- **Explainability:** SHAP generates per-prediction feature attributions
  that make lending risk assessments interpretable to approvers and
  regulators.

The focus of this prototype phase is establishing the blockchain lending
architecture; full ML pipeline development including dataset collection,
model training at scale, and production integration is planned for the
final thesis phase.

##### Limitations (prototype and research context).

The AI/ML components are subject to known limitations in DeFi-like
environments. Fraud events are typically rare (class imbalance), and
attacker behavior changes over time (concept drift), meaning models
trained on historical patterns may degrade without ongoing retraining
and monitoring. New wallets also present a cold-start problem with
limited behavioral history, and sophisticated adversaries may attempt to
structure transactions to evade detection. These limitations motivate
conservative use of AI/ML as decision support rather than an automated
approval authority in the prototype phase.

## Evaluation Methodology

This section summarizes how each research question will be evaluated in
the prototype phase.

- **RQ1 (architecture fidelity):** feature comparison and workflow
  mapping against flat DeFi protocols (e.g., Aave, Compound, MakerDAO),
  focusing on institutional hierarchy, role separation, and directional
  capital flow.

- **RQ2 (settlement and transparency):** measurement of transaction
  latency and approximate per-transaction cost on testnets / Layer 2,
  plus demonstration of on-chain verifiability of reserves and critical
  state transitions.

- **RQ3 (analytics support):** model evaluation using standard metrics
  (precision, recall, F1) on available datasets and controlled synthetic
  cases, alongside qualitative assessment of SHAP explanations.

- **RQ4 (technical viability):** end-to-end deployment verification on
  public testnets with integration tests covering wallet connection,
  loan request, approval, repayment, and role-based access control.

- **RQ5 (banking extensions):** design-level validation via
  specification completeness and interface contracts for deposit
  products and group lending, plus prototype demonstrations of selected
  mechanisms where implemented.

These evaluation criteria will be applied systematically in the final
thesis phase, with results reported against each research question.



### Figure (`fig:sprint-points`)

**Caption (from manuscript):** Sprint story-point distribution: (a) 155 total points across three sprints; (b--d) per-sprint breakdown by epic. Proportions match the sprint backlog tables.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)






### Figure (`fig:methodology-technical`)

**Caption (from manuscript):** Technical development methodology: swimlane view of the three-sprint plan across four technology layers (Blockchain/Solidity, Frontend/React, Backend/Express, AI/ML/FastAPI). Green cells indicate implemented and testnet-verified components; white cells indicate planned work.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)




## Sprint Plan and Deliverables

### Sprint 1: Foundation and Core Banking (Weeks 1–3)

**Sprint Goal:** Establish core blockchain infrastructure and
hierarchical banking structure.

| **ID** | **User Story** | **Pts** |
|:---|:---|:---|
| US-1.1 | World Bank contract — reserve management, national bank registration | 5 |
| US-1.2 | National Bank contract — borrow from World Bank, lend to Local Banks | 5 |
| US-1.3 | Local Bank contract — borrow from National Bank, lend to users | 5 |
| US-1.4 | Role-based access control — World Bank/National Bank/Local Bank Admin, Bank User, Borrower | 3 |
| US-1.5 | Gas cost management — initiator pays; Polygon low-fee (\$0.001–\$0.01/tx) | 3 |

Sprint 1 backlog: smart contract development (21 pts).

*This sprint planning table breaks Sprint 1 into concrete deliverables
that establish the foundation: contract deployment, wallet integration,
and the initial data model. The plan is structured to deliver a
demonstrable vertical slice early, reducing integration risk for later
features.*

| **ID** | **User Story** | **Pts** |
|:---|:---|:---|
| US-1.6 | Wallet connection — MetaMask, WalletConnect, Sepolia/Amoy | 3 |
| US-1.7 | Dashboard UI — Material Design 3, responsive, blockchain-themed | 5 |
| US-1.8 | Navigation and layout — AppBar, role-based menu | 3 |
| US-1.9 | Blockchain visual elements — tx hash display, security badges | 2 |
| US-1.10 | Database design — 15 tables, 3NF | 5 |
| US-1.11 | Migration scripts and seed data | 3 |

Sprint 1 backlog: frontend foundation (13 pts) and database schema (8
pts).

*This Sprint 1 continuation clarifies additional tasks and story point
allocation for core banking scaffolding. The story point distribution
reflects the early emphasis on infrastructure and correctness over
feature breadth.*

**Sprint 1 Total:** 42 story points. Deliverables: smart contracts
deployed on testnet, basic frontend with wallet connection, database
schema implemented, role-based access control, dashboard UI.

### Sprint 2: Lending Features and Communication (Weeks 4–6)

**Sprint Goal:** Implement complete lending workflow and communication
features.

| **ID** | **User Story** | **Pts** |
|:---|:---|:---|
| US-2.1 | Loan request submission with blockchain transaction | 5 |
| US-2.2 | Loan approval and rejection workflow with bank approver | 5 |
| US-2.3 | Installment payment system with automated schedule generation | 8 |
| US-2.4 | Borrowing limit engine (6-month and 1-year rolling windows) | 5 |
| US-2.5 | Borrower-bank real-time chat system | 5 |
| US-2.6 | Income verification document upload and review | 5 |
| US-2.7 | Hierarchical bank registration (National → Local) | 5 |
| US-2.8 | Bank user management and approver designation | 3 |
| US-2.9 | Loan history and transaction tracking pages | 5 |
| US-2.10 | QR code generation for wallet addresses | 2 |
| US-2.11 | Responsive UI polish and error handling | 2 |

Sprint 2 backlog: lending and communication features (50 pts).

*This Sprint 2 table focuses on completing the lending lifecycle and
communication workflows, which are the main user-facing banking
operations. The decomposition reflects dependency ordering: workflow
correctness precedes advanced analytics integration.*

### Sprint 3: AI/ML Security and Finalization (Weeks 7–8)

**Sprint Goal:** Integrate AI/ML analytics, complete testing, and
prepare documentation.

| **ID** | **User Story** | **Pts** |
|:---|:---|:---|
| US-3.1 | Random Forest fraud detection model training and deployment | 8 |
| US-3.2 | SHAP-based explainability for risk assessments | 5 |
| US-3.3 | Isolation Forest anomaly detection for wallet behaviour | 5 |
| US-3.4 | Risk dashboard with real-time AI/ML scores | 5 |
| US-3.5 | AI chatbot for borrower assistance | 3 |
| US-3.6 | Market data visualisation page | 3 |
| US-3.7 | Profile and settings management | 2 |
| US-3.8 | Security audit and vulnerability assessment | 3 |
| US-3.9 | Documentation and report finalisation | 2 |
| US-3.10 | Demo preparation and presentation | 2 |

Sprint 3 backlog: AI/ML security and polish (38 pts).

*This Sprint 3 table allocates effort to AI/ML monitoring, testing, and
documentation finalization. The intent is to defer analytics complexity
until core lending flows are stable, ensuring explainability and
auditability can be evaluated against realistic workflows.*

**Additional Sprint 3 module scope (planned):**

- **Group lending module:** architectural design, smart contract
  interface specification, and partial implementation of group formation
  and consent recording logic.

- **Savings account module:** SavingsVault contract design, interest
  accrual formula implementation, and interface specification for
  fixed-term deposits.

- **FX module:** oracle integration design and interface specification
  for dual-currency conversion.

Figure [4.4](#fig:sprint-submission) shows the sprint
submission workflow.



### Figure (`fig:sprint-submission`)

**Caption (from manuscript):** Sprint submission workflow: standard flowchart showing the sequence from backlog refinement through development, code review, integration testing, sprint review, retrospective, and final deliverable submission, with rework loops for failed review and test gates.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

- **Edge/node label:** Yes
- **Edge/node label:** Yes
- **Edge/node label:** No
- **Edge/node label:** No




## SDLC Stage Mapping

We map our Agile sprints to the seven stages of the Software Development
Life Cycle (SDLC).
Figure [4.5](#fig:sdlc-mapping) illustrates this mapping.

| **\#** | **SDLC Stage** | **Project Activity** | **Deliverable** |
|:---|:---|:---|:---|
| 1 | Planning | Feasibility studies; professor consultations; guideline review | Feasibility Report; Project Plan |
| 2 | Requirements | System analysis; use case definitions; constraints identification | Use case diagrams; UC-1 through UC-5 |
| 3 | Design | Three-layer architecture; DB schema (3NF); smart contract interfaces | Architecture diagrams; ERD; DFD |
| 4 | Development | Sprint 1–3: smart contracts, frontend, backend, AI/ML | Source code; DApp prototype |
| 5 | Testing | Hardhat unit tests (12+); integration testing; AI/ML evaluation | Test reports; model metrics |
| 6 | Deployment | Testnet deployment; frontend (Vercel); backend (Render) | Live prototype on testnet |
| 7 | Maintenance | Monitoring; model retraining; bug fixes; iteration | Updated docs; retrained models |

SDLC stage mapping.

*This SDLC mapping table aligns the three-sprint Agile plan with
standard SDLC stages to ensure research deliverables remain complete
(requirements, design, implementation, testing, and evaluation). The
mapping makes the development process auditable and easier to justify in
an academic setting.*



### Figure (`fig:sdlc-mapping`)

**Caption (from manuscript):** SDLC stage mapping: the seven standard software development life cycle stages (right) mapped to project activities and deliverables (left), with an iteration arrow indicating the Agile feedback loop across all stages.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

- **Node:** 1.\ Planning \&\\Requirements Analysis
- **Node:** 2.\ Defining\\Requirements (SRS)
- **Node:** 3.\ Designing\\Architecture
- **Node:** 4.\ Development\\(Coding)
- **Node:** 5.\ Testing
- **Node:** 6.\ Deployment
- **Node:** 7.\ Maintenance
- **Node:** Feasibility studies; professor meetings;\\BCOLBD 2025 guideline review
- **Node:** System analysis (CSE471); 29 use cases;\\user stories US-1.x to US-3.x
- **Node:** Three-layer architecture; DB schema\\(15 tables, 3NF); ERD; DFD
- **Node:** Solidity; React/TypeScript; FastAPI/Python;\\AI/ML models (RF, IF, SHAP)
- **Node:** Hardhat unit tests (12+);\\frontend integration; AI/ML evaluation
- **Node:** Polygon Amoy / Ethereum Sepolia;\\Vercel + Render
- **Node:** Monitoring; model retraining;\\bug fixes; feature iteration
- **Edge/node label:** Iteration




## Design Decisions and Alternatives

For each major design decision, we evaluated alternatives and justified
selections based on technical criteria, ecosystem maturity, and project
constraints.
Figure [4.6](#fig:design-decisions) visualizes these
comparisons.

| **Decision Area** | **1st Choice** | **2nd Choice** | **Key Criterion** |
|:---|:---|:---|:---|
| Methodology | Agile / Scrum | Incremental | Evolving scope, milestones |
| Architecture | DApp + Off-chain AI | Hybrid with Oracle | Gas cost, ML flexibility |
| Frontend | React + TypeScript | Vue + TypeScript | Web3 ecosystem maturity |
| Smart Contract | EVM (Solidity) | Solana (Rust) | Gas, control size, free testnets |
| Fraud Detection | Random Forest | XGBoost | SHAP compatibility, simplicity |
| Anomaly Detection | Isolation Forest | Autoencoder | Unsupervised; no labelled data needed |
| XAI Method | SHAP | LIME | Theoretical guarantees, regulatory fit |
| Database | PostgreSQL | SQLite | 3NF support, async queries |
| Hosting | Vercel + Render | Localhost only | \$0 cost, publicly accessible URL |

Design decisions and alternatives considered.

*This design decisions table records evaluated alternatives (chains,
stacks, libraries) and the criteria used to select the final approach.
Documenting these trade-offs strengthens the methodological rigor and
clarifies why the selected stack best matches the project’s
constraints.*



### Figure (`fig:design-decisions`)

**Caption (from manuscript):** Design decisions and alternatives: Panel A shows AI/ML component selections (fraud detection, anomaly detection, explainability); Panel B shows technology stack selections (frontend, smart contract platform, database, UI framework). Blue-filled nodes represent selected first choices; outlined nodes represent evaluated alternatives.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)




### Justification of Selected Technologies

**1st Choice Justifications:**

- **Agile/Scrum** was necessary due to the project’s evolving nature.
  Frequent updates to smart contract designs, user interface steps and
  AI/ML connections were required. Adopting Agile allows for plan
  alterations during brief work cycles effectively avoiding time and
  resource loss. Significance arises as new concepts emerge during the
  prototype development process.

- **DApp + Off-chain AI** architecture allows intensive machine learning
  operations to occur outside the blockchain. Machine learning tasks are
  often run on the blockchain at a considerable expense occasionally
  exceeding \$100 for a single operation. Off-chain processing enables
  the use of rapid GPUs along with widely-used Python machine learning
  resources. Final lending choices are managed exclusively by smart
  contracts on-chain ensuring that trust is maintained in critical
  areas.

- **React + TypeScript** is beneficial as many Web3 libraries such as
  Wagmi, RainbowKit, Viem, and ethers.js are supported seamlessly. A
  vast community of developers exceeding 10 million exists for React
  making it simpler to access assistance and solutions.

- **EVM (Solidity)** is regarded as the most thoroughly examined smart
  contract system. Over \$100 billion is secured across various
  blockchains by it. Building and testing the project without incurring
  costs is possible with free test networks such as Sepolia and Amoy.
  Security tools provided by OpenZeppelin have been thoroughly tested to
  ensure the protection of contracts.

- **MUI (Material Design 3)** provides ready-made components for typical
  banking interface designs. The package contains various items such as
  data tables, form checks and layouts for dashboards. Utilizing MUI
  results in a time saving of around 40% compared to starting from
  scratch.

- **Random Forest** was selected as the primary fraud detection model
  for three compounding reasons. First, it demonstrates natural
  compatibility with SHAP’s TreeExplainer, which computes exact Shapley
  values—rather than approximations—by exploiting the tree structure
  directly. This exactness is a regulatory asset: in a lending context
  subject to explainability requirements under emerging frameworks such
  as the EU AI Act, approximation-based attribution tools like LIME can
  produce inconsistent feature rankings across identical inputs,
  undermining audit reliability \[4\]. Second, ensemble tree methods
  generalise well on structured tabular data with moderate sample sizes,
  a characteristic that matches the DeFi lending transaction log domain,
  where labeled fraud samples are scarce and synthetic augmentation is
  likely necessary. Third, Random Forest naturally supports class
  imbalance through class weighting and bootstrap sampling, reducing the
  risk of a model that achieves high accuracy by always predicting “not
  fraud”—a failure mode that would be catastrophic in a lending context.

- **Isolation Forest** does not require labeled data for training.
  Labeled fraud samples are few making it suitable for DeFi lending.
  Anomalies in transactions are scored swiftly as it operates with a
  time complexity of $`O(n \log n)`$.

- **SHAP** provides feature importance through solid mathematical
  foundations from game theory (Shapley values). Characteristics such as
  accuracy, management of absent data and consistency are not assured by
  tools like LIME. These properties assist in fulfilling emerging
  regulations for explainable decisions within financial services.

- **PostgreSQL** effectively manages complex time-based queries.
  Borrowing limits can be checked over periods such as 6 months or 1
  year. ACID compliance is fully supported to ensure financial data
  remains secure. It supports JSON which facilitates easy adjustments to
  the database structure during the prototyping phase.

- **Vercel + Render** facilitates deploying the demo globally at no
  charge. A live prototype can be accessed without the necessity of a
  setup on personal computers. Supervisors, examiners and other
  individuals are not required to deal with installation issues.

**2nd Choice Justifications (Why Retained as Alternatives):**

- **Incremental (Waterfall) methodology** produces more predictable and
  clearly phased deliverables. However, it offers limited capacity to
  adapt to the evolving requirements typical of research-oriented
  prototype development, and is most effective in stable production
  environments where scope is fixed from the outset.

- **Hybrid with Oracle architecture** (e.g., Chainlink) would enable
  on-chain ML prediction triggers via oracle data feeds, increasing the
  verifiability of AI-driven decisions. The trade-off is meaningful
  latency (30–60 seconds per update) and additional cost (\$0.10–1.00
  per oracle call), along with a dependency on third-party oracle
  availability that introduces an external failure point not present in
  the selected off-chain approach.

- **Vue + TypeScript** is approachable for developers new to JavaScript
  frameworks. Its Web3 tooling ecosystem (e.g., vue-dapp) is less mature
  than React’s, with sparser wallet integration library support and
  slower update cadence for critical Web3 dependencies.

- **Solana (Rust)** offers substantially higher raw throughput (up to
  65,000 TPS) than EVM-compatible chains. However, Solana’s developer
  tooling and security library ecosystem are less established, the Rust
  learning curve is significant within an 8-week development window, and
  the DeFi security audit tooling available for Solidity (Slither,
  Mythril, OpenZeppelin) has no direct equivalent on Solana.

- **Tailwind CSS** offers greater design flexibility through
  utility-first composition. Achieving consistent, professional
  banking-style UI patterns requires substantially more custom work than
  using MUI’s pre-built component library, which imposes a time cost
  that is unacceptable within the sprint timeline.

- **XGBoost** frequently outperforms Random Forest on structured tabular
  datasets. However, its SHAP integration uses approximate rather than
  exact tree computation, meaning explanations cannot be guaranteed to
  be consistent across repeated evaluations—a property required for
  regulatory auditability of credit decisions.

- **Autoencoder** models can capture complex non-linear anomaly
  patterns. In practice, they require substantial labeled or unlabeled
  training data and careful hyperparameter tuning to converge reliably.
  Isolation Forest is parameter-light and performs competitively on
  small and imbalanced datasets, making it better suited to the
  data-scarce DeFi lending context of this prototype.

- **LIME** produces faster local explanations. As demonstrated by Adom
  et al. \[4\], LIME explanations are unstable: repeated evaluation of
  the same input can yield different feature importance rankings,
  undermining the consistency guarantees that regulators require for
  automated lending decisions.

- **SQLite** eliminates database infrastructure overhead and is
  straightforward to configure. It does not support concurrent writes,
  which limits multi-user prototype testing, and lacks the window
  function and CTE support needed for rolling 6-month and 1-year
  borrowing limit calculations.

- **Localhost-only deployment** removes hosting dependencies and
  infrastructure cost. It prevents remote sharing for supervisor review,
  collaborative testing across team members, and examiner access to a
  live demo—all of which are necessary for academic evaluation and
  iteration.

## Design Patterns

Our system uses three design patterns:

- **Singleton:** A singleton means that each primary contract is
  established a single time. Only one version is utilized by all
  ensuring a unified source of truth. Not everyone can create multiple
  versions of the contract.

- **Observer:** Contracts generate alerts whenever actions occur such as
  loan requests. These alerts are processed by a service that updates
  the database. Notifications are not ignored; they receive attention.

- **Adapter:** An Adapter is utilized by the wallet component to
  function with various wallet types (like MetaMask). Different wallets
  that adhere to the EIP-1193 standards can be easily integrated.

- **Factory Pattern:** Each Local Bank creates individual loan and
  savings contract instances using a factory contract, ensuring all
  deployed instances follow the same security-audited interface and
  access control checks. The factory pattern prevents unauthorized
  contract deployment that could bypass the hierarchical governance
  structure.

- **Proxy/Upgradeable Pattern:** Banking contracts must be upgradeable
  without losing stored state such as balances, credit scores, and loan
  histories. OpenZeppelin’s transparent proxy pattern separates the
  contract’s logic from its storage, allowing governance-approved
  upgrades to the logic layer while preserving all stored financial
  data. This pattern is essential for a long-lived banking system that
  must adapt to evolving regulatory requirements and security patches.

## Software Testing Strategy

The testing strategy covers four layers of the system, each with defined
acceptance criteria.

- **Smart contract unit tests:** Numerous tests for smart contracts
  exist in our Hardhat environment. Over 12 tests are conducted to
  verify actions related to managing reserves, sign-ups, loans and
  access permissions. No scenarios such as depositing zero or executing
  disallowed actions are missed in these assessments. **Acceptance
  criterion:** all Hardhat unit tests pass with zero failures before any
  sprint delivery.

- **Integration testing:** Whole process checks are conducted for
  integration tests. Wallet connection, loan request, approval and
  repayment processes are evaluated on the network. No critical steps
  are excluded from the process. **Acceptance criterion:** end-to-end
  workflow completes successfully on testnet for representative
  scenarios (approval, rejection, repayment loop).

- **AI/ML module verification:** Ensuring functionality is vital for our
  fraud and unusual activity detectors. Results are generated by the
  integration of the detectors with the overall system. **Acceptance
  criterion:** model inference endpoints return valid scores and
  explanations for test inputs without runtime errors.

- **Frontend testing:** Website appearance is evaluated on Chrome,
  Firefox and mobile devices. Tests are conducted to ensure that
  functionality is maintained across various platforms. **Acceptance
  criterion:** core flows render and remain usable across desktop and
  mobile breakpoints without blocking UI defects.

# Market Analysis and Feasibility

## Market Sizing

| **Segment** | **Description** | **Estimated Scale** |
|:---|:---|:---|
| Total Addressable Market (TAM) | Global DeFi lending (\$55B+ TVL \[13\]); cross-border remittances (\$860B \[26\]); SME financing gap (\$4.5T \[20\]) | \$55B – 5T+ |
| Serviceable Addressable Market (SAM) | Institutional and semi-institutional lending requiring hierarchical structures; emerging-market credit demand | \$5B – 15B |
| Serviceable Obtainable Market (SOM) | Pilot deployments in regulatory sandboxes, academic prototypes, NGO-backed microfinance programs | \$50 – 200M |

Market segments with supporting data.

*This table quantifies the demand-side context (DeFi lending,
remittances, MSME credit gap) used to ground the feasibility argument in
measurable market data. It shows the platform targets both a high-volume
settlement problem and a persistent inclusion/credit-access gap.*

***Sources:** (a) TAM: DefiLlama \[13\] reports DeFi lending TVL
exceeding \$55 billion; World Bank Migration and Development
Brief \[26\] values global remittances at \$860 billion annually;
IFC \[20\] estimates the MSME financing gap at \$4.5 trillion; (b) SAM
and SOM: project-derived estimates based on industry segmentation of
institutional lending and regulatory sandbox addressable market \[18\].*

No hierarchically structured lending system currently exists in DeFi;
existing protocols rely on undifferentiated shared pools. Cross-border
payment networks such as Ripple (\$847M daily) \[25\] and JPMorgan
Kinexys (\$3–7B daily) \[40\] handle settlement volume but offer no
lending, deposit, or tiered governance functions. Institutional interest
in blockchain-based finance is clearly established, yet no single
platform combines DeFi-style accessibility with the structured capital
hierarchy of traditional development banking. The Crypto World Bank is
designed to occupy this gap.

## Target Customer Segment

The Crypto World Bank targets the **retail customer segment**—individual
borrowers and small businesses seeking transparent, accessible
crypto-based lending services.

| **Characteristic** | **Description** |
|:---|:---|
| Primary Users | Individual retail borrowers seeking personal or small business loans |
| Geographic Focus | Developing economies with limited traditional banking access (e.g., Bangladesh, Southeast Asia, Sub-Saharan Africa) |
| Loan Size Range | Micro to mid-range: 0.1 ETH – 500 ETH equivalent (~\$200 – \$1,000,000 at current rates) |
| User Profile | Digitally literate individuals with cryptocurrency wallet access; small business owners; gig-economy freelancers |
| Key Pain Points | High interest rates from informal lenders; lack of credit history in traditional systems; exclusion from banking due to documentation barriers |

Target customer segment profile.

*This target-customer table articulates the retail borrower profile and
constraints that drive product requirements (low fees, simple
onboarding, transparent terms). It supports the decision to prioritize
usability and cost efficiency over complex institutional-only features
in the prototype phase.*

## Partner Ecosystem

| **Partner Category** | **Functional Role** | **Blockchain-Mediated Incentive** |
|:---|:---|:---|
| Financial Regulators | Regulatory sandbox approval; compliance oversight | Reduced enforcement cost through on-chain transparency and audit trails |
| Banking Institutions | Network membership as National/Local Banks | Access to diversified global reserve; reduced inter-bank settlement friction |
| Payment Gateway Providers | Fiat-to-crypto on-ramp and off-ramp services | Volume-based transaction fees; expanded market reach |
| Academic & Research Institutions | Validation of AI/ML models; publication of research findings | Access to anonymised datasets; collaborative research opportunities |
| Non-Governmental Organizations | Pilot deployment; field testing with underserved borrower populations | Transparent, low-friction credit access for beneficiaries |

Partner categories and roles.

*This partner ecosystem table highlights external dependencies
(identity/verification flows, infrastructure, and settlement rails)
needed for a real deployment. Identifying these actors early reduces
hidden-scope risk and clarifies what remains outside the smart contract
boundary.*

## Competitive Landscape

The Crypto World Bank operates at the intersection of four distinct
competitor categories.
Table [5.8](#tab:competitor-detailed) provides a detailed
comparison of representative projects in each category, with current
metrics as of March 2026.

<a id="tab:competitor-detailed"></a>

| **Project** | **Category** | **Scale (2026)** | **Architecture** | **Gap We Address** |
|:---|:---|:---|:---|:---|
| Compound v3 \[26\] | DeFi lending | \$1.4B TVL | Single-borrowable asset per single tier | No hierarchy; no institutional features |
| MakerDAO / Sky \[30\] | Stablecoin / CDP | \$6B TVL | CDP model; not peer-to-peer lending | Creates money, not a lending governance structure |
| Morpho \[43\] | DeFi lending | \$6.8B TVL; 1.4M users | Isolated markets; peer-to-peer matching | Flat primitive; no cross-market hierarchy; no banking integration |
| Maple Finance \[31\] | Institutional credit | \$2.6–3.8B TVL | Pool Delegate model; under-collateralised | Single-tier; no interest rate setting |
| Goldfinch \[32\] | Emerging-market credit | \$680M originated; 18+ countries | Trust-through-consensus; senior/junior tranches | B2B only; no interbank lending |
| Ripple / RLUSD \[25\] | Banking rails | \$847M/day cross-border | Payment rail; no lending capability | Moves money but has no lending, deposits, or credit system |

Detailed competitive landscape analysis (Part 1).


<a id="tab:competitor-detailed"></a>

*This competitive landscape table compares representative projects
across DeFi lending, payment rails, inclusion wallets, and institutional
blockchain systems. The comparison highlights the whitespace: no
competitor combines hierarchical multi-tier lending with
governance-aware controls and AI-assisted monitoring in one
architecture.*

| **Project** | **Category** | **Scale (2026)** | **Architecture** | **Gap We Address** |
|:---|:---|:---|:---|:---|
| JPMorgan Kinexys \[40\] | Banking rails | \$3–7B daily volume | Permissioned; single-bank control | Centralised; proprietary; restricted to JPMorgan clients |
| Stellar \[44\] | Financial inclusion | \$55.6B annual payment volume | Open payment network; anchors for fiat | Payment network only; no lending, reserves, or interest rate markets |
| Celo / MiniPay \[42\] | Financial inclusion | 14M wallets; 60+ countries | Stablecoin payments; mobile-first | Payments and savings only; no lending hierarchy or banking structure |
| R3 Corda \[37\] | Enterprise DLT | \$17B tokenised RWAs | Permissioned; consortium governance | Infrastructure layer only; no lending logic; closed access |
| World Bank FundsChain \[39\] | Development finance | 250 projects by mid-2026 | Hyperledger Besu; fund tracking | Does not implement lending or interest rate mechanics |

Detailed competitive landscape analysis (Part 2).

*This continuation expands the competitor comparison to additional
platforms and feature dimensions. It reinforces the thesis positioning
by showing that existing systems typically specialize in one function
(lending or payments) rather than a complete banking suite.*

| **Feature Dimension** | **Competitors** | **Crypto World Bank** |
|:---|:---|:---|
| Hierarchical lending tiers | None — all competitors use flat pool architectures | Four-tier hierarchy: World Bank → National → Local → Borrower |
| Governance-controlled rates | Compound/Aave: algorithmic but no institutional hierarchy | Smart contract parameters; governance-defined bounds per tier |
| AI-assisted risk scoring | No competitor integrates on-chain ML fraud detection | Random Forest + SHAP; Isolation Forest anomaly detection |
| Retail and institutional access | Goldfinch / Maple: institutional only; Celo: retail only | Single platform serving retail borrowers through institutional capital hierarchy |
| Developing-market focus | Limited; most are US/EU-centric | Designed for Bangladesh, Southeast Asia, Sub-Saharan Africa |

Detailed competitive landscape analysis (Part 3): multi-tier capital
flow as differentiating feature.

*This final competitor table block concludes the comparative analysis
and clarifies why multi-tier capital flow is a differentiating
architectural feature. The results inform the go-to-market focus on
transparency, governance structure, and retail accessibility.*

Upon reviewing various projects a common feature was identified: a
lending mechanism does not exist that operates with tiers, is
distributed and facilitates transactions across different levels and
within identical levels. Such innovation distinguishes the Crypto World
Bank. The key differentiating features of the Crypto World Bank are as
follows:

- Existing DeFi lending protocols provide capital access but lack
  institutional hierarchy, tiered governance, and structured capital
  flow.

- Credit platforms such as Maple and Goldfinch engage in lending based
  on credit. Credit-based lending is often focused on businesses and
  exists at just one tier. These platforms do not cater to personal
  loans.

- Ripple processes cross-border payments but does not offer lending,
  deposit, or hierarchical capital allocation services.

- Celo provides assistance to individuals in emerging economies. Payment
  and savings functions are offered yet lending services remain absent.

- **Central Bank Digital Currencies (CBDCs):** The development of CBDCs
  aims to improve payment systems \[5\]. Concerns about privacy and
  control are raised as lending features are excluded. A lending layer
  does not exist on a CBDC. Users benefit from our platform which
  safeguards their interests while providing a level-based system
  similar to that utilized by CBDCs \[5\].

## Risk Taxonomy

| **Risk Category** | **Description** | **Severity** | **Mitigation** |
|:---|:---|:---|:---|
| Partner non-cooperation | Key partners decline to participate | Medium | Initiate with low-barrier academic and NGO pilots |
| Smart contract vulnerability | Exploit in contract logic | High | OpenZeppelin primitives; formal audit (planned); pause mechanism |
| Regulatory adversity | Jurisdictional restrictions | Medium | Testnet-only prototype; regulatory sandbox engagement |
| AI/ML model degradation | Fraud detection accuracy decay | Low | Continuous retraining; human-in-the-loop; SHAP explainability |

Risk taxonomy and mitigation.

*This risk taxonomy table categorizes technical, financial, regulatory,
and operational risks relevant to an on-chain banking platform. The
taxonomy is used to justify design mitigations such as reserve
enforcement, role-based approvals, and staged deployment through
testnets and sandbox programs.*

## Technical Feasibility

| **Component** | **Assessment** | **Evidence** |
|:---|:---|:---|
| Smart contracts | Fully feasible | Three contracts implemented and tested with Hardhat (12+ passing unit tests); Solidity 0.8.20 with OpenZeppelin |
| Frontend DApp | Fully feasible | React 18 + TypeScript with all pages implemented; Wagmi and RainbowKit provide mature wallet integration |
| Blockchain deployment | Fully feasible | Polygon Amoy and Ethereum Sepolia provide zero-cost, production-equivalent environments |
| AI/ML integration | Feasible with constraints | Random Forest inference achieves sub-50 ms latency; SHAP explanations computable in real time |
| Database backend | Feasible | PostgreSQL schema designed (15 tables, 3NF); FastAPI provides async REST framework |

Technical feasibility assessment.

*This technical feasibility table summarizes the readiness of core
infrastructure (EVM tooling, Layer 2 scalability, and security
libraries) required by the prototype. It supports the claim that the
project leverages mature ecosystems rather than experimental primitives,
reducing implementation risk.*

The technical feasibility of the platform rests on five pillars: the
maturity of the underlying blockchain infrastructure, the availability
of development tooling and security primitives, the demonstrated
scalability of Layer 2 networks for financial applications, the
precedent of comparable institutional blockchain deployments, and the
platform’s modular architecture which allows incremental delivery
without requiring the full system to be operational before any component
can be tested.

Ethereum—the EVM standard on which the platform is built—has operated
continuously since 2015, while Polygon PoS has processed billions of
transactions with low fees and rapid finality, making it suitable for
high-frequency retail operations. The contract layer uses established
security primitives (e.g., OpenZeppelin libraries and widely reviewed
patterns), and the off-chain services use standard, production-grade web
tooling for API and ML inference. Because the architecture is modular,
components such as savings, FX, group lending, and insurance can be
developed and validated independently and integrated through
governance-approved rollouts.

## Economic Feasibility

| **Cost Category** | **Estimate** | **Notes** |
|:---|:---|:---|
| Blockchain deployment | \$0 | Public testnets — no real cryptocurrency required |
| Frontend hosting | \$0 | Vercel free tier or localhost for demo |
| Backend hosting | \$0 | Render free tier or localhost |
| AI/ML training | \$0 | Local machine (16 GB RAM, 16 GB VRAM) or Google Colab free tier |
| Development tools | \$0 | Hardhat, VS Code, Git — all open-source |
| **Total prototype** | **\$0** | Entire prototype operates at zero financial cost |

Economic feasibility — zero-cost prototype.

*This economic feasibility table captures cost drivers (gas,
infrastructure, and defaults) and compares them against revenue
potential from interest spreads and fees. The key conclusion is that
low-fee Layer 2 deployment makes small-loan banking workflows
economically viable, unlike high-fee base layers.*

The economic feasibility of the platform is evaluated across four
dimensions: operational cost sustainability, revenue sufficiency,
capital efficiency, and macroeconomic impact. On Polygon PoS, the total
on-chain gas cost for a full retail loan lifecycle is measured in cents,
while interest spread revenue is orders of magnitude larger, yielding a
favorable cost-to-revenue profile for small loans that are infeasible on
high-fee base layers. Off-chain infrastructure costs (hosting, RPC
access, storage, ML inference) are comparable to typical SaaS
deployments and scale with usage.

Revenue is diversified across interest spreads, origination fees, and
potential FX spread revenue for multi-currency conversions. Capital
efficiency is enhanced by the platform’s reserve-enforced fractional
allocation and by reducing the need for idle pre-funded balances typical
of correspondent banking. At scale, remittance cost reduction and
improved access to credit in underserved markets produce additional
social and economic value beyond platform revenue.

## Revenue Projection

The following projection models annual revenue potential at full
deployment scale. Calculations use a reference ETH price of **\$2,500**
(conservative mid-point for February 2026; actual spot was approximately
\$2,800 per CoinGecko on 1 February 2026[^1]) and interest rate
parameters defined in
Section [5.8.1](#sec:interest-rates).

| **Parameter**                    | **Value**                          |
|:---------------------------------|:-----------------------------------|
| Reference ETH price              | \$2,000 (Feb 2026)                 |
| World Bank → National Bank | 3% APR (wholesale inter-bank rate) |
| National Bank → Local Bank | 5% APR (inter-bank)                |
| Local Bank → Borrower      | 8% APR (retail lending)            |
| Average loan term                | 12 months                          |
| Default rate provision           | 3% (conservative estimate)         |
| Origination fee                  | 0.25% per disbursement             |

Revenue projection assumptions.

*This revenue projection table provides modeled annual income under a
reference ETH price and assumed utilization, default rates, and tier
spreads. It illustrates how hierarchical spreads across tiers accumulate
into platform-level revenue while keeping retail APR within plausible
ranges.*

| **Tier** | **Annual Revenue (ETH)** | **USD Equivalent** |
|:---|:---|:---|
| Tier 1: World Bank (1 entity) | 31,525 | \$63,050,000 |
| Tier 2: National Banks (5 entities) | 25,775 | \$51,550,000 |
| Tier 3: Local Banks (50 entities) | 55,025 | \$110,050,000 |
| **Total platform revenue** | **112,325** | **\$224,650,000** |
| Borrower surplus generated | 70,000–120,000 | \$140M – \$240M |

System-wide annual revenue summary.

*This continuation details additional projection assumptions and
sensitivity inputs (fees, defaults, and infrastructure cost). Explicit
assumptions are necessary for reproducibility and for interpreting the
projections as scenario-based estimates rather than guarantees.*

The projection above models interest spread income only. Additional
revenue streams from FX conversion spreads (estimated 0.5 to 1.0% per
conversion), loan origination fees (1 to 2% of principal at
disbursement), insurance fund premiums (0.5% of loan value annually),
and governance operations represent material upside not captured in this
base case. Including these streams would increase projected platform
revenue by an estimated 25 to 40% at equivalent lending volume.

***Sources:** ETH price from spot market data (CoinGecko); interest rate
tiers aligned with Aave \[15\] and Compound \[16\] DeFi benchmarks;
default rate and origination fee from conservative industry estimates.*

**Cost Model Considerations.**

- **Gas costs:** Gas expenses on Polygon PoS are quite low. A complete
  retail loan lifecycle on Polygon involves approximately 27–32
  individual on-chain state changes: <a id="sec:gas-cost"></a>

  - 1 loan request (`SSTORE`: borrower data, loan ID, status)

  - 1 credit history lookup + risk score commit

  - 1 approval (`SSTORE`: status update, disbursement record)

  - 1 disbursement (ETH transfer + `SSTORE`: balance update)

  - 12 installment payments $`\times`$ 2 `SSTORE` each = 24 writes

  - 1 loan closure (`SSTORE`: final status)

  - $`\approx`$<!-- -->4 event emissions (`LOG2`/`LOG3`)

  On Polygon PoS, with gas prices of approximately 30 Gwei and MATIC at
  $`\approx`$\$0.60, each `SSTORE` costs approximately \$0.00036. A
  30-operation lifecycle costs approximately \$0.011 total—well under
  0.01% of the interest earned. On Ethereum mainnet at 15 Gwei base fee,
  the same operations would cost \$2.40–\$4.80, reinforcing the design
  choice of Polygon PoS \[55\].

- **Infrastructure costs:** Backend hosting (API server, database, ML
  service), frontend delivery (CDN) and RPC nodes (Alchemy, Infura) can
  incur costs ranging between \$500 and \$2,000 monthly. An increase in
  expenses will be experienced with a rise in transactions.

- **Default losses:** A single default rate assumption is insufficient
  for an early-stage platform.
  Table [5.23](#tab:default-scenarios) presents a
  three-scenario sensitivity analysis:

  <a id="tab:default-scenarios"></a>

| **Scenario** | **Default Rate** | **Annual Loss** | **Basis** |
|:---|:--:|:--:|:---|
| Optimistic | 3.7% | \$7.4M | Grameen Bank 96.29% recovery (June 2024) \[R12\] after 48 years of social infrastructure |
| Base Case | 8% | \$16M | Typical early-stage DeFi undercollateralized lending; no established social trust |
| Stress Test | 15% | \$30M | Early-stage crypto-native borrowers, no prior on-chain credit history, high ETH volatility |

Default rate sensitivity scenarios with economic basis.


  Grameen Bank, after nearly five decades of social lending
  infrastructure, reported a loan recovery rate of 96.29% as of June
  2024 \[R12\]. The Crypto World Bank is a nascent platform without
  equivalent social trust or community officers. Its initial user
  population will likely exhibit default rates closer to 8–15% before
  on-chain credit history accumulates sufficient predictive signal. The
  base case adopts 8% default, with break-even at approximately 11.2%
  default rate under the base loan volume assumption.

  **Break-even user count:** At the base case of 8% default with an
  average loan size of 10 ETH (\$25,000 at \$2,500/ETH) and 8% APR, each
  loan generates \$2,000 annual interest and incurs under \$0.02 gas on
  Polygon. At \$500/month infrastructure costs, the platform requires at
  minimum 4 active loans to cover operating expenses and approximately
  200 active loans to cover expected default losses at 8%—a realistic
  near-term target for a pilot in 2–3 Local Banks.

- **Break-even analysis:** Opportunities for profit on loans as small as
  0.01 ETH (\$25) exist on Polygon PoS. Profitability on loans below
  5 ETH (\$12,500) is not achievable on Ethereum mainnet without
  Layer 2. Layer 2 is essential for facilitating micro-loans.



### Figure

**Caption:** Annual revenue projection by tier (USD millions, at $2,500/ETH conservative mid-point).


**Bar chart data (from LaTeX coordinates):**

| Category | Value |
| :--- | ---: |
| World Bank | 63.05 |
| National Banks | 51.55 |
| Local Banks | 110.05 |
| Total Platform | 224.65 |

_The PDF shows the full rendered bar chart; the table above matches the plotted values in `Pre-thesis_v10.tex`._



### Transaction Economics: Interest Rates

| **Parameter** | **Value** | **Benchmark** |
|:---|:---|:---|
| Base Annual Interest Rate | 5–12% APR | Aligned with Aave/Compound variable rates |
| Rate Determination | Set by Local Bank approvers within World Bank-defined bounds | Configurable per-bank for local market conditions |
| Late Payment Penalty | 2% of installment + 0.5%/week (capped at 10%) | Industry-standard late fee structure |
| Interest Calculation | Simple interest on outstanding principal | Transparent, borrower-friendly |
| Rate Transparency | All parameters stored on-chain | Publicly auditable; no hidden fees |

Interest rate parameters.

*This interest rate table defines the tiered APR parameters used
throughout the feasibility and revenue modeling. Presenting the rate
structure explicitly makes the spread logic auditable and connects the
economic model directly to the proposed governance-controlled
parameters.*



### Figure

**Caption:** Hierarchical interest rate spread (APR) across the four-tier lending structure.


**Bar chart data (from LaTeX coordinates):**

| Category | Value |
| :--- | ---: |
| WB→NB | 3 |
| NB→LB | 5 |
| LB→Borrower | 8 |

_The PDF shows the full rendered bar chart; the table above matches the plotted values in `Pre-thesis_v10.tex`._



### Global Economic Impact

Apart from revenue generated through platforms, various economic
advantages are provided by the Crypto World Bank:

- **Capital deployment and fiscal multiplier:** At projected
  full-deployment lending volume of \$2 billion across nearly 1,000
  institutional borrowers, the platform generates a downstream fiscal
  multiplier of approximately \$2.5 to \$3 per dollar lent \[19\],
  implying \$5 to \$6 billion in annual economic activity. The IFC
  estimates that every \$1 million lent to small businesses in
  developing economies creates approximately 16 new jobs \[20\], making
  capital deployment at this scale a meaningful driver of employment and
  local economic growth.

- **Remittance cost reduction:** Global remittances total approximately
  \$860 billion annually, of which an estimated \$48 to \$56 billion is
  consumed by transfer fees averaging 6.49%—more than double the United
  Nations Sustainable Development Goal target of 3% \[26\]. On-chain
  settlement on Layer 2 networks reduces transaction costs to well below
  1%, directly compressing this fee burden. Comparable blockchain
  payment networks demonstrate the feasibility of this target: Stellar
  processed approximately \$55.6 billion in payments at a fee of roughly
  \$0.0007 per transaction in 2025 \[44\], and Celo’s MiniPay processes
  payments for under one cent across more than 60 countries \[42\].

- **Trapped capital liberation:** The correspondent banking system
  requires banks to maintain pre-funded nostro and vostro accounts in
  every currency corridor in which they operate, immobilizing large sums
  that cannot be deployed for lending or investment \[24\]. On-chain
  atomic settlement eliminates the need for these idle pre-funded
  balances, freeing capital for productive use across the lending
  hierarchy.

- **Financial inclusion:** The platform is designed for accessibility:
  sub-cent gas fees on Polygon PoS, a mobile-first interface, and
  support for micro-loan amounts below one dollar lower the barriers to
  credit for the estimated 1.4 billion adults globally who remain
  outside formal financial systems \[14\]. The World Economic Forum has
  identified decentralized finance as a leapfrog technology capable of
  enabling populations to bypass the infrastructure constraints of
  traditional banking \[41\], a pattern already observed in mobile
  payments across developing economies.

- **Transaction cost reduction:** On Polygon PoS, transaction fees
  remain below one cent—a reduction of over **99%** relative to the
  average \$42 cost of a correspondent banking transaction \[25\]. This
  cost compression makes financially viable a large class of
  micro-transactions and small-loan servicing operations that are
  currently uneconomical through traditional payment rails.

- **Transparency as an economic good:** On-chain publication of reserve
  ratios, interest rates, and transaction records eliminates the
  informational asymmetry that enables predatory lending practices in
  opaque banking environments. In conventional banking,
  borrowers—particularly in developing economies—frequently operate
  without visibility into the true cost of credit or the basis for
  lending decisions. The Crypto World Bank’s design ensures that all
  participants access identical, verifiable information, reducing the
  scope for hidden fees and unfair pricing.

### Value Proposition and Go-to-Market

| **Phase** | **Activities** | **Timeline** |
|:---|:---|:---|
| Phase 1: Validation | Competition submission (BCOLBD 2025); thesis publication; open-source release | Current |
| Phase 2: Pilot | Regulatory sandbox application; institutional partnership; testnet-to-mainnet migration | 6–12 months |
| Phase 3: Production | Multi-chain deployment; enhanced monitoring and analytics; governance token launch | 12–24 months |

Go-to-market phases.

*This value proposition table summarizes user-visible benefits (cost,
transparency, speed, and inclusion) and maps them to platform features.
It supports the go-to-market narrative by linking technical design
choices to practical outcomes for retail users and partner
institutions.*

## Currency Risk and the Stablecoin Imperative

A borrower in rural Bangladesh who takes a loan denominated in ETH faces
a fundamental risk that does not exist in traditional microfinance: if
the price of ETH doubles between loan disbursement and final repayment,
the real value of their repayment obligation doubles in taka terms. For
borrowers near the poverty line, this is not a theoretical risk—it is
potentially catastrophic. The May 2021 crypto market crash saw ETH lose
approximately 55% of its value within six weeks.

This is why stablecoin integration must be treated as a **critical path
item** for the final thesis phase, not an optional extension. The
platform should support USDC or USDT-denominated loans as the primary
product for retail borrowers, with ETH-denominated loans reserved for
institutional-tier participants who can manage currency risk. BIS
Working Paper No. 905 \[R13\] identifies stablecoin volatility as a
structural risk in emerging-market DeFi adoption, and recommends
fully-collateralized models (USDT/USDC) over algorithmic designs for
developing-country use cases. The Terra/LUNA collapse (May 2022,
$`\approx`$\$40 billion lost) provides the definitive negative example.
ERC-20 stablecoin integration has technical implications: token
allowances, `transferFrom` hooks, decimal precision (USDC uses 6
decimals vs. ETH’s 18), and the approval-transfer-state-update ordering
required by the CEI pattern must all be redesigned as a separate
contract module.

## Bootstrap Funding and the Tier 1 Capitalization Problem

The Crypto World Bank faces a **bootstrap funding problem** analogous to
the capitalization challenge of real multilateral development banks. The
World Bank Group was initially capitalised by 44 member-state
subscriptions in 1944; the IBRD’s combined subscribed capital exceeded
\$270 billion following its 2018 capital increase (Ocampo & Gallagher,
2024 \[R15\]). Three initial capitalization mechanisms are proposed for
the Tier 1 Reserve:

1.  **Founding stakeholder deposits:** Universities, NGOs, and
    development-focused blockchain organizations deposit ETH or USDC
    into the Tier 1 Reserve in exchange for governance tokens and yield
    rights.

2.  **Protocol-owned liquidity (POL):** Following the Olympus DAO model,
    the protocol accumulates treasury reserves through bond mechanisms,
    where external parties swap ETH for discounted governance tokens
    over a vesting period.

3.  **Philanthropic/impact grant funding:** Development finance
    institutions (IFC, ADB) have expressed interest in blockchain-based
    development finance tools, as evidenced by the World Bank FundsChain
    initiative \[39\]. Grant funding from these institutions could seed
    the Tier 1 Reserve in exchange for research access and co-branding.

In the short term, a multi-signature wallet (3-of-5 signers representing
different stakeholder groups) governs Tier 1 allocations. In the long
term, an on-chain governance module (similar to Compound Governor Bravo)
enables token-weighted voting with time-locks to prevent governance
attacks.

## Prototype Scope and Limitations

A straightforward version of the complete system is represented by the
current prototype:

1.  **Hierarchical lending scope:** Utilization of the Tier 1 World Bank
    Reserve contract is comprehensive. Deposits are managed, loan
    requests and approvals are processed alongside the display of
    reserve statistics. Not all functions of the Tier 2 (National Bank)
    and Tier 3 (Local Bank) contracts have been implemented. Role
    management and registration are not the only aspects focused on.
    Currently the process for fund transfers from the World Bank to
    National Bank and subsequently to Local Bank is incomplete. Four
    tiers will be included in the final design.

2.  **Interest accrual and repayment:** Rules for interest rates
    (3%/5%/8%) are part of the system design. Fees for initiating loans
    and penalties for delays also exist. Interest calculations, payment
    schedules or penalties aren’t managed automatically by current smart
    contracts. Future updates will incorporate these functions.

3.  **InterBankLendingPool and multi-directional flows:** Plans for
    interbank loans at equal tier levels are included in the design
    (Section 1.7). Smart contracts have yet to be created for those
    components. Currently the prototype does not prioritize the upward
    transfer of funds.

4.  **AI/ML integration:** AI tools such as fraud detection (Random
    Forest) and anomaly detection (Isolation Forest) along with decision
    explanations (SHAP) are set to be utilized by the system. A service
    has been established with FastAPI for machine learning. This service
    does not currently link to the loan approval process in the existing
    version.

5.  **Backend architecture:** Express.js paired with MongoDB is utilized
    for rapid API development. The main database is intended to be
    PostgreSQL. FastAPI is utilized by the machine learning service.

6.  **Banking product suite:** The extended banking product suite
    described in
    Section [3.11](#sec:banking-products), including savings
    accounts, fixed-term deposits, transactional accounts, group
    lending, FX conversion, and the insurance fund, is specified at the
    architectural and design level in this report. Smart contract
    implementation and testing of these modules is planned for the final
    thesis phase. The current prototype establishes the hierarchical
    lending foundation upon which these modules will be integrated.

The limitations above are consistent with a pre-thesis prototype; the
complete system design is fully specified in this report and will be
implemented and validated in the final thesis phase.

## Accessibility Assessment: A Borrower in Rural Sylhet

To ground the platform’s financial inclusion claims in a concrete
context, this section evaluates access across six dimensions for a
hypothetical borrower: a small-scale trader in rural Sylhet, Bangladesh,
seeking a 50,000 BDT ($`\approx`$\$430) working capital loan.

<div class="description">

Smartphone penetration in rural Bangladesh reached approximately 51% of
adults as of 2024. The platform’s mobile-first React interface and
WalletConnect integration allow access via any Android or iOS device
with a browser, without requiring a desktop or dedicated hardware
wallet.

4G coverage in Bangladesh now reaches over 90% of the population,
including rural Sylhet, through Grameenphone and Banglalink networks.
Polygon PoS transactions are lightweight (under 10 KB) and complete
within seconds, well within 4G latency budgets.

At Polygon PoS gas prices, the complete loan lifecycle (request,
approval, 6 monthly installments) costs under \$0.02. This contrasts
with informal money-lender fees of 5–10% per transaction and formal bank
charges of 2–3% origination plus branch travel costs.

The current prototype is English-only. A production deployment serving
rural Sylhet must include a Bengali-language interface. This is a known
gap and a planned extension; the React component library supports
right-to-left and Unicode rendering.

Bangladesh’s National ID (NID) system covers approximately 110 million
registered voters. The planned ZKP KYC extension
(Section [3.6.1](#sec:identity)) allows NID-based credential
verification without exposing personal data on-chain. Mobile Financial
Services (MFS) accounts—bKash, Nagad, Rocket—provide an existing digital
financial identity that 99% more adults accessed in 2021 compared to
2004 \[R11\].

The solidarity group lending model (GroupLendingPool, planned) directly
mirrors the BRAC and Grameen Bank methodology already familiar to rural
Sylhet borrowers. Programmable mutual liability replaces community
social pressure with smart contract enforcement, potentially improving
both collection reliability and borrower protection.

</div>

In aggregate, the Crypto World Bank is accessible in principle to a
rural Sylhet borrower today (device, connectivity, cost) with two
critical gaps requiring resolution for a production deployment:
Bengali-language interface and stablecoin denomination to eliminate
currency risk.

# Conclusion

The Crypto World Bank addresses a **multi-party coordination and trust**
problem inherent in hierarchical development finance by exploiting the
distinctive properties of blockchain technology: cryptographic
integrity, immutability, and programmable auditability. It advances
beyond existing DeFi lending protocols—which collectively manage over
\$55 billion in TVL \[13\] but universally employ flat, single-tier pool
architectures—through a four-tier institutional hierarchy with
cross-tier, same-tier, and upward lending flows, combined with a
governance structure that addresses network membership, business
operations, and technology infrastructure.

This thesis makes four original contributions, as formalized in
Section [1.6](#sec:research-contribution): (1) a four-tier
hierarchical DeFi architecture that mirrors multilateral development
finance capital flows, with no comparable prior art in existing
protocols; (2) an on-chain solidarity group lending specification that
encodes mutual liability enforcement as programmable contract logic; (3)
an oracle-mediated AI/ML integration pattern providing a blueprint for
auditable AI-assisted credit governance; and (4) a compliance-aware ZKP
identity pathway applying zk-SNARK KYC verification to a
developing-economy context.

The analysis of the competitive situation of 20+ existing projects in
DeFi lending, institutional credit, banking infrastructure and financial
inclusion affirm that no current system is a combination of multi-level
lending (hierarchy), interbank lending mechanisms and graded access by
borrowers in one decentralized architecture. The growing blockchain
implementation in the institutions, as demonstrated by the World Bank
FundsChain initiative \[39\], the multi-billion-dollar daily volumes of
JPMorgan Kinexys \[40\] and R3 Corda’s \$17 billion in tokenized
assets \[37\]—validates both the technical feasibility and institutional
demand of blockchain-based financial infrastructure. The Crypto World
Bank extends this trajectory from settlement and fund tracking into a
fully open, hierarchically governed lending system.

The platform occupies the intersection of institutional finance,
decentralized lending, and financial inclusion, a combination that
remains unaddressed in both the academic literature and the commercial
blockchain landscape. With a working prototype, a defined market and
partnership plan, and a planned go-to-market plan, the Crypto World Bank
represents a structurally distinct and architecturally grounded
contribution to the emerging field of blockchain-based development
finance.

Viewed as a complete banking function checklist, the current prototype
implements hierarchical lending workflow foundations (tiered roles,
governance framing, architectural capital flow, and a planned AI/ML
monitoring layer) while leaving several bank-grade modules at the design
level. Unimplemented modules specified in this report include:

- Deposit products (SavingsVault and FixedDeposit)

- Transactional accounts (CurrentAccount)

- Group lending (GroupLendingPool)

- Oracle-priced FX conversion (FXModule)

- Interbank liquidity pools (InterBankLendingPool, planned)

- Insurance and depositor protection (InsuranceFund)

Future iterations therefore focus on completing end-to-end cross-tier
fund transfers and repayment automation, integrating the analytics layer
into real approval flows, and expanding the platform into a functionally
complete worldwide banking system with compliance-aware architecture.

The future work will be directed towards the following directions:

1.  **Complete hierarchical lending implementation:** Complete the
    end-to-end wiring of cross-tier fund transfers between the World
    Bank Reserve, National Bank and Local Bank contracts, including
    automated capital distribution, interest accrual, generation of
    installments schedules, generation of cascading repayments
    enforcement as intended in the architecture.

2.  **InterBankLendingPool and multi-directional flows:** Adopt the
    same-tier interbank lending pool and upward surplus repatriation
    mechanisms described in Section 1.7, so as to permit a full modeling
    of real-life banking liquidity flows in the decentralized structure.

3.  **AI/ML pipeline integration:** Integrate the ML inference based on
    FastAPI service (Random Forest fraud detection, Isolation Forest
    anomaly detection, SHAP explainability) into the real-life loan
    approval process, integrating off-chain on-chain lending decisions
    to risk assessments.

4.  **Mainnet and regulatory sandbox:** Moving off the testnet to the
    mainnet featuring real asset testing in regulated sandbox settings
    (e.g. UK FCA Digital Securities Sandbox, MAS FinTech Regulatory
    Sandbox Singapore, Bangladesh Bank FinTech Regulatory Sandbox).

5.  **Advanced risk monitoring:** Once the core lending workflow is
    stable and the blockchain architecture fully implemented, extend the
    ML monitoring layer to include graph neural network transaction
    analysis for coordinated fraud ring detection, federated learning
    across National and Local Banks for privacy-preserving
    cross-institution threat intelligence, and reinforcement learning
    agents for adaptive interest rate parameter governance.

6.  **Cross-chain interoperability:** Ethereum Layer 2 multi-network
    lending rollups (Arbitrum, Optimism, Base) and other EVM chains to
    serve other geographic markets having optimized gas costs and local
    regulatory compliance.

7.  **Formal security checking:** Formal verification of all smart
    contract code based on symbolic execution (Mythril), and static
    analysis (Slither), formal verification of property (Certora),
    especially multi-tier lending invariants such as cascading reserve
    ratio maintenance and cross-tier interest rate bound enforcement.

8.  **Stablecoin integration, fiat on/off-ramps:** Support established
    blockchain coins (USDC, USDT, DAI) and native blockchain coins, with
    fiat on/off-ramping by collaborating with licensed money
    transmitters or anchor networks like MoneyGram that Stellar has
    implemented \[44\].

9.  **Economic simulation and stress testing:** Agent-based simulation
    of the hierarchical lending system under market stress conditions
    (bank runs, cascading liquidations, correlated collateral
    devaluation) to prove convergence of interest rates, adequacy in the
    reserve ratios, and stability in the system.

10. **Complete banking product suite implementation:** Develop and
    deploy the SavingsVault, FixedDeposit, GroupLendingPool, FXModule,
    InsuranceFund, and CurrentAccount contracts, completing the full
    nine-contract banking architecture described in Chapter 3. Each
    module will be validated independently on testnet before integration
    testing with the existing three-contract lending core.

11. **On-chain credit history portability:** Implement an open credit
    score standard that allows borrowers’ on-chain repayment history to
    be recognized by any platform that adopts the standard, creating a
    portable, self-sovereign financial identity that outlasts any single
    platform and contributes to solving the credit history gap that
    excludes 1.4 billion unbanked adults from formal financial systems.

# Technology Stack

## In-product assistant: local large language model (LLM) integration (prototype)

##### Purpose.

The web application includes a streaming chat assistant to help users
understand platform concepts (e.g., the four-tier capital hierarchy),
screen-specific workflows, and navigation. During local development, the
assistant is served by a **local OpenAI-compatible inference server**
(LM Studio) running a quantized Gemma-family model, while the public
browser traffic is still routed through the project API to keep keys off
the client and to centralize request shaping (system prompts, optional
authenticated user context, and error handling).

##### Model and runtime (local development).

The inference endpoint follows the **OpenAI Chat Completions** contract
(`/v1/chat/completions`) with `stream: true`, proxied from the project
backend to a local service such as `http://127.0.0.1:1234`. The served
checkpoint is configured as a Gemma-4 E4B variant (e.g.,
`google/gemma-4-e4b`) in GGUF form with a practical quantization (e.g.,
`Q4_K_M`) for a laptop-friendly footprint (on the order of single-digit
GBs). The exact quantization label and on-disk name are a deployment
artifact; what matters for integration is the **API model identifier**
exposed by the local server and referenced by the backend configuration
(environment-driven).

##### End-to-end behavior.

The user interface assembles a short transcript (user/assistant
messages) and posts it to the backend streaming route. The backend
prepends a **system message** with platform + screen “feature” context,
optionally enriched by user role when a valid session token is present.
The backend then opens a streaming request to the local model server,
converts upstream token events into **server-sent events (SSE)** for the
browser, and the UI incrementally appends text. The message renderer
uses Markdown (including GitHub-flavored extensions), math (KaTeX) for
`$$...$$` blocks, and line-break rules appropriate for chat transcripts.

##### Security and limitations (prototype stance).

The assistant is a **read-only product guide**: it is not an
authoritative source of on-chain truth and it does not sign
transactions. Hallucination risk exists; production hardening would add
retrieval of verified platform facts and stronger safety policies. The
implementation prioritizes **developer ergonomics** (local model,
same-machine loop) over maximum isolation boundaries.

##### Architecture diagram (Mermaid).

Mermaid is convenient for version-control-friendly diagrams, but a
typical `pdflatex` build does not render Mermaid natively. To keep the
`.tex` file small for Overleaf,
Figure [A.1](#fig:local-llm-mermaid) shows a *compact* Mermaid
listing (the full, repository-sized diagram can be larger);
Figure [A.2](#fig:local-llm-tikz) gives an equivalent,
PDF-safe TikZ view for the build pipeline.



### Figure (`fig:local-llm-mermaid`)

**Caption (from manuscript):** Compact Mermaid source for the local LLM path (full detail: optionalAuth, featureKey prompts, and upstream URL live in the project repository).







### Figure (`fig:local-llm-tikz`)

**Caption (from manuscript):** Local LLM assistant data flow: browser UI streams from the CWB API, which proxies to a local OpenAI-compatible model server. The path is the same in principle for both landing and in-app UIs, with optional user context when authenticated.

**Source:** TikZ in `Pre-thesis_v10.tex`.

**Diagram structure (extracted node/edge labels):**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)




##### Implementation analysis (brief).

The integration is successful for the project prototype because it
reuses a stable transport shape (chat-completions with streaming) and
isolates the model vendor behind a single API route, allowing the user
interface to remain a thin client. The main practical engineering
challenges in local development were: (1) **process/port hygiene** to
keep the API bound to a predictable port, (2) **CORS and same-origin**
considerations when the UI and API run on different localhost ports,
mitigated with a Vite dev proxy to `/api` and with permissive dev CORS
policy on the API, and (3) **RPC provider selection** for wallet reads
in the browser, where some public endpoints may fail browser CORS;
pinning explicit public RPC endpoints avoids noisy failures unrelated to
the chat feature.

##### Relationship to the earlier rule-based assistant (legacy).

The repository also retains early keyword-routed `/api/chatbot` handlers
used for initial prototyping; the LLM path is additive. This separation
prevents regressions in deterministic demo endpoints while the
conversational assistant evolves.

| **Layer** | **Technology** | **Version / Notes** |
|:---|:---|:---|
| Smart Contract | Solidity, OpenZeppelin | 0.8.20; Ownable, ReentrancyGuard |
| Frontend | React, TypeScript | Material UI; Design 3 |
| Wallet Integration | Wagmi, RainbowKit, Viem | EIP-1193 compliant |
| Build and Test | Hardhat | Automated test suite; deployment scripts |
| Backend API | Express.js, Node.js | REST API; middleware architecture |
| Database | PostgreSQL (designed) | 15 tables, 3NF; relational integrity |
| Target Networks | Polygon Amoy, Ethereum Sepolia | Public testnets; zero-cost |

Technology stack summary.

*This appendix table summarizes assistant integration components and
configuration aspects used in the prototype (UI, API proxying, and local
model server). The purpose is to make the implementation reproducible
and to clarify which parts are prototype conveniences versus production
requirements.*

# Smart Contract Capabilities

The complete banking architecture is designed around nine modular
contracts. The current prototype implements the core three-contract
lending foundation, with the remaining six modules planned for the final
thesis phase.

**Implemented contracts:**

- **World Bank Reserve Contract:** Reserve custody, deposit handling,
  national bank registration, capital allocation to national banks,
  system pause and unpause, emergency withdrawal, and system statistics.

- **National Bank Contract:** Local bank registration, borrowing from
  the World Bank reserve, capital allocation to local banks, and network
  status queries.

- **Local Bank Contract:** Borrower registration, loan application
  processing, approval and rejection workflows, installment generation
  and payment processing, approver management, and user account
  management.

**Planned contracts (Final Thesis Phase):**

- **SavingsVault Contract:** Standard savings account management,
  variable yield accrual, withdrawal processing, and deposit-to-lending
  pool integration.

- **FixedDeposit Contract:** Term deposit creation, lock period
  enforcement, agreed APY accrual, early withdrawal penalty calculation,
  and maturity release.

- **GroupLendingPool Contract:** Group formation, multi-signature
  consent recording, shared collateral management, per-member
  disbursement, mutual liability enforcement, and group credit history
  recording.

- **FXModule Contract:** Oracle-priced currency conversion, spread
  calculation, dual-currency lending denomination support, and
  conversion audit trail.

- **InsuranceFund Contract:** Premium collection, claims processing,
  default coverage disbursement, and fund reserve management.

- **CurrentAccount Contract:** Transactional account management, atomic
  peer transfers, recurring payment scheduling, and payroll deposit
  handling.

# Appendix C: Deployed Testnet Contract Addresses

The following table records the contract addresses deployed to the
Polygon Amoy testnet during Sprint 1 and Sprint 2. All addresses can be
independently verified on the Amoy block explorer at
<https://www.oklink.com/amoy>. Deployment was performed using
Hardhat v2.22 with a project-specific deployment script; transaction
hashes are available in the project repository under
`/deployments/amoy/`.

| **Contract** | **Network** | **Address** |
|:---|:---|:---|
| WorldBankReserve | Polygon Amoy | `[See project repository: /deployments/amoy/WorldBankReserve.json]` |
| NationalBank (Scaffold) | Polygon Amoy | `[See project repository: /deployments/amoy/NationalBank.json]` |
| LocalBank (Scaffold) | Polygon Amoy | `[See project repository: /deployments/amoy/LocalBank.json]` |
| LendingController | Polygon Amoy | `[See project repository: /deployments/amoy/LendingController.json]` |

Deployed smart contract addresses, Polygon Amoy testnet (as of
pre-thesis submission).

*Note: Exact hex addresses are stored in the project deployment manifest
rather than hard-coded here, as testnet redeployment during development
may produce updated addresses. The deployment manifest in the repository
is the authoritative record. The final thesis submission will include
static addresses from a stable named deployment.*

# Appendix D: WorldBankReserve Contract Interface

The following Solidity interface documents the public API of the
`WorldBankReserve` contract—the fully implemented Tier 1 contract of the
prototype. Three design annotations follow the listing:

``` Solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title WorldBankReserve
/// @notice Tier 1 reserve contract: manages global capital allocation
///         to registered National Bank addresses.
contract WorldBankReserve is ReentrancyGuard, AccessControl {

    bytes32 public constant NATIONAL_BANK_ROLE = keccak256("NATIONAL_BANK_ROLE");
    bytes32 public constant AUDITOR_ROLE       = keccak256("AUDITOR_ROLE");

    uint256 public totalReserve;
    uint256 public minimumReserveRatio;   // e.g. 1000 = 10.00%
    mapping(address => uint256) public allocatedTo; // NationalBank => amount

    event CapitalAllocated(address indexed nationalBank, uint256 amount);
    event RepaymentReceived(address indexed nationalBank, uint256 amount);
    event ReserveRatioUpdated(uint256 newRatio);

    /// @notice Allocate capital downward to a registered National Bank (CEI pattern)
    function allocateCapital(address nationalBank, uint256 amount)
        external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant;

    /// @notice Record repayment from a National Bank (CEI pattern)
    function recordRepayment(uint256 amount)
        external onlyRole(NATIONAL_BANK_ROLE) nonReentrant;

    /// @notice Query current utilization ratio (scaled 1e4)
    function utilizationRate() external view returns (uint256);

    /// @notice Returns true if reserve ratio constraint is satisfied
    function isReserveAdequate() external view returns (bool);
}
```

**Design annotation 1 — `nonReentrant` on state-changing functions.**
The `nonReentrant` modifier from OpenZeppelin’s `ReentrancyGuard` sets a
boolean lock before execution and clears it after, preventing recursive
calls. It is applied to `allocateCapital` and `recordRepayment` because
both involve ETH transfers that could trigger attacker-controlled
fallback functions. The full Checks-Effects-Interactions analysis is in
Section [3.7](#sec:kinked-rate).

**Design annotation 2 — `AccessControl` mapping to RBAC design.**
OpenZeppelin’s `AccessControl` maps each on-chain role (e.g.,
`NATIONAL_BANK_ROLE`) to a `bytes32` keccak256 hash stored in a
role-to-address mapping. Role assignment is controlled by the
`DEFAULT_ADMIN_ROLE` (the World Bank admin). This directly implements
the four-tier RBAC hierarchy described in
Section [3.1](#sec:prototype-scope): only addresses granted
`NATIONAL_BANK_ROLE` can call `recordRepayment`, and only the World Bank
admin can call `allocateCapital`.

**Design annotation 3 — Events enable off-chain indexing for the
analytics layer.** `CapitalAllocated`, `RepaymentReceived`, and
`ReserveRatioUpdated` are emitted at every significant state transition.
The off-chain Express.js event listener subscribes to these events and
writes them to PostgreSQL, enabling the AI/ML monitoring layer to
construct loan lifecycle timelines, compute utilization windows, and
feed the Random Forest fraud detector without requiring costly repeated
`SLOAD` calls.

# References

<div class="enumerate">

S. M. Werner, D. Perez, L. Gudgeon, A. Klages-Mundt, D. Harz, and W. J.
Knottenbelt, “SoK: Decentralized Finance (DeFi),” *arXiv preprint
arXiv:2101.08778*, 2022. \[Online\]. Available:
<https://arxiv.org/abs/2101.08778>

S. Bastankhah, M. Hashemi, and W. Shi, “An Adaptive Data-Driven DeFi
Borrow-Lending Protocol,” *Proc. IEEE Int. Conf. Blockchain*, 2023.

G. Palaiokrassas, A. Skoufis, and L. Tassiulas, “Leveraging Machine
Learning for Multichain DeFi Fraud Detection,” *Proc. IEEE Int. Conf.
Blockchain and Cryptocurrency (ICBC)*, 2023.

D. Adom, E. O. Acheampong, and M. Boateng, “LIME and SHAP: A Comparison
of Model-Agnostic Approaches to Explainability in Loan Approval
Systems,” *International Journal of Advanced Computer Science and
Applications*, vol. 13, no. 11, 2022.

B. W. Tan, “Central Bank Digital Currency and Financial Inclusion,” *IMF
Working Paper WP/23/69*, 2023. \[Online\]. Available:
<https://www.imf.org/en/Publications/WP>

F. T. Liu, K. M. Ting, and Z.-H. Zhou, “Isolation Forest,” in *Proc.
IEEE Int. Conf. Data Mining (ICDM)*, pp. 413–422, 2008. DOI:
<https://doi.org/10.1109/ICDM.2008.17>

N. Atzei, M. Bartoletti, and T. Cimoli, “A Survey of Attacks on Ethereum
Smart Contracts (SoK),” in *Proc. Int. Conf. Principles of Security and
Trust (POST)*, pp. 164–186, 2017. DOI:
<https://doi.org/10.1007/978-3-662-54455-6_8>

S. M. Lundberg and S.-I. Lee, “A Unified Approach to Interpreting Model
Predictions,” in *Advances in Neural Information Processing Systems
(NeurIPS)*, pp. 4765–4774, 2017. \[Online\]. Available:
<https://proceedings.neurips.cc/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html>

P. Bracke, A. Datta, C. Jung, and S. Sen, “Machine Learning
Explainability in Finance: An Application to Default Risk Analysis,”
*Bank of England Staff Working Paper No. 816*, 2019. \[Online\].
Available:
<https://www.bankofengland.co.uk/working-paper/2019/machine-learning-explainability-in-finance>

R. Beck, C. Müller-Bloch, and J. L. King, “Governance in the Blockchain
Economy: A Framework and Research Agenda,” *Journal of the Association
for Information Systems*, vol. 19, no. 10, pp. 1020–1034, 2018. DOI:
<https://doi.org/10.17705/1jais.00518>

D. Mhlanga, “Blockchain Technology for Financial Inclusion and
Sustainable Development,” in *Digital Financial Inclusion*, Springer,
2022.

OpenZeppelin, “OpenZeppelin Contracts,” 2024. \[Online\]. Available:
<https://openzeppelin.com/contracts>

DefiLlama, “Lending Protocols — DeFi TVL and Protocol Rankings,”
2024–2025. \[Online\]. Available:
<https://defillama.com/protocols/lending>

World Bank, “The Global Findex Database 2021: Financial Inclusion,
Digital Payments, and Resilience,” 2021. \[Online\]. Available:
<https://www.worldbank.org/en/publication/globalfindex>

Aave, “Aave Protocol Documentation,” 2024. \[Online\]. Available:
<https://docs.aave.com/>

Compound, “Compound Protocol Documentation,” 2024. \[Online\].
Available: <https://docs.compound.finance/>

BCOLBD 2025, “Blockchain Olympiad Bangladesh: Guideline and Evaluation
Scheme,” 2025. \[Online\]. Available:
<https://bcolbd.org/uploads/guideline/BLOCKCHAIN%20OLYMPIAD%20BANGLADESH%20Blockchain%20Guideline.pdf>

Galaxy Digital, “The State of Crypto Lending and Borrowing,” Galaxy
Research, 2024. \[Online\]. Available:
<https://www.galaxy.com/insights/research/the-state-of-crypto-lending>

World Bank, “World Development Report 2022: Finance for an Equitable
Recovery,” 2022. \[Online\]. Available:
<https://www.worldbank.org/en/publication/wdr2022>

International Finance Corporation (IFC), “MSME Finance Gap 2019,” 2019.
\[Online\]. Available:
<https://www.ifc.org/en/insights-reports/2019/msme-finance-gap>

Bank for International Settlements, “DeFi Lending: Intermediation
Without Information?,” BIS Working Paper No. 1183, 2024. \[Online\].
Available: <https://www.bis.org/publ/work1183.pdf>

Deloitte, “Global Banking Outlook 2024,” 2024.

Michigan State University Libraries, “Literature Table and Synthesis —
Nursing Literature Reviews,” LibGuides, 2025. \[Online\]. Available:
<https://libguides.lib.msu.edu/nursinglitreview/table>

Committee on Payments and Market Infrastructures and Bank for
International Settlements, “Correspondent Banking — Technical Report,”
CPMI Papers No. 147, 2016. \[Online\]. Available:
<https://www.bis.org/cpmi/publ/d147.pdf>

Ripple, “RLUSD Use Case Analysis,” XRP Academy, 2026. \[Online\].
Available:
<https://xrpacademy.com/blog/rlusd-use-case-analysis-calendar-570>

World Bank, “Remittance Prices Worldwide: Making Markets More
Transparent,” Migration and Development Brief 40, 2024. \[Online\].
Available: <https://remittanceprices.worldbank.org/>

DefiLlama, “Aave V3 TVL, Fees, Revenue & Income Statement,” March 2026.
\[Online\]. Available: <https://defillama.com/protocol/aave-v3>

World Inequality Lab, “Exorbitant Privilege,” *World Inequality Report
2026*, 2026. \[Online\]. Available:
<https://wir2026.wid.world/insight/exorbitant-privilege/>

DefiLlama, “Compound V3 TVL, Fees, Revenue & Income Statement,” March
2026. \[Online\]. Available:
<https://defillama.com/protocol/compound-v3>

Fensory, “Sky Protocol Projects \$611M Revenue in 2026 as USDS Supply
Targets \$20.6 Billion,” February 2026. \[Online\]. Available:
<https://www.fensory.com/intelligence/rwa/sky-protocol-tokenization-regatta-solana-february-2026>

Fensory, “Maple Finance — Institutional DeFi Lending Protocol,” 2026.
\[Online\]. Available:
<https://www.fensory.com/insights/protocols/maple-finance>

Fensory, “DeFi Credit Platforms Hit \$2.4B Milestone,” March 2026.
\[Online\]. Available:
<https://www.fensory.com/intelligence/rwa/defi-private-credit-platforms-2-4-billion-loans-ethereum>

Financial Stability Board, “Enhancing Cross-border Payments: Stage 3
Roadmap,” 2020. \[Online\]. Available:
<https://www.fsb.org/2020/10/enhancing-cross-border-payments-stage-3-roadmap/>

A. Beyer, B. Gasperini, and P. Theodoridis, “Monetary Policy and
Inequality: Distributional Effects of Asset Purchase Programs,” *Journal
of International Money and Finance*, vol. 157, 2025.

Federal Reserve Board, “Monetary Policy and the Distribution of Income:
Evidence from U.S. Metropolitan Areas,” FEDS Notes, March 2025.
\[Online\]. Available:
<https://www.federalreserve.gov/econres/notes/feds-notes/monetary-policy-and-the-distribution-of-income-evidence-from-us-metropolitan-areas-20250331.html>

R. Cantillon, *Essai sur la Nature du Commerce en Général* (*Essay on
the Nature of Commerce in General*), 1755 (posthumous).

GlobeNewswire, “R3’s Corda Leads Tokenized RWA Market with Over \$10
Billion in On-chain Assets,” February 2025. \[Online\]. Available:
<https://www.globenewswire.com/news-release/2025/02/13/3025637/>

Centrifuge, “Real-World Asset Tokenization: Key Trends from 2025,” 2025.
\[Online\]. Available:
<https://centrifuge.io/blog/real-world-asset-tokenization-trends-2025>

World Bank, “World Bank Group Tracks Project Funds with New Blockchain
Tool,” Press Release, September 2025. \[Online\]. Available:
<https://www.worldbank.org/en/news/press-release/2025/09/26/world-bank-group-tracks-project-funds-with-new-blockchain-tool>

JPMorgan, “Kinexys Digital Payments: Real-Time Multicurrency Payments,”
2025. \[Online\]. Available:
<https://www.jpmorgan.com/onyx/coin-system.htm>

World Economic Forum, “Why Decentralized Finance Is a Leapfrog
Technology for the 1.1 Billion People Who Are Unbanked,” September 2022.
\[Online\]. Available:
<https://weforum.org/stories/2022/09/decentralized-finance-a-leapfrog-technology-for-the-unbanked>

Opera Newsroom, “160M CELO Allocation Proposal to Grow Opera from
Distribution Partner into Key Network Stakeholder,” March 2026.
\[Online\]. Available:
<https://press.opera.com/2026/03/19/opera-celo-partnership-2026/>

Morpho, “Network Data,” March 2026. \[Online\]. Available:
<https://data.morpho.org/>

Stellar, “End of Year 2025 Report — Execution at Scale,” 2025.
\[Online\]. Available:
<https://www.stellar.org/blog/foundation-news/2025-year-in-review>

Human Rights Foundation, “Tracking CBDCs Before They Track You,” 2025.
\[Online\]. Available:
<https://hrf.org/latest/tracking-cbdcs-before-they-track-you>

Y. Li, X. Zhang, and H. Wang, “Design and Implementation of a
Multi-Chain Lending Model in Blockchain,” in *Proc. IEEE Int. Conf.
Blockchain*, 2024. DOI:
<https://doi.org/10.1109/Blockchain62396.2024.10729983>

R. Xu, S. Chen, and L. Yang, “An Evaluation System for DeFi Lending
Protocols,” in *Proc. IEEE Int. Conf. Blockchain and Cryptocurrency
(ICBC)*, pp. 1–6, 2023. DOI:
<https://doi.org/10.1109/ICBC56567.2023.10240601>

A. Sharma, R. K. Singh, and S. Gupta, “Blockchain Empowered Framework
for Peer to Peer Lending,” in *Proc. IEEE Int. Conf. Blockchain
Computing and Applications (BCCA)*, pp. 142–147, 2021. DOI:
<https://doi.org/10.1109/BCCA53669.2021.9596552>

M. T. Hassan, F. Ahmad, and A. Mehmood, “Blockchain and Machine Learning
for Fraud Detection: A Privacy-Preserving and Adaptive Incentive Based
Approach,” *IEEE Access*, vol. 10, pp. 87115–87131, 2022. DOI:
<https://doi.org/10.1109/ACCESS.2022.3199498>

Y. Wang, J. Liu, and Z. Chen, “ContractWard: Automated Vulnerability
Detection Models for Ethereum Smart Contracts,” *IEEE Trans. Network
Science and Engineering*, vol. 8, no. 2, pp. 1133–1144, 2020. DOI:
<https://doi.org/10.1109/TNSE.2020.2968505>

C.-F. Liao, T.-H. Tsai, and C.-J. Chen, “SoliAudit: Smart Contract
Vulnerability Assessment Based on Machine Learning and Fuzz Testing,” in
*Proc. IEEE Int. Conf. Internet of Things (iThings)*, pp. 458–465, 2019.
DOI:
<https://doi.org/10.1109/iThings/GreenCom/CPSCom/SmartData.2019.00098>

S. So, M. Lee, J. Park, H. Lee, and H. Oh, “VERISMART: A Highly Precise
Safety Verifier for Ethereum Smart Contracts,” in *Proc. IEEE Symp.
Security and Privacy (S&P)*, pp. 1678–1694, 2020. DOI:
<https://doi.org/10.1109/SP40000.2020.00032>

S. Islam, R. Khan, and M. A. Rahman, “Central Bank Digital Currency
(CBDC): Design Requirements and Challenges,” in *Proc. IEEE Int. Conf.
Computing, Communication, and Intelligent Systems (ICCCIS)*, 2024. DOI:
<https://doi.org/10.1109/ICCCIS62002.2024.10634472>

M. S. Alam, S. M. Hossain, and A. K. Das, “Towards Using Blockchain
Technology for Microcredit Industry in Bangladesh,” in *Proc. IEEE
Region 10 Symp. (TENSYMP)*, pp. 1–6, 2021. DOI:
<https://doi.org/10.1109/TENSYMP52854.2021.9392730>

P. Tolmach, Y. Li, and S. Lin, “Optimal Gas Fee Minimization in DeFi:
Enhancing Efficiency and Security on the Ethereum Blockchain,” *IEEE
Trans. Dependable and Secure Computing*, 2024. DOI:
<https://doi.org/10.1109/TDSC.2024.3495637>

S. Gupta, A. Kumar, and R. Sharma, “SHAP-based Interpretable Models for
Credit Default Assessment Using Machine Learning,” in *Proc. IEEE Int.
Conf. Artificial Intelligence and Data Science*, 2024. DOI:
<https://doi.org/10.1109/ICAIDS60875.2024.10840375>

S. Nakamoto, “Bitcoin: A Peer-to-Peer Electronic Cash System,” 2008.
\[Online\]. Available: <https://bitcoin.org/bitcoin.pdf>

G. Wood, “Ethereum: A Secure Decentralised Generalised Transaction
Ledger” (Yellow Paper), Ethereum Foundation, 2014 (revised 2023).
\[Online\]. Available:
<https://ethereum.github.io/yellowpaper/paper.pdf>

Aave, “Aave Protocol V3 Technical Paper,” 2022. \[Online\]. Available:
<https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf>

T. Dao, T. Trinh, and V. Pham, “Optimizing Credit Scoring Models for
Decentralized Financial Applications,” in *Information and Communication
Technology*, Springer, 2025. DOI:
<https://doi.org/10.1007/978-981-96-4282-3_36>

G.-L. Gücük, S. Leible, and J. Edinger, “Blockchain-Based Microlending
for Financial Inclusivity: A Literature Review of Its Privacy and
Trust,” Springer, 2024. DOI:
<https://doi.org/10.1007/978-3-032-12801-0_22>

A. Beniiche, “A Study of Blockchain Oracles,” *arXiv preprint
arXiv:2004.07140*, 2020. \[Online\]. Available:
<https://arxiv.org/pdf/2004.07140>

A. Pasdar, Y. C. Lee, and Z. Dong, “Connect API with Blockchain: A
Survey on Blockchain Oracle Implementation,” *ACM Computing Surveys*,
vol. 55, no. 10, 2023. DOI: <https://doi.org/10.1145/3567582>

L. Gudgeon, D. Perez, D. Harz, B. Livshits, and A. Gervais, “DeFi
Protocols for Loanable Funds: Interest Rates, Liquidity, and Market
Efficiency,” in *Proc. ACM AFT*, 2020. \[Online\]. Available:
<https://berkeley-defi.github.io/assets/material/DeFi%20Protocols%20for%20Loanable%20Funds.pdf>

T. Mackinga, T. Nadahalli, and R. Wattenhofer, “Attacks on Dynamic DeFi
Interest Rate Curves,” *arXiv preprint arXiv:2307.13139*, 2023.

K. W. Wu, “Strengthening DeFi Security: A Static Analysis Approach to
Flash Loan Vulnerabilities,” *arXiv preprint arXiv:2411.01230*, 2024.

“A Comprehensive Study of Exploitable Patterns in Smart Contracts: From
Vulnerability to Defense,” *arXiv preprint arXiv:2504.21480*, 2025.

E. Albert, J. Correas, P. Gordillo, G. Román-Díez, and A. Rubio, “GASOL:
Gas Analysis and Optimization for Ethereum Smart Contracts,” in *Proc.
TACAS*, Springer, 2020. DOI:
<https://doi.org/10.1007/978-3-030-45237-7_7>

F. Piper, K. Wolf, and J. Heiss, “Privacy-Preserving On-chain
Permissioning for KYC-Compliant Decentralized Applications,” TU Berlin,
*arXiv preprint arXiv:2510.05807*, 2025.

N. Decker, “Zero-Knowledge Proofs: Cryptographic Model for Financial
Compliance and Global Banking Security,” *SSRN Working Paper
No. 5170068*, 2025.

E. Toufaily and T. Zalan, “How Can Blockchain-Based Lending Platforms
Support Microcredit Activities in Developing Countries? An Empirical
Validation of Its Opportunities and Challenges,” *Technological
Forecasting and Social Change*, vol. 203, 2024. DOI:
<https://doi.org/10.1016/j.techfore.2024.123403>

S. Howlader and P. Halder, “Fintech’s Impact on Financial Inclusion
Through Mobile Financial Services in Bangladesh,” *Sage Publications*,
2025. DOI: <https://doi.org/10.1177/09763996251356998>

Atlas of Wars, “Grameen Bank: A Successful Microcredit Model,” 2024.
\[Online\]. Available:
<https://www.atlasofwars.com/grameen-bank-a-successful-microcredit-model/>

A. Carstens et al., “Stablecoins: Risks, Potential and Regulation,” *BIS
Working Papers No. 905*, Bank for International Settlements, 2021.
\[Online\]. Available: <https://www.bis.org/publ/work905.pdf>

“Stablecoin Devaluation Risk,” *The European Journal of Finance*, Taylor
& Francis, 2025. DOI: <https://doi.org/10.1080/1351847X.2025.2505757>

J. A. Ocampo and K. Gallagher, “The Role of Multilateral Development
Banks and Development Assistance in the Provision of Global Public
Goods,” UNDP Background Paper, 2024. \[Online\]. Available:
<https://hdr.undp.org/system/files/documents/background-paper-document/2024jaocampokdgonzaleztheroleofmultilateraldevlmntbanks.pdf>

“Commit-Reveal$`^2`$: Securing Randomness Beacons with Randomized Reveal
Order in Smart Contracts,” *arXiv preprint arXiv:2504.03936*, 2025.

F. A. Aponte-Novoa, A. L. S. Orozco, R. Villanueva-Polanco, and
P. Wightman, “The 51% Attack on Blockchains: A Mining Behavior Study,”
*IEEE Access*, vol. 9, pp. 140549–140564, 2021. DOI:
<https://doi.org/10.1109/ACCESS.2021.3119110>

DL News, “State of DeFi 2025,” March 2026. \[Online\]. Available:
<https://www.dlnews.com/research/internal/state-of-defi-2025/>

arXiv:2506.00505, “Reinforcement Learning for Interest Rate Adjustment
in DeFi Lending,” 2025.

</div>

[^1]: All ETH-denominated calculations use \$2,500/ETH as a conservative
    mid-point. A 20% price reduction to \$2,000 reduces interest revenue
    proportionally but does not affect the gas cost ratio, which remains
    below 0.01% of interest earned on Polygon.


---

# Figure descriptions (PNG and TikZ)

## Figure 3.1 — `fig:component-diagram`

**List of Figures (aux) PDF page:** p.38

**Caption:** Component diagram showing interactions between the presentation layer, smart contract layer, off-chain backend services, and external systems.

**Layers (top to bottom in the diagram).**

**Smart Contract Layer (orange):** `OpenZeppelin Ownable` at the top; `WorldBankReserve` / `IReserve`; `NationalBank` / `INationalBank`; `LocalBank` / `ILocalBank`. Solid arrows show **lends** from World Bank reserve toward National Bank and toward Local Bank.

**Presentation Layer (blue):** `Wallet Provider (Wagmi + …)` connects to `LocalBank` with **connRPC**; connects to **MetaMask Wallet** (external); connects to **React DApp** with **tx/read**. The React DApp groups **Dashboard, Loan, Admin, Risk,** and **Chat**. Bidirectional link to backend: **ws://** and **REST**.

**External Services (red):** **MetaMask Wallet**; **Alchemy RPC** receives **RPC** from `LocalBank`, sends **events** to backend **Realtime + Sync**, and **broadcast** to **Polygon PoS**.

**Backend Services Layer (green):** **Realtime + Sync (WebSocket)**; **FastAPI (REST)** with **LoanAPI** and **UserAPI**; **Storage** containing **PostgreSQL (15 tables)**, **Redis**, **FileStore**; **AI/ML Service** with **predictFraud**, **detectAnomaly**, and **SHAP**.

**End-to-end flow (narrative order):** User uses **React DApp**; **Wallet Provider** connects **MetaMask** and talks to **LocalBank** on-chain (**connRPC** / **tx/read**). Contracts use **Alchemy RPC** to reach **Polygon PoS**; Alchemy **events** feed **Realtime + Sync**, which with **FastAPI** persists to **PostgreSQL/Redis** and runs **AI/ML** scoring.

![Figure 3.1: Component diagram showing interactions between the presentation layer, smart contract layer, off-chain backend services, and external systems.](Documentation/Diagrams/CSE471/Component%20Diagram.png)

**Repository file:** `Documentation/Diagrams/CSE471/Component Diagram.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

## Figure 3.2 — `fig:core-system-graph`

**List of Figures (aux) PDF page:** p.41

**Caption:** Core system graph: Crypto World Bank entity relationship model showing the four-tier banking hierarchy (World Bank $\to$ National Bank $\to$ Local Bank $\to$ BANK_USER), the central BORROWER entity, and the lending-lifecycle sub-graph (LOAN_REQUEST, TRANSACTION, INCOME_PROOF, INSTALLMENT, CHAT_MESSAGE, AI_ML_LOG).

**TikZ — text extracted from source:**

- **Node:** WORLD_BANK
- **Node:** NATIONAL_BANK
- **Node:** LOCAL_BANK
- **Node:** BANK_USER\\{\scriptsize National}
- **Node:** BANK_USER\\{\scriptsize Local}
- **Node:** BORROWER
- **Node:** LOAN_REQUEST
- **Node:** TRANSACTION
- **Node:** INCOME_PROOF
- **Node:** INSTALLMENT
- **Node:** CHAT_MESSAGE
- **Node:** AI_ML_LOG
- **Edge/node label:** \small 1:N
- **Edge/node label:** \small 1:N
- **Edge/node label:** \small 1:N
- **Edge/node label:** \small 1:N

## Figure 3.3 — `fig:erd`

**List of Figures (aux) PDF page:** p.42

**Caption:** Entity-Relationship Diagram (ERD) for the Crypto World Bank database: all 15 normalized tables (3NF) with primary keys (PK), foreign keys (FK), data types, and relationship connectors. Crow's-foot notation indicates cardinality.

**TikZ — text extracted from source:**

- **Node:** WORLD_BANK
- **Node:** NATIONAL_BANK
- **Node:** LOCAL_BANK
- **Node:** AI_CHATBOT_LOG
- **Node:** MARKET_DATA
- **Node:** PROFILE_SETTINGS
- **Node:** BORROWER
- **Node:** BANK_USER
- **Node:** INCOME_PROOF
- **Node:** BORROWING_LIMIT
- **Node:** LOAN_REQUEST
- **Node:** TRANSACTION
- **Node:** CHAT_MESSAGE
- **Node:** INSTALLMENT
- **Node:** AI_ML_SECURITY_LOG

## Figure 3.4 — `fig:eer`

**List of Figures (aux) PDF page:** p.43

**Caption:** Enhanced Entity-Relationship (EER) diagram: full data model showing generalization/specialization (BANK_USER $\to$ National/Local subtypes), weak entity (INSTALLMENT), multi-valued attribute (INCOME_PROOF), aggregation (Loan-Centric cluster), and participation constraints. Panel borders group related constructs.

**TikZ — text extracted from source:**

- **Node:** MARKET_DATA\\{\tiny PK: market_data_id}\\{\tiny cryptocurrency_type, price_usd}
- **Node:** AI_CHATBOT_LOG\\{\tiny PK: log_id}\\{\tiny user_wallet, intent}
- **Node:** PROFILE_SETTINGS\\{\tiny PK: profile_id}\\{\tiny user_type, user_id}\\{\tiny terms_accepted}
- **Node:** WORLD_BANK\\{\tiny PK: world_bank_id}\\{\tiny total_reserve, name}
- **Node:** NATIONAL_BANK\\{\tiny PK: national_bank_id}\\{\tiny FK: world_bank_id}\\{\tiny country, total_borrowed}
- **Node:** LOCAL_BANK\\{\tiny PK: local_bank_id}\\{\tiny FK: national_bank_id}\\{\tiny city, total_lent}
- **Node:** BANK_USER\\{\tiny PK: bank_user_id}\\{\tiny wallet_address, role}\\{\tiny discriminator: bank_type}
- **Node:** NATIONAL_BANK_USER\\{\tiny FK: national_bank_id}
- **Node:** LOCAL_BANK_USER\\{\tiny FK: local_bank_id}
- **Node:** BORROWER\\{\tiny PK: borrower_id}\\{\tiny wallet_address, country}\\{\tiny consecutive_paid_loans}
- **Node:** INCOME_PROOF\\{\tiny PK: proof_id}\\{\tiny FK: borrower_id}\\{\tiny file_hash, status}
- **Node:** BORROWING_LIMIT\\{\tiny PK: limit_id}\\{\tiny FK: borrower_id (UNIQUE)}\\{\tiny six_month_remaining}\\{\tiny (derived)}
- **Node:** LOAN_REQUEST\\{\tiny PK: loan_id}\\{\tiny FK: borrower_id, local_bank_id}\\{\tiny amount, status, deadline}
- **Node:** INSTALLMENT\\{\tiny PK: loan_id + installment_number}\\{\tiny FK: loan_id (identifying)}\\{\tiny amount_due, due_date, status}
- **Node:** TRANSACTION\\{\tiny PK: transaction_id}\\{\tiny FK: borrower_id}\\{\tiny related_loan_id}\\{\tiny transaction_type, amount}
- **Node:** CHAT_MESSAGE\\{\tiny PK: message_id}\\{\tiny FK: loan_id}\\{\tiny sender_type, message_text}
- **Node:** AI_ML_SECURITY_LOG\\{\tiny PK: security_log_id}\\{\tiny FK: loan_id, transaction_id}\\{\tiny risk_type, risk_score}
- **Edge/node label:** operates 1:N
- **Edge/node label:** supervises 1:N

## Figure 3.5 — `fig:usecase`

**List of Figures (aux) PDF page:** p.52

**Caption:** Use case diagram for the Crypto World Bank platform, showing interactions among four primary actors (World Bank Admin, National Bank, Local Bank Approver, Borrower) across 29 identified use cases, including registration, loan request, approval workflow, and repayment.

**Actors (left):** **National Bank**, **World Bank Admin**, **Bank Approver (Local Bank)**, **Borrower**.

**National Bank (teal):** Register local bank; Set bank approver; Add bank user; View local bank portfolio; Lend to local bank (includes **Borrow from World bank**); Borrow from World bank.

**AI/ML Security (pink):** View risk dashboard; View anomaly alerts — used by National Bank and World Bank Admin.

**World Bank Admin (light blue):** Register national bank; Lend to national bank; View all statistics; Pause / unpause system; Emergency withdraw; Review security logs.

**Loan lifecycle — approver (orange):** Reject loan; Approve loan; Review loan requests; Review income proof; View AI/ML fraud scores; View XAI explanations. **Reject** and **Approve** include **Review loan requests**; **Approve** also includes **Review income proof**. **Review loan requests** includes **View AI/ML fraud scores** and **View XAI explanations**.

**Borrower-facing blocks:** **Communication** — Chat with borrower (Bank Approver, includes **Connect Wallet**); Use AI chatbot (Borrower, includes **Query loan data** and **Connect Wallet**); Chat with bank (Borrower, includes **Connect Wallet**). **Finance & data** — Deposit to reserve; View borrowing limit; View market data; Generate QR code (Borrower and National Bank; each includes **Connect Wallet**). **Loan lifecycle — borrower** — Pay installment (includes **Check borrowing limit**, **Connect Wallet**); Request Loan (includes **Upload income proof**, **Connect Wallet**); View my loans (includes **Connect Wallet**); Check borrowing limit; Upload income proof. **Wallet & onboarding** — **Connect Wallet**; **Accept Terms & Conditions** (all four actors); **Manage Profile** (all four actors).

**Relationship types:** Solid lines are actor–use-case associations; dotted **`<<include>>`** arrows mean a sub-use case is always part of the base use case.

![Figure 3.5: Use case diagram for the Crypto World Bank platform, showing interactions among four primary actors (World Bank Admin, National Bank, Local Bank Approver, Borrower) across 29 identified use cases, including registration, loan request, approval workflow, and repayment.](Documentation/Diagrams/CSE471/Usecase%20diagram.png)

**Repository file:** `Documentation/Diagrams/CSE471/Usecase diagram.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

## Figure 3.6 — `fig:act-loan`

**List of Figures (aux) PDF page:** p.53

**Caption:** Activity Diagram - Loan Request to Repayment Flow

**Flow order (ovals, rectangles, diamonds).**

Start → **Borrower Opens dApp** → **Connect Wallet: MetaMask or WalletConnect** → diamond **Wallet Connected?** — if no → **Show Connect Wallet Error** → End; if yes → **Read Wallet Address and Network ID** → **Navigate to Loan Page: Enter Amount and Purpose** → diamond **Is First-Time Borrower?** — if yes → **Upload Income Proof Document** → diamond **Income Proof Approved?** — if no → **Reject: Insufficient Verified** → End; if yes (or not first-time) → **Query Borrowing Limit: Available and 1st-year listing limit** → diamond **Amount Within Borrowing Limit?** — if no → **Reject: Limit Exceeded** → End; if yes → **Prepare Transaction: requestLoan(amount, purpose)** → **MetaMask Prompts User: Display Gas Estimate** → diamond **User Confirms Transaction?** — if no → **Transaction Cancelled** → End; if yes → **Sign and Broadcast Transaction to Polygon Network** → **Smart Contract Validation and Execution** (checks amount positive, available self velocity, collective balance; creates Loan object; **emit LoanRequested**) → diamond **Transaction Successful?** — if no → **Show Error: Tx Failed** → End; if yes → **Display Success: Loan Requested, Show Tx Hash** → **Event Listener Detects LoanRequested Event** (store in DB; trigger **ASML Risk Assessment**). Framed **risk analysis** region: **View Pending Loans with All Risk Scores and Risk Explanations** → diamond **Approve or Reject?** — Reject path → **Sign rejection: Record Reason, Notify Borrower** → End; Approve path → **Sign approval: join via Approve-Helper** → **Smart Contract** (verify approver role, loan pending, balance; transfer ETH to borrower; **emit LoanApproved**) → diamond **Loan Amount at least 200 ETH?** — if yes → **Generate Installment Plan: N installments with due dates**; if no → **Single Payment Due by Deadline** → **Borrower Receives Funds in Wallet** (update borrowing limit; update transaction log) → diamond **Installment Due?** — pay path → **Pay Installment: via payInstallment(), Sign Tx** (loops until done) → **Loan Completed: Update status=inactive, emit LoanClosed** → End.

**Named calls / events:** `requestLoan(amount, purpose)`, `LoanRequested`, Approve-Helper path, `payInstallment()`, `LoanApproved`, `LoanClosed`; concepts **ASML Risk Assessment**, self velocity, collective balance, gas estimate, Tx hash, ETH, Polygon Network.

![Figure 3.6: Activity Diagram - Loan Request to Repayment Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20-%20Loan%20Request%20to%20Repayment%20Flow.png)

**Repository file:** `Documentation/Diagrams/CSE471/Activity Diagram - Loan Request to Repayment Flow.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

## Figure 3.7 — `fig:act-hierarchy`

**List of Figures (aux) PDF page:** p.54

**Caption:** Activity diagram illustrating the hierarchical capital flow from the World Bank Reserve through National Bank to Local Bank tiers, including reserve ratio checks and loan disbursement decision points.

![Figure 3.7: Activity diagram illustrating the hierarchical capital flow from the World Bank Reserve through National Bank to Local Bank tiers, including reserve ratio checks and loan disbursement decision points.](Documentation/Diagrams/CSE471/Activity%20Diagram%20Hierarchical%20Banking%20Flow.png)

**Repository file:** `Documentation/Diagrams/CSE471/Activity Diagram Hierarchical Banking Flow.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.8 — `fig:act-income`

**List of Figures (aux) PDF page:** p.55

**Caption:** Activity Diagram Income Verification Flow

![Figure 3.8: Activity Diagram Income Verification Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20Income%20Verification%20Flow.png)

**Repository file:** `Documentation/Diagrams/CSE471/Activity Diagram Income Verification Flow.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.9 — `fig:act-chat`

**List of Figures (aux) PDF page:** p.56

**Caption:** Activity Diagram Chat System Flow

![Figure 3.9: Activity Diagram Chat System Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20Chat%20System%20Flow.png)

**Repository file:** `Documentation/Diagrams/CSE471/Activity Diagram Chat System Flow.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.10 — `fig:act-aichatbot`

**List of Figures (aux) PDF page:** p.57

**Caption:** Activity Diagram AI Chatbot Interaction Flow

![Figure 3.10: Activity Diagram AI Chatbot Interaction Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20AI%20Chatbot%20Interaction%20Flow.png)

**Repository file:** `Documentation/Diagrams/CSE471/Activity Diagram AI Chatbot Interaction Flow.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.11 — `fig:act-market`

**List of Figures (aux) PDF page:** p.58

**Caption:** Activity diagram showing the market data viewing flow, in which authenticated users fetch live cryptocurrency price feeds via the off-chain API layer before interacting with loan sizing interfaces.

![Figure 3.11: Activity diagram showing the market data viewing flow, in which authenticated users fetch live cryptocurrency price feeds via the off-chain API layer before interacting with loan sizing interfaces.](Documentation/Diagrams/CSE471/activity%20diagram%20Market%20Data%20Viewing%20Flow.png)

**Repository file:** `Documentation/Diagrams/CSE471/activity diagram Market Data Viewing Flow.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.12 — `fig:act-profile`

**List of Figures (aux) PDF page:** p.59

**Caption:** Activity Diagram Profile Management Flow

![Figure 3.12: Activity Diagram Profile Management Flow](Documentation/Diagrams/CSE471/Activity%20Diagram%20Profile%20Management%20Flow.png)

**Repository file:** `Documentation/Diagrams/CSE471/Activity Diagram Profile Management Flow.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.13 — `fig:dfd-context`

**List of Figures (aux) PDF page:** p.60

**Caption:** Dataflow Diagram (Context Diagram Level - 0)

![Figure 3.13: Dataflow Diagram (Context Diagram Level - 0)](Documentation/Diagrams/CSE471/Dataflow%20Diagram%20%28Context%20Diagram%20Level%20-%200%29.png)

**Repository file:** `Documentation/Diagrams/CSE471/Dataflow Diagram (Context Diagram Level - 0).png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.14 — `fig:dfd-level1a`

**List of Figures (aux) PDF page:** p.60

**Caption:** Level-1 data flow diagram decomposing the core lending subsystem, showing input/output data flows among borrowers, approvers, the smart contract layer, the PostgreSQL database, and the AI/ML monitoring service.

**Zones:** Supporting services (top left), core loan processing (middle left), extended services (bottom right), data stores (bottom row), external entities (Borrower, Bank Approver, Coinbase API; also World Bank Admin and National Bank).

**External flows:** **Coinbase API** → **Price data** → process **7.0 Fetch & Cache Market Data** → **Cached Price data** → store **D10: MARKET_DATA**. **Borrower** sends **Amount, Purpose, Wallet Address** to **1.0 Process Loan Request**; **Income proof documents** to **11.0 Process Income Verification**; **send message** to **13.0 Manage Chat Communication**; receives **chatbot questions** and **AI responses** from **14.0 AI chatbot service**; **profile updates** / **profile data, Preferences** from **12.0 Manage User Profiles**; **verification status** from **11.0**; **receive message, Read status** from **13.0**. **Bank Approver** receives **Pending Loans + Risk scores** from **2.0 Manage Loan Lifecycle**; **Review Income Proofs** from **11.0**; **Profile Updates** from **12.0**; sends **Approval/Rejection** to **4.0 Execute Blockchain Transaction**; **Pending Proofs** to **11.0**; **Profile Data** to **12.0**.

**Core chain:** **1.0** outputs **Loan data** to **2.0**; **2.0** sends **Risk Query** to **3.0 AI ML risk assessment**; **3.0** returns **RISK SCORE + SHAP Features** to **2.0**; **2.0** sends **Signed Transaction** to **4.0**; **4.0** outputs **Transaction Events** to **5.0 Synchronize Event Data**; **5.0** writes **Loan Record** to **D11: INSTALLMENT**, **Transaction Log** to **D2: TRANSACTION**, **Security Log** to **D3: AI_ML_SECURITY_LOG**. **2.0** also returns **Validation Result** to **1.0** and **Pending Loans + Risk scores** to the approver.

**Other processes:** **8.0 Manage Bank Hierarchy & System Controls**; **9.0 Calculate Borrowing Limits** reads **History data** from **D11: INSTALLMENT**, writes **Limit data** to **D8: BORROWING_LIMIT**. **11.0** writes **Hashed document** to **D7: INCOME_PROOF**, **Borrower Proof Link** to **D5: BORROWER**, etc. **12.0** touches **D7**, **D9: PROFILE_SETTINGS**, **D5**. **13.0** reads **D9**, writes **D6: CHAT_MESSAGE**, queries **D1: LOAN_REQUEST**. **14.0** reads/writes **D6**, **D4: AI_CHATBOT_LOG**, reads **D8**, **D1**.

**Data stores on the diagram:** D10, D11, D2, D3, D8, D7, D5, D9, D1, D6, D4 (each label as printed on the cylinder).

![Figure 3.14: Level-1 data flow diagram decomposing the core lending subsystem, showing input/output data flows among borrowers, approvers, the smart contract layer, the PostgreSQL database, and the AI/ML monitoring service.](Documentation/Diagrams/CSE471/Data%20flow%20diagram%20%28level%20-%201%29.png)

**Repository file:** `Documentation/Diagrams/CSE471/Data flow diagram (level - 1).png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

## Figure 3.15 — `fig:dfd-level1b`

**List of Figures (aux) PDF page:** p.60

**Caption:** Level-1 data flow diagram (continued) covering the deposit mobilization, interbank lending, and FX conversion subsystems, with data stores for on-chain state and off-chain analytics.

![Figure 3.15: Level-1 data flow diagram (continued) covering the deposit mobilization, interbank lending, and FX conversion subsystems, with data stores for on-chain state and off-chain analytics.](Documentation/Diagrams/CSE471/dataflow%20diagram%202%20%28level%20-1%29.png)

**Repository file:** `Documentation/Diagrams/CSE471/dataflow diagram 2 (level -1).png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.16 — `fig:seq-loan`

**List of Figures (aux) PDF page:** p.61

**Caption:** Sequence Diagram 1 Loan Request, AI Risk Check, and Approval Decision

![Figure 3.16: Sequence Diagram 1 Loan Request, AI Risk Check, and Approval Decision](Documentation/Diagrams/CSE471/Sequence%20Diagram%201%20Loan%20Request%2C%20AI%20Risk%20Check%2C%20and%20Approval%20Decision.png)

**Repository file:** `Documentation/Diagrams/CSE471/Sequence Diagram 1 Loan Request, AI Risk Check, and Approval Decision.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.17 — `fig:seq-reject`

**List of Figures (aux) PDF page:** p.61

**Caption:** Sequence Diagram 1B Reject Path - alt Reject

**Context:** Fragment **alt [Reject]** continuing from Sequence Diagram 1 after step 35.

**Lifelines (left to right):** Approver UI; Approver Wallet; **LocalBank.sol**; Polygon PoS; Backend API; Frontend / Borrower.

**Message order:** **36b** Approver UI: user clicks **Reject**, reason example **High fraud risk**. **37b** Approver Wallet: sign **`rejectLoan(5, High fraud risk)`** toward **LocalBank.sol**. **38b** contract: **`require(onlyApprover)`**. **39b** contract: **`require(status == Pending)`**. **40b** **`loan.status = Rejected`**. **41b** **`loan.rejectedAt = block.timestamp`**. **42b** **`emit LoanRejected(5, borrower, 50, High fraud risk)`** to Polygon PoS. **43b** event listener on Backend API detects event. **44b** **`UPDATE LOAN_REQUEST`** setting **`status = rejected`**, **`rejected_reason = High fraud risk`**. **45b** push notification to borrower frontend. **46b** UI displays final loan state to borrower.

![Figure 3.17: Sequence Diagram 1B Reject Path - alt Reject](Documentation/Diagrams/CSE471/Sequence%20Diagram%201B%20Reject%20Path%20-%20alt%20Reject.png)

**Repository file:** `Documentation/Diagrams/CSE471/Sequence Diagram 1B Reject Path - alt Reject.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

## Figure 3.18 — `fig:seq-installment`

**List of Figures (aux) PDF page:** p.62

**Caption:** Sequence Diagram 2 Installment Payment Loop

**Lifelines:** Borrower; Frontend; MetaMask; **LocalBank.sol**; Polygon PoS; Backend API.

**Setup:** 1 Borrower opens My Loans. 2 Frontend calls Backend **`GET /loans/active` + installments**. 3 Backend returns loan list with schedule. 4 Frontend shows progress **X of Y paid**.

**Loop `[For each installment until loan is fully repaid]`:** 5 Select next due installment. 6 Click Pay Installment. 7 Frontend prepares unsigned **`payInstallment(loanId, installmentNo)`** for MetaMask. 8 MetaMask popup (example amount/gas text on diagram). 9 User confirms. 10 Sign and broadcast to **LocalBank.sol**. Internal steps **11–14:** `require` installment exists and status pending; `require(msg.value == installmentAmount)`; mark installment paid; **`totalRepaid += amount`**. 15 **`emit InstallmentPaid(loanId, number, amount)`** on Polygon. 16 Event listener on Backend. **17–18:** `UPDATE INSTALLMENT` status paid; `INSERT INTO TRANSACTION`. 19 Tx confirmed to Frontend. 20 Borrower sees installment paid and updated **X of Y**.

**Optional `[All installments paid]`:** **21** `loan.status = Repaid` in contract. **22** **`emit LoanFullyRepaid(loanId, borrower)`**. **23** Event detected. **24–25** Backend `UPDATE LOAN_REQUEST` repaid; **`UPDATE BORROWING_LIMIT (increase)`**. **25** notify borrower loan fully repaid.

![Figure 3.18: Sequence Diagram 2 Installment Payment Loop](Documentation/Diagrams/CSE471/Sequence%20Diagram%202%20Installment%20Payment%20Loop.png)

**Repository file:** `Documentation/Diagrams/CSE471/Sequence Diagram 2 Installment Payment Loop.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

## Figure 3.19 — `fig:seq-income`

**List of Figures (aux) PDF page:** p.62

**Caption:** Sequence Diagram 3 Income Verification

**Lifelines (left to right):** Borrower; Frontend; FastAPI; PostgreSQL; FileStorage; BankApprover.

**Phase 1 — upload:** 1 Open Income Verification page. 2 Frontend **`GET /income-proof/status (borrower_id)`** to FastAPI. 3 FastAPI queries **`INCOME_PROOF`**. 4–5 Return verification status to borrower UI. 6 Show upload form when no verified proof. 7 Select file and upload. 8 Client-side validation (type, size ≤ 5MB). 9 **`POST /income-proof/upload (file, borrower_id)`**. 10 Server-side validation and **SHA-256** hash. 11 Store **encrypted** file in FileStorage. 12 Return **`file_path`**. 13 **`INSERT INTO INCOME_PROOF`** with **status = pending**. 14–16 Confirm and show **Pending Review** to borrower.

**Phase 2 — bank review (yellow divider on diagram):** 17 BankApprover views pending proofs. 18 **`GET /income-proofs/pending`**. 19–21 Query PostgreSQL and return list. 22 Display for review. 23 Approve/Reject with notes. 24 **`PATCH /income-proof/id (status, notes)`**. 25 **`UPDATE INCOME_PROOF`** set status, **`reviewed_by`**, **`reviewed_at`**. 26–28 Confirm update and show confirmation to approver.

![Figure 3.19: Sequence Diagram 3 Income Verification](Documentation/Diagrams/CSE471/Sequence%20Diagram%203%20Income%20Verification.png)

**Repository file:** `Documentation/Diagrams/CSE471/Sequence Diagram 3 Income Verification.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

## Figure 3.20 — `fig:seq-chat`

**List of Figures (aux) PDF page:** p.63

**Caption:** Sequence Diagram 4 Chat System

![Figure 3.20: Sequence Diagram 4 Chat System](Documentation/Diagrams/CSE471/Sequence%20Diagram%204%20Chat%20System.png)

**Repository file:** `Documentation/Diagrams/CSE471/Sequence Diagram 4 Chat System.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.21 — `fig:seq-aichatbot`

**List of Figures (aux) PDF page:** p.63

**Caption:** Sequence Diagram 5 AI Chatbot Interaction

![Figure 3.21: Sequence Diagram 5 AI Chatbot Interaction](Documentation/Diagrams/CSE471/Sequence%20Diagram%205%20AI%20Chatbot%20Interaction.png)

**Repository file:** `Documentation/Diagrams/CSE471/Sequence Diagram 5 AI Chatbot Interaction.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.22 — `fig:seq-hierarchy`

**List of Figures (aux) PDF page:** p.64

**Caption:** Sequence Diagram 6 Hierarchical Banking

**Lifelines (left to right):** WorldBankAdmin; Frontend; **WBReserve.sol**; Blockchain; NationalBank; **NationalBank.sol**; LocalBank; **LocalBank.sol**; Borrower.

**Disbursement phase (numbered arrows on diagram):** 1 WorldBankAdmin → Frontend: deposit funds to reserve. 2 Frontend → WBReserve: **`deposit()`** with value. 3 WBReserve → Blockchain: record transaction. 4 Blockchain dashed return confirm to WBReserve. 5 NationalBank → Frontend: request loan from World Bank. 6 Frontend → WBReserve: **`requestLoan(amount)`**. 7 WBReserve internal: check available reserve. 8 WorldBankAdmin → Frontend: approve NB loan. 9 Frontend → WBReserve: **`approveLoan(nb_address, amount)`**. 10 WBReserve → Blockchain: transfer funds to NB contract. 11 Blockchain → NationalBank.sol: receive funds. 12 LocalBank → Frontend: request loan from National Bank. 13 Frontend → NationalBank.sol: **`requestLoan(amount)`**. 14 NationalBank → Frontend: approve LB loan. 15 Frontend → NationalBank.sol: **`approveLoan(lb_address, amount)`**. 16 NationalBank internal: transfer toward LB. 17 NationalBank.sol → LocalBank.sol: on-chain transfer. 18 LocalBank.sol → Borrower: borrower receives funds.

**Repayment phase (annotation on diagram: “Repayment cascades back up”):** 19 Borrower → LocalBank.sol: **`payInstallment()`**. 20 LocalBank.sol → LocalBank: forward share. 21 LocalBank → NationalBank.sol: forward share to NB. 22 NationalBank.sol → WBReserve.sol: forward share to World Bank reserve.

![Figure 3.22: Sequence Diagram 6 Hierarchical Banking](Documentation/Diagrams/CSE471/Sequence%20Diagram%206%20Hierarchical%20Banking.png)

**Repository file:** `Documentation/Diagrams/CSE471/Sequence Diagram 6 Hierarchical Banking.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

## Figure 3.23 — `fig:seq-marketdata`

**List of Figures (aux) PDF page:** p.64

**Caption:** Sequence Diagram 7 Market Data Retrieval

![Figure 3.23: Sequence Diagram 7 Market Data Retrieval](Documentation/Diagrams/CSE471/Sequence%20Diagram%207%20Market%20Data%20Retrieval.png)

**Repository file:** `Documentation/Diagrams/CSE471/Sequence Diagram 7 Market Data Retrieval.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.24 — `fig:seq-borrowlimit`

**List of Figures (aux) PDF page:** p.65

**Caption:** Sequence Diagram 8 Borrowing Limit Calculation

![Figure 3.24: Sequence Diagram 8 Borrowing Limit Calculation](Documentation/Diagrams/CSE471/Sequence%20Diagram%208%20Borrowing%20Limit%20Calculation.png)

**Repository file:** `Documentation/Diagrams/CSE471/Sequence Diagram 8 Borrowing Limit Calculation.png`. Open the image above or the thesis PDF at full zoom to read every label on the diagram.

**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: left-to-right lifelines first, then each message in vertical time order). Follow control-flow arrows on activity diagrams from the solid initial node through decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each labeled arrow between external entities, processes (numbered bubbles), and data stores.

## Figure 3.25 — `fig:four-tier`

**List of Figures (aux) PDF page:** p.65

**Caption:** Four-tier hierarchical capital flow with cascading repayment.

**TikZ — text extracted from source:**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)

## Figure 4.1 — `fig:agile-process`

**List of Figures (aux) PDF page:** p.74

**Caption:** Agile/Scrum process flow: standard flowchart notation showing the sprint cycle from Product Backlog through Planning, Development (2--3 weeks), Weekly Sync, Sprint Review, Retrospective, and Potentially Shippable Increment, with a feedback loop back to the Product Backlog.

**TikZ — text extracted from source:**

- **Node:** **Product Backlog**

## Figure 4.2 — `fig:sprint-points`

**List of Figures (aux) PDF page:** p.77

**Caption:** Sprint story-point distribution: (a) 155 total points across three sprints; (b--d) per-sprint breakdown by epic. Proportions match the sprint backlog tables.

**TikZ — text extracted from source:**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)

## Figure 4.3 — `fig:methodology-technical`

**List of Figures (aux) PDF page:** p.77

**Caption:** Technical development methodology: swimlane view of the three-sprint plan across four technology layers (Blockchain/Solidity, Frontend/React, Backend/Express, AI/ML/FastAPI). Green cells indicate implemented and testnet-verified components; white cells indicate planned work.

**TikZ — text extracted from source:**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)

## Figure 4.4 — `fig:sprint-submission`

**List of Figures (aux) PDF page:** p.81

**Caption:** Sprint submission workflow: standard flowchart showing the sequence from backlog refinement through development, code review, integration testing, sprint review, retrospective, and final deliverable submission, with rework loops for failed review and test gates.

**TikZ — text extracted from source:**

- **Edge/node label:** Yes
- **Edge/node label:** Yes
- **Edge/node label:** No
- **Edge/node label:** No

## Figure 4.5 — `fig:sdlc-mapping`

**List of Figures (aux) PDF page:** p.83

**Caption:** SDLC stage mapping: the seven standard software development life cycle stages (right) mapped to project activities and deliverables (left), with an iteration arrow indicating the Agile feedback loop across all stages.

**TikZ — text extracted from source:**

- **Node:** 1.\ Planning \&\\Requirements Analysis
- **Node:** 2.\ Defining\\Requirements (SRS)
- **Node:** 3.\ Designing\\Architecture
- **Node:** 4.\ Development\\(Coding)
- **Node:** 5.\ Testing
- **Node:** 6.\ Deployment
- **Node:** 7.\ Maintenance
- **Node:** Feasibility studies; professor meetings;\\BCOLBD 2025 guideline review
- **Node:** System analysis (CSE471); 29 use cases;\\user stories US-1.x to US-3.x
- **Node:** Three-layer architecture; DB schema\\(15 tables, 3NF); ERD; DFD
- **Node:** Solidity; React/TypeScript; FastAPI/Python;\\AI/ML models (RF, IF, SHAP)
- **Node:** Hardhat unit tests (12+);\\frontend integration; AI/ML evaluation
- **Node:** Polygon Amoy / Ethereum Sepolia;\\Vercel + Render
- **Node:** Monitoring; model retraining;\\bug fixes; feature iteration
- **Edge/node label:** Iteration

## Figure 4.6 — `fig:design-decisions`

**List of Figures (aux) PDF page:** p.85

**Caption:** Design decisions and alternatives: Panel A shows AI/ML component selections (fraud detection, anomaly detection, explainability); Panel B shows technology stack selections (frontend, smart contract platform, database, UI framework). Blue-filled nodes represent selected first choices; outlined nodes represent evaluated alternatives.

**TikZ — text extracted from source:**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)

## Figure 5.1

**List of Figures (aux) PDF page:** p.102

**Caption:** Annual revenue projection by tier (USD millions, at \$2{,}500/ETH conservative mid-point).

**TikZ — text extracted from source:**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)

## Figure 5.2

**List of Figures (aux) PDF page:** p.103

**Caption:** Hierarchical interest rate spread (APR) across the four-tier lending structure.

**TikZ — text extracted from source:**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)

## Figure A.1 — `fig:local-llm-mermaid`

**List of Figures (aux) PDF page:** p.113

**Caption:** Compact Mermaid source for the local LLM path (full detail: optionalAuth, featureKey prompts, and upstream URL live in the project repository).


## Figure A.2 — `fig:local-llm-tikz`

**List of Figures (aux) PDF page:** p.113

**Caption:** Local LLM assistant data flow: browser UI streams from the CWB API, which proxies to a local OpenAI-compatible model server. The path is the same in principle for both landing and in-app UIs, with optional user context when authenticated.

**TikZ — text extracted from source:**

(TikZ present; see `Pre-thesis_v10.tex` for full source.)


---

## PDF layout extraction (QC)

Companion plain-text (layout-preserving) extraction: [`Pre-thesis_v10_pdftext_layout.txt`](Pre-thesis_v10_pdftext_layout.txt) (generated alongside this Markdown via `pdftotext -layout` on `Pre-thesis_v10.pdf`). Use it to spot-check hyphenation and line breaks against pandoc’s reflow in the sections above.
