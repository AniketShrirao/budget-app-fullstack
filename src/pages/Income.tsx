import { useTheme } from '@mui/material/styles';
import ComingSoon from '../components/ComingSoon';
import Loading from '../components/Loading';

const Income = () => {
  const loading = false; // Replace with actual loading logic

  const theme = useTheme();

  if (loading) {
    return <Loading message="Loading income data..." />;
  }

  return (
    <div className="income-page" style={{ 
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      minHeight: '100vh',
      padding: '20px'
    }}>
      <ComingSoon />
    </div>
  );
};

export default Income;