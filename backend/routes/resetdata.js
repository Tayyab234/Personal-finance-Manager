const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const BudgetCategory = require('../models/BudgetCategory');
const Income = require('../models/Income');
const IncomeHistory = require('../models/incomehistory'); // Also reset income history if you want
const Data = require('../models/data'); // Also reset financial report data if needed

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');

// DELETE /api/resetdata
router.delete('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id; // Getting userId from auth middleware

    // Delete all related data correctly
    await Income.deleteMany({ user: userId });
    await Expense.deleteMany({ user: userId });
    await BudgetCategory.deleteMany({ user: userId });
    await IncomeHistory.deleteMany({ user: userId }); // Optional: Also delete income history

    return res.status(200).json({ message: 'All data has been reset successfully.' });
  } catch (error) {
    console.error('Error resetting data:', error);
    return res.status(500).json({ message: 'Failed to reset data.', error });
  }
});

module.exports = router;
