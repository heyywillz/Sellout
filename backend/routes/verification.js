const express = require('express');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { submitVerification, getVerificationStatus } = require('../controllers/verificationController');

const router = express.Router();

// Protected routes
router.post('/submit', auth, upload.single('student_id_image'), submitVerification);
router.get('/status', auth, getVerificationStatus);

module.exports = router;
