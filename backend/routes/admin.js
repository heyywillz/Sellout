const express = require('express');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const { getVerifications, reviewVerification, getDashboardStats } = require('../controllers/adminController');

const router = express.Router();

// All routes require auth + admin
router.get('/verifications', auth, adminAuth, getVerifications);
router.put('/verifications/:id/review', auth, adminAuth, reviewVerification);
router.get('/stats', auth, adminAuth, getDashboardStats);

module.exports = router;
