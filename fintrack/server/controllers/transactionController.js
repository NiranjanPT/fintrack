const transactionService = require('../services/transactionService');
const recurringService = require('../services/recurringService');

// GET /api/transactions?type=&category=&search=&startDate=&endDate=&page=&limit=
const getTransactions = async (req, res) => {
  const result = await transactionService.getTransactions(req.user._id, req.query);
  res.json({ success: true, data: result });
};

// GET /api/transactions/recurring
const getRecurring = async (req, res) => {
  const result = await recurringService.getUpcomingRecurring(req.user._id, { limit: 50 });
  res.json({ success: true, data: result });
};

// GET /api/transactions/:id
const getTransaction = async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.user._id, req.params.id);
  res.json({ success: true, data: transaction });
};

// POST /api/transactions
const createTransaction = async (req, res) => {
  const result = await transactionService.createTransaction(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Transaction added', data: result });
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  const result = await transactionService.updateTransaction(req.user._id, req.params.id, req.body);
  res.json({ success: true, message: 'Transaction updated', data: result });
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  await transactionService.deleteTransaction(req.user._id, req.params.id);
  res.json({ success: true, message: 'Transaction deleted' });
};

module.exports = {
  getTransactions,
  getRecurring,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
