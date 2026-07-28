import React from 'react';
import { Paper, Typography, Box, LinearProgress, Avatar, AvatarGroup, Chip } from '@mui/material';
import { getAvatarColor } from '../../utils/projectsHelper';

const getProjectStatusColor = (status) => {
  const norm = String(status || '').trim().toLowerCase();
  if (norm === 'active' || norm === 'on track' || norm === 'developing' || norm === 'in progress') return '#10b981';
  if (norm === 'at risk' || norm === 'on hold') return '#f59e0b';
  if (norm === 'not started' || norm === 'planning') return '#6366f1';
  return '#3b82f6';
};

const RecentProjects = ({ projects = [], users = [] }) => {
  // Sort by created_at desc to show the most recent ones first
  const recentList = React.useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [projects]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
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
        Recent Projects
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
        {recentList.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, width: '100%' }}>
            <Typography color="text.secondary">No projects created yet</Typography>
          </Paper>
        ) : (
          recentList.map((project) => {
            const progress = project.task_count > 0 
              ? Math.round((project.completed_tasks / project.task_count) * 100) 
              : 0;

            const rawAssigned = project.assigned_user;
            const assignedIds = Array.isArray(rawAssigned) 
              ? rawAssigned 
              : (typeof rawAssigned === 'string' && rawAssigned ? [rawAssigned] : []);

            const projectMembers = assignedIds.map(uId => 
              users.find(u => (u._id || u.user_id || u.id) === uId || String(u.user_id) === String(uId))
            ).filter(Boolean);

            const pColor = getProjectStatusColor(project.status);

            const isProjectOverdue = !String(project.status || '').trim().toLowerCase().includes('done') && 
                                     project.end_date && 
                                     new Date(project.end_date) < new Date();

            return (
              <Box key={project._id || project.id} sx={{ minWidth: 280, flexShrink: 0, flexGrow: 1 }}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  borderTop: `4px solid ${pColor}`,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  height: 290, // Increased height to fit Overdue and Due Date fields
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '170px' }}>
                        {project.name}
                      </Typography>
                      <Chip 
                        label={project.status || 'Not Started'} 
                        size="small" 
                        sx={{ 
                          bgcolor: `${pColor}22`, 
                          color: pColor,
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }} 
                      />
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Progress</Typography>
                        <Typography variant="caption" fontWeight="bold">{progress}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'background.default',
                          '& .MuiLinearProgress-bar': { bgcolor: pColor }
                        }} 
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">Overdue</Typography>
                      {isProjectOverdue ? (
                        <Chip label="Yes" color="error" size="small" sx={{ fontWeight: 'bold', height: 20 }} />
                      ) : (
                        <Chip label="No" size="small" variant="outlined" sx={{ color: 'text.secondary', height: 20 }} />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Start Date</Typography>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        {formatDate(project.created_at)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">Due Date</Typography>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        {formatDate(project.end_date)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Team</Typography>
                      {projectMembers.length === 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>No members</Typography>
                      ) : (
                        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.7rem', borderColor: 'background.paper' } }}>
                          {projectMembers.map((member, i) => {
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

export default RecentProjects;
