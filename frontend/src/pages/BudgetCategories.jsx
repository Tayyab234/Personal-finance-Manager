import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BudgetCategories.css'
function BudgetCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newBudget, setNewBudget] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeRes = await axios.get('/api/income/total', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTotalIncome(incomeRes.data.totalIncome || 0);

        const res = await axios.get('/api/budget-categories', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCategories(Array.isArray(res.data.categories) ? res.data.categories : []);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  const allocatedBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const available = totalIncome - allocatedBudget;

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const parsedBudget = parseFloat(budget);

    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    if (parsedBudget > available) {
      alert(`Cannot allocate more than $${available.toFixed(2)} remaining`);
      return;
    }

    try {
      const res = await axios.post('/api/budget-categories', { name, budget: parsedBudget }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(prev => [...prev, { ...res.data, budget: parsedBudget }]);
      setName('');
      setBudget('');
    } catch (err) {
      console.error(err);
      alert('Failed to add category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/budget-categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(prev => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleEdit = (id, currentBudget) => {
    setEditingId(id);
    setNewBudget(currentBudget);
  };

  const handleUpdate = async (id) => {
  const parsed = parseFloat(newBudget);
  if (isNaN(parsed) || parsed <= 0) {
    alert('Enter a valid budget amount.');
    return;
  }

  const category = categories.find(cat => cat._id === id);
  if (!category) {
    alert('Category not found.');
    return;
  }

  const difference = parsed - category.budget;

  if (difference > available) {
    alert(`Cannot allocate more than $${available.toFixed(2)} remaining.`);
    return;
  }

  try {
    const res = await axios.put(`/api/budget-categories/${id}`, { budget: parsed }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setCategories(prev =>
      prev.map(cat => (cat._id === id ? { ...cat, budget: parsed } : cat))
    );
    setEditingId(null);
    setNewBudget('');
  } catch (err) {
    console.error(err);
    alert('Failed to update budget');
  }
};


  return (
    <div className="budget-categories">
      <h2>Budget Categories</h2>
      <p>Available to allocate: ${available.toFixed(2)}</p>

      <form onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />
        <button type="submit" disabled={isNaN(budget) || parseFloat(budget) <= 0}>
          Add Category
        </button>
      </form>

    <ul className="budget-categories">
  {categories.length > 0 ? (
    categories.map((cat) => (
      <li key={cat._id}>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Remaining</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{cat.name}</td>
              <td>${cat.budget.toFixed(2)}</td>
              <td>${(cat.spent || 0).toFixed(2)}</td>
              <td
                style={{
                  color: cat.budget - cat.spent < 0 ? 'red' : 'green',
                }}
              >
                ${(cat.budget - cat.spent).toFixed(2)}
              </td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(cat._id, cat.budget)}>
                  Edit
                </button>
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(cat._id)}>
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {editingId === cat._id && (
          <div>
            <input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              placeholder="New Budget"
            />
            <button className="save-btn" onClick={() => handleUpdate(cat._id)}>
              Save
            </button>
            <button
              className="cancel-btn"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </button>
          </div>
        )}
      </li>
    ))
  ) : (
    <p className="no-categories">No categories defined yet</p>
  )}
</ul>



      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default BudgetCategories;
