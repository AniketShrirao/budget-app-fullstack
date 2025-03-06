import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../features/transactionSlice';
import TransactionTable from './TransactionTable';
import MonthTabs from './MonthTabs';
import { RootState, AppDispatch } from '../store';
import './MonthsTabs.scss';
import NoDataAvailable from './NoDataAvailable';

const MonthsTabs = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [page, setPage] = useState(0);
  const dispatch = useDispatch<AppDispatch>();

  // Add handler for month change
  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(Number(newMonth));
    setPage(0); // Reset page to 0 when month changes
  };

  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions,
  );

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [selectedMonth, dispatch]);

  const filteredTransactions = transactions.filter(
    (txn) => new Date(txn.date).getMonth() + 1 === selectedMonth,
  );

  return (
    <Box className="months-tabs">
      <MonthTabs
        selectedMonth={selectedMonth.toString()}
        onMonthChange={(newMonth: string) => handleMonthChange(Number(newMonth))}
      />
      {filteredTransactions.length > 0 ? (
        <TransactionTable
          filteredTransactions={filteredTransactions}
          page={page}
          setPage={setPage}
        />
      ) : (
        <Box sx={{ p: 3, mt: 2 }}>
          <NoDataAvailable message="No transactions for this month" />
        </Box>
      )}
    </Box>
  );
};

export default MonthsTabs;
