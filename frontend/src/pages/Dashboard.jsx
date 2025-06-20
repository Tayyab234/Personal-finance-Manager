import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid } from '@mui/material';
import IncomeSettingsMenu from '../components/IncomeSettingsMenu';
import SummaryCards from '../components/SummaryCards';
import DashboardAnalytics from './DashboardAnalytics';
import './Dashboard.css';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const token = localStorage.getItem('token');

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <Grid container justifyContent="space-between" alignItems="center" spacing={2} className="dashboard-header">
        <Grid item>
          <h2>Finance Dashboard</h2>
        </Grid>
        <Grid item>
          <IncomeSettingsMenu onIncomeAdded={fetchDashboardData} />
        </Grid>
      </Grid>

      <SummaryCards data={dashboardData} />

      {/* Analytics Section as Separate Component */}
      <DashboardAnalytics dashboardData={dashboardData} />
    </div>
  );
}

export default Dashboard;
