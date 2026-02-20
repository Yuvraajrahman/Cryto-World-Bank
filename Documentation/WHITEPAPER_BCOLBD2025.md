# Decentralized Crypto World Bank: A Blockchain-Based Hierarchical Lending Platform with AI-Enhanced Security

**by**

Md. Bokhtiar Rahman Juboraz (20301138)  
Md. Mahir Ahnaf Ahmed (20301083)

A thesis submitted to the Department of Computer Science and Engineering  
in partial fulfillment of the requirements for the degree of  
B.Sc. in Computer Science

**Department of Computer Science and Engineering**  
**Brac University**  
**February 2026**

**Supervisor:** Mr. Annajiat Alim Rasel, Senior Lecturer, Department of Computer Science and Engineering, Brac University

---

> **Formatting Compliance:** This document also adheres to BCOLBD 2025 mandatory criteria: ≤20 pages including appendices; Calibri / Times New Roman / Arial, 11 pt, single line spacing; contents in English.

---

## Abstract

International development finance relies on multi-tiered institutional hierarchies—from supranational reserves to national intermediaries to local disbursement entities—to coordinate the flow of capital across borders. These conventional systems, while providing governance and risk management, suffer from limited transparency, protracted settlement cycles, and opaque decision-making processes that erode stakeholder trust.

This whitepaper presents the **Crypto World Bank**, a decentralized application (DApp) that replicates the hierarchical lending model of traditional development finance institutions on a public Ethereum Virtual Machine (EVM) blockchain. The platform enforces a four-tier capital flow (World Bank → National Banks → Local Banks → Borrowers) through a suite of auditable smart contracts, while augmenting loan approval workflows with an off-chain AI/ML security layer for fraud detection, anomaly identification, and explainable risk assessment.

We demonstrate that blockchain technology is uniquely suited to this domain because the underlying challenge is fundamentally one of **multi-party trust and coordination**—a class of problems for which distributed ledger technology provides superior guarantees over conventional centralized architectures. The document further presents the target market, partnership ecosystem, competitive landscape, risk profile, system architecture, governance framework, and a phased go-to-market strategy.

**Keywords:** Blockchain, Decentralized Finance, Hierarchical Lending, Smart Contracts, AI/ML Security, Fraud Detection, Explainable AI, Governance, Development Finance

---

## I. Literature Review

The design of the Crypto World Bank is informed by a comprehensive review of 17 peer-reviewed papers spanning seven domains. Full detailed reviews (Abstract, Introduction, Motivation, Methodology, Results, Conclusion) for all papers are available in the project documentation repository.

**Decentralized Lending and DeFi Protocols.** Werner et al. [10] systematize DeFi protocol design in their SoK paper, identifying that existing lending platforms are uniformly pool-based and over-collateralized, lacking institutional hierarchy—a gap this project directly addresses. Bastankhah et al. [1] introduce an adaptive, data-driven DeFi lending protocol with a dual fast/slow control architecture, demonstrating that dynamic interest rate adjustment significantly outperforms static utilization curves used by Aave and Compound. An IEEE evaluation framework [9] provides standardized metrics for assessing protocol capital efficiency, risk management, and governance quality, revealing that higher capital efficiency correlates with higher risk exposure.

**ML Fraud Detection in Blockchain.** Palaiokrassas et al. [2] leverage ML for multichain DeFi fraud detection across 23 protocols (54M+ transactions), demonstrating that DeFi-specific behavioral features improve XGBoost and Neural Network classifiers to F1-scores of 0.76–0.85, compared to 0.08 with transactional features alone. Agarwal et al. [3] present RiskSEA, a scalable graph embedding system deployed at Coinbase that combines node2vec embeddings with behavioral features, achieving F1: 0.851 on all 266M Ethereum addresses. Rahouti et al. [16] survey ML approaches for Bitcoin security, finding Random Forest achieves 94%+ precision—supporting its selection as the primary fraud detection model in this system.

**Explainable AI in Lending.** Adom et al. [4] provide a direct comparison of LIME and SHAP on loan approval systems, finding SHAP provides deeper, more consistent feature attributions via Shapley values, while LIME offers faster runtime. Lundberg and Lee [11] introduce the SHAP framework itself, providing the theoretical foundation (local accuracy, missingness, consistency properties) that this system adopts for generating explainable loan risk assessments. Bracke et al. [17] apply SHAP to credit default models in a Bank of England regulatory context, demonstrating that SHAP feature attributions align with domain expert expectations and satisfy regulatory explainability requirements.

**Reinforcement Learning for Lending Policy.** Qu et al. [5] apply offline RL (CQL, BC, TD3-BC) to optimize Aave interest rates using historical data, with TD3-BC demonstrating superior performance during stress events (May 2021 crash, March 2023 USDC depeg). Kiatsupaibul et al. [6] formulate credit underwriting as an MDP, showing RL-based approaches discover superior underwriting policies compared to traditional greedy (static threshold) methods—validating our planned DQN/PPO modules for adaptive borrowing limits.

**CBDC and Financial Inclusion.** Tan [7] develops an IMF model showing CBDCs in developing countries can bank large unbanked populations through a two-tier distribution model (central bank → commercial banks → users) that directly parallels our four-tier hierarchy. Mhlanga [8] demonstrates through systematic review that blockchain technology facilitates financial inclusion across transactions, savings, credit provision, and insurance—supporting the Crypto World Bank's mission of transparent, programmable lending for underserved populations.

**Smart Contract Security and Governance.** Atzei et al. [13] catalog Ethereum smart contract attack vectors (reentrancy, integer overflow, access control), directly informing our use of OpenZeppelin's ReentrancyGuard and Solidity 0.8.20 overflow protection. Tolmach et al. [15] survey 42 formal verification tools, recommending multi-tool approaches combining static analysis (Slither) and symbolic execution (Mythril). Beck et al. [14] propose a three-dimensional blockchain governance framework (IT, network, business) that maps directly to our three-pillar governance structure. Liu et al. [12] introduce Isolation Forest for unsupervised anomaly detection—adopted as our secondary detection model for wallet behavior analysis where labeled fraud data is scarce.

**Identified Gaps.** Across these 17 papers, four gaps motivate the Crypto World Bank: (1) no hierarchical institutional model exists in DeFi lending [10, 1, 9]; (2) limited integration of AI/ML security analytics with DeFi lending [2, 3, 16]; (3) insufficient explainability in automated lending decisions [4, 11, 17]; and (4) inadequate governance frameworks for multi-tier decentralized finance systems [14].

---

## II. Problem Statement and Proposed Solution

### A. Problem Formulation

The global development finance ecosystem is characterized by a hierarchical topology in which supranational entities (e.g., the World Bank, International Monetary Fund) allocate capital to sovereign national institutions, which in turn disburse funds to regional and local banking entities, ultimately reaching end-user borrowers. This multi-layered intermediation introduces several systemic inefficiencies:

1. **Opacity of ledger state.** Internal bookkeeping across tiers is not publicly auditable. Stakeholders at lower tiers have limited visibility into reserve adequacy, approval criteria, and fund utilization at higher tiers.

2. **Settlement latency.** Cross-border capital transfers between tiers involve multiple intermediaries, compliance checkpoints, and reconciliation processes, resulting in settlement periods ranging from days to weeks.

3. **Manual risk assessment.** Creditworthiness evaluation and fraud detection are predominantly human-driven, introducing inconsistency, bias, and scalability constraints.

4. **Trust deficit.** The effort required to establish inter-institutional trust through legal agreements, audit engagements, and compliance certifications constitutes a significant overhead that disproportionately affects smaller institutions and borrowers in developing economies.

Simultaneously, the Decentralized Finance (DeFi) ecosystem has demonstrated that smart contract platforms can automate lending, collateral management, and interest computation with full transparency. However, existing DeFi protocols (e.g., Aave, Compound, MakerDAO) exhibit fundamental limitations in this context:

- They employ **peer-to-pool** or **over-collateralized** lending models that do not accommodate institutional hierarchies.
- They lack integration with **AI-driven risk analytics** and **explainable decision support** systems.
- They do not model **role-based, tiered governance** analogous to development finance institutions.

### B. Blockchain Justification

The problem described above is fundamentally a **multi-party coordination and trust challenge** involving disparate institutions with potentially misaligned incentives. We assert that blockchain technology addresses this class of problems more effectively than any conventional alternative for the following reasons:

1. **Trust minimization through consensus.** Distributed consensus mechanisms ensure that no single party can unilaterally alter the ledger state, eliminating the need for a trusted central operator.

2. **Programmable enforcement.** Smart contracts codify lending rules—borrowing limits, installment schedules, approval workflows—as deterministic, self-executing programs, reducing reliance on manual processes and bilateral agreements.

3. **Cryptographic auditability.** All state transitions are recorded in an immutable, publicly verifiable transaction log, enabling real-time auditing by regulators, partners, and borrowers without requiring costly third-party engagements.

4. **Composable incentive structures.** On-chain reputation systems, governance tokens, and programmable fee distributions can align incentives across all network participants.

A conventional cloud-hosted database infrastructure would necessitate a trusted central operator to maintain ledger integrity, enforce access control, and provide audit guarantees—reintroducing the very trust dependencies that the hierarchical lending model seeks to mitigate. Blockchain eliminates this single point of trust failure.

