import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, List, ListItem, Divider } from '@mui/material';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: '70vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

function IncomeHistoryModal({ open, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) fetchIncomeHistory();
  }, [open]);

  const fetchIncomeHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/income/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data.incomeHistory || []);
    } catch (err) {
      console.error('Error fetching income history:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">Income History</Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : history.length === 0 ? (
          <Typography>No income history records found.</Typography>
        ) : (
          <List>
            {history.map((record, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <Typography>
                    💰 ${record.amountAdded.toFixed(2)} - {record.description || 'No description'} <br />
                    📅 {new Date(record.createdAt).toLocaleString()}
                  </Typography>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Modal>
  );
}

export default IncomeHistoryModal;
