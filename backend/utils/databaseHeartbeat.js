const pool = require('../config/db');

/**
 * Database Heartbeat - Keeps Aiven database active by inserting/deleting dummy data
 * Inserts a heartbeat record every 5 minutes, auto-deletes records older than 10 minutes
 */

const HEARTBEAT_TABLE = 'database_heartbeat';
const INSERT_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes (how old records can be)

// Create heartbeat table if it doesn't exist
async function createHeartbeatTable() {
  try {
    const conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ${HEARTBEAT_TABLE} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        heartbeat_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active'
      )
    `);
    await conn.release();
    console.log('✅ Database heartbeat table ready');
  } catch (err) {
    console.error('❌ Failed to create heartbeat table:', err.message);
  }
}

// Insert heartbeat record
async function insertHeartbeat() {
  try {
    const conn = await pool.getConnection();
    await conn.query(`
      INSERT INTO ${HEARTBEAT_TABLE} (status) VALUES ('active')
    `);
    await conn.release();
    console.log('💓 Database heartbeat recorded');
  } catch (err) {
    console.error('❌ Heartbeat insert failed:', err.message);
  }
}

// Clean up old heartbeat records (older than 10 minutes)
async function cleanupOldHeartbeats() {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(`
      DELETE FROM ${HEARTBEAT_TABLE}
      WHERE heartbeat_time < DATE_SUB(NOW(), INTERVAL 10 MINUTE)
    `);
    await conn.release();
    console.log(`🧹 Cleaned up old heartbeat records (deleted: ${result[0].affectedRows})`);
  } catch (err) {
    console.error('❌ Heartbeat cleanup failed:', err.message);
  }
}

// Start the heartbeat mechanism
function startDatabaseHeartbeat() {
  console.log('🫀 Starting database heartbeat monitor...');
  
  // Create table on startup
  createHeartbeatTable();

  // Insert heartbeat every 5 minutes
  const heartbeatInterval = setInterval(insertHeartbeat, INSERT_INTERVAL);

  // Clean up old records every 10 minutes
  const cleanupInterval = setInterval(cleanupOldHeartbeats, CLEANUP_INTERVAL);

  // Insert first heartbeat immediately
  insertHeartbeat();

  // Return interval IDs for cleanup if needed
  return { heartbeatInterval, cleanupInterval };
}

module.exports = { startDatabaseHeartbeat };
