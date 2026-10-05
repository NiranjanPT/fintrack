// Sidebar navigation (also used by the Navbar to show the page title)
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/transactions', label: 'Transactions', icon: 'transactions' },
  { to: '/budgets', label: 'Budgets', icon: 'budget' },
  { to: '/subscriptions', label: 'Subscriptions', icon: 'subscriptions' },
  { to: '/savings', label: 'Savings Goals', icon: 'savings' },
  { to: '/analytics', label: 'Analytics', icon: 'analytics' },
  { to: '/reports', label: 'Reports', icon: 'reports' },
];

// Option lists used in forms and filters (match the values allowed by the backend)

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export const SUBSCRIPTION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Years shown in the month/year selector
export const getYearOptions = () => {
  const current = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => current - 4 + i);
};
