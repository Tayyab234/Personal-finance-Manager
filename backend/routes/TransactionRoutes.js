const express = require('express');
const { getTransactions, addTransaction, deleteTransaction } = require('../controllers/transactionController');
const router = express.Router();

router.get('/', getTransactions);
router.post('/', addTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
