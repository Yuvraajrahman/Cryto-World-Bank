# Activity Diagram
## Crypto World Bank — Loan Request to Repayment Flow

---

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
                                    │  (MetaMask /          │
                                    │   WalletConnect)      │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                       ◇─────────────────◇
                                      ╱  Wallet           ╲
                                     ╱   Connected?        ╲
                                    ◇─────────────────────◇
                                    │ Yes                    │ No
                                    ▼                        ▼
                        ┌──────────────────┐    ┌──────────────────────┐
                        │  Read Wallet     │    │  Show "Connect       │
                        │  Address &       │    │  Wallet" Error       │
                        │  Determine Role  │    └──────────┬───────────┘
                        └────────┬─────────┘               │
                                 │                         ▼
                                 │                    ┌─────────┐
                                 │                    │  END    │
                                 │                    └─────────┘
                                 ▼
                    ┌────────────────────────┐
                    │  Navigate to Loan Page │
                    │  Enter Amount & Purpose│
                    └────────────┬───────────┘
                                 │
                                 ▼
                        ◇─────────────────◇
                       ╱  Is First-Time    ╲
                      ╱   Borrower?         ╲
                     ◇──────────────────────◇
                     │ Yes                    │ No
                     ▼                        │
         ┌─────────────────────┐              │
         │  Upload Income      │              │
         │  Proof Document     │              │
         └─────────┬───────────┘              │
                   │                          │
                   ▼                          │
          ◇─────────────────◇                 │
         ╱  Income Proof     ╲                │
        ╱   Approved?         ╲               │
       ◇──────────────────────◇               │
       │ Yes              │ No                │
       │                  ▼                   │
       │     ┌──────────────────┐             │
       │     │  Reject: Income  │             │
       │     │  Not Verified    │             │
       │     └──────┬───────────┘             │
       │            ▼                         │
       │       ┌─────────┐                    │
       │       │  END    │                    │
       │       └─────────┘                    │
       │                                      │
       └──────────────┬───────────────────────┘
                      │
                      ▼
          ┌────────────────────────┐
          │  Query Borrowing Limit │
          │  (6-month & 1-year     │
          │   rolling windows)     │
          └────────────┬───────────┘
                       │
                       ▼
              ◇─────────────────◇
             ╱  Amount Within    ╲
            ╱   Borrowing Limit?  ╲
           ◇──────────────────────◇
           │ Yes              │ No
           │                  ▼
           │     ┌──────────────────┐
           │     │  Reject: Limit   │
           │     │  Exceeded        │
           │     └──────┬───────────┘
           │            ▼
           │       ┌─────────┐
           │       │  END    │
           │       └─────────┘
           │
           ▼
┌──────────────────────────┐
│  Prepare Transaction     │
│  requestLoan(amount,     │
│  purpose)                │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  MetaMask Prompts User   │
│  Display Gas Estimate    │
└────────────┬─────────────┘
             │
             ▼
    ◇─────────────────◇
   ╱  User Confirms    ╲
  ╱   Transaction?      ╲
 ◇──────────────────────◇
 │ Yes              │ No
 │                  ▼
 │     ┌──────────────────┐
 │     │  Transaction     │
 │     │  Cancelled       │
 │     └──────┬───────────┘
 │            ▼
 │       ┌─────────┐
 │       │  END    │
 │       └─────────┘
 │
 ▼
┌──────────────────────────┐
│  Sign & Broadcast        │
│  Transaction to          │
│  Polygon Network         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  Smart Contract          │
│  Validates & Executes:   │
│  - Check amount > 0      │
│  - Check purpose != ""   │
│  - Check reserve balance │
│  - Create Loan struct    │
│  - Emit LoanRequested    │
└────────────┬─────────────┘
             │
             ▼
    ◇─────────────────◇
   ╱  Transaction      ╲
  ╱   Successful?       ╲
 ◇──────────────────────◇
 │ Yes              │ No
 │                  ▼
 │     ┌──────────────────┐
 │     │  Show Error:     │
 │     │  Tx Failed       │
 │     └──────┬───────────┘
 │            ▼
 │       ┌─────────┐
 │       │  END    │
 │       └─────────┘
 │
 ▼
