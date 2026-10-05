const express = require('express');
const {
  getTransactions,
  getRecurring,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All transaction routes require a logged-in user
router.use(protect);

router.route('/').get(getTransactions).post(createTransaction);
router.get('/recurring', getRecurring); // must be defined before /:id
router.route('/:id').get(getTransaction).put(updateTransaction).delete(deleteTransaction);

module.exports = router;
