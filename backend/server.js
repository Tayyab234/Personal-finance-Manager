const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON bodies

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
  });

// Root Test Route
app.get('/', (req, res) => {
  res.send('👋 Welcome to the Personal Finance Manager API!');
});

// Routes
const budgetCategoryRoutes = require('./routes/budgetCategories'); // Ensure this path is correct
const financialReportsRoute = require('./routes/financialReports');
app.use('/api/financial-reports', financialReportsRoute);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/income', require('./routes/income')); // ✅ Income route registered
app.use('/api/budget-categories', budgetCategoryRoutes);
app.use('/api/Expenses', require('./routes/Expense'));
app.use('/api/resetdata', require('./routes/resetdata'));

app.use('/api/dashboard', require('./routes/dashboard'));
// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ msg: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Internal Server Error:', err);
  res.status(500).json({ msg: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
