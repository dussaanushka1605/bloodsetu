const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        console.log('Auth header received:', authHeader ? 'Present' : 'Missing');

        if (!authHeader) {
            console.log('No Authorization header found');
            return res.status(401).json({ 
                message: 'No authentication token, access denied',
                detail: 'Authorization header is missing'
            });
        }

        // Extract token
        const token = authHeader.replace('Bearer ', '');
        
        // Only log a portion of the token for security
        if (token && token.length > 20) {
            console.log('Token found:', token.substring(0, 10) + '...' + token.substring(token.length - 5));
        } else {
            console.log('Invalid token format received');
        }
        
        if (!token) {
            console.log('No token found after Bearer prefix');
            return res.status(401).json({ 
                message: 'No authentication token, access denied',
                detail: 'Token is missing from Authorization header'
            });
        }

        try {
            // Verify token
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            
            // Validate that the token contains required fields
            if (!verified || !verified.role || !(verified.userId || verified._id)) {
                console.error('Token missing required fields');
                return res.status(401).json({ 
                    message: 'Invalid token format',
                    detail: 'Token is missing required fields'
                });
            }
            
            console.log('Token verified successfully:', {
                userId: verified.userId || verified._id,
                role: verified.role,
                exp: verified.exp ? new Date(verified.exp * 1000).toISOString() : 'No expiration'
            });

            req.user = {
                ...verified,
                userId: verified.userId || verified._id,
                id: verified.userId || verified._id, // Add id property for consistency
                _id: verified.userId || verified._id  // Add _id property for consistency
            };
            
            console.log('User object set in request:', {
                id: req.user.id,
                userId: req.user.userId,
                _id: req.user._id,
                role: req.user.role
            });
            
            next();
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError.message);
            
            // Provide more specific error messages based on the error type
            if (verifyError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Token has expired',
                    detail: 'Please log in again to get a new token'
                });
            } else if (verifyError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: 'Invalid token',
                    detail: 'Token signature verification failed'
                });
            } else {
                return res.status(401).json({ 
                    message: 'Token is not valid',
                    detail: verifyError.message
                });
            }
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ 
            message: 'Internal server error in auth middleware',
            detail: err.message
        });
    }
};

module.exports = auth;