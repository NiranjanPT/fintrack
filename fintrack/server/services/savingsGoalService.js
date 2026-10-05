const SavingsGoal = require('../models/SavingsGoal');
const ApiError = require('../utils/ApiError');
const { round2, pick } = require('../utils/helpers');

const ALLOWED_FIELDS = ['name', 'targetAmount', 'currentAmount', 'deadline', 'description'];

const summarize = (goals) => {
  const totalSaved = round2(goals.reduce((sum, g) => sum + g.currentAmount, 0));
  const totalTarget = round2(goals.reduce((sum, g) => sum + g.targetAmount, 0));
  return {
    count: goals.length,
    completedCount: goals.filter((g) => g.currentAmount >= g.targetAmount).length,
    totalSaved,
    totalTarget,
    overallProgress: totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0,
  };
};

const getSavingsGoals = async (userId) => {
  const goals = await SavingsGoal.find({ user: userId }).sort({ deadline: 1, createdAt: -1 });
  return { goals, summary: summarize(goals) };
};

const getSavingsGoalById = async (userId, id) => {
  const goal = await SavingsGoal.findOne({ _id: id, user: userId });
  if (!goal) throw ApiError.notFound('Savings goal not found');
  return goal;
};

const createSavingsGoal = async (userId, body) => {
  const data = pick(body, ALLOWED_FIELDS);
  if (data.deadline === '') delete data.deadline;
  return SavingsGoal.create({ ...data, user: userId });
};

const updateSavingsGoal = async (userId, id, body) => {
  const goal = await getSavingsGoalById(userId, id);
  const data = pick(body, ALLOWED_FIELDS);
  if (data.deadline === '') data.deadline = undefined;

  Object.assign(goal, data);
  await goal.save();
  return goal;
};

// Adds money to a goal ("contribute")
const addMoney = async (userId, id, amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw ApiError.badRequest('Amount must be a positive number');

  const goal = await getSavingsGoalById(userId, id);
  goal.currentAmount = round2(goal.currentAmount + value);
  await goal.save();
  return goal;
};

const deleteSavingsGoal = async (userId, id) => {
  const goal = await SavingsGoal.findOneAndDelete({ _id: id, user: userId });
  if (!goal) throw ApiError.notFound('Savings goal not found');
  return goal;
};

module.exports = {
  summarize,
  getSavingsGoals,
  getSavingsGoalById,
  createSavingsGoal,
  updateSavingsGoal,
  addMoney,
  deleteSavingsGoal,
};