### C. Proposed Solution

The Crypto World Bank implements a **four-tier, on-chain hierarchical lending architecture**:

- **Tier 1 — World Bank:** Maintains the global crypto reserve. Allocates capital to registered National Banks through smart contract-mediated lending operations.
- **Tier 2 — National Banks:** Borrow from the World Bank reserve. Lend to registered Local Banks within their jurisdiction. Aggregate risk exposure at the national level.
- **Tier 3 — Local Banks:** Borrow from National Banks. Process loan requests from individual borrowers. Employ designated approvers for loan lifecycle management.
- **Tier 4 — Borrowers:** Submit loan requests to Local Banks. Repay through configurable installment schedules. Accumulate on-chain repayment history that informs future borrowing limits.

The platform further integrates:

- **Risk-aware borrowing limits** computed from rolling 6-month and 1-year transaction windows.
- **Automatic installment generation** for loan amounts exceeding a configurable threshold (e.g., 100 ETH equivalent).
- **Off-chain AI/ML security analytics** for fraud detection (Random Forest), anomaly identification (Isolation Forest), and explainable risk assessment (SHAP).

---

## III. Market Analysis and Partnership Ecosystem

### A. Market Sizing

| Segment | Description | Estimated Scale |
|---------|-------------|-----------------|
| **Total Addressable Market (TAM)** | Global decentralized lending market; DeFi lending TVL has historically exceeded $50B | $50B+ |
| **Serviceable Addressable Market (SAM)** | Institutional and semi-institutional lending requiring hierarchical structures: development banks, microfinance networks, credit cooperatives | $5–10B |
| **Serviceable Obtainable Market (SOM)** | Pilot deployments in regulatory sandboxes, academic prototypes, and NGO-backed microfinance programs in blockchain-friendly jurisdictions (e.g., Bangladesh, UAE, Singapore) | $50–200M |

The market for **transparent, hierarchy-preserving decentralized lending** is presently unaddressed by existing DeFi protocols, which universally adopt flat, pool-based architectures. This represents a significant whitespace opportunity.

### B. Target Customer Segment

The Crypto World Bank targets the **retail customer segment** — individual borrowers and small businesses seeking transparent, accessible crypto-based lending services.

| Characteristic | Description |
|----------------|-------------|
| **Primary Users** | Individual retail borrowers seeking personal or small business loans |
| **Geographic Focus** | Developing economies with limited traditional banking access (e.g., Bangladesh, Southeast Asia, Sub-Saharan Africa) |
| **Loan Size Range** | Micro to mid-range: 0.1 ETH – 500 ETH equivalent (~$200 – $1,000,000 at current rates) |
| **User Profile** | Digitally literate individuals with cryptocurrency wallet access; small business owners; gig-economy freelancers |
| **Key Pain Points** | High interest rates from informal lenders; lack of credit history in traditional systems; exclusion from banking due to documentation barriers |

**Why Retail:** The retail segment represents the largest underserved population in developing economies. According to the World Bank's Global Findex Database, approximately 1.4 billion adults remain unbanked, with the majority concentrated in developing countries. By targeting retail customers, the platform maximizes financial inclusion impact while generating the transaction volume necessary to sustain the lending ecosystem. The hierarchical banking model (World Bank → National → Local → Borrower) mirrors how traditional microfinance institutions reach retail customers in underserved regions, but with blockchain-enforced transparency and AI-enhanced risk assessment.

### C. Partner Ecosystem

The successful deployment and operation of the Crypto World Bank requires collaboration with the following ecosystem participants:

| Partner Category | Functional Role | Blockchain-Mediated Incentive |
|------------------|-----------------|-------------------------------|
| **Financial Regulators** | Regulatory sandbox approval; compliance oversight | Reduced enforcement cost through on-chain transparency and audit trails |
| **Banking Institutions** | Network membership as National/Local Banks | Access to diversified global reserve; reduced inter-bank settlement friction |
| **Payment Gateway Providers** | Fiat-to-crypto on-ramp and off-ramp services | Volume-based transaction fees; expanded market reach |
| **Academic and Research Institutions** | Validation of AI/ML models; publication of research findings | Access to anonymized datasets; collaborative research opportunities |
| **Non-Governmental Organizations** | Pilot deployment; field testing with underserved borrower populations | Transparent, low-friction credit access for beneficiaries |

### D. Incentive Alignment Through the Blockchain Platform

Partner incentives are allocated and enforced through the blockchain platform itself:

- **Immutable repayment records** serve as on-chain reputation signals, enabling data-driven credit decisions without third-party credit bureaus.
- **Transparent reserve verification** allows partners to independently confirm that allocated capital is deployed as committed.
- **Programmable fee structures** (future extension) distribute transaction fees proportionally to network participants based on their contribution to lending volume and governance.

---

## IV. Competitive Landscape and Risk Assessment

### A. Direct Competition

| Competitor Category | Representative Examples | Crypto World Bank Differentiation |
|--------------------|------------------------|-----------------------------------|
| DeFi lending protocols | Aave, Compound, MakerDAO | Hierarchical four-tier institutional model; integrated AI/ML risk layer; role-based governance |
| Traditional development finance | World Bank, IFC, ADB | On-chain transparency; programmable enforcement; near-instant settlement |
| Blockchain-native credit platforms | Centrifuge, Maple Finance, Goldfinch | Combined hierarchy and AI security; designed for institutional adoption |

### B. Indirect Competition

- **Central Bank Digital Currencies (CBDCs):** Emerging CBDC frameworks may address settlement efficiency but do not provide decentralized lending capabilities. The Crypto World Bank positions as a complementary **lending layer** operating on top of digital asset infrastructure.
- **Peer-to-peer lending platforms:** Predominantly fiat-denominated and centralized; the Crypto World Bank targets crypto-native and hybrid institutional use cases.

### C. Risk Taxonomy and Mitigation Strategy

| Risk Category | Description | Severity | Mitigation |
|---------------|-------------|----------|------------|
| **Partner non-cooperation** | Key ecosystem partners decline to participate | Medium | Initiate with low-barrier academic and NGO pilots; minimize switching costs |
| **Incentive misalignment** | Participant incentives diverge from network objectives | Medium | Codify rules in smart contracts; implement governance token alignment (future) |
| **Smart contract vulnerability** | Exploit in contract logic (reentrancy, overflow) | High | OpenZeppelin security primitives (ReentrancyGuard, Ownable); formal audit (planned); pause mechanism |
| **Regulatory adversity** | Jurisdictional restrictions on crypto lending | Medium | Operate exclusively on testnets during prototype phase; engage regulatory sandbox programs |
| **Market adoption failure** | Insufficient user or institutional traction | Low | Leverage academic and competition channels; open-source codebase for community contribution |
| **AI/ML model degradation** | Fraud detection accuracy decays over time | Low | Continuous model retraining pipeline; human-in-the-loop review; explainability via SHAP |

### D. Comparative Advantage

- **Value delivery superiority:** Blockchain-enforced transparency eliminates reconciliation overhead; AI/ML augments human judgment with data-driven risk scores.
- **Performance superiority:** Sub-minute transaction confirmation on EVM Layer-2 networks (Polygon) versus multi-day settlement in traditional development finance.

---

## V. System Architecture and Governance Framework

### A. High-Level Architecture

The system employs a **three-layer decentralized application architecture**:

```
┌───────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                            │
│  React 18 · TypeScript · Material Design 3 · Wagmi · Viem     │
│  Modules: Dashboard, Deposit, Loan, Admin, Risk AI, QR        │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  SMART CONTRACT LAYER (EVM: Ethereum / Polygon)                │
│  World Bank Reserve · National Bank · Local Bank Contracts     │
│  Operations: Reserve Mgmt, Hierarchical Lending, Loan          │
│  Lifecycle, Access Control, Emergency Controls                 │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  OFF-CHAIN SERVICES LAYER                                      │
│  PostgreSQL (Relational DB) · FastAPI (REST API)               │
│  AI/ML: Random Forest (Fraud) · Isolation Forest (Anomaly)     │
│  SHAP (Explainability) · Event Listener · Cache (Redis)        │
└───────────────────────────────────────────────────────────────┘
```

### B. Blockchain Platform Selection

| Criterion | Selection | Justification |
|-----------|-----------|---------------|
| **Platform** | Ethereum Virtual Machine (EVM) | Largest developer ecosystem; battle-tested security model; extensive tooling (Hardhat, OpenZeppelin, Wagmi) |
| **Network** | Polygon Mumbai / Ethereum Sepolia (testnets) | Zero-cost deployment; production-equivalent behavior; free faucet access |
| **Consensus** | Proof-of-Stake (PoS) via Polygon validators | Energy-efficient; sub-2-second block finality on Polygon; decentralized validator set |
| **Smart contract language** | Solidity 0.8.20 | Industry standard; mature compiler with overflow protection; rich library ecosystem |

### C. Transaction Verification and Consensus

