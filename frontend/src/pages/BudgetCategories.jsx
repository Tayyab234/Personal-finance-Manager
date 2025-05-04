import './BudgetCategories.css';
import { useState } from 'react';

function BudgetCategories() {
  const [categories] = useState([
    { name: 'Food', budget: 500 },
    { name: 'Rent', budget: 1000 },
    { name: 'Entertainment', budget: 300 },
  ]);

  return (
    <div className="budget-categories">
      <h2>Budget Categories</h2>
      <div className="categories">
        {categories.map((cat, idx) => (
          <div className="category" key={idx}>
            <h3>{cat.name}</h3>
            <p>Budget: ${cat.budget}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BudgetCategories;
