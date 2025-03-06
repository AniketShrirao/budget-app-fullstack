import { SignInFormProps } from '../types/common';
import { Alert, Box, Divider, TextField, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

import React, { useState } from 'react';

import GoogleIcon from '@mui/icons-material/Google';
import './SignInForm.scss';
import { Button } from '../design-system/components/Button';

const SignInForm: React.FC<SignInFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await auth?.signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="signin-form-container">
      <Typography variant="h6" align="center" gutterBottom>
        Sign In
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleEmailSignIn}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <Divider sx={{ my: 2 }}>OR</Divider>

      <Button
        onClick={() => auth?.signInWithGoogle()}
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
      >
        Continue with Google
      </Button>

      <Button
        onClick={onToggleForm}
        variant="text"
        fullWidth
        sx={{ mt: 1 }}
      >
        Don't have an account? Sign Up
      </Button>
    </Box>
  );
};

export default SignInForm;