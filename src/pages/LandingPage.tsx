import { Container, Typography } from '@mui/material';
import './LandingPage.scss';

const LandingPage = () => {


  return (
    <Container 
      maxWidth="sm" 
      className="landing-page"
      sx={{
        backgroundColor: 'background.default',
        color: 'text.primary'
      }}
    >
      <div className="intro">
        <Typography 
          variant="h3" 
          className="title" 
          gutterBottom
          sx={{ 
            color: 'text.primary',
            fontWeight: 'bold'
          }}
        >
          Welcome to Budget Tracker
        </Typography>
        <Typography 
          variant="h6" 
          className="description" 
          paragraph
          sx={{ 
            color: 'text.secondary',
            opacity: 0.9
          }}
        >
          Manage your finances efficiently and track your spending. Let us
          help you stay on top of your budget.
        </Typography>
      </div>
    </Container>
  );
};

export default LandingPage;
