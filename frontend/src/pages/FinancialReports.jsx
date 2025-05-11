import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // This registers autoTable onto jsPDF
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

function FinancialReports() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('last30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const getDateRange = () => {
    const today = dayjs().utc();
    let start, end;

    switch (dateRange) {
      case 'last30':
        start = today.subtract(30, 'day').startOf('day');
        end = today.endOf('day');
        break;
      case 'prevMonth':
        start = today.subtract(1, 'month').startOf('month');
        end = today.subtract(1, 'month').endOf('month');
        break;
      case 'thisYear':
        start = today.startOf('year');
        end = today.endOf('year');
        break;
      case 'custom':
        start = dayjs(customStart).startOf('day').utc();
        end = dayjs(customEnd).endOf('day').utc();
        break;
      default:
        return null;
    }

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const fetchReport = async () => {
    const { startDate, endDate } = getDateRange();  
    if (!startDate || !endDate) return;  

    setLoading(true);  
    setError(null);

    try {
      const response = await axios.get('/api/financial-reports', {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      setReportData(response.data.reports || []);
    } catch (err) {
      setLoading(false);
      setError('Error fetching report. Please try again later.');
      console.error('Error fetching report:', err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange, customStart, customEnd]);

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text('Financial Report by Category', 14, 15);

    const tableBody = reportData.flatMap((item, index) => {
      const categoryName = item._id?.category || 'Deleted Category';
      return item.transactions.map((tx) => [
        index + 1,
        categoryName,
        `$${tx.amount.toFixed(2)}`,
        tx.description,
        new Date(tx.date).toLocaleDateString(),
      ]);
    });

    doc.autoTable({
      head: [['#', 'Category', 'Amount', 'Description', 'Date']],
      body: tableBody,
      startY: 25,
      margin: { left: 14 },
      theme: 'striped',
    });

    doc.save('financial_report.pdf');
  };

  return (
    <div className="financial-report">
      <h2>Financial Reports</h2>

      <div>
        <label htmlFor="dateRangeSelect">Select Date Range: </label>
        <select
          id="dateRangeSelect"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="last30">Last 30 Days</option>
          <option value="prevMonth">Previous Month</option>
          <option value="thisYear">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {dateRange === 'custom' && (
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="customStart">Start Date: </label>
          <input
            id="customStart"
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
          />
          <label htmlFor="customEnd" style={{ marginLeft: '1rem' }}>End Date: </label>
          <input
            id="customEnd"
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <p>Loading report...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : reportData.length ? (
        <>
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Total Spent</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item._id?.category || 'Deleted Category'}</td>
                  <td>${item.totalSpent.toFixed(2)}</td>
                  <td>
                    <ul>
                      {item.transactions.map((tx, idx) => (
                        <li key={idx}>
                          ${tx.amount.toFixed(2)} - {tx.description} ({new Date(tx.date).toLocaleDateString()})
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleGeneratePDF} style={{ marginTop: '1rem' }}>
            Generate PDF Report
          </button>
        </>
      ) : (
        <p>No transactions found for the selected date range.</p>
      )}
    </div>
  );
}

export default FinancialReports;
