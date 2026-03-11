const express = require('express');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const {
    getVerifications,
    reviewVerification,
    getDashboardStats,
    getUsers,
    toggleAdmin,
    getCampusAnalytics,
    getProducts,
    deleteProduct,
    getUserDetails
} = require('../controllers/adminController');

const router = express.Router();

// All routes require auth + admin
router.get('/verifications', auth, adminAuth, getVerifications);
router.put('/verifications/:id/review', auth, adminAuth, reviewVerification);
router.get('/stats', auth, adminAuth, getDashboardStats);
router.get('/users', auth, adminAuth, getUsers);
router.get('/users/:id/details', auth, adminAuth, getUserDetails);
router.put('/users/:id/toggle-admin', auth, adminAuth, toggleAdmin);
router.get('/products', auth, adminAuth, getProducts);
router.delete('/products/:id', auth, adminAuth, deleteProduct);
router.get('/campus-analytics', auth, adminAuth, getCampusAnalytics);

module.exports = router;
