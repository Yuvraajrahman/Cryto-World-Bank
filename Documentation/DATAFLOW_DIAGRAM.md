# Data Flow Diagrams
## Crypto World Bank System

---

### Context Diagram (Level 0)

```
                                                                                              ┌───────────────────────┐
                                                                                              │                       │
                  ┌───────────────────┐                                                       │   Polygon Blockchain  │
                  │                   │       Loan Request, Deposit,                           │   Network             │
                  │    Borrower       │       Installment Payment                              │                       │
                  │                   │─────────────────────────────────────┐                  └───────────┬───────────┘
                  └───────────────────┘                                     │                              │
                         ▲                                                 │    Signed Transactions        │
                         │                                                 │    ──────────────────────────>│
                         │  Loan Status, Funds,                            │                              │
                         │  Borrowing Limit,                               │    Confirmed Events           │
                         │  Market Data                                    │    <──────────────────────────│
                         │                                                 │                              │
                         │                                                 ▼                              │
                         │                                     ┌───────────────────────┐                  │
                         └─────────────────────────────────────│                       │                  │
                                                               │   CRYPTO WORLD BANK  │──────────────────┘
                  ┌───────────────────┐                        │   SYSTEM             │
                  │                   │   Approve/Reject,      │                       │
                  │  Bank Approver    │   Risk Scores,         │                       │──────────────────┐
                  │                   │   Loan Portfolio        │                       │                  │
                  │                   │<───────────────────────│                       │                  │
                  │                   │   Pending Loans,        │                       │                  │
                  │                   │   AI Recommendations    │                       │                  │
                  │                   │───────────────────────>│                       │                  ▼
                  └───────────────────┘                        └───────────────────────┘       ┌───────────────────────┐
                                                                        │                     │                       │
                  ┌───────────────────┐                                 │                     │   CoinGecko API       │
                  │                   │   Register Banks,               │                     │   (Market Data)       │
                  │  World Bank       │   Lend to National Banks,       │                     │                       │
                  │  Admin            │   System Controls               │                     └───────────────────────┘
                  │                   │<───────────────────────────────>│
                  └───────────────────┘                                 │
                                                                        │
                  ┌───────────────────┐                                 │
                  │                   │   Register Local Banks,         │
                  │  National Bank    │   Borrow/Lend                   │
                  │                   │<───────────────────────────────>│
                  └───────────────────┘
```

---

### Level 1 DFD

