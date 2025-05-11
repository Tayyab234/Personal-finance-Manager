// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SummaryCards from '../components/SummaryCards';
import AddIncome from '../components/AddIncome';

// Safely parse user from localStorage
let user = null;
try {
  const storedUser = localStorage.getItem('user');
  user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
} catch (e) {
  console.error('Invalid user data in localStorage');
  localStorage.removeItem('user');
}


function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDashboardData(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);



  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h2>👋 Hello, {user?.fullName || 'Guest'}</h2>
      <p>📧 {user?.email || 'N/A'}</p>

      <AddIncome onIncomeAdded={fetchDashboardData} />

      <SummaryCards data={dashboardData} />
    </div>
  );
}

export default Dashboard;
