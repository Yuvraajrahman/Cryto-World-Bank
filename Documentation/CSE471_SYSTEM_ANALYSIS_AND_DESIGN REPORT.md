# CSE471 - System Analysis Report
## Crypto World Bank: System Analysis Diagrams

**Course:** CSE471 - System Analysis  
**Project:** Decentralized Crypto Reserve & Lending Bank  
**Date:** 2024

---

## Contents

| § | Section |
|---|---------|
| 1 | Project Overview |
| 2 | System Request and Business Value |
| 3 | Diagram Index |
| 4 | Use Case Diagram |
| 5 | Activity Diagrams |
| 6 | Data Flow Diagrams |
| 7 | Sequence Diagrams |
| 8 | Structure Charts and Program Specifications |
| 9 | Logical to Physical Data Models |
| 10 | User Interface Design |
| 11 | Project Timeline and Resource Allocation |
| 12 | Diagram Summary |

---

## 1. Project Overview

The Crypto World Bank is a decentralized lending platform with hierarchical banking (World Bank → National Banks → Local Banks → Users). This report presents the system analysis diagrams for the platform (Prethesis 1 scope).

---

## 2. System Request and Business Value

### 2.1 System Request

- **Project sponsor:** BracU CSE (BCOLBD 2025 guideline).
- **Business need:** Transparent, on-chain lending with AI/ML fraud detection; hierarchical banking structure for scalability.
- **Expected benefits:** Auditability, reduced fraud risk, financial inclusion via crypto-backed loans.

### 2.2 Feasibility Study

| Type | Outcome |
|------|---------|
| **Technical** | Feasible — EVM/Solidity, React, PostgreSQL, ML (Random Forest, Isolation Forest) are mature. |
| **Economic** | Feasible — free testnets, Vercel/Render free tier, no real crypto required. |
| **Operational** | Feasible — 2-person team, 8-week timeline, supervisor oversight. |

Full feasibility analysis: `WHITEPAPER_BCOLBD2025.md` §VII.

---

## 3. Diagram Index (All Files in Documentation/Diagrams/CSE471/)

| File Name | Section |
|-----------|---------|
| Usecase diagram.png | §4 Use Case Diagram |
| Activity Diagram -  Loan Request to Repayment Flow.png | §5.1 |
| Activity Diagram Hierarchical Banking Flow.png | §5.2 |
| Activity Diagram Income Verification Flow.png | §5.3 |
| Activity Diagram Chat System Flow.png | §5.4 |
| Activity Diagram AI Chatbot Interaction Flow.png | §5.5 |
| activity diagram Market Data Viewing Flow.png | §5.6 |
| Activity Diagram Profile Management Flow.png | §5.7 |
| Dataflow Diagram (Context Diagram Level - 0).png | §6.1 Data Flow Context |
| Data flow diagram (level - 1) .png | §6.2 Data Flow Level 1 |
| dataflow diagram 2 (level -1).png | §6.2 Data Flow Level 1 |
| Sequence Diagram 1 Loan Request, AI Risk Check, and Approval Decision.png | §7.1 |
| Sequence Diagram 1B  Reject Path — alt [Reject].png | §7.2 |
| Sequence Diagram 2  Installment Payment Loop.png | §7.3 |
| Sequence Diagram 3  Income Verification.png | §7.4 |
| Sequence Diagram 4 Chat System.png | §7.5 |
| Sequence Diagram 5 AI Chatbot Interaction.png | §7.6 |
| Sequence Diagram 6 Hierarchical Banking (World Bank → National Bank → Local Bank → Borrower).png | §7.7 |
| Sequence Diagram 7 Market Data Retrieval.png | §7.8 |
| Sequence Diagram 8 Borrowing Limit Calculation.png | §7.9 |

---

## 4. Use Case Diagram

![Use Case Diagram](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Usecase%20diagram.png)

**Description:** Shows actors (Borrower, Bank User, World Bank, National Bank, Local Bank) and their interactions with the system.

---

## 5. Activity Diagrams

