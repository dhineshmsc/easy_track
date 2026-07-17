import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate, useParams } from 'react-router-dom';

const Sidebar = ({ company, activeMenu = 'Dashboard' }) => {
  const navigate = useNavigate();
  const params = useParams();
  const currentCompany = company || params.company;
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('sidebarMinimized') === 'true';
  });

  const toggleMinimized = () => {
    const next = !isMinimized;
    setIsMinimized(next);
    localStorage.setItem('sidebarMinimized', String(next));
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: `/${currentCompany}/dashboard` },
    { text: 'Projects', icon: <AccountTreeIcon />, path: `/${currentCompany}/projects` },
    { text: 'Tasks', icon: <AssignmentIcon />, path: `/${currentCompany}/tasks` },
    { text: 'Users', icon: <PeopleIcon />, path: `/${currentCompany}/users` },
    { text: 'Reports', icon: <AssessmentIcon />, path: `/${currentCompany}/reports` },
    { text: 'Notifications', icon: <NotificationsIcon />, path: `/${currentCompany}/notifications` },
    { text: 'Settings', icon: <SettingsIcon />, path: `/${currentCompany}/settings` },
  ];

  return (
    <Box sx={{
      width: isMinimized ? 80 : 260,
      flexShrink: 0,
      bgcolor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease'
    }}>
      <Box sx={{ 
        p: isMinimized ? 2 : 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isMinimized ? 'center' : 'space-between', 
        gap: isMinimized ? 0 : 2 
      }}>
        {!isMinimized && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{ width: 32, height: 32, borderRadius: 1, flexShrink: 0, objectFit: 'contain' }}
            />
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.1, fontSize: '1rem', color: 'text.primary' }}>
                Easy Task
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', fontWeight: 500, display: 'block', mt: 0.2, whiteSpace: 'nowrap' }}>
                Your Productivity Partner
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton onClick={toggleMinimized} size="small">
          {isMinimized ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      
      {isMinimized && (
         <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
           <Box
             component="img"
             src="/logo.png"
             alt="Logo"
             sx={{ width: 32, height: 32, borderRadius: 1, objectFit: 'contain' }}
           />
         </Box>
      )}

      <Divider />
      
      <List sx={{ px: isMinimized ? 1 : 2, pt: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = item.text === activeMenu;
          return (
            <Tooltip title={isMinimized ? item.text : ''} placement="right" key={item.text}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    justifyContent: isMinimized ? 'center' : 'flex-start',
                    px: isMinimized ? 1 : 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'inherit' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: isMinimized ? 0 : 40, 
                    mr: isMinimized ? 0 : 2,
                    justifyContent: 'center',
                    color: isActive ? 'inherit' : 'text.secondary' 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!isMinimized && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
