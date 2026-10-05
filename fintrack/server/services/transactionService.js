const Transaction = require('../models/Transaction');
const ApiError = require('../utils/ApiError');
const categorizationService = require('./categorizationService');
const budgetService = require('./budgetService');
const recurringService = require('./recurringService');
const { addInterval } = require('../utils/dateUtils');
const { toObjectId, isValidObjectId, escapeRegex, round2, pick } = require('../utils/helpers');
const {
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
  RECURRING_FREQUENCIES,
  RECURRING_STATUSES,
} = require('../config/constants');

const ALLOWED_FIELDS = ['type', 'amount', 'title', 'description', 'category', 'date', 'paymentMethod', 'isRecurring'];

const toBoolean = (value) => value === true || value === 'true';

const parseDate = (value, field = 'date') => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw ApiError.badRequest(`Invalid ${field}`);
  return date;
};

// Builds the recurrence sub-document (frequency, next occurrence, status)
const buildRecurrence = (input = {}, transactionDate, existing) => {
  const frequency = input.frequency || existing?.frequency;
  if (!RECURRING_FREQUENCIES.includes(frequency)) {
    throw ApiError.badRequest(`Frequency must be one of: ${RECURRING_FREQUENCIES.join(', ')}`);
  }

  const status = input.status || existing?.status || 'active';
  if (!RECURRING_STATUSES.includes(status)) throw ApiError.badRequest('Recurring status must be active or paused');

  let nextOccurrence;
  if (input.nextOccurrence) {
    nextOccurrence = parseDate(input.nextOccurrence, 'next occurrence');
  } else if (existing?.nextOccurrence && existing.frequency === frequency) {
    nextOccurrence = existing.nextOccurrence;
  } else {
    nextOccurrence = addInterval(transactionDate, frequency);
  }

  return { frequency, status, nextOccurrence };
};

// Converts query-string filters into a MongoDB filter object
const buildFilter = (userId, query) => {
  const filter = { user: toObjectId(userId) };

  if (TRANSACTION_TYPES.includes(query.type)) filter.type = query.type;
  if (query.category && isValidObjectId(query.category)) filter.category = toObjectId(query.category);
  if (PAYMENT_METHODS.includes(query.paymentMethod)) filter.paymentMethod = query.paymentMethod;
  if (query.recurring === 'true') filter.isRecurring = true;

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = parseDate(query.startDate, 'start date');
    if (query.endDate) {
      const end = parseDate(query.endDate, 'end date');
      end.setUTCDate(end.getUTCDate() + 1); // make the end date inclusive
      filter.date.$lt = end;
    }
  }

  if (query.search && String(query.search).trim()) {
    const regex = new RegExp(escapeRegex(String(query.search).trim()), 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = Number(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = Number(query.maxAmount);
  }

  return filter;
};

const getTransactions = async (userId, query = {}) => {
  // Create any recurring entries that became due before listing
  await recurringService.processDueRecurring(userId);

  const filter = buildFilter(userId, query);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);

  const sortField = ['date', 'amount', 'title'].includes(query.sortBy) ? query.sortBy : 'date';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [transactions, total, totals] = await Promise.all([
    Transaction.find(filter)
      .populate('category', 'name type')
      .sort({ [sortField]: sortOrder, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Transaction.countDocuments(filter),
    Transaction.aggregate([{ $match: filter }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]),
  ]);

  const income = totals.find((t) => t._id === 'income')?.total || 0;
  const expense = totals.find((t) => t._id === 'expense')?.total || 0;

  return {
    transactions,
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
    totals: { income: round2(income), expense: round2(expense), net: round2(income - expense) },
  };
};

const getTransactionById = async (userId, id) => {
  const transaction = await Transaction.findOne({ _id: id, user: userId }).populate('category', 'name type');
  if (!transaction) throw ApiError.notFound('Transaction not found');
  return transaction;
};

const createTransaction = async (userId, body) => {
  const data = pick(body, ALLOWED_FIELDS);

  if (!TRANSACTION_TYPES.includes(data.type)) throw ApiError.badRequest('Type must be income or expense');
  if (!data.title || !String(data.title).trim()) throw ApiError.badRequest('Title is required');

  data.date = data.date ? parseDate(data.date) : new Date();
  data.isRecurring = toBoolean(data.isRecurring);

  // Automatic categorization (or validation of the manually selected category)
  const { category, autoCategorized } = await categorizationService.resolveCategory(userId, data);
  data.category = category._id;

  if (data.isRecurring) {
    data.recurrence = buildRecurrence(body.recurrence, data.date);
  }

  const transaction = await Transaction.create({ ...data, user: userId });
  await transaction.populate('category', 'name type');

  const budgetAlert =
    transaction.type === 'expense'
      ? await budgetService.checkBudgetAlert(userId, transaction.category._id, transaction.date)
      : null;

  return { transaction, autoCategorized, budgetAlert };
};

const updateTransaction = async (userId, id, body) => {
  const transaction = await Transaction.findOne({ _id: id, user: userId });
  if (!transaction) throw ApiError.notFound('Transaction not found');

  const data = pick(body, ALLOWED_FIELDS);
  if (data.type !== undefined && !TRANSACTION_TYPES.includes(data.type)) {
    throw ApiError.badRequest('Type must be income or expense');
  }
  if (data.date) data.date = parseDate(data.date);

  const type = data.type || transaction.type;
  let autoCategorized = false;

  // Re-categorize when the user picks a new category, or when the type changed
  if (data.category || type !== transaction.type) {
    const resolved = await categorizationService.resolveCategory(userId, {
      category: data.category,
      title: data.title || transaction.title,
      description: data.description ?? transaction.description,
      type,
    });
    data.category = resolved.category._id;
    autoCategorized = resolved.autoCategorized;
  } else {
    delete data.category;
  }

  const isRecurring = data.isRecurring !== undefined ? toBoolean(data.isRecurring) : transaction.isRecurring;
  delete data.isRecurring;

  Object.assign(transaction, data);
  transaction.isRecurring = isRecurring;
  transaction.recurrence = isRecurring
    ? buildRecurrence(body.recurrence, transaction.date, transaction.recurrence)
    : undefined;

  await transaction.save();
  await transaction.populate('category', 'name type');

  const budgetAlert =
    transaction.type === 'expense'
      ? await budgetService.checkBudgetAlert(userId, transaction.category._id, transaction.date)
      : null;

  return { transaction, autoCategorized, budgetAlert };
};

const deleteTransaction = async (userId, id) => {
  const transaction = await Transaction.findOneAndDelete({ _id: id, user: userId });
  if (!transaction) throw ApiError.notFound('Transaction not found');
  return transaction;
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
