const express = require('express');
const router = express.Router();
const { register, login, deleteAccount, googleAuth, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/erase', protect, deleteAccount); // Right to erase

module.exports = router;
