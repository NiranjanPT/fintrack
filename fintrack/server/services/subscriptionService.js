const Subscription = require('../models/Subscription');
const ApiError = require('../utils/ApiError');
const categoryService = require('./categoryService');
const { addInterval, startOfToday } = require('../utils/dateUtils');
const { round2, pick } = require('../utils/helpers');
const { SUBSCRIPTION_STATUSES } = require('../config/constants');

const ALLOWED_FIELDS = ['name', 'amount', 'billingCycle', 'nextBillingDate', 'category', 'status'];

// How many times a billing cycle occurs per month
const MONTHLY_FACTOR = { weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 };

const getMonthlyCost = (sub) => round2(sub.amount * (MONTHLY_FACTOR[sub.billingCycle] || 1));

// Moves past billing dates of active subscriptions to the next upcoming date
const rollForwardBillingDates = async (userId) => {
  const today = startOfToday();
  const overdue = await Subscription.find({ user: userId, status: 'active', nextBillingDate: { $lt: today } });

  for (const sub of overdue) {
    let next = new Date(sub.nextBillingDate);
    while (next < today) next = addInterval(next, sub.billingCycle);
    sub.nextBillingDate = next;
    await sub.save();
  }
};

const withComputed = (sub) => {
  const obj = sub.toObject();
  const today = startOfToday();
  return {
    ...obj,
    monthlyCost: getMonthlyCost(obj),
    yearlyCost: round2(getMonthlyCost(obj) * 12),
    daysUntilBilling: Math.ceil((new Date(obj.nextBillingDate) - today) / (24 * 60 * 60 * 1000)),
  };
};

const summarize = (subscriptions) => {
  const active = subscriptions.filter((s) => s.status === 'active');
  const monthlyTotal = round2(active.reduce((sum, s) => sum + s.monthlyCost, 0));
  return {
    totalCount: subscriptions.length,
    activeCount: active.length,
    monthlyTotal,
    yearlyTotal: round2(monthlyTotal * 12),
  };
};

const getSubscriptions = async (userId, query = {}) => {
  await rollForwardBillingDates(userId);

  const filter = { user: userId };
  if (SUBSCRIPTION_STATUSES.includes(query.status)) filter.status = query.status;

  const subs = await Subscription.find(filter).populate('category', 'name type').sort({ status: 1, nextBillingDate: 1 });
  const subscriptions = subs.map(withComputed);

  // Summary always covers all subscriptions, not just the filtered ones
  const all = filter.status
    ? (await Subscription.find({ user: userId })).map(withComputed)
    : subscriptions;

  return { subscriptions, summary: summarize(all) };
};

// Active subscriptions with the nearest billing dates (used on the dashboard)
const getUpcomingSubscriptions = async (userId, limit = 5) => {
  await rollForwardBillingDates(userId);
  const subs = await Subscription.find({ user: userId, status: 'active' })
    .populate('category', 'name type')
    .sort({ nextBillingDate: 1 })
    .limit(limit);
  return subs.map(withComputed);
};

const getSubscriptionById = async (userId, id) => {
  const sub = await Subscription.findOne({ _id: id, user: userId }).populate('category', 'name type');
  if (!sub) throw ApiError.notFound('Subscription not found');
  return withComputed(sub);
};

const createSubscription = async (userId, body) => {
  const data = pick(body, ALLOWED_FIELDS);
  if (!data.category) throw ApiError.badRequest('Category is required');
  await categoryService.findUserCategory(userId, data.category, 'expense');

  const sub = await Subscription.create({ ...data, user: userId });
  return getSubscriptionById(userId, sub._id);
};

const updateSubscription = async (userId, id, body) => {
  const sub = await Subscription.findOne({ _id: id, user: userId });
  if (!sub) throw ApiError.notFound('Subscription not found');

  const data = pick(body, ALLOWED_FIELDS);
  if (data.category) await categoryService.findUserCategory(userId, data.category, 'expense');

  Object.assign(sub, data);
  await sub.save();
  return getSubscriptionById(userId, sub._id);
};

const deleteSubscription = async (userId, id) => {
  const sub = await Subscription.findOneAndDelete({ _id: id, user: userId });
  if (!sub) throw ApiError.notFound('Subscription not found');
  return sub;
};

module.exports = {
  getMonthlyCost,
  getSubscriptions,
  getUpcomingSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
