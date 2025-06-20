// src/pages/DashboardAnalytics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Button, TextField, RadioGroup, FormControlLabel, Radio, Alert, Snackbar, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['#00C49F', '#FF8042', '#0088FE', '#FFBB28', '#FF4444', '#4CAF50'];

function DashboardAnalytics({ dashboardData }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filterOption, setFilterOption] = useState('custom');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchAnalyticsData = async () => {
    if (!startDate || !endDate) {
      setAlert('Please select both start and end dates.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('/api/dashboard/analytics', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate }
      });

      setAnalyticsData(res.data);
      setExpenses(res.data.expenses);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setAlert('Failed to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const option = e.target.value;
    setFilterOption(option);

    const today = new Date();
    let start, end;

    if (option === 'thisYear') {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
    } else if (option === 'previousMonth') {
      const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      start = firstDayPrevMonth;
      end = lastDayPrevMonth;
    } else if (option === 'last30Days') {
      start = new Date();
      start.setDate(today.getDate() - 30);
      end = today;
    } else {
      start = '';
      end = '';
    }

    setStartDate(start ? start.toISOString().split('T')[0] : '');
    setEndDate(end ? end.toISOString().split('T')[0] : '');
  };

  const minimumDataRequirement = expenses.length >= 3;

  const barChartData = analyticsData?.expensesByCategory?.map(item => {
    const budget = analyticsData?.categoryBudgets?.find(cat => cat.name === item._id)?.budget || 0;
    return {
      category: item._id,
      budget,
      spending: item.totalSpent
    };
  }) || [];

  const pieChartData = analyticsData?.expensesByCategory?.map(item => ({
    name: item._id,
    value: item.totalSpent
  })) || [];

  const expensesOverTime = analyticsData?.expensesOverTime?.map(expense => ({
    date: new Date(expense.date).toLocaleDateString(),
    expense: expense.totalSpent
  })) || [];

  const savingsOverTime = expensesOverTime.map((data, index) => {
    const totalExpenseSoFar = expensesOverTime.slice(0, index + 1).reduce((sum, item) => sum + item.expense, 0);
    return {
      date: data.date,
      saving: (analyticsData?.totalIncome || 0) - totalExpenseSoFar
    };
  });
  return (
    <div className="analytics-section">
      <h3>Analyze Your Expenses</h3>

      <RadioGroup row value={filterOption} onChange={handleFilterChange}>
        <FormControlLabel value="thisYear" control={<Radio />} label="This Year" />
        <FormControlLabel value="previousMonth" control={<Radio />} label="Previous Month" />
        <FormControlLabel value="last30Days" control={<Radio />} label="Last 30 Days" />
        <FormControlLabel value="custom" control={<Radio />} label="Custom Range" />
      </RadioGroup>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={filterOption !== 'custom'}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={filterOption !== 'custom'}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button variant="contained" color="primary" fullWidth onClick={fetchAnalyticsData}>
            Analyze
          </Button>
        </Grid>
      </Grid>

      {loading && <div className="loading"><CircularProgress /></div>}

      {analyticsData && !minimumDataRequirement && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Not enough data to generate meaningful charts. Please add more expenses or select a wider date range.
        </Alert>
      )}

      {analyticsData && minimumDataRequirement && (
        <Grid container spacing={4} sx={{ mt: 3 }}>
          {/* Donut Chart: Savings vs Expenses */}
          <Grid item xs={12} md={6}>
            <h4>Savings vs Expenses</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Savings', value: analyticsData.savings },
                    { name: 'Expenses', value: analyticsData.totalExpenses }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  label
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#FF4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Grid>

          {/* Stacked Bar Chart: Budget vs Spending */}
          <Grid item xs={12} md={6}>
            <h4>Budget vs Spending by Category</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" stackId="a" fill="#4CAF50" name="Budget" />
                <Bar dataKey="spending" stackId="a" fill="#FF4444" name="Spending" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>

          {/* Pie Chart: Category Distribution */}
          <Grid item xs={12} md={6}>
            <h4>Category Expense Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Grid>

          {/* Line Chart: Savings Over Time */}
          <Grid item xs={12} md={6}>
            <h4>Savings Over Time</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsOverTime}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="saving" stroke="#00C49F" />
              </LineChart>
            </ResponsiveContainer>
          </Grid>

          {/* Line Chart: Expenses Over Time */}
          <Grid item xs={12}>
            <h4>Expenses Over Time</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expensesOverTime}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="expense" stroke="#FF8042" />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={Boolean(alert)}
        autoHideDuration={3000}
        onClose={() => setAlert('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setAlert('')}>
          {alert}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default DashboardAnalytics;
