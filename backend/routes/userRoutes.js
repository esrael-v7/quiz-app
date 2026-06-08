const express = require('express');
const router = express.Router();
const { getUserStats, syncUser, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getUserStats);
router.post('/sync', protect, syncUser);
router.delete('/account', protect, deleteAccount);

module.exports = router;
