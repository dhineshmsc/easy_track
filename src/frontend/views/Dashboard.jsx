"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { Box, CssBaseline } from '@mui/material';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import StatCards from '../components/dashboard/StatCards';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import MyTasksTable from '../components/dashboard/MyTasksTable';
import RecentProjects from '../components/dashboard/RecentProjects';
import RecentStories from '../components/dashboard/RecentStories';
import RunningStatusTable from '../components/dashboard/RunningStatusTable';
import { useProjectData } from '../hooks/useProjectData';

const Dashboard = () => {
  const { company } = useParams();
  const username = typeof window !== 'undefined' ? (localStorage.getItem('username') || '') : '';

  const { projects, storiesByProject, tasksByStory, users } = useProjectData();


  // Flatten tasks across all projects & stories
  const allTasks = React.useMemo(() => {
    return Object.values(tasksByStory || {}).flat();
  }, [tasksByStory]);

  // Flatten stories across all projects
  const allStories = React.useMemo(() => {
    return Object.values(storiesByProject || {}).flat();
  }, [storiesByProject]);

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />
          
          <Box sx={{ 
            p: '10px', 
            overflowY: 'auto', 
            flexGrow: 1,
            /* Apple-style Scrollbar */
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { 
              background: 'rgba(0, 0, 0, 0.15)', 
              borderRadius: '10px',
              border: '2px solid transparent',
              backgroundClip: 'padding-box'
            },
            '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(0, 0, 0, 0.3)', border: '2px solid transparent', backgroundClip: 'padding-box' }
          }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
              <WelcomeSection company={company} username={username} />
              
              <StatCards projects={projects} users={users} allTasks={allTasks} stories={allStories} />

              <Box sx={{ width: '100%', mb: 4 }}>
                <RunningStatusTable tasks={allTasks} users={users} stories={allStories} />
              </Box>

              <Box sx={{ width: '100%', mb: 4 }}>
                <MyTasksTable tasks={allTasks} users={users} stories={allStories} />
              </Box>

              <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
                {/* Recent Activities (Left Column, 33.3% width) */}
                <Box sx={{ width: { xs: '100%', lg: 'calc(33.33% - 21.3px)' }, flexShrink: 0 }}>
                  <ActivityFeed projects={projects} users={users} allTasks={allTasks} storiesByProject={storiesByProject} />
                </Box>
                {/* Recent Stories (Middle Column, 33.3% width) */}
                <Box sx={{ width: { xs: '100%', lg: 'calc(33.33% - 21.3px)' }, flexShrink: 0 }}>
                  <RecentStories storiesByProject={storiesByProject} projects={projects} users={users} />
                </Box>
                {/* Recent Projects (Right Column, 33.3% width) */}
                <Box sx={{ width: { xs: '100%', lg: 'calc(33.33% - 21.3px)' }, flexShrink: 0 }}>
                  <RecentProjects projects={projects} users={users} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

      </Box>
    </>
  );
};

export default Dashboard;
