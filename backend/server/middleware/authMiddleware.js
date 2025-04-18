// server/middleware/authMiddleware.js
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
  const payload = { userId: user.id, role: user.role };
  return jwt.encode(payload, process.env.JWT_SECRET);
};

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Access denied');
  
  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid token');
  }
};

module.exports = { generateToken, authenticateJWT };