### 5.1 Loan Request to Repayment Flow

![Activity Diagram - Loan Request to Repayment](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20-%20%20Loan%20Request%20to%20Repayment%20Flow.png)

**Description:** End-to-end flow from loan request through approval to repayment.

### 5.2 Hierarchical Banking Flow

![Activity Diagram Hierarchical Banking](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20Hierarchical%20Banking%20Flow.png)

**Description:** Flow of funds and operations across World Bank, National Bank, and Local Bank.

### 5.3 Income Verification Flow

![Activity Diagram Income Verification](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20Income%20Verification%20Flow.png)

**Description:** First-time borrower income proof upload and bank review process.

### 5.4 Chat System Flow

![Activity Diagram Chat System](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20Chat%20System%20Flow.png)

**Description:** Borrower–bank messaging flow within a loan context.

### 5.5 AI Chatbot Interaction Flow

![Activity Diagram AI Chatbot](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20AI%20Chatbot%20Interaction%20Flow.png)

**Description:** User interaction with the AI chatbot for queries and support.

### 5.6 Market Data Viewing Flow

![Activity Diagram Market Data](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/activity%20diagram%20Market%20Data%20Viewing%20Flow.png)

**Description:** Flow for viewing cryptocurrency market data and prices.

### 5.7 Profile Management Flow

![Activity Diagram Profile Management](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20Profile%20Management%20Flow.png)

**Description:** User profile setup, terms acceptance, and preferences.

---

## 6. Data Flow Diagrams

### 6.1 Context Diagram (Level 0)

![Dataflow Context Diagram Level 0](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Dataflow%20Diagram%20(Context%20Diagram%20Level%20-%200).png)

**Description:** High-level view of data flows between external entities and the system.

### 6.2 Data Flow Diagram Level 1

![Data Flow Diagram Level 1](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Data%20flow%20diagram%20(level%20-%201)%20.png)

![Data Flow Diagram Level 1 (2)](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/dataflow%20diagram%202%20(level%20-1).png)

**Description:** Decomposed view of internal processes and data flows.

---

## 7. Sequence Diagrams

### 7.1 Loan Request, AI Risk Check, and Approval

![Sequence Diagram 1](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%201%20Loan%20Request%2C%20AI%20Risk%20Check%2C%20and%20Approval%20Decision.png)

**Description:** Borrower submits loan request; system performs AI risk check; bank user approves or rejects.

### 7.2 Reject Path (Alternative)

![Sequence Diagram 1B](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%201B%20%20Reject%20Path%20%E2%80%94%20alt%20%5BReject%5D.png)

**Description:** Alternative flow when bank user rejects a loan request.

### 7.3 Installment Payment Loop

![Sequence Diagram 2](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%202%20%20Installment%20Payment%20Loop.png)

**Description:** Borrower pays installments; system updates loan status until completion.

### 7.4 Income Verification

![Sequence Diagram 3](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%203%20%20Income%20Verification.png)

**Description:** Borrower uploads income proof; bank user reviews and approves/rejects.

### 7.5 Chat System

![Sequence Diagram 4](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%204%20Chat%20System.png)

**Description:** Message exchange between borrower and bank within a loan context.

### 7.6 AI Chatbot Interaction

![Sequence Diagram 5](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%205%20AI%20Chatbot%20Interaction.png)

**Description:** User asks question; AI chatbot processes and responds.

### 7.7 Hierarchical Banking (WB → NB → LB → Borrower)

![Sequence Diagram 6](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%206%20Hierarchical%20Banking%20(World%20Bank%20%E2%86%92%20National%20Bank%20%E2%86%92%20Local%20Bank%20%E2%86%92%20Borrower).png)

**Description:** Fund flow and interactions across the banking hierarchy.

### 7.8 Market Data Retrieval

![Sequence Diagram 7](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%207%20Market%20Data%20Retrieval.png)

**Description:** System fetches and displays cryptocurrency market data.

### 7.9 Borrowing Limit Calculation

