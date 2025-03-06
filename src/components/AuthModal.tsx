import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Typography,
  Alert,
  Box,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import './AuthModal.scss';
import { toast } from 'react-toastify';
import { Button } from '../design-system/components/Button';

const AuthModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await auth?.signUp(email, password);
        onClose();
      } else {
        await auth?.signIn(email, password);
        onClose();
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message, {
        style: { background: '#d32f2f', color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await auth?.signInWithGoogle();
      onClose();
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message, {
        style: { background: '#d32f2f', color: 'white' }
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {isSignUp ? 'Create Account' : 'Sign In'}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <Box sx={{ my: 2 }}>
          <Divider>OR</Divider>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleGoogleSignIn}
          sx={{ mb: 2 }}
        >
          Continue with Google
        </Button>

        <Typography align="center">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Button>
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal; 