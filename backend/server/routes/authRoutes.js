// server/routes/authRoutes.js
const express = require('express');
const { register, verifyOtp, login, getProfile } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();

// Public routes
router.post('/register', register);      // Step 1: send OTP
router.post('/verify-otp', verifyOtp);   // Step 2: confirm OTP
router.post('/login', login);            // Login and get token

// Protected routes
router.get('/profile', authenticateJWT, getProfile); // Get current user profile

module.exports = router;