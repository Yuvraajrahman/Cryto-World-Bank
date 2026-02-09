# Pre‑Thesis–1 Project Report  
## Decentralized Crypto World Bank with AI‑Enhanced Security

**Degree:** B.Sc. in Computer Science and Engineering  
**Project Type:** Pre‑Thesis–1 (Planning and Design Phase)  
**Student:** *[Your Name]*  
**ID:** *[Your ID]*  
**Department:** Computer Science and Engineering  
**University:** *[Your University Name]*  
**Supervisors:** *[Supervisor Name]*  
**Date:** *[Month Year]*

---

## Abstract

The global financial ecosystem is increasingly exploring blockchain technology to improve transparency, security, and accessibility in lending and reserve management.  
This pre‑thesis project proposes a **Crypto World Bank** – a decentralized, on‑chain reserve and lending platform inspired by the hierarchical structure of traditional institutions (World Bank → National Banks → Local Banks → Users), augmented with **AI/ML‑driven security analytics**.

The proposed system allows users to request loans from local banks, enforces hierarchical money flow, supports installment‑based repayments for large loans (e.g., ≥ 100 ETH), and integrates a planned AI chatbot for customer support.  
Special attention is given to **risk‑aware borrowing limits** based on transaction history and repayment behavior, as well as a **future AI/ML layer** designed to monitor lending routes and detect fraud or anomalies.

Within Pre‑Thesis–1, the work focuses on **requirements analysis, system modeling, database design, and software engineering planning**, aligned with three core courses: CSE370 (Database Management), CSE470 (Software Engineering), and CSE471 (System Analysis).  
This report documents the system concept, reviews relevant literature on decentralized finance and AI‑based security, describes the proposed methodology and architecture, and outlines a concrete implementation roadmap and future enhancements.

**Keywords:** Blockchain, DeFi, Decentralized Lending, Smart Contracts, AI Security, Fraud Detection, System Analysis, Database Design, Agile Software Engineering

---

## 1. Introduction

### 1.1 Background and Motivation

Traditional international lending institutions such as the World Bank and IMF rely on multi‑layered hierarchies of **global, national, and local financial actors**.  
While these structures provide oversight and risk management, they suffer from:

- **Limited transparency** – internal ledgers and approval processes are not publicly auditable.  
- **High friction and delays** – cross‑border transfers often require multiple intermediaries.  
- **Manual risk assessment** – fraud detection and creditworthiness analysis are largely human‑driven.

At the same time, **Decentralized Finance (DeFi)** has demonstrated that **smart contracts** can automate lending, borrowing, and collateral management in a transparent and programmable way.  
However, existing DeFi platforms typically:

- Focus on **peer‑to‑pool** or **over‑collateralized** lending,  
- Do not model hierarchical banking structures (world → national → local),  
- Provide limited integration with **AI‑driven risk analytics** and **explainable security**.

This project aims to bridge this gap by designing a **Crypto World Bank** that combines:

- Hierarchical money flow similar to World Bank → National Bank → Local Bank → User, and  
- Smart contract–driven transparency with **future AI/ML‑based security monitoring**.

### 1.2 Problem Statement

Current DeFi lending systems and traditional banks each address only part of the overall problem:

- Traditional systems provide governance and hierarchical control but lack transparency and programmability.  
- DeFi platforms provide transparency and automation but lack institutional hierarchy, regulatory alignment, and integrated AI risk analysis.

**Problem:** How can we design a **hierarchical, blockchain‑based lending platform** that:

1. Models **World Bank → National Bank → Local Bank → User** roles and money flow,  
2. Enforces **borrowing limits and installment repayments** based on transaction history and repayment behavior,  
3. Prepares the data and architecture for **future AI/ML security layers** (fraud/anomaly detection and risk‑aware decisions), and  
4. Provides a **secure, user‑friendly interface** with clear blockchain‑centric visual feedback?

### 1.3 Objectives

The specific objectives for Pre‑Thesis–1 are:

1. **Conceptual Design & System Analysis (CSE471)**  
   - Define actors, use cases, interaction flows, and hierarchical money movement.  
   - Produce detailed top‑down sequential diagrams for core flows (loan request, installments, chat, AI chatbot, borrowing limits, income verification, hierarchical banking).

2. **Database Design (CSE370)**  
   - Design a normalized relational schema supporting users, banks, loans, installments, transactions, chat, AI logs, and market data.  
   - Ensure that the schema supports future AI/ML security analysis over historical data.

