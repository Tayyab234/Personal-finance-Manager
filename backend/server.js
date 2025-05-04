const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Root route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Personal Finance Manager API!');
});

// Auth routes (Signup/Login)
app.use('/api/auth', require('./routes/auth'));

// Transactions API routes
app.use('/api/transactions', require('./routes/transactionRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
