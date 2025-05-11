const mongoose = require('mongoose');

// Define Expense schema
const ExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // References the User model
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,  // References the BudgetCategory model
      ref: 'BudgetCategory',  // Ensure this references the correct category model
      required: true,
    },
    categoryName: {  // New field to store category name at the time of expense creation
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',  // Optional field, defaults to an empty string
    },
    date: {
      type: Date,
      default: Date.now,  // Automatically set the date to the current time
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

module.exports = mongoose.model('Expense', ExpenseSchema);
