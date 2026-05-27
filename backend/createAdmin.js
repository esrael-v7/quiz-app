const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  user: 'quiz_admin_user',
  password: 'admin_secure_password',
  database: 'quiz_app_db'
});

async function run() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      ['admin', 'admin@example.com', hashedPassword, 'admin']
    );
    console.log("Admin created successfully!");
  } catch (err) {
    if (err.code === '23505') {
        console.log("Admin already exists!");
    } else {
        console.error(err);
    }
  } finally {
    await pool.end();
  }
}
run();
