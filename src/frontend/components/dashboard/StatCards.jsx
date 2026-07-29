import React from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import BookIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const StatCards = ({ projects = [], _users = [], allTasks = [], stories = [] }) => {
  const totalProjects = projects.length;
  const totalStories = stories.length;
  const totalTasks = allTasks.length;
  
  const completedTasks = allTasks.filter(t => (t.status || '').trim().toLowerCase() === 'done').length;
  const pendingTasks = allTasks.filter(t => {
    const s = (t.status || '').trim().toLowerCase();
    return s === 'to do' || s === 'todo';
  }).length;
  
  const overdueTasks = allTasks.filter(t => {
    const isDone = (t.status || '').trim().toLowerCase() === 'done';
    return !isDone && t.end_date && new Date(t.end_date) < new Date();
  }).length;

  const openTasks = allTasks.filter(t => (t.status || '').trim().toLowerCase() !== 'done').length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    { title: 'Total Projects', value: String(totalProjects), icon: <FolderIcon />, color: '#6366f1', trend: `${totalProjects} active`, positive: true },
    { title: 'Total Story', value: String(totalStories), icon: <BookIcon />, color: '#8b5cf6', trend: `${totalStories} total stories`, positive: true },
    { title: 'Total Tasks', value: String(totalTasks), icon: <AssignmentIcon />, color: '#3b82f6', trend: `${openTasks} open tasks`, positive: true },
    { title: 'Done Tasks', value: String(completedTasks), icon: <CheckCircleIcon />, color: '#22c55e', trend: `${completionRate}% completion rate`, positive: true },
    { title: 'Pending Tasks', value: String(pendingTasks), icon: <HourglassEmptyIcon />, color: '#f59e0b', trend: `${pendingTasks} not started`, positive: true },
    { title: 'Overdue Tasks', value: String(overdueTasks), icon: <WarningAmberIcon />, color: '#ef4444', trend: `${overdueTasks} overdue`, positive: overdueTasks === 0 },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
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
