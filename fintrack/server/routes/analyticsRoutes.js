const express = require('express');
const { getDashboard, getMonthlyAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/monthly', getMonthlyAnalytics);

module.exports = router;
