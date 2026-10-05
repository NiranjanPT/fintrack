const savingsGoalService = require('../services/savingsGoalService');

// GET /api/savings-goals
const getSavingsGoals = async (req, res) => {
  const result = await savingsGoalService.getSavingsGoals(req.user._id);
  res.json({ success: true, data: result });
};

// GET /api/savings-goals/:id
const getSavingsGoal = async (req, res) => {
  const goal = await savingsGoalService.getSavingsGoalById(req.user._id, req.params.id);
  res.json({ success: true, data: goal });
};

// POST /api/savings-goals
const createSavingsGoal = async (req, res) => {
  const goal = await savingsGoalService.createSavingsGoal(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Savings goal created', data: goal });
};

// PUT /api/savings-goals/:id
const updateSavingsGoal = async (req, res) => {
  const goal = await savingsGoalService.updateSavingsGoal(req.user._id, req.params.id, req.body);
  res.json({ success: true, message: 'Savings goal updated', data: goal });
};

// POST /api/savings-goals/:id/add
const addMoney = async (req, res) => {
  const goal = await savingsGoalService.addMoney(req.user._id, req.params.id, req.body.amount);
  res.json({ success: true, message: 'Money added to savings goal', data: goal });
};

// DELETE /api/savings-goals/:id
const deleteSavingsGoal = async (req, res) => {
  await savingsGoalService.deleteSavingsGoal(req.user._id, req.params.id);
  res.json({ success: true, message: 'Savings goal deleted' });
};

module.exports = {
  getSavingsGoals,
  getSavingsGoal,
  createSavingsGoal,
  updateSavingsGoal,
  addMoney,
  deleteSavingsGoal,
};
