import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, FormControl, InputLabel,
  Select, MenuItem, TextField, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, LinearProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-hot-toast';

const ProjectReport = ({ projects = [], storiesByProject = {}, tasksByStory = {}, users = [] }) => {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [reporterFilter, setReporterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedRow, setSelectedRow] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Status Chip Color Mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
      case 'Completed': return 'success';
      case 'In Progress':
      case 'Developing': return 'primary';
      case 'Testing': return 'info';
      case 'Planning':
      case 'Todo':
      case 'To Do':
      case 'Not Started': return 'warning';
      case 'On Hold': return 'warning';
      case 'Closed': return 'default';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  // Map backend model records to Report Row structures
  const projectRows = projects.map(proj => {
    const projStories = storiesByProject[proj._id] || [];
    const projTasks = [];
    projStories.forEach(s => {
      const stTasks = tasksByStory[s._id] || [];
      projTasks.push(...stTasks);
    });

    let todo = 0, inProgress = 0, codeReview = 0, testing = 0, deploy = 0, done = 0;
    projTasks.forEach(t => {
      const statusName = (t.status || '').toLowerCase().trim();
      if (statusName === 'todo' || statusName === 'to do') todo++;
      else if (statusName === 'developing' || statusName === 'in progress') inProgress++;
      else if (statusName === 'code review') codeReview++;
      else if (statusName === 'testing') testing++;
      else if (statusName === 'deploy') deploy++;
      else if (statusName === 'done') done++;
    });

    const progress = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0;
    
    // Project Reporter
    const reporterUser = users.find(u => (u._id || u.user_id) === proj.reporter);
    const reporterName = reporterUser ? reporterUser.name : (users.find(u => (u._id || u.user_id) === proj.owner_id)?.name || '-');

    // Use local date methods to avoid UTC timezone shift (e.g. UTC+5:30 offset)
    const startStr = proj.created_at ? (() => { const d = new Date(proj.created_at); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })() : '-';
    const dueStr   = proj.end_date   ? String(proj.end_date).substring(0, 10) : '-';

    // Status
    let calculatedStatus = 'Planning';
    if (progress === 100) calculatedStatus = 'Completed';
    else if (progress > 0) calculatedStatus = 'Developing';
    const status = proj.status || calculatedStatus;

    return {
      id: proj._id,
      name: proj.name,
      description: proj.description || '',
      totalStories: projStories.length,
      totalTasks: projTasks.length,
      todo,
      inProgress,
      codeReview,
      testing,
      deploy,
      done,
      progress,
      reporter: reporterName,
      estimateHours: proj.estimate_hours || 0,
      hours: proj.total_estimate_hours || proj.estimate_hours || 0,
      startDate: startStr,
      dueDate: dueStr,
      status
    };
  });

  // Filter Logic
  const filteredData = projectRows.filter((item) => {
    // Search Box
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Filters
    if (projectFilter !== 'all' && item.id.toString() !== projectFilter) return false;
    if (reporterFilter !== 'all' && item.reporter !== reporterFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    
    // Date Range Filters
    if (startDate && item.startDate < startDate) return false;
    if (endDate && item.dueDate > endDate) return false;

    return true;
  });

  // Action: Open Row Details
  const handleOpenView = (row) => {
    setSelectedRow(row);
    setViewDialogOpen(true);
  };

  // Action: Export Excel (CSV/XLSX compatible)
  const handleExportCSV = () => {
    const headers = [
      'Project Name', 'Description', 'Total Stories', 'Total Tasks',
      'Todo', 'Develop', 'Code Review', 'Testing', 'Deploy', 'Done', 'Progress', 'Estimate Hours', 'Total Hours',
      'Reporter', 'Start Date', 'Due Date', 'Status'
    ];
    const csvRows = [headers.join(',')];

    filteredData.forEach(row => {
      const values = [
        `"${row.name}"`,
        `"${row.description.replace(/"/g, '""')}"`,
        row.totalStories,
        row.totalTasks,
        row.todo,
        row.inProgress,
        row.codeReview,
        row.testing,
        row.deploy,
        row.done,
        `"${row.progress}%"`,
        row.estimateHours,
        row.hours,
        `"${row.reporter}"`,
        `"${row.startDate}"`,
        `"${row.dueDate}"`,
        `"${row.status}"`
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'project_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Successfully exported Project Report to XLSX/Excel!');
  };

  // Columns definition
  const columns = [
    { field: 'name', headerName: 'Project Name', flex: 1.5, minWidth: 130, renderCell: (params) => <strong style={{ color: '#6366f1', fontSize: '0.78rem' }}>{params.value}</strong> },
    { field: 'totalStories', headerName: 'Stories', width: 70, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'totalTasks', headerName: 'Tasks', width: 65, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'todo', headerName: 'Todo', width: 60, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'inProgress', headerName: 'Develop', width: 75, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'codeReview', headerName: 'Code Review', width: 95, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'testing', headerName: 'Test', width: 60, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'deploy', headerName: 'Deploy', width: 70, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'done', headerName: 'Done', width: 60, type: 'number', headerAlign: 'center', align: 'center' },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', height: '100%' }}>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress variant="determinate" value={params.value} sx={{ height: 5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)' }} />
          </Box>
          <Typography variant="caption" fontWeight="bold" fontSize="0.7rem">{params.value}%</Typography>
        </Box>
      )
    },
    { field: 'estimateHours', headerName: 'Est.Hrs', width: 70, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'reporter', headerName: 'Reporter', flex: 1, minWidth: 90 },
    { field: 'startDate', headerName: 'Start', flex: 0.8, minWidth: 85 },
    { field: 'dueDate', headerName: 'Due', flex: 0.8, minWidth: 85 },
    {
      field: 'status',
      headerName: 'Status',
      width: 105,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={getStatusColor(params.value)} variant="outlined" sx={{ fontWeight: 'bold', fontSize: '0.68rem', height: 22 }} />
      )
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Filters Card */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'background.paper', borderRadius: 3 }}>
        <CardContent sx={{ p: '10px' }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5 }}>Project Filter Config</Typography>
          <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
            <Grid xs={12} sm={6} md={3} lg={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Project</InputLabel>
                <Select value={projectFilter} label="Project" onChange={e => setProjectFilter(e.target.value)}>
                  <MenuItem value="all">All Projects</MenuItem>
                  {projects.map(p => (
                    <MenuItem key={p._id} value={p._id.toString()}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={3} lg={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Reporter</InputLabel>
                <Select value={reporterFilter} label="Reporter" onChange={e => setReporterFilter(e.target.value)}>
                  <MenuItem value="all">All Reporters</MenuItem>
                  {Array.from(new Set(projectRows.map(r => r.reporter))).map(rep => (
                    <MenuItem key={rep} value={rep}>{rep}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={3} lg={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Developing">Developing</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Code Review">Code Review</MenuItem>
                  <MenuItem value="Deploy">Deploy</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Planning">Planning</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={3} lg={2}>
              <TextField type="date" label="Start Date" slotProps={{ inputLabel: { shrink: true } }} size="small" fullWidth value={startDate} onChange={e => setStartDate(e.target.value)} />
            </Grid>
            <Grid xs={12} sm={6} md={3} lg={2}>
              <TextField type="date" label="Due Date" slotProps={{ inputLabel: { shrink: true } }} size="small" fullWidth value={endDate} onChange={e => setEndDate(e.target.value)} />
            </Grid>
            <Grid xs={12} sm={6} md={3} lg={2}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
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
          <Typography variant="subtitle2" fontWeight="700">Project Reports</Typography>
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedRow?.name} details</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {selectedRow && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary"><strong>Description:</strong> {selectedRow.description}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Reporter</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.reporter}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedRow.status} size="small" color={getStatusColor(selectedRow.status)} variant="outlined" />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Due Date</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.dueDate}</Typography>
                </Box>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Metrics Summary</Typography>
                <Grid container spacing={2}>
                  <Grid xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Total Stories</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.totalStories}</Typography>
                  </Grid>
                  <Grid xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Total Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.totalTasks}</Typography>
                  </Grid>
                  <Grid xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Todo Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.todo}</Typography>
                  </Grid>
                  <Grid xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Develop Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.inProgress}</Typography>
                  </Grid>
                  <Grid xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Code Review Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.codeReview}</Typography>
                  </Grid>
                  <Grid xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Testing Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.testing}</Typography>
                  </Grid>
                  <Grid xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Deploy Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.deploy}</Typography>
                  </Grid>
                  <Grid xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Completed Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.done}</Typography>
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

export default ProjectReport;
