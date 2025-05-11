const BudgetCategory = require('../models/BudgetCategory');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total income
    const incomeAgg = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalIncome = incomeAgg[0]?.total || 0;

    // Get total expenses
    const expenseAgg = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = expenseAgg[0]?.total || 0;

    // Get budget categories and calculate the remaining budget
    const categories = await BudgetCategory.find({ user: userId });

    let remainingBudget = 0;

    categories.forEach(category => {
      const spent = category.spent || 0; // If 'spent' is not set, use 0
      const budget = category.budget || 0; // If 'budget' is not set, use 0
      const remaining = budget - spent;
      remainingBudget += remaining;
    });

    // Calculate total savings
    const totalSavings = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      totalSavings,
      remainingBudget
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to load dashboard data' });
  }
};

module.exports = { getDashboardData };
