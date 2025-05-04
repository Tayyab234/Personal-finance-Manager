const Transaction = require('../models/Transaction');

// GET all transactions
exports.getTransactions = async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
};

// POST new transaction
exports.addTransaction = async (req, res) => {
  const newTransaction = new Transaction(req.body);
  const saved = await newTransaction.save();
  res.status(201).json(saved);
};

// DELETE transaction
exports.deleteTransaction = async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