┌──────────────────────────┐             ┌──────────────────────────┐
│  Display Success:        │             │  Event Listener Detects  │
│  "Loan Requested"        │             │  LoanRequested Event     │
│  Show Tx Hash            │             │  → Store in Database     │
└──────────────────────────┘             │  → Trigger AI/ML Risk   │
                                         │    Assessment            │
                                         └────────────┬─────────────┘
                                                      │
                              ════════════════════════════════════════
                              ║     BANK APPROVER SWIMLANE           ║
                              ════════════════════════════════════════
                                                      │
                                                      ▼
                                         ┌────────────────────────┐
                                         │  View Pending Loans    │
                                         │  with AI Risk Scores   │
                                         │  and SHAP Explanations │
                                         └────────────┬───────────┘
                                                      │
                                                      ▼
                                             ◇─────────────────◇
                                            ╱  Approve or       ╲
                                           ╱   Reject?           ╲
                                          ◇──────────────────────◇
                                          │ Approve         │ Reject
                                          │                 ▼
                                          │    ┌──────────────────────┐
                                          │    │  Sign rejectLoan()   │
                                          │    │  Record Reason       │
                                          │    │  Notify Borrower     │
                                          │    └──────────┬───────────┘
                                          │               ▼
                                          │          ┌─────────┐
                                          │          │  END    │
                                          │          └─────────┘
                                          │
                                          ▼
                              ┌──────────────────────────┐
                              │  Sign approveLoan()      │
                              │  via Approver Wallet     │
                              └────────────┬─────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────┐
                              │  Smart Contract:         │
                              │  - Verify approver role  │
                              │  - Verify loan pending   │
                              │  - Verify balance        │
                              │  - Transfer ETH to       │
                              │    borrower wallet       │
                              │  - Emit LoanApproved     │
                              └────────────┬─────────────┘
                                           │
                                           ▼
                                  ◇─────────────────◇
                                 ╱  Loan Amount       ╲
                                ╱   >= 100 ETH?        ╲
                               ◇───────────────────────◇
                               │ Yes               │ No
                               ▼                   ▼
                  ┌─────────────────────┐  ┌─────────────────────┐
                  │  Generate           │  │  Single Payment     │
                  │  Installment Plan   │  │  Due by Deadline    │
                  │  (N installments    │  └─────────┬───────────┘
                  │   with due dates)   │            │
                  └─────────┬───────────┘            │
                            │                        │
                            └────────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────────┐
                              │  Borrower Receives       │
                              │  Funds in Wallet         │
                              │  Update Borrowing Limit  │
                              │  Update Transaction Log  │
                              └────────────┬─────────────┘
                                           │
                                           ▼
                                  ◇─────────────────◇
                                 ╱  Installment      ╲
                                ╱   Due?              ╲
                               ◇──────────────────────◇
                               │ Yes              │ Paid All
                               ▼                  ▼
                  ┌─────────────────────┐  ┌─────────────────────┐
                  │  Pay Installment    │  │  Loan Completed     │
                  │  via payInstallment │  │  Update consecutive │
                  │  Sign tx            │  │  paid loans count   │
                  └─────────┬───────────┘  └─────────┬───────────┘
                            │                        │
                            └──── (loop back) ───────┤
                                                     ▼
                                               ┌─────────┐
                                               │   END   │
                                               └─────────┘
