const auth = require('./auth');

const adminAuth = async (req, res, next) => {
    try {
        // First run the general auth middleware
        await new Promise((resolve, reject) => {
            auth(req, res, (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // Check if user exists and is an admin
        if (!req.user) {
            console.error('Admin auth failed: User not found in request');
            return res.status(401).json({
                message: 'Authentication failed',
                detail: 'User not found in request'
            });
        }

        // Log the attempt with user details
        console.log('Admin access attempt:', {
            userId: req.user.userId,
            role: req.user.role,
            endpoint: req.originalUrl,
            method: req.method
        });

        if (req.user.role !== 'admin') {
            console.error(`Access denied: User ${req.user.userId} with role ${req.user.role} attempted to access admin route ${req.originalUrl}`);
            return res.status(403).json({
                message: 'Access denied',
                detail: 'This route requires admin privileges'
            });
        }

        console.log(`Admin access granted for user: ${req.user.userId} to ${req.method} ${req.originalUrl}`);
        next();
    } catch (err) {
        console.error('Admin auth middleware error:', err);
        res.status(500).json({
            message: 'Internal server error in admin auth middleware',
            detail: err.message
        });
    }
};

module.exports = adminAuth;