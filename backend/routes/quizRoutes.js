const express = require('express');
const router = express.Router();
const { 
    getCategories, 
    getQuestions, 
    submitQuizResult, 
    addCategory, 
    addQuestion, 
    getHistory,
    submitDetailedQuiz,
    getFavourites,
    addFavourite,
    removeFavourite,
    getLeaderboard
} = require('../controllers/quizController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Client routes
router.get('/categories', protect, getCategories);
router.get('/questions/:categoryId', protect, getQuestions);
router.post('/submit', protect, submitQuizResult);
router.post('/submit-detailed', protect, submitDetailedQuiz);
router.get('/history', protect, getHistory);

// Favourites routes
router.get('/favourites', protect, getFavourites);
router.post('/favourites', protect, addFavourite);
router.delete('/favourites/:questionId', protect, removeFavourite);

// Leaderboard route
router.get('/leaderboard', protect, getLeaderboard);
// Admin routes
router.post('/admin/categories', protect, adminOnly, addCategory);
router.post('/admin/questions', protect, adminOnly, addQuestion);

module.exports = router;