3. **Software Engineering & Process (CSE470)**  
   - Plan a realistic **Agile/Scrum‑based development process** over three sprints (2‑month window).  
   - Define the architecture, technology stack, and implementation roadmap.

4. **Prototype Alignment**  
   - Align the theoretical design with an existing prototype smart contract (`WorldBankReserve.sol`) and React frontend, extending requirements to the hierarchical Crypto World Bank vision.

5. **Future Implementation Plan**  
   - Define clear milestones and enhancements for the full thesis phase (smart contract extensions, database integration, AI/ML backend, full chat and chatbot).

### 1.4 Scope of Pre‑Thesis–1

Within this stage, **the emphasis is on planning and documentation**, not on completing the entire product:

- Completed / documented in detail:
  - System requirements and architecture  
  - Database ERD and relational schema  
  - Core use cases, flows, and interaction diagrams  
  - Agile project plan (3 sprints, 2‑month schedule)

- To be implemented in later phases:
  - Full multi‑level smart contract hierarchy (World/National/Local)  
  - Production‑ready database backend and APIs  
  - AI/ML models for security and chatbot  
  - Final integrated, deployable DApp

---

## 2. Literature Review (Summary)

> **Note:** A detailed, per‑paper review (15 items) and reference list is maintained separately in the `LiteratureReview/` folder.  
> This section presents a synthesized overview of related work, without going deeply into each paper.

### 2.1 Decentralized Lending and DeFi Protocols

Existing DeFi lending platforms (e.g., MakerDAO, Aave, Compound) demonstrate how **smart contracts can manage lending pools, interest rates, and collateral on‑chain**.  
Common themes across the literature include:

- **Over‑collateralization:** Most DeFi lending is designed to be over‑collateralized, reducing credit risk but limiting accessibility for under‑collateralized borrowers.  
- **Pool‑based lending:** Users deposit into shared liquidity pools instead of interacting with a hierarchical set of institutions.  
- **On‑chain transparency:** All balances and loan states are public, enabling independent auditing and risk analysis.

For this project, these works motivate the use of **smart contracts for reserve and loan bookkeeping**, but the proposed Crypto World Bank goes further by introducing:

- An explicit **hierarchy of bank roles**, and  
- Off‑chain **AI/ML security analytics** consuming on‑chain and off‑chain data.

### 2.2 Blockchain‑Based Banking and Hierarchical Models

Some research explores how blockchain can support **central bank digital currencies (CBDCs)**, cross‑border settlements, or inter‑bank settlement layers.  
These works discuss:

- Using permissioned or hybrid blockchains for **central bank–to–commercial bank** money issuance and settlement.  
- Improving reconciliation, auditability, and compliance via **shared ledgers** among financial institutions.

The Crypto World Bank design generalizes these ideas into an **educational prototype** where:

- A **World Crypto Bank** plays a role similar to a central/wholesale institution,  
- **National** and **Local Banks** act as intermediate and retail actors, and  
- **End users (borrowers)** interact with Local Banks only, preserving chain of command.

### 2.3 AI/ML for Financial Fraud and Risk Detection

The literature on AI/ML in finance highlights several approaches:

- **Supervised learning** (Random Forest, Gradient Boosting, Neural Networks) for transaction‑level fraud detection using labeled data.  
- **Unsupervised anomaly detection** (Autoencoders, Isolation Forest, clustering) for spotting suspicious patterns in high‑dimensional transactional data.  
- **Explainable AI (XAI)** techniques (e.g., SHAP, LIME) to provide **human‑interpretable justifications** for model outputs.

These insights strongly influence the data structures defined in the database design:

- Detailed **transaction logs** and **loan events** are stored in a way that supports feature extraction.  
- An `AI_ML_SECURITY_LOG` table is planned to capture risk scores, model metadata, and explanations for future analysis.

### 2.4 Conversational Agents and Chatbots in Financial Services

Recent work on conversational AI in banking shows how **chatbots enhance customer support** by:

- Answering frequent questions (balances, payment due dates, limits).  
- Guiding users through complex flows (loan applications, KYC, dispute resolution).  
- Integrating with backend systems to provide **personalized, contextual responses**.

The proposed AI chatbot in this project follows similar principles:

- Natural language questions such as *“What is my current loan limit?”* or *“How much do I need to pay this month?”*  
- Backed by **structured queries** over the loan, installment, and borrowing limit data.  
- Extended later with ML‑based intent recognition and dialogue management.

### 2.5 Summary and Identified Gaps

Across these bodies of work, three key gaps motivate the Crypto World Bank design:

