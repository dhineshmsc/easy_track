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
  const [selectedRow, setSelectedRow] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

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
        const storyAssignees = s.assigned_user ? (Array.isArray(s.assigned_user) ? s.assigned_user.map(id => id.toString()) : [s.assigned_user.toString()]) : [];
        if (storyAssignees.includes(userId.toString())) {
          userStoriesList.push(s);
        }
      });
    });

    // Projects assigned:
    const projSet = new Set();
    projects.forEach(p => {
      if (p.owner_id && p.owner_id.toString() === userId.toString()) projSet.add(p.name);
      const projAssignees = p.assigned_user ? (Array.isArray(p.assigned_user) ? p.assigned_user.map(id => id.toString()) : [p.assigned_user.toString()]) : [];
      if (projAssignees.includes(userId.toString())) projSet.add(p.name);

      const pStories = storiesByProject[p._id] || [];
      pStories.forEach(s => {
        const storyAssignees = s.assigned_user ? (Array.isArray(s.assigned_user) ? s.assigned_user.map(id => id.toString()) : [s.assigned_user.toString()]) : [];
        if (storyAssignees.includes(userId.toString())) projSet.add(p.name);
        
        const sTasks = tasksByStory[s._id] || [];
        sTasks.forEach(t => {
          if (t.assigned_user && t.assigned_user.toString() === userId.toString()) projSet.add(p.name);
        });
      });
    });

    const assignedProjects = Array.from(projSet).join(', ') || 'None';

    let todo = 0, inProgress = 0, codeReview = 0, testing = 0, deploy = 0, done = 0;
    let overdueTasks = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    userTasksList.forEach(t => {
      const statusName = (t.status || '').toLowerCase().trim();
      if (statusName === 'todo' || statusName === 'to do') todo++;
      else if (statusName === 'developing' || statusName === 'in progress') inProgress++;
      else if (statusName === 'code review') codeReview++;
      else if (statusName === 'testing') testing++;
      else if (statusName === 'deploy') deploy++;
      else if (statusName === 'done') done++;

      if (statusName !== 'done' && t.end_date) {
        const taskDueDate = t.end_date.substring(0, 10);
        if (taskDueDate < todayStr) {
          overdueTasks++;
        }
      }
    });

    const totalHours = userTasksList.reduce((sum, t) => sum + (t.estimate_hours || 0), 0);

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
      codeReview,
      testing,
      deploy,
      done,
      completedTasks: done,
      totalHours,
      overdueTasks
    };
  });

  const filteredData = userRows.filter((item) => {
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (userFilter !== 'all' && item.name !== userFilter) return false;
    if (roleFilter !== 'all' && item.role !== roleFilter) return false;
    if (projectFilter !== 'all' && !item.assignedProjects.includes(projectFilter)) return false;


    return true;
  });

  const handleOpenView = (row) => {
    setSelectedRow(row);
    setViewDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Employee ID', 'User Name', 'Email', 'Role', 'Assigned Projects',
      'Assigned Stories', 'Assigned Tasks', 'Todo', 'Develop', 'Code Review',
      'Testing', 'Deploy', 'Done', 'Completed Tasks', 'Total Hours', 'Overdue Tasks'
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
        row.codeReview,
        row.testing,
        row.deploy,
        row.done,
        row.completedTasks,
        row.totalHours,
        row.overdueTasks
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
    { field: 'employeeId', headerName: 'Emp ID', width: 90 },
    {
      field: 'name',
      headerName: 'User Name',
      flex: 1.5,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem', bgcolor: getAvatarColor(params.value), fontWeight: 'bold', color: '#fff' }}>
            {params.value.charAt(0)}
          </Avatar>
          <strong style={{ color: '#10b981', fontSize: '0.78rem' }}>{params.value}</strong>
        </Box>
      )
    },
    { field: 'email', headerName: 'Email', flex: 2, minWidth: 150 },
    { field: 'role', headerName: 'Role', flex: 1, minWidth: 90 },
    { field: 'assignedStories', headerName: 'Stories', width: 70, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'assignedTasks', headerName: 'Tasks', width: 65, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'todo', headerName: 'Todo', width: 60, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'inProgress', headerName: 'Develop', width: 75, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'codeReview', headerName: 'Code Review', width: 95, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'testing', headerName: 'Test', width: 60, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'deploy', headerName: 'Deploy', width: 70, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'done', headerName: 'Done', width: 60, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'completedTasks', headerName: 'Completed', width: 90, type: 'number', headerAlign: 'center', align: 'center', renderCell: (params) => <strong style={{ color: '#16a34a', fontSize: '0.78rem' }}>{params.value}</strong> },
    { field: 'totalHours', headerName: 'Hrs', width: 60, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'overdueTasks', headerName: 'Overdue', width: 75, type: 'number', headerAlign: 'center', align: 'center', renderCell: (params) => <strong style={{ color: params.value > 0 ? '#ef4444' : '#10b981', fontSize: '0.78rem' }}>{params.value}</strong> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Filters Card */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'background.paper', borderRadius: 3 }}>
        <CardContent sx={{ p: '10px' }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5 }}>User Filter Config</Typography>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid xs={12} sm={6} md={3} lg={2.4}>
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
            <Grid xs={12} sm={6} md={3} lg={2.4}>
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
            <Grid xs={12} sm={6} md={3} lg={2.4}>
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

            <Grid xs={12} sm={6} md={3} lg={2.4}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search email or name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Grid Card */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'background.paper', borderRadius: 3 }}>
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight="700">User Performance Matrix</Typography>
          <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />} onClick={handleExportCSV} sx={{ border: '1px solid rgba(255,255,255,0.08)', color: 'text.primary', textTransform: 'none', fontSize: '0.75rem' }}>
            Export XLSX
          </Button>
        </Box>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            rowHeight={36}
            columnHeaderHeight={38}
            pageSizeOptions={[10, 20, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } }
            }}
            disableRowSelectionOnClick
            autoHeight
            onRowClick={(params) => handleOpenView(params.row)}
            sx={{
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                minHeight: '38px !important',
                maxHeight: '38px !important',
                lineHeight: '38px',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                py: 0,
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.02)'
              },
              '& .MuiDataGrid-footerContainer': {
                minHeight: 40,
              },
              '& .MuiTablePagination-root': {
                fontSize: '0.75rem',
              }
            }}
          />
        </Box>
      </Card>

      {/* Row details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
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
              <Typography variant="body2" color="text.secondary"><strong>Total Hours:</strong> {selectedRow.totalHours}h</Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Tasks Statistics</Typography>
                <Grid container spacing={2}>
                  <Grid xs={4}>
                    <Typography variant="caption" color="text.secondary">Assigned Stories</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.assignedStories}</Typography>
                  </Grid>
                  <Grid xs={4}>
                    <Typography variant="caption" color="text.secondary">Total Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.assignedTasks}</Typography>
                  </Grid>
                  <Grid xs={4}>
                    <Typography variant="caption" color="text.secondary">Todo Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.todo}</Typography>
                  </Grid>
                  <Grid xs={4}>
                    <Typography variant="caption" color="text.secondary">Develop Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main' }}>{selectedRow.inProgress}</Typography>
                  </Grid>
                  <Grid xs={4}>
                    <Typography variant="caption" color="text.secondary">Code Review Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.codeReview}</Typography>
                  </Grid>
                  <Grid xs={4}>
                    <Typography variant="caption" color="text.secondary">Testing Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'info.main' }}>{selectedRow.testing}</Typography>
                  </Grid>
                  <Grid xs={4}>
                    <Typography variant="caption" color="text.secondary">Deploy Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.deploy}</Typography>
                  </Grid>
                  <Grid xs={4}>
                    <Typography variant="caption" color="text.secondary">Completed Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'success.main' }}>{selectedRow.completedTasks}</Typography>
                  </Grid>
                  <Grid xs={4}>
                    <Typography variant="caption" color="text.secondary">Overdue Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: selectedRow.overdueTasks > 0 ? 'error.main' : 'success.main' }}>{selectedRow.overdueTasks}</Typography>
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
