const express = require('express');
const router = express.Router();
const { getQuestions, addQuestion, updateQuestion, deleteQuestion } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin privileges
router.use(protect, adminOnly);

// Get all questions (for the Admin List)
router.get('/questions', getQuestions);

// Add a new question
router.post('/questions', addQuestion);

// Update an existing question
router.put('/questions/:id', updateQuestion);

// Delete a question
router.delete('/questions/:id', deleteQuestion);

module.exports = router;