```

---

## Crypto World Bank — Income Verification Flow

```
                                          ┌───────────┐
                                          │   START   │
                                          └─────┬─────┘
                                                │
                                                ▼
                                    ┌───────────────────────────┐
                                    │  Borrower Registers /     │
                                    │  Logs into DApp           │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                         ◇─────────────────◇
                                        ╱  Is First-Time     ╲
                                       ╱   Borrower?          ╲
                                      ◇───────────────────────◇
                                      │ Yes                     │ No
                                      ▼                         ▼
                          ┌─────────────────────┐   ┌──────────────────────────┐
                          │  Prompt: Upload      │   │  Income Already Verified │
                          │  Income Proof        │   │  Proceed to Loan Page    │
                          │  (PDF / Image)       │   └────────────┬─────────────┘
                          └──────────┬──────────┘                │
                                     │                           │
                                     ▼                           │
                          ┌─────────────────────┐                │
                          │  Borrower Selects    │                │
                          │  File & Uploads      │                │
                          └──────────┬──────────┘                │
                                     │                           │
                                     ▼                           │
                          ┌─────────────────────────┐            │
                          │  Server Receives File   │            │
                          │  Validate:              │            │
                          │  - File type (PDF/IMG)  │            │
                          │  - File size < 5 MB     │            │
                          │  - Not corrupted        │            │
                          └──────────┬──────────────┘            │
                                     │                           │
                                     ▼                           │
                            ◇─────────────────◇                  │
                           ╱  File Valid?       ╲                 │
                          ◇─────────────────────◇                │
                          │ Yes            │ No                   │
                          │                ▼                      │
                          │   ┌──────────────────────┐           │
                          │   │  Return Error:       │           │
                          │   │  "Invalid file type  │           │
                          │   │   or size exceeded"  │           │
                          │   └──────────┬───────────┘           │
                          │              ▼                        │
                          │     ┌──────────────────┐             │
                          │     │  Borrower Re-    │             │
                          │     │  uploads File    │◄────────┐   │
                          │     └────────┬─────────┘         │   │
                          │              └───── (retry) ─────┘   │
                          │                                      │
                          ▼                                      │
               ┌──────────────────────────┐                      │
               │  Store File on Server    │                      │
               │  Link to Borrower Record │                      │
               │  Set Status: PENDING     │                      │
               └────────────┬─────────────┘                      │
                            │                                    │
         ═══════════════════╪════════════════════════════         │
         ║   BANK APPROVER SWIMLANE                    ║         │
         ═══════════════════╪════════════════════════════         │
                            │                                    │
                            ▼                                    │
               ┌──────────────────────────┐                      │
               │  Bank Approver Views     │                      │
               │  Pending Income Proofs   │                      │
               │  in Admin Dashboard      │                      │
               └────────────┬─────────────┘                      │
                            │                                    │
                            ▼                                    │
               ┌──────────────────────────┐                      │
               │  Review Document:        │                      │
               │  - Check authenticity    │                      │
               │  - Verify income amount  │                      │
               │  - Cross-reference data  │                      │
               └────────────┬─────────────┘                      │
                            │                                    │
                            ▼                                    │
                   ◇─────────────────◇                           │
                  ╱  Approve or       ╲                          │
                 ╱   Reject?           ╲                         │
                ◇──────────────────────◇                         │
                │ Approve         │ Reject                       │
                │                 ▼                               │
                │   ┌──────────────────────────┐                 │
                │   │  Set Status: REJECTED    │                 │
                │   │  Record Rejection Reason │                 │
                │   │  Notify Borrower         │                 │
                │   └────────────┬─────────────┘                 │
                │                ▼                                │
                │          ┌─────────┐                           │
                │          │   END   │                           │
                │          └─────────┘                           │
                │                                                │
                ▼                                                │
   ┌──────────────────────────┐                                  │
   │  Set Status: APPROVED    │                                  │
   │  Update Borrower Record: │                                  │
   │  incomeVerified = true   │                                  │
   │  Notify Borrower         │                                  │
   └────────────┬─────────────┘                                  │
                │                                                │
                └────────────────────┬───────────────────────────┘
                                     │
                                     ▼
                         ┌───────────────────────────┐
                         │  Borrower Can Now Access   │
                         │  Loan Request Page         │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                                 ┌─────────┐
                                 │   END   │
                                 └─────────┘
