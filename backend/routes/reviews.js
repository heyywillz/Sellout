const express = require('express');
const { body } = require('express-validator');
const { createReview, getSellerReviews, getProductReviews, deleteReview, getSellerRating } = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const reviewValidation = [
    body('product_id')
        .notEmpty().withMessage('Product ID is required')
        .isInt().withMessage('Product ID must be a number'),
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
];

// Public routes
router.get('/seller/:sellerId', getSellerReviews);
router.get('/product/:productId', getProductReviews);
router.get('/rating/:sellerId', getSellerRating);

// Protected routes
router.post('/', auth, reviewValidation, createReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;
