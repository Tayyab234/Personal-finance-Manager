// src/components/RecentTransactions.jsx
import React from 'react';

function RecentTransactions({ transactions }) {
    return (
        <div className="recent-transactions">
            <h2>Recent Transactions</h2>
            {transactions && transactions.length > 0 ? (
                <ul>
                    {transactions.map((transaction) => (
                        <li key={transaction._id}>
                            <span>{transaction.type}:</span>
                            <span>{transaction.amount}</span>
                            {/* Add more fields if necessary */}
                            {transaction.description && <p>Description: {transaction.description}</p>}
                            <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No transactions available</p>
            )}
        </div>
    );
}

export default RecentTransactions;
