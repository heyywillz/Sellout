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

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM student_verifications
        `);

        const [userStats] = await pool.query(`
            SELECT COUNT(*) as total_users FROM users
        `);

        res.json({
            success: true,
            data: {
                verifications: stats[0],
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

module.exports = { getVerifications, reviewVerification, getDashboardStats };
