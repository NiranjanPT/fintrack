// Formatting helpers shared by all pages

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

// Short form for chart axes, e.g. ₹12.5K
export const formatCompact = (value) => compactFormatter.format(Number(value) || 0);

// Dates are stored in UTC on the server, so they are displayed in UTC too
export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

// Converts a date into the "YYYY-MM-DD" format used by <input type="date">
export const toInputDate = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

export const todayInputDate = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const capitalize = (text = '') =>
  text.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export const formatPercent = (value) => `${Number(value || 0).toFixed(1).replace(/\.0$/, '')}%`;

export const daysLabel = (days) => {
  if (days === null || days === undefined) return '';
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};
