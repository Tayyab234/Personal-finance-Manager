import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import BudgetCategories from './pages/BudgetCategories';
import FinancialReports from './pages/FinancialReports';
import Signup from './pages/Signup';
import Login from './pages/Login';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';  // Import the Error Boundary

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const HideNavbarWrapper = ({ children }) => {
  const location = useLocation();
  const hideOnRoutes = ['/login', '/signup'];
  const shouldHide = hideOnRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHide && <Navbar />}
      <div className="main-content">{children}</div>
    </>
  );
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={
              <HideNavbarWrapper>
                <Login />
              </HideNavbarWrapper>
            }
          />
          <Route
            path="/signup"
            element={
              <HideNavbarWrapper>
                <Signup />
              </HideNavbarWrapper>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <HideNavbarWrapper>
                  <Dashboard />
                </HideNavbarWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/expense-tracker"
            element={
              <PrivateRoute>
                <HideNavbarWrapper>
                  <ExpenseTracker />
                </HideNavbarWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/budget-categories"
            element={
              <PrivateRoute>
                <HideNavbarWrapper>
                  <BudgetCategories />
                </HideNavbarWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/financial-reports"
            element={
              <PrivateRoute>
                <HideNavbarWrapper>
                  <FinancialReports />
                </HideNavbarWrapper>
              </PrivateRoute>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
