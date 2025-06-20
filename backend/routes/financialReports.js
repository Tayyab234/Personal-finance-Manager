const express = require('express');
const router = express.Router();
const Data = require('../models/data');
const { authenticateUser } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start and end dates are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ msg: 'Invalid date format.' });
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    console.log('🔍 Backend Start Date (UTC):', start.toISOString());
    console.log('🔍 Backend End Date (UTC):', end.toISOString());

    const reports = await Data.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),  // ✅ Correct type
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$categoryName',
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
      { $sort: { '_id': 1 } }
    ]);

    if (reports.length === 0) {
      return res.json({ message: 'No transactions found for the selected date range.' });
    }

    res.json({ reports });

  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ msg: 'Server error while generating report' });
  }
});

module.exports = router;
