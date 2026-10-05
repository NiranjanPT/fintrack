// Shared constants used by models and services

const TRANSACTION_TYPES = ['income', 'expense'];

const PAYMENT_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'other'];

const RECURRING_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];
const RECURRING_STATUSES = ['active', 'paused'];

const BILLING_CYCLES = ['weekly', 'monthly', 'quarterly', 'yearly'];
const SUBSCRIPTION_STATUSES = ['active', 'paused', 'cancelled'];

// Categories created for every new user at registration
const DEFAULT_CATEGORIES = {
  expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Rent', 'Health', 'Education', 'Other'],
  income: ['Salary', 'Freelance', 'Investment', 'Other Income'],
};

// Fallback category when automatic categorization finds no match
const FALLBACK_CATEGORY = {
  expense: 'Other',
  income: 'Other Income',
};

module.exports = {
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
  RECURRING_FREQUENCIES,
  RECURRING_STATUSES,
  BILLING_CYCLES,
  SUBSCRIPTION_STATUSES,
  DEFAULT_CATEGORIES,
  FALLBACK_CATEGORY,
};
