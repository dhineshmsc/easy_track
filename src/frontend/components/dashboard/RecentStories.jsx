import React from 'react';
import { Paper, Typography, Box, Avatar, AvatarGroup, Chip } from '@mui/material';
import { getAvatarColor, statusColor, priorityColor } from '../../utils/projectsHelper';

const RecentStories = ({ storiesByProject = {}, projects = [], users = [] }) => {
  // Flatten all stories across projects and sort by created_at desc
  const recentStories = React.useMemo(() => {
    const list = Object.values(storiesByProject || {}).flat();
    return list
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [storiesByProject]);

  const getProjectName = (projectId) => {
    const p = projects.find(proj => proj._id === projectId);
    return p ? p.name : 'Unknown Project';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3, 
      border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', 
      bgcolor: 'background.paper',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Recent Stories
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        overflowX: 'auto', 
        pb: 1.5,
        /* High-visibility grey scrollbar visible on both light/dark themes */
        '&::-webkit-scrollbar': { height: '8px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { 
          background: 'rgba(128, 128, 128, 0.4)', 
          borderRadius: '10px'
        },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(128, 128, 128, 0.6)' }
      }}>
        {recentStories.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, width: '100%' }}>
            <Typography color="text.secondary">No stories created yet</Typography>
          </Paper>
        ) : (
          recentStories.map((story) => {
            const rawAssigned = story.assigned_user;
            const assignedIds = Array.isArray(rawAssigned) 
              ? rawAssigned 
              : (typeof rawAssigned === 'string' && rawAssigned ? [rawAssigned] : []);

            const storyMembers = assignedIds.map(uId => 
              users.find(u => (u._id || u.user_id || u.id) === uId || String(u.user_id) === String(uId))
            ).filter(Boolean);

            const sColor = statusColor(story.status);
            const pColor = priorityColor(story.priority);

            const isStoryOverdue = !String(story.status || '').trim().toLowerCase().includes('done') && 
                                   story.end_date && 
                                   new Date(story.end_date) < new Date();

            return (
              <Box key={story._id || story.id} sx={{ minWidth: 280, flexShrink: 0, flexGrow: 1 }}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  borderTop: `4px solid ${pColor.color || '#6366f1'}`,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  height: 290, // Standardized card height matching projects card
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '150px' }}>
                        {story.name}
                      </Typography>
                      <Chip 
                        label={story.status || 'Not Started'} 
                        size="small" 
                        sx={{ 
                          bgcolor: sColor.bg || '#f1f5f9', 
                          color: sColor.color || '#475569',
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }} 
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: '500' }}>
                      Project: {getProjectName(story.project_id)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Overdue:</Typography>
                      {isStoryOverdue ? (
                        <Chip label="Yes" color="error" size="small" sx={{ fontWeight: 'bold', height: 18, fontSize: '0.65rem' }} />
                      ) : (
                        <Chip label="No" size="small" variant="outlined" sx={{ color: 'text.secondary', height: 18, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Priority</Typography>
                      <Chip 
                        label={story.priority || 'Medium'} 
                        size="small" 
                        sx={{ 
                          bgcolor: pColor.bg || '#fffbeb', 
                          color: pColor.color || '#d97706',
                          borderColor: pColor.border || '#fcd34d',
                          border: '1px solid',
                          fontWeight: 'bold',
                          fontSize: '0.65rem',
                          height: '20px'
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Start Date</Typography>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        {formatDate(story.created_at)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">Due Date</Typography>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        {formatDate(story.end_date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Assigned</Typography>
                      {storyMembers.length === 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>No members</Typography>
                      ) : (
                        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.7rem', borderColor: 'background.paper' } }}>
                          {storyMembers.map((member, i) => {
                            const avatarColor = getAvatarColor(member.name || '');
                            const initials = member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
                            return (
                              <Avatar 
                                key={member._id || member.id || i} 
                                alt={member.name} 
                                src={member.profile_image || undefined}
                                sx={{ bgcolor: member.profile_image ? 'transparent' : avatarColor, color: '#fff', fontWeight: 'bold' }}
                              >
                                {!member.profile_image && initials}
                              </Avatar>
                            );
                          })}
                        </AvatarGroup>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            );
          })
        )}
      </Box>
    </Paper>
  );
};

export default RecentStories;
