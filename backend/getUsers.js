const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  user: 'quiz_admin_user',
  password: 'admin_secure_password',
  database: 'quiz_app_db'
});

async function run() {
  try {
    const { rows } = await pool.query('SELECT username, email, role FROM users');
    console.table(rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
