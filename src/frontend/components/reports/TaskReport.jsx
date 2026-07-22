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

const TaskReport = ({ projects = [], storiesByProject = {}, tasksByStory = {}, users = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [storyFilter, setStoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [reporterFilter, setReporterFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [endDate, setEndDate] = useState('');

  const [selectedRow, setSelectedRow] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'success';
      case 'In Progress': return 'primary';
      case 'Testing': return 'info';
      case 'Todo':
      case 'To Do': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  // Convert raw DB tasks into flat list of rows
  const taskRows = [];
  projects.forEach(proj => {
    const projStories = storiesByProject[proj._id] || [];
    projStories.forEach(s => {
      const storyTasks = tasksByStory[s._id] || [];
      storyTasks.forEach(t => {
        const assUser = users.find(u => (u._id || u.user_id) === t.assigned_user);
        const repUser = users.find(u => (u._id || u.user_id) === t.reporter);

        // Use local date methods to avoid UTC timezone shift (e.g. UTC+5:30 offset)
        const startStr = t.created_at ? (() => { const d = new Date(t.created_at); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })() : '-';
        const dueStr   = t.end_date   ? String(t.end_date).substring(0, 10) : '-';

        taskRows.push({
          id: t._id,
          name: t.name,
          project: proj.name,
          story: s.name,
          assignee: assUser ? assUser.name : '-',
          reporter: repUser ? repUser.name : '-',
          priority: t.priority || 'Medium',
          status: t.status || 'To Do',
          estimate: t.estimate_hours || 0,
          startDate: startStr,
          dueDate: dueStr
        });
      });
    });
  });

  const filteredData = taskRows.filter((item) => {
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.story.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (projectFilter !== 'all' && item.project !== projectFilter) return false;
    if (storyFilter !== 'all' && item.story !== storyFilter) return false;
    if (assigneeFilter !== 'all' && item.assignee !== assigneeFilter) return false;
    if (reporterFilter !== 'all' && item.reporter !== reporterFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
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
      'Task Name', 'Project', 'Story', 'Assignee', 'Reporter',
      'Priority', 'Status', 'Estimated Hours', 'Start Date', 'Due Date'
    ];
    const csvRows = [headers.join(',')];

    filteredData.forEach(row => {
      const values = [
        `"${row.name}"`,
        `"${row.project}"`,
        `"${row.story}"`,
        `"${row.assignee}"`,
        `"${row.reporter}"`,
        `"${row.priority}"`,
        `"${row.status}"`,
        row.estimate,
        `"${row.startDate}"`,
        `"${row.dueDate}"`
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'task_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Successfully exported Task Report to XLSX/Excel!');
  };

  const columns = [
    { field: 'name', headerName: 'Task Name', flex: 1.5, minWidth: 120, renderCell: (params) => <strong style={{ color: '#6366f1', fontSize: '0.78rem' }}>{params.value}</strong> },
    { field: 'project', headerName: 'Project', flex: 1, minWidth: 90 },
    { field: 'story', headerName: 'Story', flex: 1, minWidth: 90 },
    {
      field: 'assignee',
      headerName: 'Assignee',
      flex: 1,
      minWidth: 90,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
          <Avatar sx={{ width: 18, height: 18, fontSize: '0.58rem', bgcolor: getAvatarColor(params.value), fontWeight: 'bold', color: '#fff' }}>
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2" fontSize="0.75rem">{params.value}</Typography>
        </Box>
      )
    },
    { field: 'reporter', headerName: 'Reporter', flex: 1, minWidth: 90 },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 85,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={getPriorityColor(params.value)} variant="filled" sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 20 }} />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 95,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={getStatusColor(params.value)} variant="outlined" sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 20 }} />
      )
    },
    { field: 'estimate', headerName: 'Est.Hrs', width: 70, type: 'number', headerAlign: 'center', align: 'center', renderCell: (params) => `${params.value}h` },
    { field: 'startDate', headerName: 'Start', flex: 0.8, minWidth: 85 },
    { field: 'dueDate', headerName: 'Due', flex: 0.8, minWidth: 85 },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Filters Card */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'background.paper', borderRadius: 3 }}>
        <CardContent sx={{ p: '10px' }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5 }}>Task Filter Config</Typography>
          <Grid container spacing={1.5} alignItems="center">
            <Grid xs={12} sm={6} md={4} lg={1.5}>
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
            <Grid xs={12} sm={6} md={4} lg={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Story</InputLabel>
                <Select value={storyFilter} label="Story" onChange={e => setStoryFilter(e.target.value)}>
                  <MenuItem value="all">All Stories</MenuItem>
                  {Array.from(new Set(taskRows.map(r => r.story))).map(storyName => (
                    <MenuItem key={storyName} value={storyName}>{storyName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4} lg={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select value={assigneeFilter} label="Assignee" onChange={e => setAssigneeFilter(e.target.value)}>
                  <MenuItem value="all">All Assignees</MenuItem>
                  {Array.from(new Set(taskRows.map(r => r.assignee))).map(assignee => (
                    <MenuItem key={assignee} value={assignee}>{assignee}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4} lg={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Reporter</InputLabel>
                <Select value={reporterFilter} label="Reporter" onChange={e => setReporterFilter(e.target.value)}>
                  <MenuItem value="all">All Reporters</MenuItem>
                  {Array.from(new Set(taskRows.map(r => r.reporter))).map(reporter => (
                    <MenuItem key={reporter} value={reporter}>{reporter}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4} lg={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={priorityFilter} label="Priority" onChange={e => setPriorityFilter(e.target.value)}>
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4} lg={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Todo">Todo</MenuItem>
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Code Review">Code Review</MenuItem>
                  <MenuItem value="Testing">Testing</MenuItem>
                  <MenuItem value="Deploy">Deploy</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4} lg={1.5}>
              <TextField type="date" label="Due Before" slotProps={{ inputLabel: { shrink: true } }} size="small" fullWidth value={endDate} onChange={e => setEndDate(e.target.value)} />
            </Grid>
            <Grid xs={12} sm={6} md={4} lg={1.5}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search tasks..."
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
          <Typography variant="subtitle2" fontWeight="700">Detailed Task Matrix</Typography>
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
            sx={{
              border: 'none',
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Project</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.project}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Story Link</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.story}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Est. Hours</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.estimate} Hours</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Assignee</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.assignee}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Reporter</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedRow.reporter}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedRow.priority} size="small" color={getPriorityColor(selectedRow.priority)} variant="filled" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedRow.status} size="small" color={getStatusColor(selectedRow.status)} variant="outlined" sx={{ fontWeight: 'bold' }} />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Schedule Details</Typography>
                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <Typography variant="caption" color="text.secondary">Start Date</Typography>
                    <Typography variant="body2" fontWeight="bold">{selectedRow.startDate}</Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="caption" color="text.secondary">Due Date</Typography>
                    <Typography variant="body2" fontWeight="bold">{selectedRow.dueDate}</Typography>
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

export default TaskReport;
