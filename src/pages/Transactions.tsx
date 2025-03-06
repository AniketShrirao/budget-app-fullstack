import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchTransactions } from '../features/transactionSlice';
import TransactionForm from '../components/TransactionForm';
import { Container, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import './Transactions.scss';
import MonthsTabs from '../components/MonthsTabs';

const Transactions = () => {
  const authContext = useAuth();
  const user = authContext?.user;
  const loading = authContext?.loading;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate('/');
    else dispatch(fetchTransactions());
  }, [user, dispatch, loading, navigate]);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} classes={{ root: 'transaction-container' }}>
      <TransactionForm />
      <MonthsTabs />
    </Container>
  );
};

export default Transactions;
