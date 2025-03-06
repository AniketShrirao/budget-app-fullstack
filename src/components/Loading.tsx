import { LoadingProps } from '../types/common';
import { Box, CircularProgress, Typography } from '@mui/material';

import React from 'react';

import './Loading.scss';

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <Box className="loading-container">
      <CircularProgress size={40} />
      <Typography variant="h6" className="loading-text">
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;