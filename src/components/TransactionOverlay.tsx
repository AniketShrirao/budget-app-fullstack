import { TransactionOverlayProps } from '../types/transaction';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Button } from '../design-system/components/Button';

// Assuming you have a type for transactions

const TransactionOverlay = ({
  txn,
  setSelectedTxn,
}: TransactionOverlayProps) => {
  const handleClose = () => {
    setSelectedTxn(null); // Close overlay
  };

  const theme = useTheme();

  if (!txn) return null;

  return (
    <Dialog
    PaperProps={{
      style: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary
      }
    }}
    open={!!txn} onClose={handleClose}>
      <DialogTitle>Status Information</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          <strong>Date:</strong> {txn.date}
        </Typography>
        <Typography variant="body1">
          <strong>Description:</strong> {txn.description}
        </Typography>
        <Typography variant="body1">
          <strong>Amount:</strong> ₹{txn.amount.toFixed(2)}
        </Typography>
        <Typography variant="body1">
          <strong>Type:</strong> {txn.type}
        </Typography>
        <Typography variant="body1">
          <strong>Category:</strong> {txn.category}
        </Typography>
        <Typography variant="body1">
          <strong>Status:</strong>{' '}
          {txn.important ? 'Important' : 'Not Important'}
        </Typography>
        <Typography variant="body1">
          <strong>Recurrence:</strong> {txn.recurrence || 'None'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionOverlay;