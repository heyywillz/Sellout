const express = require('express');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const {
    reportProduct,
    checkReport,
    getReports,
    getReportStats,
    resolveReport,
    resolveProductReports
} = require('../controllers/reportController');

const router = express.Router();

// User routes (require auth)
router.post('/:id', auth, reportProduct);
router.get('/check/:id', auth, checkReport);

// Admin routes (require auth + admin)
router.get('/', auth, adminAuth, getReports);
router.get('/stats', auth, adminAuth, getReportStats);
router.put('/:id/resolve', auth, adminAuth, resolveReport);
router.put('/product/:productId/resolve-all', auth, adminAuth, resolveProductReports);

module.exports = router;
