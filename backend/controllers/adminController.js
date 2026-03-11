const { pool } = require('../config/database');
const { deleteImage } = require('../config/cloudinary');

// @desc    Get all verifications (with optional status filter)
// @route   GET /api/admin/verifications
// @access  Private/Admin
const getVerifications = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT sv.*, u.name as user_name, u.email as user_email, u.campus as user_campus, u.profile_image as user_image
            FROM student_verifications sv
            JOIN users u ON sv.user_id = u.id
        `;
        const params = [];

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query += ' WHERE sv.status = ?';
            params.push(status);
        }

        query += ' ORDER BY sv.submitted_at DESC';

        const [verifications] = await pool.query(query, params);

        res.json({
            success: true,
            data: { verifications }
        });
    } catch (error) {
        console.error('Get verifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Review a verification (approve/reject)
// @route   PUT /api/admin/verifications/:id/review
// @access  Private/Admin
const reviewVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be "approved" or "rejected"'
            });
        }

        // Get the verification record
        const [verifications] = await pool.query(
            'SELECT * FROM student_verifications WHERE id = ?',
            [id]
        );

        if (verifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found'
            });
        }

        const verification = verifications[0];

        // Update verification status
        await pool.query(
            'UPDATE student_verifications SET status = ?, rejection_reason = ?, reviewed_at = NOW() WHERE id = ?',
            [status, status === 'rejected' ? (rejection_reason || 'Does not meet verification requirements') : null, id]
        );

        // Update user's is_verified status
        const userStatus = status === 'approved' ? 'verified' : 'rejected';
        await pool.query(
            'UPDATE users SET is_verified = ? WHERE id = ?',
            [userStatus, verification.user_id]
        );

        res.json({
            success: true,
            message: `Verification ${status} successfully`,
            data: {
                verification_id: id,
                user_id: verification.user_id,
                status: status
            }
        });
    } catch (error) {
        console.error('Review verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get comprehensive dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Verification stats
        const [verificationStats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM student_verifications
        `);

        // User stats
        const [userStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_verified = 'verified' THEN 1 ELSE 0 END) as verified_users,
                SUM(CASE WHEN auth_provider = 'google' THEN 1 ELSE 0 END) as google_users,
                SUM(CASE WHEN auth_provider = 'local' THEN 1 ELSE 0 END) as local_users,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_this_month
            FROM users
        `);

        // Product stats
        const [productStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_products,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week,
                ROUND(AVG(price), 2) as avg_price,
                ROUND(SUM(CASE WHEN status = 'sold' THEN price ELSE 0 END), 2) as total_sold_value
            FROM products
        `);

        // Category breakdown
        const [categoryStats] = await pool.query(`
            SELECT 
                category,
                COUNT(*) as count,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold
            FROM products
            GROUP BY category
            ORDER BY count DESC
        `);

        // Review stats
        const [reviewStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_reviews,
                ROUND(AVG(rating), 1) as avg_rating
            FROM reviews
        `);

        // Platform health metrics
        const totalProducts = Number(productStats[0].total_products || 0);
        const totalUsers = Number(userStats[0].total_users || 0);
        const totalSold = Number(productStats[0].sold || 0);
        const totalVerified = Number(userStats[0].verified_users || 0);

        const health = {
            sell_through_rate: totalProducts > 0 ? Math.round((totalSold / totalProducts) * 100) : 0,
            engagement_rate: totalUsers > 0 ? Math.round((totalProducts / totalUsers) * 100) / 100 : 0,
            verification_rate: totalUsers > 0 ? Math.round((totalVerified / totalUsers) * 100) : 0,
            listings_per_user: totalUsers > 0 ? Math.round((totalProducts / totalUsers) * 10) / 10 : 0
        };

        res.json({
            success: true,
            data: {
                verifications: verificationStats[0],
                users: userStats[0],
                products: productStats[0],
                categories: categoryStats,
                reviews: reviewStats[0],
                health,
                total_users: userStats[0].total_users
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all users with their stats
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { search, status, sort } = req.query;
        let query = `
            SELECT 
                u.id, u.name, u.email, u.campus, u.whatsapp, u.profile_image,
                u.auth_provider, u.is_verified, u.is_admin, u.created_at,
                COUNT(DISTINCT p.id) as total_listings,
                SUM(CASE WHEN p.status = 'available' THEN 1 ELSE 0 END) as active_listings,
                SUM(CASE WHEN p.status = 'sold' THEN 1 ELSE 0 END) as sold_listings,
                ROUND(AVG(r.rating), 1) as avg_rating,
                COUNT(DISTINCT r.id) as total_reviews
            FROM users u
            LEFT JOIN products p ON u.id = p.user_id
            LEFT JOIN reviews r ON u.id = r.seller_id
        `;
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status === 'verified') {
            conditions.push("u.is_verified = 'verified'");
        } else if (status === 'unverified') {
            conditions.push("u.is_verified = 'unverified'");
        } else if (status === 'admin') {
            conditions.push('u.is_admin = 1');
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY u.id';

        // Sorting
        if (sort === 'oldest') {
            query += ' ORDER BY u.created_at ASC';
        } else if (sort === 'name') {
            query += ' ORDER BY u.name ASC';
        } else if (sort === 'listings') {
            query += ' ORDER BY total_listings DESC';
        } else {
            query += ' ORDER BY u.created_at DESC';
        }

        const [users] = await pool.query(query, params);

        res.json({
            success: true,
            data: { users }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Toggle admin status for a user
// @route   PUT /api/admin/users/:id/toggle-admin
// @access  Private/Admin
const toggleAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-demotion
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own admin status'
            });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newStatus = users[0].is_admin ? 0 : 1;
        await pool.query('UPDATE users SET is_admin = ? WHERE id = ?', [newStatus, id]);

        res.json({
            success: true,
            message: newStatus ? 'User promoted to admin' : 'Admin privileges removed',
            data: { is_admin: newStatus }
        });
    } catch (error) {
        console.error('Toggle admin error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get campus analytics
// @route   GET /api/admin/campus-analytics
// @access  Private/Admin
const getCampusAnalytics = async (req, res) => {
    try {
        // Users per campus
        const [usersByCampus] = await pool.query(`
            SELECT campus, COUNT(*) as user_count
            FROM users
            GROUP BY campus
            ORDER BY user_count DESC
        `);

        // Products per campus
        const [productsByCampus] = await pool.query(`
            SELECT 
                campus,
                COUNT(*) as total_products,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
                ROUND(AVG(price), 2) as avg_price
            FROM products
            GROUP BY campus
            ORDER BY total_products DESC
        `);

        // Most popular categories per campus
        const [categoriesByCampus] = await pool.query(`
            SELECT 
                campus,
                category,
                COUNT(*) as count
            FROM products
            GROUP BY campus, category
            ORDER BY campus, count DESC
        `);

        res.json({
            success: true,
            data: {
                users_by_campus: usersByCampus,
                products_by_campus: productsByCampus,
                categories_by_campus: categoriesByCampus
            }
        });
    } catch (error) {
        console.error('Campus analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all products with seller info (admin product management)
// @route   GET /api/admin/products
// @access  Private/Admin
const getProducts = async (req, res) => {
    try {
        const { search, category, status, campus, sort, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, u.name as seller_name, u.email as seller_email, u.campus as seller_campus,
                   u.profile_image as seller_image, u.is_verified as seller_verified
            FROM products p
            JOIN users u ON p.user_id = u.id
        `;
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('(p.title LIKE ? OR p.description LIKE ? OR u.name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (category) {
            conditions.push('p.category = ?');
            params.push(category);
        }
        if (status) {
            conditions.push('p.status = ?');
            params.push(status);
        }
        if (campus) {
            conditions.push('p.campus = ?');
            params.push(campus);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Count total
        const countQuery = query.replace('SELECT p.*, u.name as seller_name, u.email as seller_email, u.campus as seller_campus,\n                   u.profile_image as seller_image, u.is_verified as seller_verified', 'SELECT COUNT(*) as total');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Sorting
        if (sort === 'oldest') query += ' ORDER BY p.created_at ASC';
        else if (sort === 'price_high') query += ' ORDER BY p.price DESC';
        else if (sort === 'price_low') query += ' ORDER BY p.price ASC';
        else if (sort === 'title') query += ' ORDER BY p.title ASC';
        else query += ' ORDER BY p.created_at DESC';

        query += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const [products] = await pool.query(query, params);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete a product (admin moderation)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = products[0];

        // Delete images from Cloudinary
        if (product.image_public_id) {
            try { await deleteImage(product.image_public_id); } catch (e) { console.error('Cloudinary delete error:', e); }
        }

        // Delete additional images
        const [additionalImages] = await pool.query('SELECT image_public_id FROM product_images WHERE product_id = ?', [id]);
        for (const img of additionalImages) {
            if (img.image_public_id) {
                try { await deleteImage(img.image_public_id); } catch (e) { console.error('Cloudinary delete error:', e); }
            }
        }

        await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        await pool.query('DELETE FROM favorites WHERE product_id = ?', [id]);
        await pool.query('DELETE FROM reviews WHERE product_id = ?', [id]);
        await pool.query('DELETE FROM products WHERE id = ?', [id]);

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get detailed user info (for admin user detail modal)
// @route   GET /api/admin/users/:id/details
// @access  Private/Admin
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // User info
        const [users] = await pool.query(`
            SELECT id, name, email, campus, whatsapp, profile_image, auth_provider,
                   is_verified, is_admin, created_at
            FROM users WHERE id = ?
        `, [id]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];

        // User's products
        const [products] = await pool.query(`
            SELECT id, title, price, category, status, image_url, created_at
            FROM products WHERE user_id = ?
            ORDER BY created_at DESC LIMIT 10
        `, [id]);

        // Reviews received
        const [reviews] = await pool.query(`
            SELECT r.*, u.name as reviewer_name, u.profile_image as reviewer_image
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            WHERE r.seller_id = ?
            ORDER BY r.created_at DESC LIMIT 10
        `, [id]);

        // Rating summary
        const [ratingSummary] = await pool.query(`
            SELECT COUNT(*) as total_reviews, ROUND(AVG(rating), 1) as avg_rating
            FROM reviews WHERE seller_id = ?
        `, [id]);

        // Listing stats
        const [listingStats] = await pool.query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
                ROUND(SUM(CASE WHEN status = 'sold' THEN price ELSE 0 END), 2) as total_earned
            FROM products WHERE user_id = ?
        `, [id]);

        // Verification info
        const [verification] = await pool.query(`
            SELECT status, university_name, student_id_number, submitted_at, reviewed_at
            FROM student_verifications WHERE user_id = ?
            ORDER BY submitted_at DESC LIMIT 1
        `, [id]);

        res.json({
            success: true,
            data: {
                user,
                products,
                reviews,
                rating: ratingSummary[0],
                listings: listingStats[0],
                verification: verification[0] || null
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getVerifications,
    reviewVerification,
    getDashboardStats,
    getUsers,
    toggleAdmin,
    getCampusAnalytics,
    getProducts,
    deleteProduct,
    getUserDetails
};
