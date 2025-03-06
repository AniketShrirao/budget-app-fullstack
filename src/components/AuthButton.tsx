import { Typography } from '@mui/material';

import { useAuth } from '../context/AuthContext';
import './AuthButton.scss';
import { Button } from '../design-system/components/Button';

const AuthButton = ({ isMobile }: { isMobile: boolean }) => {
  const auth = useAuth();
  const { user, signInWithGoogle, signOut } = auth || {};

  return (
    <div className={`auth-buttons ${isMobile ? 'mobile' : 'desktop'}`}>
      {user ? (
        <>
          <Typography variant="body1" className="user-info">
            {user.email || user.user_metadata.full_name}
          </Typography>
          <Button variant="contained" color="error" onClick={signOut}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button size="small" variant="contained" color="primary" onClick={signInWithGoogle}>
            Sign In
          </Button>
          <Button size="small" variant="contained" color="primary">
            Sign Up
          </Button>
        </>
      )}
    </div>
  );
};

export default AuthButton;
