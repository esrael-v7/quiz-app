const { clientPool, adminPool } = require('../config/db');
const cache = require('../utils/cache');
const { logAction } = require('../utils/auditLogger');

// Get categories (Cached)
exports.getCategories = async (req, res) => {
    try {
        const cachedCats = cache.get('categories');
        if (cachedCats) return res.json({ status: 'success', data: cachedCats });

        const { rows } = await clientPool.query('SELECT * FROM categories');
        cache.set('categories', rows);
        res.json({ status: 'success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get Questions for Quiz (Paginated and Cached)
exports.getQuestions = async (req, res) => {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const cacheKey = `qs_${categoryId}_${page}_${limit}`;

    try {
        const cachedQs = cache.get(cacheKey);
        if (cachedQs) return res.json({ status: 'success', ...cachedQs });

        // Pagination query
        const { rows } = await clientPool.query(
            'SELECT id, category_id, question_text, option_a, option_b, option_c, option_d, correct_option FROM questions WHERE category_id = $1 LIMIT $2 OFFSET $3',
            [categoryId, limit, offset]
        );
        
        // Count total for pagination metadata
        const { rows: countResult } = await clientPool.query('SELECT COUNT(*) as total FROM questions WHERE category_id = $1', [categoryId]);
        const total = parseInt(countResult[0].total);

        const responseData = { data: rows, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
        cache.set(cacheKey, responseData);
        
        res.json({ status: 'success', ...responseData });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Submit Quiz Results
exports.submitQuizResult = async (req, res) => {
    // Handle both camelCase and snake_case for backward compatibility and app payload
    const categoryId = req.body.category_id || req.body.categoryId;
    const score = req.body.score;
    const totalQuestions = req.body.total_questions || req.body.totalQuestions;
    const userId = req.user.id;
    
    if (!categoryId) {
        return res.status(400).json({ status: 'error', message: 'category_id is required' });
    }

    try {
        await clientPool.query(
            'INSERT INTO quiz_history (user_id, category_id, score, total_questions) VALUES ($1, $2, $3, $4)',
            [userId, categoryId, score, totalQuestions]
        );
        await logAction(userId, 'QUIZ_SUBMIT', `Submitted quiz for category ${categoryId} with score ${score}/${totalQuestions}`, req.ip);
        res.status(201).json({ status: 'success', message: 'Quiz result saved' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get User Quiz History
exports.getHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const { rows } = await clientPool.query(
            `SELECT qh.id, c.name as category_name, qh.score, qh.total_questions, qh.completed_at 
             FROM quiz_history qh 
             JOIN categories c ON qh.category_id = c.id 
             WHERE qh.user_id = $1 
             ORDER BY qh.completed_at DESC`,
            [userId]
        );
        res.json({ status: 'success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Submit Detailed Quiz Results
exports.submitDetailedQuiz = async (req, res) => {
    const categoryId = req.body.category_id || req.body.categoryId;
    const score = req.body.score;
    const totalQuestions = req.body.total_questions || req.body.totalQuestions;
    const answers = req.body.answers || [];
    const userId = req.user.id;

    if (!categoryId) {
        return res.status(400).json({ status: 'error', message: 'category_id is required' });
    }

    try {
        await clientPool.query('BEGIN');

        // Insert into quiz_history
        await clientPool.query(
            'INSERT INTO quiz_history (user_id, category_id, score, total_questions) VALUES ($1, $2, $3, $4)',
            [userId, categoryId, score, totalQuestions]
        );

        // Bulk insert answers if provided and user_answers table exists
        if (answers.length > 0) {
            try {
                for (const ans of answers) {
                    await clientPool.query(
                        'INSERT INTO user_answers (user_id, question_id, is_correct) VALUES ($1, $2, $3)',
                        [userId, ans.question_id, ans.is_correct]
                    );
                }
            } catch (ansErr) {
                console.warn('Could not insert detailed answers. Did you run the schema update?', ansErr.message);
                // We do not fail the whole request if detailed answers fail because tables might not exist yet.
            }
        }

        await clientPool.query('COMMIT');
        await logAction(userId, 'QUIZ_SUBMIT_DETAILED', `Submitted detailed quiz for category ${categoryId}`, req.ip);
        res.status(201).json({ status: 'success', message: 'Detailed quiz result saved' });
    } catch (error) {
        await clientPool.query('ROLLBACK');
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get User Favourites
exports.getFavourites = async (req, res) => {
    const userId = req.user.id;
    try {
        const { rows } = await clientPool.query(
            `SELECT q.id, q.category_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, uf.created_at as saved_at
             FROM user_favourites uf
             JOIN questions q ON uf.question_id = q.id
             WHERE uf.user_id = $1
             ORDER BY uf.created_at DESC`,
            [userId]
        );
        res.json({ status: 'success', data: rows });
    } catch (error) {
        if (error.code === '42P01') { // relation does not exist
            return res.json({ status: 'success', data: [], message: 'Favourites table not initialized yet.' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Add to Favourites
exports.addFavourite = async (req, res) => {
    const userId = req.user.id;
    const { questionId } = req.body;
    
    if (!questionId) {
        return res.status(400).json({ status: 'error', message: 'questionId is required' });
    }

    try {
        await clientPool.query(
            'INSERT INTO user_favourites (user_id, question_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, questionId]
        );
        res.status(201).json({ status: 'success', message: 'Added to favourites' });
    } catch (error) {
        if (error.code === '42P01') return res.status(500).json({ status: 'error', message: 'Favourites table not initialized yet. Run schema_update.sql' });
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Remove from Favourites
exports.removeFavourite = async (req, res) => {
    const userId = req.user.id;
    const { questionId } = req.params;

    try {
        await clientPool.query(
            'DELETE FROM user_favourites WHERE user_id = $1 AND question_id = $2',
            [userId, questionId]
        );
        res.json({ status: 'success', message: 'Removed from favourites' });
    } catch (error) {
        if (error.code === '42P01') return res.status(500).json({ status: 'error', message: 'Favourites table not initialized yet.' });
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get Leaderboard
exports.getLeaderboard = async (req, res) => {
    const period = req.query.period || 'all_time'; // today, week, all_time
    let timeFilter = '';
    
    if (period === 'today') {
        timeFilter = "WHERE qh.completed_at >= CURRENT_DATE";
    } else if (period === 'week') {
        timeFilter = "WHERE qh.completed_at >= CURRENT_DATE - INTERVAL '7 days'";
    }

    try {
        const query = `
            SELECT u.id, u.username, u.user_level as level,
                   SUM(qh.score * 10) as total_points, 
                   COUNT(qh.id) as quizzes_taken
            FROM users u
            JOIN quiz_history qh ON u.id = qh.user_id
            ${timeFilter}
            GROUP BY u.id, u.username, u.user_level
            ORDER BY total_points DESC
            LIMIT 10
        `;
        
        const { rows } = await clientPool.query(query);
        res.json({ status: 'success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// --- ADMIN ROUTES (Uses adminPool) ---

exports.addCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const { rows } = await adminPool.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id', [name, description]);
        cache.del('categories'); // Invalidate cache
        await logAction(req.user.id, 'ADMIN_ADD_CAT', `Added category: ${name}`, req.ip);
        res.status(201).json({ status: 'success', data: { id: rows[0].id, name, description } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.addQuestion = async (req, res) => {
    const { categoryId, questionText, optionA, optionB, optionC, optionD, correctOption, explanation, difficulty } = req.body;
    try {
        await adminPool.query(
            'INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [categoryId, questionText, optionA, optionB, optionC, optionD, correctOption, explanation || null, difficulty || 'medium']
        );
        cache.flushAll(); // Simple invalidation for questions
        await logAction(req.user.id, 'ADMIN_ADD_Q', `Added question to category ${categoryId}`, req.ip);
        res.status(201).json({ status: 'success', message: 'Question added successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getAdminQuestions = async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search;
    const categoryId = req.query.categoryId;

    try {
        let query = `
            SELECT q.*, c.name as category_name 
            FROM questions q
            LEFT JOIN categories c ON q.category_id = c.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (search && search !== 'null' && search.trim() !== '') {
            query += ` AND (q.question_text ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (categoryId && categoryId !== 'null' && categoryId.trim() !== '') {
            query += ` AND q.category_id = $${paramIndex}`;
            params.push(categoryId);
            paramIndex++;
        }

        query += ` ORDER BY q.id DESC LIMIT $${paramIndex}`;
        params.push(limit);

        const { rows } = await adminPool.query(query, params);
        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updateAdminQuestion = async (req, res) => {
    const { id } = req.params;
    const categoryId = req.body.category_id || req.body.categoryId;
    const questionText = req.body.question_text || req.body.questionText;
    const optionA = req.body.option_a || req.body.optionA;
    const optionB = req.body.option_b || req.body.optionB;
    const optionC = req.body.option_c || req.body.optionC;
    const optionD = req.body.option_d || req.body.optionD;
    const correctOption = req.body.correct_option || req.body.correctOption;
    const explanation = req.body.explanation;
    const difficulty = req.body.difficulty;
    
    try {
        const { rows } = await adminPool.query(
            `UPDATE questions 
             SET category_id = COALESCE($1, category_id), 
                 question_text = COALESCE($2, question_text), 
                 option_a = COALESCE($3, option_a), 
                 option_b = COALESCE($4, option_b), 
                 option_c = COALESCE($5, option_c), 
                 option_d = COALESCE($6, option_d), 
                 correct_option = COALESCE($7, correct_option),
                 explanation = COALESCE($8, explanation),
                 difficulty = COALESCE($9, difficulty)
             WHERE id = $10 RETURNING *`,
            [categoryId, questionText, optionA, optionB, optionC, optionD, correctOption, explanation, difficulty, id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Question not found' });
        }

        cache.flushAll(); // Invalidate cache
        await logAction(req.user.id, 'ADMIN_UPDATE_Q', `Updated question ${id}`, req.ip);
        res.status(200).json({ status: 'success', data: rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.deleteAdminQuestion = async (req, res) => {
    const { id } = req.params;
    
    try {
        const { rowCount } = await adminPool.query(
            'DELETE FROM questions WHERE id = $1',
            [id]
        );
        
        if (rowCount === 0) {
            return res.status(404).json({ status: 'error', message: 'Question not found' });
        }

        cache.flushAll(); // Invalidate cache
        await logAction(req.user.id, 'ADMIN_DELETE_Q', `Deleted question ${id}`, req.ip);
        res.status(200).json({ status: 'success', message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
