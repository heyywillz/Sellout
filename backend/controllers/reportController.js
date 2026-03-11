const { pool } = require('../config/database');

// Submit a report (logged-in user)
const reportProduct = async (req, res) => {
    try {
        const { reason, details } = req.body;
        const productId = req.params.id;
        const reporterId = req.user.id;

        if (!reason) {
            return res.status(400).json({ success: false, message: 'Reason is required' });
        }

        const validReasons = ['scam', 'inappropriate', 'duplicate', 'wrong_category', 'misleading', 'other'];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({ success: false, message: 'Invalid report reason' });
        }

        // Check product exists
        const [product] = await pool.query('SELECT id, user_id FROM products WHERE id = ?', [productId]);
        if (product.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Can't report own product
        if (product[0].user_id === reporterId) {
            return res.status(400).json({ success: false, message: 'You cannot report your own product' });
        }

        // Check if already reported
        const [existing] = await pool.query(
            'SELECT id FROM product_reports WHERE reporter_id = ? AND product_id = ?',
            [reporterId, productId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'You have already reported this product' });
        }

        await pool.query(
            'INSERT INTO product_reports (reporter_id, product_id, reason, details) VALUES (?, ?, ?, ?)',
            [reporterId, productId, reason, details || null]
        );

        res.status(201).json({ success: true, message: 'Report submitted successfully. Our team will review it shortly.' });
    } catch (error) {
        console.error('Error reporting product:', error);
        res.status(500).json({ success: false, message: 'Failed to submit report' });
    }
};

// Check if user already reported a product
const checkReport = async (req, res) => {
    try {
        const [report] = await pool.query(
            'SELECT id FROM product_reports WHERE reporter_id = ? AND product_id = ?',
            [req.user.id, req.params.id]
        );
        res.json({ success: true, data: { hasReported: report.length > 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to check report status' });
    }
};

// Admin: Get reports with filters
const getReports = async (req, res) => {
    try {
        const { status, reason, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let where = 'WHERE 1=1';
        const params = [];

        if (status) {
            where += ' AND pr.status = ?';
            params.push(status);
        }
        if (reason) {
            where += ' AND pr.reason = ?';
            params.push(reason);
        }

        // Count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM product_reports pr ${where}`,
            params
        );
        const total = countResult[0].total;

        // Fetch reports with product + reporter info
        const [reports] = await pool.query(`
            SELECT 
                pr.id, pr.reason, pr.details, pr.status, pr.admin_note, pr.created_at, pr.resolved_at,
                p.id AS product_id, p.title AS product_title, p.image_url AS product_image,
                p.price AS product_price, p.status AS product_status, p.category,
                reporter.id AS reporter_id, reporter.name AS reporter_name, reporter.email AS reporter_email,
                seller.id AS seller_id, seller.name AS seller_name,
                (SELECT COUNT(*) FROM product_reports WHERE product_id = pr.product_id AND status = 'pending') AS total_reports
            FROM product_reports pr
            JOIN products p ON pr.product_id = p.id
            JOIN users reporter ON pr.reporter_id = reporter.id
            JOIN users seller ON p.user_id = seller.id
            ${where}
            ORDER BY 
                CASE pr.status WHEN 'pending' THEN 0 WHEN 'reviewed' THEN 1 WHEN 'dismissed' THEN 2 END,
                pr.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, Number(limit), offset]);

        res.json({
            success: true,
            data: {
                reports,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
};

// Admin: Get report stats (for badge)
const getReportStats = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
                SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) as dismissed
            FROM product_reports
        `);
        res.json({ success: true, data: stats[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch report stats' });
    }
};

// Admin: Resolve a report (review or dismiss)
const resolveReport = async (req, res) => {
    try {
        const { status, admin_note } = req.body;
        const reportId = req.params.id;

        if (!['reviewed', 'dismissed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be "reviewed" or "dismissed"' });
        }

        const [report] = await pool.query('SELECT id FROM product_reports WHERE id = ?', [reportId]);
        if (report.length === 0) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        await pool.query(
            'UPDATE product_reports SET status = ?, admin_note = ?, resolved_at = NOW() WHERE id = ?',
            [status, admin_note || null, reportId]
        );

        res.json({ success: true, message: `Report ${status} successfully` });
    } catch (error) {
        console.error('Error resolving report:', error);
        res.status(500).json({ success: false, message: 'Failed to resolve report' });
    }
};

// Admin: Resolve all reports for a product at once
const resolveProductReports = async (req, res) => {
    try {
        const { status, admin_note } = req.body;
        const productId = req.params.productId;

        if (!['reviewed', 'dismissed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be "reviewed" or "dismissed"' });
        }

        await pool.query(
            'UPDATE product_reports SET status = ?, admin_note = ?, resolved_at = NOW() WHERE product_id = ? AND status = ?',
            [status, admin_note || null, productId, 'pending']
        );

        res.json({ success: true, message: `All pending reports for this product resolved` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to resolve reports' });
    }
};

module.exports = {
    reportProduct,
    checkReport,
    getReports,
    getReportStats,
    resolveReport,
    resolveProductReports
};
