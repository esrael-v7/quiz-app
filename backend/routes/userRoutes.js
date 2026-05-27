const express = require('express');
const router = express.Router();
const { getUserStats, syncUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getUserStats);
router.post('/sync', protect, syncUser);

module.exports = router;
