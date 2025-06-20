import React, { useState, useEffect } from 'react';
import { Button, TextField, Paper, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    setFormData({ fullName: '', email: '', phone: '', password: '' });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Signup successful!', { autoClose: 1500 });
      setTimeout(() => navigate('/dashboard'), 1600);
      setFormData({ fullName: '', email: '', phone: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Signup failed');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <ToastContainer />
      <Paper elevation={4} style={{ padding: 30, width: 400 }}>
        <Typography variant="h4" gutterBottom align="center">Signup</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: 20 }}>
            Signup
          </Button>
        </form>
        <Typography align="center" style={{ marginTop: 15 }}>
          Already have an account?{' '}
          <Button onClick={() => navigate('/')} size="small">Login</Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;
