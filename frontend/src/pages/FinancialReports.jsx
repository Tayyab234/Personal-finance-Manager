import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FinancialReportPDF from './FinancialReportPDF';

import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box
} from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

dayjs.extend(utc);

function FinancialReports() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const getDateRange = () => {
    const today = dayjs().utc();
    let start, end;

    switch (dateRange) {
      case 'today':
        start = today.startOf('day');
        end = today.endOf('day');
        break;
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

      setReportData(response.data.reports || []);
    } catch (err) {
      setError('Error fetching report. Please try again later.');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange, customStart, customEnd]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        📊 Financial Reports
      </Typography>

      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={3}>
        <FormControl fullWidth>
          <InputLabel id="date-range-label">Select Date Range</InputLabel>
          <Select
            labelId="date-range-label"
            value={dateRange}
            label="Select Date Range"
            onChange={(e) => setDateRange(e.target.value)}
          >
            <MenuItem value="today">None (Today)</MenuItem>
            <MenuItem value="last30">Last 30 Days</MenuItem>
            <MenuItem value="prevMonth">Previous Month</MenuItem>
            <MenuItem value="thisYear">This Year</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {dateRange === 'custom' && (
        <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={3}>
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            fullWidth
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            fullWidth
          />
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" mt={4}>{error}</Typography>
      ) : reportData.length ? (
        <>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Transactions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{item._id || 'Deleted Category'}</TableCell>
                    <TableCell>${item.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                        {item.transactions.map((tx, idx) => (
                          <li key={idx}>
                            ${tx.amount.toFixed(2)} - {tx.description} ({new Date(tx.date).toLocaleDateString()})
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PDF Download Button */}
          <Box display="flex" justifyContent="center" mt={3}>
            <PDFDownloadLink
              document={<FinancialReportPDF reportData={reportData} />}
              fileName="financial_report.pdf"
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) =>
                loading ? (
                  <Button variant="contained" disabled>
                    Preparing PDF...
                  </Button>
                ) : (
                  <Button variant="contained">
                    Download PDF Report
                  </Button>
                )
              }
            </PDFDownloadLink>
          </Box>
        </>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
          <ReportProblemOutlinedIcon sx={{ fontSize: 80, color: 'grey.500' }} />
          <Typography variant="h6" color="textSecondary" mt={2}>
            No transactions found for the selected date range.
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default FinancialReports;
