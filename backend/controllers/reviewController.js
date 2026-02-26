const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

// @desc    Create a review for a seller
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { product_id, rating, comment } = req.body;
        const reviewerId = req.user.id;

        // Get the product to find the seller
        const [products] = await pool.query(
            'SELECT id, user_id, title FROM products WHERE id = ?',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const sellerId = products[0].user_id;

        // Cannot review your own product
        if (sellerId === reviewerId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot review your own product'
            });
        }

        // Check for existing review
        const [existing] = await pool.query(
            'SELECT id FROM reviews WHERE reviewer_id = ? AND product_id = ?',
            [reviewerId, product_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Create review
        const [result] = await pool.query(
            'INSERT INTO reviews (reviewer_id, seller_id, product_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [reviewerId, sellerId, product_id, rating, comment || null]
        );

        // Get created review with reviewer info
        const [reviews] = await pool.query(
            `SELECT r.*, u.name as reviewer_name, u.profile_image as reviewer_image
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            WHERE r.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: { review: reviews[0] }
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get reviews for a seller
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
const getSellerReviews = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Get reviews with reviewer info
        const [reviews] = await pool.query(
            `SELECT r.*, u.name as reviewer_name, u.profile_image as reviewer_image,
                p.title as product_title
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE r.seller_id = ?
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?`,
            [sellerId, parseInt(limit), offset]
        );

        // Get total count and average rating
        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as total_reviews,
                ROUND(AVG(rating), 1) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM reviews WHERE seller_id = ?`,
            [sellerId]
        );

        res.json({
            success: true,
            data: {
                reviews,
                stats: stats[0],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: stats[0].total_reviews,
                    pages: Math.ceil(stats[0].total_reviews / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get seller reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get reviews for a specific product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const [reviews] = await pool.query(
            `SELECT r.*, u.name as reviewer_name, u.profile_image as reviewer_image
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC`,
            [productId]
        );

        res.json({
            success: true,
            data: { reviews }
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('DELETE REVIEW - id:', id, 'user:', req.user.id);

        const [reviews] = await pool.query(
            'SELECT * FROM reviews WHERE id = ?',
            [id]
        );

        console.log('DELETE REVIEW - found:', reviews.length, reviews.length > 0 ? 'reviewer_id=' + reviews[0].reviewer_id : '');

        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (reviews[0].reviewer_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        await pool.query('DELETE FROM reviews WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get seller rating summary (for use in product cards/details)
// @route   GET /api/reviews/rating/:sellerId
// @access  Public
const getSellerRating = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as total_reviews,
                ROUND(AVG(rating), 1) as average_rating
            FROM reviews WHERE seller_id = ?`,
            [sellerId]
        );

        res.json({
            success: true,
            data: {
                totalReviews: stats[0].total_reviews,
                averageRating: stats[0].average_rating || 0
            }
        });
    } catch (error) {
        console.error('Get seller rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { createReview, getSellerReviews, getProductReviews, deleteReview, getSellerRating };
