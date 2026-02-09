# CSE471 - System Analysis
## Crypto World Bank: System Analysis Documentation

**Course:** CSE471 - System Analysis  
**Project:** Decentralized Crypto Reserve & Lending Bank  
**Date:** 2024

---

## 1. Document Overview

This document provides comprehensive system analysis for the Crypto World Bank platform, including use case diagrams, sequential diagrams, and detailed interaction flows. The documentation is organized into multiple files for better readability and maintenance.

### 1.1 Document Structure

- **Main Document (This File):** Overview, use case diagrams, system architecture
- **Sub-Files:** Detailed sequential diagrams for each interaction flow

### 1.2 Sub-Files Index

1. `CSE471_LOAN_REQUEST_FLOW.md` - Loan request and approval flow
2. `CSE471_INSTALLMENT_PAYMENT_FLOW.md` - Installment payment system flow
3. `CSE471_CHAT_SYSTEM_FLOW.md` - Borrower-bank chat system flow
4. `CSE471_AI_CHATBOT_FLOW.md` - AI chatbot interaction flow
5. `CSE471_MARKET_DATA_FLOW.md` - Market data visualization flow
6. `CSE471_PROFILE_MANAGEMENT_FLOW.md` - Profile management flow
7. `CSE471_BORROWING_LIMIT_FLOW.md` - Borrowing limit calculation flow
8. `CSE471_INCOME_VERIFICATION_FLOW.md` - First-time borrower income verification flow
9. `CSE471_HIERARCHICAL_BANKING_FLOW.md` - World Bank → National → Local banking flow

---

## 2. System Overview

### 2.1 System Purpose

The Crypto World Bank is a decentralized lending platform that implements a hierarchical banking structure:
- **Crypto World Bank** (Top Level)
  - **National Banks** (Country Level)
    - **Local Banks** (City/Region Level)
      - **Bank Users** (Authorized Approvers)
        - **Borrowers** (End Users)

### 2.2 Key Features

- Hierarchical banking structure with money flow
- Loan request and approval system
- Installment payment for loans >= 100 ETH
- Deadline tracking and reminders
- Live cryptocurrency market value visualization
- Chat system between borrowers and banks
- AI chatbot for customer support
- Borrowing limit calculation based on transaction history
- First-time borrower income verification
- AI/ML security layer (data structure for future implementation)
- Profile management for all user types
- Terms and conditions management

---

## 3. System Actors

### 3.1 Primary Actors

| Actor | Description | Responsibilities |
|-------|-------------|-----------------|
| **Borrower** | End user requesting loans | Request loans, make payments, chat with banks |
| **Bank User** | Authorized user of Local/National Bank | Approve/reject loans, chat with borrowers |
| **Local Bank Admin** | Administrator of Local Bank | Manage local bank operations |
| **National Bank Admin** | Administrator of National Bank | Manage national bank operations |
| **World Bank Admin** | Administrator of Crypto World Bank | Manage global reserve |

### 3.2 Secondary Actors

| Actor | Description | Responsibilities |
|-------|-------------|-----------------|
| **AI Chatbot** | Automated customer support | Answer user queries, provide information |
| **AI/ML Security System** | Security monitoring system | Detect fraud, anomalies, suspicious patterns |
| **Market Data API** | External cryptocurrency price service | Provide live market data |
| **Blockchain Network** | Ethereum/Polygon network | Execute smart contracts, store transactions |

---

## 4. Use Case Diagram

### 4.1 Complete Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USE CASE DIAGRAM                                    │
│                    Crypto World Bank System                                  │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │   WORLD BANK ADMIN   │
                    └──────────┬───────────┘
                               │
                               │ <<include>>
                               ▼
                    ┌──────────────────────┐
                    │  Manage Global Reserve│
                    └──────────────────────┘
                               │
                               │ <<extend>>
                               ▼
                    ┌──────────────────────┐
                    │  Lend to National Banks│
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │  NATIONAL BANK ADMIN │
                    └──────────┬───────────┘
                               │
                               │ <<include>>
                               ▼
                    ┌──────────────────────┐
                    │  Borrow from World Bank│
                    └──────────────────────┘
                               │
                               │ <<extend>>
                               ▼
                    ┌──────────────────────┐
                    │  Lend to Local Banks │
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │   LOCAL BANK ADMIN    │
                    └──────────┬───────────┘
                               │
                               │ <<include>>
                               ▼
                    ┌──────────────────────┐
                    │ Borrow from National  │
                    └──────────────────────┘
                               │
                               │ <<extend>>
                               ▼
                    ┌──────────────────────┐
                    │   Lend to Borrowers  │
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │      BANK USER       │
                    └──────────┬───────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ View Pending │ │ Approve Loan │ │ Reject Loan  │
        │   Requests   │ │              │ │              │
        └──────────────┘ └──────────────┘ └──────────────┘
                    │
                    ▼
        ┌──────────────┐
        │ Chat with    │
        │  Borrowers   │
        └──────────────┘

                    ┌──────────────────────┐
                    │      BORROWER        │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Request Loan │      │ View Profile │      │ View Market │
