import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, ThemeProvider, createTheme, CssBaseline, Typography, Tabs, Tab, Card, CircularProgress
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { useProjectData } from '../hooks/useProjectData';

// Subcomponents
import ProjectReport from '../components/reports/ProjectReport';
import StoryReport from '../components/reports/StoryReport';
import UserReport from '../components/reports/UserReport';
import TaskReport from '../components/reports/TaskReport';

// Sleek enterprise dark theme
const darkReportsTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo Accent
    },
    background: {
      default: '#0a0e17', // Pitch dark workspace background
      paper: '#111827',   // Slate gray card panels
    },
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif',
  },
});

const Reports = () => {
  const { company } = useParams();
  const username = localStorage.getItem('username') || '';
  const [activeTab, setActiveTab] = useState(0);

  // Load actual active workspace database metrics
  const { projects, storiesByProject, tasksByStory, users } = useProjectData();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const hasData = projects && projects.length >= 0;

  return (
    <ThemeProvider theme={darkReportsTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        
        {/* Navigation Sidebar */}
        <Sidebar activeMenu="Reports" />

        {/* Dashboard Work Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />

          {/* Scrolling Core Content Panel */}
          <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Header section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="800">Operational Reports</Typography>
                <Typography variant="body2" color="text.secondary">Cross-matrix dashboards for projects, user capacities, story deliverables, and tasks.</Typography>
              </Box>
            </Box>

            {/* Tab Selectors */}
            <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'background.paper', borderRadius: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="reports category tabs">
                  <Tab label="Project Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab label="Story Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab label="User Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab label="Task Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
                </Tabs>
              </Box>
              
              <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                {!hasData ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  <>
                    {activeTab === 0 && (
                      <ProjectReport 
                        projects={projects} 
                        storiesByProject={storiesByProject} 
                        tasksByStory={tasksByStory} 
                        users={users} 
                      />
                    )}
                    {activeTab === 1 && (
                      <StoryReport 
                        projects={projects} 
                        storiesByProject={storiesByProject} 
                        tasksByStory={tasksByStory} 
                        users={users} 
                      />
                    )}
                    {activeTab === 2 && (
                      <UserReport 
                        projects={projects} 
                        storiesByProject={storiesByProject} 
                        tasksByStory={tasksByStory} 
                        users={users} 
                      />
                    )}
                    {activeTab === 3 && (
                      <TaskReport 
                        projects={projects} 
                        storiesByProject={storiesByProject} 
                        tasksByStory={tasksByStory} 
                        users={users} 
                      />
                    )}
                  </>
                )}
              </Box>
            </Card>

          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Reports;
