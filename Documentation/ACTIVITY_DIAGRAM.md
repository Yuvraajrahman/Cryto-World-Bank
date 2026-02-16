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
