const { pool } = require('../config/database');

// @desc    Toggle favorite (add/remove)
// @route   POST /api/favorites/:productId
// @access  Private
const toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        // Check if product exists
        const [products] = await pool.query('SELECT id, user_id FROM products WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if already favorited
        const [existing] = await pool.query(
            'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // Remove favorite
            await pool.query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);

            // Get updated count
            const [countResult] = await pool.query(
                'SELECT COUNT(*) as count FROM favorites WHERE product_id = ?',
                [productId]
            );

            return res.json({
                success: true,
                message: 'Removed from favorites',
                data: { isFavorited: false, favoriteCount: countResult[0].count }
            });
        } else {
            // Add favorite
            await pool.query(
                'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
                [userId, productId]
            );

            // Get updated count
            const [countResult] = await pool.query(
                'SELECT COUNT(*) as count FROM favorites WHERE product_id = ?',
                [productId]
            );

            return res.json({
                success: true,
                message: 'Added to favorites',
                data: { isFavorited: true, favoriteCount: countResult[0].count }
            });
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getMyFavorites = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        const [favorites] = await pool.query(
            `SELECT p.*, u.name as seller_name, u.whatsapp as seller_whatsapp, u.profile_image as seller_image,
                f.created_at as favorited_at
            FROM favorites f
            JOIN products p ON f.product_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
            LIMIT ? OFFSET ?`,
            [req.user.id, parseInt(limit), offset]
        );

        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                products: favorites,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Check if product is favorited by current user
// @route   GET /api/favorites/check/:productId
// @access  Private
const checkFavorite = async (req, res) => {
    try {
        const { productId } = req.params;

        const [existing] = await pool.query(
            'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
            [req.user.id, productId]
        );

        const [countResult] = await pool.query(
            'SELECT COUNT(*) as count FROM favorites WHERE product_id = ?',
            [productId]
        );

        res.json({
            success: true,
            data: {
                isFavorited: existing.length > 0,
                favoriteCount: countResult[0].count
            }
        });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get favorite count for a product (public)
// @route   GET /api/favorites/count/:productId
// @access  Public
const getFavoriteCount = async (req, res) => {
    try {
        const { productId } = req.params;

        const [countResult] = await pool.query(
            'SELECT COUNT(*) as count FROM favorites WHERE product_id = ?',
            [productId]
        );

        res.json({
            success: true,
            data: { favoriteCount: countResult[0].count }
        });
    } catch (error) {
        console.error('Get favorite count error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { toggleFavorite, getMyFavorites, checkFavorite, getFavoriteCount };