│              │      │              │      │    Data     │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │ <<include>>         │                     │
       ▼                     │                     │
┌──────────────┐             │                     │
│ Upload Income│             │                     │
│    Proof     │             │                     │
│  (First Time)│             │                     │
└──────────────┘             │                     │
       │                     │                     │
       │ <<extend>>          │                     │
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Check Borrow │      │ View Terms & │      │ View Loan    │
│    Limits    │      │  Conditions  │      │  Deadlines   │
└──────────────┘      └──────────────┘      └──────┬───────┘
                                                    │
                                                    │ <<extend>>
                                                    ▼
                                           ┌──────────────┐
                                           │ Pay Install- │
                                           │    ments     │
                                           └──────────────┘
       │
       ▼
┌──────────────┐
│ Chat with    │
│    Bank      │
└──────┬───────┘
       │
       │ <<include>>
       ▼
┌──────────────┐
│ View Message │
│   History    │
└──────────────┘

                    ┌──────────────────────┐
                    │    AI CHATBOT        │
                    └──────────┬───────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Answer Loan  │ │ Answer Payment│ │ Provide Bank │
        │ Limit Query  │ │   Due Query  │ │  Information │
        └──────────────┘ └──────────────┘ └──────────────┘

                    ┌──────────────────────┐
                    │ AI/ML SECURITY SYSTEM│
                    └──────────┬───────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Detect Fraud │ │ Detect Anomaly│ │ Monitor      │
        │              │ │              │ │ Transactions │
        └──────────────┘ └──────────────┘ └──────────────┘
```

### 4.2 Use Case Descriptions

#### UC-1: Request Loan
- **Actor:** Borrower
- **Precondition:** Borrower is registered, wallet connected
- **Main Flow:**
  1. Borrower navigates to loan request page
  2. System checks if borrower has pending request to this bank
  3. If first-time borrower, system prompts for income proof upload
  4. Borrower enters loan amount and purpose
  5. System validates borrowing limits
  6. System creates loan request on blockchain
  7. System deducts gas cost from borrower
- **Postcondition:** Loan request created, status = Pending

#### UC-2: Approve Loan
- **Actor:** Bank User (Approver)
- **Precondition:** Loan request exists, status = Pending
- **Main Flow:**
  1. Bank User views pending loan requests
  2. Bank User reviews loan details and income proof (if applicable)
  3. Bank User clicks "Approve"
  4. System checks if amount >= 100 ETH, sets installment flag
  5. System sets deadline
  6. System transfers funds to borrower
  7. System updates loan status to Approved
- **Postcondition:** Loan approved, funds transferred, deadline set

#### UC-3: Pay Installment
- **Actor:** Borrower
- **Precondition:** Loan approved, installment due
- **Main Flow:**
  1. Borrower views active loans in dashboard
  2. Borrower sees installment due date and amount
  3. Borrower clicks "Pay Installment"
  4. System processes payment on blockchain
  5. System updates installment status
  6. If all installments paid, loan status = Completed
- **Postcondition:** Installment paid, loan status updated

#### UC-4: Chat with Bank
- **Actor:** Borrower, Bank User
- **Precondition:** Loan request exists
- **Main Flow:**
  1. User navigates to loan request details
  2. User opens chat interface
  3. User sends message
  4. System stores message in database
  5. System notifies recipient
  6. Recipient views and responds
- **Postcondition:** Message sent, conversation logged

#### UC-5: Query AI Chatbot
- **Actor:** Any User
- **Precondition:** User is logged in
- **Main Flow:**
  1. User opens chatbot interface
  2. User asks question (e.g., "What is my loan limit?")
  3. System processes natural language
  4. System queries user data
  5. System generates response
  6. System displays response to user
- **Postcondition:** User receives answer

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  React Frontend (Material Design 3, Blockchain Visual Elements)   │
│  - Dashboard, Loan Pages, Chat, Profile, Market Data Graph     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                        │
│  - Business Logic, Validation, API Integration                   │
│  - Chat System, AI Chatbot Interface                             │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  BLOCKCHAIN  │    │   DATABASE   │    │  AI/ML API   │
│   LAYER      │    │    LAYER     │    │    LAYER     │
│              │    │              │    │              │
│ Smart        │    │ MySQL/       │    │ FastAPI      │
│ Contracts    │    │ PostgreSQL   │    │ Python       │
│              │    │              │    │              │
│ - World Bank │    │ - Users      │    │ - Fraud      │
│ - National   │    │ - Loans      │    │   Detection  │
│ - Local      │    │ - Transactions│   │ - Anomaly    │
│              │    │ - Chat       │    │   Detection  │
│              │    │ - Security   │    │ - Chatbot    │
│              │    │   Logs       │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 6. Data Flow Overview

### 6.1 Money Flow

```
WORLD BANK RESERVE
    │
    │ (Lends)
    ▼
