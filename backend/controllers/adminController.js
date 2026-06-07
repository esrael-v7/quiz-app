const { adminPool } = require('../config/db');
const cache = require('../utils/cache');
const { logAction } = require('../utils/auditLogger');

// Get all questions (paginated, for Admin List)
exports.getQuestions = async (req, res) => {
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

exports.addQuestion = async (req, res) => {
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
            'INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [categoryId, questionText, optionA, optionB, optionC, optionD, correctOption, explanation || null, difficulty || 'medium']
        );
        cache.flushAll(); // Simple invalidation for questions
        await logAction(req.user.id, 'ADMIN_ADD_Q', `Added question to category ${categoryId}`, req.ip);
        res.status(201).json({ status: 'success', data: rows[0], message: 'Question added successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
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

exports.deleteQuestion = async (req, res) => {
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
