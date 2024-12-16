const jwt = require('jsonwebtoken');

// Middleware to verify JWT tokens
module.exports = (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload (userId) to the request object
    next(); // Move to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
