const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../config/database');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, campus, whatsapp } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, campus, whatsapp) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, campus, whatsapp]
        );

        // Generate token
        const token = generateToken(result.insertId);

        // Get created user (without password)
        const [users] = await pool.query(
            'SELECT id, name, email, campus, whatsapp, profile_image, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: users[0],
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required'
            });
        }

        // Verify the Google ID token
        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
        } catch (verifyError) {
            console.error('Google token verification failed:', verifyError);
            return res.status(401).json({
                success: false,
                message: 'Invalid Google credential'
            });
        }

        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists by google_id
        let [users] = await pool.query(
            'SELECT * FROM users WHERE google_id = ?',
            [googleId]
        );

        let user;

        if (users.length > 0) {
            // Existing Google user — log in
            user = users[0];
        } else {
            // Check if a user with this email already exists (registered with email/password)
            [users] = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length > 0) {
                // Link Google account to existing user
                user = users[0];
                await pool.query(
                    'UPDATE users SET google_id = ?, auth_provider = CASE WHEN auth_provider = "local" THEN "local" ELSE "google" END, profile_image = COALESCE(profile_image, ?) WHERE id = ?',
                    [googleId, picture, user.id]
                );
                user.google_id = googleId;
                if (!user.profile_image && picture) {
                    user.profile_image = picture;
                }
            } else {
                // Create a brand new user from Google
                const [result] = await pool.query(
                    'INSERT INTO users (name, email, google_id, auth_provider, campus, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
                    [name, email, googleId, 'google', 'Not set', picture || null]
                );

                [users] = await pool.query(
                    'SELECT id, name, email, campus, whatsapp, profile_image, created_at FROM users WHERE id = ?',
                    [result.insertId]
                );
                user = users[0];
            }
        }

        // Generate JWT token
        const token = generateToken(user.id);

        // Remove sensitive data from response
        delete user.password;
        delete user.google_id;

        // Check if profile is incomplete (new Google users need to set campus & whatsapp)
        const needsProfileCompletion = !user.whatsapp || user.campus === 'Not set';

        res.json({
            success: true,
            message: 'Google authentication successful',
            data: {
                user,
                token,
                needsProfileCompletion
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during Google authentication'
        });
    }
};

module.exports = { register, login, getMe, googleAuth };
