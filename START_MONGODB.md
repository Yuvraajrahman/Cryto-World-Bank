# How to Install and Start MongoDB on Windows

## Option 1: Install MongoDB Community Server (Recommended)

### Step 1: Install MongoDB

**Using winget (PowerShell as Administrator):**
```powershell
winget install MongoDB.Server
```

**Or download manually:**
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (8.0.x)
   - Platform: Windows
   - Package: MSI
3. Download and run the installer
4. Choose "Complete" installation
5. **Important:** Check "Install MongoDB as a Service" during installation
6. Complete the installation

### Step 2: Start MongoDB Service

After installation, MongoDB should be installed as a Windows service.

**Check if service exists:**
```powershell
Get-Service *mongo*
```

**Start MongoDB service:**
```powershell
# If service name is "MongoDB"
net start MongoDB

# Or using PowerShell cmdlet
Start-Service MongoDB
```

**Verify it's running:**
```powershell
Get-Service MongoDB
# Status should show "Running"
```

### Step 3: Test Connection

```powershell
# Connect to MongoDB shell
mongosh

# Or if mongosh is not available:
mongo

# You should see MongoDB shell prompt
# Type: exit to leave
```

---

## Option 2: Install MongoDB via Chocolatey

If you have Chocolatey installed:

```powershell
choco install mongodb
```

Then start the service:
```powershell
net start MongoDB
```

---

## Option 3: Run MongoDB Manually (Without Service)

If MongoDB is installed but not as a service:

### Step 1: Create Data Directory

```powershell
# Create data directory
New-Item -ItemType Directory -Force -Path "C:\data\db"
```

### Step 2: Start MongoDB Manually

```powershell
# Navigate to MongoDB bin directory (adjust version number)
cd "C:\Program Files\MongoDB\Server\8.0\bin"

# Start MongoDB
.\mongod.exe --dbpath "C:\data\db"
```

**Note:** Keep this PowerShell window open while using MongoDB. Close it to stop MongoDB.

---

## Quick Start Commands (After Installation)

### Check MongoDB Status
```powershell
Get-Service MongoDB
```

### Start MongoDB
```powershell
net start MongoDB
```

### Stop MongoDB
```powershell
net stop MongoDB
```

### Restart MongoDB
```powershell
net stop MongoDB
net start MongoDB
```

### Test Connection
```powershell
mongosh
# or
mongo
```

---

## Verify MongoDB is Working

After starting MongoDB, test it:

```powershell
# Option 1: Using mongosh
mongosh
# Should connect and show: "Current Mongosh Log ID: ..."

# Option 2: Test from Node.js (in your backend folder)
cd backend
node -e "const { MongoClient } = require('mongodb'); (async () => { const client = new MongoClient('mongodb://localhost:27017'); await client.connect(); console.log('✅ Connected!'); await client.close(); })()"
```

---

## Troubleshooting

### "Service name is invalid"
- MongoDB service might not be installed
- Install MongoDB with "Install as Service" option checked
- Or run MongoDB manually (Option 3)

### "Port 27017 already in use"
- Another MongoDB instance might be running
- Check: `netstat -ano | findstr :27017`
- Stop the existing process or use a different port

### "mongod.exe not found"
- MongoDB might not be in PATH
- Use full path: `"C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe"`
- Or add MongoDB bin to your PATH environment variable

### "Access Denied"
- Run PowerShell as Administrator
- Or check MongoDB service permissions

---

## After MongoDB is Running

Once MongoDB is started, you can:

1. **Run migrations:**
   ```powershell
   cd backend
   npm run migrate
   ```

2. **Seed the database:**
   ```powershell
   npm run seed
   ```

3. **Start your backend:**
   ```powershell
   npm run dev
   ```

---

## Default MongoDB Settings

- **Host:** localhost
- **Port:** 27017
- **Data Directory:** C:\data\db (or as configured)
- **Log Directory:** C:\Program Files\MongoDB\Server\<version>\log\

---

**Need help?** Check MongoDB logs in: `C:\Program Files\MongoDB\Server\<version>\log\mongod.log`

