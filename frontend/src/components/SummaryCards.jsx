import React from 'react';

function SummaryCards({ data }) {
  if (!data) return <div>Loading summary...</div>;  // Gracefully handle null

  const formatCurrency = (amount) => {
    return amount ? `$${amount.toFixed(2)}` : '$0.00';
  };

  return (
    <div className="summary-cards">
      <div className="card">
        <h3>Total Income</h3>
        <p>{formatCurrency(data.totalIncome)}</p>
      </div>
      <div className="card">
        <h3>Total Expenses</h3>
        <p>{formatCurrency(data.totalExpenses)}</p>
      </div>
      <div className="card">
        <h3>Total Savings</h3>
        <p>{formatCurrency(data.totalSavings)}</p>
      </div>
      <div className="card">
        <h3>Remaining Budget</h3>
        <p>{formatCurrency(data.remainingBudget)}</p>
      </div>
    </div>
  );
}

export default SummaryCards;
