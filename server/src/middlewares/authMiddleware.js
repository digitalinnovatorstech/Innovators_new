const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
 
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    res.status(403).json({ message: 'Invalid Token'});
  }
};


module.exports = {authMiddleware}
