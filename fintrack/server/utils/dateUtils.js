// Date helpers. All dates are handled in UTC so month boundaries are consistent.
const ApiError = require('./ApiError');

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Returns { start, end } where end is exclusive (first moment of the next month)
const getMonthRange = (month, year) => ({
  start: new Date(Date.UTC(year, month - 1, 1)),
  end: new Date(Date.UTC(year, month, 1)),
});

const getYearRange = (year) => ({
  start: new Date(Date.UTC(year, 0, 1)),
  end: new Date(Date.UTC(year + 1, 0, 1)),
});

// Start of today in UTC
const startOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

// Adds one interval (daily / weekly / monthly / quarterly / yearly) to a date
const addInterval = (date, frequency) => {
  const next = new Date(date);
  switch (frequency) {
    case 'daily':
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case 'weekly':
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case 'monthly':
      next.setUTCMonth(next.getUTCMonth() + 1);
      break;
    case 'quarterly':
      next.setUTCMonth(next.getUTCMonth() + 3);
      break;
    case 'yearly':
      next.setUTCFullYear(next.getUTCFullYear() + 1);
      break;
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
  return next;
};

// Reads ?month=&year= from a query string, defaulting to the current month.
// month may be "all" (or omitted when allowAll is true) to mean the whole year.
const parseMonthYear = (query, { allowAll = false } = {}) => {
  const now = new Date();
  const year = query.year ? Number(query.year) : now.getUTCFullYear();

  let month;
  if (allowAll && (query.month === 'all' || query.month === '' || query.month === undefined)) {
    month = null;
  } else {
    month = query.month ? Number(query.month) : now.getUTCMonth() + 1;
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw ApiError.badRequest('Year must be between 2000 and 2100');
  }
  if (month !== null && (!Number.isInteger(month) || month < 1 || month > 12)) {
    throw ApiError.badRequest('Month must be between 1 and 12');
  }
  return { month, year };
};

// Builds a list of the last `count` months ending at (month, year)
const lastNMonths = (month, year, count) => {
  const result = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(year, month - 1 - i, 1));
    const m = d.getUTCMonth() + 1;
    const y = d.getUTCFullYear();
    result.push({ month: m, year: y, label: `${MONTH_NAMES[m - 1]} ${String(y).slice(2)}` });
  }
  return result;
};

module.exports = {
  MONTH_NAMES,
  getMonthRange,
  getYearRange,
  startOfToday,
  addInterval,
  parseMonthYear,
  lastNMonths,
};
