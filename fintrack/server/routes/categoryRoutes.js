const express = require('express');
const {
  getCategories,
  createCategory,
  deleteCategory,
  suggestCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/suggest', suggestCategory);
router.route('/').get(getCategories).post(createCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
