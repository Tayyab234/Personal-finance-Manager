const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const { authenticateUser } = require('../middleware/authMiddleware');

// POST /api/income - Add income
router.post('/', authenticateUser, async (req, res) => {
  const { amount } = req.body;
  console.log("➡️ Add Income - Received amount:", amount);
  console.log("👤 Authenticated user:", req.user?._id);

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ msg: 'Income amount must be a number greater than 0' });
  }

  try {
    const income = new Income({
      user: req.user._id,
      amount: parsedAmount,
    });

    await income.save();
    res.status(201).json({ msg: 'Income added successfully', income });
  } catch (err) {
    console.error("❌ Server error while adding income:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});
// PATCH /api/income/subtract - Subtract from income
router.patch('/subtract', authenticateUser, async (req, res) => {
  const { amount } = req.body;
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ msg: 'Amount must be a positive number' });
  }

  try {
    const latestIncome = await Income.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!latestIncome || latestIncome.amount < parsedAmount) {
      return res.status(400).json({ msg: 'Insufficient income to subtract' });
    }

    latestIncome.amount -= parsedAmount;
    await latestIncome.save();

    res.json({ msg: 'Income subtracted successfully', updatedAmount: latestIncome.amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});
// PUT /api/income/reset - Reset all income to 0
router.put('/reset', authenticateUser, async (req, res) => {
  try {
    await Income.deleteMany({ user: req.user._id }); // or optionally create a single 0 income entry
    res.json({ msg: 'Income has been reset to zero' });
  } catch (err) {
    console.error(err);
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

// DELETE /api/income - Delete all income entries for a user
router.delete('/', authenticateUser, async (req, res) => {
  try {
    await Income.deleteMany({ user: req.user._id });
    res.json({ msg: 'All income entries deleted successfully' });
  } catch (err) {
    console.error("❌ Server error deleting income:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
