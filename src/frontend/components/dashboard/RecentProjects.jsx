import React from 'react';
import { Paper, Typography, Box, Grid, LinearProgress, Avatar, AvatarGroup, Chip } from '@mui/material';
import { getAvatarColor } from '../../utils/projectsHelper';

const getProjectStatusColor = (status) => {
  const norm = String(status || '').trim().toLowerCase();
  if (norm === 'active' || norm === 'on track' || norm === 'developing' || norm === 'in progress') return '#10b981';
  if (norm === 'at risk' || norm === 'on hold') return '#f59e0b';
  if (norm === 'not started' || norm === 'planning') return '#6366f1';
  return '#3b82f6';
};

const RecentProjects = ({ projects = [], users = [] }) => {
  // Sort by created_at desc to show the most recent ones first, limit to 3
  const recentList = React.useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 3);
  }, [projects]);

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, px: 1 }}>
        Recent Projects
      </Typography>
      <Grid container spacing={3}>
        {recentList.length === 0 ? (
          <Grid xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="text.secondary">No projects created yet</Typography>
            </Paper>
          </Grid>
        ) : (
          recentList.map((project) => {
            const progress = project.task_count > 0 
              ? Math.round((project.completed_tasks / project.task_count) * 100) 
              : 0;

            // Map project.assigned_user (array of IDs) to actual users objects
            const projectMembers = (project.assigned_user || []).map(uId => 
              users.find(u => (u._id || u.user_id || u.id) === uId || String(u.user_id) === String(uId))
            ).filter(Boolean);

            const pColor = getProjectStatusColor(project.status);

            return (
              <Grid xs={12} md={4} key={project._id || project.id}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  borderTop: `4px solid ${pColor}`,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                }}>
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
                  
                  <Box sx={{ mb: 3 }}>
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

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Team</Typography>
                    {projectMembers.length === 0 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>No members</Typography>
                    ) : (
                      <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem', borderColor: 'background.paper' } }}>
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
                </Paper>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
};

export default RecentProjects;
