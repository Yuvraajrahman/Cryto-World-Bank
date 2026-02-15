# Decentralized Crypto World Bank: A Blockchain-Based Hierarchical Lending Platform with AI-Enhanced Security

## Whitepaper — Blockchain Olympiad Bangladesh (BCOLBD) 2025

**Document Type:** Project Whitepaper  
**Competition:** Blockchain Olympiad Bangladesh 2025 (BCOLBD) — Blockchain Category  
**Version:** 3.0  
**Date:** February 2025  
**Team:** [Team Name]  
**Institution:** [Institution Name]

---

> **Formatting Compliance:** This document adheres to BCOLBD 2025 mandatory criteria: ≤20 pages including appendices; Calibri / Times New Roman / Arial, 11 pt, single line spacing; contents in English.

---

## Abstract

International development finance relies on multi-tiered institutional hierarchies—from supranational reserves to national intermediaries to local disbursement entities—to coordinate the flow of capital across borders. These conventional systems, while providing governance and risk management, suffer from limited transparency, protracted settlement cycles, and opaque decision-making processes that erode stakeholder trust.

This whitepaper presents the **Crypto World Bank**, a decentralized application (DApp) that replicates the hierarchical lending model of traditional development finance institutions on a public Ethereum Virtual Machine (EVM) blockchain. The platform enforces a four-tier capital flow (World Bank → National Banks → Local Banks → Borrowers) through a suite of auditable smart contracts, while augmenting loan approval workflows with an off-chain AI/ML security layer for fraud detection, anomaly identification, and explainable risk assessment.

We demonstrate that blockchain technology is uniquely suited to this domain because the underlying challenge is fundamentally one of **multi-party trust and coordination**—a class of problems for which distributed ledger technology provides superior guarantees over conventional centralized architectures. The document further presents the target market, partnership ecosystem, competitive landscape, risk profile, system architecture, governance framework, and a phased go-to-market strategy.

**Keywords:** Blockchain, Decentralized Finance, Hierarchical Lending, Smart Contracts, AI/ML Security, Fraud Detection, Explainable AI, Governance, Development Finance

---

## I. Problem Statement and Proposed Solution

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

## II. Market Analysis and Partnership Ecosystem

### A. Market Sizing

| Segment | Description | Estimated Scale |
|---------|-------------|-----------------|
| **Total Addressable Market (TAM)** | Global decentralized lending market; DeFi lending TVL has historically exceeded $50B | $50B+ |
| **Serviceable Addressable Market (SAM)** | Institutional and semi-institutional lending requiring hierarchical structures: development banks, microfinance networks, credit cooperatives | $5–10B |
| **Serviceable Obtainable Market (SOM)** | Pilot deployments in regulatory sandboxes, academic prototypes, and NGO-backed microfinance programs in blockchain-friendly jurisdictions (e.g., Bangladesh, UAE, Singapore) | $50–200M |

The market for **transparent, hierarchy-preserving decentralized lending** is presently unaddressed by existing DeFi protocols, which universally adopt flat, pool-based architectures. This represents a significant whitespace opportunity.

### B. Partner Ecosystem

The successful deployment and operation of the Crypto World Bank requires collaboration with the following ecosystem participants:

| Partner Category | Functional Role | Blockchain-Mediated Incentive |
|------------------|-----------------|-------------------------------|
| **Financial Regulators** | Regulatory sandbox approval; compliance oversight | Reduced enforcement cost through on-chain transparency and audit trails |
| **Banking Institutions** | Network membership as National/Local Banks | Access to diversified global reserve; reduced inter-bank settlement friction |
| **Payment Gateway Providers** | Fiat-to-crypto on-ramp and off-ramp services | Volume-based transaction fees; expanded market reach |
| **Academic and Research Institutions** | Validation of AI/ML models; publication of research findings | Access to anonymized datasets; collaborative research opportunities |
| **Non-Governmental Organizations** | Pilot deployment; field testing with underserved borrower populations | Transparent, low-friction credit access for beneficiaries |

### C. Incentive Alignment Through the Blockchain Platform

Partner incentives are allocated and enforced through the blockchain platform itself:

- **Immutable repayment records** serve as on-chain reputation signals, enabling data-driven credit decisions without third-party credit bureaus.
- **Transparent reserve verification** allows partners to independently confirm that allocated capital is deployed as committed.
- **Programmable fee structures** (future extension) distribute transaction fees proportionally to network participants based on their contribution to lending volume and governance.

---

## III. Competitive Landscape and Risk Assessment

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

## IV. System Architecture and Governance Framework

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
│  WorldBankReserve.sol · NationalBank.sol · LocalBank.sol       │
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

### H. Regulatory Compliance Considerations

As the platform operates within the regulated banking domain:
- The prototype phase operates exclusively on **public testnets** with no real monetary value.
- The architecture supports **audit log generation** for regulatory review.
- Future production deployment would engage **regulatory sandbox programs** in target jurisdictions.

### I. Governance Framework

