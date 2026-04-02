const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, getMe, googleAuth } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Strict rate limit for auth routes to prevent credential brute-forcing
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 15, // Limit 15 login/register attempts
    message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes.' }
});

// Validation rules
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('campus')
        .trim()
        .notEmpty().withMessage('Campus is required'),
    body('whatsapp')
        .trim()
        .notEmpty().withMessage('WhatsApp number is required')
        .matches(/^\+?[0-9]{10,15}$/).withMessage('Please provide a valid phone number')
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/google', authLimiter, googleAuth);
router.get('/me', auth, getMe);

module.exports = router;
