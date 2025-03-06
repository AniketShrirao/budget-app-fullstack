import { AddLendingFormProps } from '../types/common';
import { useDispatch } from 'react-redux';
import { supabase } from '../lib/supabase';
import { fetchLendings } from '../features/lendingSlice';
import { Alert, Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

import React, { useState, useEffect } from 'react';

import type { AppDispatch } from '../store';

import './AddLendingForm.scss';

import Loading from '../components/Loading';

const AddLendingForm: React.FC<AddLendingFormProps> = ({ onAddLending }) => {
  const dispatch: AppDispatch = useDispatch();
  const auth = useAuth();
  const user = auth?.user;
  const [formData, setFormData] = useState({
    borrower: '',
    amount: '',
    date: '',
    time: '09:00 AM',
    period: '',
    reminderfrequency: 'monthly'
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const convertTo24Hour = (time12: string): string => {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);

    if (modifier === 'PM' && hour < 12) hour += 12;
    if (modifier === 'AM' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const createTimestamp = (date: string, time: string): string => {
    const [hours, minutes] = convertTo24Hour(time).split(':');
    // Create timestamp in UTC
    return `${date}T${hours}:${minutes}:00.000Z`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('User is not authenticated');
      return;
    }
    setIsSubmitting(true);

    try {
      // Create the timestamp for the date field
      const timestamp = createTimestamp(formData.date, formData.time);

      const { error } = await supabase.from('lendings').insert([{
        borrower: formData.borrower, 
        amount: parseFloat(formData.amount), 
        date: timestamp,
        period: formData.period, // This will be automatically converted to date
        reminderfrequency: formData.reminderfrequency, 
        user_email: user.email 
      }]).select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      setError(null);
      if (user.email) {
        dispatch(fetchLendings(user.email));
      }
      
      // Reset form
      setFormData({
        borrower: '',
        amount: '',
        date: '',
        time: '09:00 AM',
        period: '',
        reminderfrequency: 'monthly'
      });
      
      onAddLending();

      // Send reminder
      if (user) {
        const functionUrl = import.meta.env.MODE === 'development'
          ? `${window.location.origin}/.netlify/functions/sendReminder`
          : '/.netlify/functions/sendReminder';

        await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            email: user.email,
            borrower: formData.borrower,
            amount: parseFloat(formData.amount),
            type: 'acknowledgment',
          }),
        });

        console.log('Reminder request sent');
      }

      toast.success('Lending reminder added successfully!');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to add lending reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      if (Notification.permission === 'granted') {
        return;
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const calculatePeriod = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    let period = '';
    if (years > 0) period += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) period += `${months} month${months > 1 ? 's' : ''} `;
    if (days > 0) period += `${days} day${days > 1 ? 's' : ''}`;

    return period.trim();
  };

  if (isSubmitting) {
    return <Loading message="Adding lending..." />;
  }

  return (
    <Card className="add-lending-form-card">
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom>
          Add Lend Reminders
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Borrower"
            value={formData.borrower}
            onChange={(e) => setFormData({ ...formData, borrower: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              type="date"
              label="Date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Select
              label="Time"
              name="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              fullWidth
            >
              {[...Array(24)].map((_, hour) => {
                const isPM = hour >= 12;
                const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const timeStr = `${hour12.toString().padStart(2, '0')}:00 ${isPM ? 'PM' : 'AM'}`;
                return (
                  <MenuItem key={hour} value={timeStr}>
                    {timeStr}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              label="Period End Date"
              type="date"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            {formData.date && formData.period && (
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: '150px' }}>
                Duration: {calculatePeriod(formData.date, formData.period)}
              </Typography>
            )}
          </Box>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Reminder Frequency</InputLabel>
            <Select
              value={formData.reminderfrequency}
              onChange={(e) => setFormData({ ...formData, reminderfrequency: e.target.value as string })}
              label="Reminder Frequency"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Lending
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddLendingForm;