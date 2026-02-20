# Data Flow Diagrams
## Crypto World Bank System

---

### Context Diagram (Level 0)

```mermaid
flowchart TD
    Borrower[Borrower]
    BankApprover[Bank Approver]
    WorldBankAdmin[World Bank Admin]
    NationalBank[National Bank]
    Polygon[Polygon Blockchain Network]
    CoinGecko["CoinGecko API (Market Data)"]
    System("CRYPTO WORLD BANK SYSTEM")

    Borrower -->|"Loan Request, Deposit,<br/>Installment Payment"| System
    System -->|"Loan Status, Funds,<br/>Borrowing Limit, Market Data"| Borrower

    System -->|"Signed Transactions"| Polygon
    Polygon -->|"Confirmed Events"| System

    System -->|"Approve/Reject, Risk Scores,<br/>Loan Portfolio"| BankApprover
    BankApprover -->|"Pending Loans,<br/>AI Recommendations"| System

    WorldBankAdmin <-->|"Register Banks, Lend to<br/>National Banks, System Controls"| System
    NationalBank <-->|"Register Local Banks,<br/>Borrow/Lend"| System

    CoinGecko -->|"Market Price Data"| System
```

---

### Level 1 DFD

```mermaid
flowchart TD
    subgraph ext["External Entities"]
        direction LR
        Borrower[Borrower]
        BankApprover[Bank Approver]
        WorldBankAdmin[World Bank Admin]
        NationalBank[National Bank]
        CoinGeckoAPI[CoinGecko API]
    end

    subgraph core["Core Loan Processing"]
        P1("1.0 Process Loan Request")
        P2("2.0 Manage Loan Lifecycle")
        P3("3.0 AI/ML Risk Assessment")
        P4("4.0 Execute Blockchain Transaction")
        P5("5.0 Synchronize Event Data")
    end

    subgraph support["Supporting Services"]
        P6("6.0 Calculate Borrowing Limits")
        P7("7.0 Fetch &amp; Cache Market Data")
        P8("8.0 Manage Bank Hierarchy &amp; System Controls")
    end

    subgraph extended["Extended Services"]
        P9("9.0 Process Income Verification")
        P10("10.0 Manage Chat Communication")
        P11("11.0 AI Chatbot Service")
        P12("12.0 Manage User Profiles")
    end

    subgraph datastores["Data Stores"]
        D1[(D1: LOAN_REQUEST)]
        D2[(D2: TRANSACTION)]
        D3[(D3: AI_ML_SECURITY_LOG)]
        D4[(D4: BORROWING_LIMIT)]
        D5[(D5: BORROWER)]
        D6[(D6: CHAT_MESSAGE)]
        D7[(D7: INCOME_PROOF)]
        D8[(D8: AI_CHATBOT_LOG)]
        D9[(D9: PROFILE_SETTINGS)]
        D10[(D10: MARKET_DATA)]
        D11[(D11: INSTALLMENT)]
    end

    %% Core Loan Processing Flows
    Borrower -->|"Amount, Purpose,<br/>Wallet Address"| P1
    P1 -->|"Loan Data"| P2
    P2 -->|"Validation Result"| P1
    P2 -->|"Risk Query"| P3
    P3 -->|"Risk Score +<br/>SHAP Features"| P2
    P1 -->|"Signed Transaction"| P4
    P2 -->|"Installment Data"| D11
    P2 -->|"Pending Loans +<br/>Risk Scores"| BankApprover
    BankApprover -->|"Approval/Rejection"| P4

    %% Blockchain & Sync Flows
    P4 -->|"Transaction Events"| P5
    P5 -->|"Loan Record"| D1
    P5 -->|"Transaction Log"| D2
    P5 -->|"Security Log"| D3
    P5 --> P6

    %% Borrowing Limits
    P6 -->|"Limit Data"| D4
    D4 -->|"History Data"| P6

    %% Market Data Flows
    CoinGeckoAPI -->|"Price Data"| P7
    P7 -->|"Market Prices"| Borrower
    P7 -->|"Cached Price Data"| D10

    %% Bank Administration
    WorldBankAdmin -->|"Register Banks, Lend,<br/>Pause/Unpause"| P8
    NationalBank -->|"Register Local,<br/>Borrow, Lend"| P8

    %% Income Verification Flows
    Borrower -->|"Income Proof Documents"| P9
    P9 -->|"Verification Status"| Borrower
    P9 -->|"Hashed Document"| D7
    D7 -->|"Proof Status"| P9
    P9 -->|"Borrower Proof Link"| D5
    BankApprover -->|"Review Income Proofs"| P9
    P9 -->|"Pending Proofs"| BankApprover

    %% Chat Communication Flows
    Borrower -->|"Send Message"| P10
    P10 -->|"Receive Message,<br/>Read Status"| Borrower
    P10 -->|"Store Message"| D6
    D6 -->|"Read Messages"| P10
    P10 -->|"Loan Context Query"| D1

    %% AI Chatbot Flows
    Borrower -->|"Chatbot Questions"| P11
    P11 -->|"AI Responses"| Borrower
    P11 -->|"Interaction Log"| D8
    D8 -->|"Read Log History"| P11
    P11 -->|"Limit Query"| D4
    P11 -->|"Loan Data Query"| D1

    %% User Profile Flows
    Borrower -->|"Profile Updates"| P12
    P12 -->|"Profile Data,<br/>Preferences"| Borrower
    P12 -->|"Settings Data"| D9
    D9 -->|"Read Settings"| P12
    P12 -->|"Profile Link"| D5
    BankApprover -->|"Profile Updates"| P12
    P12 -->|"Profile Data"| BankApprover
```

**Processes:**
1.0 Process Loan Request — Validates input, checks limits, prepares transaction
2.0 Manage Loan Lifecycle — Tracks status (pending → approved/rejected → active → completed); creates installment records
3.0 AI/ML Risk Assessment — Fraud detection (RF), anomaly detection (IF), SHAP explanations
4.0 Execute Blockchain Transaction — Signs and broadcasts to Polygon PoS
5.0 Synchronize Event Data — Listens to on-chain events, persists to PostgreSQL
6.0 Calculate Borrowing Limits — 6-month and 1-year rolling window computations
7.0 Fetch & Cache Market Data — External API → Redis cache → frontend; persists to MARKET_DATA store
8.0 Manage Bank Hierarchy & System Controls — Registration, lending, pause/unpause
9.0 Process Income Verification — Upload, validate, hash, store files; bank review and approval
10.0 Manage Chat Communication — Send/receive messages between borrowers and banks; track read status
11.0 AI Chatbot Service — NLP intent classification, data querying, response generation, interaction logging
12.0 Manage User Profiles — Profile CRUD, terms acceptance, preferences management

**Data Stores:**
D1: LOAN_REQUEST — loan applications and their statuses
D2: TRANSACTION — blockchain transaction records
D3: AI_ML_SECURITY_LOG — AI/ML model predictions and security audit logs
D4: BORROWING_LIMIT — computed borrowing limits per borrower
D5: BORROWER — borrower registration and identity data
D6: CHAT_MESSAGE — borrower-bank chat messages
D7: INCOME_PROOF — income verification documents
D8: AI_CHATBOT_LOG — chatbot interaction logs
D9: PROFILE_SETTINGS — user profiles and preferences
D10: MARKET_DATA — cryptocurrency price data
D11: INSTALLMENT — installment payment records
