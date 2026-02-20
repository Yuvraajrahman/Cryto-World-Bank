# CSE471 - Installment Payment Flow
## Sequential Diagram: Installment Payment System

**Course:** CSE471 - System Analysis  
**Flow:** Installment Payment System  
**Date:** 2024

---

## Installment Payment Flow (Top-Down Expanding Tree)

```
INSTALLMENT PAYMENT FLOW (Top-Down Expanding Tree)
│
├── LEVEL 1: BORROWER VIEWS ACTIVE LOANS
│   │
│   ├── 1. Navigate to Dashboard
│   │   │
│   │   └── LEVEL 2: DASHBOARD LOADING
│   │       │
│   │       ├── 1.1 Load Active Loans
│   │       │   │
│   │       │   └── LEVEL 3: LOAN RETRIEVAL
│   │       │       │
│   │       │       ├── 1.1.1 Query Active Loans
│   │       │       │   ├── SELECT * FROM LOAN_REQUEST
│   │       │       │   ├── WHERE borrower_id = ?
│   │       │       │   ├── AND status IN ('approved', 'active')
│   │       │       │   └── ORDER BY approved_at DESC
│   │       │       │
│   │       │       ├── 1.1.2 Check Installment Status
│   │       │       │   ├── For each loan: Check is_installment flag
│   │       │       │   └── If TRUE: Load installment records
│   │       │       │
│   │       │       └── 1.1.3 Load Installment Details
│   │       │           ├── SELECT * FROM INSTALLMENT
│   │       │           ├── WHERE loan_id = ?
│   │       │           └── ORDER BY installment_number ASC
│   │       │
│   │       └── 1.2 Display Loan Cards
│   │           ├── Show loan amount
│   │           ├── Show bank name
│   │           ├── Show deadline (if single payment)
│   │           ├── Show installment progress (if installment)
│   │           └── Show "Pay Now" button for due installments
│   │
│   ├── 2. View Loan Details
│   │   │
│   │   └── LEVEL 2: DETAILED VIEW
│   │       │
│   │       ├── 2.1 Display Loan Information
│   │       │   ├── Loan amount (original)
│   │       │   ├── Amount after gas deduction
│   │       │   ├── Purpose
│   │       │   ├── Approval date
│   │       │   └── Bank information
│   │       │
│   │       ├── 2.2 Display Installment Schedule (If Applicable)
│   │       │   │
│   │       │   └── LEVEL 3: INSTALLMENT DISPLAY
│   │       │       │
│   │       │       ├── 2.2.1 Show Installment List
│   │       │       │   ├── Table with all installments
│   │       │       │   ├── Columns: Number, Amount, Due Date, Status
│   │       │       │   └── Highlight overdue installments in red
│   │       │       │
│   │       │       ├── 2.2.2 Show Progress Indicator
│   │       │       │   ├── Progress bar: X of Y installments paid
│   │       │       │   ├── Percentage complete
│   │       │       │   └── Visual progress indicator
│   │       │       │
│       │       └── 2.2.3 Show Next Due Installment
│       │           ├── Highlight next due installment
│       │           ├── Show countdown timer to due date
│       │           └── Show "Pay Now" button
│       │
│       └── 2.3 Display Deadline Information
│           ├── If single payment: Show final deadline
│           ├── If installment: Show next installment due date
│           ├── Show days remaining
│           └── Show overdue warning if past due
│   │
│   ├── 3. View Deadline Countdown
│   │   │
│   │   └── LEVEL 2: DEADLINE TRACKING
│   │       │
│   │       ├── 3.1 Calculate Time Remaining
│   │       │   │
│   │       │   └── LEVEL 3: TIME CALCULATION
│   │       │       │
│   │       │       ├── 3.1.1 Get Deadline
│       │       │       ├── For single payment: loan.deadline
│       │       │       ├── For installment: next_installment.due_date
│       │       │       └── Query from database
│       │       │       │
│       │       │       ├── 3.1.2 Calculate Difference
│       │       │       │   ├── deadline - current_time
│       │       │       │   ├── Convert to days, hours, minutes
│       │       │       │   └── Handle negative (overdue)
│       │       │       │
│       │       │       └── 3.1.3 Update Display
│       │       │           ├── If positive: Show countdown
│       │       │           ├── If negative: Show "Overdue" warning
│       │       │           └── Update every minute
│       │       │
│       │       └── 3.2 Display Deadline Widget
│       │           ├── Large countdown display
│       │           ├── Color coding (green/yellow/red)
│       │           ├── Days/Hours/Minutes breakdown
│       │           └── Warning messages for approaching deadlines
│   │
│   └── 4. Select Installment to Pay
│       │
│       └── LEVEL 2: INSTALLMENT SELECTION
│           │
│           ├── 4.1 View Available Installments
│           │   ├── Show pending installments
│           │   ├── Show overdue installments (highlighted)
│           │   ├── Show paid installments (grayed out)
│           │   └── Disable paid installments
│           │
│           └── 4.2 Select Installment
│               ├── Click on installment row
│               ├── Show installment details
│               ├── Show amount due
│               └── Enable "Pay Installment" button
│
├── LEVEL 1: PAY INSTALLMENT PROCESS
│   │
│   ├── 5. Initiate Payment
│   │   │
│   │   └── LEVEL 2: PAYMENT INITIATION
│   │       │
│   │       ├── 5.1 Display Payment Summary
│   │       │   ├── Installment number
│   │       │   ├── Amount due
│   │       │   ├── Due date
│   │       │   ├── Late fee (if overdue)
│       │       │   └── Total amount to pay
│       │       │
│       │       ├── 5.2 Check Wallet Balance
│       │       │   │
│       │       │   └── LEVEL 3: BALANCE CHECK
│       │       │       │
│       │       │       ├── 5.2.1 Query Wallet Balance
│       │       │       │   ├── Call blockchain: getBalance(address)
│       │       │       │   └── Get current ETH balance
│       │       │       │
│       │       │       ├── 5.2.2 Compare with Amount Due
│       │       │       │   ├── If balance < amount: Show error
│       │       │       │   ├── If balance >= amount: Continue
│       │       │       │   └── Include gas cost in calculation
│       │       │       │
│       │       │       └── 5.2.3 Display Balance Status
│       │       │           ├── Show current balance
│       │       │           ├── Show amount needed
│       │       │           └── Show insufficient balance warning if needed
│       │       │
│       │       ├── 5.3 Estimate Gas Cost
│       │       │   ├── Estimate gas for payment transaction
│       │       │   ├── Display estimated gas cost
│       │       │   └── Calculate total: amount + gas
│       │       │
│       │       └── 5.4 Show Confirmation Dialog
│       │           ├── Display all payment details
│       │           ├── Show total amount (including gas)
│       │           ├── Warning about blockchain transaction
│       │           └── Confirm/Cancel buttons
│   │
│   ├── 6. User Confirms Payment
│   │   │
│   │   └── LEVEL 2: PAYMENT EXECUTION
│   │       │
│   │       ├── 6.1 Prepare Payment Transaction
│   │       │   │
│   │       │   └── LEVEL 3: TRANSACTION PREPARATION
│   │       │       │
│   │       │       ├── 6.1.1 Get Installment Details
│   │       │       │   ├── SELECT * FROM INSTALLMENT
│   │       │       │   ├── WHERE installment_id = ?
│       │       │       │   └── Verify status = 'pending'
│       │       │       │
│       │       │       ├── 6.1.2 Calculate Payment Amount
│       │       │       │   ├── Base amount: installment.amount_due
│       │       │       │   ├── Late fee: Calculate if overdue
│       │       │       │   └── Total: base + late_fee
│       │       │       │
│       │       │       └── 6.1.3 Prepare Smart Contract Call
│       │       │           ├── Contract: LocalBankContract
│       │       │           ├── Function: payInstallment(loanId, installmentNumber)
│       │       │           ├── Value: payment_amount
│       │       │           └── Gas limit: Standard limit
│       │       │
│       │       ├── 6.2 Sign Transaction
│       │       │   │
│       │       │   └── LEVEL 3: WALLET INTERACTION
│       │       │       │
│       │       │       ├── 6.2.1 Prompt Wallet
│       │       │       │   ├── Wallet (MetaMask) shows transaction
│       │       │       │   ├── Display amount, gas, recipient
│       │       │       │   └── User reviews transaction
│       │       │       │
│       │       │       ├── 6.2.2 User Approves
│       │       │       │   ├── User clicks "Confirm" in wallet
│       │       │       │   ├── Transaction signed
│       │       │       │   └── Transaction hash generated
│       │       │       │
│       │       │       └── 6.2.3 User Rejects (Alternative Path)
│       │       │           ├── User clicks "Reject" in wallet
│       │       │           ├── Transaction cancelled
│       │       │           └── Return to installment view
│       │       │
│       │       ├── 6.3 Broadcast Transaction
│       │       │   │
│       │       │   └── LEVEL 3: BLOCKCHAIN SUBMISSION
│       │       │       │
│       │       │       ├── 6.3.1 Send to Network
│       │       │       │   ├── Broadcast transaction to blockchain
│       │       │       │   ├── Get transaction hash
│       │       │       │   └── Display "Transaction Pending" status
│       │       │       │
│       │       │       ├── 6.3.2 Wait for Confirmation
│       │       │       │   ├── Poll transaction status
│       │       │       │   ├── Wait for block inclusion
│       │       │       │   └── Get block number and timestamp
│       │       │       │
│       │       │       └── 6.3.3 Handle Transaction Result
│       │       │           ├── If success: Continue to database update
│       │       │           ├── If failure: Show error, stop flow
│       │       │           └── Extract transaction hash
│       │       │
│       │       ├── 6.4 Update Database
│       │       │   │
│       │       │   └── LEVEL 3: DATABASE OPERATIONS
│       │       │       │
│       │       │       ├── 6.4.1 Update Installment Status
│       │       │       │   ├── UPDATE INSTALLMENT
│       │       │       │   ├── status = 'paid'
│       │       │       │   ├── amount_paid = payment_amount
│       │       │       │   ├── paid_at = NOW()
│       │       │       │   └── blockchain_tx_hash = transaction_hash
│       │       │       │
│       │       │       ├── 6.4.2 Create Transaction Record
│       │       │       │   ├── INSERT INTO TRANSACTION
│       │       │       │   ├── transaction_type = 'installment_paid'
│       │       │       │   ├── amount = payment_amount
│       │       │       │   ├── related_loan_id = loan_id
│       │       │       │   └── blockchain_tx_hash = transaction_hash
│       │       │       │
│       │       │       ├── 6.4.3 Check if All Installments Paid
│       │       │       │   │
│       │       │       │   └── LEVEL 4: COMPLETION CHECK
│       │       │       │       │
│       │       │       │       ├── 6.4.3.1 Count Remaining Installments
│       │       │       │       │   ├── SELECT COUNT(*) FROM INSTALLMENT
│       │       │       │       │   ├── WHERE loan_id = ?
│       │       │       │       │   └── AND status != 'paid'
│       │       │       │       │
│       │       │       │       ├── 6.4.3.2 If All Paid: Update Loan Status
│       │       │       │       │   ├── UPDATE LOAN_REQUEST
│       │       │       │       │   ├── status = 'completed'
│       │       │       │       │   └── Update completed_at timestamp
│       │       │       │       │
│       │       │       │       └── 6.4.3.3 Update Borrower Statistics
│       │       │       │           ├── Check if this completes a loan
│       │       │       │           ├── If yes: Increment consecutive_paid_loans
│       │       │       │           └── Update borrowing limits
│       │       │       │
│       │       │       └── 6.4.4 Update Bank Statistics
│       │       │           ├── UPDATE LOCAL_BANK
│       │       │           ├── Update repayment statistics
│       │       │           └── Update total_received
│       │       │
│       │       └── 6.5 Display Success Message
│       │           ├── Show "Payment successful"
│       │           ├── Display transaction hash (clickable)
│       │           ├── Show updated installment status
│       │           ├── Show progress: X of Y installments paid
│       │           └── If all paid: Show "Loan completed" message
│   │
│   └── 7. Handle Overdue Installments
│       │
│       └── LEVEL 2: OVERDUE HANDLING
│           │
│           ├── 7.1 Detect Overdue Installments
│           │   │
│           │   └── LEVEL 3: OVERDUE DETECTION
│           │       │
│           │       ├── 7.1.1 Query Overdue Installments
│           │       │   ├── SELECT * FROM INSTALLMENT
│           │       │   ├── WHERE loan_id = ?
│           │       │   ├── AND status = 'pending'
│           │       │   ├── AND due_date < NOW()
│           │       │   └── ORDER BY due_date ASC
│           │       │
│           │       └── 7.1.2 Update Status to Overdue
│           │           ├── UPDATE INSTALLMENT
│           │           ├── status = 'overdue'
│           │           └── Calculate late fee
│           │
│           ├── 7.2 Calculate Late Fee
│           │   │
│           │   └── LEVEL 3: LATE FEE CALCULATION
│           │       │
│           │       ├── 7.2.1 Determine Days Overdue
│           │       │   ├── due_date - current_date
│           │       │   └── Calculate number of days
│       │       │
│       │       ├── 7.2.2 Apply Late Fee Formula
│       │       │   ├── Base late fee: 2% of installment amount
│       │       │   ├── Additional: 0.5% per week overdue
│       │       │   └── Maximum late fee: 10% of installment
│       │       │
│       │       └── 7.2.3 Update Installment Amount
│       │           ├── total_due = amount_due + late_fee
│       │           └── Display to borrower
│       │
│       └── 7.3 Display Overdue Warnings
│           ├── Show red warning banner
│           ├── Show number of overdue installments
│           ├── Show total late fees
│           └── Urgent "Pay Now" button
│
└── LEVEL 1: POST-PAYMENT ACTIONS
    │
    ├── 8. Update Dashboard Display
    │   │
    │   └── LEVEL 2: UI UPDATE
    │       │
    │       ├── 8.1 Refresh Loan List
    │       │   ├── Reload active loans
    │       │   ├── Update installment counts
    │       │   └── Update progress indicators
    │       │
    │       └── 8.2 Update Deadline Display
    │           ├── Recalculate next due date
    │           ├── Update countdown timer
    │           └── Remove paid installments from view
    │
    └── 9. Send Notifications
        │
        └── LEVEL 2: NOTIFICATION SYSTEM
            │
            ├── 9.1 Notify Borrower
            │   ├── In-app notification: "Installment paid successfully"
            │   ├── Show in notification center
            │   └── Email notification (optional)
            │
            └── 9.2 Notify Bank
                ├── Bank user sees updated payment status
                ├── Update in bank dashboard
                └── Log payment in transaction history
```

