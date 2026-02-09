# CSE471 - Borrowing Limit Flow
## Sequential Diagram: Borrowing Limit Calculation

**Course:** CSE471 - System Analysis  
**Flow:** Borrowing Limit Calculation System  
**Date:** 2024

---

## Borrowing Limit Flow (Top-Down Expanding Tree)

```
BORROWING LIMIT FLOW (Top-Down Expanding Tree)
│
├── LEVEL 1: CALCULATE BORROWING LIMITS
│   │
│   ├── 1. Trigger Limit Calculation
│   │   │
│   │   └── LEVEL 2: CALCULATION TRIGGER
│   │       │
│   │       ├── 1.1 User Requests Loan
│   │       │   ├── Borrower initiates loan request
│   │       │   ├── System needs to check limits
│       │       │   └── Trigger calculation
│       │       │
│       │       ├── 1.2 Loan Approved
│       │       │   ├── New loan approved
│       │       │   ├── Limits need to be updated
│       │       │   └── Trigger recalculation
│       │       │
│       │       ├── 1.3 Installment Paid
│       │       │   ├── Borrower pays installment
│       │       │   ├── Limits may change
│       │       │   └── Trigger recalculation
│       │       │
│       │       └── 1.4 Scheduled Recalculation
│       │           ├── Daily cron job
│       │           ├── Recalculate all borrower limits
│       │           └── Update database
│   │
│   ├── 2. Calculate 6-Month Limit
│   │   │
│   │   └── LEVEL 2: 6-MONTH CALCULATION
│   │       │
│       ├── 2.1 Query 6-Month Transactions
│       │   │
│       │   └── LEVEL 3: TRANSACTION QUERY
│       │       │
│       │       ├── 2.1.1 Get Approved Loans in Last 6 Months
│       │       │   │
│       │       │   └── LEVEL 4: DATABASE QUERY
│       │       │       │
│       │       │       ├── 2.1.1.1 Query Transactions
│       │       │       │   ├── SELECT SUM(amount) FROM TRANSACTION
│       │       │       │   ├── WHERE borrower_id = ?
│       │       │       │   ├── AND transaction_type = 'loan_approved'
│       │       │       │   ├── AND transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
│       │       │       │   └── Get total borrowed amount
│       │       │       │
│       │       │       └── 2.1.1.2 Handle NULL Result
│       │       │           ├── If no transactions: total = 0
│       │       │           └── Use COALESCE to handle NULL
│       │       │
│       │       ├── 2.1.2 Calculate Base Limit
│       │       │   │
│       │       │   └── LEVEL 4: LIMIT CALCULATION
│       │       │       │
│       │       │       ├── 2.1.2.1 Get Borrower History
│       │       │       │   ├── SELECT consecutive_paid_loans FROM BORROWER
│       │       │       │   ├── WHERE borrower_id = ?
│       │       │       │   └── Get payment history
│       │       │       │
│       │       │       ├── 2.1.2.2 Determine Limit Formula
│       │       │       │   ├── Base limit: 5 ETH (default)
│       │       │       │   ├── Or based on borrower's lifetime borrowing
│       │       │       │   └── Apply multiplier if good history
│       │       │       │
│       │       │       └── 2.1.2.3 Calculate Limit
│       │       │           ├── If consecutive_paid_loans >= 3: limit *= 1.5
│       │       │           ├── If total_borrowed_lifetime > 10 ETH: limit *= 1.2
│       │       │           └── Apply maximum cap (e.g., 50 ETH)
│       │       │
│       │       └── 2.1.3 Calculate Remaining Limit
│       │           ├── remaining = limit - borrowed
│       │           ├── If remaining < 0: remaining = 0
│       │           └── Return remaining limit
│   │
│   ├── 3. Calculate 1-Year Limit
│   │   │
│   │   └── LEVEL 2: 1-YEAR CALCULATION
│   │       │
│       ├── 3.1 Query 1-Year Transactions
│       │   │
│       │   └── LEVEL 3: TRANSACTION QUERY
│       │       │
│       │       ├── 3.1.1 Get Approved Loans in Last 1 Year
│       │       │   ├── SELECT SUM(amount) FROM TRANSACTION
│       │       │   ├── WHERE borrower_id = ?
│       │       │   ├── AND transaction_type = 'loan_approved'
│       │       │   └── AND transaction_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
│       │       │
│       │       └── 3.1.2 Calculate 1-Year Limit
│       │           ├── Base limit: 10 ETH (default)
│       │           ├── Apply same multipliers as 6-month
│       │           └── Calculate remaining
│   │
│   ├── 4. Check Active Loan Count
│   │   │
│   │   └── LEVEL 2: ACTIVE LOAN CHECK
│   │       │
│       ├── 4.1 Query Active Loans
│       │   │
│       │   └── LEVEL 3: LOAN QUERY
│       │       │
│       │       ├── 4.1.1 Count Active Loans
│       │       │   ├── SELECT COUNT(*) FROM LOAN_REQUEST
│       │       │   ├── WHERE borrower_id = ?
│       │       │   ├── AND status IN ('approved', 'active')
│       │       │   └── Get active loan count
│       │       │
│       │       └── 4.1.2 Check Exception Rule
│       │           │
│       │           └── LEVEL 4: EXCEPTION CHECK
│       │               │
│       │               ├── 4.1.2.1 Check Consecutive Paid Loans
│       │       │           ├── SELECT consecutive_paid_loans FROM BORROWER
│       │       │           ├── WHERE borrower_id = ?
│       │       │           └── Get count
│       │       │
│       │               ├── 4.1.2.2 Apply Exception
│       │       │           ├── If consecutive_paid_loans >= 3:
│       │       │           │   ├── Max active loans = 2
│       │       │           │   └── can_multiple_loans = TRUE
│       │       │           └── Else:
│       │       │               ├── Max active loans = 1
│       │       │               └── can_multiple_loans = FALSE
│       │       │
│       │               └── 4.1.2.3 Validate Current Count
│       │       │           ├── If active_count >= max_allowed: Reject new request
│       │       │           └── If active_count < max_allowed: Allow new request
│   │
│   ├── 5. Apply Borrowing Restrictions
│   │   │
│   │   └── LEVEL 2: RESTRICTION APPLICATION
│   │       │
│       ├── 5.1 Check Year Restriction Rule
│       │   │
│       │   └── LEVEL 3: YEAR RESTRICTION
│       │       │
│       │       ├── 5.1.1 Query Last Year's Borrowing
│       │       │   ├── SELECT SUM(amount) FROM TRANSACTION
│       │       │   ├── WHERE borrower_id = ?
│       │       │   ├── AND transaction_type = 'loan_approved'
│       │       │   └── AND transaction_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
│       │       │
│       │       ├── 5.1.2 Apply Restriction
│       │       │   ├── If borrowed X in last year:
│       │       │   ├── Cannot borrow X/2 until all installments paid
│       │       │   └── Check if all loans are completed
│       │       │
│       │       └── 5.1.3 Check Completion Status
│       │           ├── SELECT COUNT(*) FROM LOAN_REQUEST
│       │           ├── WHERE borrower_id = ?
│       │           ├── AND status != 'completed'
│       │           └── If count > 0: Restriction applies
│   │
│   └── 6. Update Borrowing Limit Record
│       │
│       └── LEVEL 2: DATABASE UPDATE
│           │
│           ├── 6.1 Calculate All Values
│           │   ├── six_month_limit
│           │   ├── six_month_borrowed
│           │   ├── six_month_remaining
│           │   ├── one_year_limit
│           │   ├── one_year_borrowed
│           │   └── one_year_remaining
│           │
│           ├── 6.2 Update or Insert Record
│           │   │
│           │   └── LEVEL 3: DATABASE OPERATION
│           │       │
│           │       ├── 6.2.1 Check if Record Exists
│           │       │   ├── SELECT * FROM BORROWING_LIMIT
│           │       │   ├── WHERE borrower_id = ?
│           │       │   └── Check if record exists
│           │       │
│           │       ├── 6.2.2 Update Existing Record
│           │       │   ├── UPDATE BORROWING_LIMIT
│           │       │   ├── SET all calculated values
│           │       │   ├── SET last_calculated_at = NOW()
│           │       │   └── WHERE borrower_id = ?
│           │       │
│           │       └── 6.2.3 Insert New Record
│           │           ├── INSERT INTO BORROWING_LIMIT
│           │           ├── All calculated values
│           │           └── last_calculated_at = NOW()
│           │
│           └── 6.3 Return Limit Information
│               ├── Return limit object
│               ├── Include all calculated values
│               └── Include restriction flags
│
├── LEVEL 1: VALIDATE LOAN REQUEST AGAINST LIMITS
│   │
│   ├── 7. Check Loan Request Eligibility
│   │   │
│   │   └── LEVEL 2: ELIGIBILITY CHECK
│   │       │
│       ├── 7.1 Get Current Limits
│       │   ├── Query BORROWING_LIMIT table
│       │   ├── Get six_month_remaining
│       │   ├── Get one_year_remaining
│       │   └── Get active loan count
│       │
│       ├── 7.2 Validate Request Amount
│       │   │
│       │   └── LEVEL 3: AMOUNT VALIDATION
│       │       │
│       │       ├── 7.2.1 Check 6-Month Limit
│       │       │   ├── If request_amount > six_month_remaining:
│       │       │   │   └── Reject: "Exceeds 6-month limit"
│       │       │   └── If request_amount <= six_month_remaining:
│       │       │       └── Continue validation
│       │       │
│       │       ├── 7.2.2 Check 1-Year Limit
│       │       │   ├── If request_amount > one_year_remaining:
│       │       │   │   └── Reject: "Exceeds 1-year limit"
│       │       │   └── If request_amount <= one_year_remaining:
│       │       │       └── Continue validation
│       │       │
│       │       └── 7.2.3 Check Active Loan Count
│       │           ├── If active_count >= max_allowed:
│       │           │   └── Reject: "Maximum active loans reached"
│       │           └── If active_count < max_allowed:
│       │               └── Continue validation
│       │
│       └── 7.3 Check Year Restriction
│           │
│           └── LEVEL 3: RESTRICTION CHECK
│               │
│               ├── 7.3.1 Check if Restriction Applies
│               │   ├── If borrowed X in last year AND loans not completed:
│               │   │   └── Check if request_amount <= X/2
│               │   └── If restriction applies:
│               │       └── Reject: "Must complete existing loans first"
│               │
│               └── 7.3.2 Allow Request
│                   ├── If all checks pass:
│                   └── Allow loan request to proceed
│
└── LEVEL 1: DISPLAY LIMITS TO USER
    │
    ├── 8. Show Limits in Dashboard
    │   │
    │   └── LEVEL 2: UI DISPLAY
    │       │
    │       ├── 8.1 Load Limit Information
    │       │   ├── Query BORROWING_LIMIT table
    │       │   ├── Get all limit values
    │       │   └── Format for display
    │       │
    │       └── 8.2 Display Limit Cards
    │           ├── 6-Month Limit Card
    │           │   ├── Total limit
    │           │   ├── Already borrowed
    │           │   ├── Remaining limit
    │           │   └── Progress bar
    │           │
    │           ├── 1-Year Limit Card
    │           │   ├── Total limit
    │           │   ├── Already borrowed
    │           │   ├── Remaining limit
    │           │   └── Progress bar
    │           │
    │           └── Active Loans Card
    │               ├── Current active loans count
    │               ├── Maximum allowed
    │               └── Exception status (if applicable)
    │
    └── 9. Show Limits in Loan Request Form
        │
        └── LEVEL 2: FORM DISPLAY
            │
            ├── 9.1 Display Limit Information
            │   ├── Show remaining limits
            │   ├── Show active loan count
            │   └── Show restriction warnings
            │
            └── 9.2 Validate in Real-Time
                ├── As user enters amount
                ├── Check against limits
                ├── Show error if exceeds limit
                └── Update remaining limit display
```

---

## Sequence Diagram

```
BORROWER          FRONTEND          DATABASE         CALCULATION SERVICE
   │                 │                  │                 │
   │──Request Loan──>│                  │                 │
   │                 │                  │                 │
   │                 │──Get Limits─────>│                 │
   │                 │<──Limits──────────│                 │
   │                 │                  │                 │
   │                 │──Calculate───────┼────────────────>│
   │                 │                  │                 │
   │                 │                  │                 │──Query Transactions>│
   │                 │                  │                 │<──Transactions──────│
   │                 │                  │                 │
   │                 │                  │                 │──Calculate Limits──>│
   │                 │                  │                 │<──Calculated────────│
   │                 │                  │                 │
   │                 │                  │<──Update Limits──│                 │
   │                 │                  │                 │
   │                 │<──Updated────────│                 │
   │                 │                  │                 │
   │                 │──Validate Amount>│                 │
   │                 │<──Valid───────────│                 │
   │                 │                  │                 │
   │<──Limits───────│                  │                 │
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis

