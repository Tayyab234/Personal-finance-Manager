const Transaction = require('../models/Transaction');

// GET all transactions for authenticated user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST new transaction for authenticated user
exports.addTransaction = async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      user: req.user.id
    });

    const saved = await newTransaction.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// DELETE transaction only if it belongs to the authenticated user
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction || transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    await transaction.remove();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
