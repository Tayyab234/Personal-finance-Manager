const mongoose = require('mongoose');

const BudgetCategorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  budget: { type: Number, required: true },
  spent: { type: Number, default: 0 }
});

module.exports = mongoose.model('BudgetCategory', BudgetCategorySchema);
