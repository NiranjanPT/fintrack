// Rule-based automatic categorization (keyword matching - no AI)
const categoryService = require('./categoryService');
const { escapeRegex } = require('../utils/helpers');

// Each rule maps a list of keywords to a category name
const RULES = {
  expense: [
    { category: 'Food', keywords: ['pizza', 'restaurant', 'food', 'swiggy', 'zomato', 'cafe', 'coffee', 'burger', 'grocery', 'groceries', 'lunch', 'dinner', 'breakfast', 'snacks'] },
    { category: 'Transport', keywords: ['uber', 'ola', 'fuel', 'petrol', 'diesel', 'rapido', 'taxi', 'cab', 'metro', 'bus', 'train', 'parking', 'toll'] },
    { category: 'Entertainment', keywords: ['netflix', 'spotify', 'movie', 'movies', 'cinema', 'hotstar', 'prime video', 'youtube premium', 'concert', 'gaming'] },
    { category: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'mall', 'clothes', 'shopping', 'shoes'] },
    { category: 'Bills', keywords: ['electricity', 'water', 'internet', 'wifi', 'broadband', 'recharge', 'mobile bill', 'phone bill', 'gas bill', 'dth'] },
    { category: 'Rent', keywords: ['rent', 'house rent', 'pg', 'hostel'] },
    { category: 'Health', keywords: ['doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'gym', 'clinic'] },
    { category: 'Education', keywords: ['course', 'tuition', 'books', 'college', 'school', 'exam', 'udemy'] },
  ],
  income: [
    { category: 'Salary', keywords: ['salary', 'payroll', 'stipend', 'wages'] },
    { category: 'Freelance', keywords: ['freelance', 'client', 'project', 'consulting', 'gig'] },
    { category: 'Investment', keywords: ['dividend', 'interest', 'stock', 'stocks', 'mutual fund', 'fd', 'returns'] },
  ],
};

// Returns the matching category name for a piece of text, or null
const detectCategoryName = (text, type = 'expense') => {
  const value = String(text || '').toLowerCase();
  if (!value.trim()) return null;

  const rules = RULES[type] || [];
  const match = rules.find((rule) =>
    rule.keywords.some((keyword) => new RegExp(`\\b${escapeRegex(keyword)}\\b`).test(value))
  );
  return match ? match.category : null;
};

// Decides which category a transaction should use.
// 1. If the user picked a category manually -> use it (after checking ownership)
// 2. Otherwise detect from title/description keywords
// 3. If nothing matches -> "Other" / "Other Income"
const resolveCategory = async (userId, { category, title, description, type }) => {
  if (category) {
    const manual = await categoryService.findUserCategory(userId, category, type);
    return { category: manual, autoCategorized: false };
  }

  const detectedName = detectCategoryName(`${title || ''} ${description || ''}`, type);
  if (detectedName) {
    const detected = await categoryService.findCategoryByName(userId, detectedName, type);
    if (detected) return { category: detected, autoCategorized: true };
  }

  const fallback = await categoryService.getFallbackCategory(userId, type);
  return { category: fallback, autoCategorized: true };
};

// Used by the form to preview the automatic category while the user types
const suggestCategory = async (userId, text, type = 'expense') => {
  const name = detectCategoryName(text, type);
  if (!name) return null;
  return categoryService.findCategoryByName(userId, name, type);
};

module.exports = { RULES, detectCategoryName, resolveCategory, suggestCategory };
