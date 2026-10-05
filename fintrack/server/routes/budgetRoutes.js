const express = require('express');
const {
  getBudgets,
  getBudgetAlerts,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getBudgets).post(createBudget);
router.get('/alerts', getBudgetAlerts);
router.route('/:id').get(getBudget).put(updateBudget).delete(deleteBudget);

module.exports = router;
