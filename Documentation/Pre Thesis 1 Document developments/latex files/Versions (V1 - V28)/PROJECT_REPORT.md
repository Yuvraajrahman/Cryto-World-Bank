# Decentralized Crypto World Bank
## A Blockchain-Based Hierarchical Lending Platform with AI-Enhanced Security

**Project Report**

**Authors:** Md. Bokhtiar Rahman Juboraz (20301138) · Md. Mahir Ahnaf Ahmed (20301083)
**Supervisor:** Mr. Annajiat Alim Rasel, Senior Lecturer, Dept. of CSE, Brac University
**Department:** Computer Science and Engineering, Brac University
**Date:** February 2026

---

## 1. Introduction

International development finance has long operated through layered institutional structures, where multilateral bodies channel capital down to national banks, then local banks, and finally to individual borrowers. While this tiered model distributes risk and provides local market access, it introduces persistent inefficiencies: limited cross-tier transparency, multi-day cross-border settlement, heavy reconciliation overhead, and manual, inconsistent risk assessment. At the same time, approximately 1.4 billion adults remain unbanked globally (World Bank Global Findex, 2021), underscoring how far the current system falls short of financial inclusion.

Meanwhile, Decentralized Finance (DeFi) platforms such as Aave, Compound, and MakerDAO have demonstrated that smart-contract-driven lending can operate with full on-chain transparency. However, every major DeFi protocol uses a flat, pool-based architecture that cannot model institutional hierarchy or integrate AI-driven governance. This gap represents both a research opportunity and a practical need.

The **Crypto World Bank** addresses this gap directly. It is a prototype decentralized application (DApp) that implements a four-tier hierarchical lending architecture on an Ethereum Virtual Machine (EVM)-compatible blockchain, augmented by off-chain machine learning security analytics. The platform models the real-world capital flow — **World Bank → National Banks → Local Banks → Borrowers** — using auditable smart contracts, while applying Random Forest fraud detection, Isolation Forest anomaly detection, and SHAP-based explainability to support transparent credit governance.

---

## 2. Problem Statement and Objectives

The global development finance ecosystem suffers from four systemic inefficiencies. First, internal bookkeeping across tiers is not publicly auditable, leaving lower-tier stakeholders with limited visibility into reserve adequacy and approval criteria. Second, cross-border capital transfers involve multiple intermediaries and compliance checkpoints, resulting in settlement periods ranging from days to weeks. Third, creditworthiness evaluation and fraud detection are predominantly human-driven, introducing inconsistency, bias, and scalability constraints. Fourth, the effort required to establish inter-institutional trust through legal agreements and audit engagements creates disproportionate burdens for smaller institutions and borrowers in developing economies.

Existing DeFi protocols do not address these problems because they employ peer-to-pool or over-collateralized lending models that lack institutional hierarchy, role-based governance, and AI-driven risk analytics.

The project pursues five core objectives:

1. Design and implement a four-tier on-chain lending hierarchy on an EVM-compatible blockchain that preserves institutional structure while enabling shared ledger visibility.
2. Integrate off-chain AI/ML analytics — Random Forest for fraud detection, Isolation Forest for anomaly identification, and SHAP for explainable risk assessment — to augment human credit governance.
3. Demonstrate transparent, programmable lending workflows with configurable borrowing limits, installment schedules, and role-based access control enforced by smart contracts.
4. Validate the prototype on public testnets (Polygon Mumbai, Ethereum Sepolia) with functional verification of hierarchical controls and transparency properties.
5. Document governance design, security controls, regulatory considerations, and a phased deployment pathway.

---

## 3. System Architecture

The platform employs a three-layer decentralized application architecture.

**Presentation Layer:** Built with React 18 and TypeScript, styled using Material Design 3 via MUI v5. Wallet integration is handled by Wagmi, RainbowKit, and Viem, conforming to the EIP-1193 standard. Key pages include the Dashboard, Deposit, Loan, Admin, Risk AI, and QR modules.

**Smart Contract Layer:** Three Solidity 0.8.20 contracts deployed on Ethereum Sepolia and Polygon Mumbai testnets implement the entire lending hierarchy:
- **WorldBankReserve Contract** — manages the global reserve, handles national bank registration, and controls fund distribution.
- **NationalBank Contract** — borrows from the World Bank, registers and funds local banks, and aggregates risk exposure.
- **LocalBank Contract** — processes borrower loan requests, manages installment schedules, and designates approvers.