---

## Sequence Diagram

```
BORROWER          FRONTEND          DATABASE         BLOCKCHAIN      BANK
   │                 │                  │                 │              │
   │──View Loans───>│                  │                 │              │
   │                 │──Get Loans──────>│                 │              │
   │                 │<──Loans──────────│                 │              │
   │                 │                  │                 │              │
   │                 │──Get Installments>│                │              │
   │                 │<──Installments───│                 │              │
   │                 │                  │                 │              │
   │<──Loan List─────│                  │                 │              │
   │                 │                  │                 │              │
   │──Select Install>│                  │                 │              │
   │                 │                  │                 │              │
   │──Pay───────────>│                  │                 │              │
   │                 │──Check Balance──────────────────>│              │
   │                 │<──Balance─────────────────────────│              │
   │                 │                  │                 │              │
   │<──Confirm───────│                  │                 │              │
   │                 │                  │                 │              │
   │──Confirm───────>│                  │                 │              │
   │                 │──Pay Installment────────────────>│              │
   │                 │<──Tx Hash─────────────────────────│              │
   │                 │                  │                 │              │
   │                 │──Update Installment>│            │              │
   │                 │<──Updated────────│                 │              │
   │                 │                  │                 │              │
   │                 │──Create Transaction>│             │              │
   │                 │<──Created────────│                 │              │
   │                 │                  │                 │              │
   │                 │──Check Complete──>│               │              │
   │                 │<──Status──────────│                 │              │
   │                 │                  │                 │              │
   │<──Success───────│                  │                 │              │
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis

