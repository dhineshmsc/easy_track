import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, CssBaseline, Grid } from '@mui/material';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import StatCards from '../components/dashboard/StatCards';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import MyTasksTable from '../components/dashboard/MyTasksTable';
import RecentProjects from '../components/dashboard/RecentProjects';

const Dashboard = () => {
  const { company } = useParams();
  const username = localStorage.getItem('username') || '';

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
              
              <StatCards />

              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                  <MyTasksTable />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <ActivityFeed />
                </Grid>
              </Grid>

              <RecentProjects />
            </Box>
          </Box>
        </Box>

      </Box>
    </>
  );
};

export default Dashboard;
