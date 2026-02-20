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
└────────┬─────────┘                              └──────┬──┬────────┘                              └──────────────────┘     │
         │                                               │  │                                                               │
         │  Signed Transaction                           │  │  Installment Data   ┌──────────────────┐                      │
         │                                               │  └────────────────────>│   D11:           │                      │
         ▼                                               │                        │   INSTALLMENT    │                      │
┌──────────────────┐                                     │                        └──────────────────┘                      │
│                  │                                     │                                                                  │
│   4.0            │                                     │  Pending Loans                                                   │
│   Execute        │                                     │  + Risk Scores                                                   │
│   Blockchain     │         Approval/                   │                                                                  │
│   Transaction    │         Rejection                   └──────────────────────────────────────────────────────────────────>│
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
│   API            │                              │   Fetch &        │         Cached Price Data                            │
│   (External)     │                              │   Cache Market   │─────────────────────────────┐                        │
│                  │                              │   Data           │                             │                        │
└──────────────────┘                              └──────────────────┘                             │                        │
                                                                                                  ▼                        │
                                                                                        ┌──────────────────┐               │
                                                                                        │   D10:           │               │
                                                                                        │   MARKET_DATA    │               │
                                                                                        └──────────────────┘               │
                                                                                                                            │
┌─────────────┐                                   ┌──────────────────┐                                                      │
│  World Bank │   Register Banks, Lend,           │   8.0            │                                                      │
│  Admin      │   Pause/Unpause                   │   Manage         │                                                      │
│             │─────────────────────────────────>  │   Bank           │                                                      │
└─────────────┘                                   │   Hierarchy      │                                                      │
                                                  │   & System       │                                                      │
┌─────────────┐   Register Local,                 │   Controls       │                                                      │
│  National   │   Borrow, Lend                    │                  │                                                      │
│  Bank       │─────────────────────────────────> │                  │                                                      │
└─────────────┘                                   └──────────────────┘                                                      │
                                                                                                                            │
                                                                                                                            │
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╧═
                                                                                                                              
                                                EXTENDED PROCESSES & DATA STORES                                              
                                                                                                                              
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════


┌─────────────┐   Income Proof Documents  ┌──────────────────┐       Hashed Document       ┌──────────────────┐
│             │──────────────────────────>│                  │────────────────────────────>│                  │
│  Borrower   │                           │   9.0            │                             │   D7: INCOME_   │
│             │   Verification Status     │   Process        │       Proof Status          │   PROOF          │
│             │<──────────────────────────│   Income         │<────────────────────────────│                  │
└─────────────┘                           │   Verification   │                             └──────────────────┘
                                          │                  │
                                          │                  │──── Borrower Proof Link ──────────────────> ═══ D5: BORROWER ═══
                                          │                  │
┌─────────────┐   Review Income Proofs    │                  │
│  Bank       │──────────────────────────>│                  │
│  Approver   │                           │                  │
│             │   Pending Proofs          │                  │
│             │<──────────────────────────│                  │
└─────────────┘                           └──────────────────┘



┌─────────────┐   Send Message            ┌──────────────────┐       Store Message         ┌──────────────────┐
│             │──────────────────────────>│                  │────────────────────────────>│                  │
│  Borrower   │                           │   10.0           │                             │   D6: CHAT_     │
│             │   Receive Message,        │   Manage Chat    │       Read Messages         │   MESSAGE       │
│             │   Read Status             │   Communication  │<────────────────────────────│                  │
│             │<──────────────────────────│                  │                             └──────────────────┘
└─────────────┘                           │                  │
                                          │                  │──── Loan Context Query ───────────────────> ═══ D1: LOAN_REQUEST ═══
                                          └──────────────────┘



┌─────────────┐   Chatbot Questions       ┌──────────────────┐       Interaction Log       ┌──────────────────┐
│             │──────────────────────────>│                  │────────────────────────────>│                  │
│  Borrower   │                           │   11.0           │                             │   D8: AI_       │
│             │   AI Responses            │   AI Chatbot     │       Read Log History      │   CHATBOT_LOG   │
│             │<──────────────────────────│   Service        │<────────────────────────────│                  │
└─────────────┘                           │                  │                             └──────────────────┘
                                          │                  │
                                          │                  │──── Limit Query ─────────────────────────> ═══ D4: BORROWING_LIMIT ═══
                                          │                  │──── Loan Data Query ─────────────────────> ═══ D1: LOAN_REQUEST ═══
                                          └──────────────────┘



┌─────────────┐   Profile Updates         ┌──────────────────┐       Settings Data         ┌──────────────────┐
│             │──────────────────────────>│                  │────────────────────────────>│                  │
│  Borrower   │                           │   12.0           │                             │   D9: PROFILE_  │
│             │   Profile Data,           │   Manage User    │       Read Settings         │   SETTINGS      │
│             │   Preferences             │   Profiles       │<────────────────────────────│                  │
│             │<──────────────────────────│                  │                             └──────────────────┘
└─────────────┘                           │                  │
                                          │                  │──── Profile Link ────────────────────────> ═══ D5: BORROWER ═══
                                          │                  │
┌─────────────┐   Profile Updates         │                  │
│  Bank       │──────────────────────────>│                  │
│  Approver   │                           │                  │
│             │   Profile Data            │                  │
│             │<──────────────────────────│                  │
└─────────────┘                           └──────────────────┘
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
