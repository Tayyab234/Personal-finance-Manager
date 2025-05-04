import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTransactions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/transactions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTransactions(res.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [token, navigate]);

  return (
    <div>
      <h2>Dashboard</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li key={tx._id}>{tx.title} - ${tx.amount} ({tx.type})</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
