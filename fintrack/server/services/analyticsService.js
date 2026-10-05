// Dashboard and monthly analytics - all values are calculated from MongoDB with aggregation pipelines
const Transaction = require('../models/Transaction');
const SavingsGoal = require('../models/SavingsGoal');
const budgetService = require('./budgetService');
const subscriptionService = require('./subscriptionService');
const savingsGoalService = require('./savingsGoalService');
const recurringService = require('./recurringService');
const { getMonthRange, lastNMonths, MONTH_NAMES } = require('../utils/dateUtils');
const { toObjectId, round2 } = require('../utils/helpers');

// Income and expense totals (optionally inside a date range)
const getTotals = async (userId, start, end) => {
  const match = { user: toObjectId(userId) };
  if (start && end) match.date = { $gte: start, $lt: end };

  const rows = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  const income = rows.find((r) => r._id === 'income');
  const expense = rows.find((r) => r._id === 'expense');
  const totalIncome = round2(income?.total || 0);
  const totalExpenses = round2(expense?.total || 0);

  return {
    income: totalIncome,
    expenses: totalExpenses,
    savings: round2(totalIncome - totalExpenses),
    savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10 : 0,
    transactionCount: (income?.count || 0) + (expense?.count || 0),
  };
};

// Total per category in a date range, largest first
const getCategoryBreakdown = async (userId, start, end, type = 'expense') => {
  const rows = await Transaction.aggregate([
    { $match: { user: toObjectId(userId), type, date: { $gte: start, $lt: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);
  return rows.map((r) => ({
    categoryId: r._id,
    category: r.category?.name || 'Uncategorized',
    total: round2(r.total),
    count: r.count,
    percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 1000) / 10 : 0,
  }));
};

// Income / expense / savings for each of the given months
const getMonthlySeries = async (userId, months) => {
  const first = months[0];
  const last = months[months.length - 1];
  const start = getMonthRange(first.month, first.year).start;
  const end = getMonthRange(last.month, last.year).end;

  const rows = await Transaction.aggregate([
    { $match: { user: toObjectId(userId), date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const lookup = (m, y, type) =>
    rows.find((r) => r._id.month === m && r._id.year === y && r._id.type === type)?.total || 0;

  return months.map(({ month, year, label }) => {
    const income = round2(lookup(month, year, 'income'));
    const expense = round2(lookup(month, year, 'expense'));
    return { month, year, label, income, expense, savings: round2(income - expense) };
  });
};

// Day-by-day income and expenses for a single month (spending trend)
const getDailyTrend = async (userId, month, year) => {
  const { start, end } = getMonthRange(month, year);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const rows = await Transaction.aggregate([
    { $match: { user: toObjectId(userId), date: { $gte: start, $lt: end } } },
    { $group: { _id: { day: { $dayOfMonth: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
  ]);

  const now = new Date();
  let cumulative = 0;
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    // Days that have not happened yet get null so the chart line stops at today
    if (new Date(Date.UTC(year, month - 1, day)) > now) {
      return { day, label: String(day), income: null, expense: null, cumulativeExpense: null };
    }
    const expense = round2(rows.find((r) => r._id.day === day && r._id.type === 'expense')?.total || 0);
    const income = round2(rows.find((r) => r._id.day === day && r._id.type === 'income')?.total || 0);
    cumulative = round2(cumulative + expense);
    return { day, label: String(day), income, expense, cumulativeExpense: cumulative };
  });
};

// GET /api/analytics/monthly?month=10&year=2026
const getMonthlyAnalytics = async (userId, { month, year }) => {
  await recurringService.processDueRecurring(userId);

  const { start, end } = getMonthRange(month, year);
  const prev = lastNMonths(month, year, 2)[0];
  const prevRange = getMonthRange(prev.month, prev.year);

  const [summary, previous, categoryBreakdown, incomeBreakdown, dailyTrend, monthlyTrend] = await Promise.all([
    getTotals(userId, start, end),
    getTotals(userId, prevRange.start, prevRange.end),
    getCategoryBreakdown(userId, start, end, 'expense'),
    getCategoryBreakdown(userId, start, end, 'income'),
    getDailyTrend(userId, month, year),
    getMonthlySeries(userId, lastNMonths(month, year, 6)),
  ]);

  const daysInMonth = dailyTrend.length;
  const change = (current, before) => (before > 0 ? Math.round(((current - before) / before) * 1000) / 10 : null);

  return {
    period: { month, year, label: `${MONTH_NAMES[month - 1]} ${year}` },
    summary: {
      ...summary,
      averageDailyExpense: round2(summary.expenses / daysInMonth),
      topCategory: categoryBreakdown[0]?.category || null,
    },
    previous: { ...previous, label: `${MONTH_NAMES[prev.month - 1]} ${prev.year}` },
    changes: {
      income: change(summary.income, previous.income),
      expenses: change(summary.expenses, previous.expenses),
    },
    categoryBreakdown,
    incomeBreakdown,
    dailyTrend,
    monthlyTrend,
  };
};

// GET /api/analytics/dashboard?month=10&year=2026
const getDashboard = async (userId, { month, year }) => {
  await recurringService.processDueRecurring(userId);

  const { start, end } = getMonthRange(month, year);

  const [
    allTime,
    thisMonth,
    savingsTotals,
    recentTransactions,
    budgetData,
    upcomingSubscriptions,
    savingsGoals,
    incomeVsExpense,
    expenseByCategory,
    yearTrend,
  ] = await Promise.all([
    getTotals(userId),
    getTotals(userId, start, end),
    SavingsGoal.aggregate([
      { $match: { user: toObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$currentAmount' } } },
    ]),
    Transaction.find({ user: userId }).populate('category', 'name type').sort({ date: -1, createdAt: -1 }).limit(5),
    budgetService.getBudgets(userId, { month, year }),
    subscriptionService.getUpcomingSubscriptions(userId, 5),
    savingsGoalService.getSavingsGoals(userId),
    getMonthlySeries(userId, lastNMonths(month, year, 6)),
    getCategoryBreakdown(userId, start, end, 'expense'),
    getMonthlySeries(userId, lastNMonths(month, year, 12)),
  ]);

  return {
    period: { month, year, label: `${MONTH_NAMES[month - 1]} ${year}` },
    totals: {
      totalIncome: allTime.income,
      totalExpenses: allTime.expenses,
      currentBalance: allTime.savings,
      totalSavings: round2(savingsTotals[0]?.total || 0),
    },
    thisMonth,
    recentTransactions,
    budgetStatus: budgetData.budgets,
    budgetSummary: budgetData.summary,
    upcomingSubscriptions,
    savingsGoals: savingsGoals.goals.slice(0, 4),
    charts: {
      incomeVsExpense,
      expenseByCategory,
      monthlyExpenseTrend: yearTrend.map(({ label, expense }) => ({ label, expense })),
    },
  };
};

module.exports = {
  getTotals,
  getCategoryBreakdown,
  getMonthlySeries,
  getMonthlyAnalytics,
  getDashboard,
};
