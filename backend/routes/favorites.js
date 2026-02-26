const express = require('express');
const { toggleFavorite, getMyFavorites, checkFavorite, getFavoriteCount } = require('../controllers/favoriteController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/', auth, getMyFavorites);
router.post('/:productId', auth, toggleFavorite);
router.get('/check/:productId', auth, checkFavorite);

// Public routes
router.get('/count/:productId', getFavoriteCount);

module.exports = router;
