import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Avatar,
  Paper,
  Grid,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateProfile, loadProfile } from '../../features/profileSlice';
import { Button } from '../../design-system/components/Button';

const Profile = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const auth = useAuth();
  const user = auth?.user;
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load saved profile data
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      dispatch(loadProfile(parsedProfile));
    } else {
      // Initialize with default values
      dispatch(updateProfile({
        displayName: user?.email?.split('@')[0] || '',
        email: user?.email || '',
      }));
    }
  }, [dispatch, user]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch(updateProfile({ [field]: event.target.value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateProfile({ avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setShowSuccess(true);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <Avatar
            src={profile.avatar}
            sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar-upload">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Display Name"
              value={profile.displayName}
              onChange={handleChange('displayName')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={handleChange('phone')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={4}
              value={profile.bio}
              onChange={handleChange('bio')}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" color="primary">
            Save Profile
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;