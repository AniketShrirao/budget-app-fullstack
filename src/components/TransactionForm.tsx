import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import {
  addTransactionToDB,
  fetchTransactions,
} from '../features/transactionSlice';
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import './TransactionForm.scss';
import type { Transaction } from '../types/transaction';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchCategories } from '../features/categorySlice';
import { Button } from '../design-system/components/Button';

const TransactionForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.categories.categories);
  const auth = useAuth();
  
  // Add useEffect to fetch categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  const [form, setForm] = useState({
    date: '',
    category: '',
    description: '',
    amount: '',
    type: 'Needs',
    important: false,
    recurrence: 'None',
  });

  useEffect(() => {
    const today = moment().format('YYYY-MM-DD');
    setForm((prevForm) => ({ ...prevForm, date: today }));
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      if (name === 'category') {
        const selectedCategory = categories.find(cat => cat.title === value);
        return {
          ...prevForm,
          category: value,
          type: selectedCategory?.type || prevForm.type
        };
      }
      return {
        ...prevForm,
        [name]: value
      };
    });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (Number(form.amount) <= 0) {
      toast.error('Amount must be greater than 0', {
        style: { background: '#d32f2f', color: 'white' }
      });
      return;
    }

    const transaction: Transaction = {
      user_id: auth?.user?.id || '',
      id: uuidv4(),
      ...form,
      amount: Number(form.amount),
      status: 'pending',
    };

    try {
      await dispatch(addTransactionToDB(transaction)).unwrap();
      await dispatch(fetchTransactions()).unwrap();
      
      toast.success('Transaction added successfully!', {
        style: { background: '#4caf50', color: 'white' }
      });

      setForm({
        date: moment().format('YYYY-MM-DD'),
        category: 'Other',
        description: '',
        amount: '',
        type: 'Needs',
        important: false,
        recurrence: 'None',
      });
    } catch (error) {
      toast.error('Failed to add transaction. Please try again.', {
        style: { background: '#d32f2f', color: 'white' }
      });
    }
  };
  return (
    <form
      className="transaction-form"
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      <TextField
        label="Date"
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />
      <TextField
        label="Category"
        select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
      >
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.title}>
            {cat.title} ({cat.type})
          </MenuItem>
        ))}
      </TextField>
      <TextField
        name="description"
        label="Description"
        value={form.description}
        onChange={handleChange}
      />
      <TextField
        type="number"
        name="amount"
        label="Amount"
        value={form.amount}
        onChange={handleChange}
        required
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={form.important}
            onChange={() => setForm({ ...form, important: !form.important })}
          />
        }
        label="Important"
      />
      <TextField
        label="Recurrence"
        select
        name="recurrence"
        value={form.recurrence}
        onChange={handleChange}
      >
        {['None', 'Monthly', 'Quarterly', 'Yearly'].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="contained" color="primary">
        Add Transaction
      </Button>
    </form>
  );
};

export default TransactionForm;
