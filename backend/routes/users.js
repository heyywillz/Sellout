const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile, changePassword, getMyProducts, getPublicProfile } = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('campus')
        .optional()
        .trim()
        .notEmpty().withMessage('Campus cannot be empty'),
    body('whatsapp')
        .optional()
        .trim()
        .matches(/^\+?[0-9]{10,15}$/).withMessage('Please provide a valid phone number')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Public routes
router.get('/:id/profile', getPublicProfile);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('profile_image'), updateProfileValidation, updateProfile);
router.put('/password', auth, changePasswordValidation, changePassword);
router.get('/products', auth, getMyProducts);

module.exports = router;
