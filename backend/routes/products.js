const express = require('express');
const { body } = require('express-validator');
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    markAsSold,
    getCampuses
} = require('../controllers/productController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const productValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Books', 'Electronics', 'Fashion', 'Furniture', 'Others']).withMessage('Invalid category'),
    body('condition')
        .notEmpty().withMessage('Condition is required')
        .isIn(['New', 'Fairly Used', 'Used']).withMessage('Invalid condition'),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('campus')
        .optional()
        .trim()
];

const updateProductValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
    body('category')
        .optional()
        .isIn(['Books', 'Electronics', 'Fashion', 'Furniture', 'Others']).withMessage('Invalid category'),
    body('condition')
        .optional()
        .isIn(['New', 'Fairly Used', 'Used']).withMessage('Invalid condition'),
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('status')
        .optional()
        .isIn(['available', 'sold']).withMessage('Invalid status')
];

// Public routes
router.get('/', getProducts);
router.get('/campuses', getCampuses);
router.get('/:id', getProduct);

// Protected routes
router.post('/', auth, upload.array('images', 5), productValidation, createProduct);
router.put('/:id', auth, upload.single('image'), updateProductValidation, updateProduct);
router.delete('/:id', auth, deleteProduct);
router.put('/:id/sold', auth, markAsSold);

module.exports = router;
