const { clientPool } = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Get User Stats
exports.getUserStats = async (req, res) => {
    const userId = req.user.id;
    try {
        // Query to get user details (level and last synced time)
        const userQuery = `SELECT user_level, last_synced_at FROM users WHERE id = $1`;
        const { rows: userRows } = await clientPool.query(userQuery, [userId]);
        const user = userRows[0] || { user_level: 1, last_synced_at: null };

        // Query to get total quizzes, total points, and avg score
        const statsQuery = `
            SELECT 
                COUNT(*) as total_quizzes,
                SUM(score * 10) as total_points,
                AVG(CASE WHEN total_questions > 0 THEN (score::float / total_questions) * 100 ELSE 0 END) as avg_score
            FROM quiz_history
            WHERE user_id = $1
        `;
        const { rows: statsRows } = await clientPool.query(statsQuery, [userId]);
        const stats = statsRows[0];

        // Query to get scores by category
        const categoryQuery = `
            SELECT 
                c.name as category_name,
                AVG(CASE WHEN qh.total_questions > 0 THEN (qh.score::float / qh.total_questions) * 100 ELSE 0 END) as score
            FROM quiz_history qh
            JOIN categories c ON qh.category_id = c.id
            WHERE qh.user_id = $1
            GROUP BY c.id, c.name
            ORDER BY score DESC
        `;
        const { rows: categoryRows } = await clientPool.query(categoryQuery, [userId]);

        res.json({
            status: 'success',
            data: {
                level: user.user_level,
                last_synced_at: user.last_synced_at,
                total_quizzes: parseInt(stats.total_quizzes) || 0,
                avg_score: Math.round(stats.avg_score || 0),
                total_points: parseInt(stats.total_points) || 0,
                scores_by_category: categoryRows.map(row => ({
                    category_name: row.category_name,
                    score: Math.round(row.score || 0)
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Sync User data (updates last_synced_at and optionally user_level)
exports.syncUser = async (req, res) => {
    const userId = req.user.id;
    const level = req.body.level !== undefined ? req.body.level : req.body.user_level;

    try {
        let query;
        let params;

        if (level !== undefined) {
            query = `
                UPDATE users 
                SET last_synced_at = CURRENT_TIMESTAMP, 
                    user_level = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `;
            params = [userId, parseInt(level) || 1];
        } else {
            query = `
                UPDATE users 
                SET last_synced_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `;
            params = [userId];
        }

        await clientPool.query(query, params);
        await logAction(userId, 'USER_SYNC', `User synced level: ${level !== undefined ? level : 'N/A'}`, req.ip);

        res.json({
            status: 'success',
            message: 'Sync successful'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

