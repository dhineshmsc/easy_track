import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, FormControl, InputLabel,
  Select, MenuItem, TextField, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-hot-toast';
import { getAvatarColor } from '../../utils/projectsHelper';

const UserReport = ({ projects = [], storiesByProject = {}, tasksByStory = {}, users = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedRow, setSelectedRow] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'default';
  };

  // Convert raw DB user entities into report stats
  const userRows = users.map((u, idx) => {
    const userId = u._id || u.user_id;

    // Scan all tasks in the system for this user
    const userTasksList = [];
    projects.forEach(p => {
      const projStories = storiesByProject[p._id] || [];
      projStories.forEach(s => {
        const storyTasks = tasksByStory[s._id] || [];
        storyTasks.forEach(t => {
          if (t.assigned_user && t.assigned_user.toString() === userId.toString()) {
            userTasksList.push(t);
          }
        });
      });
    });

    // Scan all stories in the system for this user
    const userStoriesList = [];
    projects.forEach(p => {
      const projStories = storiesByProject[p._id] || [];
      projStories.forEach(s => {
        if (s.assigned_user && s.assigned_user.toString() === userId.toString()) {
          userStoriesList.push(s);
        }
      });
    });

    // Projects assigned:
    const projSet = new Set();
    projects.forEach(p => {
      if (p.owner_id && p.owner_id.toString() === userId.toString()) projSet.add(p.name);
      const pStories = storiesByProject[p._id] || [];
      pStories.forEach(s => {
        if (s.assigned_user && s.assigned_user.toString() === userId.toString()) projSet.add(p.name);
        const sTasks = tasksByStory[s._id] || [];
        sTasks.forEach(t => {
          if (t.assigned_user && t.assigned_user.toString() === userId.toString()) projSet.add(p.name);
        });
      });
    });

    const assignedProjects = Array.from(projSet).join(', ') || 'None';

    let todo = 0, inProgress = 0, testing = 0, done = 0;
    userTasksList.forEach(t => {
      const statusName = (t.status || '').toLowerCase().trim();
      if (statusName === 'todo' || statusName === 'to do') todo++;
      else if (statusName === 'in progress') inProgress++;
      else if (statusName === 'testing') testing++;
      else if (statusName === 'done') done++;
    });

    return {
      id: userId,
      employeeId: u.employeeId || `EMP-${100 + idx}`,
      name: u.name,
      email: u.email || 'N/A',
      role: u.role || 'Developer',
      assignedProjects,
      assignedStories: userStoriesList.length,
      assignedTasks: userTasksList.length,
      todo,
      inProgress,
      testing,
      done,
      activeTasks: todo + inProgress + testing,
      completedTasks: done,
      status: u.status || 'Active'
    };
  });

  const filteredData = userRows.filter((item) => {
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (userFilter !== 'all' && item.name !== userFilter) return false;
    if (roleFilter !== 'all' && item.role !== roleFilter) return false;
    if (projectFilter !== 'all' && !item.assignedProjects.includes(projectFilter)) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;

    return true;
  });

  const handleOpenView = (row) => {
    setSelectedRow(row);
    setViewDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Employee ID', 'User Name', 'Email', 'Role', 'Assigned Projects',
      'Assigned Stories', 'Assigned Tasks', 'Todo', 'In Progress',
      'Testing', 'Done', 'Active Tasks', 'Completed Tasks', 'Status'
    ];
    const csvRows = [headers.join(',')];

    filteredData.forEach(row => {
      const values = [
        `"${row.employeeId}"`,
        `"${row.name}"`,
        `"${row.email}"`,
        `"${row.role}"`,
        `"${row.assignedProjects.replace(/"/g, '""')}"`,
        row.assignedStories,
        row.assignedTasks,
        row.todo,
        row.inProgress,
        row.testing,
        row.done,
        row.activeTasks,
        row.completedTasks,
        `"${row.status}"`
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'user_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Successfully exported User Report to XLSX/Excel!');
  };

  const columns = [
    { field: 'employeeId', headerName: 'Employee ID', width: 120 },
    {
      field: 'name',
      headerName: 'User Name',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: getAvatarColor(params.value), fontWeight: 'bold', color: '#fff' }}>
            {params.value.charAt(0)}
          </Avatar>
          <strong style={{ color: '#10b981' }}>{params.value}</strong>
        </Box>
      )
    },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'role', headerName: 'Role', width: 140 },
    { field: 'assignedProjects', headerName: 'Assigned Projects', width: 200, renderCell: (params) => <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{params.value}</span> },
    { field: 'assignedStories', headerName: 'Stories', width: 80, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'assignedTasks', headerName: 'Tasks', width: 80, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'todo', headerName: 'Todo', width: 70, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'inProgress', headerName: 'In Progress', width: 100, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'testing', headerName: 'Testing', width: 80, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'done', headerName: 'Done', width: 70, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'activeTasks', headerName: 'Active Tasks', width: 110, type: 'number', headerAlign: 'center', align: 'center', renderCell: (params) => <strong style={{ color: '#ea580c' }}>{params.value}</strong> },
    { field: 'completedTasks', headerName: 'Completed Tasks', width: 130, type: 'number', headerAlign: 'center', align: 'center', renderCell: (params) => <strong style={{ color: '#16a34a' }}>{params.value}</strong> },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={getStatusColor(params.value)} variant="outlined" sx={{ fontWeight: 'bold' }} />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => handleOpenView(params.row)}
          sx={{ textTransform: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'text.primary' }}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Filters Card */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'background.paper', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2 }}>User Filter Config</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3} lg={2.4}>
              <FormControl size="small" fullWidth>
                <InputLabel>User</InputLabel>
                <Select value={userFilter} label="User" onChange={e => setUserFilter(e.target.value)}>
                  <MenuItem value="all">All Users</MenuItem>
                  {users.map(u => (
                    <MenuItem key={u._id || u.user_id} value={u.name}>{u.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2.4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={roleFilter} label="Role" onChange={e => setRoleFilter(e.target.value)}>
                  <MenuItem value="all">All Roles</MenuItem>
                  {Array.from(new Set(userRows.map(r => r.role))).map(role => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2.4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Project</InputLabel>
                <Select value={projectFilter} label="Project" onChange={e => setProjectFilter(e.target.value)}>
                  <MenuItem value="all">All Projects</MenuItem>
                  {projects.map(p => (
                    <MenuItem key={p._id} value={p.name}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2.4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2.4}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search email or name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Grid Card */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'background.paper', borderRadius: 3 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="700">User Performance Matrix</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />} onClick={handleExportCSV} sx={{ border: '1px solid rgba(255,255,255,0.08)', color: 'text.primary', textTransform: 'none' }}>
              Export XLSX
            </Button>
          </Box>
        </Box>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } }
            }}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(255,255,255,0.04)'
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.02)'
              }
            }}
          />
        </Box>
      </Card>

      {/* Row details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedRow?.name} Profile Matrix</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {selectedRow && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48, fontSize: '1.2rem', bgcolor: getAvatarColor(selectedRow.name), fontWeight: 'bold', color: '#fff' }}>
                  {selectedRow.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{selectedRow.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedRow.email} | {selectedRow.role}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary"><strong>Assigned Projects:</strong> {selectedRow.assignedProjects}</Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Tasks Statistics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Assigned Stories</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.assignedStories}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Total Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.assignedTasks}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Active Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'warning.main' }}>{selectedRow.activeTasks}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Completed Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'success.main' }}>{selectedRow.completedTasks}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Testing Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'info.main' }}>{selectedRow.testing}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Employee Status</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={selectedRow.status} size="small" color={getStatusColor(selectedRow.status)} variant="outlined" />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserReport;
