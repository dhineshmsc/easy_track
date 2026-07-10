import React from 'react';
import { Box, Typography } from '@mui/material';

const WelcomeSection = ({ company, username }) => {
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome back, {username || 'User'}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Here's what's happening at {capitalize(company)} today &bull; {dateStr}
      </Typography>
    </Box>
  );
};

export default WelcomeSection;
