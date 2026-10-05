const mongoose = require('mongoose');
const { TRANSACTION_TYPES } = require('../config/constants');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [30, 'Category name cannot exceed 30 characters'],
    },
    type: {
      type: String,
      enum: { values: TRANSACTION_TYPES, message: 'Type must be income or expense' },
      required: [true, 'Category type is required'],
    },
  },
  { timestamps: true }
);

// A user cannot have two categories with the same name and type
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
