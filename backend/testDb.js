const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_ADMIN_HOST || 'localhost',
  user: process.env.DB_ADMIN_USER || 'quiz_admin_user',
  password: process.env.DB_ADMIN_PASSWORD || 'admin_secure_password',
  database: process.env.DB_ADMIN_NAME || 'quiz_app_db'
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
