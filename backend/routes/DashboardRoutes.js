// routes/dashboardRoutes.js
const express = require('express');
const { getDashboardData } = require('../controllers/dashboardController');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware'); // Assuming middleware to authenticate the user

// GET dashboard data
router.get('/', authenticateUser, getDashboardData);

module.exports = router;
