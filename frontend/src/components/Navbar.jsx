import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/expense-tracker', label: 'Expense Tracker' },
    { to: '/budget-categories', label: 'Budget Categories' },
    { to: '/financial-reports', label: 'Financial Reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Top Row */}
      <div className="navbar-top" onClick={() => navigate('/')}>
        Finance Manager
      </div>

      {/* Menu Toggle (Mobile) */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        {token ? (
          <>
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.to}
                  className={isActive(link.to) ? 'active-link' : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/"
                className="logout-link"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/login"
                className={isActive('/login') ? 'active-link' : ''}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className={isActive('/signup') ? 'active-link' : ''}
                onClick={() => setMenuOpen(false)}
              >
                Signup
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
