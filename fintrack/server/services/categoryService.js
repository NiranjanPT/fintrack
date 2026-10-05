const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Subscription = require('../models/Subscription');
const ApiError = require('../utils/ApiError');
const { isValidObjectId, escapeRegex } = require('../utils/helpers');
const { DEFAULT_CATEGORIES, FALLBACK_CATEGORY, TRANSACTION_TYPES } = require('../config/constants');

// Called once when a user registers
const createDefaultCategories = async (userId) => {
  const docs = [];
  Object.entries(DEFAULT_CATEGORIES).forEach(([type, names]) => {
    names.forEach((name) => docs.push({ user: userId, name, type }));
  });

  try {
    await Category.insertMany(docs, { ordered: false });
  } catch (error) {
    // Ignore duplicates if some defaults already exist
    if (error.code !== 11000) throw error;
  }
};

const getCategories = async (userId, type) => {
  const filter = { user: userId };
  if (TRANSACTION_TYPES.includes(type)) filter.type = type;
  return Category.find(filter).sort({ type: 1, name: 1 });
};

const createCategory = async (userId, { name, type }) => {
  if (!name || !String(name).trim()) throw ApiError.badRequest('Category name is required');
  if (!TRANSACTION_TYPES.includes(type)) throw ApiError.badRequest('Type must be income or expense');

  const trimmed = String(name).trim();
  const existing = await Category.findOne({
    user: userId,
    type,
    name: { $regex: `^${escapeRegex(trimmed)}$`, $options: 'i' },
  });
  if (existing) throw ApiError.conflict(`Category "${trimmed}" already exists`);

  return Category.create({ user: userId, name: trimmed, type });
};

const deleteCategory = async (userId, id) => {
  const category = await Category.findOne({ _id: id, user: userId });
  if (!category) throw ApiError.notFound('Category not found');

  const [txCount, budgetCount, subCount] = await Promise.all([
    Transaction.countDocuments({ user: userId, category: id }),
    Budget.countDocuments({ user: userId, category: id }),
    Subscription.countDocuments({ user: userId, category: id }),
  ]);
  if (txCount + budgetCount + subCount > 0) {
    throw ApiError.badRequest('Category is in use by transactions, budgets or subscriptions and cannot be deleted');
  }

  await category.deleteOne();
  return category;
};

// Makes sure a category id belongs to the user (and optionally has the right type)
const findUserCategory = async (userId, categoryId, type) => {
  if (!isValidObjectId(categoryId)) throw ApiError.badRequest('Invalid category');

  const category = await Category.findOne({ _id: categoryId, user: userId });
  if (!category) throw ApiError.badRequest('Category not found');
  if (type && category.type !== type) {
    throw ApiError.badRequest(`Category "${category.name}" is not an ${type} category`);
  }
  return category;
};

const findCategoryByName = (userId, name, type) => Category.findOne({ user: userId, name, type });

// Returns the "Other" / "Other Income" category, creating it if the user deleted it
const getFallbackCategory = (userId, type) =>
  Category.findOneAndUpdate(
    { user: userId, name: FALLBACK_CATEGORY[type], type },
    { $setOnInsert: { user: userId, name: FALLBACK_CATEGORY[type], type } },
    { upsert: true, returnDocument: 'after' }
  );

module.exports = {
  createDefaultCategories,
  getCategories,
  createCategory,
  deleteCategory,
  findUserCategory,
  findCategoryByName,
  getFallbackCategory,
};
