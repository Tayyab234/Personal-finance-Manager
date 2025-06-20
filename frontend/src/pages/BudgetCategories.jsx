import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Typography, Button, TextField, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function BudgetCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [newBudget, setNewBudget] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

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
      toast.error('Failed to load data.');
    }
  };

  const allocatedBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const available = totalIncome - allocatedBudget;

  const handleAddCategory = async () => {
    const parsedBudget = parseFloat(budget);

    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      toast.warn('Please enter a valid budget amount.');
      return;
    }

    if (parsedBudget > available) {
      toast.error(`Cannot allocate more than $${available.toFixed(2)} remaining.`);
      return;
    }

    try {
      const res = await axios.post('/api/budget-categories', { name, budget: parsedBudget }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(prev => [...prev, { ...res.data, budget: parsedBudget }]);
      setName('');
      setBudget('');
      toast.success('Category added successfully!');
    } catch (err) {
      toast.error('Failed to add category.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/budget-categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(prev => prev.filter((cat) => cat._id !== id));
      toast.success('Category deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete category.');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewBudget(category.budget);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    const parsed = parseFloat(newBudget);

    if (isNaN(parsed) || parsed <= 0) {
      toast.warn('Enter a valid budget amount.');
      return;
    }

    const difference = parsed - editingCategory.budget;

    if (difference > available) {
      toast.error(`Cannot allocate more than $${available.toFixed(2)} remaining.`);
      return;
    }

    try {
      await axios.put(`/api/budget-categories/${editingCategory._id}`, { budget: parsed }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCategories(prev =>
        prev.map(cat => (cat._id === editingCategory._id ? { ...cat, budget: parsed } : cat))
      );

      toast.success('Budget updated successfully!');
      setOpenDialog(false);
    } catch (err) {
      toast.error('Failed to update budget.');
    }
  };

  return (
    <div className="budget-categories" style={{ padding: '20px' }}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom>Budget Categories</Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Available to allocate: ${available.toFixed(2)}
      </Typography>

      <Grid container spacing={2} style={{ marginBottom: '20px' }}>
        <Grid item xs={12} sm={5}>
          <TextField
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            label="Budget Amount"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddCategory}
            fullWidth
          >
            Add
          </Button>
        </Grid>
      </Grid>

      {categories.length > 0 ? (
        <Grid container spacing={3}>
          {categories.map((cat) => (
            <Grid item xs={12} md={6} lg={4} key={cat._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{cat.name}</Typography>
                  <Typography>Budget: ${cat.budget.toFixed(2)}</Typography>
                  <Typography>Spent: ${cat.spent?.toFixed(2) || '0.00'}</Typography>
                  <Typography
                    style={{ color: (cat.budget - cat.spent < 0) ? 'red' : 'green' }}
                  >
                    Remaining: ${(cat.budget - cat.spent).toFixed(2)}
                  </Typography>
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <IconButton color="primary" onClick={() => handleEdit(cat)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(cat._id)}>
                      <Delete />
                    </IconButton>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="subtitle1" color="textSecondary" style={{ marginTop: '20px' }}>
          No categories defined yet.
        </Typography>
      )}

      {/* Edit Budget Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Budget for {editingCategory?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="New Budget"
            type="number"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default BudgetCategories;
