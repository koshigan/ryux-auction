const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Create database if not exists
    await db.query(`CREATE DATABASE IF NOT EXISTS auction_db`);
    console.log('✅ auction_db database ensured');
    
    // Use the database
    await db.query(`USE auction_db`);
    console.log('✅ Using auction_db');

    await db.query(`
      CREATE TABLE IF NOT EXISTS forces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        logo_url VARCHAR(255),
        admin_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Forces table ensured');

    await db.query(`
      CREATE TABLE IF NOT EXISTS guild_war_settings (
        id INT PRIMARY KEY,
        state_json LONGTEXT
      )
    `);
    console.log('✅ Guild War Settings table ensured');

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
