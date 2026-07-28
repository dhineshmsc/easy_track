import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 0) return 'Just now';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ActivityFeed = ({ projects = [], users = [], allTasks = [] }) => {
  const activities = React.useMemo(() => {
    const list = [];

    // Add project creations
    projects.forEach(p => {
      if (p.created_at) {
        list.push({
          text: `Project "${p.name}" created`,
          timestamp: new Date(p.created_at),
          timeStr: timeAgo(p.created_at),
          color: '#6366f1'
        });
      }
    });

    // Add user additions
    users.forEach(u => {
      if (u.created_at) {
        list.push({
          text: `User "${u.name}" joined`,
          timestamp: new Date(u.created_at),
          timeStr: timeAgo(u.created_at),
          color: '#10b981'
        });
      }
    });

    // Add task/bug creations
    allTasks.forEach(t => {
      if (t.created_at) {
        list.push({
          text: `${t.type === 'Bug' ? 'Bug' : 'Task'} "${t.name}" created`,
          timestamp: new Date(t.created_at),
          timeStr: timeAgo(t.created_at),
          color: t.type === 'Bug' ? '#ef4444' : '#3b82f6'
        });
      }
    });

    // Sort descending by timestamp
    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [projects, users, allTasks]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Recent Activities
      </Typography>
      <Box sx={{ 
        mt: 2, 
        maxHeight: 330, 
        overflowY: 'auto',
        /* Sleek Apple-style scrollbar */
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { 
          background: 'rgba(128, 128, 128, 0.4)', 
          borderRadius: '10px'
        },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(128, 128, 128, 0.6)' }
      }}>
        {activities.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            No recent activities
          </Typography>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            pl: 3,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 6,
              top: 8,
              bottom: 8,
              width: '2px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
            }
          }}>
            {activities.map((activity, index) => (
              <Box 
                key={index} 
                sx={{ 
                  py: 1.5, 
                  borderBottom: index < activities.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  position: 'relative'
                }}
              >
                {/* Connector Dot */}
                <Box sx={{ 
                  position: 'absolute', 
                  left: -21, 
                  top: 22, 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: activity.color,
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`
                }} />
                
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.primary', lineHeight: 1.4 }}>
                  {activity.text}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {activity.timeStr}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ActivityFeed;
