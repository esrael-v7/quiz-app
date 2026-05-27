const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_ADMIN_HOST || 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: process.env.DB_ADMIN_NAME || 'quiz_app_db'
});

async function runMigration() {
  try {
    console.log('Creating tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        is_correct BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_favourites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, question_id)
      );
    `);

    await pool.query(`
      ALTER TABLE questions
      ADD COLUMN IF NOT EXISTS explanation TEXT,
      ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium';
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Tables created successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
