const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Expense = require('../models/Expense'); // ✅ Use your Expense model here
const Income = require('../models/incomehistory'); // ✅ Your Income model
const { authenticateUser } = require('../middleware/authMiddleware');
const BudgetCategory = require('../models/BudgetCategory');
// GET /api/dashboard/analytics?startDate=...&endDate=...
router.get('/analytics', authenticateUser, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start and end dates are required.' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    const expenseMatch = { user: userId, date: { $gte: start, $lte: end } };
    // ✅ Total income in range
    const incomeResult = await Income.aggregate([
  { $match: { user: userId, createdAt: { $gte: start, $lte: end } } },
  { $group: { _id: null, totalIncome: { $sum: '$amountAdded' } } }
]);
const totalIncome = incomeResult[0]?.totalIncome || 0;

    
    // ✅ Total expenses in range
    const expenseResult = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expenseResult[0]?.totalExpenses || 0;

    const savings = totalIncome - totalExpenses;

    // ✅ Expenses per category for Bar & Pie Charts
    const expensesByCategory = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$categoryName', totalSpent: { $sum: '$amount' } } },
      { $sort: { totalSpent: -1 } }
    ]);

    // ✅ Expenses over time for Line Chart
    const expensesOverTime = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          totalSpent: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    let rawExpenses = [];
    try {
      rawExpenses = await Expense.find(expenseMatch).populate('category', 'name');
    } catch (err) {
      console.error('Error fetching raw expenses:', err);
    }
    let categoryBudgets = [];
    try {
      categoryBudgets = await BudgetCategory.find({ user: userId }).select('name budget spent');
    } catch (err) {
      console.error('Error fetching budget categories:', err);
    }
    // ✅ Format for Line Chart
    const formattedExpensesOverTime = expensesOverTime.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      totalSpent: item.totalSpent
    }));
   
    res.json({
      totalIncome,
      totalExpenses,
      savings,
      expensesByCategory,
      expensesOverTime: formattedExpensesOverTime,
      categoryBudgets,
      expenses: rawExpenses
    });

  } catch (err) {
    console.error('Error fetching dashboard analytics:', err);
    res.status(500).json({ msg: 'Server error while fetching dashboard analytics.' });
  }
});

module.exports = router;
