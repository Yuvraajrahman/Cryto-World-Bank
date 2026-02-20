# CSE471 - AI Chatbot Flow
## Sequential Diagram: AI Chatbot Interaction

**Course:** CSE471 - System Analysis  
**Flow:** AI Chatbot for Customer Support  
**Date:** 2024

---

## AI Chatbot Flow (Top-Down Expanding Tree)

```
AI CHATBOT FLOW (Top-Down Expanding Tree)
│
├── LEVEL 1: USER INITIATES CHAT
│   │
│   ├── 1. User Opens Chatbot
│   │   │
│   │   └── LEVEL 2: CHATBOT INITIALIZATION
│   │       │
│   │       ├── 1.1 Display Chatbot Interface
│   │       │   ├── Chat window/modal
│   │       │   ├── Message history area
│   │       │   ├── Input field
│   │       │   └── Send button
│   │       │
│   │       ├── 1.2 Load User Context
│   │       │   │
│   │       │   └── LEVEL 3: CONTEXT RETRIEVAL
│   │       │       │
│   │       │       ├── 1.2.1 Get User Information
│   │       │       │   ├── Get wallet address
│   │       │       │   ├── Get user type (borrower, bank_user, etc.)
│   │       │       │   └── Get user_id
│   │       │       │
│   │       │       └── 1.2.2 Load User Data
│       │       │           ├── Query borrower profile (if borrower)
│       │       │           ├── Query loan requests
│       │       │           ├── Query active loans
│       │       │           └── Store in chatbot context
│       │       │
│       │       └── 1.3 Display Welcome Message
│       │           ├── "Hello! How can I help you?"
│       │           ├── Show suggested questions
│       │           └── Display quick action buttons
│   │
│   ├── 2. User Asks Question
│   │   │
│   │   └── LEVEL 2: QUESTION PROCESSING
│   │       │
│   │       ├── 2.1 User Types Question
│   │       │   ├── Input in chat field
│       │       │   ├── Validate input (not empty)
│       │       │   └── Enable send button
│       │       │
│       │       ├── 2.2 Display User Message
│       │       │   ├── Show message in chat
│       │       │   ├── Show timestamp
│       │       │   └── Show "Thinking..." indicator
│       │       │
│       │       └── 2.3 Send to Chatbot API
│       │           ├── Prepare request payload
│       │           ├── Include user question
│       │           ├── Include user context
│       │           └── Send POST request
│   │
│   └── LEVEL 2: CHATBOT PROCESSING
│       │
│       ├── 3. Process Natural Language
│       │   │
│       │   └── LEVEL 3: NLP PROCESSING
│       │       │
│       │       ├── 3.1 Intent Recognition
│       │       │   │
│       │       │   └── LEVEL 4: INTENT CLASSIFICATION
│       │       │       │
│       │       │       ├── 3.1.1 Preprocess Text
│       │       │       │   ├── Tokenize input
│       │       │       │   ├── Remove stop words
│       │       │       │   ├── Lowercase conversion
│       │       │       │   └── Handle typos (fuzzy matching)
│       │       │       │
│       │       │       ├── 3.1.2 Classify Intent
│       │       │       │   ├── Use ML model (BERT/Transformer)
│       │       │       │   ├── Match against known intents:
│       │       │       │   │   - loan_limit_query
│       │       │       │   │   - payment_due_query
│       │       │       │   │   - bank_information
│       │       │       │   │   - loan_status_query
│       │       │       │   │   - general_question
│       │       │       │   └── Get confidence score
│       │       │       │
│       │       │       └── 3.1.3 Extract Entities
│       │       │           ├── Extract loan ID (if mentioned)
│       │       │           ├── Extract dates
│       │       │           ├── Extract amounts
│       │       │           └── Extract bank names
│       │       │
│       │       ├── 3.2 Determine Response Type
│       │       │   │
│       │       │   └── LEVEL 4: RESPONSE ROUTING
│       │       │       │
│       │       │       ├── 3.2.1 Check Intent Confidence
│       │       │       │   ├── If confidence < 0.7: Ask for clarification
│       │       │       │   └── If confidence >= 0.7: Proceed
│       │       │       │
│       │       │       └── 3.2.2 Route to Handler
│       │       │           ├── loan_limit_query → LoanLimitHandler
│       │       │           ├── payment_due_query → PaymentHandler
│       │       │           ├── bank_information → BankInfoHandler
│       │       │           └── general_question → GeneralHandler
│       │
│       └── 4. Generate Response
│           │
│           └── LEVEL 3: RESPONSE GENERATION
│               │
│               ├── 4.1 Query User Data (If Needed)
│               │   │
│               │   └── LEVEL 4: DATA QUERYING
│               │       │
│               │       ├── 4.1.1 Loan Limit Query Handler
│               │       │   │
│               │       │   └── LEVEL 5: LOAN LIMIT CALCULATION
│               │       │       │
│               │       │       ├── 4.1.1.1 Query Borrowing Limits
│               │       │       │   ├── SELECT * FROM BORROWING_LIMIT
│               │       │       │   ├── WHERE borrower_id = ?
│               │       │       │   └── Get six_month and one_year limits
│               │       │       │
│               │       │       ├── 4.1.1.2 Query Current Borrowing
│               │       │       │   ├── SELECT SUM(amount) FROM TRANSACTION
│               │       │       │   ├── WHERE borrower_id = ?
│               │       │       │   └── AND transaction_type = 'loan_approved'
│               │       │       │
│               │       │       └── 4.1.1.3 Calculate Remaining
│               │       │           ├── remaining = limit - borrowed
│               │       │           └── Format for response
│               │       │
│               │       ├── 4.1.2 Payment Due Query Handler
│               │       │   │
│               │       │   └── LEVEL 5: PAYMENT QUERY
│               │       │       │
│               │       │       ├── 4.1.2.1 Query Active Loans
│               │       │       │   ├── SELECT * FROM LOAN_REQUEST
│               │       │       │   ├── WHERE borrower_id = ?
│               │       │       │   └── AND status IN ('approved', 'active')
│               │       │       │
│               │       │       ├── 4.1.2.2 Query Due Installments
│               │       │       │   ├── SELECT * FROM INSTALLMENT
│               │       │       │   ├── WHERE loan_id IN (active_loans)
│               │       │       │   ├── AND status = 'pending'
│               │       │       │   └── ORDER BY due_date ASC
│               │       │       │
│               │       │       └── 4.1.2.3 Calculate Total Due
│               │       │           ├── Sum all due amounts
│               │       │           ├── Include late fees if overdue
│               │       │           └── Format for response
│               │       │
│               │       ├── 4.1.3 Bank Information Handler
│               │       │   │
│               │       │   └── LEVEL 5: BANK QUERY
│               │       │       │
│               │       │       ├── 4.1.3.1 Query Available Banks
│               │       │       │   ├── SELECT * FROM LOCAL_BANK
│               │       │       │   ├── WHERE country = user_country
│               │       │       │   └── Get bank names and locations
│               │       │       │
│               │       │       └── 4.1.3.2 Format Bank List
│               │       │           ├── Create list of banks
│               │       │           └── Include contact information
│               │       │
│               │       └── 4.1.4 General Question Handler
│               │           │
│               │           └── LEVEL 5: GENERAL RESPONSE
│               │               │
│               │               ├── 4.1.4.1 Search Knowledge Base
│               │               │   ├── Search FAQ database
│               │               │   ├── Use semantic search
│               │               │   └── Get relevant answers
│               │               │
│               │               └── 4.1.4.2 Generate Response
│               │                   ├── Use pre-trained responses
│               │                   ├── Use GPT/LLM for generation
│               │                   └── Format response
│               │
│               ├── 4.2 Format Response
│               │   │
│               │   └── LEVEL 4: RESPONSE FORMATTING
│               │       │
│               │       ├── 4.2.1 Create Response Text
│               │       │   ├── Use template with data
│               │       │   ├── Format numbers (currency)
│               │       │   ├── Format dates
│               │       │   └── Add friendly language
│               │       │
│               │       ├── 4.2.2 Add Contextual Information
│               │       │   ├── Include relevant links
│               │       │   ├── Include action buttons (if applicable)
│               │       │   └── Include helpful tips
│               │       │
│               │       └── 4.2.3 Add Confidence Indicator
│               │           ├── If confidence < 0.9: Add disclaimer
│               │       │   └── Suggest contacting support if unclear
│               │
│               └── 4.3 Log Interaction
│                   │
│                   └── LEVEL 4: LOGGING
│                       │
│                       ├── 4.3.1 Store in Database
│                       │   ├── INSERT INTO AI_CHATBOT_LOG
│                       │   ├── user_wallet, user_type, question, response
│                       │   ├── intent, confidence
│                       │   └── timestamp
│                       │
│                       └── 4.3.2 Use for Training (Future)
│                           ├── Store for ML model improvement
│                           └── Analyze for accuracy improvements
│
├── LEVEL 1: DISPLAY RESPONSE
│   │
│   ├── 5. Show Response to User
│   │   │
│   │   └── LEVEL 2: UI UPDATE
│   │       │
│       ├── 5.1 Display Chatbot Message
│       │   ├── Show response in chat
│       │   ├── Show on left side (chatbot side)
│       │   ├── Format with proper styling
│       │   └── Show timestamp
│       │
│       ├── 5.2 Display Additional Information
│       │   ├── Show formatted data (tables, lists)
│       │   ├── Show action buttons if applicable
│       │   └── Show links to relevant pages
│       │
│       └── 5.3 Enable Follow-Up
│           ├── User can ask follow-up questions
│           ├── Maintain conversation context
│           └── Show suggested follow-up questions
│
└── LEVEL 1: CONTINUOUS LEARNING
    │
    ├── 6. Collect Feedback (Optional)
    │   │
    │   └── LEVEL 2: FEEDBACK COLLECTION
    │       │
    │       ├── 6.1 Ask for Feedback
    │       │   ├── "Was this helpful?" buttons
    │       │   ├── Thumbs up/down
    │       │   └── Rating (1-5 stars)
    │       │
    │       └── 6.2 Store Feedback
    │           ├── Store in database
    │           ├── Link to interaction log
    │           └── Use for model improvement
    │
    └── 7. Improve Model (Future)
        │
        └── LEVEL 2: MODEL TRAINING
            │
            ├── 7.1 Analyze Interactions
            │   ├── Review low-confidence responses
            │   ├── Identify common questions
            │   └── Find gaps in knowledge base
            │
            └── 7.2 Retrain Model
                ├── Update training data
                ├── Retrain intent classifier
                └── Deploy updated model
```

---

## Sequence Diagram

```
USER              FRONTEND          CHATBOT API       DATABASE         ML MODEL
   │                 │                  │                 │              │
   │──Open Chat─────>│                  │                 │              │
   │                 │                  │                 │              │
   │<──Welcome───────│                  │                 │              │
   │                 │                  │                 │              │
   │──Ask Question───>│                  │                 │              │
   │                 │                  │                 │              │
   │                 │──Process────────>│                 │              │
   │                 │                  │                 │              │
   │                 │                  │──Classify Intent──────────────>│
   │                 │                  │<──Intent───────────────────────│
   │                 │                  │                 │              │
   │                 │                  │──Query Data───>│              │
   │                 │                  │<──Data──────────│              │
   │                 │                  │                 │              │
   │                 │                  │──Generate──────>│              │
   │                 │                  │<──Response──────│              │
   │                 │                  │                 │              │
   │                 │                  │──Log───────────>│              │
   │                 │                  │<──Logged────────│              │
   │                 │                  │                 │              │
   │                 │<──Response───────│                 │              │
   │                 │                  │                 │              │
   │<──Response──────│                  │                 │              │
   │                 │                  │                 │              │
   │──Follow-up─────>│                  │                 │              │
   │                 │                  │                 │              │
   │                 │──Process────────>│                 │              │
   │                 │                  │                 │              │
   │                 │                  │──Use Context────>│              │
   │                 │                  │<──Context────────│              │
   │                 │                  │                 │              │
   │                 │<──Response───────│                 │              │
   │                 │                  │                 │              │
   │<──Response──────│                  │                 │              │
```