```

---

## Crypto World Bank — Chat System Flow

```
  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
  │  SENDER SWIMLANE                                                                             │
  └──────────────────────────────────────────────────────────────────────────────────────────────┘

                                          ┌───────────┐
                                          │   START   │
                                          └─────┬─────┘
                                                │
                                                ▼
                                    ┌───────────────────────────┐
                                    │  User Opens Loan Details  │
                                    │  Page for a Specific Loan │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Click "Chat with         │
                                    │  Borrower / Bank"         │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Client Sends Request:    │
                                    │  GET /api/chat/:loanId    │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Server Loads Chat        │
                                    │  History from Database    │
                                    │  (sorted by timestamp)    │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                         ◇─────────────────◇
                                        ╱  Chat History      ╲
                                       ╱   Exists?            ╲
                                      ◇───────────────────────◇
                                      │ Yes                     │ No
                                      ▼                         ▼
                          ┌────────────────────────┐  ┌────────────────────────┐
                          │  Render Previous       │  │  Display Empty Chat    │
                          │  Messages in Chat UI   │  │  "No messages yet"     │
                          └────────────┬───────────┘  └────────────┬───────────┘
                                       │                           │
                                       └─────────────┬─────────────┘
                                                     │
                                                     ▼
                                    ┌───────────────────────────┐
                                    │  User Types Message in    │
                                    │  Chat Input Field         │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  User Clicks "Send"       │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                         ◇─────────────────◇
                                        ╱  Message Valid?    ╲
                                       ╱   (non-empty,       ╲
                                      ╱     length < 1000)    ╲
                                     ◇────────────────────────◇
                                     │ Yes                │ No
                                     │                    ▼
                                     │      ┌──────────────────────┐
                                     │      │  Show Validation     │
                                     │      │  Error: "Message     │
                                     │      │  cannot be empty"    │
                                     │      └──────────┬───────────┘
                                     │                 │
                                     │                 └──── (back to input)
                                     │
                                     ▼
                          ┌───────────────────────────┐
                          │  POST /api/chat/:loanId   │
                          │  { sender, message,       │
                          │    timestamp }             │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Server Validates &       │
                          │  Stores Message in DB     │
                          │  Set isRead = false       │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Append Message to        │
                          │  Sender's Chat UI         │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Notify Receiver:         │
                          │  Push Notification /      │
                          │  Real-time Update         │
                          └─────────────┬─────────────┘
                                        │
  ┌─────────────────────────────────────┼──────────────────────────────────────────────────────────┐
  │  RECEIVER SWIMLANE                  │                                                          │
  └─────────────────────────────────────┼──────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Receiver Opens Chat      │
                          │  or Views Notification    │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Load Updated Chat        │
                          │  Messages from Server     │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Display New Message      │
                          │  in Receiver's Chat UI    │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Mark Message as Read     │
                          │  PUT /api/chat/:msgId     │
                          │  { isRead: true }         │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Update Read Receipt      │
                          │  on Sender's UI           │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                                  ┌─────────┐
                                  │   END   │
                                  └─────────┘
```

---

## Crypto World Bank — AI Chatbot Interaction Flow

```
                                          ┌───────────┐
                                          │   START   │
                                          └─────┬─────┘
                                                │
                                                ▼
                                    ┌───────────────────────────┐
                                    │  User Clicks "AI Help"    │
                                    │  / Opens Chatbot Widget   │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Load User Context:       │
                                    │  - Wallet address         │
                                    │  - Role (Borrower/Bank)   │
                                    │  - Active loans           │
                                    │  - Payment history        │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Display Welcome Message: │
                                    │  "Hello! I'm your Crypto  │
                                    │   World Bank assistant.   │
                                    │   How can I help you?"    │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  User Types Question      │
                                    │  in Chat Input            │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                          ┌───────────────────────────────────────┐
                          │  NLP Pipeline Processes Input:        │
                          │  ┌─────────────────────────────────┐  │
                          │  │ Step 1: Tokenize Input          │  │
                          │  │ Step 2: Remove Stop Words       │  │
                          │  │ Step 3: Classify Intent         │  │
                          │  │ Step 4: Extract Entities         │  │
                          │  └─────────────────────────────────┘  │
                          └───────────────────┬───────────────────┘
                                              │
                                              ▼
             ◇────────────────────────────────────────────────────────────◇
            ╱                    Intent Classification                    ╲
           ◇──────────────────────────────────────────────────────────────◇
           │                    │                    │                     │
           │ loan_limit         │ payment_due        │ bank_info           │ general
           ▼                    ▼                    ▼                     ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  LOAN LIMIT     │  │  PAYMENT DUE     │  │  BANK INFO       │  │  GENERAL         │
