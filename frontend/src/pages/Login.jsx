import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Use useNavigate

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Changed to useNavigate

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous session data (important for logging in with a new user)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      // Store the new user's token and data
      localStorage.setItem('token', response.data.token); // Store JWT token
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user data
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  // Navigate to signup page when "Create Account" is clicked
  const handleCreateAccount = () => {
    navigate('/signup'); // Redirect to signup page
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <div className="signup-prompt">
        <p>Don't have an account? <button onClick={handleCreateAccount}>Create Account</button></p>
      </div>
    </div>
  );
};

export default Login;
