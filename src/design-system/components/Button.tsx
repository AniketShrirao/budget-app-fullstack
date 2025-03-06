import { Button as MuiButton, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Button = styled(MuiButton)<ButtonProps>(({ theme }) => ({
  borderRadius: '30px',
  padding: '8px 24px',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  '&.MuiButton-containedPrimary:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-1px)',
  },
}));