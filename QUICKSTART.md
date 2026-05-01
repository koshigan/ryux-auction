# 🚀 QUICK START GUIDE - BidStorm Auction App

## ⚡ 5-Minute Setup

### Step 1: Install MySQL (if not already installed)
```bash
# macOS
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql

# Windows
# Download and install from: https://dev.mysql.com/downloads/installer/
```

### Step 2: Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Copy-paste the entire content of backend/config/schema.sql
# Or run:
source backend/config/schema.sql
```

### Step 3: Configure Backend
```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your MySQL password
# Change SESSION_SECRET to a random string
nano .env  # or use any text editor
```

### Step 4: Install & Run
```bash
# Install dependencies
npm install

# Start server
npm run dev
```

### Step 5: Open Browser
Navigate to: **http://localhost:3000**

---

## 🎮 First Auction in 2 Minutes

1. **Register** an account (takes 10 seconds)
2. Click **"Create Auction Room"**
   - Name: "My First Auction"
   - Budget: 1000
   - Timer: 30s
   - Click Create
3. **Add Players:**
   - Use the sample CSV provided: `sample-players.csv`
   - Click "📁 Import CSV" → Select file → Done!
4. **Start Auction:**
   - Click "▶ Start Auction"
   - Place bids using quick buttons
   - Watch the timer countdown!

---

## 🧪 Test with Multiple Users

**Option 1: Multiple Browser Windows**
- Open incognito/private window
- Register new user
- Join room with code
- Bid against yourself!

**Option 2: Multiple Devices**
- Open on phone: http://YOUR_COMPUTER_IP:3000
- Join same room code
- Real-time bidding across devices!

---

## 🐛 Quick Troubleshooting

**Can't connect to MySQL?**
```bash
# Check if MySQL is running
sudo service mysql status

# Reset root password if needed
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'newpassword';
```

**Port 3000 already in use?**
```bash
# Change port in backend/.env
PORT=3001
```

**Session keeps logging out?**
- Sessions are in-memory (cleared on server restart)
- Normal during development!

---

## 📁 Key Files

- **backend/server.js** - Main server entry
- **backend/config/schema.sql** - Database setup
- **backend/.env** - Your configuration (create from .env.example)
- **frontend/pages/room.html** - Main auction page

---

## 🎯 Default Credentials

No default credentials! Register your own account.

**Test Room Settings:**
- Budget: 🪙1000
- Timer: 30 seconds
- Quick bids: +10, +25, +50, +100

---

## ⚙️ Common Commands

```bash
# Start development server
cd backend && npm run dev

# Start production server
cd backend && npm start

# Reset database
mysql -u root -p auction_db < config/schema.sql

# View logs
# Server logs appear in terminal where you ran npm run dev

# Stop server
# Press Ctrl+C in terminal
```

---

## 🎨 Customization

**Change theme colors:**
Edit `frontend/css/style.css` → `:root` variables

**Change starting budget:**
In Create Room modal → Starting Budget field

**Change bid increments:**
Edit `frontend/pages/room.html` → Line ~390 → `quickBids` array

---

**That's it! You're ready to auction! 🏆**

Need help? Check the full README.md for detailed documentation.
