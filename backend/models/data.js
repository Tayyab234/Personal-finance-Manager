const mongoose = require('mongoose');

// Define Expense schema
const DataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // References the User model
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
  }
);

module.exports = mongoose.model('data', DataSchema);
