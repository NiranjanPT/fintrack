// Optional: creates a demo user with sample data so the dashboard has something to show.
// Run with:  npm run seed   (from the server folder)
// Login:     demo@fintrack.com / demo123
require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Subscription = require('../models/Subscription');
const SavingsGoal = require('../models/SavingsGoal');
const categoryService = require('../services/categoryService');
const { addInterval } = require('./dateUtils');

const DEMO_EMAIL = 'demo@fintrack.com';

const utcDate = (year, monthIndex, day) => new Date(Date.UTC(year, monthIndex, day));

const seed = async () => {
  await connectDB();

  // Remove the previous demo user and all of their data
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    await Promise.all([
      Category.deleteMany({ user: existing._id }),
      Transaction.deleteMany({ user: existing._id }),
      Budget.deleteMany({ user: existing._id }),
      Subscription.deleteMany({ user: existing._id }),
      SavingsGoal.deleteMany({ user: existing._id }),
    ]);
    await existing.deleteOne();
  }

  const user = await User.create({ name: 'Demo User', email: DEMO_EMAIL, password: 'demo123' });
  await categoryService.createDefaultCategories(user._id);

  const categories = await Category.find({ user: user._id });
  const cat = (name) => categories.find((c) => c.name === name)._id;

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const today = now.getUTCDate();

  // Sample expenses for each month: [title, category, amount, day, paymentMethod]
  const monthlyExpenses = [
    ['Pizza at restaurant', 'Food', 650, 3, 'upi'],
    ['Groceries', 'Food', 2400, 6, 'card'],
    ['Uber to office', 'Transport', 320, 8, 'upi'],
    ['Fuel', 'Transport', 1500, 12, 'card'],
    ['Movie tickets', 'Entertainment', 600, 14, 'upi'],
    ['Amazon order', 'Shopping', 1800, 16, 'card'],
    ['Electricity bill', 'Bills', 1450, 18, 'bank_transfer'],
    ['Internet bill', 'Bills', 799, 20, 'upi'],
    ['Swiggy dinner', 'Food', 540, 22, 'upi'],
    ['Pharmacy', 'Health', 420, 25, 'cash'],
  ];

  const transactions = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = utcDate(year, month - i, 1);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const isCurrentMonth = i === 0;

    transactions.push({ user: user._id, type: 'income', title: 'Monthly salary', amount: 55000, category: cat('Salary'), date: utcDate(y, m, 1), paymentMethod: 'bank_transfer' });
    if (i % 2 === 0) {
      transactions.push({ user: user._id, type: 'income', title: 'Freelance project', amount: 8000 + i * 500, category: cat('Freelance'), date: utcDate(y, m, isCurrentMonth ? Math.min(15, today) : 15), paymentMethod: 'bank_transfer' });
    }

    monthlyExpenses.forEach(([title, category, amount, day, paymentMethod]) => {
      // In the current month, spread the expenses between day 1 and today (no future transactions)
      const txDay = isCurrentMonth ? Math.max(1, Math.round((day * today) / 28)) : day;
      const variation = 1 + ((i * 7 + day) % 5) * 0.08; // small month-to-month variation
      transactions.push({ user: user._id, type: 'expense', title, amount: Math.round(amount * variation), category: cat(category), date: utcDate(y, m, txDay), paymentMethod });
    });

    // Rent is stored as normal transactions for past months
    if (!isCurrentMonth) {
      transactions.push({ user: user._id, type: 'expense', title: 'House rent', amount: 12000, category: cat('Rent'), date: utcDate(y, m, 5), paymentMethod: 'bank_transfer' });
    }
  }
  await Transaction.insertMany(transactions);

  // Recurring expenses (templates). nextOccurrence is in the future.
  const rentDate = utcDate(year, month, 5);
  await Transaction.create([
    {
      user: user._id, type: 'expense', title: 'House rent', amount: 12000, category: cat('Rent'),
      date: rentDate, paymentMethod: 'bank_transfer', isRecurring: true,
      recurrence: { frequency: 'monthly', nextOccurrence: addInterval(rentDate, 'monthly'), status: 'active' },
    },
    {
      user: user._id, type: 'expense', title: 'Gym membership', amount: 1200, category: cat('Health'),
      date: utcDate(year, month, 2), paymentMethod: 'upi', isRecurring: true,
      recurrence: { frequency: 'monthly', nextOccurrence: addInterval(utcDate(year, month, 2), 'monthly'), status: 'active' },
    },
  ]);

  const currentMonth = month + 1;
  await Budget.insertMany([
    { user: user._id, category: cat('Food'), month: currentMonth, year, limit: 5000, alertThreshold: 80 },
    { user: user._id, category: cat('Transport'), month: currentMonth, year, limit: 3000, alertThreshold: 80 },
    { user: user._id, category: cat('Entertainment'), month: currentMonth, year, limit: 2000, alertThreshold: 80 },
    { user: user._id, category: cat('Shopping'), month: currentMonth, year, limit: 1500, alertThreshold: 80 },
    { user: user._id, category: cat('Bills'), month: currentMonth, year, limit: 3000, alertThreshold: 80 },
  ]);

  await Subscription.insertMany([
    { user: user._id, name: 'Netflix', amount: 649, billingCycle: 'monthly', nextBillingDate: utcDate(year, month, today + 3), category: cat('Entertainment'), status: 'active' },
    { user: user._id, name: 'Spotify', amount: 119, billingCycle: 'monthly', nextBillingDate: utcDate(year, month, today + 9), category: cat('Entertainment'), status: 'active' },
    { user: user._id, name: 'Amazon Prime', amount: 1499, billingCycle: 'yearly', nextBillingDate: utcDate(year, month + 4, 10), category: cat('Shopping'), status: 'active' },
    { user: user._id, name: 'Cloud Storage', amount: 130, billingCycle: 'monthly', nextBillingDate: utcDate(year, month, today + 15), category: cat('Bills'), status: 'paused' },
  ]);

  await SavingsGoal.insertMany([
    { user: user._id, name: 'Emergency Fund', targetAmount: 100000, currentAmount: 45000, deadline: utcDate(year + 1, 2, 31), description: '6 months of expenses' },
    { user: user._id, name: 'New Laptop', targetAmount: 80000, currentAmount: 62000, deadline: utcDate(year, month + 3, 1), description: 'For college projects' },
    { user: user._id, name: 'Goa Trip', targetAmount: 25000, currentAmount: 8000, deadline: utcDate(year + 1, 4, 15), description: '' },
  ]);

  console.log('Demo data created. Login with demo@fintrack.com / demo123');
};

seed()
  .catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.connection.close());
