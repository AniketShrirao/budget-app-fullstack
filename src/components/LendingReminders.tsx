import { Lending } from '../types/common';
import { AppDispatch, RootState } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import { deleteLending, fetchLendings, updateLending } from '../features/lendingSlice';
import { Alert, Box, Card, CardContent, Grid, IconButton, MenuItem, Select, SelectChangeEvent, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

import React, { useEffect, useCallback, forwardRef, useImperativeHandle, useState } from 'react';

import './LendingReminder.scss';

import Loading from './Loading';

const LendingReminders = forwardRef((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const { lendings, loading, error } = useSelector((state: RootState) => state.lendings);
  const auth = useAuth();
  const userEmail = auth?.user?.email;

  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ 
    borrower: '', 
    amount: '', 
    date: '', 
    time: '09:00 AM',
    period: '', 
    reminderfrequency: '' 
  });

  useEffect(() => {
    if (userEmail) {
      dispatch(fetchLendings(userEmail));
    }
  }, [dispatch, userEmail]);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Convert 24-hour format to 12-hour format without timezone interference
  const convertTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Convert 12-hour format to 24-hour format without timezone interference
  const convertTo24Hour = (time12: string): string => {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);

    if (hour === 12) {
      hour = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
      hour = hour + 12;
    }

    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleEditClick = (lending: Lending) => {
    try {
      const [datePart, timePart = '00:00:00'] = lending.date.split('T');
      const timeStr = convertTo12Hour(timePart.substring(0, 5)); // Take only HH:mm

      setEditRowId(lending.id);
      setEditData({
        borrower: lending.borrower,
        amount: lending.amount.toString(),
        date: datePart,
        time: timeStr,
        period: lending.period,
        reminderfrequency: lending.reminderfrequency,
      });
    } catch (error) {
      console.warn('Error setting edit data:', error);
      setEditRowId(null);
    }
  };

  const handleDeleteClick = (lending: Lending) => {
    if (userEmail) {
      dispatch(deleteLending({ id: lending.id, userEmail }))
        .unwrap()
        .then(async () => {
          // Delete the scheduled reminder
          const functionUrl = import.meta.env.MODE === 'development'
            ? `${window.location.origin}/.netlify/functions/deleteReminder`
            : '/.netlify/functions/deleteReminder';

          await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lendingId: lending.id,
              email: userEmail
            }),
          });

          toast.success('Lending reminder deleted successfully!', {
            style: { background: '#4caf50', color: 'white' }
          });
        })
        .catch((_) => {
          toast.error('Failed to delete lending reminder.', {
            style: { background: '#d32f2f', color: 'white' }
          });
        });
    }
  };

  const handleSaveClick = (id: string) => {
    if (!userEmail) return;

    const timeIn24 = convertTo24Hour(editData.time);
    const dateTimeStr = `${editData.date}T${timeIn24}:00`;
    
    const updatedLending = { 
      id,
      borrower: editData.borrower,
      amount: parseFloat(editData.amount),
      date: dateTimeStr,
      period: editData.period,
      reminderfrequency: editData.reminderfrequency
    };

    // Find the original lending to compare changes
    const originalLending = lendings.find(l => l.id === id);
    const hasReminderChanges = originalLending && (
      originalLending.date !== dateTimeStr ||
      originalLending.period !== editData.period ||
      originalLending.reminderfrequency !== editData.reminderfrequency
    );

    dispatch(updateLending({ lending: { ...updatedLending, user_email: userEmail }, userEmail }))
      .unwrap()
      .then(async () => {
        if (hasReminderChanges) {
          // Update the reminder schedule
          const functionUrl = import.meta.env.MODE === 'development'
            ? `${window.location.origin}/.netlify/functions/updateReminder`
            : '/.netlify/functions/updateReminder';

          await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lendingId: id,
              email: userEmail,
              date: dateTimeStr,
              period: editData.period,
              reminderfrequency: editData.reminderfrequency
            }),
          });
        }
        toast.success('Lending reminder updated successfully!');
        setEditRowId(null);
      })
      .catch((error) => {
        console.error('Update failed:', error);
        toast.error('Failed to update lending reminder.');
      });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const checkReminders = useCallback(() => {
    const now = new Date();
    lendings.forEach((lending) => {
      const reminderDate = new Date(lending.date);
      const reminderFrequency = lending.reminderfrequency;

      if (reminderFrequency === 'daily') {
        reminderDate.setDate(reminderDate.getDate() + 1);
      } else if (reminderFrequency === 'weekly') {
        reminderDate.setDate(reminderDate.getDate() + 7);
      } else if (reminderFrequency === 'monthly') {
        reminderDate.setMonth(reminderDate.getMonth() + 1);
      } else if (reminderFrequency === 'yearly') {
        reminderDate.setFullYear(reminderDate.getFullYear() + 1);
      }

      // Only send reminder if it's actually due
      if (now >= reminderDate && userEmail) {
        console.log('Reminder due for:', lending.borrower);
      }
    });
  }, [lendings, userEmail]);

  useImperativeHandle(ref, () => ({
    checkReminders,
  }));

  useEffect(() => {
    const interval = setInterval(checkReminders, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [checkReminders]);

  // Add calculatePeriod helper function
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
    if (years > 0) period += `${years}y `;
    if (months > 0) period += `${months}m `;
    if (days > 0) period += `${days}d`;

    return period.trim();
  };

  // Format datetime without timezone interference
  const formatDateTime = (dateTimeStr: string): string => {
    try {
      if (!dateTimeStr) return '';
      
      const [datePart, timePart = '00:00:00'] = dateTimeStr.split('T');
      if (!datePart) return '';

      const date = new Date(datePart);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = convertTo12Hour(timePart.substring(0, 5)); // Take only HH:mm
      return `${formattedDate} ${formattedTime}`;
    } catch (error) {
      console.warn('Error formatting date:', dateTimeStr, error);
      return dateTimeStr || ''; // Return original string or empty string if undefined
    }
  };

  if (loading) return <Loading message="Loading lending data..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container>
      <Grid item xs={12}>
        <Card elevation={0} className="lending-reminders-card">
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Lending Reminders
            </Typography>
            {lendings.length === 0 ? (
              // Update the empty state Box component
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: 'text.secondary',
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Typography variant="body1">
                  No lendings found. Add your first lending to get started!
                </Typography>
              </Box>
            ) : (
              <Table className="lending-table">
                <TableHead>
                  <TableRow>
                    <TableCell title="Borrower">Borrower</TableCell>
                    <TableCell title="Amount">Amount</TableCell>
                    <TableCell title="Date">Date</TableCell>
                    <TableCell title="Period">Period</TableCell>
                    <TableCell title="Reminder Frequency">Reminder Frequency</TableCell>
                    <TableCell title="Actions">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lendings.map((lending) => (
                    <TableRow key={lending.id}>
                      <TableCell data-label="Borrower">
                        {editRowId === lending.id ? (
                          <TextField
                            name="borrower"
                            value={editData.borrower}
                            onChange={handleTextFieldChange}
                            size="small"
                          />
                        ) : (
                          <span>{lending.borrower}</span>
                        )}
                      </TableCell>
                      <TableCell data-label="Amount">
                        {editRowId === lending.id ? (
                          <TextField
                            name="amount"
                            value={editData.amount}
                            onChange={handleTextFieldChange}
                            fullWidth
                            size="small"
                          />
                        ) : (
                          `₹${lending.amount}`
                        )}
                      </TableCell>
                      <TableCell data-label="Date">
                        {editRowId === lending.id ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              name="date"
                              type="date"
                              value={editData.date}
                              onChange={handleTextFieldChange}
                              size="small"
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                            <Select
                              name="time"
                              value={editData.time}
                              onChange={handleSelectChange}
                              size="small"
                              sx={{ minWidth: 120 }}
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
                        ) : (
                          formatDateTime(lending.date)
                        )}
                      </TableCell>
                      <TableCell data-label="Period">
                        {editRowId === lending.id ? (
                          <TextField
                            name="period"
                            type="date"
                            value={editData.period}
                            onChange={handleTextFieldChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        ) : (
                          calculatePeriod(lending.date, lending.period)
                        )}
                      </TableCell>
                      <TableCell data-label="Reminder Frequency">
                        {editRowId === lending.id ? (
                          <Select
                            name="reminderfrequency"
                            value={editData.reminderfrequency}
                            onChange={handleSelectChange}
                            fullWidth
                            size="small"
                          >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                          </Select>
                        ) : (
                          lending.reminderfrequency
                        )}
                      </TableCell>
                      <TableCell>
                        {editRowId === lending.id ? (
                          <>
                            <IconButton onClick={() => handleSaveClick(lending.id)} size="small">
                              <Save />
                            </IconButton>
                            <IconButton onClick={handleCancelClick} size="small">
                              <Cancel />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton onClick={() => handleEditClick(lending)} size="small">
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteClick(lending)} size="small">
                              <Delete />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

export default LendingReminders;