---

## Example Interactions

### Example 1: Loan Limit Query
**User:** "What is my loan limit?"  
**Chatbot Processing:**
1. Intent: `loan_limit_query` (confidence: 0.95)
2. Query: `SELECT * FROM BORROWING_LIMIT WHERE borrower_id = ?`
3. Response: "Your current borrowing limits are:
   - 6-month limit: 5.0 ETH
   - 6-month remaining: 2.5 ETH
   - 1-year limit: 10.0 ETH
   - 1-year remaining: 7.5 ETH"

### Example 2: Payment Due Query
**User:** "How much do I owe this month?"  
**Chatbot Processing:**
1. Intent: `payment_due_query` (confidence: 0.92)
2. Query: Active loans and due installments
3. Response: "You have 2 installments due this month:
   - Loan #123: 0.5 ETH (Due: Dec 15, 2024)
   - Loan #124: 1.0 ETH (Due: Dec 20, 2024)
   Total due: 1.5 ETH"

### Example 3: Bank Information
**User:** "Which bank should I contact?"  
**Chatbot Processing:**
1. Intent: `bank_information` (confidence: 0.88)
2. Query: Available local banks in user's country
3. Response: "Based on your location, you can contact:
   - City Bank (Downtown Branch)
   - Regional Bank (Main Street)
   Would you like to see their contact information?"

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis

