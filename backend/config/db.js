const { Pool } = require('pg');
require('dotenv').config();

// Create separate connection pools based on actor roles (No Root Connection)

// 1. Client Pool: For standard app users (read-heavy, limited writes)
const clientPool = new Pool({
    host: process.env.DB_CLIENT_HOST,
    user: process.env.DB_CLIENT_USER,
    password: process.env.DB_CLIENT_PASSWORD,
    database: process.env.DB_CLIENT_NAME,
    max: 10,
});

// 2. Admin Pool: For admin users (CRUD operations on questions/categories)
const adminPool = new Pool({
    host: process.env.DB_ADMIN_HOST,
    user: process.env.DB_ADMIN_USER,
    password: process.env.DB_ADMIN_PASSWORD,
    database: process.env.DB_ADMIN_NAME,
    max: 5,
});

module.exports = {
    clientPool,
    adminPool
};
