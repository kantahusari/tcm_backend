const express = require('express');
const router = express.Router();
const { login, verifyToken, logout, loginValidation } = require('../controllers/authController');

// Rate limiting for login attempts
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { error: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true
});

// No rate limiting for logout
router.post('/logout', logout);
router.post('/login', loginLimiter, loginValidation, login);
router.get('/verify', verifyToken);

module.exports = router;