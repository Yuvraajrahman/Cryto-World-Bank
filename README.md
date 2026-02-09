# Crypto World Bank - Sprint 1 Implementation

A decentralized lending platform built on blockchain technology with a hierarchical banking structure (World Bank → National Banks → Local Banks → Users).

## 🏗️ Project Structure

```
Cryto-World-Bank/
├── contracts/              # Smart contracts (Solidity)
│   ├── WorldBankReserve.sol
│   ├── NationalBank.sol
│   └── LocalBank.sol
├── backend/               # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── server.js
│   │   ├── database/
│   │   │   ├── connection.js
│   │   │   ├── schema.sql
│   │   │   └── migrate.js
│   │   └── routes/
│   │       ├── users.js
│   │       ├── banks.js
│   │       ├── loans.js
│   │       └── transactions.js
│   └── package.json
├── frontend/              # Frontend (React/TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── config/
│   └── package.json
└── Documentation/         # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- MetaMask browser extension
- Hardhat (for smart contract development)

### 1. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE crypto_world_bank;
exit

# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migrate
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
# Server runs on http://localhost:3001
```

### 3. Smart Contracts Setup

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy to testnet (Mumbai or Sepolia)
# Update .env with your private key and RPC URLs
npm run deploy:mumbai
# or
npm run deploy:sepolia

# Copy ABI to frontend
npm run copy-abi
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001/api" > .env
echo "VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress" >> .env
echo "VITE_WALLETCONNECT_PROJECT_ID=your-project-id" >> .env

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

## 🔐 MetaMask Configuration for 2 Accounts

### Account 1: World Bank Admin / Bank User

1. Open MetaMask
2. Create or import account (Account 1)
3. Add testnet network:
   - **Mumbai Testnet:**
     - Network Name: Mumbai Testnet
     - RPC URL: https://rpc-mumbai.maticvigil.com/
     - Chain ID: 80001
     - Currency Symbol: MATIC
   - **Sepolia Testnet:**
     - Network Name: Sepolia
     - RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
     - Chain ID: 11155111
     - Currency Symbol: ETH
4. Get test tokens from faucets:
   - Mumbai: https://faucet.polygon.technology/
   - Sepolia: https://sepoliafaucet.com/

### Account 2: Borrower

1. In MetaMask, click account icon → Create Account (Account 2)
2. Switch to the same testnet network
3. Get test tokens for this account too

### Using Both Accounts

- Switch between accounts in MetaMask using the account dropdown
- Account 1 can be used as World Bank admin or bank user
- Account 2 can be used as a borrower
- Both accounts can interact with the same deployed contracts

## 📋 Sprint 1 Features Completed

### ✅ Smart Contracts
- [x] World Bank Reserve contract with hierarchical structure
- [x] National Bank contract
- [x] Local Bank contract
- [x] Role-based access control
- [x] Deposit and lending functions

### ✅ Backend
- [x] Express.js server setup
- [x] MySQL database schema (all 15 tables)
- [x] Database migration scripts
- [x] REST API endpoints:
  - User registration and management
  - Bank management (World, National, Local)
  - Loan request and approval
  - Transaction tracking

### ✅ Frontend
- [x] Wallet connection (MetaMask/WalletConnect)
- [x] Dashboard UI with blockchain elements
- [x] Navigation and layout
- [x] User registration flow
- [x] Account overview

## 🔌 API Endpoints

### Users
- `GET /api/users/:walletAddress` - Get user by wallet
- `POST /api/users/borrower` - Register borrower
- `POST /api/users/bank-user` - Register bank user

### Banks
- `GET /api/banks/world` - Get World Bank info
- `GET /api/banks/national` - Get all national banks
- `GET /api/banks/local` - Get all local banks
- `POST /api/banks/national` - Register national bank
- `POST /api/banks/local` - Register local bank

### Loans
- `GET /api/loans/borrower/:walletAddress` - Get borrower loans
- `GET /api/loans/pending/:localBankId` - Get pending loans
- `POST /api/loans/request` - Create loan request
- `POST /api/loans/approve/:loanId` - Approve loan
- `POST /api/loans/reject/:loanId` - Reject loan

### Transactions
- `GET /api/transactions/borrower/:walletAddress` - Get transactions
- `GET /api/transactions/limits/:walletAddress` - Get borrowing limits

## 🧪 Testing

### Test Smart Contracts
```bash
npm test
```

### Test Backend API
```bash
cd backend
# Use Postman or curl to test endpoints
curl http://localhost:3001/api/health
```

## 📝 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=crypto_world_bank
PORT=3001
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

### Hardhat (.env)
```
PRIVATE_KEY=your_private_key
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com/
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
POLYGONSCAN_API_KEY=your_key
ETHERSCAN_API_KEY=your_key
```

## 🎯 Next Steps (Sprint 2)

- Loan request and approval system
- Installment payment functionality
- Chat system between borrowers and banks
- Profile management pages
- Terms and conditions

## 📚 Documentation

See the `Documentation/` folder for:
- Database schema (CSE370_DATABASE_MANAGEMENT.md)
- Software engineering plan (CSE470_SOFTWARE_ENGINEERING.md)
- System flows and use cases

## 🤝 Contributing

This is a course project. Follow the sprint structure outlined in the documentation.

## 📄 License

MIT License

