const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  let { fullName, email, phone, password } = req.body;

  // Trim and normalize input
  fullName = fullName.trim();
  email = email.trim().toLowerCase(); // Normalize email
  phone = phone.trim();
  password = password.trim();

  // Check if all fields are provided
  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ msg: 'Please fill in all required fields' });
  }

  // Basic Email Validation using validator
  if (!validator.isEmail(email)) {
    return res.status(400).json({ msg: 'Please enter a valid email address' });
  }

  // Password Length Check
  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, phone, password: hashedPassword });
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return response
    res.json({
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (err) {
    console.error('Error during signup:', err); // Logging the actual error for debugging
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  let { email, password } = req.body;

  // Trim and normalize input
  email = email.trim().toLowerCase(); // Normalize email
  password = password.trim();

  // Basic Email Validation using validator
  if (!validator.isEmail(email)) {
    return res.status(400).json({ msg: 'Please enter a valid email address' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User does not exist' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return response with user info
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Error during login:', err); // Logging the actual error for debugging
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
