const analyticsService = require('../services/analyticsService');
const { parseMonthYear } = require('../utils/dateUtils');

// GET /api/analytics/dashboard?month=10&year=2026
const getDashboard = async (req, res) => {
  const period = parseMonthYear(req.query);
  const data = await analyticsService.getDashboard(req.user._id, period);
  res.json({ success: true, data });
};

// GET /api/analytics/monthly?month=10&year=2026
const getMonthlyAnalytics = async (req, res) => {
  const period = parseMonthYear(req.query);
  const data = await analyticsService.getMonthlyAnalytics(req.user._id, period);
  res.json({ success: true, data });
};

module.exports = { getDashboard, getMonthlyAnalytics };
