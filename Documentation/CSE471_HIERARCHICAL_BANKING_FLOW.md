# CSE471 - Hierarchical Banking Flow
## Sequential Diagram: World Bank → National → Local Banking Structure

**Course:** CSE471 - System Analysis  
**Flow:** Hierarchical Banking Money Flow  
**Date:** 2024

---

## Hierarchical Banking Flow (Top-Down Expanding Tree)

```
HIERARCHICAL BANKING FLOW (Top-Down Expanding Tree)
│
├── LEVEL 1: WORLD BANK TO NATIONAL BANK
│   │
│   ├── 1. National Bank Requests Loan from World Bank
│   │   │
│   │   └── LEVEL 2: LOAN REQUEST
│   │       │
│   │       ├── 1.1 National Bank Admin Initiates Request
│   │       │   │
│   │       │   └── LEVEL 3: REQUEST INITIATION
│   │       │       │
│   │       │       ├── 1.1.1 Navigate to World Bank Interface
│       │       │       ├── National Bank admin logs in
│       │       │       ├── Access "Borrow from World Bank" page
│       │       │       └── View available reserve
│       │       │       │
│       │       │       ├── 1.1.2 Check World Bank Reserve
│       │       │       │   │
│       │       │       │   └── LEVEL 4: RESERVE CHECK
│       │       │       │       │
│       │       │       │       ├── 1.1.2.1 Query World Bank Reserve
│       │       │       │       │   ├── Call WorldBankContract.getTotalReserve()
│       │       │       │       │   ├── Get total reserve amount
│       │       │       │       │   └── Display to national bank
│       │       │       │       │
│       │       │       │       └── 1.1.2.2 Check Available Amount
│       │       │       │           ├── Calculate available = total - lent
│       │       │       │           └── Display available reserve
│       │       │       │
│       │       │       └── 1.1.3 Enter Loan Request Details
│       │       │           ├── Enter loan amount
│       │       │           ├── Enter purpose
│       │       │           └── Submit request
│       │       │
│       │       ├── 1.2 World Bank Admin Reviews Request
│       │       │   │
│       │       │   └── LEVEL 3: REQUEST REVIEW
│       │       │       │
│       │       │       ├── 1.2.1 View Pending Requests
│       │       │       │   ├── Query pending national bank requests
│       │       │       │   ├── Display request list
│       │       │       │   └── Show amount, purpose, bank name
│       │       │       │
│       │       │       ├── 1.2.2 Review Request Details
│       │       │       │   ├── View national bank history
│       │       │       │   ├── Check repayment record
│       │       │       │   └── Make approval decision
│       │       │       │
│       │       │       └── 1.2.3 Approve/Reject Request
│       │       │           ├── If approve: Proceed to transfer
│       │       │           └── If reject: Notify national bank
│       │       │
│       │       └── 1.3 Execute Loan Transfer
│       │           │
│       │           └── LEVEL 3: BLOCKCHAIN TRANSACTION
│       │               │
│       │               ├── 1.3.1 Prepare Smart Contract Call
│       │       │           ├── Contract: WorldBankContract
│       │       │           ├── Function: lendToNationalBank(nationalBankId, amount)
│       │       │           └── Signer: World Bank admin wallet
│       │       │
│       │               ├── 1.3.2 Execute Transaction
│       │       │           ├── Sign transaction
│       │       │           ├── Broadcast to blockchain
│       │       │           └── Wait for confirmation
│       │       │
│       │               ├── 1.3.3 Transfer Funds
│       │       │           ├── World Bank contract transfers ETH
│       │       │           ├── To National Bank contract
│       │       │           └── Update reserves
│       │       │
│       │               └── 1.3.4 Update Database
│       │       │           ├── UPDATE NATIONAL_BANK
│       │       │           ├── total_borrowed += amount
│       │       │           ├── UPDATE WORLD_BANK
│       │       │           ├── total_reserve -= amount
│       │       │           └── Create transaction record
│   │
│   ├── 2. National Bank Receives Funds
│   │   │
│   │   └── LEVEL 2: FUND RECEPTION
│   │       │
│       ├── 2.1 Verify Transaction
│       │   ├── Check blockchain transaction
│       │   ├── Verify amount received
│       │   └── Confirm transaction hash
│       │
│       └── 2.2 Update National Bank Balance
│           ├── Update contract balance
│           ├── Update database records
│           └── Notify national bank admin
│
├── LEVEL 1: NATIONAL BANK TO LOCAL BANK
│   │
│   ├── 3. Local Bank Requests Loan from National Bank
│   │   │
│   │   └── LEVEL 2: LOAN REQUEST
│   │       │
│       ├── 3.1 Local Bank Admin Initiates Request
│       │   │
│       │   └── LEVEL 3: REQUEST INITIATION
│       │       │
│       │       ├── 3.1.1 Navigate to National Bank Interface
│       │       │   ├── Local Bank admin logs in
│       │       │   ├── Access "Borrow from National Bank" page
│       │       │   └── View available funds
│       │       │
│       │       ├── 3.1.2 Check National Bank Capacity
│       │       │   │
│       │       │   └── LEVEL 4: CAPACITY CHECK
│       │       │       │
│       │       │       ├── 3.1.2.1 Query National Bank Balance
│       │       │       │   ├── Call NationalBankContract.getAvailableBalance()
│       │       │       │   ├── Get available lending capacity
│       │       │       │   └── Display to local bank
│       │       │       │
│       │       │       └── 3.1.2.2 Calculate Available Amount
│       │       │           ├── available = borrowed - lent
│       │       │           └── Display available capacity
│       │       │
│       │       └── 3.1.3 Enter Loan Request
│       │           ├── Enter loan amount
│       │           ├── Enter purpose
│       │           └── Submit request
│   │
│   ├── 4. National Bank Admin Reviews Request
│   │   │
│   │   └── LEVEL 2: REQUEST REVIEW
│   │       │
│       ├── 4.1 View Pending Requests
│       │   ├── Query pending local bank requests
│       │   ├── Display request list
│       │   └── Show details
│       │
│       ├── 4.2 Review and Approve
│       │   ├── Review local bank history
│       │   ├── Check repayment record
│       │   └── Approve/reject request
│       │
│       └── 4.3 Execute Transfer
│           │
│           └── LEVEL 3: BLOCKCHAIN TRANSACTION
│               │
│               ├── 4.3.1 Prepare Smart Contract Call
│       │           ├── Contract: NationalBankContract
│       │           ├── Function: lendToLocalBank(localBankId, amount)
│       │           └── Signer: National Bank admin wallet
│       │
│       │       ├── 4.3.2 Execute Transaction
│       │           ├── Sign and broadcast
│       │           └── Wait for confirmation
│       │
│       │       └── 4.3.3 Update Database
│       │           ├── UPDATE LOCAL_BANK
│       │           ├── total_borrowed += amount
│       │           ├── UPDATE NATIONAL_BANK
│       │           ├── total_lent += amount
│       │           └── Create transaction record
│   │
│   └── 5. Local Bank Receives Funds
│       │
│       └── LEVEL 2: FUND RECEPTION
│           │
│           ├── 5.1 Verify Transaction
│           │   ├── Check blockchain transaction
│           │   ├── Verify amount received
│           │   └── Confirm transaction hash
│           │
│           └── 5.2 Update Local Bank Balance
│               ├── Update contract balance
│               ├── Update database records
│               └── Notify local bank admin
│
├── LEVEL 1: LOCAL BANK TO BORROWER
│   │
│   ├── 6. Borrower Requests Loan from Local Bank
│   │   │
│   │   └── LEVEL 2: LOAN REQUEST
│   │       │
│       ├── 6.1 Borrower Initiates Request
│       │   │
│       │   └── LEVEL 3: REQUEST INITIATION
│       │       │
│       │       ├── 6.1.1 Select Local Bank
│       │       │   ├── Borrower views available local banks
│       │       │   ├── Selects bank in their country
│       │       │   └── Cannot select national or world bank
│       │       │
│       │       ├── 6.1.2 Check Local Bank Capacity
│       │       │   │
│       │       │   └── LEVEL 4: CAPACITY CHECK
│       │       │       │
│       │       │       ├── 6.1.2.1 Query Local Bank Balance
│       │       │       │   ├── Call LocalBankContract.getAvailableBalance()
│       │       │       │   ├── Get available lending capacity
│       │       │       │   └── Display to borrower
│       │       │       │
│       │       │       └── 6.1.2.2 Validate Request
│       │       │           ├── Check if amount <= available
│       │       │           └── Check borrower limits
│       │       │
│       │       └── 6.1.3 Submit Loan Request
│       │           ├── Enter amount and purpose
│       │           ├── Upload income proof (if first-time)
│       │           └── Submit request
│   │
│   ├── 7. Bank User Reviews Request
│   │   │
│   │   └── LEVEL 2: REQUEST REVIEW
│   │       │
│       ├── 7.1 View Pending Requests
│       │   ├── Bank user (approver) views requests
│       │   ├── Only one approver per bank
│       │   └── Display request list
│       │
│       ├── 7.2 Review Request Details
│       │   ├── Review borrower history
│       │   ├── Check income proof (if first-time)
│       │   ├── Check borrowing limits
│       │   └── Make decision
│       │
│       └── 7.3 Approve/Reject Request
│           │
│           └── LEVEL 3: APPROVAL PROCESS
│               │
│               ├── 7.3.1 If Approved: Execute Transfer
│       │           │
│       │           └── LEVEL 4: BLOCKCHAIN TRANSACTION
│       │               │
│       │               ├── 7.3.1.1 Prepare Smart Contract Call
│       │       │           ├── Contract: LocalBankContract
│       │       │           ├── Function: approveLoan(loanId)
│       │       │           └── Signer: Bank user wallet
│       │       │
│       │               ├── 7.3.1.2 Execute Transaction
│       │       │           ├── Sign and broadcast
│       │       │           ├── Gas cost deducted from borrower
│       │       │           └── Wait for confirmation
│       │       │
│       │               ├── 7.3.1.3 Transfer Funds
│       │       │           ├── Local Bank contract transfers ETH
│       │       │           ├── To borrower wallet
│       │       │           └── Update bank reserves
│       │       │
│       │               └── 7.3.1.4 Update Database
│       │       │           ├── UPDATE LOAN_REQUEST
│       │       │           ├── status = 'approved'
│       │       │           ├── UPDATE LOCAL_BANK
│       │       │           ├── total_lent += amount
│       │       │           └── Create transaction record
│       │
│               └── 7.3.2 If Rejected: Update Status
│       │           ├── UPDATE LOAN_REQUEST
│       │           ├── status = 'rejected'
│       │           └── Notify borrower
│   │
│   └── 8. Borrower Receives Funds
│       │
│       └── LEVEL 2: FUND RECEPTION
│           │
│           ├── 8.1 Verify Transaction
│           │   ├── Check blockchain transaction
│           │   ├── Verify amount received (after gas deduction)
│           │   └── Confirm transaction hash
│           │
│           └── 8.2 Update Borrower Records
│               ├── Update loan status
│               ├── Update borrowing limits
│               └── Notify borrower
│
└── LEVEL 1: REPAYMENT FLOW (REVERSE)
    │
    ├── 9. Borrower Repays to Local Bank
    │   │
    │   └── LEVEL 2: REPAYMENT
    │       │
    │       ├── 9.1 Borrower Makes Payment
    │       │   ├── Pay installments or full amount
    │       │   ├── Transfer ETH to Local Bank contract
    │       │   └── Update loan status
    │       │
    │       └── 9.2 Local Bank Receives Payment
    │           ├── Update local bank balance
    │           ├── Update total_received
    │           └── Mark installments as paid
    │
    ├── 10. Local Bank Repays to National Bank
    │   │
    │   └── LEVEL 2: REPAYMENT
    │       │
    │       ├── 10.1 Local Bank Makes Payment
    │       │   ├── Transfer ETH to National Bank contract
    │       │   └── Update borrowing records
    │       │
    │       └── 10.2 National Bank Receives Payment
    │           ├── Update national bank balance
    │           └── Update total_received
    │
    └── 11. National Bank Repays to World Bank
        │
        └── LEVEL 2: REPAYMENT
            │
            ├── 11.1 National Bank Makes Payment
            │   ├── Transfer ETH to World Bank contract
            │   └── Update borrowing records
            │
            └── 11.2 World Bank Receives Payment
                ├── Update world bank reserve
                └── Update total_received
```

