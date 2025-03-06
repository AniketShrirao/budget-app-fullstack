import React from 'react';
import { Box, Typography } from '@mui/material';
import NoDataImage from '../assets/no-data.svg'; // You'll need to add this SVG

const NoDataAvailable: React.FC<{ message?: string }> = ({ 
  message = "No data available yet" 
}) => {
  return (
    <Box
      className="no-data-available"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        gap: 2
      }}
    >
      <img 
        src={NoDataImage} 
        alt="No data" 
        style={{ 
          width: '200px',
          height: 'auto',
          opacity: 0.7
        }} 
      />
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          fontWeight: 500,
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          textAlign: 'center',
          maxWidth: '300px'
        }}
      >
        Add some transactions to see your data visualization here
      </Typography>
    </Box>
  );
};

export default NoDataAvailable;