import React, { useState } from 'react';
import { Modal, Box, Button, TextField } from '@mui/material';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

function AddIncomeModal({ open, onClose, onIncomeAdded }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAddIncome = async () => {
    const token = localStorage.getItem('token');
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('Please enter a valid income amount.');
      return;
    }

    try {
      await axios.post('/api/income', { amount: parseFloat(amount), description }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onIncomeAdded();
      onClose();
    } catch (err) {
      console.error('Error adding income:', err);
      alert('Failed to add income.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <h3>Add Income</h3>
        <TextField
          label="Amount"
          type="number"
          fullWidth
          margin="normal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddIncome} sx={{ mt: 2 }}>
          Add Income
        </Button>
      </Box>
    </Modal>
  );
}

export default AddIncomeModal;
