// Combines all API routers under /api
const express = require('express');

const router = express.Router();

// Experiment 1 - Health check proving the Node.js server is running
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'FinTrack API is running' });
});

router.use('/auth', require('./authRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/transactions', require('./transactionRoutes'));
router.use('/budgets', require('./budgetRoutes'));
router.use('/subscriptions', require('./subscriptionRoutes'));
router.use('/savings-goals', require('./savingsGoalRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/reports', require('./reportRoutes'));

module.exports = router;