1. **Lack of hierarchical, world‑to‑national‑to‑local structure** in existing DeFi lending protocols.  
2. **Limited integration of full transaction history, installment behavior, and multi‑actor workflows** into AI security pipelines.  
3. **Insufficient educational, end‑to‑end examples** that connect blockchain, database design, software engineering process, and system analysis into one coherent academic project.

The rest of this report describes how the proposed system addresses these gaps at the design level in Pre‑Thesis–1.

---

## 3. System Overview and Requirements

### 3.1 High‑Level Concept

The Crypto World Bank platform is a **web‑based DApp** built on a blockchain network (e.g., Ethereum/Polygon testnets) that:

- Manages a global **crypto reserve** at the World Bank level.  
- Enables **National Banks** to borrow from this reserve and **Local Banks** to borrow from National Banks.  
- Allows **Users/Borrowers** to request loans only from Local Banks in their own country.  
- Records all key financial actions on‑chain, while richer analytics and history are stored in an off‑chain relational database.

### 3.2 Actors and Role Hierarchy

- **World Crypto Bank**  
  - Manages the global reserve.  
  - Lends to National Banks.  
  - Can pause or emergency‑stop operations.

- **National Banks**  
  - Borrow from the World Bank.  
  - Lend to Local Banks within their country.  
  - Aggregate risk and liquidity at the national level.

- **Local Banks**  
  - Borrow from National Banks.  
  - Lend to end users (borrowers) within permitted limits.  
  - Manage loan approval, rejection, and installment plans.

- **Bank Users (Approvers)**  
  - Exactly **one approver per bank** has authority to approve/reject/modify loan requests.  
  - Communicate with borrowers via the integrated chat system.

- **Borrowers / Users**  
  - Request loans only from **Local Banks** in their country.  
  - Must upload income proof for first‑time borrowing.  
  - Repay loans, often via installments for large amounts (≥ 100 ETH).  
  - Interact with both human bank staff (chat) and AI chatbot.

### 3.3 Functional Requirements (Summary)

- **Loan Management**
  - Create, view, and manage loan requests.  
  - Approve / reject / modify requests (bank approver only).  
  - Installment plans automatically generated for large loans (e.g., ≥ 100 ETH).  
  - Show repayment deadlines and schedules on borrower dashboards.

- **Borrowing Limits and Risk Control**
  - Calculate per‑user borrowing limits over **6‑month** and **1‑year** windows.  
  - Enforce rule: if a user borrowed amount \(X\) in one year, they cannot borrow \(X/2\) more within the next year unless all installments are paid.  
  - Exception: if the borrower has **3 sequential loans fully repaid on time**, they may hold up to **2 concurrent loans**.

- **Chat and AI Chatbot**
  - Real‑time chat between borrowers and bank approvers per loan.  
  - AI chatbot to answer generic queries (loan limits, payment due, which bank to contact).

- **Crypto Market Visualization**
  - Display live price charts of the cryptocurrency being borrowed.  
  - Visual alignment with blockchain aesthetics and security cues.

- **Profile and Terms & Conditions**
  - Dedicated profile views for all roles (World Bank, National Bank, Local Bank, Bank User, Borrower).  
  - Terms & Conditions page per role, with acceptance tracking.

### 3.4 Non‑Functional Requirements (Summary)

- **Security:**  
  Role‑based access control, secure wallet integration, strong database access control, future AI/ML monitoring.

- **Performance:**  
  Responsive UI (< 2 s load), reasonable blockchain confirmation latency, cached market data.

- **Scalability:**  
  Database partitioning for transaction and security logs, support for multiple countries/banks.

- **Usability:**  
  Clean Material Design 3 UI with clear blockchain‑oriented visual elements and guidance.

---

## 4. Methodology

### 4.1 Development Process – Agile/Scrum

The project follows a **lightweight Agile/Scrum** methodology tailored for an academic environment:

- **Total Duration:** 2 months (Pre‑Thesis–1 planning; implementation continues later).  
- **Sprints:** 3 conceptual sprints:
  - **Sprint 1:** Core blockchain prototype and architecture.  
  - **Sprint 2:** Lending, limits, installments, and chat design.  
  - **Sprint 3:** AI/ML data preparation, risk flows, and chatbot design.

Each sprint includes:

- Sprint Planning (defining user stories and tasks).  
- Design workshops (system analysis, UML diagrams, database schema review).  
- Documentation updates (this report and course‑specific documents).

The detailed sprint backlogs and user stories are documented in `CSE470_SOFTWARE_ENGINEERING.md`.

