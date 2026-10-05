const budgetService = require('../services/budgetService');
const { parseMonthYear } = require('../utils/dateUtils');

// GET /api/budgets?month=10&year=2026
const getBudgets = async (req, res) => {
  const period = parseMonthYear(req.query);
  const result = await budgetService.getBudgets(req.user._id, period);
  res.json({ success: true, data: result });
};

// GET /api/budgets/alerts?month=10&year=2026
const getBudgetAlerts = async (req, res) => {
  const period = parseMonthYear(req.query);
  const alerts = await budgetService.getBudgetAlerts(req.user._id, period);
  res.json({ success: true, count: alerts.length, data: alerts });
};

// GET /api/budgets/:id
const getBudget = async (req, res) => {
  const budget = await budgetService.getBudgetById(req.user._id, req.params.id);
  res.json({ success: true, data: budget });
};

// POST /api/budgets
const createBudget = async (req, res) => {
  const budget = await budgetService.createBudget(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Budget created', data: budget });
};

// PUT /api/budgets/:id
const updateBudget = async (req, res) => {
  const budget = await budgetService.updateBudget(req.user._id, req.params.id, req.body);
  res.json({ success: true, message: 'Budget updated', data: budget });
};

// DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  await budgetService.deleteBudget(req.user._id, req.params.id);
  res.json({ success: true, message: 'Budget deleted' });
};

module.exports = { getBudgets, getBudgetAlerts, getBudget, createBudget, updateBudget, deleteBudget };
