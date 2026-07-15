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
  const [leadFilter, setLeadFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedRow, setSelectedRow] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Status Chip Color Mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Planning': return 'info';
      case 'On Hold': return 'warning';
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

    let todo = 0, inProgress = 0, testing = 0, done = 0;
    projTasks.forEach(t => {
      const statusName = (t.status || '').toLowerCase().trim();
      if (statusName === 'todo' || statusName === 'to do') todo++;
      else if (statusName === 'in progress') inProgress++;
      else if (statusName === 'testing') testing++;
      else if (statusName === 'done') done++;
    });

    const progress = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0;
    
    // Project Lead
    const leadUser = users.find(u => (u._id || u.user_id) === proj.owner_id);
    const leadName = leadUser ? leadUser.name : 'Unknown';

    // Start Date
    const startStr = proj.created_at ? new Date(proj.created_at).toISOString().split('T')[0] : '';

    // Due Date (latest task end date fallback or 6 months after created_at)
    let maxDate = '';
    projTasks.forEach(t => {
      if (t.end_date && t.end_date > maxDate) maxDate = t.end_date;
    });
    const dueStr = maxDate 
      ? new Date(maxDate).toISOString().split('T')[0] 
      : (proj.created_at ? new Date(new Date(proj.created_at).setMonth(new Date(proj.created_at).getMonth() + 6)).toISOString().split('T')[0] : 'N/A');

    // Status
    let status = 'Planning';
    if (progress === 100) status = 'Completed';
    else if (progress > 0) status = 'In Progress';

    return {
      id: proj._id,
      name: proj.name,
      description: proj.description || '',
      totalStories: projStories.length,
      totalTasks: projTasks.length,
      todo,
      inProgress,
      testing,
      done,
      progress,
      lead: leadName,
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
    if (leadFilter !== 'all' && item.lead !== leadFilter) return false;
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
      'Todo', 'In Progress', 'Testing', 'Done', 'Progress',
      'Project Lead', 'Start Date', 'Due Date', 'Status'
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
        row.testing,
        row.done,
        `"${row.progress}%"`,
        `"${row.lead}"`,
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
    { field: 'name', headerName: 'Project Name', width: 180, renderCell: (params) => <strong style={{ color: '#6366f1' }}>{params.value}</strong> },
    { field: 'description', headerName: 'Description', width: 220, renderCell: (params) => <span style={{ color: '#9ca3af' }}>{params.value}</span> },
    { field: 'totalStories', headerName: 'Stories', width: 90, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'totalTasks', headerName: 'Tasks', width: 80, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'todo', headerName: 'Todo', width: 70, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'inProgress', headerName: 'In Progress', width: 100, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'testing', headerName: 'Testing', width: 80, type: 'number', headerAlign: 'center', align: 'center' },
    { field: 'done', headerName: 'Done', width: 70, type: 'number', headerAlign: 'center', align: 'center' },
    {
      field: 'progress',
      headerName: 'Progress %',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', height: '100%' }}>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress variant="determinate" value={params.value} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)' }} />
          </Box>
          <Typography variant="caption" fontWeight="bold">{params.value}%</Typography>
        </Box>
      )
    },
    { field: 'lead', headerName: 'Lead', width: 130 },
    { field: 'startDate', headerName: 'Start Date', width: 110 },
    { field: 'dueDate', headerName: 'Due Date', width: 110 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
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
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2 }}>Project Filter Config</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3} lg={2}>
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
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Project Lead</InputLabel>
                <Select value={leadFilter} label="Project Lead" onChange={e => setLeadFilter(e.target.value)}>
                  <MenuItem value="all">All Leads</MenuItem>
                  {Array.from(new Set(projectRows.map(r => r.lead))).map(lead => (
                    <MenuItem key={lead} value={lead}>{lead}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Planning">Planning</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} size="small" fullWidth value={startDate} onChange={e => setStartDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <TextField type="date" label="Due Date" InputLabelProps={{ shrink: true }} size="small" fullWidth value={endDate} onChange={e => setEndDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search projects..."
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
          <Typography variant="subtitle1" fontWeight="700">Project Performance Matrix</Typography>
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedRow?.name} details</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {selectedRow && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary"><strong>Description:</strong> {selectedRow.description}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Project Lead</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.lead}</Typography>
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
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Total Stories</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.totalStories}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Total Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.totalTasks}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Testing Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.testing}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
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
