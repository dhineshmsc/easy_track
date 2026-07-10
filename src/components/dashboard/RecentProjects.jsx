import React from 'react';
import { Paper, Typography, Box, Grid, LinearProgress, Avatar, AvatarGroup, Chip } from '@mui/material';

const projects = [
  { name: 'TaskFlow AI', progress: 75, members: 4, status: 'Active', color: '#6366f1' },
  { name: 'CRM Migration', progress: 40, members: 3, status: 'At Risk', color: '#f59e0b' },
  { name: 'Mobile App V2', progress: 90, members: 6, status: 'On Track', color: '#10b981' },
];

const RecentProjects = () => {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, px: 1 }}>
        Recent Projects
      </Typography>
      <Grid container spacing={3}>
        {projects.map((project, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              borderTop: `4px solid ${project.color}`,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {project.name}
                </Typography>
                <Chip 
                  label={project.status} 
                  size="small" 
                  sx={{ 
                    bgcolor: `${project.color}22`, 
                    color: project.color,
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }} 
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Progress</Typography>
                  <Typography variant="caption" fontWeight="bold">{project.progress}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={project.progress} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: 'background.default',
                    '& .MuiLinearProgress-bar': { bgcolor: project.color }
                  }} 
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Team</Typography>
                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.8rem', borderColor: 'background.paper' } }}>
                  {Array.from({ length: project.members }).map((_, i) => (
                    <Avatar key={i} alt={`User ${i}`} src={`https://i.pravatar.cc/150?u=${project.name}${i}`} />
                  ))}
                </AvatarGroup>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecentProjects;
