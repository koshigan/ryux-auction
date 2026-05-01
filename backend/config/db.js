// config/db.js - MySQL database connection pool
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configure SSL based on environment
const getSSLConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    // For Aiven in production - use SSL with proper configuration
    return {
      rejectUnauthorized: true
    };
  }
  // Development - no SSL
  return false;
};

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'auction_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Connection timeout settings (in milliseconds)
  connectionTimeout: 15000,  // 15 seconds to establish connection
  acquireTimeout: 20000,     // 20 seconds to acquire connection from pool
  // SSL configuration for Aiven (required for production)
  ssl: getSSLConfig(),
  // Enable detailed error logging
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// Test connection on startup with detailed logging
console.log(`📡 Attempting to connect to: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'auction_db'}`);

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
    console.error('⚠️  Make sure:');
    console.error('   1. All DB_* environment variables are set in Render');
    console.error('   2. Aiven firewall allows connections from Render IP addresses');
    console.error('   3. Database credentials are correct');
  });

module.exports = pool;
