import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, ThemeProvider, createTheme, CssBaseline, Grid } from '@mui/material';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import StatCards from '../components/dashboard/StatCards';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import MyTasksTable from '../components/dashboard/MyTasksTable';
import RecentProjects from '../components/dashboard/RecentProjects';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
      }
    }
  }
});

const Dashboard = () => {
  const { company } = useParams();
  const username = localStorage.getItem('username') || '';

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />
          
          <Box sx={{ 
            p: 4, 
            overflowY: 'auto', 
            flexGrow: 1,
            /* Apple-style Scrollbar */
            '&::-webkit-scrollbar': { width: '10px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '100px',
              border: '2px solid transparent',
              backgroundClip: 'padding-box'
            },
            '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255, 255, 255, 0.3)', border: '2px solid transparent', backgroundClip: 'padding-box' }
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
    </ThemeProvider>
  );
};

export default Dashboard;
