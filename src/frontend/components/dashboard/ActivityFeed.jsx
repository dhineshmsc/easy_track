import React from 'react';
import { Paper, Typography, Box, Avatar } from '@mui/material';
import { getAvatarColor } from '../../utils/projectsHelper';

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

const ActivityFeed = ({ projects = [], users = [], allTasks = [], storiesByProject = {} }) => {
  
  const getAvatarInitials = (name) => {
    if (!name || name === 'System') return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarBg = (name) => {
    if (!name || name === 'System') return '#94a3b8';
    return getAvatarColor(name);
  };

  const activities = React.useMemo(() => {
    const getUsernameById = (userId) => {
      if (!userId) return '';
      const u = users.find(x => String(x._id || x.user_id || x.id) === String(userId));
      return u ? u.name : '';
    };

    const list = [];
    
    // Helper to strip HTML tags from Rich Text fields
    const stripHtml = (html) => {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '').trim();
    };

    // 1. Add user additions
    users.forEach(u => {
      if (u.created_at) {
        list.push({
          text: `User "${u.name}" joined`,
          username: u.name,
          userId: u._id || u.user_id || u.id,
          timestamp: new Date(u.created_at),
          timeStr: timeAgo(u.created_at),
          color: '#10b981' // Green
        });
      }
    });

    // 2. Add project creations
    projects.forEach(p => {
      if (p.created_at) {
        const creatorName = getUsernameById(p.reporter || p.created_by) || 'System';
        list.push({
          text: `Project "${p.name}" created`,
          username: creatorName,
          userId: p.reporter || p.created_by,
          timestamp: new Date(p.created_at),
          timeStr: timeAgo(p.created_at),
          color: '#6366f1' // Indigo
        });
      }
    });

    // 3. Add stories created
    Object.values(storiesByProject || {}).flat().forEach(s => {
      if (s.created_at) {
        const creatorName = getUsernameById(s.reporter || s.created_by) || 'System';
        list.push({
          text: `Story "${s.name}" created`,
          username: creatorName,
          userId: s.reporter || s.created_by,
          timestamp: new Date(s.created_at),
          timeStr: timeAgo(s.created_at),
          color: '#8b5cf6' // Purple
        });
      }
    });

    // 4. Add task/bug creations, edits, and comments
    allTasks.forEach(t => {
      // Creation
      if (t.created_at) {
        const creatorName = getUsernameById(t.reporter || t.assigned_user) || 'System';
        list.push({
          text: `${t.type === 'Bug' ? 'Bug' : 'Task'} "${t.name}" created`,
          username: creatorName,
          userId: t.reporter || t.assigned_user,
          timestamp: new Date(t.created_at),
          timeStr: timeAgo(t.created_at),
          color: t.type === 'Bug' ? '#ef4444' : '#3b82f6', // Red / Blue
          taskId: t.custom_id
        });
      }

      // Status/Property update (if updated_at is later than created_at)
      if (t.updated_at && t.created_at && new Date(t.updated_at).getTime() - new Date(t.created_at).getTime() > 2000) {
        const updaterName = getUsernameById(t.assigned_user || t.reporter) || 'System';
        list.push({
          text: `Task "${t.name}" updated: status changed to ${t.status || 'To Do'}, work status is ${t.work_status || 'Not Started'}`,
          username: updaterName,
          userId: t.assigned_user || t.reporter,
          timestamp: new Date(t.updated_at),
          timeStr: timeAgo(t.updated_at),
          color: '#eab308', // Yellow
          taskId: t.custom_id
        });
      }

      // Comments/discussion activity
      if (t.comments && Array.isArray(t.comments)) {
        t.comments.forEach(c => {
          const author = c.create_user || c.created_by || c.sender || 'System';
          const text = stripHtml(c.text || c.content || c.message || '');
          const timestamp = c.createdAt || c.created_at || c.timestamp || c.date;
          if (timestamp) {
            list.push({
              text: `Task "${t.name}" discussion: "${text}"`,
              username: author,
              userId: c.senderId,
              timestamp: new Date(timestamp),
              timeStr: timeAgo(timestamp),
              color: '#ec4899', // Pink
              taskId: t.custom_id
            });
          }
        });
      }
    });

    // Sort descending by timestamp
    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [projects, users, allTasks, storiesByProject]);

  return (
    <Paper sx={{ p: 2, borderRadius: 3, height: '100%' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
        Recent Activities
      </Typography>
      <Box sx={{ 
        maxHeight: 330, 
        overflowY: 'auto',
        pr: 1,
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
            pl: 4.5,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 14,
              top: 10,
              bottom: 10,
              width: '2px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
            }
          }}>
            {activities.map((activity, index) => {
              const normUsername = String(activity.username || '').toLowerCase().trim();
              const creatorUser = users.find(u => {
                const nameMatch = String(u.name || '').toLowerCase().trim() === normUsername;
                const emailMatch = String(u.email || '').toLowerCase().trim().split('@')[0] === normUsername;
                const idMatch = String(u._id || u.user_id || u.id) === normUsername;
                return nameMatch || emailMatch || idMatch;
              });

              return (
                <Box 
                  key={index} 
                  sx={{ 
                    py: 1.5, 
                    borderBottom: index < activities.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    position: 'relative',
                    minHeight: 48
                  }}
                >
                  {/* Creator Avatar instead of Dot */}
                  <Box sx={{ position: 'absolute', left: -36, top: 12 }}>
                    <Avatar 
                      src={creatorUser?.profile_image || undefined}
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        bgcolor: creatorUser?.profile_image ? 'transparent' : getAvatarBg(activity.username),
                        color: '#fff',
                        border: (theme) => `2px solid ${theme.palette.background.paper}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {!creatorUser?.profile_image && getAvatarInitials(activity.username)}
                    </Avatar>
                    
                    {/* Activity Type Tiny Status Badge Dot */}
                    <Box sx={{ 
                      position: 'absolute', 
                      right: -1, 
                      bottom: -1, 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: activity.color,
                      border: (theme) => `2.2px solid ${theme.palette.background.paper}`,
                      boxShadow: '0 0.5px 1px rgba(0,0,0,0.15)'
                    }} />
                  </Box>
                  
                  <Typography variant="body2" fontWeight="500" sx={{ color: 'text.primary', pr: 8, lineHeight: 1.4 }}>
                    {activity.text}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {activity.timeStr}
                  </Typography>
                  
                  {/* Task ID in bottom right corner */}
                  {activity.taskId && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        position: 'absolute', 
                        right: 0, 
                        bottom: 12, 
                        fontWeight: 'bold', 
                        color: 'primary.main',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 102, 204, 0.08)',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: '0.65rem'
                      }}
                    >
                      {String(activity.taskId).toUpperCase()}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ActivityFeed;
