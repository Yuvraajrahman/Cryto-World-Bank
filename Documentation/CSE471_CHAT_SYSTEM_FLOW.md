# CSE471 - Chat System Flow
## Sequential Diagram: Borrower-Bank Chat System

**Course:** CSE471 - System Analysis  
**Flow:** Chat System Between Borrowers and Banks  
**Date:** 2024

---

## Chat System Flow (Top-Down Expanding Tree)

```
CHAT SYSTEM FLOW (Top-Down Expanding Tree)
│
├── LEVEL 1: INITIATE CHAT
│   │
│   ├── 1. Borrower Opens Loan Request
│   │   │
│   │   └── LEVEL 2: LOAN REQUEST VIEW
│   │       │
│   │       ├── 1.1 Navigate to Loan Details
│   │       │   ├── Borrower clicks on loan request
│   │       │   ├── Load loan information
│   │       │   └── Display loan status and details
│   │       │
│   │       └── 1.2 Display Chat Button
│   │           ├── Show "Chat with Bank" button
│   │           ├── Show unread message count (if any)
│   │           └── Enable chat interface
│   │
│   ├── 2. Bank User Views Pending Requests
│   │   │
│   │   └── LEVEL 2: BANK DASHBOARD
│   │       │
│   │       ├── 2.1 Load Pending Loan Requests
│   │       │   ├── Query loan requests for bank
│   │       │   ├── Filter by status = 'pending'
│   │       │   └── Display request list
│   │       │
│   │       └── 2.2 Display Chat Indicators
│   │           ├── Show unread message count per request
│   │           ├── Highlight requests with new messages
│   │           └── Enable chat access
│   │
│   └── 3. Open Chat Interface
│       │
│       └── LEVEL 2: CHAT INITIALIZATION
│           │
│           ├── 3.1 Load Chat History
│           │   │
│           │   └── LEVEL 3: MESSAGE RETRIEVAL
│           │       │
│           │       ├── 3.1.1 Query Messages
│           │       │   ├── SELECT * FROM CHAT_MESSAGE
│           │       │   ├── WHERE loan_id = ?
│           │       │   └── ORDER BY sent_at ASC
│           │       │
│           │       ├── 3.1.2 Load Sender Information
│           │       │   ├── For borrower messages: Get borrower name
│           │       │   ├── For bank messages: Get bank user name
│           │       │   └── Join with respective tables
│           │       │
│           │       └── 3.1.3 Format Messages
│           │           ├── Group by date
│           │           ├── Format timestamps
│           │           └── Mark read/unread status
│           │
│           ├── 3.2 Render Chat Interface
│           │   ├── Message list area
│           │   ├── Input area with send button
│           │   ├── Typing indicator (if real-time)
│           │   └── Scroll to latest message
│           │
│           └── 3.3 Mark Messages as Read
│               ├── UPDATE CHAT_MESSAGE
│               ├── SET is_read = TRUE
│               ├── SET read_at = NOW()
│               └── WHERE receiver_id = current_user AND is_read = FALSE
│
├── LEVEL 1: SEND MESSAGE
│   │
│   ├── 4. User Types Message
│   │   │
│   │   └── LEVEL 2: MESSAGE COMPOSITION
│   │       │
│   │       ├── 4.1 Input Validation
│   │       │   ├── Check message length (min 1, max 2000 chars)
│   │       │   ├── Check for empty message
│   │       │   └── Sanitize input (prevent XSS)
│   │       │
│   │       └── 4.2 Enable Send Button
│   │           ├── Enable when message is valid
│   │           └── Disable when empty
│   │
│   ├── 5. User Sends Message
│   │   │
│   │   └── LEVEL 2: MESSAGE SENDING
│   │       │
│   │       ├── 5.1 Prepare Message Data
│   │       │   │
│   │       │   └── LEVEL 3: DATA PREPARATION
│   │       │       │
│       │       ├── 5.1.1 Identify Sender
│       │       │   ├── If borrower: sender_type = 'borrower', sender_id = borrower_id
│       │       │   ├── If bank user: sender_type = 'bank', sender_id = bank_user_id
│       │       │   └── Get from current session
│       │       │
│       │       ├── 5.1.2 Identify Receiver
│       │       │   ├── If borrower sending: receiver = bank user
│       │       │   ├── If bank sending: receiver = borrower
│       │       │   └── Get from loan request relationship
│       │       │
│       │       └── 5.1.3 Format Message
│       │           ├── message_text = sanitized input
│       │           ├── loan_id = current loan
│       │           └── sent_at = current timestamp
│       │
│       ├── 5.2 Store Message in Database
│       │   │
│       │   └── LEVEL 3: DATABASE OPERATION
│       │       │
│       │       ├── 5.2.1 Insert Message
│       │       │   ├── INSERT INTO CHAT_MESSAGE
│       │       │   ├── loan_id, sender_type, sender_id, receiver_type, receiver_id
│       │       │   ├── message_text, is_read = FALSE
│       │       │   └── sent_at = NOW()
│       │       │
│       │       └── 5.2.2 Get Message ID
│       │           ├── Retrieve auto-generated message_id
│       │           └── Return complete message object
│       │
│       ├── 5.3 Display Message in UI
│       │   │
│       │   └── LEVEL 3: UI UPDATE
│       │       │
│       │       ├── 5.3.1 Add Message to Chat
│       │       │   ├── Append to message list
│       │       │   ├── Show on sender's side (right)
│       │       │   ├── Format timestamp
│       │       │   └── Show "Sending..." status
│       │       │
│       │       └── 5.3.2 Scroll to Bottom
│       │           ├── Auto-scroll to latest message
│       │           └── Smooth scroll animation
│       │
│       └── 5.4 Notify Receiver
│           │
│           └── LEVEL 3: NOTIFICATION
│               │
│               ├── 5.4.1 Update Unread Count
│               │   ├── Increment unread count for receiver
│               │   ├── Update in database
│               │   └── Update UI badge (if receiver is online)
│               │
│               ├── 5.4.2 Send Real-Time Notification (If WebSocket)
│               │   ├── Emit message event via WebSocket
│               │   ├── Send to receiver's session
│               │   └── Display notification popup
│               │
│               └── 5.4.3 Send Push Notification (Optional)
│                   ├── If receiver not online
│                   ├── Send push notification
│                   └── Email notification (optional)
│
├── LEVEL 1: RECEIVE MESSAGE
│   │
│   ├── 6. Receiver Views Chat
│   │   │
│   │   └── LEVEL 2: MESSAGE RECEPTION
│   │       │
│       ├── 6.1 Check for New Messages
│       │   │
│       │   └── LEVEL 3: MESSAGE CHECKING
│       │       │
│       │       ├── 6.1.1 Query Unread Messages
│       │       │   ├── SELECT * FROM CHAT_MESSAGE
│       │       │   ├── WHERE loan_id = ?
│       │       │   ├── AND receiver_id = current_user_id
│       │       │   ├── AND receiver_type = current_user_type
│       │       │   ├── AND is_read = FALSE
│       │       │   └── ORDER BY sent_at ASC
│       │       │
│       │       └── 6.1.2 Display New Messages
│       │           ├── Show on receiver's side (left)
│       │           ├── Highlight as unread
│       │           └── Show sender name
│       │
│       ├── 6.2 Mark Messages as Read
│       │   │
│       │   └── LEVEL 3: READ STATUS UPDATE
│       │       │
│       │       ├── 6.2.1 Update Read Status
│       │       │   ├── UPDATE CHAT_MESSAGE
│       │       │   ├── SET is_read = TRUE
│       │       │   ├── SET read_at = NOW()
│       │       │   └── WHERE message_id IN (unread_message_ids)
│       │       │
│       │       └── 6.2.2 Update UI
│       │           ├── Remove unread highlight
│       │           ├── Update unread count
│       │           └── Show read receipt (optional)
│       │
│       └── 6.3 Real-Time Updates (If WebSocket)
│           │
│           └── LEVEL 3: WEBSOCKET HANDLING
│               │
│               ├── 6.3.1 Listen for New Messages
│               │   ├── WebSocket connection active
│               │   ├── Listen to 'new_message' event
│               │   └── Receive message data
│               │
│               ├── 6.3.2 Display Real-Time Message
│               │   ├── Add message to chat immediately
│               │   ├── Show notification
│               │   └── Play sound (optional)
│               │
│               └── 6.3.3 Update Unread Count
│                   ├── Increment badge count
│                   └── Update in real-time
│
├── LEVEL 1: CHAT FEATURES
│   │
│   ├── 7. View Message History
│   │   │
│   │   └── LEVEL 2: HISTORY DISPLAY
│   │       │
│       ├── 7.1 Load All Messages
│       │   ├── Query all messages for loan
│       │   ├── Paginate if many messages
│       │   └── Display in chronological order
│       │
│       └── 7.2 Search Messages
│           ├── Search input field
│           ├── Query messages by text
│           └── Highlight search results
│   │
│   ├── 8. Typing Indicator (Real-Time)
│   │   │
│   │   └── LEVEL 2: TYPING DETECTION
│   │       │
│       ├── 8.1 Detect Typing
│       │   ├── Listen to input events
│       │   ├── Debounce typing detection
│       │   └── Emit 'typing' event via WebSocket
│       │
│       └── 8.2 Display Typing Indicator
│           ├── Show "User is typing..." message
│           ├── Hide after 3 seconds of inactivity
│           └── Update in real-time
│   │
│   └── 9. Message Status Indicators
│       │
│       └── LEVEL 2: STATUS DISPLAY
│           │
│           ├── 9.1 Show Message Status
│           │   ├── "Sending..." (gray)
│           │   ├── "Sent" (checkmark)
│           │   ├── "Delivered" (double checkmark)
│           │   └── "Read" (blue double checkmark)
│           │
│           └── 9.2 Update Status in Real-Time
│               ├── Poll message status
│               ├── Update when receiver reads
│               └── Update UI accordingly
│
└── LEVEL 1: CHAT MANAGEMENT
    │
    ├── 10. Delete Message (Optional)
    │   │
    │   └── LEVEL 2: MESSAGE DELETION
    │       │
    │       ├── 10.1 Verify Ownership
    │       │   ├── Check if user is sender
    │       │   └── Allow deletion only for own messages
    │       │
    │       └── 10.2 Soft Delete
    │           ├── Mark as deleted (don't actually delete)
    │           ├── Show "Message deleted" placeholder
    │           └── Update database
    │
    └── 11. Export Chat History (Optional)
        │
        └── LEVEL 2: EXPORT FUNCTIONALITY
            │
            ├── 11.1 Generate Export File
            │   ├── Query all messages
            │   ├── Format as text/PDF
            │   └── Include timestamps and sender names
            │
            └── 11.2 Download File
                ├── Generate download link
                └── User downloads file
```

---

## Sequence Diagram

```
BORROWER          FRONTEND          DATABASE         WEBSOCKET      BANK_USER
   │                 │                  │                 │              │
   │──Open Chat─────>│                  │                 │              │
   │                 │──Get Messages───>│                 │              │
   │                 │<──Messages────────│                 │              │
   │                 │                  │                 │              │
   │<──Chat UI───────│                  │                 │              │
   │                 │                  │                 │              │
   │──Type Message──>│                  │                 │              │
   │                 │                  │                 │              │
   │──Send──────────>│                  │                 │              │
   │                 │──Save Message───>│                 │              │
   │                 │<──Saved───────────│                 │              │
   │                 │                  │                 │              │
   │                 │──Emit Message──────────────────>│              │
   │                 │                  │                 │              │
   │<──Message───────│                  │                 │              │
   │                 │                  │                 │              │
   │                 │                  │                 │              │
   │                 │                  │                 │              │
   │                 │                  │                 │              │
   │                 │<──New Message───────────────────────────────────>│
   │                 │                  │                 │              │
   │                 │──Get Message─────>│                 │              │
   │                 │<──Message─────────│                 │              │
   │                 │                  │                 │              │
   │<──New Message───│                  │                 │              │
   │                 │                  │                 │              │
   │                 │                  │                 │              │
   │──Mark Read──────>│                  │                 │              │
   │                 │──Update Read─────>│                 │              │
   │                 │<──Updated─────────│                 │              │
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** System Analysis Team  
**Course:** CSE471 - System Analysis

