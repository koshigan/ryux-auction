// server.js - Main application entry point
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Route imports
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const playerRoutes = require('./routes/players');
const auctionRoutes = require('./routes/auction');
const { attachUser } = require('./middleware/auth');
const setupAuctionSocket = require('./utils/auctionSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// ── SESSION SETUP ─────────────────────────────────────────
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'auction-super-secret-2024',
  name: 'auction_sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,      // Set true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  }
});

// Share session with Socket.io
io.engine.use(sessionMiddleware);

// ── MIDDLEWARE ────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(attachUser);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API ROUTES ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/auction', auctionRoutes);

// ── PAGE ROUTES (serve HTML files) ───────────────────────
const pagesDir = path.join(__dirname, '../frontend/pages');

function redirectByRole(req, res, pageName) {
  if (!req.session.userId) return res.redirect('/login');
  if (['war_leader', 'force_captain'].includes(req.session.userRole)) return res.redirect('/guild-war');
  return res.sendFile(path.join(pagesDir, pageName));
}

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect(['war_leader', 'force_captain', 'guild_leader'].includes(req.session.userRole) ? '/guild-war' : '/dashboard');
  } else {
    res.sendFile(path.join(pagesDir, 'login.html'));
  }
});

app.get('/login', (req, res) => res.sendFile(path.join(pagesDir, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(pagesDir, 'register.html')));
app.get('/dashboard', (req, res) => redirectByRole(req, res, 'dashboard.html'));
app.get('/room/:id', (req, res) => redirectByRole(req, res, 'room.html'));
app.get('/history', (req, res) => redirectByRole(req, res, 'history.html'));
app.get('/guild-war', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(pagesDir, 'guild-war.html'));
});
app.get('/guild-war/team/:id', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(pagesDir, 'guild-war-team.html'));
});
app.get('/guild-war/force/:id', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(pagesDir, 'guild-war-force.html'));
});
app.get('/guild-war/progress', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(pagesDir, 'guild-war-progress.html'));
});

// ── SOCKET.IO AUCTION ENGINE ──────────────────────────────
setupAuctionSocket(io);

// ── START SERVER ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Auction Server running at http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'auction_db'}\n`);
});

module.exports = { app, io };
