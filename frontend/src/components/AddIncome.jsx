import React, { useState } from 'react';
import axios from 'axios';

function AddIncome({ onIncomeAdded }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const formatAmount = (amount) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return '$0.00';
    return `$${parsedAmount.toFixed(2)}`;
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      if (action === 'add') {
        await axios.post('/api/income', { amount: parsedAmount }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (action === 'subtract') {
        await axios.patch('/api/income/subtract', { amount: parsedAmount }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setAmount('');
      onIncomeAdded();
    } catch (error) {
      console.error(`Failed to ${action} income:`, error);
      alert(`Something went wrong while trying to ${action} income.`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetIncome = async () => {
    const confirmReset = window.confirm('Are you sure you want to reset all income to 0? This cannot be undone.');
    if (!confirmReset) return;

    try {
      await axios.put('/api/income/reset', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onIncomeAdded();
    } catch (err) {
      console.error('Error resetting income:', err);
      alert('Failed to reset income');
    }
  };

  return (
    <div className="add-income">
      <h3>Manage Income</h3>
      <form
        onSubmit={(e) => handleSubmit(e, 'add')}
        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}
      >
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add'}
        </button>
        <button type="button" onClick={(e) => handleSubmit(e, 'subtract')}>
          Subtract
        </button>
        <button
          type="button"
          onClick={handleResetIncome}
          style={{ backgroundColor: '#f44336', color: '#fff' }}
        >
          Reset
        </button>
      </form>
      <p>Preview: {formatAmount(amount)}</p>
    </div>
  );
}

export default AddIncome;
