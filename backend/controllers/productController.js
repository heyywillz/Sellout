const { validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { deleteLocalFile } = require('../middleware/upload');

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
    try {
        console.log('--- CREATE PRODUCT DEBUG ---');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files ? req.files.length + ' file(s)' : 'NO FILES');

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
            if (req.files) req.files.forEach(f => deleteLocalFile(f.path));
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product image is required'
            });
        }

        const { title, description, category, condition, price, campus } = req.body;
        const mainFile = req.files[0];

        // Upload main image to Cloudinary
        let imageUrl, imagePublicId;
        try {
            const uploadResult = await uploadImage(mainFile.path, 'sellout/products');
            imageUrl = uploadResult.url;
            imagePublicId = uploadResult.public_id;
            deleteLocalFile(mainFile.path);
        } catch (uploadError) {
            req.files.forEach(f => deleteLocalFile(f.path));
            return res.status(500).json({
                success: false,
                message: 'Failed to upload image'
            });
        }

        // Create product
        const [result] = await pool.query(
            `INSERT INTO products 
            (user_id, title, description, category, product_condition, price, campus, image_url, image_public_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, title, description, category, condition, price, campus || req.user.campus, imageUrl, imagePublicId]
        );

        const productId = result.insertId;

        // Handle additional images (if any)
        if (req.files && req.files.length > 0) {
            // The main image is req.files[0] (already uploaded above)
            // Additional images start from index 1
            for (let i = 1; i < req.files.length && i < 5; i++) {
                try {
                    const additionalUpload = await uploadImage(req.files[i].path, 'sellout/products');
                    await pool.query(
                        'INSERT INTO product_images (product_id, image_url, image_public_id, display_order) VALUES (?, ?, ?, ?)',
                        [productId, additionalUpload.url, additionalUpload.public_id, i]
                    );
                    deleteLocalFile(req.files[i].path);
                } catch (imgError) {
                    console.error('Additional image upload error:', imgError);
                    deleteLocalFile(req.files[i].path);
                }
            }
        }

        // Get created product with user info
        const [products] = await pool.query(
            `SELECT p.*, u.name as seller_name, u.whatsapp as seller_whatsapp, u.profile_image as seller_image
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?`,
            [productId]
        );

        // Get additional images
        const [additionalImages] = await pool.query(
            'SELECT id, image_url, display_order FROM product_images WHERE product_id = ? ORDER BY display_order',
            [productId]
        );

        const productData = products[0];
        productData.additional_images = additionalImages;

        res.status(201).json({
            success: true,
            message: 'Product listed successfully',
            data: {
                product: productData
            }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            condition,
            campus,
            minPrice,
            maxPrice,
            status = 'available',
            sort = 'newest',
            page = 1,
            limit = 12
        } = req.query;

        const offset = (page - 1) * limit;
        let query = `
            SELECT p.*, u.name as seller_name, u.whatsapp as seller_whatsapp, u.profile_image as seller_image
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // Apply filters
        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category && category !== 'all') {
            query += ' AND p.category = ?';
            params.push(category);
        }

        if (condition && condition !== 'all') {
            query += ' AND p.product_condition = ?';
            params.push(condition);
        }

        if (campus && campus !== 'all') {
            query += ' AND p.campus = ?';
            params.push(campus);
        }

        if (minPrice) {
            query += ' AND p.price >= ?';
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += ' AND p.price <= ?';
            params.push(parseFloat(maxPrice));
        }

        // Count query
        const countQuery = query.replace(
            'SELECT p.*, u.name as seller_name, u.whatsapp as seller_whatsapp, u.profile_image as seller_image',
            'SELECT COUNT(*) as total'
        );
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Apply sorting
        switch (sort) {
            case 'price_low':
                query += ' ORDER BY p.price ASC';
                break;
            case 'price_high':
                query += ' ORDER BY p.price DESC';
                break;
            case 'oldest':
                query += ' ORDER BY p.created_at ASC';
                break;
            case 'newest':
            default:
                query += ' ORDER BY p.created_at DESC';
                break;
        }

        // Apply pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await pool.query(query, params);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.query(
            `SELECT p.*, u.name as seller_name, u.whatsapp as seller_whatsapp, u.profile_image as seller_image, u.campus as seller_campus
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const product = products[0];

        // Get additional images
        const [additionalImages] = await pool.query(
            'SELECT id, image_url, display_order FROM product_images WHERE product_id = ? ORDER BY display_order',
            [id]
        );
        product.additional_images = additionalImages;

        // Get seller rating
        const [sellerRating] = await pool.query(
            `SELECT COUNT(*) as total_reviews, ROUND(AVG(rating), 1) as average_rating
            FROM reviews WHERE seller_id = ?`,
            [product.user_id]
        );
        product.seller_rating = sellerRating[0].average_rating || 0;
        product.seller_total_reviews = sellerRating[0].total_reviews;

        // Get favorite count
        const [favCount] = await pool.query(
            'SELECT COUNT(*) as count FROM favorites WHERE product_id = ?',
            [id]
        );
        product.favorite_count = favCount[0].count;

        // Get related products (same category, different id)
        const [relatedProducts] = await pool.query(
            `SELECT p.*, u.name as seller_name
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE p.category = ? AND p.id != ? AND p.status = 'available'
            ORDER BY p.created_at DESC
            LIMIT 4`,
            [product.category, id]
        );

        res.json({
            success: true,
            data: {
                product,
                relatedProducts
            }
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists and belongs to user
        const [existingProducts] = await pool.query(
            'SELECT * FROM products WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (existingProducts.length === 0) {
            if (req.file) deleteLocalFile(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        const existingProduct = existingProducts[0];
        const { title, description, category, condition, price, campus, status } = req.body;

        let imageUrl = existingProduct.image_url;
        let imagePublicId = existingProduct.image_public_id;

        // Handle new image upload
        if (req.file) {
            try {
                const uploadResult = await uploadImage(req.file.path, 'sellout/products');
                imageUrl = uploadResult.url;

                // Delete old image from Cloudinary
                if (existingProduct.image_public_id) {
                    await deleteImage(existingProduct.image_public_id);
                }

                imagePublicId = uploadResult.public_id;
                deleteLocalFile(req.file.path);
            } catch (uploadError) {
                deleteLocalFile(req.file.path);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image'
                });
            }
        }

        // Update product
        await pool.query(
            `UPDATE products SET 
            title = ?, description = ?, category = ?, product_condition = ?, 
            price = ?, campus = ?, image_url = ?, image_public_id = ?, status = ?
            WHERE id = ?`,
            [
                title || existingProduct.title,
                description || existingProduct.description,
                category || existingProduct.category,
                condition || existingProduct.product_condition,
                price || existingProduct.price,
                campus || existingProduct.campus,
                imageUrl,
                imagePublicId,
                status || existingProduct.status,
                id
            ]
        );

        // Get updated product
        const [products] = await pool.query(
            `SELECT p.*, u.name as seller_name, u.whatsapp as seller_whatsapp
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: {
                product: products[0]
            }
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists and belongs to user
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        // Delete main image from Cloudinary
        if (products[0].image_public_id) {
            await deleteImage(products[0].image_public_id);
        }

        // Delete additional images from Cloudinary
        try {
            const [additionalImages] = await pool.query(
                'SELECT image_public_id FROM product_images WHERE product_id = ?',
                [id]
            );
            for (const img of additionalImages) {
                if (img.image_public_id) {
                    await deleteImage(img.image_public_id);
                }
            }
        } catch (imgErr) {
            console.error('Error cleaning up additional images:', imgErr);
        }

        // Delete product (cascades to favorites, reviews, product_images)
        await pool.query('DELETE FROM products WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Mark product as sold
// @route   PUT /api/products/:id/sold
// @access  Private
const markAsSold = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists and belongs to user
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        // Update status
        await pool.query(
            'UPDATE products SET status = ? WHERE id = ?',
            ['sold', id]
        );

        res.json({
            success: true,
            message: 'Product marked as sold'
        });
    } catch (error) {
        console.error('Mark as sold error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all campuses
// @route   GET /api/products/campuses
// @access  Public
const getCampuses = async (req, res) => {
    try {
        const [campuses] = await pool.query(
            `SELECT DISTINCT campus FROM products WHERE status = 'available' ORDER BY campus`
        );

        res.json({
            success: true,
            data: {
                campuses: campuses.map(c => c.campus)
            }
        });
    } catch (error) {
        console.error('Get campuses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    markAsSold,
    getCampuses
};
