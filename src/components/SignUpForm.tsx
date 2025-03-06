import { SignUpFormProps } from '../types/common';
import { Alert, Box, TextField, Typography } from '@mui/material';
import { supabase } from '../lib/supabase';

import React, { useState } from 'react';

import './SignUpForm.scss';
import { Button } from '../design-system/components/Button';

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    mobileNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            mobile_number: formData.mobileNumber,
          },
        },
      });

      if (authError) throw authError;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="signup-form-container">
      <Typography variant="h6" align="center" gutterBottom>
        Sign Up
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="mobileNumber"
          label="Mobile Number"
          value={formData.mobileNumber}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
        <Button
          onClick={onToggleForm}
          variant="text"
          fullWidth
          sx={{ mt: 1 }}
        >
          Already have an account? Sign In
        </Button>
      </form>
    </Box>
  );
};

export default SignUpForm;