- **Polygon PoS:** Transactions are validated by a decentralized set of PoS validators. Block finality is achieved within approximately 2 seconds. Checkpoints are periodically committed to Ethereum mainnet for additional security.
- **On prototype testnets:** Mumbai and Sepolia employ analogous consensus models with no financial cost, enabling iterative development and testing.

### D. On-Chain and Off-Chain Data Partitioning

| Data Category | Storage Location | Rationale |
|---------------|------------------|-----------|
| Reserve balances, loan requests, approval/rejection events, repayment transactions | **On-chain** | Immutability, public auditability, trustless verification |
| User profiles, income verification documents, chat messages, AI/ML inference logs | **Off-chain (PostgreSQL)** | Data privacy, query flexibility, storage cost optimization |
| Borrowing limit computations | **Off-chain with on-chain enforcement** | Complex temporal aggregation logic; results committed as on-chain constraints |
| Cryptocurrency market data | **Off-chain (cached)** | High-frequency updates; external API dependency |

### E. Data Model

The relational database schema comprises 15 normalized entities in Third Normal Form (3NF):

**Core hierarchy:** `WORLD_BANK`, `NATIONAL_BANK`, `LOCAL_BANK`, `BANK_USER`, `BORROWER`
**Lending lifecycle:** `LOAN_REQUEST`, `INSTALLMENT`, `TRANSACTION`, `BORROWING_LIMIT`
**Communication:** `CHAT_MESSAGE`
**AI/ML and security:** `AI_CHATBOT_LOG`, `AI_ML_SECURITY_LOG`
**Supporting:** `INCOME_PROOF`, `MARKET_DATA`, `PROFILE_SETTINGS`

A comprehensive Entity-Relationship Diagram (ERD) is maintained in the project documentation repository.

### F. Digital Identity System

- **Wallet-based identity:** Users authenticate via Ethereum wallet signatures (MetaMask, WalletConnect). No centralized credential store is required.
- **Role binding:** Wallet addresses are mapped to hierarchical roles (Owner, National Bank, Local Bank, Approver, Borrower) within the smart contract permission system.

### G. Integration with Legacy Systems

- **Current:** Standard Web3 wallet integration (MetaMask browser extension, WalletConnect mobile protocol).
- **Planned:** Fiat on-ramp/off-ramp via payment gateway APIs; KYC/AML compliance via external identity verification providers.

### G.1 Auxiliary Dual-Currency Facility

The Crypto World Bank's cryptocurrency exchange capability is designed as an **auxiliary facility** integrated into existing banking infrastructure worldwide. Rather than operating as a standalone exchange, the platform extends the services of participating banks by enabling a **dual-currency feature**—allowing eligible bank customers to transact in both fiat and cryptocurrency within their existing banking relationship.

- **Integration model:** The dual-currency facility is offered by all participating banks (World Bank, National Banks, and Local Banks) as an add-on service to their existing product portfolio. No new banking license or standalone entity is required.
- **Eligibility determination:** Eligibility for dual-currency services is determined by the bank officers who manage lending operations. These officers assess customer suitability based on existing KYC/AML compliance, account standing, and lending relationship history.
- **No defaulting of conditions:** The project does not override, modify, or default any existing banking conditions, regulatory requirements, or contractual obligations. All existing banking terms, interest rate agreements, and compliance frameworks remain fully in effect.
- **Scope:** The facility enables fiat-to-crypto and crypto-to-fiat conversions, cryptocurrency-denominated lending and repayment, and transparent on-chain transaction records—all within the governance structure of the participating bank.

This design ensures that the Crypto World Bank **complements rather than disrupts** existing financial infrastructure, reducing adoption barriers for traditional banking institutions and their customers.

### H. Regulatory Compliance Considerations

As the platform operates within the regulated banking domain:
- The prototype phase operates exclusively on **public testnets** with no real monetary value.
- The architecture supports **audit log generation** for regulatory review.
- Future production deployment would engage **regulatory sandbox programs** in target jurisdictions.

### I. Governance Framework

#### I.1 Network Membership Governance

| Governance Aspect | Implementation |
|-------------------|----------------|
| **Member on-boarding** | World Bank owner registers National Banks; National Banks register Local Banks; Local Banks designate approvers — all enforced on-chain |
| **Member off-boarding** | Deactivation flags in smart contracts; cascading access revocation |
| **Regulatory oversight** | Audit log emission via smart contract events; planned read-only regulator dashboard |
| **Permission structure** | Hierarchical: Owner → National Bank → Local Bank → Approver → Borrower; enforced by on-chain role-check modifiers |
| **Network operations** | Pause/unpause mechanism for emergency response; emergency withdrawal for critical situations |

#### I.2 Business Network Governance

| Governance Aspect | Implementation |
|-------------------|----------------|
| **Business charter** | Defined in this whitepaper; operational parameters codified in smart contract constants |
| **Common services** | Reserve management, loan lifecycle orchestration, event-driven notification system |
| **Business SLA** | Testnet phase: best-effort availability. Production phase: 99.5% target uptime with multi-region deployment |
| **Regulatory compliance** | Architecture designed for audit trail generation; data partitioning supports GDPR-style data subject requests |

#### I.3 Technology Infrastructure Governance

| Governance Aspect | Implementation |
|-------------------|----------------|
| **Distributed IT structure** | Client-side frontend (decentralized delivery); blockchain layer (fully decentralized); backend API (centralized, horizontally scalable) |
| **Technology assessment** | Continuous evaluation of EVM alternatives (L2 rollups, sidechains) for cost and performance optimization |
| **On-chain / off-chain data services** | Clearly partitioned (see Section IV.D); event listeners synchronize state between layers |
| **Risk mitigation** | Smart contract pause mechanism; ReentrancyGuard; input validation; planned formal security audit |

### J. Asset Tokenization

- **Current implementation:** Native blockchain currency (ETH/MATIC) serves as the reserve and loan denomination.
- **Planned extension:** ERC-20 stablecoin support (USDC, USDT) for USD-denominated lending operations; tokenized collateral instruments for under-collateralized lending scenarios.

### K. Transaction Economics: Gas Fees and Interest Rates

#### K.1 Gas Fee Policy

All blockchain transaction costs (gas fees) are borne by the **transaction initiator**, following standard Ethereum/Polygon network conventions:

| Transaction Type | Gas Fee Payer | Rationale |
|------------------|---------------|-----------|
| **Loan Request** | Borrower | The borrower initiates the loan request transaction |
| **Loan Approval** | Bank Approver | The approver initiates the approval transaction |
| **Loan Rejection** | Bank Approver | The approver initiates the rejection transaction |
| **Installment Payment** | Borrower | The borrower initiates each installment payment |
| **Deposit to Reserve** | Depositor | The depositor initiates the reserve contribution |
| **Bank Registration** | Registering Authority | The World Bank Admin or National Bank initiates the registration |

On **Polygon PoS** (the primary target network), gas fees are denominated in MATIC and are significantly lower than Ethereum mainnet — typically **$0.001–$0.01 per transaction**, making the platform economically viable for retail users with smaller loan amounts. This low fee structure is critical for the retail customer segment, where even small transaction costs can disproportionately affect borrower economics.

#### K.2 Interest Rate Structure

The platform implements **market-standard interest rates** aligned with prevailing DeFi lending benchmarks:

| Parameter | Value | Benchmark |
|-----------|-------|-----------|
| **Base Annual Interest Rate** | 5–12% APR | Aligned with Aave/Compound variable rates for major crypto assets |
| **Rate Determination** | Set by Local Bank approvers within World Bank-defined bounds | Configurable per-bank to reflect local market conditions |
| **Late Payment Penalty** | 2% of installment amount + 0.5% per additional week overdue (capped at 10%) | Industry-standard late fee structure |
| **Interest Calculation** | Simple interest on outstanding principal | Transparent, borrower-friendly method |
| **Rate Transparency** | All rate parameters stored on-chain as smart contract constants | Publicly auditable; no hidden fees |

Interest rates are designed to balance lending sustainability with borrower affordability. The on-chain storage of rate parameters ensures borrowers can independently verify loan terms before execution. Local Banks may adjust rates within the bounds set by the World Bank tier, allowing localized pricing that reflects regional economic conditions.

---

## VI. Methodology

### A. Development Methodology

The project adopts a **lightweight Agile/Scrum** methodology tailored for an academic prototype with a fixed two-month development window. The iterative approach enables incremental delivery of demonstrable features while accommodating evolving requirements inherent in research-oriented development.

```
┌──────────────────────────────────────────────────────────────────────┐
│                AGILE DEVELOPMENT LIFECYCLE                            │
│                     (2-Month Window)                                  │
└──────────────────────────────────────────────────────────────────────┘

  SPRINT 1 (Weeks 1–3)        SPRINT 2 (Weeks 4–6)       SPRINT 3 (Weeks 7–8)
  ┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
  │ FOUNDATION &     │        │ LENDING FEATURES │        │ AI/ML SECURITY   │
  │ CORE BANKING     │        │ & COMMUNICATION  │        │ & POLISH         │
  │                  │        │                  │        │                  │
  │ • Smart contract │───────>│ • Installment    │───────>│ • Fraud detection│
  │   development    │        │   payment system │        │   model          │
  │ • Frontend setup │        │ • Borrowing limit│        │ • Risk dashboard │
  │ • Wallet integr. │        │   enforcement    │        │   integration    │
  │ • Dashboard &    │        │ • Chat system    │        │ • Security audit │
  │   Deposit flow   │        │ • Income verif.  │        │ • Documentation  │
  │ • Database schema│        │ • Bank hierarchy │        │ • Demo prep      │
  └────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
           │                           │                           │
           ▼                           ▼                           ▼
     Sprint Review              Sprint Review              Final Demo &
     & Retrospective            & Retrospective            Competition
                                                           Submission
```

