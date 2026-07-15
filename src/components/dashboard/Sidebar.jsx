import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate, useParams } from 'react-router-dom';

const Sidebar = ({ company, activeMenu = 'Dashboard' }) => {
  const navigate = useNavigate();
  const params = useParams();
  const currentCompany = company || params.company;

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
      width: 260,
      flexShrink: 0,
      bgcolor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1 }} />
        <Typography variant="h6" fontWeight="bold">SaaS Flow</Typography>
      </Box>
      <Divider />
      <List sx={{ px: 2, pt: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = item.text === activeMenu;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'inherit' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
