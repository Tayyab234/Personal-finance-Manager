import { useEffect, useState } from 'react';
import { getTransactions, addTransaction } from '../api'; // adjust path if needed
import './ExpenseTracker.css';

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState('');

  // Fetch expenses from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTransactions();
        setExpenses(data);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      }
    };
    fetchData();
  }, []);

  const handleAddExpense = async () => {
    try {
      const newTx = {
        description: newExpense,
        amount: Math.floor(Math.random() * 1000), // or let user enter amount
      };
      const savedTx = await addTransaction(newTx);
      setExpenses([...expenses, savedTx]);
      setNewExpense('');
    } catch (error) {
      console.error('Failed to add transaction', error);
    }
  };

  return (
    <div className="expense-tracker">
      <h2>Expense Tracker</h2>
      <div className="expense-input">
        <input
          type="text"
          value={newExpense}
          onChange={(e) => setNewExpense(e.target.value)}
          placeholder="Enter new expense"
        />
        <button onClick={handleAddExpense}>Add Expense</button>
      </div>
      <div className="expense-list">
        <ul>
          {expenses.map((expense) => (
            <li key={expense._id}>
              {expense.description} - ${expense.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ExpenseTracker;
