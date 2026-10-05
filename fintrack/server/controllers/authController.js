const authService = require('../services/authService');

// POST /api/auth/register
const register = async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'Registration successful', data: { user, token } });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ success: true, message: 'Login successful', data: { user, token } });
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

module.exports = { register, login, getMe };
