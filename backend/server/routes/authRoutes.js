// server/routes/authRoutes.js
const express = require('express');
const { register, verifyOtp, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register',    register);    // Step 1: send OTP
router.post('/verify-otp',  verifyOtp);   // Step 2: confirm OTP
router.post('/login',       login);       // final login

module.exports = router;
