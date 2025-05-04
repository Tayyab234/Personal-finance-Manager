const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Email validation regex (basic check)
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Signup Route
router.post('/signup', async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  // Basic Email Validation
  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: 'Please enter a valid email address' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, phone, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: newUser._id, fullName, email } });
  } catch (err) {
    console.error(err); // Logging the actual error for debugging
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic Email Validation
  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: 'Please enter a valid email address' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User does not exist' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email } });
  } catch (err) {
    console.error(err); // Logging the actual error for debugging
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