### B. Agile Sprint Plan (8-Week Schedule)

| Sprint | Duration | Goal | Key Deliverables |
|--------|----------|------|------------------|
| **Sprint 1** | Weeks 1–3 | Foundation and Core Banking | Smart contract suite (WorldBankReserve, NationalBank, LocalBank); React frontend scaffolding; wallet integration (MetaMask, WalletConnect); Dashboard and Deposit pages; database schema design (15 tables, 3NF) |
| **Sprint 2** | Weeks 4–6 | Lending Features and Communication | Loan request and approval workflow; installment payment system; borrowing limit calculation engine; borrower–bank chat; income verification upload; hierarchical bank registration flows |
| **Sprint 3** | Weeks 7–8 | AI/ML Security and Finalization | Fraud detection model (Random Forest + SHAP); risk dashboard integration; anomaly detection prototype; security audit and testing; documentation completion; demo preparation and competition submission |

### C. Sprint Deliverables Summary

**Sprint 1 — Foundation:** Smart contracts (WorldBankReserve, NationalBank, LocalBank), wallet integration, dashboard, database schema (15 tables, 3NF).

**Sprint 2 — Lending:** Loan request/approval workflow, installment payments, borrowing limits, borrower–bank chat, income verification, hierarchical bank registration.

**Sprint 3 — AI/ML and Polish:** Fraud detection (Random Forest + SHAP), risk dashboard, anomaly detection, security audit, documentation. The full user story backlog (US-1.1 through US-3.12) is in the [CSE470 Software Engineering](https://github.com/Yuvraajrahman/Cryto-World-Bank/blob/main/Documentation/CSE470_SOFTWARE_ENGINEERING.md) document.

### D. SDLC Stage Mapping

The project maps to the seven stages of the Software Development Life Cycle (SDLC) as follows:

| SDLC Stage | Project Activity | Deliverable |
|------------|------------------|-------------|
| **1. Planning & Requirements Analysis** | Feasibility studies (technical, economic, operational, schedule); professor consultations; BCOLBD 2025 guideline review | Feasibility Report (Section VII); Project Plan |
| **2. Defining Requirements (SRS)** | System analysis (CSE471); use case definitions; non-functional requirements; system constraints | CSE471 System Analysis document; Use Case Descriptions (UC-1 through UC-5) |
| **3. Designing Architecture** | Three-layer architecture design; database schema (3NF); smart contract interface design; component and data flow diagrams | Architecture diagrams; ERD (15 tables); Component Diagram; DFD |
| **4. Development (Coding)** | Sprint 1–3 implementation: smart contracts (Solidity), frontend (React/TypeScript), backend (FastAPI/Python), AI/ML models | Source code; deployed smart contracts; working DApp prototype |
| **5. Testing** | Unit tests (Hardhat, 12+ tests); integration testing (blockchain ↔ frontend); AI/ML model evaluation (precision, recall, F1) | Test reports; model evaluation metrics |
| **6. Deployment** | Testnet deployment (Polygon Mumbai / Ethereum Sepolia); frontend hosting (Vercel); backend hosting (Render) | Live prototype on testnet; public demo URL |
| **7. Maintenance** | Post-deployment monitoring; AI/ML model retraining pipeline; bug fixes; feature iteration based on feedback | Updated documentation; model retraining logs |

### E. Design Decisions and Alternatives Considered

For each major design decision, alternatives were evaluated and justified. The complete analysis is documented in the project decision justification report. A summary of key decisions:

| Decision Area | 1st Choice | 2nd Choice | Key Criterion |
|---------------|------------|------------|---------------|
| Development Methodology | Agile / Scrum | Incremental / Spiral | Evolving scope, sprint milestones |
| Software Architecture | DApp + Off-chain AI | Hybrid with Oracle | Gas cost, ML flexibility |
| Frontend Framework | React + TypeScript | Vue + TypeScript | Web3 ecosystem (Wagmi, RainbowKit) |
| Smart Contract Platform | Ethereum / EVM (Solidity) | Solana (Rust) | Largest ecosystem, free testnets |
| UI Design System | Material Design 3 (MUI) | Tailwind CSS | Professional banking UI, speed |
| Fraud Detection | Random Forest | XGBoost | SHAP compatibility, 94%+ precision |
| Anomaly Detection | Isolation Forest | Autoencoder | Unsupervised, no labels needed |
| XAI Method | SHAP | LIME | Theoretical foundation, regulatory compliance |
| Database | PostgreSQL | SQLite | CSE370 alignment, 3NF, async |
| Hosting | Vercel + Render | Localhost | $0 cost, public URL |

---

## VII. Feasibility Analysis

### A. Technical Feasibility

| Component | Assessment | Evidence |
|-----------|------------|----------|
| **Smart contracts** | Fully feasible | Three contracts implemented, compiled, and tested with Hardhat (12+ passing unit tests); Solidity 0.8.20 with OpenZeppelin provides battle-tested primitives |
| **Frontend DApp** | Fully feasible | React 18 + TypeScript application with all pages implemented; Wagmi and RainbowKit provide mature wallet integration |
| **Blockchain deployment** | Fully feasible | Polygon Mumbai and Ethereum Sepolia testnets provide zero-cost, production-equivalent environments with free faucet access |
| **AI/ML integration** | Feasible with constraints | Random Forest inference on tabular data achieves sub-50ms latency; SHAP explanations computable in real-time; prototype scope limits to fraud detection |
| **Database backend** | Feasible | PostgreSQL schema designed (15 tables, 3NF); FastAPI provides async REST framework with automatic OpenAPI documentation |

**Conclusion:** All core components are technically feasible within the prototype scope. The smart contract and frontend layers are already implemented and validated.

### B. Economic Feasibility

| Cost Category | Estimate | Notes |
|---------------|----------|-------|
| **Blockchain deployment** | $0 | Public testnets (Sepolia, Mumbai) — no real cryptocurrency required |
| **Frontend hosting** | $0 | Vercel free tier or localhost for demo |
| **Backend hosting** | $0 | Render free tier or localhost |
| **AI/ML training** | $0 | Local machine (16 GB RAM, 16 GB VRAM) or Google Colab free tier |
| **Development tools** | $0 | Hardhat, VS Code, Git — all open-source |
| **Total prototype cost** | **$0** | Entire prototype operates at zero financial cost |

**Conclusion:** The prototype is economically viable at zero cost, leveraging free-tier services and open-source tooling.

### C. Operational Feasibility

| Phase | Timeline | Activities |
|-------|----------|------------|
| **Pre-Thesis 1** | Completed | Requirements analysis, system modeling, database design, software engineering planning, initial prototype |
| **Pre-Thesis 2** | Current (8 weeks) | Smart contract finalization, frontend completion, fraud detection implementation, documentation |
| **Final Thesis** | 4–8 weeks | Additional ML experiments, evaluation, final report, competition submission |

### D. Schedule Feasibility

The 8-week Agile plan (Section V.B) distributes work across three sprints with defined deliverables per sprint. Risk mitigation includes:

- **Buffer:** Sprint 3 includes documentation and polish time as contingency.
- **Scope flexibility:** AI/ML features beyond fraud detection are designated as exploratory/future work.
- **Parallel workstreams:** Frontend, smart contract, and documentation tasks can proceed concurrently.

### E. Revenue Projection and Economic Impact

The following projection models the annual revenue potential of the hierarchical lending system at full deployment scale. Calculations use a reference ETH price of **$2,000** (February 2026 market rate) and interest rate parameters defined in Section IV.K.

**Assumptions:**

| Parameter | Value |
|-----------|-------|
| Reference ETH price | $2,000 (Feb 2026) |
| World Bank → National Bank rate | 3% APR (wholesale inter-bank) |
| National Bank → Local Bank rate | 5% APR (inter-bank) |
| Local Bank → Borrower rate | 8% APR (retail, mid-range of 5–12%) |
| Average loan term | 12 months |
| Loan turnover factor | 2× per year (6-month avg effective cycle) |
| Default rate provision | 3% (conservative DeFi industry estimate) |
| Origination fee | 0.25% per disbursement |

#### E.1 Tier 1 — World Bank (Global Reserve: 1,000,000 ETH)

| Metric | ETH | USD Equivalent |
|--------|-----|----------------|
| Total reserve capital | 1,000,000 | $2,000,000,000 |
| Disbursed to 5 National Banks | 1,000,000 | $2,000,000,000 |
| Annual interest income (3%) | 30,000 | $60,000,000 |
| Origination fees (0.25%) | 2,500 | $5,000,000 |
| Less: Default provision (3%) | −975 | −$1,950,000 |
| **Net annual revenue** | **31,525** | **$63,050,000** |

#### E.2 Tier 2 — National Banks (5 Banks × 200,000 ETH)

| Metric (per National Bank) | ETH | USD Equivalent |
|----------------------------|-----|----------------|
| Capital received from World Bank | 200,000 | $400,000,000 |
| Cost of capital (3% to World Bank) | −6,000 | −$12,000,000 |
| Disbursed to 10 Local Banks (10,000 each) | 100,000 | $200,000,000 |
| Interest income from Local Banks (5%) | 5,000 | $10,000,000 |
| Retained reserve direct lending (100,000 ETH at 6%) | 6,000 | $12,000,000 |
| Origination fees (0.25%) | 500 | $1,000,000 |
| Less: Default provision (3%) | −345 | −$690,000 |
| **Net annual revenue per bank** | **5,155** | **$10,310,000** |
| **Combined (5 banks)** | **25,775** | **$51,550,000** |

#### E.3 Tier 3 — Local Banks (50 Banks × 10,000 ETH)

| Metric (per Local Bank) | ETH | USD Equivalent |
|-------------------------|-----|----------------|
| Capital received from National Bank | 10,000 | $20,000,000 |
| Cost of capital (5% to National Bank) | −500 | −$1,000,000 |
| Loans issued: 20 borrowers × 1,000 ETH (2× turnover) | 20,000 | $40,000,000 |
| Interest income from borrowers (8%) | 1,600 | $3,200,000 |
| Origination fees (0.25% on 20,000 ETH) | 50 | $100,000 |
| Less: Default provision (3%) | −49.5 | −$99,000 |
| **Net annual revenue per bank** | **1,100.5** | **$2,201,000** |
| **Combined (50 banks)** | **55,025** | **$110,050,000** |

#### E.4 Borrower Economics (1,000 Borrowers × 1,000 ETH)

| Metric (per Borrower) | ETH | USD Equivalent |
|-----------------------|-----|----------------|
| Average loan amount | 1,000 | $2,000,000 |
| Annual interest cost (8%) | 80 | $160,000 |
| Estimated business return (15–20% avg.) | 150–200 | $300,000–400,000 |
| **Net borrower surplus (after interest)** | **70–120** | **$140,000–240,000** |
| **Aggregate (1,000 borrowers)** | **70,000–120,000** | **$140M–240M** |

#### E.5 System-Wide Revenue Summary

| Tier | Annual Revenue (ETH) | USD Equivalent |
|------|---------------------|----------------|
| Tier 1: World Bank (1 entity) | 31,525 | $63,050,000 |
| Tier 2: National Banks (5 entities) | 25,775 | $51,550,000 |
| Tier 3: Local Banks (50 entities) | 55,025 | $110,050,000 |
| **Total platform revenue** | **112,325** | **$224,650,000** |
| Borrower surplus generated | 70,000–120,000 | $140M–240M |

#### E.6 Global Economic Impact

Beyond direct platform revenue, the Crypto World Bank creates broader economic value:

- **Capital deployment:** $2 billion in lending capital reaches 1,000 direct borrowers across developing economies. According to World Bank research on development finance, each dollar of institutional lending generates approximately $2.5–3.0 in downstream economic activity through the fiscal multiplier effect, implying a potential **$5–6 billion annual economic stimulus**.
- **Job creation:** SME lending research (IFC, 2019) estimates that every $50,000 in small business credit creates or sustains one job. At $2 billion in deployed capital, the platform could support an estimated **40,000 direct jobs** in borrower enterprises.
- **Financial inclusion:** Approximately 1.4 billion adults remain unbanked globally (World Bank Global Findex, 2021). The platform's retail-focused design provides transparent, accessible credit to underserved populations without requiring traditional banking relationships or credit histories.
- **Transaction cost reduction:** DeFi lending eliminates intermediary costs associated with traditional cross-border development finance. Settlement occurs in minutes rather than days, and on Polygon PoS, transaction fees remain below $0.01—representing a **60–80% cost reduction** compared to traditional correspondent banking.
- **Transparency dividend:** On-chain auditability reduces compliance and audit costs for participating institutions. Traditional bank audits cost $500,000–$2 million annually; blockchain-native audit trails significantly reduce this overhead.

> **Sources for economic impact estimates:**
> (a) GDP multiplier ($2.5–3.0×): World Bank, "World Development Report 2022: Finance for an Equitable Recovery," [worldbank.org/wdr2022](https://www.worldbank.org/en/publication/wdr2022);
> (b) Job creation ($50K per job): International Finance Corporation (IFC), "MSME Finance Gap 2019," [ifc.org/msme-finance-gap](https://www.ifc.org/en/insights-reports/2019/msme-finance-gap);
> (c) 1.4 billion unbanked: World Bank, "The Global Findex Database 2021," [worldbank.org/globalfindex](https://www.worldbank.org/en/publication/globalfindex);
> (d) DeFi cost reduction (60–80%): Bank for International Settlements, "DeFi lending: intermediation without information?," BIS Working Paper No. 1183, 2024, [bis.org/work1183](https://www.bis.org/publ/work1183.pdf);
> (e) Bank audit costs ($500K–$2M): Deloitte, "Global Banking Outlook 2024."

---

## VIII. System Modeling

### A. Use Case Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CRYPTO WORLD BANK SYSTEM                                  │
│                                                                                          │
│  ┌─────────┐                                                                ┌─────────┐ │
│  │Borrower │                                                                │  Bank   │ │
│  │ (User)  │                                                                │Approver │ │
│  └────┬────┘                                                                └────┬────┘ │
│       ├── (Connect Wallet) ──────────────────────────────────────────────────────┤      │
│       ├── (Deposit to Reserve)                                                   │      │
│       ├── (Request Loan) ───────────────────────────── (Review Loan Request) ────┤      │
│       ├── (View My Loans)                              (Approve Loan) ───────────┤      │
│       ├── (Pay Installment)                            (Reject Loan) ────────────┤      │
│       ├── (Upload Income Proof) ──────────────────── (Review Income Proof) ──────┤      │
│       ├── (Chat with Bank) ─────────────────────────── (Chat with Borrower) ─────┤      │
│       ├── (View Borrowing Limit)                       (View Risk Dashboard) ────┤      │
│       ├── (Generate QR Code)                           (View AI/ML Scores) ──────┤      │
│       ├── (View Market Data)                           (View Anomaly Alerts) ────┤      │
│       ├── (Use AI Chatbot)                             (View XAI Explanations) ──┤      │
│       ├── (Manage Profile)                                                       │      │
│       ├── (Accept Terms & Conditions)                                            │      │
│       │                                                                          │      │
│  ┌────┴────┐                                                                ┌────┴────┐ │
│  │ World   │                                                                │National │ │
│  │  Bank   │                                                                │  Bank   │ │
│  │ Admin   │                                                                │         │ │
│  └────┬────┘                                                                └────┬────┘ │
│       ├── (Register National Bank)                     (Register Local Bank) ────┤      │
│       ├── (Lend to National Bank)                      (Borrow from WB) ─────────┤      │
│       ├── (View All Statistics)                        (Lend to Local Bank) ──────┤      │
│       ├── (Pause / Unpause System)                     (Set Bank Approver) ──────┤      │
│       ├── (Emergency Withdraw)                         (Add Bank User) ──────────┤      │
│       ├── (Review Security Logs)                       (View LB Portfolio) ──────┤      │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**Actors (4):** Borrower, Bank Approver, World Bank Admin, National Bank — **29 use cases total.** Full diagram is maintained in the project documentation repository.

### B. Sequence Diagram — Loan Request, AI Risk Assessment, and Approval Flow

```
Borrower          Frontend         MetaMask         Smart Contract     Polygon PoS      Backend API      AI/ML Service    Approver UI      Approver Wallet
   │                  │                  │                │               │                 │
   │                    │                  │                   │                  │                  │                  │                  │
   │  1. Open DApp      │                  │                   │                  │                  │                  │                  │
   │───────────────────>│                  │                   │                  │                  │                  │                  │
   │  2. Connect Wallet │                  │                   │                  │                  │                  │                  │
   │───────────────────>│ 3. eth_reqAccts  │                   │                  │                  │                  │                  │
   │                    │─────────────────>│                   │                  │                  │                  │                  │
   │                    │ 4. Return addr   │                   │                  │                  │                  │                  │
   │                    │<─────────────────│                   │                  │                  │                  │                  │
   │  5. Enter amount   │                  │                   │                  │                  │                  │                  │
   │     + purpose      │                  │                   │                  │                  │                  │                  │
   │───────────────────>│ 6. GET /limit    │                   │                  │                  │                  │                  │
   │                    │──────────────────────────────────────────────────────────────────────────>│                  │                  │
   │                    │ 7. limit OK      │                   │                  │                  │                  │                  │
   │                    │<──────────────────────────────────────────────────────────────────────────│                  │                  │
   │                    │ 8. requestLoan() │                   │                  │                  │                  │                  │
   │                    │─────────────────>│                   │                  │                  │                  │                  │
   │  9. Confirm tx?    │                  │                   │                  │                  │                  │                  │
   │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                   │                  │                  │                  │                  │
   │  10. Confirm       │                  │                   │                  │                  │                  │                  │
   │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─>│ 11. Sign + Send  │                  │                  │                  │                  │
   │                    │                  │──────────────────>│ 12-18. Validate  │                  │                  │                  │
   │                    │                  │                   │  require(amt>0)  │                  │                  │                  │
   │                    │                  │                   │  loanCounter++   │                  │                  │                  │
   │                    │                  │                   │  Store Loan{}    │                  │                  │                  │
   │                    │                  │                   │  emit            │                  │                  │                  │
   │                    │                  │                   │  LoanRequested   │                  │                  │                  │
   │                    │                  │                   │─────────────────>│                  │                  │                  │
   │                    │                  │                   │                  │ 19. PoS confirm  │                  │                  │
   │                    │ 20. hash: 0xa... │                   │                  │                  │                  │                  │
   │                    │<──────────────────────────────────────────────────────────────────────────│                  │                  │
   │  21. "Success!"    │                  │                   │                  │ 22. Event detect │                  │                  │
   │<───────────────────│                  │                   │                  │─────────────────>│ 23. INSERT DB    │                  │
   │                    │                  │                   │                  │                  │ 24. Trigger ML   │                  │
   │                    │                  │                   │                  │                  │─────────────────>│ 25. Extract feat │
   │                    │                  │                   │                  │                  │                  │ 26. RF predict   │
   │                    │                  │                   │                  │                  │                  │ 27. SHAP explain │
   │                    │                  │                   │                  │                  │                  │ 28. IF anomaly   │
   │                    │                  │                   │                  │                  │ 29. Return score │                  │
   │                    │                  │                   │                  │                  │<─────────────────│                  │
   │                    │                  │                   │                  │                  │ 30. Store log    │                  │
   │                    │                  │                   │                  │                  │                  │ 31. Open pending │
   │                    │                  │                   │                  │                  │                  │────────────────>│
   │                    │                  │                   │                  │                  │ 32. GET /pending │                  │
   │                    │                  │                   │                  │                  │<────────────────────────────────────│
   │                    │                  │                   │                  │                  │ 33. Return list  │                  │
   │                    │                  │                   │                  │                  │────────────────────────────────────>│
   │                    │                  │                   │                  │                  │                  │ 34. Display risk │
   │                    │                  │                   │                  │                  │                  │ 35. Click Approve│
   │                    │                  │                   │                  │                  │                  │────────────────>│
   │                    │                  │                   │                  │                  │                  │                  │ 36. Sign
   │                    │                  │                   │                  │                  │                  │                  │ approveLoan()
   │                    │                  │                   │ 37-42. Verify    │                  │                  │                  │
   │                    │                  │                   │  onlyApprover    │                  │                  │                  │
   │                    │                  │                   │  status=Pending  │                  │                  │                  │
   │                    │                  │                   │  Transfer ETH    │                  │                  │                  │
   │                    │                  │                   │  emit Approved   │                  │                  │                  │
   │  43. Funds recv    │                  │                   │─────────────────>│                  │                  │                  │
   │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                  │ 44. Event sync   │                  │                  │
   │                    │                  │                   │                  │─────────────────>│ 45-47. UPDATE    │                  │
   │                    │                  │                   │                  │                  │   LOAN, TX, LIM  │                  │
```

**49 interaction steps** spanning 9 participants. Full sequence diagrams are maintained in the project documentation repository.

### C. Entity-Relationship Diagram (ERD)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    ENTITY-RELATIONSHIP DIAGRAM                        │
│                    Crypto World Bank DBMS                             │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   WORLD_BANK    │ 1   N │ NATIONAL_BANK   │ 1   N │   LOCAL_BANK    │
│─────────────────│──────>│─────────────────│──────>│─────────────────│
│ PK world_bank_id│       │PK nat_bank_id   │       │PK local_bank_id │
│    name         │       │FK world_bank_id │       │FK nat_bank_id   │
│    total_reserve│       │   name          │       │   name          │
│    created_at   │       │   country       │       │   city          │
│    updated_at   │       │   total_borrowed│       │   total_borrowed│
└─────────────────┘       │   total_lent    │       │   total_lent    │
                          └────────┬────────┘       └───┬──────┬──────┘
                                   │ 1                  │ 1    │ 1
                                   │                    │      │
                                   ▼ N                  ▼ N    │
                          ┌─────────────────┐           │      │
                          │   BANK_USER     │<──────────┘      │
                          │─────────────────│                  │
                          │PK bank_user_id  │                  │
                          │   wallet_address│                  │
                          │   bank_type     │                  │
                          │FK nat_bank_id   │                  │
                          │FK local_bank_id │                  │
                          │   name, email   │                  │
                          │   role          │                  │
                          └────────┬────────┘                  │
                                   │                           │
                     ┌─────────────┼───────────────┐           │
                     │ reviews     │ approves      │           │
                     ▼ N           ▼ N             │           │
           ┌─────────────────┐  ┌──────────────────┴──────┐    │
           │  INCOME_PROOF   │  │      LOAN_REQUEST       │    │
           │─────────────────│  │─────────────────────────│    │
           │PK proof_id      │  │PK loan_id               │    │
           │FK borrower_id   │  │FK borrower_id           │    │
           │FK reviewed_by   │  │FK local_bank_id ────────┘    │
           │   file_path     │  │FK approved_by               │
           │   status        │  │FK rejected_by               │
           └─────────────────┘  │   amount, purpose           │
                                │   status                    │
┌─────────────────┐             │   is_installment            │
│    BORROWER     │ 1         N │   blockchain_tx_hash        │
│─────────────────│────────────>│   deadline                  │
│PK borrower_id   │             └──┬──────┬──────┬────────────┘
│   wallet_address│                │ 1    │ 1    │ 1
│   name, email   │                │      │      │
│   country, city │                ▼ N    ▼ N    ▼ N
│   is_first_time │    ┌───────────┐  ┌──────┐  ┌──────────────┐
│   consec_paid   │    │INSTALLMENT│  │ CHAT │  │AI_ML_SECURITY│
└────┬───────┬────┘    │───────────│  │_MSG  │  │_LOG          │
     │ 1     │ 1       │PK inst_id │  │──────│  │──────────────│
     │       │         │FK loan_id │  │PK id │  │PK sec_log_id │
     ▼ 1     ▼ N       │  number   │  │FK    │  │FK loan_id    │
┌────────┐ ┌────────┐  │  amt_due  │  │loan  │  │FK txn_id     │
│BORROW- │ │TRANSAC-│  │  status   │  │_id   │  │FK reviewed_by│
│ING_    │ │TION    │  └───────────┘  │sender│  │  risk_score  │
│LIMIT   │ │────────│                 │recvr │  │  risk_type   │
│────────│ │PK tx_id│                 │text  │  └──────────────┘
│PK id   │ │FK borr │                 └──────┘
│FK borr │ │FK loan │
│ 6m lim │ │ amount │     ┌─────────────┐  ┌──────────────┐  ┌───────────┐
│ 1y lim │ │ type   │     │AI_CHATBOT   │  │ MARKET_DATA  │  │ PROFILE   │
└────────┘ └────────┘     │_LOG         │  │──────────────│  │_SETTINGS  │
                          │─────────────│  │PK id         │  │───────────│
                          │PK log_id    │  │  crypto_type │  │PK id      │
                          │  user_wallet│  │  price_usd   │  │  user_type│
                          │  question   │  │  volume_24h  │  │  user_id  │
                          │  response   │  │  market_cap  │  │  terms    │
                          │  intent     │  │  timestamp   │  │  prefs    │
                          └─────────────┘  └──────────────┘  └───────────┘
```

**Key Relationships:**
- `WORLD_BANK` (1) → (N) `NATIONAL_BANK` → (N) `LOCAL_BANK` — Hierarchical banking structure
- `BORROWER` (1) → (N) `LOAN_REQUEST` — One borrower, many loan applications
- `LOAN_REQUEST` (1) → (N) `INSTALLMENT` — One loan, multiple payment installments
- `LOAN_REQUEST` (1) → (N) `CHAT_MESSAGE` — One loan, many chat messages
- `BORROWER` (1) → (1) `BORROWING_LIMIT` — One computed limit per borrower
- `LOAN_REQUEST` / `TRANSACTION` → (N) `AI_ML_SECURITY_LOG` — Security monitoring

**Normalization:** All tables are in Third Normal Form (3NF). Selective denormalization is applied to `BORROWING_LIMIT` (cached computed fields) and `BORROWER.consecutive_paid_loans` (updated via triggers) for query performance.

### D. Activity Diagram — Loan Request to Repayment

```
                                          ┌───────────┐
                                          │   START   │
                                          └─────┬─────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │  Borrower Opens DApp  │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │  Connect Wallet       │
                                    │  (MetaMask)           │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                       ◇─────────────────◇
                                      ╱  Wallet           ╲
                                     ╱   Connected?        ╲
                                    ◇─────────────────────◇
                                    │ Yes                    │ No → END
                                    ▼
                        ┌──────────────────┐
                        │  Read Address &  │
                        │  Determine Role  │
                        └────────┬─────────┘
                                 ▼
                    ┌────────────────────────┐
                    │  Navigate to Loan Page │
                    │  Enter Amount & Purpose│
                    └────────────┬───────────┘
                                 │
                                 ▼
                        ◇─────────────────◇
                       ╱  First-Time       ╲
                      ╱   Borrower?         ╲
                     ◇──────────────────────◇
                     │ Yes                    │ No ─────────────────────────┐
                     ▼                                                     │
         ┌─────────────────────┐                                           │
         │  Upload Income      │                                           │
         │  Proof Document     │                                           │
         └─────────┬───────────┘                                           │
                   ▼                                                       │
          ◇─────────────────◇                                              │
         ╱  Approved?        ╲                                             │
        ◇────────────────────◇                                             │
        │ Yes            │ No → END                                        │
        └────────────────┤                                                 │
                         └─────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Query Borrowing Limit │
                    └────────────┬───────────┘
                                 ▼
                        ◇─────────────────◇
                       ╱  Within Limit?    ╲ ─── No → END
                      ◇──────────────────◇
                                 │ Yes
                                 ▼
                    ┌──────────────────────────┐
                    │  MetaMask: Confirm Tx    │
                    └────────────┬─────────────┘
                                 ▼
                        ◇─────────────────◇
                       ╱  Confirmed?       ╲ ─── No → END
                      ◇──────────────────◇
                                 │ Yes
                                 ▼
                    ┌──────────────────────────┐
                    │  Smart Contract:         │
                    │  Validate → Create Loan  │
                    │  → Emit LoanRequested    │
                    └────────────┬─────────────┘
                                 │
          ═══════ APPROVER SWIMLANE ═══════
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  View Pending + AI     │
                    │  Risk + SHAP Features  │
                    └────────────┬───────────┘
                                 ▼
                        ◇─────────────────◇
                       ╱  Approve?         ╲
                      ◇──────────────────◇
                      │ Yes          │ No → Reject → END
                      ▼
         ┌──────────────────────────┐
         │  approveLoan() → Verify  │
         │  → Transfer ETH         │
         │  → Emit LoanApproved    │
         └────────────┬─────────────┘
                      │
                      ▼
         ┌──────────────────────────┐
         │  Borrower Receives Funds │
         │  Installment Schedule    │
         └────────────┬─────────────┘
                      │
                      ▼
             ◇─────────────────◇
            ╱  Installment Due? ╲ ─── All Paid → Loan Complete → END
           ◇────────────────────◇
                      │ Yes
                      ▼
         ┌──────────────────────────┐
         │  payInstallment() → Sign │
         └──────── (loop) ──────────┘
```

Full detail is maintained in the project documentation repository.

### E. Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    <<subsystem>> PRESENTATION LAYER                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Dashboard  │  │ LoanModule │  │ AdminPanel │  │RiskDashboard │  │ WalletProvider       │ │
│  │○IDashboard │  │○ILoanSvc   │  │○IAdminSvc  │  │○IRiskSvc     │  │ (Wagmi+RainbowKit)   │ │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬───────┘  │○IWalletService       │ │
│         │               │               │               │          └──────────┬────────────┘ │
└─────────┼───────────────┼───────────────┼───────────────┼───────────────────┼────────────────┘
          │               │               │               │                   │
══════════╪═══════════════╪═══════════════╪═══════════════╪═══════════════════╪═════════════════
          │               │               │               │                   │
┌─────────┼───────────────┼───────────────┼───────────────┼───────────────────┼────────────────┐
│         │     <<subsystem>> SMART CONTRACT LAYER        │                   │                 │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │ World Bank Reserve   │  │ National Bank        │  │ Local Bank           │                │
│  │ ○IReserve            │─>│ ○INationalBank       │─>│ ○ILocalBank          │                │
│  │ +Deposit Management  │  │ +Bank Registration   │  │ +Loan Processing     │                │
│  │ +Bank Registration   │  │ +Fund Distribution   │  │ +Approval Workflow   │                │
│  │ +System Controls     │  │ +Reserve Borrowing   │  │ +Installment Mgmt    │                │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘                │
│  ┌──────────────────────┐  ┌──────────────────────┐                                         │
│  │ OpenZeppelin         │  │ Solidity 0.8.20      │                                         │
│  │ +Security Guards     │  │ +Overflow Protection  │                                         │
│  │ +Access Control      │  │ +Input Validation    │                                         │
│  └──────────────────────┘  └──────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
          │
══════════╪════════════════════════════════════════════════════════════════════════════════════
          │
┌─────────┼───────────────────────────────────────────────────────────────────────────────────┐
│         │     <<subsystem>> BACKEND SERVICES LAYER                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │EventListener │  │ REST API     │  │ AI/ML Service │  │ PostgreSQL   │  │ Redis Cache  │  │
│  │○IEventSync   │─>│ ○ILoanAPI   │─>│ ○IMLService   │  │ ○IDataStore  │  │ ○ICacheSvc   │  │
│  │+Event Capture│  │ ○IRiskAPI   │  │ +Fraud Detect │  │ (15 tables)  │  │ +Market Data │  │
│  │+State Sync   │  │ ○IUserAPI   │  │ +Anomaly Det. │  │              │  │ +Limit Cache │  │
│  └──────────────┘  └──────┬──────┘  │ +Explainablty │  └──────────────┘  └──────────────┘  │
│                           │         └──────────────┘                                        │
└───────────────────────────┼─────────────────────────────────────────────────────────────────┘
          │                 │
══════════╪═════════════════╪══════════════════════════════════════════════════════════════════
          │                 │
┌─────────┼─────────────────┼─────────────────────────────────────────────────────────────────┐
│         │  <<external>>   │                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                    │
│  │ MetaMask     │  │ Polygon PoS  │  │ CoinGecko API│  │ Alchemy RPC  │                    │
│  │ ○IWalletAuth │  │ ○IConsensus  │  │ ○IMarketData │  │ ○IRPC        │                    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

Full component diagrams are maintained in the project documentation repository.

### F. Data Flow Diagram

**Level 0 (Context):**

```
                                                                              ┌─────────────────────┐
  ┌─────────────┐   Loan Request, Deposit, Payment                           │  Polygon Blockchain │
  │  Borrower   │────────────────────────────────────┐  Signed Tx ──────────>│  Network            │
  └─────────────┘                                     │  Confirmed Events <──│                     │
         ▲                                            │                      └─────────────────────┘
         │  Loan Status, Funds,                       │
         │  Limits, Market Data                       ▼
         │                                  ┌──────────────────┐
         └──────────────────────────────────│  CRYPTO WORLD    │──────────────┐
                                            │  BANK SYSTEM     │              │
  ┌─────────────┐  Approve/Reject          │                  │              ▼
  │  Bank       │  Pending Loans + Risk    │                  │    ┌──────────────────┐
  │  Approver   │<────────────────────────>│                  │    │  CoinGecko API   │
  └─────────────┘                          └──────────────────┘    │  (Market Data)   │
                                                    ▲              └──────────────────┘
  ┌─────────────┐   Register, Lend, Control         │
  │  World Bank │<─────────────────────────────────>│
  │  Admin      │                                    │
  └─────────────┘                                    │
  ┌─────────────┐   Register Local, Borrow/Lend     │
  │  National   │<─────────────────────────────────>│
  │  Bank       │
  └─────────────┘
```

**Level 1 — 12 processes:** (1) Process Loan Request, (2) Manage Loan Lifecycle, (3) AI/ML Risk Assessment, (4) Execute Blockchain Transaction, (5) Synchronize Event Data, (6) Calculate Borrowing Limits, (7) Fetch & Cache Market Data, (8) Manage Bank Hierarchy, (9) Process Income Verification, (10) Manage Chat Communication, (11) AI Chatbot Service, (12) Manage User Profiles. **11 data stores:** D1: LOAN_REQUEST, D2: TRANSACTION, D3: AI_ML_SECURITY_LOG, D4: BORROWING_LIMIT, D5: BORROWER, D6: CHAT_MESSAGE, D7: INCOME_PROOF, D8: AI_CHATBOT_LOG, D9: PROFILE_SETTINGS, D10: MARKET_DATA, D11: INSTALLMENT. Full Level 1 diagram is maintained in the project documentation repository.

---

## IX. Valuation and Distribution Strategy

### A. Value Proposition

The Crypto World Bank generates value across multiple dimensions:

| Value Type | Description | Beneficiary |
|------------|-------------|-------------|
| **Operational efficiency** | Elimination of manual reconciliation and multi-day settlement | Banking institutions |
| **Audit cost reduction** | Real-time on-chain auditability replaces periodic third-party audits | Regulators, institutions |
| **Risk mitigation** | AI/ML-augmented loan decisioning reduces default rates | Lenders, borrowers |
| **Financial inclusion** | Transparent, programmable lending accessible to underserved populations | Borrowers in developing economies |
| **Research contribution** | Novel intersection of hierarchical DeFi, AI security, and governance | Academic community |

### B. Revenue Model

| Revenue Stream | Mechanism | Phase |
|----------------|-----------|-------|
| **Loan origination fees** | Configurable percentage (0.1–0.5%) deducted at disbursement via smart contract | Phase 2 |
| **Premium analytics services** | Subscription-based access to advanced AI risk dashboards for institutional users | Phase 3 |
| **Governance token economics** | Network participation incentives distributed via governance token | Phase 3 |
| **Grant and pilot funding** | Academic research grants; regulatory sandbox program funding | Phase 1–2 |

### C. Go-to-Market Strategy

| Phase | Activities | Timeline |
|-------|-----------|----------|
| **Phase 1: Academic Validation** | Competition submission (BCOLBD 2025); thesis publication; open-source release | Current |
| **Phase 2: Pilot Deployment** | Regulatory sandbox application; partnership with one institutional entity; testnet-to-mainnet migration | 6–12 months |
| **Phase 3: Production Scale** | Multi-chain deployment; full AI/ML backend; commercial partnerships; governance token launch | 12–24 months |

### D. Launch Readiness

- Whitepaper and technical documentation: **Published.**
- Smart contract suite: **Implemented and tested** (WorldBankReserve, NationalBank, LocalBank).
- Frontend DApp: **Implemented** (all pages, responsive, wallet integration).
- Prototype deployment: **Ready** for testnet deployment.
- AI/ML backend: **Architecture defined**; implementation in progress.

---

## X. Conclusion

The Crypto World Bank addresses a **complex, multi-party coordination and trust problem** in hierarchical development finance by leveraging the unique properties of blockchain technology: immutability, programmable enforcement, and cryptographic auditability. The solution goes beyond existing DeFi lending protocols by introducing a four-tier institutional hierarchy, AI/ML-augmented risk assessment, and a comprehensive governance framework that addresses network membership, business operations, and technology infrastructure.

The platform is positioned at the intersection of decentralized finance, institutional lending, and applied AI security—a combination that is presently unaddressed in both the academic literature and the commercial blockchain landscape. With a working prototype, a defined market and partnership strategy, transparent risk assessment, and a phased go-to-market plan, the Crypto World Bank represents a viable and scalable contribution to the emerging field of blockchain-based development finance.

---

## Appendix A: Technology Stack

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Smart Contract | Solidity, OpenZeppelin | 0.8.20; Ownable, ReentrancyGuard |
| Frontend | React, TypeScript, Vite, Material-UI | React 18; MUI v5; Material Design 3 theme |
| Wallet Integration | Wagmi, RainbowKit, Viem | EIP-1193 compliant |
| Build and Test | Hardhat | Automated test suite; deployment scripts |
| Target Networks | Polygon Mumbai, Ethereum Sepolia | Public testnets; zero-cost operation |
| AI/ML (planned) | Python, FastAPI, scikit-learn, SHAP | Random Forest, Isolation Forest, SHAP |

## Appendix B: Smart Contract Capabilities

The platform's three smart contracts collectively support the following operations:

- **World Bank Reserve Contract:** Reserve management, deposit handling, national bank registration, fund distribution to national banks, system pause/unpause, emergency withdrawal, and global statistics.
- **National Bank Contract:** Local bank registration, borrowing from the world bank reserve, fund distribution to local banks, and network status queries.
- **Local Bank Contract:** Loan requests, loan approval and rejection, installment payments, bank user management, and approver designation.

## Appendix C: References

[1] S. M. Werner, D. Perez, L. Gudgeon, A. Klages-Mundt, D. Harz, and W. J. Knottenbelt, "SoK: Decentralized Finance (DeFi)," *arXiv preprint arXiv:2101.08778*, 2022. [Online]. Available: [https://arxiv.org/abs/2101.08778](https://arxiv.org/abs/2101.08778)

[2] M. Bartoletti and L. Pompianu, "An empirical analysis of smart contracts: platforms, applications, and design patterns," in *Proc. Int. Conf. Financial Cryptography and Data Security*, pp. 494–509, 2017. DOI: [10.1007/978-3-319-70278-0_31](https://doi.org/10.1007/978-3-319-70278-0_31)

[3] L. Gudgeon, S. Werner, D. Perez, and W. J. Knottenbelt, "DeFi protocols for loanable funds: Interest rates, liquidity and market efficiency," in *Proc. ACM Conf. Advances in Financial Technologies (AFT)*, 2020. DOI: [10.1145/3419614.3423254](https://doi.org/10.1145/3419614.3423254)

[4] P. Tolmach, Y. Li, S. W. Lin, and Y. Liu, "A survey of smart contract formal specification and verification," *ACM Computing Surveys*, vol. 54, no. 7, pp. 1–38, 2021. DOI: [10.1145/3464421](https://doi.org/10.1145/3464421)

[5] G. Angeris and T. Chitra, "A note on privacy in constant function market makers," *arXiv preprint arXiv:2103.01193*, 2022. [Online]. Available: [https://arxiv.org/abs/2103.01193](https://arxiv.org/abs/2103.01193)

[6] R. Auer and R. Böhme, "The technology of retail central bank digital currencies," *BIS Quarterly Review*, pp. 85–100, Mar. 2020. [Online]. Available: [https://www.bis.org/publ/qtrpdf/r_qt2003j.htm](https://www.bis.org/publ/qtrpdf/r_qt2003j.htm)

[7] D. K. C. Lee, L. Yan, and Y. Wang, "A global perspective on central bank digital currency," *China Economic Journal*, vol. 14, no. 1, pp. 52–66, 2021. DOI: [10.1080/17538963.2020.1870279](https://doi.org/10.1080/17538963.2020.1870279)

[8] H. Rahouti, K. Xiong, and N. Ghosh, "Bitcoin concepts, threats, and machine-learning security solutions," *IEEE Access*, vol. 6, pp. 67189–67205, 2018. DOI: [10.1109/ACCESS.2018.2870243](https://doi.org/10.1109/ACCESS.2018.2870243)

[9] F. Poursafaei, G. B. Hamad, and Z. Zilic, "Detecting malicious Ethereum entities via application of machine learning classification," in *Proc. IEEE Int. Conf. Blockchain Computing and Applications*, 2020. DOI: [10.1109/BCCA50787.2020.9274081](https://doi.org/10.1109/BCCA50787.2020.9274081)

[10] W. Chen, Z. Zheng, J. Cui, E. Ngai, P. Zheng, and Y. Zhou, "Detecting Ponzi schemes on Ethereum: Towards healthier blockchain technology," in *Proc. WWW Conference*, pp. 1409–1418, 2018. DOI: [10.1145/3178876.3186046](https://doi.org/10.1145/3178876.3186046)

[11] F. T. Liu, K. M. Ting, and Z.-H. Zhou, "Isolation Forest," in *Proc. IEEE Int. Conf. Data Mining (ICDM)*, pp. 413–422, 2008. DOI: [10.1109/ICDM.2008.17](https://doi.org/10.1109/ICDM.2008.17)

[12] M. Ahmed, A. N. Mahmood, and M. R. Islam, "A survey of anomaly detection techniques in financial domain," *Future Generation Computer Systems*, vol. 55, pp. 278–288, 2016. DOI: [10.1016/j.future.2015.01.001](https://doi.org/10.1016/j.future.2015.01.001)

[13] S. M. Lundberg and S.-I. Lee, "A unified approach to interpreting model predictions," in *Advances in Neural Information Processing Systems (NeurIPS)*, pp. 4765–4774, 2017. [Online]. Available: [https://proceedings.neurips.cc/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html](https://proceedings.neurips.cc/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html)

[14] P. Bracke, A. Datta, C. Jung, and S. Sen, "Machine learning explainability in finance: An application to default risk analysis," *Bank of England Staff Working Paper No. 816*, 2019. [Online]. Available: [https://www.bankofengland.co.uk/working-paper/2019/machine-learning-explainability-in-finance](https://www.bankofengland.co.uk/working-paper/2019/machine-learning-explainability-in-finance)

[15] N. Atzei, M. Bartoletti, and T. Cimoli, "A survey of attacks on Ethereum smart contracts (SoK)," in *Proc. Int. Conf. Principles of Security and Trust (POST)*, pp. 164–186, 2017. DOI: [10.1007/978-3-662-54455-6_8](https://doi.org/10.1007/978-3-662-54455-6_8)

[16] R. Beck, C. Müller-Bloch, and J. L. King, "Governance in the blockchain economy: A framework and research agenda," *Journal of the Association for Information Systems*, vol. 19, no. 10, pp. 1020–1034, 2018. DOI: [10.17705/1jais.00518](https://doi.org/10.17705/1jais.00518)

[17] P. De Filippi and A. Wright, *Blockchain and the Law: The Rule of Code*. Harvard University Press, 2018. [Online]. Available: [https://www.hup.harvard.edu/books/9780674976429](https://www.hup.harvard.edu/books/9780674976429)

[18] BCOLBD 2025, "Blockchain Olympiad Bangladesh: Guideline and Evaluation Scheme," 2025. [Online]. Available: [https://bcolbd.org/uploads/guideline/BLOCKCHAIN%20OLYMPIAD%20BANGLADESH%20Blockchain%20Guideline.pdf](https://bcolbd.org/uploads/guideline/BLOCKCHAIN%20OLYMPIAD%20BANGLADESH%20Blockchain%20Guideline.pdf)

[19] OpenZeppelin, "OpenZeppelin Contracts," 2024. [Online]. Available: [https://openzeppelin.com/contracts](https://openzeppelin.com/contracts)