NATIONAL BANKS
    │
    │ (Lends)
    ▼
LOCAL BANKS
    │
    │ (Lends)
    ▼
BORROWERS
```

### 6.2 Information Flow

```
USER ACTION
    │
    ▼
FRONTEND (Validation)
    │
    ├──► BLOCKCHAIN (Smart Contract Execution)
    │       │
    │       └──► DATABASE (Transaction Logging)
    │
    ├──► DATABASE (State Management)
    │
    └──► AI/ML API (Security Check - Future)
            │
            └──► DATABASE (Security Logging)
```

---

## 7. Sequential Diagram Files

Detailed sequential diagrams for each interaction flow are provided in separate files:

1. **Loan Request Flow:** `CSE471_LOAN_REQUEST_FLOW.md`
2. **Installment Payment Flow:** `CSE471_INSTALLMENT_PAYMENT_FLOW.md`
3. **Chat System Flow:** `CSE471_CHAT_SYSTEM_FLOW.md`
4. **AI Chatbot Flow:** `CSE471_AI_CHATBOT_FLOW.md`
5. **Market Data Flow:** `CSE471_MARKET_DATA_FLOW.md`
6. **Profile Management Flow:** `CSE471_PROFILE_MANAGEMENT_FLOW.md`
7. **Borrowing Limit Flow:** `CSE471_BORROWING_LIMIT_FLOW.md`
8. **Income Verification Flow:** `CSE471_INCOME_VERIFICATION_FLOW.md`
9. **Hierarchical Banking Flow:** `CSE471_HIERARCHICAL_BANKING_FLOW.md`

Each file contains top-down expanding tree sequential diagrams showing the complete interaction flow from user action to system response.

---

## 8. System Constraints

### 8.1 Business Rules

1. **Hierarchical Structure:** Users can only request loans from Local Banks, not National or World Bank
2. **One Request Per Bank:** Each borrower can send only one loan request per bank
3. **One Approver Per Bank:** Only one Bank User per bank can have approval authority
4. **Borrowing Limits:** Based on 6-month and 1-year transaction history
5. **Multiple Loans Exception:** Borrowers with 3+ consecutive fully paid loans can have up to 2 active loans
6. **Installment Threshold:** Loans >= 100 ETH automatically enable installment payments
7. **Gas Cost:** Deducted from borrower's side, within standard limits

### 8.2 Technical Constraints

1. **Blockchain:** Ethereum/Polygon testnet for development
2. **Gas Limits:** Standard gas limits enforced
3. **Response Time:** API responses < 500ms
4. **Concurrent Users:** Support for 1000+ concurrent users
5. **Data Retention:** Transaction history stored for AI/ML training

---

## 9. Non-Functional Requirements

### 9.1 Performance

- Page load time: < 2 seconds
- Transaction confirmation: < 30 seconds
- Real-time chat: < 1 second latency
- Market data updates: Every 5 minutes

### 9.2 Security

- Wallet connection: Secure Web3 integration
- Data encryption: AES-256 for sensitive data
- Smart contract: Audited for vulnerabilities
- Access control: Role-based permissions

### 9.3 Usability

- Responsive design: Mobile and desktop
- Blockchain visual elements: Clear indication of blockchain technology
- Intuitive navigation: Material Design 3
- Help system: AI chatbot for support

### 9.4 Scalability

- Database: Partitioned for large datasets
- Caching: Redis for frequently accessed data
- Load balancing: Multiple server instances
- Blockchain: Layer 2 solutions for scalability

---

## 10. Conclusion

This system analysis document provides a comprehensive overview of the Crypto World Bank platform. The detailed sequential diagrams in the sub-files show the complete interaction flows for all major system features. The system is designed to be scalable, secure, and user-friendly while maintaining the hierarchical banking structure and supporting advanced features like AI/ML security and installment payments.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis

