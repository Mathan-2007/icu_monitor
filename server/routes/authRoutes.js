const router = require('express').Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;