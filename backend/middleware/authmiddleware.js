const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password'); // Exclude password field

        if (!user) {
            return res.status(401).json({ msg: 'User not found' });
        }

        req.user = user;  // Attach user to the request object
        next();  // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Auth error:', err);

        // Handle specific errors for clarity
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired' });
        }

        res.status(401).json({ msg: 'Invalid or expired token' });
    }
};

module.exports = { authenticateUser };
