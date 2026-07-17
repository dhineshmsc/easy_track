import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, CssBaseline, Typography, Card, CardContent, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Chip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BugReportIcon from '@mui/icons-material/BugReport';
import InfoIcon from '@mui/icons-material/Info';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';

const initialNotifications = [
  {
    id: 1,
    type: 'task',
    title: 'New Task Assigned',
    message: 'You have been assigned to task: "Implement user authentication login page flow".',
    time: '10 mins ago',
    unread: true,
  },
  {
    id: 2,
    type: 'bug',
    title: 'Bug Reported',
    message: 'A critical bug "Login button click causes infinite spinner on Safari" has been reported in project "Easy Track".',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 3,
    type: 'info',
    title: 'Project Status Updated',
    message: 'Project "Easy Track" status changed from "Planning" to "In Progress".',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 4,
    type: 'task',
    title: 'Task Completed',
    message: 'Sarah completed task "Create landing page Figma prototype mockup".',
    time: '2 days ago',
    unread: false,
  }
];

const Notifications = () => {
  const { company } = useParams();
  const username = localStorage.getItem('username') || '';
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task': return <TaskAltIcon sx={{ color: '#10b981' }} />;
      case 'bug': return <BugReportIcon sx={{ color: '#ef4444' }} />;
      default: return <InfoIcon sx={{ color: '#3b82f6' }} />;
    }
  };

  const getAvatarBg = (type) => {
    switch (type) {
      case 'task': return '#ecfdf5';
      case 'bug': return '#fef2f2';
      default: return '#eff6ff';
    }
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Sidebar activeMenu="Notifications" />

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />

          {/* Page content */}
          <Box sx={{ p: '10px', flexGrow: 1, overflowY: 'auto' }}>
            <Box sx={{ maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <NotificationsIcon color="primary" /> Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Stay updated with your latest team activities.</Typography>
                </Box>
                {notifications.some(n => n.unread) && (
                  <Button variant="outlined" startIcon={<DoneAllIcon />} onClick={markAllRead} size="small" sx={{ textTransform: 'none' }}>
                    Mark all as read
                  </Button>
                )}
              </Box>

              <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3 }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <List sx={{ p: 0 }}>
                    {notifications.map((notif, index) => (
                      <React.Fragment key={notif.id}>
                        {index > 0 && <Divider />}
                        <ListItem
                          sx={{
                            px: 3,
                            py: 2.5,
                            bgcolor: notif.unread ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                            transition: 'background-color 0.2s',
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: getAvatarBg(notif.type), border: '1px solid rgba(0,0,0,0.03)' }}>
                              {getIcon(notif.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1d1d1f' }}>
                                  {notif.title}
                                </Typography>
                                {notif.unread && (
                                  <Chip label="New" size="small" color="primary" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 'bold' }} />
                                )}
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {notif.message}
                              </Typography>
                            }
                          />
                          <Box sx={{ flexShrink: 0, ml: 2, textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">{notif.time}</Typography>
                          </Box>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>

            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Notifications;
