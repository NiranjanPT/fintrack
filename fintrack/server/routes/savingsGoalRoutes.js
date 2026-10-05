const express = require('express');
const {
  getSavingsGoals,
  getSavingsGoal,
  createSavingsGoal,
  updateSavingsGoal,
  addMoney,
  deleteSavingsGoal,
} = require('../controllers/savingsGoalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getSavingsGoals).post(createSavingsGoal);
router.route('/:id').get(getSavingsGoal).put(updateSavingsGoal).delete(deleteSavingsGoal);
router.post('/:id/add', addMoney);

module.exports = router;
