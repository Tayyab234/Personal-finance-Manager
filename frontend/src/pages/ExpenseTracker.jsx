import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ExpenseTracker.css';

function ExpenseTracker() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const token = localStorage.getItem('token');

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/budget-categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const categoryArray = Array.isArray(res.data.categories) ? res.data.categories : [];
      setCategories(categoryArray);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
        params: filterDate ? { date: filterDate } : {}
      });
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [filterDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) <= 0) {
      alert('Amount must be greater than zero');
      return;
    }

    try {
      await axios.post(
        '/api/expenses',
        {
          category: categoryId,
          amount: Number(amount),  // ✅ convert to number
          description
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAmount('');
      setDescription('');
      setCategoryId('');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert('Failed to add expense');
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    const catName = exp.category?.name || '';
    return (
      catName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.amount.toString().includes(searchTerm)
    );
  });

  const formatDate = (date) => {
    if (!date) return 'No Date';
    const d = new Date(date);

    const datePart = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const timePart = d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${datePart}, ${timePart}`;
  };

  return (
    <div className="expense-tracker">
      <h2>Track Expenses</h2>

      <form onSubmit={handleSubmit} className="expense-form">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">Add Expense</button>
      </form>

      <div className="filters">
        <input
          type="text"
          className="search-box"
          placeholder="Search by category or amount"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <table className="expense-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
  {filteredExpenses.map((exp) => (
    <tr key={exp._id}>
      <td>{exp.category?.name || exp.categoryName || 'Unknown'}</td> {/* Update this line */}
      <td>${Number(exp.amount).toFixed(2)}</td>
      <td>{exp.description}</td>
      <td>{formatDate(exp.createdAt)}</td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
}

export default ExpenseTracker;