#### I.1 Network Membership Governance

| Governance Aspect | Implementation |
|-------------------|----------------|
| **Member on-boarding** | World Bank owner registers National Banks via `registerNationalBank()`; National Banks register Local Banks via `registerLocalBank()`; Local Banks designate approvers via `setApprover()` |
| **Member off-boarding** | Deactivation flags in smart contracts (`isActive = false`); cascading access revocation |
| **Regulatory oversight** | Audit log emission via smart contract events; planned read-only regulator dashboard |
| **Permission structure** | Hierarchical: Owner → National Bank → Local Bank → Approver → Borrower; enforced by `onlyOwner`, `onlyApprover`, and role-check modifiers |
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

---

## V. Methodology

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

### C. User Stories per Sprint

**Sprint 1 — Foundation**
- US-1.1: As a user, I want to connect my wallet so that I can interact with the platform.
- US-1.2: As a user, I want to deposit to the reserve so that the bank has funds to lend.
- US-1.3: As an admin, I want to register National Banks so that the hierarchy is established.
- US-1.4: As a developer, I want a normalized database schema so that all entities are properly modeled.

**Sprint 2 — Lending**
- US-2.1: As a borrower, I want to request a loan so that I can access capital.
- US-2.2: As an approver, I want to approve or reject loans so that I can manage bank risk.
- US-2.3: As a borrower, I want installment schedules for large loans so that repayment is manageable.
- US-2.4: As a borrower, I want to chat with the bank so that I can discuss my loan application.

**Sprint 3 — AI/ML and Polish**
- US-3.1: As a bank operator, I want fraud risk scores so that I can make informed approval decisions.
- US-3.2: As a bank operator, I want explainable AI so that I understand why a loan is flagged.
- US-3.3: As an admin, I want a risk dashboard so that I can monitor security across all loans.

---

## VI. Feasibility Analysis

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

---

## VII. System Modeling

### A. Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CRYPTO WORLD BANK SYSTEM                        │
│                                                                      │
│  ┌─────────┐                                        ┌─────────┐     │
│  │Borrower │                                        │  Bank   │     │
│  │ (User)  │                                        │Approver │     │
│  └────┬────┘                                        └────┬────┘     │
│       │                                                  │          │
│       ├──── UC1: Connect Wallet ─────────────────────────┤          │
│       │                                                  │          │
│       ├──── UC2: Deposit to Reserve                      │          │
│       │                                                  │          │
│       ├──── UC3: Request Loan ──────────────────────┐    │          │
│       │                                             │    │          │
│       ├──── UC4: View Loan Status                   │    │          │
│       │                                             │    │          │
│       ├──── UC5: Pay Installment                    │    │          │
│       │                                             ▼    │          │
│       ├──── UC6: Upload Income Proof     UC7: Review ────┤          │
│       │                                  Loan Request    │          │
│       ├──── UC8: Chat with Bank ─────────────────────────┤          │
│       │                                                  │          │
│       │                                  UC9: Approve/   │          │
│       │                                  Reject Loan ────┤          │
│       │                                                  │          │
│       │                                  UC10: View Risk │          │
│       │                                  Dashboard ──────┤          │
│       │                                                  │          │
│  ┌────┴────┐                                        ┌────┴────┐     │
│  │ World   │                                        │National │     │
│  │  Bank   │                                        │  Bank   │     │
│  │ Admin   │                                        │         │     │
│  └────┬────┘                                        └────┬────┘     │
│       │                                                  │          │
│       ├──── UC11: Register National Bank                 │          │
│       ├──── UC12: Lend to National Bank                  │          │
│       ├──── UC13: Pause/Unpause System                   │          │
│       ├──── UC14: Emergency Withdraw                     │          │
│       │                                                  │          │
│       │                          UC15: Register ─────────┤          │
│       │                          Local Bank              │          │
│       │                          UC16: Lend to ──────────┤          │
│       │                          Local Bank              │          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Actors:**
- **Borrower (User):** Requests loans, makes deposits, pays installments, chats with bank.
- **Bank Approver:** Reviews and approves/rejects loan requests; views AI risk dashboard.
- **World Bank Admin (Owner):** Manages reserve, registers National Banks, emergency controls.
- **National Bank:** Registers Local Banks, borrows from World Bank, lends to Local Banks.

### B. Sequence Diagram — Loan Request and Approval Flow

