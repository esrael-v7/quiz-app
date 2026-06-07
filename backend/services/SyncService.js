const SyncModel = require('../models/SyncModel');
const { clientPool } = require('../config/db');

class SyncService {
    /**
     * Process bulk sync from client.
     * Implements Last-Write-Wins based on last_modified_at.
     */
    static async processBulkSync(userId, lastSyncTime, changes) {
        const client = await clientPool.connect();
        
        try {
            await client.query('BEGIN');
            
            const serverChanges = {
                created: [],
                updated: [],
                deleted: []
            };

            const newSyncTimestamp = new Date().toISOString();

            // 1. Process Created
            if (changes.created && Array.isArray(changes.created)) {
                for (const item of changes.created) {
                    const existing = await client.query('SELECT id FROM sync_records WHERE id = $1', [item.id]);
                    if (existing.rows.length === 0) {
                        await client.query(
                            `INSERT INTO sync_records (id, user_id, type, data, last_modified_at) 
                             VALUES ($1, $2, $3, $4, $5)`,
                            [item.id, userId, item.type, JSON.stringify(item.data), item.last_modified_at || newSyncTimestamp]
                        );
                    }
                }
            }

            // 2. Process Updated
            if (changes.updated && Array.isArray(changes.updated)) {
                for (const item of changes.updated) {
                    const { rows } = await client.query('SELECT last_modified_at FROM sync_records WHERE id = $1 AND user_id = $2', [item.id, userId]);
                    if (rows.length > 0) {
                        const serverTime = new Date(rows[0].last_modified_at).getTime();
                        const clientTime = new Date(item.last_modified_at).getTime();
                        
                        // Last-Write-Wins
                        if (clientTime >= serverTime) {
                            await client.query(
                                `UPDATE sync_records SET data = $1, last_modified_at = $2 WHERE id = $3`,
                                [JSON.stringify(item.data), item.last_modified_at, item.id]
                            );
                        }
                    }
                }
            }

            // 3. Process Deleted
            if (changes.deleted && Array.isArray(changes.deleted)) {
                for (const id of changes.deleted) {
                    await client.query(
                        `UPDATE sync_records SET is_deleted = TRUE, last_modified_at = $1 WHERE id = $2 AND user_id = $3`,
                        [newSyncTimestamp, id, userId]
                    );
                }
            }

            await client.query('COMMIT');

            // 4. Fetch changes that happened on the server since the client's last sync
            // that were NOT part of the client's current sync payload.
            const allServerChanges = await SyncModel.getChangesSince(userId, lastSyncTime || new Date(0).toISOString());
            
            const clientSentIds = [
                ...(changes.created || []).map(i => i.id),
                ...(changes.updated || []).map(i => i.id),
                ...(changes.deleted || [])
            ];

            const relevantServerChanges = allServerChanges.filter(record => !clientSentIds.includes(record.id));
            
            for (const record of relevantServerChanges) {
                if (record.is_deleted) {
                    serverChanges.deleted.push(record.id);
                } else if (new Date(record.created_at).getTime() > new Date(lastSyncTime || 0).getTime()) {
                    serverChanges.created.push(record);
                } else {
                    serverChanges.updated.push(record);
                }
            }

            return {
                status: 'success',
                timestamp: newSyncTimestamp,
                serverChanges
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = SyncService;
