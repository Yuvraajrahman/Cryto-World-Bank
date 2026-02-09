# CSE470 - Software Engineering
## Crypto World Bank: Agile Development Methodology

**Course:** CSE470 - Software Engineering  
**Project:** Decentralized Crypto Reserve & Lending Bank  
**Duration:** 2 Months (8 Weeks)  
**Methodology:** Agile/Scrum  
**Sprints:** 3 Sprints  
**Date:** 2024

---

## 1. Project Overview

### 1.1 Project Scope

The Crypto World Bank is a decentralized lending platform built on blockchain technology with a hierarchical banking structure (World Bank → National Banks → Local Banks → Users). The system includes installment payments, AI/ML security layers, chat functionality, and comprehensive user management.

### 1.2 Development Methodology

**Agile/Scrum Framework** with the following characteristics:
- **Sprint Duration:** 2-3 weeks per sprint
- **Team Size:** 5-7 developers
- **Daily Standups:** 15 minutes
- **Sprint Planning:** 2 hours at sprint start
- **Sprint Review:** 1 hour at sprint end
- **Retrospective:** 1 hour at sprint end

---

## 2. Sprint Structure

### 2.1 Overall Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                   2-MONTH DEVELOPMENT TIMELINE                  │
└─────────────────────────────────────────────────────────────────┘

