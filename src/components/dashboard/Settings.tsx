import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Divider,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { toggleTheme } from '../../features/themeSlice';
import { Button } from '../../design-system/components/Button';

const Settings = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    currency: 'INR',
    language: 'en',
    budgetAlerts: true
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (name: string) => (event: any) => {
    setSettings({
      ...settings,
      [name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    });
  };

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setShowSuccess(true);
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Appearance
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={theme.palette.mode === 'dark'}
              onChange={() => dispatch(toggleTheme())}
            />
          }
          label="Dark Mode"
        />
      </Paper>

      <Typography variant="h6" gutterBottom>
        Notifications
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.emailNotifications}
              onChange={handleChange('emailNotifications')}
            />
          }
          label="Email Notifications"
        />
        <Divider sx={{ my: 2 }} />
        <FormControlLabel
          disabled
          control={
            <Switch
              checked={settings.pushNotifications}
              onChange={handleChange('pushNotifications')}
            />
          }
          label="Push Notifications (Coming Soon)"
        />
        <Divider sx={{ my: 2 }} />
        <FormControlLabel
          control={
            <Switch
              checked={settings.budgetAlerts}
              onChange={handleChange('budgetAlerts')}
            />
          }
          label="Budget Alerts"
        />
      </Paper>

      <Typography variant="h6" gutterBottom>
        Preferences
      </Typography>
      <Paper sx={{ p: 3, mb: 3, opacity: 0.6 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Currency
          </Typography>
          <Select
            value={settings.currency}
            onChange={handleChange('currency')}
            disabled
          >
            <MenuItem value="USD">USD ($)</MenuItem>
            <MenuItem value="EUR">EUR (€)</MenuItem>
            <MenuItem value="GBP">GBP (£)</MenuItem>
            <MenuItem value="INR">INR (₹)</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <Typography variant="subtitle2" gutterBottom>
            Language
          </Typography>
          <Select
            value={settings.language}
            onChange={handleChange('language')}
            disabled
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="de">German</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          These features are coming soon
        </Typography>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained" 
          color="primary"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;