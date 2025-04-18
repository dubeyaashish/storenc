// server/middleware/authMiddleware.js
const jwt = require('jwt-simple');
require('dotenv').config();

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id and role
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = { 
    userId: user.id, 
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };
  return jwt.encode(payload, process.env.JWT_SECRET);
};

/**
 * JWT Authentication middleware
 * Extracts and verifies JWT token from Authorization header
 */
const authenticateJWT = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Handle both "Bearer token" and plain token formats
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;
  
  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Authentication error:', err);
    return res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Authentication required.' });
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ 
        message: 'Forbidden. You do not have permission to access this resource.' 
      });
    }
  };
};

module.exports = { 
  generateToken, 
  authenticateJWT,
  authorizeRoles
};