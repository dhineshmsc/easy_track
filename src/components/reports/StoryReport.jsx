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

const StoryReport = ({ projects = [], storiesByProject = {}, tasksByStory = {}, users = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [storyFilter, setStoryFilter] = useState('all');
  const [reporterFilter, setReporterFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [endDate, setEndDate] = useState('');

  const [selectedRow, setSelectedRow] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Testing': return 'info';
      case 'Planning':
      case 'To Do': return 'warning';
      default: return 'default';
    }
  };

  // Convert raw DB story entities into report items
  const storyRows = [];
  projects.forEach(proj => {
    const projStories = storiesByProject[proj._id] || [];
    projStories.forEach(s => {
      const storyTasks = tasksByStory[s._id] || [];

      let todo = 0, inProgress = 0, testing = 0, done = 0;
      storyTasks.forEach(t => {
        const statusName = (t.status || '').toLowerCase().trim();
        if (statusName === 'todo' || statusName === 'to do') todo++;
        else if (statusName === 'in progress') inProgress++;
        else if (statusName === 'testing') testing++;
        else if (statusName === 'done') done++;
      });

      const progress = storyTasks.length > 0 ? Math.round((done / storyTasks.length) * 100) : 0;
      
      // Reporters & Assignees
      const repUser = users.find(u => (u._id || u.user_id) === s.reporter);
      const reporterName = repUser ? repUser.name : 'Unknown';
      const assUser = users.find(u => (u._id || u.user_id) === s.assigned_user);
      const assigneeName = assUser ? assUser.name : 'Unassigned';

      // Due date formatting
      const dueStr = s.end_date ? new Date(s.end_date).toISOString().split('T')[0] : 'N/A';

      storyRows.push({
        id: s._id,
        name: s.name,
        projectName: proj.name,
        description: s.description || '',
        totalTasks: storyTasks.length,
        todo,
        inProgress,
        testing,
        done,
        progress,
        reporter: reporterName,
        assignee: assigneeName,
        dueDate: dueStr,
        status: s.status || 'To Do'
      });
    });
  });

  const filteredData = storyRows.filter((item) => {
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (projectFilter !== 'all' && item.projectName !== projectFilter) return false;
    if (storyFilter !== 'all' && item.id.toString() !== storyFilter) return false;
    if (reporterFilter !== 'all' && item.reporter !== reporterFilter) return false;
    if (assigneeFilter !== 'all' && item.assignee !== assigneeFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (endDate && item.dueDate > endDate) return false;

    return true;
  });

  const handleOpenView = (row) => {
    setSelectedRow(row);
    setViewDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Story Name', 'Project Name', 'Description', 'Total Tasks',
      'Todo', 'In Progress', 'Testing', 'Done', 'Progress',
      'Reporter', 'Assignee', 'Due Date', 'Status'
    ];
    const csvRows = [headers.join(',')];

    filteredData.forEach(row => {
      const values = [
        `"${row.name}"`,
        `"${row.projectName}"`,
        `"${row.description.replace(/"/g, '""')}"`,
        row.totalTasks,
        row.todo,
        row.inProgress,
        row.testing,
        row.done,
        `"${row.progress}%"`,
        `"${row.reporter}"`,
        `"${row.assignee}"`,
        `"${row.dueDate}"`,
        `"${row.status}"`
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'story_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Successfully exported Story Report to XLSX/Excel!');
  };

  const columns = [
    { field: 'name', headerName: 'Story Name', width: 180, renderCell: (params) => <strong style={{ color: '#8b5cf6' }}>{params.value}</strong> },
    { field: 'projectName', headerName: 'Project Name', width: 140 },
    { field: 'description', headerName: 'Description', width: 220, renderCell: (params) => <span style={{ color: '#9ca3af' }}>{params.value}</span> },
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
            <LinearProgress variant="determinate" value={params.value} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' } }} />
          </Box>
          <Typography variant="caption" fontWeight="bold">{params.value}%</Typography>
        </Box>
      )
    },
    { field: 'reporter', headerName: 'Reporter', width: 120 },
    { field: 'assignee', headerName: 'Assignee', width: 120 },
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
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2 }}>Story Filter Config</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3} lg={1.7}>
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
            <Grid item xs={12} sm={6} md={3} lg={1.7}>
              <FormControl size="small" fullWidth>
                <InputLabel>Story</InputLabel>
                <Select value={storyFilter} label="Story" onChange={e => setStoryFilter(e.target.value)}>
                  <MenuItem value="all">All Stories</MenuItem>
                  {storyRows.map(s => (
                    <MenuItem key={s.id} value={s.id.toString()}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={1.7}>
              <FormControl size="small" fullWidth>
                <InputLabel>Reporter</InputLabel>
                <Select value={reporterFilter} label="Reporter" onChange={e => setReporterFilter(e.target.value)}>
                  <MenuItem value="all">All Reporters</MenuItem>
                  {Array.from(new Set(storyRows.map(r => r.reporter))).map(reporter => (
                    <MenuItem key={reporter} value={reporter}>{reporter}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={1.7}>
              <FormControl size="small" fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select value={assigneeFilter} label="Assignee" onChange={e => setAssigneeFilter(e.target.value)}>
                  <MenuItem value="all">All Assignees</MenuItem>
                  {Array.from(new Set(storyRows.map(r => r.assignee))).map(assignee => (
                    <MenuItem key={assignee} value={assignee}>{assignee}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={1.7}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Todo">Todo</MenuItem>
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Testing">Testing</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={1.7}>
              <TextField type="date" label="Due Before" InputLabelProps={{ shrink: true }} size="small" fullWidth value={endDate} onChange={e => setEndDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={1.8}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search stories..."
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
          <Typography variant="subtitle1" fontWeight="700">Story Deliverables Matrix</Typography>
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
                  <Typography variant="caption" color="text.secondary">Project Name</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.projectName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Assignee</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.assignee}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Reporter</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.reporter}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Due Date</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.dueDate}</Typography>
                </Box>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Metrics Breakdown</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Total Tasks</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.totalTasks}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Completed</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.done}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">In Progress</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.inProgress}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Testing</Typography>
                    <Typography variant="h6" fontWeight="bold">{selectedRow.testing}</Typography>
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

export default StoryReport;