│  HANDLER        │  │  HANDLER         │  │  HANDLER         │  │  HANDLER         │
│                 │  │                  │  │                  │  │                  │
│  Query:         │  │  Query:          │  │  Query:          │  │  Search FAQ &    │
│  - Borrowing    │  │  - Next due date │  │  - Bank name     │  │  Knowledge Base  │
│    limit left   │  │  - Amount owed   │  │  - Interest rate │  │  for best match  │
│  - 6-month &    │  │  - Installment   │  │  - Supported     │  │                  │
│    1-year caps  │  │    breakdown     │  │    currencies    │  │  If no match:    │
│  - Current      │  │  - Overdue       │  │  - Contact info  │  │  "I'm not sure,  │
│    utilization  │  │    penalties     │  │  - Operating     │  │   please contact  │
│                 │  │                  │  │    hours         │  │   support"        │
└────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                    │                     │                      │
         └────────────────────┴──────────┬──────────┴──────────────────────┘
                                         │
                                         ▼
                          ┌───────────────────────────┐
                          │  Query User-Specific Data │
                          │  from Database / Smart    │
                          │  Contract as Needed       │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Format Response:         │
                          │  - Natural language text  │
                          │  - Include specific data  │
                          │  - Add action suggestions │
                          │    (e.g., "Pay Now" link) │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Log Interaction:         │
                          │  - User ID                │
                          │  - Question text          │
                          │  - Detected intent        │
                          │  - Response given         │
                          │  - Timestamp              │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Display Response in      │
                          │  Chatbot UI               │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                                ◇─────────────────◇
                               ╱  User Asks        ╲
                              ╱   Another Question?  ╲
                             ◇───────────────────────◇
                             │ Yes                │ No
                             │                    ▼
                             │              ┌─────────┐
                             │              │   END   │
                             │              └─────────┘
                             │
                             └──── (loop back to "User Types Question")