### 4.2 System Analysis Approach (CSE471)

The system is analyzed using classical **object‑oriented and use‑case‑driven** techniques:

- Identification of actors and high‑level use cases.  
- Detailed **use case descriptions** with preconditions, main and alternate flows.  
- **Top‑down expanding tree sequential diagrams** for:
  - Loan request and approval flow.  
  - Installment payment flow.  
  - Borrower–bank chat flow.  
  - AI chatbot interaction flow.  
  - Market data visualization flow.  
  - Profile management flow.  
  - Borrowing limit calculation flow.  
  - Income verification flow.  
  - Hierarchical banking money flow.

These diagrams are organized into the `CSE471_SYSTEM_ANALYSIS.md` main file and multiple sub‑files in the `Documentation/` directory.

### 4.3 Database Design Approach (CSE370)

Database design follows a **top‑down ER modeling** and **bottom‑up normalization** strategy:

- Start from informal requirements (roles, loans, installments, transactions, chat, AI logs).  
- Derive an **Entity–Relationship (ER) model** for core entities (banks, users, loans, installments, transactions).  
- Apply normalization to ensure **3rd Normal Form (3NF)** while allowing selective denormalization (e.g., borrowing limits cache) for performance.  
- Map the ER model to a concrete **relational schema** with primary/foreign keys, indexes, and constraints.

The full schema and relational diagrams are documented in `CSE370_DATABASE_MANAGEMENT.md`.

### 4.4 Architecture and Technology Stack

- **Smart Contracts:** Solidity smart contracts (currently `WorldBankReserve.sol`), to be extended with multi‑bank roles and installment logic.  
- **Frontend:** React + TypeScript + Vite + Material‑UI (MD3 theme).  
- **Wallet & Blockchain Tools:** MetaMask, WalletConnect, wagmi, viem.  
- **Backend / ML Services:** Python (FastAPI) microservice for fraud/anomaly detection and chatbot APIs (planned).  
- **Database:** Relational DBMS (e.g., PostgreSQL/MySQL) implementing the designed schema.  
- **AI/ML:** Prototype models for fraud detection, anomaly detection, and XAI, with plans for training and online inference in later phases.

---

## 5. Work Completed in Pre‑Thesis–1

Although full implementation is intentionally deferred, significant design and partial prototyping work has been completed.

### 5.1 Smart Contract Prototype

- A **baseline smart contract** (`WorldBankReserve.sol`) has been implemented that:  
  - Manages a reserve balance.  
  - Allows users to deposit to the reserve.  
  - Supports loan requests, approvals, and rejections.  
  - Emits events for reserve deposits and loan lifecycle changes.

This prototype validates the feasibility of **on‑chain reserve and lending logic** and will be generalized into a multi‑bank architecture in later phases.

### 5.2 Frontend DApp

- A React/TypeScript frontend has been structured with pages for:
  - Dashboard  
  - Deposit  
  - Loan  
  - Admin/Bank view  
  - Risk/AI dashboard (UI mocks)  
  - QR and auxiliary pages

The UI already emphasizes **blockchain visuals and security cues** (on‑chain stats, AI security indicators, theme matching).

### 5.3 Database Design (CSE370 Deliverables)

- A comprehensive relational schema has been designed, including:
  - `WORLD_BANK`, `NATIONAL_BANK`, `LOCAL_BANK`, `BANK_USER`, `BORROWER`.  
  - `LOAN_REQUEST`, `INSTALLMENT`, `TRANSACTION`, `BORROWING_LIMIT`.  
  - `CHAT_MESSAGE`, `AI_CHATBOT_LOG`, `AI_ML_SECURITY_LOG`, `MARKET_DATA`, `PROFILE_SETTINGS`, `INCOME_PROOF`.

- Relationships and constraints enforce:
  - Single approver per bank.  
  - One loan request per borrower per bank at a time.  
  - Clean modeling of installment schedules and payment tracking.  
  - Rich logging for future AI/ML analysis.

### 5.4 System Analysis (CSE471 Deliverables)

- Use case diagrams and flows have been developed for:
  - Loan lifecycle (request, approve/reject, repay).  
  - Borrowing limit calculation and enforcement.  
  - Income verification for first‑time borrowers.  
  - Chat interactions and AI chatbot support.  
  - Hierarchical banking and money flow.

These analyses form the **blueprint for the eventual implementation**.

### 5.5 Software Engineering Plan (CSE470 Deliverables)

