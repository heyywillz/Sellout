const { pool } = require('../config/database');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { deleteLocalFile } = require('../middleware/upload');

// @desc    Submit student ID for verification
// @route   POST /api/verification/submit
// @access  Private
const submitVerification = async (req, res) => {
    try {
        // Check if user already has a pending or approved verification
        const [existing] = await pool.query(
            'SELECT * FROM student_verifications WHERE user_id = ?',
            [req.user.id]
        );

        if (existing.length > 0) {
            if (existing[0].status === 'approved') {
                if (req.file) deleteLocalFile(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: 'You are already verified'
                });
            }
            if (existing[0].status === 'pending') {
                if (req.file) deleteLocalFile(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: 'You already have a pending verification request'
                });
            }
            // If rejected, delete old record so they can resubmit
            if (existing[0].student_id_public_id) {
                await deleteImage(existing[0].student_id_public_id);
            }
            await pool.query('DELETE FROM student_verifications WHERE user_id = ?', [req.user.id]);
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Student ID image is required'
            });
        }

        const { university_name, student_id_number } = req.body;

        if (!university_name || !student_id_number) {
            deleteLocalFile(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'University name and student ID number are required'
            });
        }

        // Upload student ID image to Cloudinary
        let imageUrl, imagePublicId;
        try {
            const uploadResult = await uploadImage(req.file.path, 'sellout/verification');
            imageUrl = uploadResult.url;
            imagePublicId = uploadResult.public_id;
            deleteLocalFile(req.file.path);
        } catch (uploadError) {
            deleteLocalFile(req.file.path);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload student ID image'
            });
        }

        // Insert verification record
        await pool.query(
            `INSERT INTO student_verifications (user_id, student_id_image_url, student_id_public_id, university_name, student_id_number)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, imageUrl, imagePublicId, university_name, student_id_number]
        );

        // Update user verification status to pending
        await pool.query(
            "UPDATE users SET is_verified = 'pending' WHERE id = ?",
            [req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Verification request submitted successfully. You will be notified once reviewed.',
            data: {
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Submit verification error:', error);
        if (req.file) deleteLocalFile(req.file.path);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get current user's verification status
// @route   GET /api/verification/status
// @access  Private
const getVerificationStatus = async (req, res) => {
    try {
        const [verifications] = await pool.query(
            'SELECT id, status, university_name, student_id_number, rejection_reason, submitted_at, reviewed_at FROM student_verifications WHERE user_id = ?',
            [req.user.id]
        );

        if (verifications.length === 0) {
            return res.json({
                success: true,
                data: {
                    status: 'unverified',
                    verification: null
                }
            });
        }

        res.json({
            success: true,
            data: {
                status: verifications[0].status === 'approved' ? 'verified' : verifications[0].status,
                verification: verifications[0]
            }
        });
    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { submitVerification, getVerificationStatus };
