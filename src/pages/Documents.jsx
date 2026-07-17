import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, CssBaseline, ThemeProvider, Typography, Card, CardContent, Grid, List, ListItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import BookIcon from '@mui/icons-material/Book';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import appleTheme from '../theme';

const menuDetails = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon color="primary" />,
    desc: 'The central hub of Easy Track. Provides a high-level overview of project statistics, your assigned tasks, and a real-time activity stream.'
  },
  {
    text: 'Projects',
    icon: <AccountTreeIcon sx={{ color: '#10b981' }} />,
    desc: 'The planning tree where project managers define Projects, break them down into User Stories, and assign individual Tasks/Bugs.'
  },
  {
    text: 'Tasks',
    icon: <AssignmentIcon sx={{ color: '#f59e0b' }} />,
    desc: 'The workflow execution engine. Features a dynamic drag-and-drop Kanban Board with status columns (Todo, In Progress, Code Review, Testing, Deploy, Done) for swift progress tracking.'
  },
  {
    text: 'Users',
    icon: <PeopleIcon sx={{ color: '#6366f1' }} />,
    desc: 'Workspace access management. Permits Owners and Admins to invite team members, adjust system roles, and toggle active/inactive credentials.'
  },
  {
    text: 'Reports',
    icon: <AssessmentIcon sx={{ color: '#ec4899' }} />,
    desc: 'Performance metrics and auditing. Offers filtered report grids for Projects, Stories, Tasks, and Users, with compact alignments and pagination controls.'
  },
  {
    text: 'Notifications',
    icon: <NotificationsIcon sx={{ color: '#8b5cf6' }} />,
    desc: 'Activity stream warnings. Instantly updates when stories change status, bugs are logged, or a new task gets assigned to you.'
  },
  {
    text: 'Settings',
    icon: <SettingsIcon sx={{ color: '#64748b' }} />,
    desc: 'Workspace customized controls. Manage user name profiles, modify automatic panel refreshes, and switch between dynamic Dark and Light themes.'
  }
];

const Documents = () => {
  const { company } = useParams();
  const username = localStorage.getItem('username') || '';

  return (
    <ThemeProvider theme={appleTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Sidebar activeMenu="Documents" />

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />

          {/* Core Content Area */}
          <Box sx={{ p: '10px', flexGrow: 1, overflowY: 'auto' }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3, pb: 4 }}>
              
              {/* Header Box */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                  <BookIcon color="primary" /> Project Documentation
                </Typography>
                <Typography variant="body2" color="text.secondary">Understand the architecture, workflows, and layout menus of Easy Track.</Typography>
              </Box>

              {/* Grid Layout */}
              <Grid container spacing={3}>
                
                {/* Left Side: Project Overview & Getting Started */}
                <Grid item xs={12} md={7}>
                  <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3, mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 2 }}>
                        What is Easy Track?
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                        Easy Track is a lightweight, responsive Agile Project Management system built to run seamlessly on modern workspaces. It leverages a clean, intuitive layout heavily inspired by premium Apple aesthetics.
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                        Designed to bypass bulky legacy setups, Easy Track bridges project requirements directly with execution workflows. Its main objective is to assist developers, QA testers, and managers in aligning project milestones under user stories and tracking task progressions in real-time.
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 2 }}>
                        Key Architectural Concepts
                      </Typography>
                      <List sx={{ p: 0 }}>
                        <ListItem sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                            <DescriptionIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Project Workspace"
                            secondary="Isolated environments separated by company domains, allowing clear boundaries between multiple organization accounts."
                            primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
                            secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                            <DescriptionIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="User Stories & Hierarchy"
                            secondary="Projects serve as root parents. They contain User Stories, which describe standalone feature items. User Stories then group individual sub-tasks and bug reports."
                            primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
                            secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                            <DescriptionIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Kanban Boards & Swimlanes"
                            secondary="Provides instant columns for tracking execution states. Drag-and-drop actions automatically fire back-end triggers to update task states."
                            primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
                            secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Right Side: Menu Items Reference */}
                <Grid item xs={12} md={5}>
                  <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 2 }}>
                        Menu Navigation Details
                      </Typography>
                      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0 }}>
                        {menuDetails.map((menu, idx) => (
                          <React.Fragment key={menu.text}>
                            {idx > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                              <Box sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f1f5f9',
                                border: '1px solid',
                                borderColor: 'divider',
                                flexShrink: 0
                              }}>
                                {menu.icon}
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'text.primary', lineHeight: 1.2, mb: 0.5 }}>
                                  {menu.text}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                                  {menu.desc}
                                </Typography>
                              </Box>
                            </Box>
                          </React.Fragment>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Documents;
