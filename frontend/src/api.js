import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Get the auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all transactions
export const getTransactions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/transactions`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Add a new transaction
export const addTransaction = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/transactions`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/transactions/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
