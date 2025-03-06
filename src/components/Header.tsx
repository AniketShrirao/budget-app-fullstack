import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar,  
  Typography, 
  IconButton, 
  Menu, 
  MenuItem,
  Box,
  Avatar,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Header.scss';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Button } from '../design-system/components/Button';

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const profile = useSelector((state: RootState) => state.profile);

  // Get user display name or email
  const userDisplay = auth?.user?.user_metadata?.full_name || auth?.user?.email || '';

  const handleOpenAuthModal = () => setIsAuthModalOpen(true);
  const handleCloseAuthModal = () => setIsAuthModalOpen(false);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { path: '/transactions', label: 'Transactions' },
    { path: '/summary', label: 'Summary' },
    { path: '/income', label: 'Income' },
    { path: '/lending', label: 'Lending' },
    { path: '/dashboard', label: 'Dashboard'}
  ];

  // Add state for body scroll lock
  useEffect(() => {
    if (Boolean(anchorEl)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [anchorEl]);

  const handleLogout = async () => {
    try {
      auth?.signOut();
      await supabase.auth.signOut({
        scope: 'local'
      });
      handleMenuClose();
      navigate('/');
      toast.success('Successfully logged out!', {
        style: { background: '#4caf50', color: 'white' }
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Error logging out. Please try again.', {
        style: { background: '#d32f2f', color: 'white' }
      });
      navigate('/');
    }
  };

  return (
    <AppBar position="fixed" className="header">
      <Container maxWidth="xl">
        <Toolbar disableGutters className="toolbar">
          <Typography variant="h6" className="logo">
            Budget Tracker
          </Typography>

          {auth?.user ? (
            <>
              {/* Desktop Navigation */}
              <Box className="desktop-nav">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </Box>

              {/* Mobile Menu Button - only when logged in */}
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                className="mobile-menu-button"
              >
                {Boolean(anchorEl) ? <CloseIcon /> : <MenuIcon />}
              </IconButton>

              {/* Mobile Menu - only when logged in */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                className="mobile-menu"
                PaperProps={{
                  sx: {
                    width: '100%',
                    maxWidth: '100%',
                    height: '100vh',
                    maxHeight: 'calc(100vh - 40px) !important',
                    top: '0 !important',
                    left: '0 !important',
                    right: '0 !important',
                    bottom: '0 !important',
                    position: 'fixed',
                    backgroundColor: '#1a1a1a',
                    borderRadius: 0,
                    overflowY: 'auto',
                  }
                }}
                PopoverClasses={{
                  root: 'mobile-menu-popover'
                }}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                {/* Mobile Menu Header */}
                <Box className="mobile-menu-header">
                  <IconButton 
                    color="inherit" 
                    onClick={handleMenuClose}
                    className="close-button"
                  >
                    <CloseIcon />
                  </IconButton>
                  {auth?.user && (
                    <Box className="mobile-user-info">
                      <Avatar className="user-avatar" src={profile.avatar}>
                        {!profile.avatar && userDisplay.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography className="user-name">
                        {userDisplay}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Menu Items Container */}
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  {menuItems.map((item) => (
                    <MenuItem 
                      key={item.path} 
                      onClick={handleMenuClose}
                      component={NavLink}
                      to={item.path}
                      sx={{
                        color: 'white',
                        textAlign: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        padding: '16px 24px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&.active': {
                          background: 'rgba(255, 255, 255, 0.2)',
                        },
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Box>

                {/* Mobile Menu Footer */}
                <Box className="mobile-menu-footer">
                  <Button 
                    color="inherit" 
                    onClick={handleLogout}
                    fullWidth
                  >
                    Logout
                  </Button>
                </Box>
              </Menu>
            </>
          ) : (
            /* Login Button - visible in both mobile and desktop */
            <Button 
              color="inherit" 
              onClick={handleOpenAuthModal}
              sx={{ marginLeft: 'auto' }}
            >
              Login
            </Button>
          )}

          {/* Desktop User Section - only when logged in */}
          {auth?.user && (
            <Box className="user-section">
              <Avatar className="user-avatar" src={profile.avatar}>
                {!profile.avatar && userDisplay.charAt(0).toUpperCase()}
              </Avatar>
              <Typography className="user-name">
                {userDisplay}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>

      <AuthModal 
        open={isAuthModalOpen} 
        onClose={handleCloseAuthModal} 
      />
    </AppBar>
  );
};

export default Header;
