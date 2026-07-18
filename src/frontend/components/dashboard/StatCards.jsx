import React from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const stats = [
  { title: 'Total Projects', value: '12', icon: <FolderIcon />, color: '#6366f1', trend: '+2 this week', positive: true },
  { title: 'Total Users', value: '48', icon: <GroupIcon />, color: '#10b981', trend: '+5 this month', positive: true },
  { title: 'Total Tasks', value: '254', icon: <AssignmentIcon />, color: '#3b82f6', trend: '+34 this week', positive: true },
  { title: 'Completed Tasks', value: '186', icon: <CheckCircleIcon />, color: '#22c55e', trend: '+12% completion', positive: true },
  { title: 'Pending Tasks', value: '56', icon: <HourglassEmptyIcon />, color: '#f59e0b', trend: '-5% backlog', positive: true },
  { title: 'Overdue Tasks', value: '12', icon: <WarningAmberIcon />, color: '#ef4444', trend: '+2 since yesterday', positive: false },
];

const StatCards = () => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid xs={12} sm={6} md={4} key={index}>
          <Paper sx={{
            p: 3,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="600" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
              </Box>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${stat.color}22`,
                color: stat.color
              }}>
                {stat.icon}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {stat.positive ? 
                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} /> : 
                <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
              }
              <Typography variant="caption" color={stat.positive ? 'success.main' : 'error.main'} fontWeight="600">
                {stat.trend}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatCards;