```

---

## Crypto World Bank — Hierarchical Banking Flow

```
  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
  │  WORLD BANK SWIMLANE                                                                         │
  └──────────────────────────────────────────────────────────────────────────────────────────────┘

                                          ┌───────────┐
                                          │   START   │
                                          └─────┬─────┘
                                                │
                                                ▼
                                    ┌───────────────────────────┐
                                    │  World Bank Deposits      │
                                    │  Reserve Funds into       │
                                    │  Smart Contract           │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Funds Available in       │
                                    │  World Bank Reserve Pool  │
                                    └─────────────┬─────────────┘
                                                  │
  ┌───────────────────────────────────────────────┼──────────────────────────────────────────────┐
  │  NATIONAL BANK SWIMLANE                       │                                              │
  └───────────────────────────────────────────────┼──────────────────────────────────────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  National Bank Requests   │
                                    │  Loan from World Bank     │
                                    │  (amount, purpose)        │
                                    └─────────────┬─────────────┘
                                                  │
  ┌───────────────────────────────────────────────┼──────────────────────────────────────────────┐
  │  WORLD BANK SWIMLANE (Review)                 │                                              │
  └───────────────────────────────────────────────┼──────────────────────────────────────────────┘
                                                  │
                                                  ▼
                                         ◇─────────────────◇
                                        ╱  WB Approves       ╲
                                       ╱   NB Request?        ╲
                                      ◇───────────────────────◇
                                      │ Yes                     │ No
                                      │                         ▼
                                      │            ┌──────────────────────────┐
                                      │            │  Reject NB Request       │
                                      │            │  Notify National Bank    │
                                      │            └────────────┬─────────────┘
                                      │                         ▼
                                      │                   ┌─────────┐
                                      │                   │   END   │
                                      │                   └─────────┘
                                      │
                                      ▼
                          ┌───────────────────────────┐
                          │  Smart Contract Transfers  │
                          │  Funds: World Bank ──►     │
                          │  National Bank Wallet      │
                          │  Emit: FundsTransferred    │
                          └─────────────┬─────────────┘
                                        │
  ┌─────────────────────────────────────┼──────────────────────────────────────────────────────────┐
  │  NATIONAL BANK SWIMLANE (Lending)   │                                                          │
  └─────────────────────────────────────┼──────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  National Bank Receives    │
                          │  Funds, Updates Reserve    │
                          └─────────────┬─────────────┘
                                        │
  ┌─────────────────────────────────────┼──────────────────────────────────────────────────────────┐
  │  LOCAL BANK SWIMLANE                │                                                          │
  └─────────────────────────────────────┼──────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Local Bank Requests Loan  │
                          │  from National Bank        │
                          │  (amount, purpose)         │
                          └─────────────┬─────────────┘
                                        │
  ┌─────────────────────────────────────┼──────────────────────────────────────────────────────────┐
  │  NATIONAL BANK SWIMLANE (Review)    │                                                          │
  └─────────────────────────────────────┼──────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                               ◇─────────────────◇
                              ╱  NB Approves       ╲
                             ╱   LB Request?        ╲
                            ◇───────────────────────◇
                            │ Yes                     │ No
                            │                         ▼
                            │            ┌──────────────────────────┐
                            │            │  Reject LB Request       │
                            │            │  Notify Local Bank       │
                            │            └────────────┬─────────────┘
                            │                         ▼
                            │                   ┌─────────┐
                            │                   │   END   │
                            │                   └─────────┘
                            │
                            ▼
                ┌───────────────────────────┐
                │  Smart Contract Transfers  │
                │  Funds: National Bank ──►  │
                │  Local Bank Wallet         │
                │  Emit: FundsTransferred    │
                └─────────────┬─────────────┘
                              │
  ┌───────────────────────────┼────────────────────────────────────────────────────────────────────┐
  │  LOCAL BANK SWIMLANE (Lending to Borrower)                                                     │
  └───────────────────────────┼────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  Local Bank Receives      │
                │  Funds, Updates Reserve   │
                └─────────────┬─────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  Borrower Requests Loan   │
                │  from Local Bank          │
                └─────────────┬─────────────┘
                              │
                              ▼
                     ◇─────────────────◇
                    ╱  LB Approves       ╲
                   ╱   Borrower Loan?     ╲
                  ◇───────────────────────◇
                  │ Yes                     │ No
                  │                         ▼
                  │            ┌──────────────────────────┐
                  │            │  Reject Borrower Loan    │
                  │            │  Notify Borrower         │
                  │            └────────────┬─────────────┘
                  │                         ▼
                  │                   ┌─────────┐
                  │                   │   END   │
                  │                   └─────────┘
                  │
                  ▼
      ┌───────────────────────────┐
      │  Transfer Funds:          │
      │  Local Bank ──► Borrower  │
      │  Emit: LoanApproved      │
      └─────────────┬─────────────┘
                    │
                    ▼
      ┌───────────────────────────┐
      │  Borrower Receives Funds  │
      │  Loan is Active           │
      └─────────────┬─────────────┘
                    │
                    │
  ══════════════════╪═══════════════════════════════════════════════════
  ║   REPAYMENT CHAIN (Cascading Upward)                              ║
  ══════════════════╪═══════════════════════════════════════════════════
                    │
                    ▼
      ┌───────────────────────────┐
      │  Borrower Repays Loan     │
      │  to Local Bank            │
      │  (+ interest)             │
      └─────────────┬─────────────┘
                    │
                    ▼
      ┌───────────────────────────┐
      │  Local Bank Repays Loan   │
      │  to National Bank         │
      │  (+ interest)             │
      └─────────────┬─────────────┘
                    │
                    ▼
      ┌───────────────────────────┐
      │  National Bank Repays     │
      │  Loan to World Bank       │
      │  (+ interest)             │
      └─────────────┬─────────────┘
                    │
                    ▼
      ┌───────────────────────────┐
      │  World Bank Receives      │
      │  Repayment, Updates       │
      │  Reserve Pool             │
      └─────────────┬─────────────┘
                    │
                    ▼
              ┌─────────┐
              │   END   │
              └─────────┘
