const categoryService = require('../services/categoryService');
const categorizationService = require('../services/categorizationService');

// GET /api/categories?type=expense
const getCategories = async (req, res) => {
  const categories = await categoryService.getCategories(req.user._id, req.query.type);
  res.json({ success: true, count: categories.length, data: categories });
};

// POST /api/categories
const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Category created', data: category });
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  await categoryService.deleteCategory(req.user._id, req.params.id);
  res.json({ success: true, message: 'Category deleted' });
};

// GET /api/categories/suggest?text=uber ride&type=expense
const suggestCategory = async (req, res) => {
  const category = await categorizationService.suggestCategory(req.user._id, req.query.text, req.query.type);
  res.json({ success: true, data: category });
};

module.exports = { getCategories, createCategory, deleteCategory, suggestCategory };
