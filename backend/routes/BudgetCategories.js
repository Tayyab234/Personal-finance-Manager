const express = require('express');
const router = express.Router();
const BudgetCategory = require('../models/BudgetCategory');
const { authenticateUser } = require('../middleware/authMiddleware');

// POST /api/budget-categories
router.post('/', authenticateUser, async (req, res) => {
  const { name, budget } = req.body;
  try {
    const newCategory = new BudgetCategory({
      user: req.user.id,
      name,
      budget
    });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/budget-categories
router.get('/', authenticateUser, async (req, res) => {
  try {
    const categories = await BudgetCategory.find({ user: req.user.id });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/categories/:id - Update budget amount
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { budget } = req.body;
    const categoryId = req.params.id;

    if (!budget || budget <= 0) {
      return res.status(400).json({ msg: 'Budget must be greater than 0.' });
    }

    const updatedCategory = await BudgetCategory.findOneAndUpdate(
      { _id: categoryId, user: req.user.id },
      { budget },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ msg: 'Category not found.' });
    }

    res.json({ msg: 'Budget updated successfully.', category: updatedCategory });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});


// DELETE /api/budget-categories/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    await BudgetCategory.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ msg: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
