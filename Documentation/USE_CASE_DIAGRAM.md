# Use Case Diagram
## Crypto World Bank System

---

```
                    ┌───────────────────────────────────────────────────────────────────────────────────────────┐
                    │                              CRYPTO WORLD BANK SYSTEM                                     │
                    │                                                                                           │
  Borrower          │                  ── WALLET & ONBOARDING ──                                               │          Bank Approver
     O              │                                                                                           │               O
    /|\  ──────────>│  ( Connect Wallet )                                                                      │<────────── /|\
    / \  ──────────>│  ( Accept Terms & Conditions )                                                           │            / \
     │   ──────────>│  ( Manage Profile )                                                                      │             │
     │              │                                                                                           │             │
     │              │                  ── LOAN LIFECYCLE ──                                                     │             │
     │   ──────────>│  ( Request Loan )                                                                        │             │
     │              │        │ <<include>>                                                                      │             │
     │              │        ├──> ( Check Borrowing Limit )                                                    │             │
     │              │        └──> ( Upload Income Proof )                                                      │             │
     │   ──────────>│  ( View My Loans )                                                                       │             │
     │   ──────────>│  ( Pay Installment )                                                                     │             │
     │              │                                                                                           │             │
     │              │                             ( Review Loan Request )  ─────────────────────────────────────│<────────── │
     │              │                                   │ <<include>>                                           │             │
     │              │                                   ├──> ( View AI/ML Fraud Scores )                       │             │
     │              │                                   └──> ( View XAI Explanations )                         │             │
     │              │                             ( Approve Loan )  ────────────────────────────────────────────│<────────── │
     │              │                             ( Reject Loan )  ─────────────────────────────────────────────│<────────── │
     │              │                             ( Review Income Proof )  ─────────────────────────────────────│<────────── │
     │              │                                                                                           │             │
     │              │                  ── FINANCE & DATA ──                                                     │             │
     │   ──────────>│  ( Deposit to Reserve )                                                                  │             │
     │   ──────────>│  ( View Borrowing Limit )                                                                │             │
     │   ──────────>│  ( View Market Data )                                                                    │             │
     │   ──────────>│  ( Generate QR Code )                                                                    │             │
     │              │                                                                                           │             │
     │              │                  ── COMMUNICATION ──                                                      │             │
     │   ──────────>│  ( Chat with Bank )                                                                      │             │
     │              │        ─ ─ ─ <<extend>> ─ ─ ─                                                            │             │
     │              │  ( Chat with Borrower )  ────────────────────────────────────────────────────────────────│<────────── │
     │   ──────────>│  ( Use AI Chatbot )                                                                      │             │
     │              │        │ <<include>>                                                                      │             │
     │              │        └──> ( Query Loan Data )                                                          │             │
     │              │                                                                                           │             │
     │              │                  ── AI/ML SECURITY (Bank Only) ──                                        │             │
     │              │                             ( View Risk Dashboard )  ─────────────────────────────────────│<────────── │
     │              │                             ( View Anomaly Alerts )  ─────────────────────────────────────│<────────── │
     │              │                                                                                           │             │
     │              │═══════════════════════════════════════════════════════════════════════════════════════════│             │
     │              │                                                                                           │             │
  World Bank        │                  ── BANKING HIERARCHY ──                                                 │  National Bank
  Admin             │                                                                                           │
     O              │                                                                                           │               O
    /|\  ──────────>│  ( Register National Bank )                                                              │<────────── /|\
    / \  ──────────>│  ( Lend to National Bank )                                                               │            / \
     │   ──────────>│  ( View All Statistics )                                                                 │             │
     │   ──────────>│  ( Pause / Unpause System )                                                              │             │
     │   ──────────>│  ( Emergency Withdraw )                                                                  │             │
     │   ──────────>│  ( Review Security Logs )                                                                │             │
     │              │                                                                                           │             │
     │              │                             ( Register Local Bank )  ─────────────────────────────────────│<────────── │
     │              │                             ( Borrow from World Bank )  ──────────────────────────────────│<────────── │
     │              │                             ( Lend to Local Bank )  ──────────────────────────────────────│<────────── │
     │              │                             ( Set Bank Approver )  ───────────────────────────────────────│<────────── │
     │              │                             ( Add Bank User )  ──────────────────────────────────────────│<────────── │
     │              │                             ( View Local Bank Portfolio )  ───────────────────────────────│<────────── │
     │              │                                                                                           │             │
                    └───────────────────────────────────────────────────────────────────────────────────────────┘
```

**Actors (4):**

| Actor | Symbol | Role |
|-------|--------|------|
| Borrower | Left (top) | End user who deposits, requests loans, pays installments |
| Bank Approver | Right (top) | Reviews/approves/rejects loans using AI risk data |
| World Bank Admin | Left (bottom) | System owner — manages banks, pauses system, emergency controls |
| National Bank | Right (bottom) | Mid-tier bank — borrows from World Bank, lends to Local Banks |

**Relationships:**
- `<<include>>` — Required sub-flow that always executes (e.g., Request Loan always includes Check Borrowing Limit)
- `<<extend>>` — Optional extension triggered by a condition (e.g., Chat with Bank may extend to Chat with Borrower)

**Use Cases (29 total):**
- **Borrower (13):** Connect Wallet, Accept Terms, Manage Profile, Request Loan, View My Loans, Pay Installment, Deposit to Reserve, View Borrowing Limit, View Market Data, Generate QR Code, Chat with Bank, Upload Income Proof, Use AI Chatbot
- **Bank Approver (11):** Connect Wallet, Review Loan Request, Approve Loan, Reject Loan, Review Income Proof, Chat with Borrower, View Risk Dashboard, View AI/ML Fraud Scores, View Anomaly Alerts, View XAI Explanations
- **World Bank Admin (6):** Register National Bank, Lend to National Bank, View All Statistics, Pause/Unpause System, Emergency Withdraw, Review Security Logs
- **National Bank (6):** Register Local Bank, Borrow from World Bank, Lend to Local Bank, Set Bank Approver, Add Bank User, View Local Bank Portfolio