---

## Sequence Diagram

```
WORLD_BANK        NATIONAL_BANK      LOCAL_BANK        BORROWER         BLOCKCHAIN
   │                  │                 │                 │                 │
   │                  │──Request───────>│                 │                 │
   │                  │                 │                 │                 │
   │<──Approve────────│                 │                 │                 │
   │                  │                 │                 │                 │
   │──Transfer──────────────────────────────────────────────────────────>│
   │                  │                 │                 │                 │
   │                  │<──Received─────────────────────────────────────────│
   │                  │                 │                 │                 │
   │                  │                 │──Request───────>│                 │
   │                  │                 │                 │                 │
   │                  │<──Approve───────│                 │                 │
   │                  │                 │                 │                 │
   │                  │──Transfer──────────────────────────────────────>│
   │                  │                 │                 │                 │
   │                  │                 │<──Received───────────────────────│
   │                  │                 │                 │                 │
   │                  │                 │                 │──Request───────>│
   │                  │                 │                 │                 │
   │                  │                 │<──Approve───────│                 │
   │                  │                 │                 │                 │
   │                  │                 │──Transfer──────────────────────>│
   │                  │                 │                 │                 │
   │                  │                 │                 │<──Received───────│
```

---

## Money Flow Summary

```
WORLD BANK RESERVE (Top Level)
    │
    │ (Lends X ETH)
    ▼
NATIONAL BANKS (Country Level)
    │
    │ (Lends Y ETH, where Y <= X)
    ▼
LOCAL BANKS (City/Region Level)
    │
    │ (Lends Z ETH, where Z <= Y)
    ▼
BORROWERS (End Users)
    │
    │ (Repays Z ETH)
    ▼
LOCAL BANKS
    │
    │ (Repays Y ETH)
    ▼
NATIONAL BANKS
    │
    │ (Repays X ETH)
    ▼
WORLD BANK RESERVE
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis

