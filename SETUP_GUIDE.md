# Crypto World Bank - Setup Guide for 2 MetaMask Accounts

This guide will help you set up the project with 2 MetaMask accounts for testing Sprint 1 features.

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ installed and running
- [ ] MetaMask browser extension installed
- [ ] Git (optional, for cloning)

## 🗄️ Step 1: Database Setup

### 1.1 Create Database

```bash
# Open MySQL command line
mysql -u root -p

# Create database
CREATE DATABASE crypto_world_bank;
exit
```

### 1.2 Configure Backend Database

```bash
cd backend

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crypto_world_bank
PORT=3001
JWT_SECRET=your-secret-key-here
EOF

# Install dependencies
npm install

# Run migrations and seed data
npm run setup
```

Expected output:
```
✅ Database connected successfully
🔄 Starting database migration...
✅ Migration completed successfully!
🌱 Starting database seeding...
✅ Created National Bank: 1
✅ Created Local Bank: 1
✅ Seeding completed!
```

## 🔧 Step 2: Backend Server

```bash
cd backend

# Start development server
npm run dev
```

You should see:
```
🚀 Backend server running on port 3001
📊 Health check: http://localhost:3001/health
```

Test the API:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","database":"connected"}
```

## ⛓️ Step 3: Smart Contracts

### 3.1 Install Dependencies

```bash
# From project root
npm install
```

### 3.2 Configure Hardhat

Create `.env` file in project root:

```bash
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com/
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
POLYGONSCAN_API_KEY=your_polygonscan_key
ETHERSCAN_API_KEY=your_etherscan_key
EOF
```

### 3.3 Compile Contracts

```bash
npm run compile
```

### 3.4 Deploy Contracts

**Option A: Deploy to Mumbai Testnet (Recommended)**

```bash
npm run deploy:mumbai
```

**Option B: Deploy to Sepolia Testnet**

```bash
npm run deploy:sepolia
```

After deployment, note the contract addresses and update frontend `.env`.

### 3.5 Copy ABIs

```bash
npm run copy-abi
```

## 🎨 Step 4: Frontend Setup

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

### 4.2 Configure Environment

Create `frontend/.env`:

```bash
cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3001/api
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
EOF
```

**To get WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.com/
2. Sign up/login
3. Create a new project
4. Copy the Project ID

### 4.3 Start Frontend

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🦊 Step 5: MetaMask Configuration

### 5.1 Setup Account 1 (World Bank Admin / Bank User)

1. **Open MetaMask** and ensure you're on the correct testnet:
   - Click network dropdown
   - Select "Add Network" or "Add a network manually"

2. **Add Mumbai Testnet:**
   - Network Name: `Mumbai Testnet`
   - RPC URL: `https://rpc-mumbai.maticvigil.com/`
   - Chain ID: `80001`
   - Currency Symbol: `MATIC`
   - Block Explorer: `https://mumbai.polygonscan.com`

3. **Get Test MATIC:**
   - Visit: https://faucet.polygon.technology/
   - Enter Account 1 address
   - Request test tokens

4. **Save Account 1 Details:**
   - Address: `0x...` (copy this)
   - This will be your World Bank admin or bank user account

### 5.2 Setup Account 2 (Borrower)

1. **Create Second Account in MetaMask:**
   - Click account icon (top right)
   - Select "Create Account"
   - Name it "Borrower Account"

2. **Switch to Mumbai Testnet** (same network as Account 1)

3. **Get Test MATIC for Account 2:**
   - Visit: https://faucet.polygon.technology/
   - Enter Account 2 address
   - Request test tokens

4. **Save Account 2 Details:**
   - Address: `0x...` (copy this)
   - This will be your borrower account

### 5.3 Switch Between Accounts

- Click the account icon in MetaMask
- Select the account you want to use
- The frontend will automatically detect the connected account

## 🧪 Step 6: Testing with 2 Accounts

### Test Flow 1: Register as Bank User (Account 1)

1. Connect **Account 1** in MetaMask
2. Open frontend: http://localhost:5173
3. Click "Connect Wallet" (if not connected)
4. Navigate to `/register`
5. Select "Bank User"
6. Fill in:
   - Name: "Bank Admin"
   - Email: "admin@bank.com"
   - Bank Type: "Local Bank"
   - Local Bank: Select "New York Local Bank"
   - Role: "Approver"
7. Click "Register"
8. You should see success message

### Test Flow 2: Register as Borrower (Account 2)

1. **Switch to Account 2** in MetaMask
2. Refresh the frontend page
3. Navigate to `/register`
4. Select "Borrower"
5. Fill in:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Country: "US"
   - City: "New York"
6. Click "Register"
7. You should see success message

### Test Flow 3: View Dashboard

1. With **Account 2** connected, go to Dashboard (`/`)
2. You should see:
   - Account Type: Borrower
   - Your name displayed
   - Deposit and Request Loan buttons

3. Switch to **Account 1** and refresh
4. You should see:
   - Account Type: Bank User
   - Bank admin features

## 🔍 Verification Checklist

- [ ] Backend server running on port 3001
- [ ] Database connected and migrated
- [ ] Frontend running on port 5173
- [ ] Smart contracts deployed
- [ ] Account 1 has test tokens
- [ ] Account 2 has test tokens
- [ ] Account 1 registered as bank user
- [ ] Account 2 registered as borrower
- [ ] Can switch between accounts in MetaMask
- [ ] Dashboard shows correct account type for each account

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Verify .env file has correct credentials
cat backend/.env
```

### Contract Not Found

- Verify contract address in `frontend/.env`
- Ensure contract is deployed to the same network as MetaMask
- Check network in MetaMask matches deployment network

### Wallet Not Connecting

- Ensure MetaMask is unlocked
- Check if popup is blocked
- Try refreshing the page
- Clear browser cache

### API Errors

- Verify backend is running: `curl http://localhost:3001/health`
- Check CORS settings in backend
- Verify API URL in frontend `.env`

## 📞 Next Steps

After completing setup:

1. **Test Deposit:** Use Account 2 to deposit to World Bank Reserve
2. **Test Loan Request:** Use Account 2 to request a loan
3. **Test Loan Approval:** Use Account 1 to approve the loan
4. **Explore Dashboard:** Check all features for both account types

## 📚 Additional Resources

- [MetaMask Documentation](https://docs.metamask.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs/introduction)

---

**Happy Testing! 🚀**

