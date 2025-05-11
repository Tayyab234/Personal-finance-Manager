import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h2>Finance Manager</h2>
      {token ? (
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/expense-tracker">Expense Tracker</Link></li>
          <li><Link to="/budget-categories">Budget Categories</Link></li>
          <li><Link to="/financial-reports">Financial Reports</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      ) : (
        <ul>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/signup">Signup</Link></li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
