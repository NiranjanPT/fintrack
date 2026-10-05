// Financial reports for a month or a whole year, with CSV export
const Transaction = require('../models/Transaction');
const analyticsService = require('./analyticsService');
const budgetService = require('./budgetService');
const subscriptionService = require('./subscriptionService');
const savingsGoalService = require('./savingsGoalService');
const recurringService = require('./recurringService');
const { getMonthRange, getYearRange, MONTH_NAMES } = require('../utils/dateUtils');

// month = null means the full year
const generateReport = async (userId, { month, year }, { includeTransactions = false } = {}) => {
  await recurringService.processDueRecurring(userId);

  const { start, end } = month ? getMonthRange(month, year) : getYearRange(year);
  const label = month ? `${MONTH_NAMES[month - 1]} ${year}` : `Year ${year}`;

  const [summary, categoryExpenses, incomeSources, budgetData, subscriptionData, savingsData, transactions] =
    await Promise.all([
      analyticsService.getTotals(userId, start, end),
      analyticsService.getCategoryBreakdown(userId, start, end, 'expense'),
      analyticsService.getCategoryBreakdown(userId, start, end, 'income'),
      budgetService.getBudgets(userId, { month, year }),
      subscriptionService.getSubscriptions(userId),
      savingsGoalService.getSavingsGoals(userId),
      includeTransactions
        ? Transaction.find({ user: userId, date: { $gte: start, $lt: end } })
            .populate('category', 'name')
            .sort({ date: 1 })
        : Promise.resolve([]),
    ]);

  const monthsInPeriod = month ? 1 : 12;
  const activeSubscriptions = subscriptionData.subscriptions.filter((s) => s.status === 'active');

  return {
    period: { month, year, label, start, end },
    generatedAt: new Date(),
    summary,
    categoryExpenses,
    incomeSources,
    budgets: budgetData.budgets,
    budgetSummary: budgetData.summary,
    subscriptions: {
      items: activeSubscriptions,
      monthlyTotal: subscriptionData.summary.monthlyTotal,
      yearlyTotal: subscriptionData.summary.yearlyTotal,
      periodTotal: Math.round(subscriptionData.summary.monthlyTotal * monthsInPeriod * 100) / 100,
      activeCount: subscriptionData.summary.activeCount,
    },
    savingsGoals: { items: savingsData.goals, summary: savingsData.summary },
    ...(includeTransactions ? { transactions } : {}),
  };
};

// Wraps a value for CSV and blocks spreadsheet formula injection (=, +, -, @)
const csvValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
};

const row = (...values) => values.map(csvValue).join(',');

const formatDate = (date) => (date ? new Date(date).toISOString().slice(0, 10) : '');

const toCSV = (report) => {
  const lines = [];

  lines.push(row('FinTrack Financial Report'));
  lines.push(row('Period', report.period.label));
  lines.push(row('Generated At', report.generatedAt.toISOString()));
  lines.push('');

  lines.push(row('SUMMARY'));
  lines.push(row('Total Income', report.summary.income));
  lines.push(row('Total Expenses', report.summary.expenses));
  lines.push(row('Net Savings', report.summary.savings));
  lines.push(row('Savings Rate (%)', report.summary.savingsRate));
  lines.push(row('Transactions', report.summary.transactionCount));
  lines.push('');

  lines.push(row('CATEGORY-WISE EXPENSES'));
  lines.push(row('Category', 'Amount', 'Transactions', 'Share (%)'));
  report.categoryExpenses.forEach((c) => lines.push(row(c.category, c.total, c.count, c.percentage)));
  lines.push('');

  lines.push(row('INCOME SOURCES'));
  lines.push(row('Category', 'Amount', 'Transactions', 'Share (%)'));
  report.incomeSources.forEach((c) => lines.push(row(c.category, c.total, c.count, c.percentage)));
  lines.push('');

  lines.push(row('BUDGETS'));
  lines.push(row('Period', 'Category', 'Limit', 'Spent', 'Remaining', 'Used (%)', 'Status'));
  report.budgets.forEach((b) =>
    lines.push(row(b.period, b.category?.name, b.limit, b.spent, b.remaining, b.percentage, b.status))
  );
  lines.push('');

  lines.push(row('SUBSCRIPTIONS (ACTIVE)'));
  lines.push(row('Name', 'Amount', 'Billing Cycle', 'Monthly Cost', 'Next Billing Date', 'Category'));
  report.subscriptions.items.forEach((s) =>
    lines.push(row(s.name, s.amount, s.billingCycle, s.monthlyCost, formatDate(s.nextBillingDate), s.category?.name))
  );
  lines.push(row('Monthly Subscription Total', report.subscriptions.monthlyTotal));
  lines.push(row('Subscription Cost For Period', report.subscriptions.periodTotal));
  lines.push('');

  lines.push(row('SAVINGS GOALS'));
  lines.push(row('Goal', 'Target', 'Saved', 'Remaining', 'Progress (%)', 'Deadline'));
  report.savingsGoals.items.forEach((g) =>
    lines.push(row(g.name, g.targetAmount, g.currentAmount, g.remainingAmount, g.progress, formatDate(g.deadline)))
  );
  lines.push('');

  if (report.transactions) {
    lines.push(row('TRANSACTIONS'));
    lines.push(row('Date', 'Type', 'Title', 'Category', 'Amount', 'Payment Method', 'Description'));
    report.transactions.forEach((t) =>
      lines.push(row(formatDate(t.date), t.type, t.title, t.category?.name, t.amount, t.paymentMethod, t.description))
    );
  }

  return lines.join('\r\n');
};

module.exports = { generateReport, toCSV };
