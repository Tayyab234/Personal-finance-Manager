const Income = require('../models/Income');

const addIncome = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid income amount' });
    }

    const newIncome = new Income({
      user: req.user._id,
      amount: parseFloat(amount),
    });

    await newIncome.save();
    res.status(201).json({ msg: 'Income added successfully', income: newIncome });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error while adding income' });
  }
};

module.exports = { addIncome };
