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
import { useProjectData } from '../hooks/useProjectData';

const Dashboard = () => {
  const { company } = useParams();
  const username = typeof window !== 'undefined' ? (localStorage.getItem('username') || '') : '';

  const { projects, tasksByStory, users } = useProjectData();


  // Flatten tasks across all projects & stories
  const allTasks = React.useMemo(() => {
    return Object.values(tasksByStory || {}).flat();
  }, [tasksByStory]);

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
              
              <StatCards projects={projects} users={users} allTasks={allTasks} />

              <Box sx={{ display: 'flex', gap: 4, mb: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
                <Box sx={{ width: { xs: '100%', lg: 'calc(80% - 16px)' }, flexShrink: 0 }}>
                  <MyTasksTable tasks={allTasks} users={users} />
                </Box>
                <Box sx={{ width: { xs: '100%', lg: 'calc(20% - 16px)' }, flexShrink: 0 }}>
                  <ActivityFeed projects={projects} users={users} allTasks={allTasks} />
                </Box>
              </Box>

              <RecentProjects projects={projects} users={users} />
            </Box>
          </Box>
        </Box>

      </Box>
    </>
  );
};

export default Dashboard;