- An Agile project plan has been defined:
  - 3 sprints with explicit goals and user stories.  
  - Backlogs organized by epics (Smart Contracts, Lending Features, Chat, AI, Security, UX).  
  - Clear mapping from user stories to system components and technologies.

This plan provides the **execution strategy** for the full thesis phase.

---

## 6. Proposed Design Details (Selected Aspects)

This section highlights key design decisions that are central to the Crypto World Bank vision.

### 6.1 Installment‑Based Lending

- Any loan **≥ 100 ETH** is automatically converted into an installment plan:  
  - Number of installments and schedule derived from configurable policies.  
  - Each installment tracked individually with `pending`, `paid`, or `overdue` status.  
  - Deadlines clearly visualized in borrower dashboards.

- This improves **affordability** for large loans while preserving accountable tracking and future risk analysis.

### 6.2 Borrowing Limit Enforcement

- Borrowing limits are computed from:
  - Rolling **6‑month** and **1‑year** loan approval history.  
  - Active loan count and repayment behavior.  
  - Special treatment for users with **three sequential on‑time, fully paid loans** (may hold two active loans).

- The enforcement rules are embedded in:
  - Smart contract pre‑conditions for new loan requests (on‑chain constraints), and  
  - Off‑chain database queries and logic (for richer calculations).

### 6.3 Hierarchical Money Flow

- All funds conceptually originate from the **World Crypto Bank** and cascade downward:
  - World → National → Local → Borrower, and repay in reverse order.  
  - Borrowers **cannot** request loans directly from National or World Bank.  
  - This reinforces governance and aligns with real‑world development financing structures.

### 6.4 AI/ML Security Layer (Planned)

- The design explicitly prepares for:
  - **Fraud detection models** using transaction and loan features.  
  - **Anomaly detection** over user and bank behaviors.  
  - **Explainability logs** (`AI_ML_SECURITY_LOG`) capturing risk scores and model explanations.  
  - Integration with the bank dashboard to present risk insights before approvals.

### 6.5 AI Chatbot (Planned)

- The chatbot will:
  - Answer queries like “What is my loan limit?”, “How much do I owe this month?”, “Which bank approved my loan?”.  
  - Use intent classification and entity extraction to map natural language queries to DB queries.  
  - Log interactions in `AI_CHATBOT_LOG` for future ML training and quality improvement.

---

## 7. Future Work and Implementation Roadmap

The full thesis phase will focus on **turning the documented design into a working system**.

### 7.1 Smart Contract Extensions

- Extend `WorldBankReserve.sol` into a family of contracts (or a single multi‑role contract) that supports:
  - World/National/Local bank roles and reserves.  
  - Installment generation and repayment tracking on‑chain.  
  - Role‑based access for one approver per bank.  
  - On‑chain enforcement of some borrowing rules.

### 7.2 Backend and Database Implementation

- Implement the relational schema defined in CSE370 deliverables.  
- Build a secure API layer (REST/GraphQL) for:
  - Loan, installment, and transaction queries.  
  - Chat persistence and retrieval.  
  - AI/ML inference requests and log storage.

### 7.3 AI/ML Models

- Prototype and evaluate:
  - Fraud detection models using historical loan/transaction data.  
  - Anomaly detection for abnormal patterns in borrowing/repayment.  
  - A basic chatbot model connected to the project’s knowledge base and schema.

### 7.4 UI/UX Enhancements

- Integrate all flows into a polished, user‑tested frontend:  
  - Full profile sections per role.  
  - Visualizations for installment calendars and borrowing limits.  
  - Dynamic crypto price charts with blockchain styling.

### 7.5 Evaluation and Validation

- Define metrics such as:
  - System correctness (loan state transitions).  
  - Usability (user feedback, task completion times).  
  - Security coverage (types of attacks detectable).  
  - Performance (latency, throughput).

---

## 8. Conclusion

This Pre‑Thesis–1 report has presented a **comprehensive design** for a Crypto World Bank system that unifies:

- Blockchain‑based decentralized lending,  
- Hierarchical banking structures,  
- Installment and limit‑aware loan management,  
- Planned AI/ML‑driven security analytics, and  
- Modern software engineering and database practices.

The work completed so far establishes a strong conceptual and technical foundation, aligning closely with the learning outcomes of **CSE370, CSE470, and CSE471**.  
In the full thesis phase, the focus will shift to **implementation, integration, and empirical evaluation**, using this design as a roadmap.

---

## 9. References (Placeholder)

> Detailed bibliographic entries and links will be maintained in the `LiteratureReview/` folder along with 15 individual literature review reports.  
> This section will be formatted in IEEE style in the final thesis version.


