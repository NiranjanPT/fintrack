const mongoose = require('mongoose');
const { BILLING_CYCLES, SUBSCRIPTION_STATUSES } = require('../config/constants');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    billingCycle: {
      type: String,
      enum: { values: BILLING_CYCLES, message: 'Invalid billing cycle' },
      default: 'monthly',
    },
    nextBillingDate: {
      type: Date,
      required: [true, 'Next billing date is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    status: {
      type: String,
      enum: { values: SUBSCRIPTION_STATUSES, message: 'Invalid status' },
      default: 'active',
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, nextBillingDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
