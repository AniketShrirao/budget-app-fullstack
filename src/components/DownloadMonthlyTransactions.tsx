import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Button } from '../design-system/components/Button';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import NoDataAvailable from './NoDataAvailable';
import { Box } from '@mui/material';

const DownloadTransactions: React.FC<{ selectedMonth: string }> = ({ selectedMonth }) => {
  const transactions = useSelector((state: RootState) => state.transactions.transactions);

  const currentMonthTransactions = transactions.filter(
    (tx) => new Date(tx.date).getMonth() + 1 === Number(selectedMonth),
  );

  const csvData = currentMonthTransactions.map((tx) => ({
    Date: tx.date,
    Category: tx.category,
    Description: tx.description,
    Amount: tx.amount,
    Type: tx.type,
  }));

  const handleDownload = () => {
    if (csvData.length === 0) {
      toast.info('No transactions found for selected month', {
        style: { background: '#2196f3', color: 'white' },
        icon: () => <span role="img" aria-label="info">ℹ️</span>
      });
      return;
    }

    toast.success('Downloading transactions...', {
      style: { background: '#4caf50', color: 'white' }
    });
  };

  if (csvData.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <NoDataAvailable message="No transactions available to download" />
      </Box>
    );
  }

  return (
    <Button variant="contained" color="primary" onClick={handleDownload}>
      <CSVLink 
        data={csvData} 
        filename={`transactions-${selectedMonth}.csv`} 
        style={{ color: '#fff', textDecoration: 'none' }}
      >
        Download Transactions
      </CSVLink>
    </Button>
  );
};

export default DownloadTransactions;