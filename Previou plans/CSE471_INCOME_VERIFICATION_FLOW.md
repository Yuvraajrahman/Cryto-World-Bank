# CSE471 - Income Verification Flow
## Sequential Diagram: First-Time Borrower Income Verification

**Course:** CSE471 - System Analysis  
**Flow:** Income Proof Upload and Verification  
**Date:** 2024

---

## Income Verification Flow (Top-Down Expanding Tree)

```
INCOME VERIFICATION FLOW (Top-Down Expanding Tree)
│
├── LEVEL 1: FIRST-TIME BORROWER DETECTION
│   │
│   ├── 1. Borrower Registers/Logs In
│   │   │
│   │   └── LEVEL 2: REGISTRATION CHECK
│   │       │
│   │       ├── 1.1 Check Borrower Status
│   │       │   │
│   │       │   └── LEVEL 3: STATUS CHECK
│   │       │       │
│   │       │       ├── 1.1.1 Query Borrower Record
│   │       │       │   ├── SELECT * FROM BORROWER
│   │       │       │   ├── WHERE wallet_address = ?
│   │       │       │   └── Get is_first_time flag
│   │       │       │
│   │       │       ├── 1.1.2 Check if First-Time
│   │       │       │   ├── If record doesn't exist: Create new borrower
│   │       │       │   ├── If is_first_time = TRUE: Show income proof requirement
│   │       │       │   └── If is_first_time = FALSE: Skip income proof
│   │       │       │
│   │       │       └── 1.1.3 Check Existing Income Proof
│   │       │           ├── SELECT * FROM INCOME_PROOF
│   │       │           ├── WHERE borrower_id = ?
│       │       │           └── Check if proof already uploaded
│       │       │
│       │       └── 1.2 Display Income Proof Requirement
│       │           ├── Show message: "First-time borrowers must upload income proof"
│       │           ├── Show upload interface
│       │           └── Explain requirements
│   │
│   ├── 2. Borrower Initiates Loan Request
│   │   │
│   │   └── LEVEL 2: LOAN REQUEST INITIATION
│   │       │
│       ├── 2.1 Check Income Proof Status
│       │   │
│       │   └── LEVEL 3: PROOF STATUS CHECK
│       │       │
│       │       ├── 2.1.1 Query Income Proof
│       │       │   ├── SELECT * FROM INCOME_PROOF
│       │       │   ├── WHERE borrower_id = ?
│       │       │   └── ORDER BY uploaded_at DESC LIMIT 1
│       │       │
│       │       ├── 2.1.2 Check Approval Status
│       │       │   ├── If status = 'approved': Allow loan request
│       │       │   ├── If status = 'pending': Show "Awaiting approval"
│       │       │   ├── If status = 'rejected': Show "Please upload new proof"
│       │       │   └── If no proof: Require upload
│       │       │
│       │       └── 2.1.3 Block Loan Request (If No Proof)
│       │           ├── If first-time AND no approved proof:
│       │           │   └── Show: "Please upload income proof first"
│       │           └── Disable loan request form
│   │
│   └── LEVEL 2: INCOME PROOF UPLOAD
│       │
│       ├── 3. Display Upload Interface
│       │   │
│       │   └── LEVEL 3: UPLOAD UI
│       │       │
│       │       ├── 3.1 Show Upload Form
│       │       │   ├── File input field
│       │       │   ├── Accepted formats: PDF, JPG, PNG
│       │       │   ├── Max file size: 10MB
│       │       │   └── Upload button
│       │       │
│       │       ├── 3.2 Display Requirements
│       │       │   ├── "Accepted formats: PDF, JPG, PNG"
│       │       │   ├── "Maximum file size: 10MB"
│       │       │   ├── "Document should show bank transaction details"
│       │       │   └── "Document should be clear and readable"
│       │       │
│       │       └── 3.3 Show Upload Status
│       │           ├── If pending: "Awaiting bank review"
│       │           ├── If approved: "Approved on [date]"
│       │           └── If rejected: "Rejected - [reason]"
│   │
│   ├── 4. User Selects File
│   │   │
│   │   └── LEVEL 2: FILE SELECTION
│   │       │
│       ├── 4.1 User Clicks Browse
│       │   ├── Open file picker
│       │   ├── Filter by accepted formats
│       │   └── Allow single file selection
│       │
│       ├── 4.2 File Selected
│       │   ├── Get file object
│       │   ├── Get file name
│       │   ├── Get file size
│       │   └── Get file type
│       │
│       └── 4.3 Validate File Client-Side
│           │
│           └── LEVEL 3: CLIENT VALIDATION
│               │
│               ├── 4.3.1 Check File Type
│               │   ├── Check MIME type
│               │   ├── Allowed: application/pdf, image/jpeg, image/png
│               │   └── If invalid: Show error, reject file
│               │
│               ├── 4.3.2 Check File Size
│               │   ├── Convert bytes to MB
│               │   ├── If size > 10MB: Show error, reject file
│               │   └── If size <= 10MB: Continue
│               │
│               └── 4.3.3 Preview File (Optional)
│                   ├── If image: Show thumbnail
│                   ├── If PDF: Show PDF icon
│                   └── Display file name and size
│   │
│   ├── 5. Upload File to Server
│   │   │
│   │   └── LEVEL 2: FILE UPLOAD
│   │       │
│       ├── 5.1 Prepare Upload
│       │   │
│       │   └── LEVEL 3: UPLOAD PREPARATION
│       │       │
│       │       ├── 5.1.1 Create FormData
│       │       │   ├── Append file
│       │       │   ├── Append borrower_id
│       │       │   └── Append metadata
│       │       │
│       │       ├── 5.1.2 Show Upload Progress
│       │       │   ├── Display progress bar
│       │       │   ├── Show percentage
│       │       │   └── Disable upload button
│       │       │
│       │       └── 5.1.3 Send Upload Request
│       │           ├── POST /api/income-proof/upload
│       │           ├── Include authentication token
│       │           └── Send FormData
│       │
│       ├── 5.2 Server Receives File
│       │   │
│       │   └── LEVEL 3: SERVER PROCESSING
│       │       │
│       │       ├── 5.2.1 Validate File Server-Side
│       │       │   ├── Check file type (verify MIME type)
│       │       │   ├── Check file size
│       │       │   ├── Check for malicious content
│       │       │   └── If invalid: Return error
│       │       │
│       │       ├── 5.2.2 Generate File Hash
│       │       │   │
│       │       │   └── LEVEL 4: HASH GENERATION
│       │       │       │
│       │       │       ├── 5.2.2.1 Read File Content
│       │       │       │   ├── Read file bytes
│       │       │       │   └── Store in memory
│       │       │       │
│       │       │       ├── 5.2.2.2 Calculate SHA-256 Hash
│       │       │       │   ├── Use crypto library
│       │       │       │   ├── Generate hash
│       │       │       │   └── Store hash as hex string
│       │       │       │
│       │       │       └── 5.2.2.3 Check for Duplicates
│       │       │           ├── SELECT * FROM INCOME_PROOF
│       │       │           ├── WHERE file_hash = ?
│       │       │           └── If duplicate: Reject upload
│       │       │
│       │       ├── 5.2.3 Store File
│       │       │   │
│       │       │   └── LEVEL 4: FILE STORAGE
│       │       │       │
│       │       │       ├── 5.2.3.1 Choose Storage Method
│       │       │       │   ├── Option 1: IPFS (decentralized)
│       │       │       │   ├── Option 2: Encrypted cloud storage
│       │       │       │   └── Option 3: Encrypted local storage
│       │       │       │
│       │       │       ├── 5.2.3.2 Upload to Storage
│       │       │       │   ├── If IPFS: Upload to IPFS network
│       │       │       │   ├── Get IPFS hash/CID
│       │       │       │   └── Store file path/URL
│       │       │       │
│       │       │       └── 5.2.3.3 Encrypt File (If Not IPFS)
│       │       │           ├── Encrypt file with AES-256
│       │       │           ├── Store encryption key securely
│       │       │           └── Save encrypted file
│       │       │
│       │       └── 5.2.4 Create Database Record
│       │           │
│       │           └── LEVEL 4: DATABASE OPERATION
│       │               │
│       │               ├── 5.2.4.1 Insert Income Proof Record
│       │       │           ├── INSERT INTO INCOME_PROOF
│       │       │           ├── borrower_id, file_path, file_hash
│       │       │           ├── file_type, file_size
│       │       │           ├── status = 'pending'
│       │       │           └── uploaded_at = NOW()
│       │       │
│       │               └── 5.2.4.2 Return Record ID
│       │       │           ├── Get auto-generated proof_id
│       │       │           └── Return to client
│       │
│       └── 5.3 Display Upload Success
│           ├── Show "File uploaded successfully"
│           ├── Show "Awaiting bank review"
│           ├── Display file information
│           └── Enable loan request (but will wait for approval)
│
├── LEVEL 1: BANK REVIEW PROCESS
│   │
│   ├── 6. Bank User Views Pending Income Proofs
│   │   │
│   │   └── LEVEL 2: PROOF REVIEW LIST
│   │       │
│       ├── 6.1 Query Pending Proofs
│       │   │
│       │   └── LEVEL 3: DATABASE QUERY
│       │       │
│       │       ├── 6.1.1 Get Pending Proofs for Bank
│       │       │   ├── SELECT ip.*, b.name, b.wallet_address
│       │       │   ├── FROM INCOME_PROOF ip
│       │       │   ├── JOIN BORROWER b ON ip.borrower_id = b.borrower_id
│       │       │   ├── JOIN LOAN_REQUEST lr ON b.borrower_id = lr.borrower_id
│       │       │   ├── WHERE lr.local_bank_id = current_bank_id
│       │       │   ├── AND ip.status = 'pending'
│       │       │   └── ORDER BY ip.uploaded_at ASC
│       │       │
│       │       └── 6.1.2 Display Proof List
│       │           ├── Show borrower name and wallet
│       │           ├── Show upload date
│       │           ├── Show file type and size
│       │           └── Show "Review" button
│   │
│   ├── 7. Bank User Reviews Income Proof
│   │   │
│   │   └── LEVEL 2: PROOF REVIEW
│   │       │
│       ├── 7.1 Download/View File
│       │   │
│       │   └── LEVEL 3: FILE RETRIEVAL
│       │       │
│       │       ├── 7.1.1 Get File Path
│       │       │   ├── SELECT file_path FROM INCOME_PROOF
│       │       │   ├── WHERE proof_id = ?
│       │       │   └── Get file location
│       │       │
│       │       ├── 7.1.2 Retrieve File
│       │       │   ├── If IPFS: Download from IPFS using CID
│       │       │   ├── If encrypted: Decrypt file
│       │       │   └── Get file content
│       │       │
│       │       └── 7.1.3 Display File
│       │           ├── If PDF: Show PDF viewer
│       │           ├── If image: Show image viewer
│       │           └── Allow download option
│   │
│   ├── 8. Bank User Approves Income Proof
│   │   │
│   │   └── LEVEL 2: APPROVAL PROCESS
│   │       │
│       ├── 8.1 Verify Document Authenticity
│       │   ├── Bank user reviews document
│       │   ├── Checks for:
│       │   │   ├── Bank transaction details
│       │   │   ├── Income information
│       │   │   ├── Document clarity
│       │   │   └── Authenticity
│       │   └── Makes decision
│       │
│       ├── 8.2 Update Income Proof Status
│       │   │
│       │   └── LEVEL 3: DATABASE UPDATE
│       │       │
│       │       ├── 8.2.1 Update Status to Approved
│       │       │   ├── UPDATE INCOME_PROOF
│       │       │   ├── SET status = 'approved'
│       │       │   ├── SET reviewed_by = bank_user_id
│       │       │   ├── SET reviewed_at = NOW()
│       │       │   └── WHERE proof_id = ?
│       │       │
│       │       └── 8.2.2 Update Borrower Status
│       │           ├── UPDATE BORROWER
│       │           ├── SET is_first_time = FALSE
│       │           └── WHERE borrower_id = ?
│       │
│       └── 8.3 Notify Borrower
│           ├── Send notification: "Income proof approved"
│           ├── Show in borrower dashboard
│           └── Enable loan request functionality
│   │
│   └── 9. Bank User Rejects Income Proof
│       │
│       └── LEVEL 2: REJECTION PROCESS
│           │
│           ├── 9.1 Enter Rejection Reason
│           │   ├── Text input for reason
│           │   ├── Required field
│           │   └── Max 500 characters
│           │
│           ├── 9.2 Update Income Proof Status
│           │   │
│           │   └── LEVEL 3: DATABASE UPDATE
│           │       │
│           │       ├── 9.2.1 Update Status to Rejected
│           │       │   ├── UPDATE INCOME_PROOF
│           │       │   ├── SET status = 'rejected'
│           │       │   ├── SET reviewed_by = bank_user_id
│           │       │   ├── SET reviewed_at = NOW()
│           │       │   ├── SET notes = rejection_reason
│           │       │   └── WHERE proof_id = ?
│           │       │
│           │       └── 9.2.2 Keep Borrower as First-Time
│           │           ├── is_first_time remains TRUE
│           │           └── Borrower must upload new proof
│           │
│           └── 9.3 Notify Borrower
│               ├── Send notification: "Income proof rejected"
│               ├── Show rejection reason
│               └── Prompt to upload new proof
│
└── LEVEL 1: POST-APPROVAL ACTIONS
    │
    ├── 10. Borrower Can Now Request Loan
    │   │
    │   └── LEVEL 2: LOAN REQUEST ENABLED
    │       │
    │       ├── 10.1 Check Approval Status
    │       │   ├── Query INCOME_PROOF table
    │       │   ├── Check if status = 'approved'
    │       │   └── If approved: Enable loan request
    │       │
    │       └── 10.2 Proceed with Loan Request
    │           ├── Loan request form enabled
    │           ├── Income proof requirement satisfied
    │           └── Can submit loan request
```

---

## Sequence Diagram

```
BORROWER          FRONTEND          SERVER            DATABASE         STORAGE        BANK_USER
   │                 │                  │                 │                 │              │
   │──Upload File───>│                  │                 │                 │              │
   │                 │──Validate───────>│                 │                 │              │
   │                 │<──Valid──────────│                 │                 │              │
   │                 │                  │                 │                 │              │
   │                 │──Upload─────────>│                 │                 │              │
   │                 │                  │──Generate Hash──>│                 │              │
   │                 │                  │<──Hash───────────│                 │              │
   │                 │                  │                 │                 │              │
   │                 │                  │──Store File──────────────────────>│              │
   │                 │                  │<──Stored──────────────────────────│              │
   │                 │                  │                 │                 │              │
   │                 │                  │──Save Record────>│                 │              │
   │                 │                  │<──Saved──────────│                 │              │
   │                 │                  │                 │                 │              │
   │                 │<──Success───────│                 │                 │              │
   │                 │                  │                 │                 │              │
   │<──Uploaded──────│                  │                 │                 │              │
   │                 │                  │                 │                 │              │
   │                 │                  │                 │                 │              │
   │                 │                  │                 │                 │              │
   │                 │                  │                 │                 │              │
   │                 │<──View Proofs────────────────────────────────────────────────────>│
   │                 │                  │                 │                 │              │
   │                 │──Get Proofs─────>│                 │                 │              │
   │                 │                  │──Query──────────>│                 │              │
   │                 │                  │<──Proofs────────│                 │              │
   │                 │<──Proofs─────────│                 │                 │              │
   │                 │                  │                 │                 │              │
   │                 │                  │                 │                 │              │
   │                 │<──Review────────────────────────────────────────────────────────>│
   │                 │                  │                 │                 │              │
   │                 │                  │──Get File────────────────────────────────────>│
   │                 │                  │<──File───────────────────────────────────────│
   │                 │                  │                 │                 │              │
   │                 │<──Approve───────────────────────────────────────────────────────>│
   │                 │                  │                 │                 │              │
   │                 │                  │──Update Status──>│                 │              │
   │                 │                  │<──Updated────────│                 │              │
   │                 │                  │                 │                 │              │
   │<──Approved──────│                  │                 │                 │              │
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis

