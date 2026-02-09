# CSE471 - Loan Request Flow
## Sequential Diagram: Loan Request and Approval

**Course:** CSE471 - System Analysis  
**Flow:** Loan Request and Approval System  
**Date:** 2024

---

## Loan Request Flow (Top-Down Expanding Tree)

```
LOAN REQUEST FLOW (Top-Down Expanding Tree)
│
├── LEVEL 1: BORROWER INITIATES REQUEST
│   │
│   ├── 1. Navigate to Loan Request Page
│   │   │
│   │   └── LEVEL 2: PAGE LOADING
│   │       │
│   │       ├── 1.1 Check Wallet Connection
│   │       │   ├── Verify MetaMask/WalletConnect connected
│   │       │   ├── Get wallet address
│   │       │   └── If not connected: Show connect prompt
│   │       │
│   │       ├── 1.2 Load Borrower Profile
│   │       │   │
│   │       │   └── LEVEL 3: PROFILE RETRIEVAL
│   │       │       │
│   │       │       ├── 1.2.1 Query Database
│   │       │       │   ├── SELECT * FROM BORROWER WHERE wallet_address = ?
│   │       │       │   └── Get borrower_id, is_first_time, borrowing limits
│   │       │       │
│   │       │       └── 1.2.2 Check First-Time Status
│   │       │           ├── If is_first_time = TRUE: Show income proof upload
│   │       │           └── If is_first_time = FALSE: Skip income proof
│   │       │
│   │       └── 1.3 Load Available Banks
│   │           │
│   │           └── LEVEL 3: BANK LIST RETRIEVAL
│   │               │
│   │               ├── 1.3.1 Query Local Banks
│   │               │   ├── SELECT * FROM LOCAL_BANK WHERE country = ?
│   │               │   └── Filter by borrower's country
│   │               │
│   │               └── 1.3.2 Check Existing Requests
│   │                   ├── SELECT loan_id FROM LOAN_REQUEST
│   │                   ├── WHERE borrower_id = ? AND status = 'pending'
│   │                   └── Hide banks with pending requests
│   │
│   ├── 2. Select Bank
│   │   │
│   │   └── LEVEL 2: BANK SELECTION
│   │       │
│   │       ├── 2.1 Display Bank List
│   │       │   ├── Show bank name, city, address
│   │       │   ├── Show available loan capacity
│   │       │   └── Disable banks with pending requests
│   │       │
│   │       └── 2.2 User Selects Bank
│   │           ├── Store selected local_bank_id
│   │           └── Enable loan request form
│   │
│   ├── 3. Check Borrowing Limits
│   │   │
│   │   └── LEVEL 2: LIMIT VALIDATION
│   │       │
│   │       ├── 3.1 Calculate Current Borrowing
│   │       │   │
│   │       │   └── LEVEL 3: BORROWING CALCULATION
│   │       │       │
│   │       │       ├── 3.1.1 Query 6-Month Transactions
│   │       │       │   ├── SELECT SUM(amount) FROM TRANSACTION
│   │       │       │   ├── WHERE borrower_id = ?
│   │       │       │   ├── AND transaction_type = 'loan_approved'
│   │       │       │   └── AND transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
│   │       │       │
│   │       │       ├── 3.1.2 Query 1-Year Transactions
│   │       │       │   ├── SELECT SUM(amount) FROM TRANSACTION
│   │       │       │   ├── WHERE borrower_id = ?
│   │       │       │   ├── AND transaction_type = 'loan_approved'
│   │       │       │   └── AND transaction_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
│   │       │       │
│   │       │       ├── 3.1.3 Check Active Loans
│   │       │       │   ├── SELECT COUNT(*) FROM LOAN_REQUEST
│   │       │       │   ├── WHERE borrower_id = ? AND status IN ('approved', 'active')
│   │       │       │   └── Check consecutive_paid_loans for exception
│   │       │       │
│   │       │       └── 3.1.4 Calculate Remaining Limit
│   │       │           ├── six_month_remaining = limit - borrowed
│   │       │           ├── one_year_remaining = limit - borrowed
│   │       │           └── Apply exception if 3+ consecutive paid loans
│   │       │
│   │       └── 3.2 Validate Request Amount
│   │           ├── Check if amount <= six_month_remaining
│   │           ├── Check if amount <= one_year_remaining
│   │           ├── Check active loan count (max 1, or 2 if exception)
│   │           └── Display limit information to user
│   │
│   ├── 4. Upload Income Proof (First-Time Only)
│   │   │
│   │   └── LEVEL 2: INCOME VERIFICATION
│   │       │
│   │       ├── 4.1 Display Upload Interface
│   │       │   ├── File input component
│   │       │   ├── Accepted formats: PDF, JPG, PNG
│   │       │   └── Max file size: 10MB
│   │       │
│   │       ├── 4.2 User Uploads File
│   │       │   │
│   │       │   └── LEVEL 3: FILE PROCESSING
│   │       │       │
│   │       │       ├── 4.2.1 Validate File
│   │       │       │   ├── Check file type
│   │       │       │   ├── Check file size
│   │       │       │   └── Check file is not corrupted
│   │       │       │
│   │       │       ├── 4.2.2 Generate File Hash
│   │       │       │   ├── Calculate SHA-256 hash
│   │       │       │   └── Store hash for verification
│   │       │       │
│   │       │       ├── 4.2.3 Upload to Storage
│   │       │       │   ├── Upload to IPFS or encrypted storage
│   │       │       │   ├── Get file path/URL
│   │       │       │   └── Store in INCOME_PROOF table
│   │       │       │
│   │       │       └── 4.2.4 Create Database Record
│   │       │           ├── INSERT INTO INCOME_PROOF
│   │       │           ├── status = 'pending'
│   │       │           └── Link to borrower_id
│   │       │
│   │       └── 4.3 Display Upload Status
│   │           ├── Show "Pending Review" status
│   │           └── Allow form submission (will wait for approval)
│   │
│   ├── 5. Fill Loan Request Form
│   │   │
│   │   └── LEVEL 2: FORM INPUT
│   │       │
│   │       ├── 5.1 Enter Loan Amount
│   │       │   ├── Input field with validation
│   │       │   ├── Min: 0.01 ETH
│   │       │   ├── Max: Based on borrowing limit
│   │       │   └── Real-time limit checking
│   │       │
│   │       ├── 5.2 Enter Purpose
│   │       │   ├── Text area input
│   │       │   ├── Min length: 10 characters
│   │       │   ├── Max length: 500 characters
│   │       │   └── Required field
│   │       │
│   │       ├── 5.3 Select Cryptocurrency Type
│   │       │   ├── Dropdown: ETH, BTC, MATIC, etc.
│   │       │   └── Default: ETH
│   │       │
│   │       └── 5.4 Display Gas Cost Estimate
│   │           ├── Estimate gas cost for transaction
│   │           ├── Show estimated cost in ETH
│   │           └── Display: "Gas cost will be deducted from loan amount"
│   │
│   └── 6. Submit Loan Request
│       │
│       └── LEVEL 2: REQUEST SUBMISSION
│           │
│           ├── 6.1 Validate Form Data
│           │   │
│           │   └── LEVEL 3: VALIDATION CHECKS
│           │       │
│           │       ├── 6.1.1 Check Amount
│           │       │   ├── Amount > 0
│           │       │   ├── Amount <= borrowing limit
│           │       │   └── Amount <= bank capacity
│           │       │
│           │       ├── 6.1.2 Check Purpose
│           │       │   ├── Purpose not empty
│           │       │   └── Purpose length valid
│           │       │
│           │       ├── 6.1.3 Check Bank Selection
│           │       │   ├── Bank selected
│           │       │   └── No pending request to this bank
│           │       │
│           │       └── 6.1.4 Check Income Proof (First-Time)
│           │           ├── If first-time: Income proof uploaded
│           │           └── If not first-time: Skip check
│           │
│           ├── 6.2 Estimate Gas Cost
│           │   │
│           │   └── LEVEL 3: GAS ESTIMATION
│           │       │
│           │       ├── 6.2.1 Call Smart Contract Estimate
│           │       │   ├── contract.estimateGas.requestLoan()
│           │       │   └── Get gas estimate
│           │       │
│           │       ├── 6.2.2 Apply Standard Gas Limit
│           │       │   ├── Check against standard limits
│           │       │   ├── If exceeds: Show warning
│       │       │       └── If within limit: Proceed
│       │       │
│       │       └── 6.2.3 Calculate Final Loan Amount
│       │           ├── final_amount = requested_amount - gas_cost
│       │           └── Display to user for confirmation
│       │
│       ├── 6.3 Show Confirmation Dialog
│       │   ├── Display loan details
│       │   ├── Display gas cost
│       │   ├── Display final amount
│       │   └── Confirm/Cancel buttons
│       │
│       ├── 6.4 User Confirms
│       │   │
│       │   └── LEVEL 3: BLOCKCHAIN TRANSACTION
│       │       │
│       │       ├── 6.4.1 Prepare Transaction
│       │       │   ├── Contract: LocalBankContract
│       │       │   ├── Function: requestLoan(amount, purpose)
│       │       │   └── Gas limit: Standard limit
│       │       │
│       │       ├── 6.4.2 Sign Transaction
│       │       │   ├── Wallet prompts user
│       │       │   ├── User approves transaction
│       │       │   └── Transaction signed
│       │       │
│       │       ├── 6.4.3 Broadcast Transaction
│       │       │   ├── Send to blockchain network
│       │       │   ├── Get transaction hash
│       │       │   └── Wait for confirmation
│       │       │
│       │       ├── 6.4.4 Wait for Confirmation
│       │       │   ├── Poll transaction status
│       │       │   ├── Wait for block confirmation
│       │       │   └── Get block number
│       │       │
│       │       └── 6.4.5 Handle Transaction Result
│       │           ├── If success: Continue to database
│       │           ├── If failure: Show error, stop flow
│       │           └── Extract transaction hash
│       │
│       ├── 6.5 Create Database Record
│       │   │
│       │   └── LEVEL 3: DATABASE OPERATIONS
│       │       │
│       │       ├── 6.5.1 Insert Loan Request
│       │       │   ├── INSERT INTO LOAN_REQUEST
│       │       │   ├── borrower_id, local_bank_id, amount, purpose
│       │       │   ├── status = 'pending'
│       │       │   ├── blockchain_tx_hash = transaction_hash
│       │       │   └── gas_cost = estimated_gas_cost
│       │       │
│       │       ├── 6.5.2 Check Installment Flag
│       │       │   ├── If amount >= 100 ETH: is_installment = TRUE
│       │       │   └── If amount < 100 ETH: is_installment = FALSE
│       │       │
│       │       └── 6.5.3 Update Borrower Status
│       │           ├── Mark as not first-time if applicable
│       │           └── Update request count
│       │
│       └── 6.6 Display Success Message
│           ├── Show "Loan request submitted successfully"
│           ├── Display transaction hash (clickable to block explorer)
│           ├── Show "Pending approval" status
│           └── Redirect to loan request list
│
├── LEVEL 1: BANK USER REVIEWS REQUEST
│   │
│   ├── 7. Bank User Views Pending Requests
│   │   │
│   │   └── LEVEL 2: REQUEST LIST DISPLAY
│   │       │
│   │       ├── 7.1 Query Pending Requests
│   │       │   │
│   │       │   └── LEVEL 3: DATABASE QUERY
│   │       │       │
│   │       │       ├── 7.1.1 Get Bank User's Bank
│   │       │       │   ├── SELECT local_bank_id FROM BANK_USER
│   │       │       │   └── WHERE bank_user_id = ?
│   │       │       │
│   │       │       ├── 7.1.2 Get Pending Requests
│   │       │       │   ├── SELECT * FROM LOAN_REQUEST
│   │       │       │   ├── WHERE local_bank_id = ?
│       │       │       │   ├── AND status = 'pending'
│   │       │       │   └── ORDER BY requested_at ASC
│   │       │       │
│   │       │       └── 7.1.3 Join Borrower Information
│   │       │           ├── JOIN BORROWER ON borrower_id
│   │       │           ├── Get borrower name, wallet, history
│   │       │           └── Get income proof status
│   │       │
│   │       └── 7.2 Display Request List
│   │           ├── Show borrower name and wallet
│   │           ├── Show loan amount and purpose
│   │           ├── Show requested date
│   │           ├── Show income proof status (if first-time)
│   │           └── Show Approve/Reject buttons
│   │
│   ├── 8. Bank User Reviews Request Details
│   │   │
│   │   └── LEVEL 2: DETAILED REVIEW
│   │       │
│   │       ├── 8.1 View Full Request Details
│   │       │   ├── Loan amount (original and after gas)
│   │       │   ├── Purpose description
│   │       │   ├── Borrower transaction history
│   │       │   ├── Consecutive paid loans count
│   │       │   └── Current borrowing status
│   │       │
│   │       ├── 8.2 Review Income Proof (If First-Time)
│   │       │   │
│   │       │   └── LEVEL 3: INCOME PROOF REVIEW
│   │       │       │
│   │       │       ├── 8.2.1 Download Income Proof File
│   │       │       │   ├── Get file path from INCOME_PROOF table
│   │       │       │   ├── Verify file hash
│   │       │       │   └── Download and display file
│   │       │       │
│   │       │       ├── 8.2.2 Review Document
│   │       │       │   ├── Bank user reviews document
│   │       │       │   ├── Verify authenticity
│   │       │       │   └── Make decision
│   │       │       │
│   │       │       └── 8.2.3 Approve/Reject Income Proof
│   │       │           ├── If approve: Update INCOME_PROOF status
│   │       │           ├── If reject: Update status and add notes
│   │       │           └── Notify borrower
│   │       │
│   │       └── 8.3 Check AI/ML Security Analysis (Future)
│   │           ├── Query AI_ML_SECURITY_LOG
│   │           ├── Get risk score
│   │           └── Display fraud/anomaly warnings
│   │
│   ├── 9. Bank User Approves Loan
│   │   │
│   │   └── LEVEL 2: APPROVAL PROCESS
│   │       │
│   │       ├── 9.1 Validate Approval Authority
│   │       │   │
│   │       │   └── LEVEL 3: AUTHORITY CHECK
│   │       │       │
│   │       │       ├── 9.1.1 Check Bank User Role
│   │       │       │   ├── SELECT role FROM BANK_USER
│   │       │       │   └── WHERE bank_user_id = ?
│   │       │       │
│   │       │       └── 9.1.2 Verify Approver Status
│   │       │           ├── If role != 'approver': Show error
│   │       │           └── If role = 'approver': Continue
│   │       │
│   │       ├── 9.2 Check Bank Capacity
│   │       │   ├── Check if bank has sufficient funds
│   │       │   ├── Query LOCAL_BANK.total_lent
│       │       │   └── Verify amount <= available capacity
│   │       │
│       │       ├── 9.3 Calculate Installment Schedule (If >= 100 ETH)
│       │       │   │
│       │       │   └── LEVEL 3: INSTALLMENT CALCULATION
│       │       │       │
│       │       │       ├── 9.3.1 Determine Installment Count
│       │       │       │   ├── Default: 12 installments
│       │       │       │   ├── Or based on loan amount
│       │       │       │   └── Calculate per installment amount
│       │       │       │
│       │       │       ├── 9.3.2 Calculate Due Dates
│       │       │       │   ├── First installment: 30 days from approval
│       │       │       │   ├── Subsequent: Every 30 days
│       │       │       │   └── Final installment: Total loan duration
│       │       │       │
│       │       │       └── 9.3.3 Create Installment Records
│       │       │           ├── INSERT INTO INSTALLMENT for each
│       │       │           ├── status = 'pending'
│       │       │           └── Link to loan_id
│       │       │
│       │       ├── 9.4 Set Loan Deadline
│       │       │   ├── If installment: Deadline = last installment due date
│       │       │   ├── If single payment: Deadline = 1 year from approval
│       │       │   └── UPDATE LOAN_REQUEST.deadline
│       │       │
│       │       ├── 9.5 Execute Smart Contract Approval
│       │       │   │
│       │       │   └── LEVEL 3: BLOCKCHAIN TRANSACTION
│       │       │       │
│       │       │       ├── 9.5.1 Prepare Approval Transaction
│       │       │       │   ├── Contract: LocalBankContract
│       │       │       │   ├── Function: approveLoan(loanId)
│       │       │       │   └── Signer: Bank User wallet
│       │       │       │
│       │       │       ├── 9.5.2 Sign and Broadcast
│       │       │       │   ├── Wallet prompts bank user
│       │       │       │   ├── User approves
│       │       │       │   └── Transaction sent
│       │       │       │
│       │       │       ├── 9.5.3 Wait for Confirmation
│       │       │       │   ├── Poll transaction status
│       │       │       │   └── Get confirmation
│       │       │       │
│       │       │       └── 9.5.4 Transfer Funds
│       │       │           ├── Smart contract transfers amount to borrower
│       │       │           ├── Update bank reserve
│       │       │           └── Emit LoanApproved event
│       │       │
│       │       ├── 9.6 Update Database
│       │       │   │
│       │       │   └── LEVEL 3: DATABASE UPDATES
│       │       │       │
│       │       │       ├── 9.6.1 Update Loan Status
│       │       │       │   ├── UPDATE LOAN_REQUEST
│       │       │       │   ├── status = 'approved'
│       │       │       │   ├── approved_by = bank_user_id
│       │       │       │   ├── approved_at = NOW()
│       │       │       │   └── deadline = calculated_deadline
│       │       │       │
│       │       │       ├── 9.6.2 Create Transaction Record
│       │       │       │   ├── INSERT INTO TRANSACTION
│       │       │       │   ├── transaction_type = 'loan_approved'
│       │       │       │   ├── amount = loan_amount
│       │       │       │   └── blockchain_tx_hash
│       │       │       │
│       │       │       ├── 9.6.3 Update Bank Statistics
│       │       │       │   ├── UPDATE LOCAL_BANK
│       │       │       │   ├── total_lent += loan_amount
│       │       │       │   └── Update timestamp
│       │       │       │
│       │       │       └── 9.6.4 Update Borrower Statistics
│       │       │           ├── UPDATE BORROWER
│       │       │           ├── total_borrowed_lifetime += amount
│       │       │           └── Update borrowing limits
│       │       │
│       │       └── 9.7 Notify Borrower
│       │           ├── Send notification: "Loan approved"
│       │           ├── Show in borrower dashboard
│       │           └── Email/SMS notification (optional)
│   │
│   └── 10. Bank User Rejects Loan
│       │
│       └── LEVEL 2: REJECTION PROCESS
│           │
│           ├── 10.1 Enter Rejection Reason
│           │   ├── Text input for reason
│           │   ├── Required field
│           │   └── Max 500 characters
│           │
│           ├── 10.2 Update Database
│           │   │
│           │   └── LEVEL 3: DATABASE UPDATE
│           │       │
│           │       ├── 10.2.1 Update Loan Status
│           │       │   ├── UPDATE LOAN_REQUEST
│           │       │   ├── status = 'rejected'
│           │       │   ├── rejected_by = bank_user_id
│           │       │   ├── rejected_at = NOW()
│           │       │   └── rejection_reason = entered_reason
│           │       │
│           │       └── 10.2.2 Log Rejection (For ML Training)
│           │           ├── INSERT INTO AI_ML_SECURITY_LOG (optional)
│           │           └── Store rejection reason for pattern analysis
│           │
│           └── 10.3 Notify Borrower
│               ├── Send notification: "Loan rejected"
│               ├── Show rejection reason
│               └── Allow borrower to view in profile
│
└── LEVEL 1: POST-APPROVAL ACTIONS
    │
    ├── 11. Loan Request No Longer Visible
    │   │
    │   └── LEVEL 2: VISIBILITY UPDATE
    │       │
    │       ├── 11.1 Remove from Pending List
    │       │   ├── Query excludes approved/rejected loans
    │       │   └── Only show status = 'pending'
    │       │
    │       └── 11.2 Add to Borrower's Request History
    │           ├── Show in borrower profile
    │           ├── Display status (approved/rejected)
    │           └── Allow chat with bank
```

---

## Sequence Diagram

```
BORROWER          FRONTEND          DATABASE         BLOCKCHAIN      BANK_USER
   │                 │                  │                 │              │
   │──Navigate──────>│                  │                 │              │
   │                 │──Get Profile────>│                 │              │
   │                 │<──Profile────────│                 │              │
   │                 │                  │                 │              │
   │──Select Bank───>│                  │                 │              │
   │                 │──Check Limits───>│                 │              │
   │                 │<──Limits─────────│                 │              │
   │                 │                  │                 │              │
   │──Upload Proof──>│                  │                 │              │
   │                 │──Save Proof─────>│                 │              │
   │                 │<──Saved──────────│                 │              │
   │                 │                  │                 │              │
   │──Submit───────>│                  │                 │              │
   │                 │──Estimate Gas──────────────────>│              │
   │                 │<──Gas Estimate───────────────────│              │
   │                 │                  │                 │              │
   │<──Confirm───────│                  │                 │              │
   │                 │                  │                 │              │
   │──Confirm───────>│                  │                 │              │
   │                 │──Request Loan──────────────────>│              │
   │                 │<──Tx Hash─────────────────────────│              │
   │                 │                  │                 │              │
   │                 │──Save Request───>│                 │              │
   │                 │<──Saved──────────│                 │              │
   │                 │                  │                 │              │
   │<──Success───────│                  │                 │              │
   │                 │                  │                 │              │
   │                 │                  │                 │              │
   │                 │                  │                 │              │
   │                 │                  │                 │              │
   │                 │<──View Requests───────────────────────────────>│
   │                 │                  │                 │              │
   │                 │──Get Requests───>│                 │              │
   │                 │<──Requests───────│                 │              │
   │                 │                  │                 │              │
   │                 │<──Approve────────────────────────────────────>│
   │                 │                  │                 │              │
   │                 │──Approve Loan──────────────────>│              │
   │                 │<──Approved───────────────────────│              │
   │                 │                  │                 │              │
   │                 │──Update DB──────>│                 │              │
   │                 │<──Updated────────│                 │              │
   │                 │                  │                 │              │
   │<──Notification──│                  │                 │              │
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis

