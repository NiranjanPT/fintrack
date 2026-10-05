// Experiment 6 - Authentication logic (bcrypt + JWT)
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const categoryService = require('./categoryService');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email and password are required');
  }
  if (String(password).length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: normalizeEmail(email) });
  if (existing) throw ApiError.conflict('Email is already registered');

  // Password is hashed by the pre-save hook in the User model
  const user = await User.create({ name: String(name), email: normalizeEmail(email), password: String(password) });
  await categoryService.createDefaultCategories(user._id);

  return { user, token: generateToken(user._id) };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');
  if (!user || !(await user.comparePassword(String(password)))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return { user, token: generateToken(user._id) };
};

module.exports = { register, login, generateToken };
