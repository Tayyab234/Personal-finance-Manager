import React, { useState } from 'react';
import { Menu, MenuItem, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIncomeModal from './AddIncomeModal';
import IncomeHistoryModal from './IncomeHistoryModal';
import axios from 'axios';

function IncomeSettingsMenu({ onIncomeAdded }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDeleteData = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/resetdata', {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('All your data has been deleted successfully.');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data.');
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleMenuOpen}>
        Income Settings
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            setShowAddModal(true);
            handleMenuClose();
          }}
        >
          ➕ Add Income
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowHistoryModal(true);
            handleMenuClose();
          }}
        >
          📂 Income History
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowConfirmDialog(true);
            handleMenuClose();
          }}
        >
          🗑️ Reset/Delete Data
        </MenuItem>
      </Menu>

      <AddIncomeModal open={showAddModal} onClose={() => setShowAddModal(false)} onIncomeAdded={onIncomeAdded} />
      <IncomeHistoryModal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} />

      {/* Reset Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirm Data Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all your data? This action will permanently delete:
            <ul>
              <li>All Expenses</li>
              <li>All Incomes</li>
              <li>All Income History</li>
              <li>All Budget Categories</li>
            </ul>
            <strong>Your old expenses will still be available in the PDF reports.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDeleteData();
              setShowConfirmDialog(false);
            }}
            color="error"
            variant="contained"
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default IncomeSettingsMenu;
