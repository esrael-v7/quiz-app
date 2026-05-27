const { adminPool } = require('../config/db');
const cache = require('../utils/cache');
const { logAction } = require('../utils/auditLogger');

// Get all questions (paginated, for Admin List)
exports.getQuestions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { rows } = await adminPool.query(
            'SELECT * FROM questions ORDER BY id DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const { rows: countResult } = await adminPool.query('SELECT COUNT(*) as total FROM questions');
        const total = parseInt(countResult[0].total);

        res.json({
            status: 'success',
            data: rows,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Add a new question
exports.addQuestion = async (req, res) => {
    try {
        const {
            question_text,
            category_id,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation,
            difficulty
        } = req.body;

        if (!question_text || !category_id || !option_a || !option_b || !option_c || !option_d || !correct_option) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const { rows } = await adminPool.query(
            'INSERT INTO questions (question_text, category_id, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            [question_text, category_id, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty || 'medium']
        );

        cache.flushAll();
        await logAction(req.user.id, 'ADMIN_ADD_QUESTION', `Added question to category ${category_id}`, req.ip);

        res.status(201).json({ status: 'success', data: { id: rows[0].id, ...req.body, difficulty: difficulty || 'medium' } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Update an existing question
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            question_text,
            category_id,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation,
            difficulty
        } = req.body;

        if (!question_text || !category_id || !option_a || !option_b || !option_c || !option_d || !correct_option) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const { rows } = await adminPool.query(
            'UPDATE questions SET question_text = $1, category_id = $2, option_a = $3, option_b = $4, option_c = $5, option_d = $6, correct_option = $7, explanation = $8, difficulty = $9 WHERE id = $10 RETURNING *',
            [question_text, category_id, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty || 'medium', id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Question not found' });
        }

        cache.flushAll();
        await logAction(req.user.id, 'ADMIN_UPDATE_QUESTION', `Updated question ${id}`, req.ip);

        res.json({ status: 'success', data: rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await adminPool.query('DELETE FROM questions WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ status: 'error', message: 'Question not found' });
        }

        cache.flushAll();
        await logAction(req.user.id, 'ADMIN_DELETE_QUESTION', `Deleted question ${id}`, req.ip);

        res.json({ status: 'success', message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
