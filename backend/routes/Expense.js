const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const Expense = require('../models/Expense');
const BudgetCategory = require('../models/BudgetCategory');
const mongoose = require('mongoose');

// POST /api/expenses - Add an expense
router.post('/', authenticateUser, async (req, res) => {
  try {
    let { category, amount, description, date } = req.body;
    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ msg: 'Amount must be a valid number greater than zero.' });
    }

    if (!category) {
      return res.status(400).json({ msg: 'Category is required.' });
    }

    const budgetCategory = await BudgetCategory.findOne({ _id: category, user: req.user.id });
    if (!budgetCategory) {
      return res.status(404).json({ msg: 'Category not found.' });
    }

    const totalSpent = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          category: new mongoose.Types.ObjectId(category),
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpentAmount = totalSpent.length > 0 ? totalSpent[0].totalSpent : 0;
    const budgetLimit = Number(budgetCategory.budget) || 0;

    if (totalSpentAmount + amount > budgetLimit) {
      return res.status(400).json({ msg: 'Transaction exceeds category budget.' });
    }

    // Store category name at the time of expense creation
    const expense = new Expense({
      user: req.user.id,
      category,
      categoryName: budgetCategory.name,  // Save the category name here
      amount,
      description,
      date: date || new Date(),
    });

    await expense.save();

    await BudgetCategory.findOneAndUpdate(
      { _id: category, user: req.user.id },
      { $inc: { spent: amount } },
      { new: true }
    );

    const updatedCategory = await BudgetCategory.findOne({ _id: category, user: req.user.id });

    res.status(201).json({
      msg: 'Expense added successfully.',
      expense,
      updatedCategory,
    });
  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(500).json({ msg: 'Server error', error: error.message || error });
  }
});


// GET /api/expenses - Fetch expenses with optional filters
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { category, minAmount, maxAmount, startDate, endDate, date } = req.query;

    const filter = { user: req.user.id };

    if (category) filter.category = category;
    if (minAmount) filter.amount = { ...filter.amount, $gte: parseFloat(minAmount) };
    if (maxAmount) filter.amount = { ...filter.amount, $lte: parseFloat(maxAmount) };

    // Handle specific date filter (from frontend)
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1); // include the whole day
      filter.date = { $gte: start, $lt: end };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter)
      .populate('category', 'name')  // Populate category name if it still exists
      .sort({ date: -1 });

    console.log('Expenses after population:', expenses);  // Log expenses after populate

    // Map through expenses and handle missing categories
    const updatedExpenses = expenses.map(expense => {
      // If category is null or undefined, use the 'categoryName' stored in the expense document
      const categoryName = expense.category ? expense.category.name : expense.categoryName;
      console.log('Category Name:', categoryName);  // Log category name for each expense

      const displayCategory = categoryName || 'Deleted Category'; // Fallback to 'Deleted Category' if no category name

      return {
        ...expense.toObject(),
        category: displayCategory,  // Use the category name or fallback if it's missing
      };
    });

    res.json(updatedExpenses);
  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(500).json({ msg: 'Server error', error: error.message || error });
  }
});


module.exports = router;
