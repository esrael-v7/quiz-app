const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_CLIENT_HOST || 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: process.env.DB_CLIENT_NAME || 'quiz_app_db'
});

async function grantPermissions() {
  try {
    const clientUser = process.env.DB_CLIENT_USER || 'quiz_app_client';
    
    console.log(`Granting permissions to user: ${clientUser}`);
    
    // Grant full permissions on password_reset_codes table
    await pool.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON password_reset_codes TO ${clientUser};`);
    console.log('✓ Granted SELECT, INSERT, UPDATE, DELETE on password_reset_codes');
    
    // Grant usage on sequence for auto-increment ID
    await pool.query(`GRANT USAGE, SELECT ON SEQUENCE password_reset_codes_id_seq TO ${clientUser};`);
    console.log('✓ Granted USAGE, SELECT on password_reset_codes_id_seq');
    
    // Also grant permissions on users table if needed
    await pool.query(`GRANT SELECT, UPDATE ON users TO ${clientUser};`);
    console.log('✓ Granted SELECT, UPDATE on users table');

    // Grant permissions on user_favourites and user_answers tables
    await pool.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON user_favourites TO ${clientUser};`);
    await pool.query(`GRANT USAGE, SELECT ON SEQUENCE user_favourites_id_seq TO ${clientUser};`);
    console.log('✓ Granted SELECT, INSERT, UPDATE, DELETE on user_favourites and its sequence');

    await pool.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON user_answers TO ${clientUser};`);
    await pool.query(`GRANT USAGE, SELECT ON SEQUENCE user_answers_id_seq TO ${clientUser};`);
    console.log('✓ Granted SELECT, INSERT, UPDATE, DELETE on user_answers and its sequence');
    
    console.log('All permissions granted successfully!');
  } catch (err) {
    console.error('Permission grant error:', err.message);
  } finally {
    await pool.end();
  }
}

grantPermissions();
