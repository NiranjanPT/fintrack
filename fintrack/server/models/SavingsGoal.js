const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    deadline: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculated fields (not stored in MongoDB)
savingsGoalSchema.virtual('remainingAmount').get(function remainingAmount() {
  return Math.max(this.targetAmount - this.currentAmount, 0);
});

savingsGoalSchema.virtual('progress').get(function progress() {
  if (!this.targetAmount) return 0;
  return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
});

savingsGoalSchema.virtual('isCompleted').get(function isCompleted() {
  return this.currentAmount >= this.targetAmount;
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
