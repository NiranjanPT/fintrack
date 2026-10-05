const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const ApiError = require('../utils/ApiError');
const categoryService = require('./categoryService');
const { getMonthRange, getYearRange, MONTH_NAMES } = require('../utils/dateUtils');
const { toObjectId, round2, pick } = require('../utils/helpers');

const ALLOWED_FIELDS = ['category', 'month', 'year', 'limit', 'alertThreshold'];

// 80% (or the custom threshold) -> warning, 100% -> exceeded
const getBudgetStatus = (limit, spent, alertThreshold = 80) => {
  const percentage = limit > 0 ? Math.round((spent / limit) * 1000) / 10 : 0;
  let status = 'ok';
  if (percentage >= 100) status = 'exceeded';
  else if (percentage >= alertThreshold) status = 'warning';

  return {
    spent: round2(spent),
    remaining: round2(Math.max(limit - spent, 0)),
    overspent: round2(Math.max(spent - limit, 0)),
    percentage,
    status,
  };
};

// Total expense per category per month inside a date range -> Map("categoryId-month-year" => total)
const getSpendingMap = async (userId, start, end) => {
  const rows = await Transaction.aggregate([
    { $match: { user: toObjectId(userId), type: 'expense', date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { category: '$category', month: { $month: '$date' }, year: { $year: '$date' } },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const map = new Map();
  rows.forEach((row) => {
    map.set(`${row._id.category}-${row._id.month}-${row._id.year}`, row.total);
  });
  return map;
};

// Adds spent / remaining / percentage / status to each budget
const attachSpending = (budgets, spendingMap) =>
  budgets.map((budget) => {
    const obj = budget.toObject();
    const categoryId = obj.category?._id || obj.category;
    const spent = spendingMap.get(`${categoryId}-${obj.month}-${obj.year}`) || 0;
    return {
      ...obj,
      period: `${MONTH_NAMES[obj.month - 1]} ${obj.year}`,
      ...getBudgetStatus(obj.limit, spent, obj.alertThreshold),
    };
  });

const summarize = (budgets) => {
  const totalLimit = round2(budgets.reduce((sum, b) => sum + b.limit, 0));
  const totalSpent = round2(budgets.reduce((sum, b) => sum + b.spent, 0));
  return {
    count: budgets.length,
    totalLimit,
    totalSpent,
    totalRemaining: round2(Math.max(totalLimit - totalSpent, 0)),
    percentage: totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 1000) / 10 : 0,
    warningCount: budgets.filter((b) => b.status === 'warning').length,
    exceededCount: budgets.filter((b) => b.status === 'exceeded').length,
  };
};

// Budgets for one month, or for a whole year when month is null
const getBudgets = async (userId, { month, year }) => {
  const filter = { user: userId, year };
  if (month) filter.month = month;

  const range = month ? getMonthRange(month, year) : getYearRange(year);

  const [budgets, spendingMap] = await Promise.all([
    Budget.find(filter).populate('category', 'name type').sort({ month: 1, limit: -1 }),
    getSpendingMap(userId, range.start, range.end),
  ]);

  const items = attachSpending(budgets, spendingMap);
  return { budgets: items, summary: summarize(items) };
};

const getBudgetById = async (userId, id) => {
  const budget = await Budget.findOne({ _id: id, user: userId }).populate('category', 'name type');
  if (!budget) throw ApiError.notFound('Budget not found');

  const { start, end } = getMonthRange(budget.month, budget.year);
  const spendingMap = await getSpendingMap(userId, start, end);
  return attachSpending([budget], spendingMap)[0];
};

const createBudget = async (userId, body) => {
  const data = pick(body, ALLOWED_FIELDS);
  if (!data.category) throw ApiError.badRequest('Category is required');
  await categoryService.findUserCategory(userId, data.category, 'expense');

  const existing = await Budget.findOne({
    user: userId,
    category: data.category,
    month: data.month,
    year: data.year,
  });
  if (existing) throw ApiError.conflict('A budget for this category and month already exists');

  const budget = await Budget.create({ ...data, user: userId });
  return getBudgetById(userId, budget._id);
};

const updateBudget = async (userId, id, body) => {
  const budget = await Budget.findOne({ _id: id, user: userId });
  if (!budget) throw ApiError.notFound('Budget not found');

  const data = pick(body, ALLOWED_FIELDS);
  if (data.category) await categoryService.findUserCategory(userId, data.category, 'expense');

  Object.assign(budget, data);
  await budget.save();
  return getBudgetById(userId, budget._id);
};

const deleteBudget = async (userId, id) => {
  const budget = await Budget.findOneAndDelete({ _id: id, user: userId });
  if (!budget) throw ApiError.notFound('Budget not found');
  return budget;
};

// Budgets in the selected month that reached the warning threshold or exceeded the limit
const getBudgetAlerts = async (userId, { month, year }) => {
  const { budgets } = await getBudgets(userId, { month, year });
  return budgets
    .filter((b) => b.status !== 'ok')
    .map((b) => ({
      budgetId: b._id,
      category: b.category?.name,
      status: b.status,
      percentage: b.percentage,
      limit: b.limit,
      spent: b.spent,
      period: b.period,
      message:
        b.status === 'exceeded'
          ? `${b.category?.name} budget exceeded: spent ${b.percentage}% of the limit`
          : `${b.category?.name} budget at ${b.percentage}% of the limit`,
    }));
};

// Checked after an expense is added/edited so the user gets an alert immediately
const checkBudgetAlert = async (userId, categoryId, date) => {
  const d = new Date(date);
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();

  const budget = await Budget.findOne({ user: userId, category: categoryId, month, year }).populate('category', 'name');
  if (!budget) return null;

  const { start, end } = getMonthRange(month, year);
  const spendingMap = await getSpendingMap(userId, start, end);
  const [item] = attachSpending([budget], spendingMap);
  if (item.status === 'ok') return null;

  return {
    budgetId: item._id,
    category: item.category?.name,
    status: item.status,
    percentage: item.percentage,
    limit: item.limit,
    spent: item.spent,
    message:
      item.status === 'exceeded'
        ? `Budget exceeded! ${item.category?.name} spending is ${item.percentage}% of the ${item.period} limit.`
        : `Warning: ${item.category?.name} spending has reached ${item.percentage}% of the ${item.period} limit.`,
  };
};

module.exports = {
  getBudgetStatus,
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  checkBudgetAlert,
};
