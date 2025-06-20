const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const IncomeHistory = require('../models/incomehistory');
const { authenticateUser } = require('../middleware/authMiddleware');
// POST /api/income - Add income
router.post('/', authenticateUser, async (req, res) => {
  const { amount, description } = req.body;

  console.log("➡️ Add Income - Received amount:", amount);
  console.log("👤 Authenticated user:", req.user?._id);

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ msg: 'Income amount must be a number greater than 0' });
  }

  try {
    // Save to Income Model (current total)
    const income = new Income({
      user: req.user._id,
      amount: parsedAmount,
    });
    await income.save();

    // Save to IncomeHistory Model (for tracking)
    const incomeHistory = new IncomeHistory({
      user: req.user._id,
      description: description || '',
      amountAdded: parsedAmount,
    });
    await incomeHistory.save();

    res.status(201).json({ msg: 'Income added successfully', income, incomeHistory });

  } catch (err) {
    console.error("❌ Server error while adding income:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// GET /api/income/total - Get total income for user
router.get('/total', authenticateUser, async (req, res) => {
  try {
    const totalIncome = await Income.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({ totalIncome: totalIncome[0]?.total || 0 });
  } catch (err) {
    console.error("❌ Server error fetching total income:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/income/history - Get all income history for user
router.get('/history', authenticateUser, async (req, res) => {
  try {
    // Find all income history records for the authenticated user, sorted by newest first
    const incomeHistory = await IncomeHistory.find({ user: req.user._id }).sort({ createdAt: -1 });

    if (incomeHistory.length === 0) {
      return res.json({ message: 'No income history records found.', incomeHistory: [] });
    }

    // If records found, return them
    res.json({ incomeHistory });

  } catch (err) {
    console.error("❌ Server error fetching income history:", err);
    res.status(500).json({ msg: 'Server error while fetching income history' });
  }
});

module.exports = router;