Week 1-2:  Sprint 1 (Foundation & Core Banking)
Week 3-4:  Sprint 2 (Lending & Payment Features)
Week 5-6:  Sprint 3 (Advanced Features & Security)
Week 7:    Integration & Testing
Week 8:    Deployment & Documentation
```

### 2.2 Sprint Breakdown

| Sprint | Duration | Focus Area | Key Deliverables |
|--------|----------|------------|-----------------|
| **Sprint 1** | Weeks 1-2 | Foundation & Core Banking | Smart contracts, basic UI, user authentication |
| **Sprint 2** | Weeks 3-4 | Lending & Payment Features | Loan requests, installments, chat system |
| **Sprint 3** | Weeks 5-6 | Advanced Features & Security | AI/ML integration, profiles, market data |
| **Buffer** | Week 7 | Integration & Testing | End-to-end testing, bug fixes |
| **Release** | Week 8 | Deployment | Production deployment, documentation |

---

## 3. Sprint 1: Foundation & Core Banking
**Duration:** 2 Weeks (Weeks 1-2)  
**Sprint Goal:** Establish core blockchain infrastructure and hierarchical banking structure

### 3.1 Sprint Backlog

#### Epic 1: Smart Contract Development
**Story Points:** 21

**User Stories:**

1. **US-1.1: World Bank Smart Contract**
   - **As a** system administrator  
   - **I want** a smart contract for the Crypto World Bank  
   - **So that** I can manage the global reserve and national bank relationships
   - **Acceptance Criteria:**
     - Contract deployed on testnet
     - Functions: depositToReserve, getTotalReserve
     - Events: ReserveDeposited
     - **Story Points:** 5

2. **US-1.2: National Bank Smart Contract**
   - **As a** national bank administrator  
   - **I want** a smart contract for national banks  
   - **So that** I can borrow from World Bank and lend to Local Banks
   - **Acceptance Criteria:**
     - Contract with borrowing/lending functions
     - Relationship with World Bank contract
     - **Story Points:** 5

3. **US-1.3: Local Bank Smart Contract**
   - **As a** local bank administrator  
   - **I want** a smart contract for local banks  
   - **So that** I can borrow from National Banks and lend to users
   - **Acceptance Criteria:**
     - Contract with borrowing/lending functions
     - Relationship with National Bank contract
     - **Story Points:** 5

4. **US-1.4: Role-Based Access Control**
   - **As a** system administrator  
   - **I want** role-based access control in smart contracts  
   - **So that** only authorized users can perform specific actions
   - **Acceptance Criteria:**
     - Roles: World Bank Admin, National Bank Admin, Local Bank Admin, Bank User, Borrower
     - Modifiers for each role
     - **Story Points:** 3

5. **US-1.5: Gas Cost Management**
   - **As a** borrower  
   - **I want** gas costs deducted from my loan amount  
   - **So that** I understand the true cost of borrowing
   - **Acceptance Criteria:**
     - Gas estimation before loan approval
     - Gas deducted from loan amount
     - Standard gas limits enforced
     - **Story Points:** 3

#### Epic 2: Frontend Foundation
**Story Points:** 13

**User Stories:**

6. **US-1.6: Wallet Connection**
   - **As a** user  
   - **I want** to connect my MetaMask or WalletConnect wallet  
   - **So that** I can interact with the platform
   - **Acceptance Criteria:**
     - MetaMask integration
     - WalletConnect support
     - Network switching (Sepolia/Mumbai)
     - **Story Points:** 3

7. **US-1.7: Dashboard UI**
   - **As a** user  
   - **I want** a dashboard showing my account overview  
   - **So that** I can see my balance and activity
   - **Acceptance Criteria:**
     - Material Design 3 UI
     - Responsive layout
     - Blockchain-themed visual elements
     - **Story Points:** 5

8. **US-1.8: Navigation & Layout**
   - **As a** user  
   - **I want** intuitive navigation  
   - **So that** I can access all features easily
   - **Acceptance Criteria:**
     - AppBar with wallet connection
     - Bottom navigation for mobile
     - Role-based menu items
     - **Story Points:** 3

9. **US-1.9: Blockchain Visual Elements**
   - **As a** user  
   - **I want** visual reminders that this is blockchain technology  
   - **So that** I understand the security and transparency
   - **Acceptance Criteria:**
     - Blockchain-themed animations
     - Transaction hash displays
     - Security badges
     - **Story Points:** 2

#### Epic 3: Database Schema
**Story Points:** 8

**User Stories:**

10. **US-1.10: Database Design**
    - **As a** developer  
    - **I want** a complete database schema  
    - **So that** I can store all system data
    - **Acceptance Criteria:**
      - All tables defined (see CSE370 documentation)
      - Relationships established
      - Indexes created
      - **Story Points:** 5

11. **US-1.11: Database Migration Scripts**
    - **As a** developer  
    - **I want** database migration scripts  
    - **So that** I can deploy the database easily
    - **Acceptance Criteria:**
      - Migration scripts for all tables
      - Seed data for testing
      - **Story Points:** 3

### 3.2 Sprint 1 Burndown

**Total Story Points:** 42  
**Team Velocity:** ~21 points per week (estimated)

| Day | Planned | Completed | Remaining |
|-----|---------|-----------|-----------|
| Day 1 | 0 | 0 | 42 |
| Day 3 | 14 | 12 | 30 |
| Day 5 | 21 | 20 | 22 |
| Day 7 | 28 | 27 | 15 |
| Day 10 | 35 | 35 | 7 |
| Day 14 | 42 | 42 | 0 |

### 3.3 Sprint 1 Deliverables

- ✅ Smart contracts deployed on testnet
- ✅ Basic frontend with wallet connection
- ✅ Database schema implemented
- ✅ Role-based access control working
- ✅ Dashboard UI with blockchain elements

---

## 4. Sprint 2: Lending & Payment Features
**Duration:** 2 Weeks (Weeks 3-4)  
**Sprint Goal:** Implement complete lending flow with installment payments and communication

### 4.1 Sprint Backlog

#### Epic 4: Loan Management
**Story Points:** 21

**User Stories:**

12. **US-2.1: Loan Request System**
    - **As a** borrower  
    - **I want** to request a loan from a local bank  
    - **So that** I can borrow money
    - **Acceptance Criteria:**
      - Request form with amount and purpose
      - One request per bank per user
      - Request stored on blockchain
      - **Story Points:** 5

13. **US-2.2: Loan Approval/Rejection**
    - **As a** bank user  
    - **I want** to approve or reject loan requests  
    - **So that** I can manage lending
    - **Acceptance Criteria:**
      - View pending requests
      - Approve/reject functionality
      - Only one approver per bank
      - **Story Points:** 5

14. **US-2.3: First-Time Borrower Verification**
    - **As a** bank user  
    - **I want** to review income proof documents  
    - **So that** I can verify first-time borrowers
    - **Acceptance Criteria:**
      - File upload for income proof
      - Document storage (IPFS or encrypted)
      - Approval/rejection workflow
      - **Story Points:** 5

15. **US-2.4: Borrowing Limit Calculation**
    - **As a** system  
    - **I want** to calculate borrowing limits  
    - **So that** users cannot exceed their limits
    - **Acceptance Criteria:**
      - 6-month and 1-year limit calculations
      - Transaction history tracking
      - Exception for 3+ consecutive paid loans
      - **Story Points:** 5

16. **US-2.5: Loan Request Visibility**
    - **As a** borrower  
    - **I want** my loan requests to disappear after approval  
    - **So that** I don't see duplicate requests
    - **Acceptance Criteria:**
      - Requests hidden after approval
      - Request list in borrower profile
      - **Story Points:** 1

#### Epic 5: Installment Payment System
**Story Points:** 13

**User Stories:**

17. **US-2.6: Installment Payment Logic**
    - **As a** borrower  
    - **I want** to pay loans in installments if amount >= 100 ETH  
    - **So that** I can manage large loans
    - **Acceptance Criteria:**
      - Automatic installment setup for >= 100 ETH
      - Configurable number of installments
      - Payment schedule generation
      - **Story Points:** 5

18. **US-2.7: Installment Payment Interface**
    - **As a** borrower  
    - **I want** to see and pay installments  
    - **So that** I can track my payments
    - **Acceptance Criteria:**
      - Installment list in dashboard
      - Pay installment button
      - Payment confirmation
      - **Story Points:** 5

19. **US-2.8: Deadline Tracking**
    - **As a** borrower  
    - **I want** to see payment deadlines  
    - **So that** I know when payments are due
    - **Acceptance Criteria:**
      - Deadline display in dashboard
      - Overdue warnings
      - Countdown timer
      - **Story Points:** 3

#### Epic 6: Chat System
**Story Points:** 13

**User Stories:**

20. **US-2.9: Borrower-Bank Chat**
    - **As a** borrower  
    - **I want** to chat with the bank about my loan  
    - **So that** I can ask questions
    - **Acceptance Criteria:**
      - Real-time chat interface
      - Message history
      - Read/unread status
      - **Story Points:** 8

21. **US-2.10: Chat Notifications**
    - **As a** user  
    - **I want** notifications for new messages  
    - **So that** I don't miss important communications
    - **Acceptance Criteria:**
      - Push notifications (optional)
      - In-app notifications
      - Unread message count
      - **Story Points:** 5

#### Epic 7: Profile Management
**Story Points:** 8

**User Stories:**

22. **US-2.11: User Profile Pages**
    - **As a** user  
    - **I want** a dedicated profile section  
    - **So that** I can manage my account
    - **Acceptance Criteria:**
      - Profile pages for all user types
      - Role-specific features
      - Terms and conditions page
      - **Story Points:** 5

23. **US-2.12: Terms and Conditions**
    - **As a** user  
    - **I want** to view terms and conditions  
    - **So that** I understand the platform rules
    - **Acceptance Criteria:**
      - Terms page in profile
      - Acceptance tracking
      - Version control
      - **Story Points:** 3

### 4.2 Sprint 2 Burndown

**Total Story Points:** 55  
**Team Velocity:** ~27 points per week (estimated)

| Day | Planned | Completed | Remaining |
|-----|---------|-----------|-----------|
| Day 1 | 0 | 0 | 55 |
| Day 3 | 18 | 17 | 38 |
| Day 5 | 27 | 26 | 29 |
| Day 7 | 36 | 35 | 20 |
| Day 10 | 45 | 44 | 11 |
| Day 14 | 55 | 55 | 0 |

### 4.3 Sprint 2 Deliverables

- ✅ Complete loan request and approval system
- ✅ Installment payment functionality
- ✅ Deadline tracking in dashboard
- ✅ Chat system between borrowers and banks
- ✅ Profile pages for all user types
- ✅ Terms and conditions page

---

## 5. Sprint 3: Advanced Features & Security
**Duration:** 2 Weeks (Weeks 5-6)  
**Sprint Goal:** Implement AI/ML security, market data visualization, and AI chatbot

### 5.1 Sprint Backlog

#### Epic 8: Market Data Visualization
**Story Points:** 8

**User Stories:**

24. **US-3.1: Cryptocurrency Market Data API**
    - **As a** developer  
    - **I want** to fetch live cryptocurrency prices  
    - **So that** users can see market data
    - **Acceptance Criteria:**
      - Integration with CoinGecko/CoinMarketCap API
      - Real-time price updates
      - Data caching
      - **Story Points:** 3

25. **US-3.2: Market Value Graph**
    - **As a** borrower  
    - **I want** to see a graph of cryptocurrency prices  
    - **So that** I can track market trends
    - **Acceptance Criteria:**
      - Interactive graph (Chart.js/Recharts)
      - Live updates
      - Historical data display
      - **Story Points:** 5

#### Epic 9: AI Chatbot
**Story Points:** 13

**User Stories:**

26. **US-3.3: AI Chatbot Integration**
    - **As a** user  
    - **I want** to ask an AI chatbot questions  
    - **So that** I can get instant help
    - **Acceptance Criteria:**
      - Chatbot interface
      - Natural language processing
      - Context-aware responses
      - **Story Points:** 5

27. **US-3.4: Chatbot Training Data**
    - **As a** developer  
    - **I want** to train the chatbot  
    - **So that** it can answer common questions
    - **Acceptance Criteria:**
      - Training dataset
      - Intent recognition
      - Response generation
      - **Story Points:** 5

28. **US-3.5: Chatbot Features**
    - **As a** user  
    - **I want** the chatbot to answer questions about loan limits and payments  
    - **So that** I can get quick information
    - **Acceptance Criteria:**
      - "What is my loan limit?" query
      - "How much do I owe this month?" query
      - "Which bank should I contact?" query
      - **Story Points:** 3

#### Epic 10: AI/ML Security Layer
**Story Points:** 21

**User Stories:**

29. **US-3.6: Data Collection for ML**
    - **As a** developer  
    - **I want** to collect transaction data  
    - **So that** ML models can be trained
    - **Acceptance Criteria:**
      - Transaction logging
      - Feature extraction
      - Data pipeline
      - **Story Points:** 5

30. **US-3.7: Fraud Detection Model**
    - **As a** system  
    - **I want** to detect fraudulent loan requests  
    - **So that** I can protect the platform
    - **Acceptance Criteria:**
      - ML model for fraud detection
      - Risk scoring
      - Integration with loan approval
      - **Story Points:** 8

31. **US-3.8: Anomaly Detection**
    - **As a** system  
    - **I want** to detect anomalous transactions  
    - **So that** I can identify suspicious activity
    - **Acceptance Criteria:**
      - Anomaly detection algorithm
      - Alert system
      - Dashboard visualization
      - **Story Points:** 5

32. **US-3.9: Security Logging**
    - **As a** developer  
    - **I want** to log all security events  
    - **So that** I can monitor and improve security
    - **Acceptance Criteria:**
      - Security log table
      - Event tracking
      - Dashboard for bank users
      - **Story Points:** 3

#### Epic 11: Testing & Quality Assurance
**Story Points:** 13

**User Stories:**

33. **US-3.10: Unit Testing**
    - **As a** developer  
    - **I want** unit tests for all smart contracts  
    - **So that** I can ensure code quality
    - **Acceptance Criteria:**
      - Test coverage > 80%
      - All critical functions tested
      - **Story Points:** 5

34. **US-3.11: Integration Testing**
    - **As a** developer  
    - **I want** integration tests  
    - **So that** I can verify system components work together
    - **Acceptance Criteria:**
      - End-to-end test scenarios
      - API integration tests
      - **Story Points:** 5

35. **US-3.12: Security Testing**
    - **As a** developer  
    - **I want** security audits  
    - **So that** I can identify vulnerabilities
    - **Acceptance Criteria:**
      - Smart contract audit
      - Penetration testing
      - **Story Points:** 3

### 5.2 Sprint 3 Burndown

**Total Story Points:** 55  
**Team Velocity:** ~27 points per week (estimated)

| Day | Planned | Completed | Remaining |
|-----|---------|-----------|-----------|
| Day 1 | 0 | 0 | 55 |
| Day 3 | 18 | 17 | 38 |
| Day 5 | 27 | 26 | 29 |
| Day 7 | 36 | 35 | 20 |
| Day 10 | 45 | 44 | 11 |
| Day 14 | 55 | 55 | 0 |

### 5.3 Sprint 3 Deliverables

- ✅ Live cryptocurrency market data visualization
- ✅ AI chatbot for user support
- ✅ AI/ML security layer foundation
- ✅ Comprehensive testing suite
- ✅ Security audit completed

---

## 6. Integration & Testing Phase
**Duration:** 1 Week (Week 7)

### 6.1 Activities

1. **System Integration**
   - Integrate all sprint deliverables
   - Resolve integration issues
   - Performance optimization

2. **End-to-End Testing**
   - Complete user journey testing
   - Cross-browser testing
   - Mobile responsiveness testing

3. **Bug Fixing**
   - Fix critical bugs
   - Address security vulnerabilities
   - Performance improvements

4. **Documentation**
   - Update technical documentation
   - User guides
   - API documentation

### 6.2 Testing Checklist

- [ ] Smart contract functionality
- [ ] Frontend-backend integration
- [ ] Database operations
- [ ] Chat system real-time communication
- [ ] Installment payment flow
- [ ] AI chatbot responses
- [ ] Market data updates
- [ ] Security layer monitoring
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

---

## 7. Deployment & Release Phase
**Duration:** 1 Week (Week 8)

### 7.1 Deployment Activities

1. **Production Deployment**
   - Deploy smart contracts to mainnet (or testnet)
   - Deploy frontend to production server
   - Database migration to production

2. **Monitoring Setup**
   - Application monitoring (Sentry, LogRocket)
   - Blockchain monitoring (The Graph, Alchemy)
   - Performance monitoring

3. **Final Documentation**
   - Complete all course documentation
   - User manual
   - Developer guide

### 7.2 Release Checklist

- [ ] All features implemented
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Documentation complete
- [ ] Production deployment successful
- [ ] Monitoring active
- [ ] User training completed

---

## 8. Agile Artifacts

### 8.1 Product Backlog

The complete product backlog includes all user stories from all sprints, plus additional items for future releases:

**Future Features (Post-MVP):**
- Multi-cryptocurrency support
- Advanced ML models (LSTM, Transformer)
- Mobile apps (iOS/Android)
- Internationalization (i18n)
- Advanced analytics dashboard
- Automated loan approval using ML
- Credit scoring system

### 8.2 Sprint Backlog

Each sprint has its own backlog (detailed in sections 3, 4, and 5).

### 8.3 Definition of Done

A user story is considered "Done" when:
- ✅ Code is written and reviewed
- ✅ Unit tests are written and passing
- ✅ Integration tests are passing
- ✅ Documentation is updated
- ✅ Code is merged to main branch
- ✅ Feature is deployed to staging
- ✅ Product Owner has accepted the story

### 8.4 Definition of Ready

A user story is "Ready" for sprint planning when:
- ✅ User story is clearly written
- ✅ Acceptance criteria are defined
- ✅ Story points are estimated
- ✅ Dependencies are identified
- ✅ Technical feasibility is confirmed

---

## 9. Team Roles & Responsibilities

### 9.1 Scrum Team Structure

| Role | Responsibilities | Count |
|------|------------------|-------|
| **Product Owner** | Backlog management, stakeholder communication | 1 |
| **Scrum Master** | Facilitate sprints, remove impediments | 1 |
| **Blockchain Developer** | Smart contract development | 2 |
| **Frontend Developer** | React/TypeScript UI development | 2 |
| **Backend Developer** | API, database, ML integration | 1 |
| **ML Engineer** | AI/ML model development | 1 |
| **QA Engineer** | Testing, quality assurance | 1 |

**Total Team Size:** 9 members

### 9.2 Daily Standup Format

**Time:** 15 minutes  
**Format:**
1. What did I complete yesterday?
2. What will I work on today?
3. Are there any blockers?

---

## 10. Risk Management

### 10.1 Identified Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Smart contract vulnerabilities | Medium | High | Security audit, extensive testing |
| Gas cost fluctuations | High | Medium | Gas optimization, cost estimation |
| ML model accuracy | Medium | Medium | Continuous training, human review |
| Integration complexity | Medium | High | Early integration, frequent testing |
| Scope creep | High | Medium | Strict sprint boundaries, backlog management |
| Team member unavailability | Low | High | Cross-training, documentation |

### 10.2 Risk Response Plan

- **High Priority Risks:** Weekly review and mitigation
- **Medium Priority Risks:** Bi-weekly review
- **Low Priority Risks:** Monthly review

---

## 11. Metrics & KPIs

### 11.1 Sprint Metrics

- **Velocity:** Story points completed per sprint
- **Burndown:** Progress tracking
- **Sprint Goal Achievement:** % of sprint goal met

### 11.2 Quality Metrics

- **Test Coverage:** > 80%
- **Bug Density:** < 5 bugs per 1000 lines of code
- **Code Review Coverage:** 100%

### 11.3 Performance Metrics

- **Page Load Time:** < 2 seconds
- **Transaction Confirmation:** < 30 seconds
- **API Response Time:** < 500ms

---

## 12. Communication Plan

### 12.1 Communication Channels

- **Daily Standups:** 15 minutes, every day
- **Sprint Planning:** 2 hours, start of sprint
- **Sprint Review:** 1 hour, end of sprint
- **Retrospective:** 1 hour, end of sprint
- **Stakeholder Updates:** Weekly

### 12.2 Tools

- **Project Management:** Jira/Trello
- **Version Control:** GitHub
- **Communication:** Slack/Discord
- **Documentation:** Confluence/Notion
- **CI/CD:** GitHub Actions

---

## 13. Conclusion

This Agile development plan provides a structured approach to building the Crypto World Bank platform over 2 months with 3 sprints. The methodology ensures:

- ✅ Incremental delivery of features
- ✅ Continuous feedback and improvement
- ✅ Risk mitigation through early testing
- ✅ Team collaboration and communication
- ✅ Quality assurance throughout development

The plan is flexible and can be adjusted based on team velocity and changing requirements.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** Software Engineering Team  
**Course:** CSE470 - Software Engineering

