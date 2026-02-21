# CSE471 - System Analysis Report
## Crypto World Bank: System Analysis Diagrams

**Course:** CSE471 - System Analysis  
**Project:** Decentralized Crypto Reserve & Lending Bank  
**Date:** 2024

---

## 1. Project Overview

The Crypto World Bank is a decentralized lending platform with hierarchical banking (World Bank → National Banks → Local Banks → Users). This report presents the system analysis diagrams for the platform.

---

## 2. Diagram Index (All Files in Documentation/Diagrams/CSE471/)

| File Name | Section |
|-----------|---------|
| Usecase diagram.png | §3 Use Case Diagram |
| Activity Diagram -  Loan Request to Repayment Flow.png | §4.1 |
| Activity Diagram Hierarchical Banking Flow.png | §4.2 |
| Activity Diagram Income Verification Flow.png | §4.3 |
| Activity Diagram Chat System Flow.png | §4.4 |
| Activity Diagram AI Chatbot Interaction Flow.png | §4.5 |
| activity diagram Market Data Viewing Flow.png | §4.6 |
| Activity Diagram Profile Management Flow.png | §4.7 |
| Dataflow Diagram (Context Diagram Level - 0).png | §5.1 Data Flow Context |
| Data flow diagram (level - 1) .png | §5.2 Data Flow Level 1 |
| dataflow diagram 2 (level -1).png | §5.2 Data Flow Level 1 |
| Sequence Diagram 1 Loan Request, AI Risk Check, and Approval Decision.png | §6.1 |
| Sequence Diagram 1B  Reject Path — alt [Reject].png | §6.2 |
| Sequence Diagram 2  Installment Payment Loop.png | §6.3 |
| Sequence Diagram 3  Income Verification.png | §6.4 |
| Sequence Diagram 4 Chat System.png | §6.5 |
| Sequence Diagram 5 AI Chatbot Interaction.png | §6.6 |
| Sequence Diagram 6 Hierarchical Banking (World Bank → National Bank → Local Bank → Borrower).png | §6.7 |
| Sequence Diagram 7 Market Data Retrieval.png | §6.8 |
| Sequence Diagram 8 Borrowing Limit Calculation.png | §6.9 |

---

## 3. Use Case Diagram

![Use Case Diagram](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Usecase%20diagram.png)

**Description:** Shows actors (Borrower, Bank User, World Bank, National Bank, Local Bank) and their interactions with the system.

---

## 4. Activity Diagrams

### 4.1 Loan Request to Repayment Flow

![Activity Diagram - Loan Request to Repayment](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20-%20%20Loan%20Request%20to%20Repayment%20Flow.png)

**Description:** End-to-end flow from loan request through approval to repayment.

### 4.2 Hierarchical Banking Flow

![Activity Diagram Hierarchical Banking](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20Hierarchical%20Banking%20Flow.png)

**Description:** Flow of funds and operations across World Bank, National Bank, and Local Bank.

### 4.3 Income Verification Flow

![Activity Diagram Income Verification](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20Income%20Verification%20Flow.png)

**Description:** First-time borrower income proof upload and bank review process.

### 4.4 Chat System Flow

![Activity Diagram Chat System](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20Chat%20System%20Flow.png)

**Description:** Borrower–bank messaging flow within a loan context.

### 4.5 AI Chatbot Interaction Flow

![Activity Diagram AI Chatbot](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20AI%20Chatbot%20Interaction%20Flow.png)

**Description:** User interaction with the AI chatbot for queries and support.

### 4.6 Market Data Viewing Flow

![Activity Diagram Market Data](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/activity%20diagram%20Market%20Data%20Viewing%20Flow.png)

**Description:** Flow for viewing cryptocurrency market data and prices.

### 4.7 Profile Management Flow

![Activity Diagram Profile Management](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Activity%20Diagram%20Profile%20Management%20Flow.png)

**Description:** User profile setup, terms acceptance, and preferences.

---

## 5. Data Flow Diagrams

### 5.1 Context Diagram (Level 0)

![Dataflow Context Diagram Level 0](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Dataflow%20Diagram%20(Context%20Diagram%20Level%20-%200).png)

**Description:** High-level view of data flows between external entities and the system.

### 5.2 Data Flow Diagram Level 1

![Data Flow Diagram Level 1](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Data%20flow%20diagram%20(level%20-%201)%20.png)

![Data Flow Diagram Level 1 (2)](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/dataflow%20diagram%202%20(level%20-1).png)

**Description:** Decomposed view of internal processes and data flows.

---

## 6. Sequence Diagrams

### 6.1 Loan Request, AI Risk Check, and Approval

![Sequence Diagram 1](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%201%20Loan%20Request%2C%20AI%20Risk%20Check%2C%20and%20Approval%20Decision.png)

**Description:** Borrower submits loan request; system performs AI risk check; bank user approves or rejects.

### 6.2 Reject Path (Alternative)

![Sequence Diagram 1B](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%201B%20%20Reject%20Path%20%E2%80%94%20alt%20%5BReject%5D.png)

**Description:** Alternative flow when bank user rejects a loan request.

### 6.3 Installment Payment Loop

![Sequence Diagram 2](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%202%20%20Installment%20Payment%20Loop.png)

**Description:** Borrower pays installments; system updates loan status until completion.

### 6.4 Income Verification

![Sequence Diagram 3](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%203%20%20Income%20Verification.png)

**Description:** Borrower uploads income proof; bank user reviews and approves/rejects.

### 6.5 Chat System

![Sequence Diagram 4](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%204%20Chat%20System.png)

**Description:** Message exchange between borrower and bank within a loan context.

### 6.6 AI Chatbot Interaction

![Sequence Diagram 5](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%205%20AI%20Chatbot%20Interaction.png)

**Description:** User asks question; AI chatbot processes and responds.

### 6.7 Hierarchical Banking (WB → NB → LB → Borrower)

![Sequence Diagram 6](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%206%20Hierarchical%20Banking%20(World%20Bank%20%E2%86%92%20National%20Bank%20%E2%86%92%20Local%20Bank%20%E2%86%92%20Borrower).png)

**Description:** Fund flow and interactions across the banking hierarchy.

### 6.8 Market Data Retrieval

![Sequence Diagram 7](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%207%20Market%20Data%20Retrieval.png)

**Description:** System fetches and displays cryptocurrency market data.

### 6.9 Borrowing Limit Calculation

![Sequence Diagram 8](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE471/Sequence%20Diagram%208%20Borrowing%20Limit%20Calculation.png)

**Description:** System calculates borrower's 6-month and 1-year borrowing limits.

---

## 7. Diagram Summary

| Type | Count | Purpose |
|------|-------|---------|
| Use Case | 1 | Actor–system interactions |
| Data Flow | 3 | Data movement (context + level 1) |
| Activity | 7 | Process flows |
| Sequence | 9 | Message/event ordering |

---

**Document Version:** 1.0  
**Course:** CSE471 - System Analysis
