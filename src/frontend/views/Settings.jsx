"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, CssBaseline, Typography, Card, CardContent, Button, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Divider, Grid, Switch
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-hot-toast';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { useThemeMode } from '../context/ThemeContext';

const Settings = () => {
  const { company } = useParams();
  const username = typeof window !== 'undefined' ? (localStorage.getItem('username') || '') : '';
  const initialEmail = typeof window !== 'undefined' ? (localStorage.getItem('email') || `${username.toLowerCase().replace(/\s+/g, '')}@company.com`) : '';
  
  const { mode, toggleColorMode } = useThemeMode();

  const [formData, setFormData] = useState({
    name: username,
    email: initialEmail,
    notifications: true,
    theme: mode,
    autoRefresh: true
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, theme: mode }));
  }, [mode]);

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('username', formData.name);
    }
    toggleColorMode(formData.theme);
    toast.success('Settings saved successfully!');
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Sidebar activeMenu="Settings" />

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />

          {/* Page content */}
          <Box sx={{ p: '10px', flexGrow: 1, overflowY: 'auto' }}>
            <Box sx={{ maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

              <Box sx={{ mb: 1 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SettingsIcon color="primary" /> Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">Configure your workspace and profile settings.</Typography>
              </Box>

              <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <form onSubmit={handleSave}>
                    <Grid container spacing={4}>
                      
                      {/* Section 1: User Profile */}
                      <Grid xs={12}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>User Profile</Typography>
                        <Typography variant="caption" color="text.secondary">Update your public info.</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <TextField
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            size="small"
                          />
                          <TextField
                            label="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            fullWidth
                            size="small"
                          />
                        </Box>
                      </Grid>

                      <Grid xs={12}>
                        <Divider />
                      </Grid>

                      {/* Section 2: Notifications */}
                      <Grid xs={12}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>System Settings</Typography>
                        <Typography variant="caption" color="text.secondary">Configure notifications and system updates.</Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" fontWeight="600">Email Notifications</Typography>
                              <Typography variant="caption" color="text.secondary">Receive weekly performance summaries and task assignments.</Typography>
                            </Box>
                            <Switch
                              checked={formData.notifications}
                              onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" fontWeight="600">Real-Time Refresh</Typography>
                              <Typography variant="caption" color="text.secondary">Automatically sync updates on the task board every 30 seconds.</Typography>
                            </Box>
                            <Switch
                              checked={formData.autoRefresh}
                              onChange={(e) => setFormData({ ...formData, autoRefresh: e.target.checked })}
                            />
                          </Box>
                        </Box>
                      </Grid>

                      <Grid xs={12}>
                        <Divider />
                      </Grid>

                      {/* Section 3: Interface Theme */}
                      <Grid xs={12}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Workspace Theme</Typography>
                        <FormControl>
                          <RadioGroup
                            row
                            value={formData.theme}
                            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                          >
                            <FormControlLabel value="dark" control={<Radio />} label="Dark Mode (Default)" />
                            <FormControlLabel value="light" control={<Radio />} label="Light Mode" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          sx={{ px: 4, py: 1 }}
                        >
                          Save Settings
                        </Button>
                      </Grid>

                    </Grid>
                  </form>
                </CardContent>
              </Card>

            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Settings;
