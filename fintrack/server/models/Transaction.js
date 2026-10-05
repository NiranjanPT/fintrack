const mongoose = require('mongoose');
const {
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
  RECURRING_FREQUENCIES,
  RECURRING_STATUSES,
} = require('../config/constants');

// Extra details stored only for recurring transactions (rent, internet, gym, loan...)
const recurrenceSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      enum: { values: RECURRING_FREQUENCIES, message: 'Invalid frequency' },
      required: [true, 'Frequency is required for recurring transactions'],
    },
    nextOccurrence: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: { values: RECURRING_STATUSES, message: 'Invalid recurring status' },
      default: 'active',
    },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: { values: TRANSACTION_TYPES, message: 'Type must be income or expense' },
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: { values: PAYMENT_METHODS, message: 'Invalid payment method' },
      default: 'cash',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      type: recurrenceSchema,
      default: undefined,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, category: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