All three contracts use OpenZeppelin's `Ownable` and `ReentrancyGuard` primitives to prevent reentrancy attacks and unauthorized access. Solidity 0.8.20's built-in overflow protection eliminates integer overflow vulnerabilities. The contracts also implement a pause/unpause mechanism for emergency response.

**Off-Chain Services Layer:** A FastAPI backend connects the smart contract layer to a PostgreSQL relational database and the AI/ML analytics engine. The database stores user profiles, income verification documents, chat messages, AI/ML inference logs, and cryptocurrency market data — information unsuitable for on-chain storage due to privacy constraints and storage costs. A Redis cache handles high-frequency market data updates. Blockchain events are captured via event listeners that synchronize off-chain state with on-chain state in real time.

On-chain data (reserve balances, loan requests, approval events, repayment transactions) remains immutable and publicly auditable on the blockchain. Borrowing limit computations, which require temporal aggregation over 6-month and 1-year transaction windows, are calculated off-chain and then enforced as on-chain constraints.

---

## 4. Database Design (CSE370)

The relational database schema comprises **15 normalized entities in Third Normal Form (3NF)**, designed to support the full lending lifecycle, communication, AI/ML security monitoring, and market data visualization.

**Core hierarchy entities:** `WORLD_BANK`, `NATIONAL_BANK`, `LOCAL_BANK`, `BANK_USER`, `BORROWER`

**Lending lifecycle entities:** `LOAN_REQUEST`, `INSTALLMENT`, `TRANSACTION`, `BORROWING_LIMIT`

**Communication and security entities:** `CHAT_MESSAGE`, `AI_CHATBOT_LOG`, `AI_ML_SECURITY_LOG`

**Supporting entities:** `INCOME_PROOF`, `MARKET_DATA`, `PROFILE_SETTINGS`

The schema applies Enhanced Entity-Relationship (EER) constructs including generalization (BANK_USER specializes into national and local variants via a `bank_type` discriminator), weak entity modeling (INSTALLMENT is existence-dependent on LOAN_REQUEST with composite key `loan_id + installment_number`), and aggregation (LOAN_REQUEST aggregates BORROWER and LOCAL_BANK). Derived attributes such as `six_month_remaining` and `one_year_remaining` in BORROWING_LIMIT are computed from TRANSACTION records rather than stored redundantly.

B-tree indexes on `LOAN_REQUEST.status`, `TRANSACTION.transaction_date`, and `BORROWER.wallet_address` optimize the most frequent application queries, including pending loan lookups, borrowing limit window calculations, and wallet-based identity resolution.

---

## 5. Software Engineering Methodology (CSE470)

The project follows a **lightweight Agile/Scrum methodology** tailored for a two-person, eight-week academic development window. The work is organized into three sprints with a combined total of 155 story points across 12 epics.

**Sprint 1 (Weeks 1–3, 42 points) — Foundation and Core Banking:** Delivered the three Solidity smart contracts, React frontend scaffolding with wallet integration, a role-based navigation system, and the complete 15-table database schema.

**Sprint 2 (Weeks 4–6, 58 points) — Lending Features and Communication:** Delivered the complete loan request and approval workflow, automatic installment generation for loans exceeding 100 ETH, the borrowing limit engine using rolling 6-month and 1-year windows, a real-time borrower–bank chat system, income verification via document upload, and hierarchical bank registration flows.

**Sprint 3 (Weeks 7–8, 55 points) — AI/ML Security and Finalization:** Delivered the Random Forest fraud detection model with SHAP-based explanations, the Isolation Forest anomaly detection prototype, a live cryptocurrency market data dashboard, an AI chatbot for user support, a comprehensive Hardhat smart contract test suite (12+ passing unit tests), and full project documentation.

Design decisions were evaluated systematically against alternatives. React and TypeScript were preferred over Vue for their richer Web3 library ecosystem (Wagmi, RainbowKit). Solidity on EVM was chosen over Solana/Rust for the larger developer ecosystem, free testnets, and OpenZeppelin support. PostgreSQL was selected over SQLite for its async support and alignment with the CSE370 schema design. Random Forest was chosen over XGBoost for its SHAP compatibility and documented 94%+ precision in blockchain security applications.

The SDLC maps across all seven stages: planning and requirements analysis, defining requirements, architecture design, development across three sprints, testing (Hardhat, integration, AI/ML evaluation), deployment on testnets via Vercel and Render at zero cost, and ongoing maintenance with model retraining.

---

## 6. System Analysis (CSE471)