![Sequence Diagram 8](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%208%20Borrowing%20Limit%20Calculation.png)

**Description:** System calculates borrower's 6-month and 1-year borrowing limits.

---

## 8. Structure Charts and Program Specifications

### 8.1 Structure Chart (Logical → Physical Process)

```
Crypto World Bank System
├── Loan Management Module
│   ├── Request Loan (form validation → contract call → DB update)
│   ├── Approve/Reject Loan (permission check → sign tx → event listener)
│   └── Pay Installment (schedule fetch → contract call → status update)
├── User Management Module
│   ├── Connect Wallet (provider → address → role lookup)
│   ├── Profile (fetch/update settings, terms acceptance)
│   └── Income Verification (upload → hash → store → notify bank)
├── Communication Module
│   ├── Chat (send/receive messages, read status)
│   └── AI Chatbot (NLP → intent → response)
└── Admin Module
    ├── Risk Dashboard (fetch logs, display scores)
    └── Market Data (API fetch → cache → chart)
```

### 8.2 Program Specifications (Sample)

| Module | Input | Process | Output |
|--------|-------|---------|--------|
| **Request Loan** | amount, purpose, wallet, bank_id | Validate limit, call contract, store tx_hash | loan_id, status |
| **Borrowing Limit** | borrower_id | Sum transactions in 6mo/1yr windows, apply rules | six_month_remaining, one_year_remaining |

---

## 9. Logical to Physical Data Models

| Logical (ER) | Physical (Implementation) |
|--------------|----------------------------|
| Entity BORROWER | Table `BORROWER` (PostgreSQL); wallet_address indexed |
| Relationship BORROWER → LOAN_REQUEST | FK `borrower_id` in `LOAN_REQUEST` |
| Attribute blockchain_tx_hash | VARCHAR(66), UNIQUE, for explorer links |
| Polymorphic CHAT (sender/receiver) | `sender_type` + `sender_id` (borrower vs bank_user) |

**Data storage formats:** PostgreSQL (relational); blockchain (immutable ledger); file storage for INCOME_PROOF (path + hash in DB). Indexes on frequently queried columns (status, date, wallet).

---

## 10. User Interface Design

### 10.1 Navigation Design

- **AppBar:** Logo, role-based menu (Dashboard, Loans, Deposit, Chat, Profile, Risk Dashboard for bank users).
- **Routes:** `/`, `/loan`, `/deposit`, `/chat`, `/profile`, `/risk-dashboard`, `/market`.
- **Breadcrumbs:** Context within loan/chat flows.

### 10.2 Input Design

- **Loan request:** Amount (number), purpose (text), bank selection (dropdown).
- **Wallet:** MetaMask/WalletConnect connect button; address display (truncated).
- **Chat:** Text input, send button; file upload for income proof (PDF, image).

### 10.3 Output Design

- **Dashboard:** Cards for active loans, borrowing limit, pending requests.
- **Loan list:** Table with status, amount, deadline, pay button.
- **Risk dashboard:** Table of flagged loans, risk scores, SHAP explanations.

---

## 11. Project Timeline and Resource Allocation

| Week | Module | Resources |
|------|--------|-----------|
| 1–3 | Foundation (contracts, UI, DB) | 2 developers, Sprint 1 |
| 4–6 | Lending, Chat, Profiles | 2 developers, Sprint 2 |
| 7–8 | AI/ML, Testing, Deployment | 2 developers, Sprint 3 |

Aligns with CSE471 Lab: Module 1–4 (5 features each) over Weeks 4–8. See `CSE470_SOFTWARE_ENGINEERING REPORT.md` for detailed sprint backlog.

---

## 12. Diagram Summary

| Type | Count | Purpose |
|------|-------|---------|
| Use Case | 1 | Actor–system interactions |
| Data Flow | 3 | Data movement (context + level 1) |
| Activity | 7 | Process flows |
| Sequence | 9 | Message/event ordering |

---

**Document Version:** 1.1  
**Course:** CSE471 - System Analysis
