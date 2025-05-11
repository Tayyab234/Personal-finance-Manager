const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { authenticateUser } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// GET /api/financial-reports?startDate=...&endDate=...
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Ensure start and end dates are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start and end dates are required.' });
    }

    // Parse and normalize the dates to UTC
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ msg: 'Invalid date format.' });
    }

    start.setUTCHours(0, 0, 0, 0); // Normalize start date to UTC 00:00:00
    end.setUTCHours(23, 59, 59, 999); // Normalize end date to UTC 23:59:59

    console.log("Start Date (UTC-normalized):", start.toISOString());
    console.log("End Date (UTC-normalized):", end.toISOString());

    // Aggregation query to fetch financial report data grouped by category
    const reports = await Expense.aggregate([
      // Match expenses for the user within the date range
      { 
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      // Look up category details from 'BudgetCategory' collection
      {
        $lookup: {
          from: 'budgetcategories', // Change to the correct collection name
          localField: 'category', // Category reference in Expense collection
          foreignField: '_id',    // Category reference _id in 'BudgetCategory'
          as: 'categoryInfo'
        }
      },
      // Log categoryInfo after lookup to check if it’s correctly populated
      {
        $project: {
          categoryInfo: 1,
          categoryName: 1,
          amount: 1,
          description: 1,
          date: 1,
        }
      },
      // Flatten categoryInfo array
      { 
        $unwind: { 
          path: '$categoryInfo', 
          preserveNullAndEmptyArrays: true // Handle missing or deleted categories
        }
      },
      // Group data by category
      {
        $group: {
          _id: { 
            category: { 
              // Use category name from 'categoryInfo' if available, or from the Expense model directly
              $ifNull: ['$categoryInfo.name', '$categoryName'] 
            },
            categoryId: { $ifNull: ['$categoryInfo._id', null] } // Fallback for category ID
          },
          totalSpent: { $sum: '$amount' },
          transactions: {
            $push: {
              amount: '$amount',
              description: '$description',
              date: '$date'
            }
          }
        }
      },
      // Sort categories by name (or use other sorting logic)
      { $sort: { '_id.category': 1 } }
    ]);

    //console.log('Aggregation Results:', reports);

    // Handle no reports found
    if (reports.length === 0) {
      return res.json({ message: 'No transactions found for the selected date range.' });
    }

    // Send the generated reports
    res.json({ reports });

  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ msg: 'Server error while generating report' });
  }
});


module.exports = router;
