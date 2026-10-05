// Recurring expenses (rent, internet, gym, loan EMI...)
// A recurring transaction acts as a template. When its nextOccurrence date arrives,
// a normal transaction is created for that date and nextOccurrence moves forward.
const Transaction = require('../models/Transaction');
const { addInterval, startOfToday } = require('../utils/dateUtils');
const { round2 } = require('../utils/helpers');

const MAX_CATCH_UP = 60; // safety limit for very old recurring entries

const MONTHLY_FACTOR = { daily: 30, weekly: 52 / 12, monthly: 1, yearly: 1 / 12 };

const processDueRecurring = async (userId) => {
  const now = new Date();
  const dueTemplates = await Transaction.find({
    user: userId,
    isRecurring: true,
    'recurrence.status': 'active',
    'recurrence.nextOccurrence': { $lte: now },
  });

  let created = 0;

  for (const template of dueTemplates) {
    const { frequency, nextOccurrence } = template.recurrence;
    const newTransactions = [];
    let next = new Date(nextOccurrence);

    while (next <= now && newTransactions.length < MAX_CATCH_UP) {
      newTransactions.push({
        user: template.user,
        type: template.type,
        amount: template.amount,
        title: template.title,
        description: `Auto-generated from recurring "${template.title}"`,
        category: template.category,
        date: next,
        paymentMethod: template.paymentMethod,
        isRecurring: false,
      });
      next = addInterval(next, frequency);
    }

    // Move nextOccurrence forward only if no other request already did it
    // (prevents duplicate entries when two requests run at the same time)
    const result = await Transaction.updateOne(
      { _id: template._id, 'recurrence.nextOccurrence': nextOccurrence },
      { $set: { 'recurrence.nextOccurrence': next } }
    );

    if (result.modifiedCount === 1 && newTransactions.length) {
      await Transaction.insertMany(newTransactions);
      created += newTransactions.length;
    }
  }

  return created;
};

// Upcoming recurring expenses, soonest first
const getUpcomingRecurring = async (userId, { limit = 10 } = {}) => {
  const items = await Transaction.find({ user: userId, isRecurring: true })
    .populate('category', 'name type')
    .sort({ 'recurrence.status': 1, 'recurrence.nextOccurrence': 1 })
    .limit(limit);

  const today = startOfToday();
  const recurring = items.map((item) => {
    const obj = item.toObject();
    const next = obj.recurrence?.nextOccurrence;
    obj.daysUntilNext = next ? Math.ceil((new Date(next) - today) / (24 * 60 * 60 * 1000)) : null;
    return obj;
  });

  const monthlyEstimate = round2(
    recurring
      .filter((r) => r.type === 'expense' && r.recurrence?.status === 'active')
      .reduce((sum, r) => sum + r.amount * (MONTHLY_FACTOR[r.recurrence.frequency] || 1), 0)
  );

  return { recurring, monthlyEstimate };
};

module.exports = { processDueRecurring, getUpcomingRecurring };
