// Admin authorization middleware
const adminAuth = (req, res, next) => {
    if (!req.user || req.user.is_admin !== 1) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

module.exports = { adminAuth };
