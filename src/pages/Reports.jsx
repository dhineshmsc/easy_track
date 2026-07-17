import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, CssBaseline, Tabs, Tab, Card, CircularProgress
} from '@mui/material';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { useProjectData } from '../hooks/useProjectData';

// Report subcomponents
import ProjectReport from '../components/reports/ProjectReport';
import StoryReport from '../components/reports/StoryReport';
import TaskReport from '../components/reports/TaskReport';
import UserReport from '../components/reports/UserReport';

const Reports = () => {
  const { company } = useParams();
  const username = localStorage.getItem('username') || '';
  const [activeTab, setActiveTab] = useState(0);

  const { projects, storiesByProject, tasksByStory, users } = useProjectData();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const hasData = projects && projects.length >= 0;

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>

        {/* Navigation Sidebar */}
        <Sidebar activeMenu="Reports" />

        {/* Dashboard Work Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />

          {/* Scrolling Core Content Panel */}
          <Box sx={{ p: '10px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Tab Selectors — Order: Project, Story, Task, User */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="reports category tabs">
                  <Tab label="Project Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab label="Story Report"   sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab label="Task Report"    sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab label="User Report"    sx={{ textTransform: 'none', fontWeight: 600 }} />
                </Tabs>
              </Box>

              <Box sx={{ p: '10px', flexGrow: 1, overflow: 'auto' }}>
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
                      <TaskReport
                        projects={projects}
                        storiesByProject={storiesByProject}
                        tasksByStory={tasksByStory}
                        users={users}
                      />
                    )}
                    {activeTab === 3 && (
                      <UserReport
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
    </>
  );
};

export default Reports;
