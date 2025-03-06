import { Column, HandleDelete, HandleRowClick } from '../types/common';
import { Transaction, TransactionTableProps } from '../types/transaction';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, removeTransactionFromDB } from '../features/transactionSlice';
import { AppDispatch, RootState } from '../store';
import { toast } from 'react-toastify';

import React, { useEffect } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';

import TransactionOverlay from './TransactionOverlay'; // Import TransactionOverlay
 // Add this import

import './TransactionTable.scss';

import NoDataAvailable from './NoDataAvailable';

const TransactionTable: React.FC<TransactionTableProps> = ({ filteredTransactions, page, setPage }) => {
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedTxn, setSelectedTxn] = React.useState<Transaction | null>(null);
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const transactions = filteredTransactions || useSelector(
    (state: RootState) => state.transactions.transactions,
  );
  const loading = useSelector((state: RootState) => state.transactions.loading);

  const columns: Column[] = [
    { label: 'Date', field: 'date', visible: true },
    { label: 'Description', field: 'description', visible: true },
    {
      label: 'Expense',
      field: 'amount',
      visible: true,
      format: (value: number) => `₹${value.toFixed(2)}`,
    },
    { label: 'Type', field: 'type', visible: true },
    { label: 'Category', field: 'category', visible: !isMobileOrTablet },
    { label: 'Status', field: 'status', visible: !isMobileOrTablet },
    {
      label: 'Actions',
      field: 'actions',
      visible: true,
      render: (txn: Transaction) => (
        <IconButton 
          onClick={(e) => {
            e.stopPropagation(); // Stop event propagation
            handleDelete(txn.id);
          }} 
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete: HandleDelete = async (txnId) => {
    try {
      await dispatch(removeTransactionFromDB(txnId)).unwrap();
      toast.success('Transaction deleted successfully!', {
        style: { background: '#4caf50', color: 'white' }
      });
    } catch (error) {
      toast.error('Failed to delete transaction', {
        style: { background: '#d32f2f', color: 'white' }
      });
    }
  };
  // In the getRowColor function
  const getRowColor = ({ important, recurrence }: { important: boolean; recurrence: string }) => {
    const isDarkMode = theme.palette.mode === 'dark';
    
    if (important) return isDarkMode ? '#661717' : '#FFB6B6';
    if (recurrence === 'Quarterly') return isDarkMode ? '#1a365d' : '#B0C4DE';
    if (recurrence === 'Monthly') return isDarkMode ? '#1a4731' : '#98FB98';
    if (recurrence === 'Yearly') return isDarkMode ? '#7c4a03' : '#FFD700';
    return 'transparent';
  };

  const handleRowClick: HandleRowClick = (txn) => {
    setSelectedTxn(txn);
  };

  const paginatedTransactions = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <NoDataAvailable message="Loading transactions..." />
      </Paper>
    );
  }

  if (transactions.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <NoDataAvailable message="No transactions available yet" />
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper} className="transaction-table">
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col, index) =>
                col.visible ? (
                  <TableCell key={index}>{col.label}</TableCell>
                ) : null,
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.map((txn) => (
              <TableRow
                key={txn.id}
                onClick={() => handleRowClick(txn)} // Handle row click for overlay
                style={{ backgroundColor: getRowColor(txn), cursor: 'pointer' }}
              >
                {columns.map((col, index) =>
                  col.visible ? (
                    <TableCell key={index} data-label={col.label}>
                      {col.field === 'status'
                        ? txn.important
                          ? 'Important'
                          : txn.recurrence
                        : col.render
                          ? col.render(txn)
                          : txn[col.field as keyof Transaction]}
                    </TableCell>
                  ) : null,
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={isMobileOrTablet ? [] : [10, 25, 50]}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* TransactionOverlay Component to show detailed info */}
      <TransactionOverlay txn={selectedTxn} setSelectedTxn={setSelectedTxn} />
    </>
  );
};

export default TransactionTable;