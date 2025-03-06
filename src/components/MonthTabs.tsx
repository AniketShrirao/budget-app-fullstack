import { TabsProps } from '../types/common';
import { Box, Tab, Tabs } from '@mui/material';

import React from 'react';

const MonthTabs: React.FC<TabsProps> = ({
  className,
  selectedMonth,
  onMonthChange,
}) => {
  return (
    <Box className={className}>
      <Tabs
        value={parseInt(selectedMonth, 10) - 1} // Convert 1-based to 0-based for MUI Tabs
        onChange={(_, newValue) => onMonthChange(newValue + 1)} // Convert 0-based to 1-based
        scrollButtons="auto"
        variant="scrollable"
        sx={{ flexGrow: 1 }}
      >
        {Array.from({ length: 12 }, (_, index) => (
          <Tab
            key={index + 1}
            label={new Date(0, index).toLocaleString('en-US', {
              month: 'long',
            })}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default MonthTabs;