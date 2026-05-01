# 🎯 BidStorm - Live Player Auction Platform

A full-stack real-time auction system where users can create rooms, invite friends, and conduct live player auctions (IPL-style bidding) with WebSocket-powered instant updates.

---

## 🚀 Features

### 🔐 User Authentication
- Secure registration & login with bcrypt password hashing
- Session-based authentication with express-session
- Auto-login after registration

### 🏟️ Auction Rooms
- Create public or private auction rooms
- Unique 6-character room codes for easy sharing
- Host controls: start, pause, skip, end auction
- Customizable per-room settings (budget, timer duration)

### 👥 Participant Management
- Users join rooms via code or public listing
- Real-time participant list with budget tracking
- Live leaderboard showing players bought and coins spent

### 🎮 Player Management
- Add players manually (name, category, base price, image)
- Bulk import via CSV upload
- Edit/delete players before auction starts
- Visual queue showing auction order

### ⚡ Real-time Auction Engine
- WebSocket-powered live bidding via Socket.io
- Per-player countdown timer with visual ring display
- Auto-increment quick bid buttons
- Custom bid amount input
- Sound effects for bids and sales
- Budget validation (no overbidding)
- Highest bidder display with live updates

### 💰 Team & Budget System
- Each user gets virtual coins (customizable per room)
- Budget deducted on successful purchase
- Team summary showing purchased players
- Prevent bidding beyond available budget

### 📊 Leaderboard & Stats
- Live participant rankings
- Total spent, players bought, budget remaining
- Auction history page with past performance

### 💬 In-Room Chat
- Real-time chat during auctions
- Message persistence in database
- Emoji avatar support

### 🎨 UI/UX Features
- Dark/Light theme toggle (persisted in localStorage)
- Industrial-luxury auction house design
- Responsive grid layouts for mobile/tablet/desktop
- Smooth animations and transitions
- Toast notifications for events
- SOLD overlay with celebration effects
- Loading states and empty state messages

---

## 📁 Project Structure

```
auction-app/
├── backend/
│   ├── config/
│   │   ├── db.js              # MySQL connection pool
│   │   └── schema.sql         # Database setup script
│   ├── middleware/
│   │   ├── auth.js            # Session authentication
│   │   └── validate.js        # Input validation helpers
│   ├── routes/
│   │   ├── auth.js            # Register, login, logout
│   │   ├── rooms.js           # Create/join/list rooms
│   │   ├── players.js         # Add/edit/delete/upload players
│   │   └── auction.js         # Bids, leaderboard, history, chat
│   ├── utils/
│   │   └── auctionSocket.js   # Socket.io auction engine
│   ├── server.js              # Express app entry point
│   ├── package.json
│   └── .env.example           # Environment variables template
│
└── frontend/
    ├── css/
    │   └── style.css          # Main stylesheet (dark/light themes)
    ├── js/
    │   └── utils.js           # Shared utilities (API, toast, theme)
    └── pages/
        ├── login.html         # Login page
        ├── register.html      # Registration page
        ├── dashboard.html     # Main hub (create/join rooms)
        ├── room.html          # Live auction room
        └── history.html       # Auction history
```

---

## 🛠️ Tech Stack

**Frontend:**
- Pure HTML, CSS, JavaScript (no frameworks)
- Socket.io Client for WebSockets
- Google Fonts (Playfair Display + DM Sans)
- Custom CSS variables for theming

**Backend:**
- Node.js + Express
- Socket.io for real-time bidding
- MySQL (mysql2 driver with promises)
- express-session for authentication
- bcryptjs for password hashing
- multer for CSV file upload
- csv-parse for CSV processing

**Database:**
- MySQL 5.7+ or 8.0+

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** v16+ and npm
- **MySQL** 5.7+ or 8.0+

### Step 1: Clone/Download Project
```bash
# If you have this as a zip, extract it
# Or clone from repository
cd auction-app
```

### Step 2: Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Run the schema file to create database and tables
mysql -u root -p < backend/config/schema.sql

# Or manually copy-paste the SQL from schema.sql into MySQL console
```

This creates:
- Database: `auction_db`
- Tables: users, rooms, room_participants, players, bids, teams, chat_messages

### Step 3: Backend Configuration
```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your MySQL credentials
# Required fields:
# DB_HOST=localhost
# DB_USER=root
# DB_PASS=your_mysql_password
# DB_NAME=auction_db
# SESSION_SECRET=change-to-long-random-string
```

### Step 4: Install Dependencies
```bash
# Still in backend/ folder
npm install
```

This installs:
- express, socket.io, mysql2, bcryptjs, express-session
- multer, csv-parse, cors, dotenv, uuid

### Step 5: Start Backend Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

Server runs at: **http://localhost:3000**

You should see:
```
🚀 Auction Server running at http://localhost:3000
✅ MySQL connected successfully
```

---

## 🎮 Usage Guide

### For First-Time Users

1. **Open Browser:** Navigate to `http://localhost:3000`

2. **Register Account:**
   - Click "Register here"
   - Enter name, email, password (min. 6 chars)
   - You'll be auto-logged in and redirected to dashboard

3. **Create Auction Room:**
   - Click "⚡ Create Auction Room"
   - Set room name (e.g. "IPL Fantasy 2025")
   - Choose starting budget (default: 🪙1000)
   - Set bid timer in seconds (default: 30s)
   - Choose public (listed) or private (invite-only)
   - Click "Create Room"

4. **Add Players:**
   - In the room page, scroll to "➕ Add Player" section (host only)
   - **Manual Entry:** Fill name, category, base price, image URL → Add Player
   - **CSV Import:** Click "📁 Import CSV" and select a CSV file
     - CSV format: `name,category,base_price,image_url`
     - Example: `Virat Kohli,Batsman,100,https://example.com/virat.jpg`

5. **Invite Friends:**
   - Share the 6-character room code displayed in the top-right card
   - Friends can join via "🔗 Join with Code" on dashboard
   - Or share the direct room URL

6. **Start Auction:**
   - Host clicks "▶ Start Auction"
   - First player appears with countdown timer
   - Participants place bids using quick buttons or custom amount
   - Timer resets (+5s bonus) on each new bid
   - When timer hits 0, player is SOLD to highest bidder
   - Continues automatically to next player

7. **Host Controls During Auction:**
   - **⏸ Pause/Resume:** Freeze the timer temporarily
   - **⏭ Skip:** Move to next player without sale
   - **⏹ End:** Terminate auction immediately

8. **View Results:**
   - Check leaderboard in right sidebar for live standings
   - After auction ends, visit "📜 History" page to see all past auctions

---

## 🔧 Configuration Options

### Room Settings
- **Budget per User:** 100 - 100,000 coins (default: 1000)
- **Bid Timer:** 10 - 120 seconds (default: 30s)
- **Visibility:** Public (anyone can join) or Private (code only)

### Database Settings
Edit `backend/.env`:
```env
DB_HOST=localhost        # MySQL host
DB_USER=root             # MySQL username
DB_PASS=yourpassword     # MySQL password
DB_NAME=auction_db       # Database name
PORT=3000                # Server port
SESSION_SECRET=random123 # Change to secure random string
```

### Theme
Users can toggle between dark/light modes via navbar toggle button. Preference saved in browser localStorage.

---

## 📸 Sample CSV Format

Create a file `players.csv`:
```csv
name,category,base_price,image_url
Virat Kohli,Batsman,150,https://example.com/virat.jpg
Jasprit Bumrah,Bowler,200,https://example.com/bumrah.jpg
MS Dhoni,Wicket-Keeper,180,https://example.com/dhoni.jpg
Rashid Khan,All-Rounder,120,https://example.com/rashid.jpg
```

Upload this in the room via "📁 Import CSV" button.

---

## 🐛 Troubleshooting

### MySQL Connection Failed
**Error:** `❌ MySQL connection failed`
- Check if MySQL server is running: `sudo service mysql status`
- Verify credentials in `backend/.env` match your MySQL setup
- Ensure database `auction_db` exists: `SHOW DATABASES;`

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3000`
- Another process is using port 3000
- Change port in `backend/.env`: `PORT=3001`
- Or kill existing process: `lsof -ti:3000 | xargs kill`

### WebSocket Connection Failed
- Check browser console for errors
- Ensure backend server is running
- Verify CORS settings allow your frontend origin
- Try refreshing the page

### Session Expired / Not Logged In
- Sessions are stored in memory (cleared on server restart)
- For production, use persistent session store (e.g., Redis, MySQL sessions)
- Clear browser cookies and re-login

### Players Not Appearing After Upload
- Check CSV format matches template (no extra columns, proper encoding)
- Ensure room_id is correct
- Check browser console and server logs for errors

---

## 🔐 Security Features

✅ **Password Hashing:** bcrypt with 10 salt rounds  
✅ **Input Validation:** Sanitize all user inputs, prevent SQL injection  
✅ **Session Security:** httpOnly cookies, configurable secure flag  
✅ **Bid Validation:** Server-side checks for budget, duplicate bids, timer expiry  
✅ **Authorization:** Only room host can start/pause/skip/end auctions  
✅ **CORS Protection:** Configured allowed origins  
✅ **XSS Prevention:** All dynamic content escaped in HTML  

---

## 🚀 Deployment

### Localhost (Done!)
You're already running it locally at `http://localhost:3000`