The system analysis produced a comprehensive set of UML and process diagrams covering all major workflows.

**Use Case Diagram:** Documents 29 use cases across five actor types — Borrower, Bank User, World Bank Admin, National Bank, and Local Bank — covering loan requests, approvals, fund distributions, income verification, chat, market data viewing, and risk monitoring.

**Activity Diagrams (7 total):** Cover the loan request-to-repayment lifecycle, hierarchical banking fund flow, income verification, borrower–bank chat, AI chatbot interaction, market data viewing, and profile management.

**Sequence Diagrams (9 total):** Model synchronous and asynchronous interactions including the loan request with AI risk check and approval decision (49 interaction steps across 9 participants), the installment payment loop, income verification, the chat system, AI chatbot responses, the full hierarchical capital flow from World Bank down to borrower, market data retrieval, and borrowing limit calculation.

**Data Flow Diagrams:** A Level-0 context diagram shows high-level data exchanges between external entities and the system. Level-1 DFDs decompose this into 12 internal processes and 11 data stores, covering loan management, user management, communication, and admin/risk modules.

The system applies Singleton, Observer, and Adapter design patterns. Contract instances use Singleton to ensure a single shared Web3 configuration. React state and blockchain event listeners use Observer so components react automatically to data changes. Wagmi/Viem use the Adapter pattern to present a unified interface across multiple wallet providers.

---

## 7. AI/ML Security Layer

Three complementary techniques form the AI/ML security layer:

**Random Forest Classifier** serves as the primary fraud detection model. Literature review confirms that Random Forest achieves 94%+ precision in blockchain security applications (Rahouti et al., 2018). The model is trained on transaction behavioral features and generates risk scores that are presented to bank approvers before loan decisions are finalized.

**Isolation Forest** provides unsupervised anomaly detection for wallet behavior analysis — a critical capability in the absence of labeled fraud data for DeFi lending. Anomalous activity triggers alerts in the bank risk dashboard.

**SHAP (SHapley Additive exPlanations)** generates interpretable feature attributions for each risk score. Bank of England research (Bracke et al., 2019) demonstrates that SHAP attributions align with domain expert expectations and satisfy prudential regulatory requirements. Each flagged loan in the risk dashboard displays the top contributing features, enabling human reviewers to understand and override automated recommendations.

The AI/ML layer is deliberately off-chain to avoid the gas cost and latency constraints of on-chain computation, while its outputs are visible on-chain through the loan approval and event log system.

---

## 8. Feasibility and Economic Impact

The prototype operates at **zero financial cost**: smart contracts are deployed on free public testnets, the frontend is hosted on Vercel's free tier, the backend on Render's free tier, and AI/ML models are trained locally or on Google Colab. All development tooling (Hardhat, VS Code, Git, OpenZeppelin) is open-source.

At hypothetical full deployment scale with a 1,000,000 ETH reserve (approximately $2 billion at February 2026 market rates), the platform projects annual revenues of approximately $63 million at Tier 1, $51.5 million across five National Banks, and $110 million across fifty Local Banks — a combined platform revenue of roughly $224.65 million. Beyond direct revenue, the model estimates a $5–6 billion downstream economic stimulus via the fiscal multiplier effect, support for approximately 40,000 jobs through SME lending, and a 60–80% reduction in cross-border settlement costs compared to traditional correspondent banking.

---

## 9. Conclusion

The Crypto World Bank addresses a complex, multi-party coordination and trust problem in hierarchical development finance by leveraging blockchain's immutability, programmable enforcement, and cryptographic auditability. The project contributes a working prototype that is not replicated in existing DeFi protocols or academic literature: a four-tier institutional lending hierarchy combined with AI/ML-augmented risk assessment and a comprehensive three-pillar governance framework spanning network membership, business operations, and technology infrastructure.

The system directly fulfills the academic requirements of CSE370 (relational database design in 3NF), CSE470 (Agile/Scrum software engineering with sprint planning, testing, and SDLC mapping), CSE471 (system analysis through use case, activity, sequence, and data flow diagrams), and CSE446 (blockchain and smart contract development). With a working prototype, defined market and partnership strategy, transparent risk assessment via SHAP, and a phased go-to-market plan targeting academic validation followed by regulatory sandbox pilots, the Crypto World Bank represents a viable and scalable contribution to blockchain-based development finance.

---

*Repository:* [github.com/Yuvraajrahman/Cryto-World-Bank](https://github.com/Yuvraajrahman/Cryto-World-Bank)
*Word count: ~1,500 words*