```
Borrower          Frontend         LocalBank.sol      Blockchain       Approver        AI/ML Service
   │                  │                  │                │               │                 │
   │ 1. Connect       │                  │                │               │                 │
   │    Wallet        │                  │                │               │                 │
   │─────────────────>│                  │                │               │                 │
   │                  │ 2. Read wallet   │                │               │                 │
   │                  │    address       │                │               │                 │
   │                  │─────────────────>│                │               │                 │
   │                  │                  │                │               │                 │
   │ 3. Enter loan    │                  │                │               │                 │
   │    amount +      │                  │                │               │                 │
   │    purpose       │                  │                │               │                 │
   │─────────────────>│                  │                │               │                 │
   │                  │ 4. Prepare       │                │               │                 │
   │                  │    unsigned tx   │                │               │                 │
   │                  │─────────────────>│                │               │                 │
   │                  │                  │                │               │                 │
   │ 5. Sign tx       │                  │                │               │                 │
   │    (MetaMask)    │                  │                │               │                 │
   │<─ ─ ─ ─ ─ ─ ─ ─>│                  │                │               │                 │
   │                  │ 6. Broadcast     │                │               │                 │
   │                  │    signed tx     │                │               │                 │
   │                  │─────────────────>│ 7. Validate &  │               │                 │
   │                  │                  │    execute     │               │                 │
   │                  │                  │───────────────>│               │                 │
   │                  │                  │                │               │                 │
   │                  │                  │ 8. Emit        │               │                 │
   │                  │                  │ LoanRequested  │               │                 │
   │                  │                  │    event       │               │                 │
   │                  │                  │───────────────>│               │                 │
   │                  │                  │                │               │                 │
   │                  │ 9. Tx confirmed  │                │               │                 │
   │                  │<─────────────────│                │               │                 │
   │ 10. Show         │                  │                │               │                 │
   │    success       │                  │                │               │                 │
   │<─────────────────│                  │                │               │                 │
   │                  │                  │                │               │                 │
   │                  │                  │                │ 11. View      │                 │
   │                  │                  │                │     pending   │                 │
   │                  │                  │                │     loans     │                 │
   │                  │                  │                │<──────────────│                 │
   │                  │                  │                │               │                 │
   │                  │                  │                │               │ 12. Request     │
   │                  │                  │                │               │     risk score  │
   │                  │                  │                │               │────────────────>│
   │                  │                  │                │               │                 │
   │                  │                  │                │               │ 13. Return      │
   │                  │                  │                │               │     fraud score │
   │                  │                  │                │               │     + SHAP      │
   │                  │                  │                │               │<────────────────│
   │                  │                  │                │               │                 │
   │                  │                  │                │ 14. Approve   │                 │
   │                  │                  │                │     loan tx   │                 │
   │                  │                  │                │<──────────────│                 │
   │                  │                  │ 15. Execute    │               │                 │
   │                  │                  │     approveLoan│               │                 │
   │                  │                  │<───────────────│               │                 │
   │                  │                  │                │               │                 │
   │                  │                  │ 16. Transfer   │               │                 │
   │                  │                  │     funds to   │               │                 │
   │                  │                  │     borrower   │               │                 │
   │                  │                  │───────────────>│               │                 │
   │                  │                  │                │               │                 │
   │ 17. Receive      │                  │ 18. Emit      │               │                 │
   │     funds        │                  │ LoanApproved  │               │                 │
   │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│───────────────>│               │                 │
   │                  │                  │                │               │                 │
```

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

---

## VIII. Valuation and Distribution Strategy

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

## IX. Conclusion

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

## Appendix B: Smart Contract Interface Summary

**WorldBankReserve.sol** — `depositToReserve()`, `requestLoan(amount, purpose)`, `approveLoan(loanId)`, `rejectLoan(loanId)`, `registerNationalBank(addr, name, country)`, `lendToNationalBank(addr, amount)`, `getStats()`, `pause()`, `unpause()`, `emergencyWithdraw()`

**NationalBank.sol** — `registerLocalBank(addr, name, city)`, `borrowFromWorldBank(amount)`, `lendToLocalBank(addr, amount)`, `getLocalBankCount()`

**LocalBank.sol** — `requestLoan(amount, purpose)`, `approveLoan(loanId)`, `rejectLoan(loanId)`, `addBankUser(addr)`, `setApprover(addr)`, `payInstallment(loanId)`

## Appendix C: References

[1] M. Bartoletti and L. Pompianu, "An empirical analysis of smart contracts: platforms, applications, and design patterns," in *Proc. Int. Conf. Financial Cryptography and Data Security*, 2017.

[2] S. M. Werner, D. Perez, L. Gudgeon, A. Klages-Mundt, D. Harz, and W. J. Knottenbelt, "SoK: Decentralized Finance (DeFi)," *arXiv preprint arXiv:2101.08778*, 2021.

[3] Aave Protocol, "Aave V3 Technical Paper," 2022. [Online]. Available: https://aave.com

[4] Compound Finance, "Compound: The Money Market Protocol," 2019. [Online]. Available: https://compound.finance

[5] S. M. Lundberg and S.-I. Lee, "A unified approach to interpreting model predictions," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2017.

[6] F. T. Liu, K. M. Ting, and Z.-H. Zhou, "Isolation Forest," in *Proc. IEEE Int. Conf. Data Mining (ICDM)*, 2008.

[7] BCOLBD 2025, "Blockchain Olympiad Bangladesh: Guideline and Evaluation Scheme," 2025.

[8] OpenZeppelin, "OpenZeppelin Contracts," 2024. [Online]. Available: https://openzeppelin.com/contracts
