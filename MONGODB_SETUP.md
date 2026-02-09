# MongoDB Setup Guide

The backend has been converted to use MongoDB instead of MySQL for easier offline testing.

## Quick Setup

### 1. Install MongoDB (if not already installed)

**Windows:**
```powershell
winget install MongoDB.Server
```

Or download from: https://www.mongodb.com/try/download/community

### 2. Start MongoDB Service

**Windows:**
```powershell
# Check if MongoDB service exists
Get-Service *mongo*

# Start MongoDB (service name might be MongoDB or MongoDB Server)
net start MongoDB
# or
Start-Service MongoDB
```

**Manual Start (if service not configured):**
```powershell
# Navigate to MongoDB bin directory (usually C:\Program Files\MongoDB\Server\<version>\bin)
mongod --dbpath "C:\data\db"
```

### 3. Configure Backend

Create `backend/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=crypto_world_bank
PORT=3001
JWT_SECRET=dev-secret
```

### 4. Install Dependencies

```powershell
cd backend
npm install
```

### 5. Run Migrations and Seed

```powershell
# Create indexes
npm run migrate

# Seed demo data (197 countries, 985 local banks, 1M ETH world bank)
npm run seed
```

Expected output:
```
✅ MongoDB connected successfully
🔄 Starting database migration (MongoDB indexes)...
✅ Migration completed successfully!
🌱 Starting database seeding...
✅ Created World Bank with 1,000,000 ETH reserve
✅ Seeded national bank for Afghanistan with 5 local banks...
...
✅ Seeding completed!
📝 Demo Balances:
   - Crypto World Bank: 1,000,000 ETH (off-chain demo value)
   - Each National Bank: 100 ETH
   - Each Local Bank: 10 ETH
📊 Total: 197 National Banks, 985 Local Banks
```

### 6. Start Backend Server

```powershell
npm run dev
```

Server will run on `http://localhost:3001`

## Verify Setup

Test the API:
```powershell
curl http://localhost:3001/health
# Should return: {"status":"ok","database":"connected"}

curl http://localhost:3001/api/banks/world
# Should return World Bank with 1,000,000 ETH

curl http://localhost:3001/api/banks/national
# Should return array of 197 national banks
```

## MongoDB Collections Created

- `world_banks` - 1 document (Crypto World Bank with 1M ETH)
- `national_banks` - 197 documents (one per country, 100 ETH each)
- `local_banks` - 985 documents (5 per country, 10 ETH each)
- `borrowers` - Empty (will be populated when users register)
- `bank_users` - Empty (will be populated when bank users register)
- `loan_requests` - Empty (will be populated when loans are created)
- `transactions` - Empty (will be populated with loan transactions)
- `installments` - Empty (for future installment payments)
- `chat_messages` - Empty (for future chat system)
- `borrowing_limits` - Empty (calculated limits for borrowers)

## Benefits of MongoDB for Testing

✅ **No complex SQL setup** - Just start MongoDB service  
✅ **Easy to reset** - Drop database and re-seed anytime  
✅ **Flexible schema** - Easy to add new fields  
✅ **Already installed** - You mentioned MongoDB is already on your system  
✅ **Works offline** - No external database server needed  

## Reset Database

To clear and re-seed:
```powershell
# Connect to MongoDB shell
mongosh

# Switch to database
use crypto_world_bank

# Drop all collections (optional - seed script handles upserts)
db.dropDatabase()

# Exit
exit

# Re-run seed
npm run seed
```

## Troubleshooting

**MongoDB not starting:**
- Check if port 27017 is already in use
- Verify MongoDB service is installed
- Check MongoDB logs in `C:\Program Files\MongoDB\Server\<version>\log\`

**Connection refused:**
- Ensure MongoDB service is running
- Check `MONGODB_URI` in `.env` file
- Try `mongodb://127.0.0.1:27017` instead of `localhost`

**Seed script fails:**
- Ensure MongoDB is running
- Check database connection in `connection.js`
- Verify `.env` file exists with correct values

---

**Ready to test!** You can now use the frontend without any MetaMask accounts. All demo data is seeded in MongoDB.