### Production Deployment

#### Option 1: VPS (DigitalOcean, AWS EC2, Linode)
1. **Setup Server:**
   ```bash
   # Install Node.js, MySQL, Git
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs mysql-server git
   ```

2. **Clone & Setup:**
   ```bash
   git clone your-repo-url auction-app
   cd auction-app/backend
   npm install --production
   ```

3. **Configure Production .env:**
   ```env
   NODE_ENV=production
   DB_HOST=localhost
   DB_USER=auction_user
   DB_PASS=strong_password
   SESSION_SECRET=very-long-random-string-min-32-chars
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Setup MySQL:**
   ```bash
   sudo mysql < config/schema.sql
   sudo mysql -e "CREATE USER 'auction_user'@'localhost' IDENTIFIED BY 'strong_password';"
   sudo mysql -e "GRANT ALL ON auction_db.* TO 'auction_user'@'localhost';"
   ```

5. **Use PM2 to Keep Running:**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name auction-app
   pm2 startup  # Auto-start on reboot
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

#### Option 2: Heroku
- Add `Procfile`: `web: node backend/server.js`
- Use ClearDB MySQL addon
- Set environment variables in Heroku dashboard

#### Option 3: Railway.app / Render.com
- Connect GitHub repo
- Add MySQL database service
- Configure environment variables
- Deploy automatically on push

---

## 🔮 Future Improvements

### Planned Features
- [ ] User profiles with avatar upload
- [ ] Email notifications for auction events
- [ ] Team export (PDF/Excel) after auction
- [ ] Advanced filters (category, price range)
- [ ] Multi-round auctions (reshuffle unsold players)
- [ ] Auction templates (save player lists for reuse)
- [ ] Video/audio call integration during auction
- [ ] Transaction history (all bids per user)
- [ ] Admin dashboard for super users
- [ ] Social sharing (Twitter/WhatsApp result cards)
- [ ] Mobile app (React Native / Flutter)
- [ ] AI-powered bid suggestions
- [ ] Auction analytics (charts, insights)

### Technical Improvements
- [ ] Redis for session storage (scalability)
- [ ] Database connection pooling optimization
- [ ] Rate limiting for API endpoints
- [ ] WebSocket authentication tokens (JWT)
- [ ] CDN for static assets
- [ ] Docker containerization
- [ ] Unit + integration tests (Jest, Mocha)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Logging system (Winston, Morgan)
- [ ] Error tracking (Sentry)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Developer Notes

### Database Schema Summary

**users** - User accounts  
**rooms** - Auction rooms  
**room_participants** - Join table (users ↔ rooms)  
**players** - Players to be auctioned  
**bids** - All bid transactions  
**teams** - Purchased players per user  
**chat_messages** - In-room chat history  

### Key Socket Events

**Client → Server:**
- `join_room` - Join auction room
- `start_auction` - Begin bidding (host only)
- `place_bid` - Submit a bid
- `skip_player` - Skip current player (host)
- `pause_auction` - Pause/resume (host)
- `end_auction` - End auction (host)
- `send_message` - Send chat message

**Server → Client:**
- `user_joined` / `user_left` - User presence
- `player_up` - New player on stage
- `new_bid` - Bid placed
- `timer_tick` - Countdown update
- `player_sold` - Player sold notification
- `player_unsold` - No bids received
- `auction_paused` / `auction_resumed` - Status changes
- `auction_ended` - Auction complete
- `chat_message` - New chat message

### Session Storage
Currently uses in-memory session store. For production:
```javascript
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({}, pool);
app.use(session({ store: sessionStore, ... }));
```

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices for real-time collaborative applications.

**Tech Credits:**
- Express.js - Web framework
- Socket.io - Real-time communication
- MySQL - Relational database
- bcryptjs - Password security
- Playfair Display & DM Sans - Typography

---

## 📞 Support

For issues, questions, or feature requests:
1. Check the Troubleshooting section above
2. Review server logs in terminal
3. Check browser console (F12) for frontend errors
4. Verify database connection and table creation

**Common Issues Database:**
- Session lost on refresh → Server restarted (in-memory sessions cleared)
- Timer desync → Client clock drift (server is authority)
- Bid rejected → Budget validation or duplicate bid
- CSV upload fails → Check column names match exactly

---

**🎉 Happy Auctioning! May the highest bidder win! 🏆**