```

---

## Crypto World Bank — Market Data Viewing Flow

```
                                          ┌───────────┐
                                          │   START   │
                                          └─────┬─────┘
                                                │
                                                ▼
                                    ┌───────────────────────────┐
                                    │  Borrower Navigates to    │
                                    │  Dashboard Page           │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Select an Active Loan    │
                                    │  from Loan List           │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Identify Crypto Type     │
                                    │  Associated with Loan     │
                                    │  (e.g., ETH, MATIC, BTC)  │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                         ◇─────────────────◇
                                        ╱  Cache Exists &    ╲
                                       ╱   Not Stale?         ╲
                                      ╱    (< 5 min old)       ╲
                                     ◇─────────────────────────◇
                                     │ Yes (Fresh)         │ No (Stale / Missing)
                                     │                     │
                                     │                     ▼
                                     │       ┌───────────────────────────┐
                                     │       │  Fetch Live Data from     │
                                     │       │  CoinGecko API:           │
                                     │       │  GET /coins/{id}/market   │
                                     │       │  _chart?vs_currency=usd   │
                                     │       │  &days=30                 │
                                     │       └─────────────┬─────────────┘
                                     │                     │
                                     │                     ▼
                                     │            ◇─────────────────◇
                                     │           ╱  API Response     ╲
                                     │          ╱   Successful?       ╲
                                     │         ◇──────────────────────◇
                                     │         │ Yes             │ No
                                     │         │                 ▼
                                     │         │    ┌──────────────────────────┐
                                     │         │    │  Show Error:             │
                                     │         │    │  "Market data currently  │
                                     │         │    │   unavailable. Showing   │
                                     │         │    │   last cached data."     │
                                     │         │    └────────────┬─────────────┘
                                     │         │                 │
                                     │         │                 └──────┐
                                     │         │                       │
                                     │         ▼                       │
                                     │  ┌───────────────────────────┐  │
                                     │  │  Store Response in Cache  │  │
                                     │  │  with Timestamp           │  │
                                     │  └─────────────┬─────────────┘  │
                                     │                │                │
                                     └────────┬───────┘                │
                                              │       ┌────────────────┘
                                              │       │
                                              ▼       ▼
                                    ┌───────────────────────────┐
                                    │  Render Price Chart:      │
                                    │  ┌─────────────────────┐  │
                                    │  │ - Line chart with   │  │
                                    │  │   price over time   │  │
                                    │  │ - Interactive        │  │
                                    │  │   tooltips on hover  │  │
                                    │  │ - Time range         │  │
                                    │  │   selector:          │  │
                                    │  │   [1D][7D][1M][3M]  │  │
                                    │  └─────────────────────┘  │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Display Statistics:      │
                                    │  - Current Price          │
                                    │  - 24h Change (%)         │
                                    │  - 7d High / Low          │
                                    │  - Market Cap             │
                                    │  - Loan Value in USD      │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Start Polling Timer:     │
                                    │  setInterval(5 min)       │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                         ◇─────────────────◇
                                        ╱  User Still on    ╲
                                       ╱   Dashboard?        ╲
                                      ◇──────────────────────◇
                                      │ Yes                    │ No
                                      │                        ▼
                                      │                  ┌───────────────┐
                                      │                  │  Clear Timer  │
                                      │                  │  Cleanup      │
                                      │                  └───────┬───────┘
                                      │                          ▼
                                      │                    ┌─────────┐
                                      │                    │   END   │
                                      │                    └─────────┘
                                      │
                                      └──── (poll: re-fetch & re-render)
