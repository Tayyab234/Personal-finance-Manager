const mongoose = require('mongoose');

const incomeSchema1 = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: {
      type: String,
      default: '',  // Optional field, defaults to an empty string
    },
  amountAdded: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IncomeHistory', incomeSchema1);
