const { clientPool } = require('../config/db');

const logAction = async (userId, action, description, ipAddress) => {
    try {
        const query = `INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1, $2, $3, $4)`;
        await clientPool.query(query, [userId, action, description, ipAddress]);
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

module.exports = { logAction };