```
┌─────────────┐                                                                                                     ┌─────────────┐
│             │                                                                                                     │             │
│  Borrower   │                                                                                                     │   Bank      │
│             │                                                                                                     │   Approver  │
└──────┬──────┘                                                                                                     └──────┬──────┘
       │                                                                                                                   │
       │  Amount, Purpose,                                                                                                 │
       │  Wallet Address                                                                                                   │
       │                                                                                                                   │
       ▼                                                                                                                   │
┌──────────────────┐         Loan Data           ┌──────────────────┐         Risk Query          ┌──────────────────┐     │
│                  │─────────────────────────────>│                  │─────────────────────────────>│                  │     │
│   1.0            │                              │   2.0            │                              │   3.0            │     │
│   Process        │         Validation           │   Manage         │         Risk Score +         │   AI/ML          │     │
│   Loan           │         Result               │   Loan           │         SHAP Features        │   Risk           │     │
│   Request        │<─────────────────────────────│   Lifecycle      │<─────────────────────────────│   Assessment     │     │
│                  │                              │                  │                              │                  │     │
└────────┬─────────┘                              └──────┬───────────┘                              └──────────────────┘     │
         │                                               │                                                                  │
         │  Signed Transaction                           │  Pending Loans                                                   │
         │                                               │  + Risk Scores                                                   │
         ▼                                               │                                                                  │
┌──────────────────┐                                     │                                                                  │
│                  │                                     │                                                                  │
│   4.0            │                                     └──────────────────────────────────────────────────────────────────>│
│   Execute        │                                                                                                        │
│   Blockchain     │         Approval/                                                                                      │
│   Transaction    │         Rejection                                                                                      │
│                  │<───────────────────────────────────────────────────────────────────────────────────────────────────────│
└────────┬─────────┘                                                                                                        │
         │                                                                                                                  │
         │  Transaction                                                                                                     │
         │  Events                                                                                                          │
         ▼                                                                                                                  │
┌──────────────────┐         Loan Record          ┌──────────────────┐                                                      │
│                  │─────────────────────────────>│                  │                                                      │
│   5.0            │                              │                  │                                                      │
│   Synchronize    │         Transaction Log      │   D1: LOAN_     │                                                      │
│   Event Data     │─────────────────────────────>│   REQUEST       │                                                      │
│                  │                              │                  │                                                      │
└────────┬─────────┘         Security Log         │   D2: TRANS-    │                                                      │
         │          ─────────────────────────────>│   ACTION        │                                                      │
         │                                        │                  │                                                      │
         │                                        │   D3: AI_ML_    │                                                      │
         │                                        │   SECURITY_LOG  │                                                      │
         │                                        │                  │                                                      │
         │                                        │   D4: BORROWING │                                                      │
         │                                        │   _LIMIT        │                                                      │
         │                                        │                  │                                                      │
         │                                        │   D5: BORROWER  │                                                      │
         │                                        │                  │                                                      │
         │                                        └──────────────────┘                                                      │
         │                                                                                                                  │
         ▼                                                                                                                  │
┌──────────────────┐         Limit Data           ┌──────────────────┐                                                      │
│                  │─────────────────────────────>│                  │                                                      │
│   6.0            │                              │   D4: BORROWING │                                                      │
│   Calculate      │         History Data         │   _LIMIT        │                                                      │
│   Borrowing      │<─────────────────────────────│                  │                                                      │
│   Limits         │                              └──────────────────┘                                                      │
│                  │                                                                                                        │
└──────────────────┘                                                                                                        │
                                                                                                                            │
                                                                                                                            │
┌──────────────────┐         Price Data           ┌──────────────────┐         Market Prices to Borrower                    │
│                  │─────────────────────────────>│                  │────────────────────────────────────────────────>       │
│   CoinGecko     │                              │   7.0            │                                                      │
│   API            │                              │   Fetch &        │                                                      │
│   (External)     │                              │   Cache Market   │                                                      │
│                  │                              │   Data           │                                                      │
└──────────────────┘                              └──────────────────┘                                                      │
                                                                                                                            │
┌─────────────┐                                                                                                             │
│  World Bank │   Register Banks, Lend,          ┌──────────────────┐                                                      │
│  Admin      │   Pause/Unpause                  │   8.0            │                                                      │
│             │─────────────────────────────────>│   Manage         │                                                      │
└─────────────┘                                  │   Bank           │                                                      │
                                                  │   Hierarchy      │                                                      │
┌─────────────┐   Register Local,                │   & System       │                                                      │
│  National   │   Borrow, Lend                   │   Controls       │                                                      │
│  Bank       │─────────────────────────────────>│                  │                                                      │
└─────────────┘                                  └──────────────────┘                                                      │
```

**Processes:**
1.0 Process Loan Request — Validates input, checks limits, prepares transaction
2.0 Manage Loan Lifecycle — Tracks status (pending → approved/rejected → active → completed)
3.0 AI/ML Risk Assessment — Fraud detection (RF), anomaly detection (IF), SHAP explanations
4.0 Execute Blockchain Transaction — Signs and broadcasts to Polygon PoS
5.0 Synchronize Event Data — Listens to on-chain events, persists to PostgreSQL
6.0 Calculate Borrowing Limits — 6-month and 1-year rolling window computations
7.0 Fetch & Cache Market Data — External API → Redis cache → frontend
8.0 Manage Bank Hierarchy & System Controls — Registration, lending, pause/unpause

**Data Stores:** D1: LOAN_REQUEST, D2: TRANSACTION, D3: AI_ML_SECURITY_LOG, D4: BORROWING_LIMIT, D5: BORROWER
