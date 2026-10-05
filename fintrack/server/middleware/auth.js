// Experiment 6 - Authorization middleware (protects private routes with JWT)
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Not authorized, no token provided');
  }

  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid token';
    throw ApiError.unauthorized(message);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  // Every controller uses req.user._id so users only ever see their own data
  req.user = user;
  next();
};

module.exports = { protect };
