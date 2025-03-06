import { Paper, PaperProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Card = styled(Paper)<PaperProps>(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(3),
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));