```

---

## Crypto World Bank — Profile Management Flow

```
                                          ┌───────────┐
                                          │   START   │
                                          └─────┬─────┘
                                                │
                                                ▼
                                    ┌───────────────────────────┐
                                    │  User Navigates to        │
                                    │  Profile Page             │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Identify User Type:      │
                                    │  Borrower / Local Bank /  │
                                    │  National Bank /          │
                                    │  World Bank               │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Load Profile Data from   │
                                    │  Database & Smart Contract│
                                    │  (name, wallet, role,     │
                                    │   stats, preferences)     │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │  Display Role-Specific    │
                                    │  Profile Dashboard:       │
                                    │                           │
                                    │  Borrower: loans, limit,  │
                                    │    repayment history      │
                                    │  Bank: approvals, reserve,│
                                    │    pending requests       │
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
              ◇───────────────────────────────────────────────────────────────◇
             ╱                     User Selects Action                        ╲
            ◇─────────────────────────────────────────────────────────────────◇
            │                    │                     │                       │
            │ Edit Profile       │ Accept T&C          │ Manage Prefs          │ View History
            ▼                    ▼                     ▼                       ▼
┌─────────────────────┐ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────────┐
│  EDIT PROFILE       │ │  ACCEPT TERMS &    │ │  MANAGE            │ │  VIEW HISTORY          │
│                     │ │  CONDITIONS        │ │  PREFERENCES       │ │                        │
│  Open Edit Form:    │ │                    │ │                    │ │  Identify Role:        │
│  - Display Name     │ │  Display Full T&C  │ │  Toggle Options:   │ │                        │
│  - Email            │ │  Document          │ │  - Theme           │ │  Borrower:             │
│  - Phone            │ │                    │ │    (Light / Dark)  │ │  - Past Loans          │
│  - Avatar           │ │  User Reads &      │ │  - Email Notifs    │ │  - Payment Records     │
│                     │ │  Scrolls to Bottom │ │    (On / Off)      │ │  - Income Verifications│
└──────────┬──────────┘ │                    │ │  - Push Notifs     │ │                        │
           │            │  Click "I Accept"  │ │    (On / Off)      │ │  Bank:                 │
           ▼            │                    │ │  - Language        │ │  - Approved Loans      │
  ┌────────────────┐    └─────────┬──────────┘ └─────────┬──────────┘ │  - Rejected Loans      │
  │  Validate      │             │                      │            │  - Pending Reviews     │
  │  Input Fields: │             │                      │            └───────────┬────────────┘
  │  - Required    │             │                      │                        │
  │    fields      │             │                      │                        │
  │  - Email       │             │                      │                        │
  │    format      │             │                      │                        │
  │  - Phone       │             │                      │                        │
  │    format      │             │                      │                        │
  └───────┬────────┘             │                      │                        │
          │                      │                      │                        │
          ▼                      │                      │                        │
  ◇─────────────────◇           │                      │                        │
 ╱  Validation       ╲          │                      │                        │
╱   Passed?           ╲         │                      │                        │
◇─────────────────────◇        │                      │                        │
│ Yes            │ No           │                      │                        │
│                ▼              │                      │                        │
│  ┌──────────────────┐        │                      │                        │
│  │  Show Errors     │        │                      │                        │
│  │  Highlight       │        │                      │                        │
│  │  Invalid Fields  │        │                      │                        │
│  └──────┬───────────┘        │                      │                        │
│         │                    │                      │                        │
│         └── (back to form)   │                      │                        │
│                              │                      │                        │
▼                              ▼                      ▼                        ▼
┌─────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────────┐
│  Save Updated   │  │  Update Database:  │  │  Save Preferences  │  │  Render History Table  │
│  Profile to DB  │  │  accepted_terms    │  │  to Database       │  │  with Pagination &     │
│  Show Success   │  │  = true            │  │  Apply Theme       │  │  Filters               │
│  Toast          │  │  accepted_date     │  │  Immediately       │  │  (date, status, type)  │
│                 │  │  = now()           │  │  Show Success      │  │                        │
└────────┬────────┘  └─────────┬──────────┘  └─────────┬──────────┘  └───────────┬────────────┘
         │                     │                       │                         │
         └─────────────────────┴───────────┬───────────┴─────────────────────────┘
                                           │
                                           ▼
                              ┌───────────────────────────┐
                              │  Return to Profile        │
                              │  Dashboard (Refreshed)    │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                                      ┌─────────┐
                                      │   END   │
                                      └─────────┘
```
