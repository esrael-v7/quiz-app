const { clientPool } = require('../config/db');

class SyncModel {
    static async findById(id) {
        const { rows } = await clientPool.query('SELECT * FROM sync_records WHERE id = $1 AND is_deleted = FALSE', [id]);
        return rows[0];
    }

    static async findAllByUser(userId) {
        const { rows } = await clientPool.query('SELECT * FROM sync_records WHERE user_id = $1 AND is_deleted = FALSE', [userId]);
        return rows;
    }

    static async create(record) {
        const { id, user_id, type, data, last_modified_at } = record;
        const { rows } = await clientPool.query(
            `INSERT INTO sync_records (id, user_id, type, data, last_modified_at) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id, user_id, type, data, last_modified_at]
        );
        return rows[0];
    }

    static async update(id, userId, data, lastModifiedAt) {
        const { rows } = await clientPool.query(
            `UPDATE sync_records 
             SET data = $1, last_modified_at = $2 
             WHERE id = $3 AND user_id = $4 AND is_deleted = FALSE RETURNING *`,
            [data, lastModifiedAt, id, userId]
        );
        return rows[0];
    }

    static async delete(id, userId, lastModifiedAt) {
        const { rows } = await clientPool.query(
            `UPDATE sync_records 
             SET is_deleted = TRUE, last_modified_at = $1 
             WHERE id = $2 AND user_id = $3 RETURNING *`,
            [lastModifiedAt, id, userId]
        );
        return rows[0];
    }

    static async getChangesSince(userId, lastSyncTime) {
        const { rows } = await clientPool.query(
            `SELECT * FROM sync_records 
             WHERE user_id = $1 AND last_modified_at > $2`,
            [userId, lastSyncTime]
        );
        return rows;
    }
}

module.exports = SyncModel;
