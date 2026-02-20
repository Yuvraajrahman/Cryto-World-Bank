# CSE471 - Profile Management Flow
## Sequential Diagram: Profile Management System

**Course:** CSE471 - System Analysis  
**Flow:** Profile Management for All User Types  
**Date:** 2024

---

## Profile Management Flow (Top-Down Expanding Tree)

```
PROFILE MANAGEMENT FLOW (Top-Down Expanding Tree)
│
├── LEVEL 1: ACCESS PROFILE
│   │
│   ├── 1. User Navigates to Profile
│   │   │
│   │   └── LEVEL 2: PROFILE PAGE LOADING
│   │       │
│   │       ├── 1.1 Identify User Type
│   │       │   │
│   │       │   └── LEVEL 3: USER TYPE DETECTION
│   │       │       │
│   │       │       ├── 1.1.1 Check Wallet Connection
│   │       │       │   ├── Get wallet address
│   │       │       │   └── Verify connection
│   │       │       │
│   │       │       ├── 1.1.2 Query User Type
│       │       │       ├── Check BORROWER table
│       │       │       ├── Check BANK_USER table
│       │       │       ├── Check LOCAL_BANK table
│       │       │       ├── Check NATIONAL_BANK table
│       │       │       └── Determine user type
│       │       │       │
│       │       │       └── 1.1.3 Load Role-Specific Profile
│       │       │           ├── Borrower: Load borrower profile
│       │       │           ├── Bank User: Load bank user profile
│       │       │           ├── Local Bank: Load bank profile
│       │       │           └── National Bank: Load bank profile
│       │       │
│       │       └── 1.2 Load Profile Data
│       │           │
│       │           └── LEVEL 3: DATA RETRIEVAL
│       │               │
│       │               ├── 1.2.1 Query Profile Information
│       │               │   ├── SELECT * FROM respective table
│       │               │   ├── WHERE wallet_address = ?
│       │               │   └── Get all profile fields
│       │               │
│       │               ├── 1.2.2 Query Profile Settings
│       │               │   ├── SELECT * FROM PROFILE_SETTINGS
│       │               │   ├── WHERE user_type = ? AND user_id = ?
│       │               │   └── Get preferences, terms acceptance
│       │               │
│       │               └── 1.2.3 Load Related Data
│       │                   ├── Loan history (if borrower)
│       │                   ├── Approval history (if bank user)
│       │                   └── Bank statistics (if bank)
│   │
│   ├── 2. Display Profile Information
│   │   │
│   │   └── LEVEL 2: PROFILE DISPLAY
│   │       │
│       ├── 2.1 Display Basic Information
│       │   ├── Name
│       │   ├── Wallet address (with copy button)
│       │   ├── Email (if available)
│       │   ├── Phone (if available)
│       │   └── Registration date
│       │
│       ├── 2.2 Display Role-Specific Information
│       │   │
│       │   └── LEVEL 3: ROLE-SPECIFIC DISPLAY
│       │       │
│       │       ├── 2.2.1 Borrower Profile
│       │       │   ├── Total borrowed (lifetime)
│       │       │   ├── Consecutive paid loans count
│       │       │   ├── Current borrowing limits
│       │       │   ├── Active loans count
│       │       │   └── Transaction history link
│       │       │
│       │       ├── 2.2.2 Bank User Profile
│       │       │   ├── Bank name and type
│       │       │   ├── Role (approver/viewer)
│       │       │   ├── Loans approved count
│       │       │   ├── Loans rejected count
│       │       │   └── Approval history link
│       │       │
│       │       ├── 2.2.3 Local Bank Profile
│       │       │   ├── Bank name and location
│       │       │   ├── Total borrowed from National Bank
│       │       │   ├── Total lent to borrowers
│       │       │   ├── Available capacity
│       │       │   └── Loan statistics
│       │       │
│       │       └── 2.2.4 National Bank Profile
│       │           ├── Bank name and country
│       │           ├── Total borrowed from World Bank
│       │           ├── Total lent to Local Banks
│       │           └── Bank statistics
│       │
│       └── 2.3 Display Profile Actions
│           ├── Edit profile button
│           ├── View terms and conditions
│           ├── Change preferences
│           └── Logout option
│
├── LEVEL 1: VIEW TERMS AND CONDITIONS
│   │
│   ├── 3. Access Terms Page
│   │   │
│   │   └── LEVEL 2: TERMS DISPLAY
│   │       │
│       ├── 3.1 Load Terms Content
│       │   │
│       │   └── LEVEL 3: TERMS RETRIEVAL
│       │       │
│       │       ├── 3.1.1 Get Current Terms Version
│       │       │   ├── Query terms version from database
│       │       │   ├── Or load from static file
│       │       │   └── Get version number
│       │       │
│       │       └── 3.1.2 Display Terms Content
│       │           ├── Show full terms text
│       │           ├── Format with sections
│       │           ├── Include all functionality descriptions
│       │           └── Include limitations
│       │
│       ├── 3.2 Display Terms Sections
│       │   ├── Section 1: Platform Overview
│       │   ├── Section 2: User Responsibilities
│       │   ├── Section 3: Loan Terms
│       │   ├── Section 4: Payment Terms
│       │   ├── Section 5: Borrowing Limits
│       │   ├── Section 6: Privacy Policy
│       │   ├── Section 7: Security
│       │   └── Section 8: Dispute Resolution
│       │
│       └── 3.3 Check Acceptance Status
│           │
│           └── LEVEL 3: ACCEPTANCE CHECK
│               │
│               ├── 3.3.1 Query Acceptance Status
│               │   ├── SELECT terms_accepted FROM PROFILE_SETTINGS
│               │   ├── WHERE user_type = ? AND user_id = ?
│               │   └── Get acceptance status
│               │
│               ├── 3.3.2 Display Acceptance Status
│               │   ├── If accepted: Show "Accepted on [date]"
│               │   ├── If not accepted: Show "Not Accepted"
│               │   └── Show terms version
│               │
│               └── 3.3.3 Show Accept Button (If Not Accepted)
│                   ├── "Accept Terms and Conditions" button
│                   ├── Checkbox: "I have read and agree"
│                   └── Enable acceptance
│
│   ├── 4. Accept Terms and Conditions
│   │   │
│   │   └── LEVEL 2: TERMS ACCEPTANCE
│   │       │
│       ├── 4.1 User Clicks Accept
│       │   ├── Show confirmation dialog
│       │   ├── Display terms summary
│       │   └── Confirm/Cancel buttons
│       │
│       ├── 4.2 User Confirms
│       │   │
│       │   └── LEVEL 3: DATABASE UPDATE
│       │       │
│       │       ├── 4.2.1 Update Profile Settings
│       │       │   ├── UPDATE PROFILE_SETTINGS
│       │       │   ├── SET terms_accepted = TRUE
│       │       │   ├── SET terms_version = current_version
│       │       │   ├── SET terms_accepted_at = NOW()
│       │       │   └── WHERE user_type = ? AND user_id = ?
│       │       │
│       │       └── 4.2.2 Create Record (If Not Exists)
│       │           ├── INSERT INTO PROFILE_SETTINGS
│       │           ├── If record doesn't exist
│       │           └── Set all fields
│       │
│       └── 4.3 Display Success Message
│           ├── "Terms and conditions accepted"
│           ├── Show acceptance date
│           └── Update UI to show accepted status
│
├── LEVEL 1: EDIT PROFILE
│   │
│   ├── 5. Edit Profile Information
│   │   │
│   │   └── LEVEL 2: PROFILE EDITING
│   │       │
│       ├── 5.1 Enable Edit Mode
│       │   ├── Click "Edit Profile" button
│       │   ├── Make fields editable
│       │   └── Show Save/Cancel buttons
│       │
│       ├── 5.2 Update Editable Fields
│       │   │
│       │   └── LEVEL 3: FIELD UPDATES
│       │       │
│       │       ├── 5.2.1 Update Name
│       │       │   ├── Input field for name
│       │       │   ├── Validate: Not empty, max 100 chars
│       │       │   └── Save to database
│       │       │
│       │       ├── 5.2.2 Update Email
│       │       │   ├── Input field for email
│       │       │   ├── Validate: Email format
│       │       │   ├── Check uniqueness
│       │       │   └── Save to database
│       │       │
│       │       ├── 5.2.3 Update Phone
│       │       │   ├── Input field for phone
│       │       │   ├── Validate: Phone format
│       │       │   └── Save to database
│       │       │
│       │       └── 5.2.4 Update Address (If Applicable)
│       │           ├── Input fields for address
│       │           ├── Validate: Not empty
│       │           └── Save to database
│       │
│       └── 5.3 Save Changes
│           │
│           └── LEVEL 3: SAVE OPERATION
│               │
│               ├── 5.3.1 Validate All Fields
│               │   ├── Check required fields
│               │   ├── Check field formats
│               │   └── Check uniqueness (email)
│               │
│               ├── 5.3.2 Update Database
│               │   ├── UPDATE respective user table
│               │   ├── SET updated fields
│               │   ├── SET updated_at = NOW()
│               │   └── WHERE user_id = ?
│               │
│               └── 5.3.3 Display Success Message
│                   ├── "Profile updated successfully"
│                   ├── Refresh profile display
│                   └── Exit edit mode
│
├── LEVEL 1: MANAGE PREFERENCES
│   │
│   ├── 6. Access Preferences
│   │   │
│   │   └── LEVEL 2: PREFERENCES DISPLAY
│   │       │
│       ├── 6.1 Load Current Preferences
│       │   │
│       │   └── LEVEL 3: PREFERENCES RETRIEVAL
│       │       │
│       │       ├── 6.1.1 Query Preferences
│       │       │   ├── SELECT preferences FROM PROFILE_SETTINGS
│       │       │   ├── WHERE user_type = ? AND user_id = ?
│       │       │   └── Parse JSON preferences
│       │       │
│       │       └── 6.1.2 Display Preferences
│       │           ├── Theme selection (light/dark)
│       │           ├── Notification preferences
│       │           ├── Language selection
│       │           └── Display options
│       │
│       └── 6.2 Update Preferences
│           │
│           └── LEVEL 3: PREFERENCES UPDATE
│               │
│               ├── 6.2.1 User Changes Preferences
│               │   ├── Select theme
│               │   ├── Toggle notifications
│               │   ├── Select language
│               │   └── Update display options
│               │
│               ├── 6.2.2 Save Preferences
│               │   ├── Convert to JSON
│               │   ├── UPDATE PROFILE_SETTINGS
│               │   ├── SET preferences = JSON
│               │   └── WHERE user_type = ? AND user_id = ?
│               │
│               └── 6.2.3 Apply Preferences
│                   ├── Apply theme immediately
│                   ├── Update notification settings
│                   └── Refresh UI
│
└── LEVEL 1: VIEW PROFILE STATISTICS
    │
    ├── 7. View Loan History (Borrower)
    │   │
    │   └── LEVEL 2: HISTORY DISPLAY
    │       │
    │       ├── 7.1 Query Loan History
    │       │   │
    │       │   └── LEVEL 3: HISTORY RETRIEVAL
    │       │       │
    │       │       ├── 7.1.1 Query All Loans
    │       │       │   ├── SELECT * FROM LOAN_REQUEST
    │       │       │   ├── WHERE borrower_id = ?
    │       │       │   └── ORDER BY requested_at DESC
    │       │       │
    │       │       └── 7.1.2 Load Related Data
    │       │           ├── Join with LOCAL_BANK for bank name
    │       │           ├── Join with INSTALLMENT for payment status
    │       │           └── Calculate totals
    │       │
    │       └── 7.2 Display Loan History
    │           ├── Table with all loans
    │           ├── Columns: Date, Amount, Bank, Status, Actions
    │           ├── Filter by status
    │           └── Sort options
    │
    ├── 8. View Approval History (Bank User)
    │   │
    │   └── LEVEL 2: APPROVAL HISTORY
    │       │
    │       ├── 8.1 Query Approval History
    │       │   ├── SELECT * FROM LOAN_REQUEST
    │       │   ├── WHERE approved_by = ? OR rejected_by = ?
    │       │   └── ORDER BY approved_at DESC
    │       │
    │       └── 8.2 Display Approval History
    │           ├── Table with all approvals/rejections
    │           ├── Columns: Date, Borrower, Amount, Decision, Reason
    │           └── Statistics: Total approved, Total rejected
    │
    └── 9. View Bank Statistics (Bank Admin)
        │
        └── LEVEL 2: BANK STATISTICS
            │
            ├── 9.1 Query Bank Statistics
            │   ├── Total borrowed
            │   ├── Total lent
            │   ├── Active loans count
            │   ├── Completed loans count
            │   └── Default rate
            │
            └── 9.2 Display Statistics Dashboard
                ├── Summary cards
                ├── Charts and graphs
                └── Export options
```

---

## Sequence Diagram

```
USER              FRONTEND          DATABASE         BLOCKCHAIN
   │                 │                  │                 │
   │──View Profile──>│                  │                 │
   │                 │──Get User Type──>│                 │
   │                 │<──User Type──────│                 │
   │                 │                  │                 │
   │                 │──Get Profile───>│                 │
   │                 │<──Profile─────────│                 │
   │                 │                  │                 │
   │<──Profile───────│                  │                 │
   │                 │                  │                 │
   │──View Terms────>│                  │                 │
   │                 │──Get Terms──────>│                 │
   │                 │<──Terms──────────│                 │
   │                 │                  │                 │
   │<──Terms─────────│                  │                 │
   │                 │                  │                 │
   │──Accept Terms──>│                  │                 │
   │                 │──Update Settings>│                 │
   │                 │<──Updated────────│                 │
   │                 │                  │                 │
   │<──Accepted──────│                  │                 │
   │                 │                  │                 │
   │──Edit Profile──>│                  │                 │
   │                 │                  │                 │
   │──Update Info───>│                  │                 │
   │                 │──Save Changes───>│                 │
   │                 │<──Saved──────────│                 │
   │                 │                  │                 │
   │<──Updated───────│                  │                 │
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis

