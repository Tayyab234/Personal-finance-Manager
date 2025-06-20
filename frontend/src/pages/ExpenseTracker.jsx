import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  TextField, Button, Select, MenuItem, InputLabel, FormControl, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ExpenseTracker() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [filterDate]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/budget-categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const categoryArray = Array.isArray(res.data.categories) ? res.data.categories : [];
      setCategories(categoryArray);
    } catch (err) {
      toast.error('Failed to fetch categories.');
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
      toast.error('Failed to fetch expenses.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) <= 0) {
      toast.warn('Amount must be greater than zero.');
      return;
    }

    try {
      await axios.post('/api/expenses', {
        category: categoryId,
        amount: Number(amount),
        description
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('Expense added successfully!');
      setAmount('');
      setDescription('');
      setCategoryId('');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to add expense.');
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    const catName = typeof exp.category === 'string'
      ? exp.category
      : exp.category?.name || exp.categoryName || '';
    return (
      catName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.amount.toString().includes(searchTerm)
    );
  });

  const formatDate = (date) => {
    if (!date) return 'No Date';
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom>Expense Tracker</Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Select Category</InputLabel>
              <Select
                value={categoryId}
                label="Select Category"
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Description"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              style={{ height: '100%' }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </form>

      <Grid container spacing={2} style={{ marginTop: '20px' }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Category or Amount"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Filter by Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper} style={{ marginTop: '30px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
   	      <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
    	      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
    	      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((exp) => (
                <TableRow key={exp._id}>
                  <TableCell>
                    {typeof exp.category === 'string'
                      ? exp.category
                      : exp.category?.name || exp.categoryName || 'Unknown'}
                  </TableCell>
                  <TableCell>${Number(exp.amount).toFixed(2)}</TableCell>
                  <TableCell>{exp.description}</TableCell>
                  <TableCell>{formatDate(exp.createdAt || exp.date)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" style={{ color: 'gray' }}>
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default ExpenseTracker;
