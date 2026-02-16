# Use Case Diagram
## Crypto World Bank System

---

```
                                                                                                                          
     ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   
     │                                                                                                                  │   
     │                                       CRYPTO WORLD BANK SYSTEM                                                   │   
     │                                                                                                                  │   
     │                                                                                                                  │   
     │                                                                                                                  │   
  ┌──┴──┐         ( Connect Wallet )                                                                             ┌──┴──┐
  │     │────────────────────────────────────────────────────────────────────────────────────────────────────────>│     │
  │     │                                                                                                        │     │
  │     │         ( Deposit to Reserve )                                                                         │     │
  │     │──────────────────────────────>                                                                         │     │
  │     │                                                                                                        │     │
  │     │         ( Request Loan )                                      ( Review Loan Request )                  │     │
  │     │──────────────────────────────>                    <────────────────────────────────────────────────────│     │
  │     │                                                                                                        │     │
  │     │         ( View My Loans )                                     ( Approve Loan )                         │     │
  │     │──────────────────────────────>                    <────────────────────────────────────────────────────│     │
  │ B   │                                                                                                        │ B   │
  │ o   │         ( Pay Installment )                                   ( Reject Loan )                          │ a   │
  │ r   │──────────────────────────────>                    <────────────────────────────────────────────────────│ n   │
  │ r   │                                                                                                        │ k   │
  │ o   │         ( Upload Income Proof )                               ( Review Income Proof )                  │     │
  │ w   │──────────────────────────────>                    <────────────────────────────────────────────────────│ A   │
  │ e   │                                                                                                        │ p   │
  │ r   │         ( Chat with Bank )─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ( Chat with Borrower )                    │ p   │
  │     │──────────────────────────────>                    <────────────────────────────────────────────────────│ r   │
  │     │                                                                                                        │ o   │
  │     │         ( View Borrowing Limit )                              ( View Risk Dashboard )                  │ v   │
  │     │──────────────────────────────>                    <────────────────────────────────────────────────────│ e   │
  │     │                                                                                                        │ r   │
  │     │         ( Generate QR Code )                                  ( View AI/ML Fraud Scores )              │     │
  │     │──────────────────────────────>                    <────────────────────────────────────────────────────│     │
  │     │                                                                                                        │     │
  │     │         ( View Market Data )                                  ( View Anomaly Alerts )                  │     │
  │     │──────────────────────────────>                    <────────────────────────────────────────────────────│     │
  │     │                                                                                                        │     │
  │     │         ( Manage Profile )                                    ( View XAI Explanations )                │     │
  │     │──────────────────────────────>                    <────────────────────────────────────────────────────│     │
  │     │                                                                                                        │     │
  │     │         ( Accept Terms & Conditions )                                                                  │     │
  │     │──────────────────────────────>                                                                         │     │
  └──┬──┘                                                                                                        └──┬──┘
     │                                                                                                                │    
     │                                                                                                                │    
     │                                                                                                                │    
     │                                                                                                                │    
     │                                                                                                                │    
  ┌──┴──┐                                                                                                        ┌──┴──┐
  │     │         ( Register National Bank )                            ( Register Local Bank )                  │     │
  │     │──────────────────────────────>                    <────────────────────────────────────────────────────│     │
  │     │                                                                                                        │     │
  │ W   │         ( Lend to National Bank )                             ( Borrow from World Bank )               │ N   │
  │ o   │──────────────────────────────>                    <────────────────────────────────────────────────────│ a   │
  │ r   │                                                                                                        │ t   │
  │ l   │         ( View All Statistics )                               ( Lend to Local Bank )                   │ i   │
  │ d   │──────────────────────────────>                    <────────────────────────────────────────────────────│ o   │
  │     │                                                                                                        │ n   │
  │ B   │         ( Pause / Unpause System )                            ( Set Bank Approver )                    │ a   │
  │ a   │──────────────────────────────>                    <────────────────────────────────────────────────────│ l   │
  │ n   │                                                                                                        │     │
  │ k   │         ( Emergency Withdraw )                                ( Add Bank User )                        │ B   │
  │     │──────────────────────────────>                    <────────────────────────────────────────────────────│ a   │
  │ A   │                                                                                                        │ n   │
  │ d   │         ( Review Security Logs )                              ( View Local Bank Portfolio )             │ k   │
  │ m   │──────────────────────────────>                    <────────────────────────────────────────────────────│     │
  │ i   │                                                                                                        │     │
  │ n   │                                                                                                        │     │
  └─────┘                                                                                                        └─────┘
     │                                                                                                                     
     └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   
```

**Actors:** Borrower, Bank Approver, World Bank Admin, National Bank

**Use Cases (28 total):**
- Borrower: Connect Wallet, Deposit, Request Loan, View Loans, Pay Installment, Upload Income Proof, Chat, View Borrowing Limit, QR Code, Market Data, Manage Profile, Accept Terms
- Bank Approver: Review/Approve/Reject Loan, Review Income Proof, Chat, Risk Dashboard, Fraud Scores, Anomaly Alerts, XAI Explanations
- World Bank Admin: Register National Bank, Lend, View Stats, Pause/Unpause, Emergency Withdraw, Security Logs
- National Bank: Register Local Bank, Borrow, Lend to Local, Set Approver, Add User, View Portfolio
