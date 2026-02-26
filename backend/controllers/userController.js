const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { deleteLocalFile } = require('../middleware/upload');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        // Get user's products count
        const [productStats] = await pool.query(
            `SELECT 
                COUNT(*) as total_products,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_products,
                SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold_products
            FROM products WHERE user_id = ?`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                user: req.user,
                stats: productStats[0]
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, campus, whatsapp } = req.body;
        let profileImage = req.user.profile_image;
        let oldImagePublicId = null;

        // Handle profile image upload
        if (req.file) {
            try {
                // Get old image public_id for deletion
                if (req.user.profile_image) {
                    // Extract public_id from URL
                    const urlParts = req.user.profile_image.split('/');
                    const publicIdWithExt = urlParts.slice(-2).join('/');
                    oldImagePublicId = publicIdWithExt.split('.')[0];
                }

                // Upload new image
                const uploadResult = await uploadImage(req.file.path, 'sellout/profiles');
                profileImage = uploadResult.url;

                // Delete old image from Cloudinary
                if (oldImagePublicId) {
                    await deleteImage(oldImagePublicId);
                }

                // Delete local file
                deleteLocalFile(req.file.path);
            } catch (uploadError) {
                deleteLocalFile(req.file.path);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload profile image'
                });
            }
        }

        // Update user
        await pool.query(
            'UPDATE users SET name = ?, campus = ?, whatsapp = ?, profile_image = ? WHERE id = ?',
            [name || req.user.name, campus || req.user.campus, whatsapp || req.user.whatsapp, profileImage, req.user.id]
        );

        // Get updated user
        const [users] = await pool.query(
            'SELECT id, name, email, campus, whatsapp, profile_image, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: users[0]
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const [users] = await pool.query(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's products
// @route   GET /api/users/products
// @access  Private
const getMyProducts = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM products WHERE user_id = ?';
        const params = [req.user.id];

        if (status && ['available', 'sold'].includes(status)) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM products WHERE user_id = ?';
        const countParams = [req.user.id];

        if (status && ['available', 'sold'].includes(status)) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get public seller profile
// @route   GET /api/users/:id/profile
// @access  Public
const getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user info (exclude password and email for privacy)
        const [users] = await pool.query(
            'SELECT id, name, campus, whatsapp, profile_image, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Get product stats
        const [productStats] = await pool.query(
            `SELECT 
                COUNT(*) as total_products,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_products,
                SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold_products
            FROM products WHERE user_id = ?`,
            [id]
        );

        // Get available products
        const [products] = await pool.query(
            `SELECT p.*, 
                (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order ASC LIMIT 1) as gallery_image
            FROM products p 
            WHERE p.user_id = ? AND p.status = 'available' 
            ORDER BY p.created_at DESC`,
            [id]
        );

        // Get review stats
        const [reviewStats] = await pool.query(
            `SELECT 
                COUNT(*) as total_reviews,
                ROUND(AVG(rating), 1) as average_rating
            FROM reviews WHERE seller_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                seller: users[0],
                stats: productStats[0],
                products,
                reviewStats: {
                    totalReviews: reviewStats[0].total_reviews,
                    averageRating: reviewStats[0].average_rating || 0
                }
            }
        });
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { getProfile, updateProfile, changePassword, getMyProducts, getPublicProfile };
