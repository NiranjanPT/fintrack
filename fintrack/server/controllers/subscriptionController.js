const subscriptionService = require('../services/subscriptionService');

// GET /api/subscriptions?status=active
const getSubscriptions = async (req, res) => {
  const result = await subscriptionService.getSubscriptions(req.user._id, req.query);
  res.json({ success: true, data: result });
};

// GET /api/subscriptions/:id
const getSubscription = async (req, res) => {
  const subscription = await subscriptionService.getSubscriptionById(req.user._id, req.params.id);
  res.json({ success: true, data: subscription });
};

// POST /api/subscriptions
const createSubscription = async (req, res) => {
  const subscription = await subscriptionService.createSubscription(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Subscription added', data: subscription });
};

// PUT /api/subscriptions/:id
const updateSubscription = async (req, res) => {
  const subscription = await subscriptionService.updateSubscription(req.user._id, req.params.id, req.body);
  res.json({ success: true, message: 'Subscription updated', data: subscription });
};

// DELETE /api/subscriptions/:id
const deleteSubscription = async (req, res) => {
  await subscriptionService.deleteSubscription(req.user._id, req.params.id);
  res.json({ success: true, message: 'Subscription deleted' });
};

module.exports = {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
