import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Card, CardContent, Grid, FormControl, InputLabel,
  Select, MenuItem, TextField, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, AvatarGroup, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-hot-toast';
import { getAvatarColor } from '../../utils/projectsHelper';
import { useWorkflow } from '../../context/WorkflowContext';

const TaskReport = ({ projects = [], storiesByProject = {}, tasksByStory = {}, users = [] }) => {
  const { company } = useParams();
  const router = useRouter();
  const { enabledStages, isStoryEnabled } = useWorkflow();
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
      case 'Developing':
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

  const getWorkflowColor = (workStatus) => {
    switch (workStatus) {
      case 'Passed':
      case 'Completed': return 'success';
      case 'Reviewing':
      case 'In Progress': return 'primary';
      case 'Failed': return 'error';
      case 'Not Started': return 'default';
      default: return 'info';
    }
  };

  // Convert raw DB tasks into flat list of rows
  const taskRows = [];
  projects.forEach(proj => {
    const projStories = storiesByProject[proj._id] || [];
    projStories.forEach(s => {
      const storyTasks = tasksByStory[s._id] || [];
      storyTasks.forEach(t => {
        const repUser = users.find(u => (u._id || u.user_id) === t.reporter);

        // Resolve all team assignees
        const teamUsers = [];
        const addTeamUser = (userId, role) => {
          if (!userId) return;
          const u = users.find(x => (x._id || x.user_id || x.id)?.toString() === userId.toString());
          if (!u) return;
          const id = u._id || u.user_id || u.id;
          const existing = teamUsers.find(x => (x._id || x.user_id || x.id)?.toString() === id.toString());
          if (existing) {
            if (!existing.roles.includes(role)) {
              existing.roles.push(role);
            }
          } else {
            teamUsers.push({ ...u, roles: [role] });
          }
        };

        if (t.team_assignment) {
          addTeamUser(t.team_assignment.developer?.user_id, 'Developer');
          addTeamUser(t.team_assignment.tester?.user_id, 'Tester');
          addTeamUser(t.team_assignment.code_reviewer?.user_id, 'Code Reviewer');
          addTeamUser(t.team_assignment.deployer?.user_id, 'Deployer');
        } else if (t.assigned_user) {
          addTeamUser(t.assigned_user, 'Assignee');
        }

        const assigneeStr = teamUsers.map(tu => `${tu.name} (${tu.roles.join(', ')})`).join(', ') || '-';

        // Use local date methods to avoid UTC timezone shift (e.g. UTC+5:30 offset)
        const startStr = t.created_at ? (() => { const d = new Date(t.created_at); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })() : '-';
        const dueStr   = t.end_date   ? String(t.end_date).substring(0, 10) : '-';

        taskRows.push({
          id: t._id,
          name: t.name,
          project: proj.name,
          story: s.name,
          assignee: assigneeStr,
          assignees: teamUsers,
          reporter: repUser ? repUser.name : '-',
          priority: t.priority || 'Medium',
          status: t.status || 'To Do',
          workStatus: t.work_status || 'Not Started',
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
      'Priority', 'Workflow', 'Work Status', 'Estimated Hours', 'Start Date', 'Due Date'
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
        `"${row.workStatus}"`,
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
    {
      field: 'name',
      headerName: 'Task Name',
      flex: 1.5,
      minWidth: 120,
      renderCell: (params) => (
        <strong
          style={{ color: '#6366f1', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/${company}/tasks?taskId=${params.row.id}`);
          }}
        >
          {params.value}
        </strong>
      )
    },
    { field: 'project', headerName: 'Project', flex: 1, minWidth: 90 },
    { field: 'story', headerName: 'Story', flex: 1, minWidth: 90 },
    {
      field: 'assignee',
      headerName: 'Assignee',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => {
        const team = params.row.assignees || [];
        if (team.length === 0) return <Typography variant="body2" fontSize="0.75rem" color="text.secondary">-</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '0.62rem', border: '1px solid rgba(255,255,255,0.1)' } }}>
              {team.map((u) => (
                <Tooltip key={u._id || u.user_id || u.id} title={`${u.name} (${u.roles.join(', ')})`} arrow>
                  <Avatar sx={{ bgcolor: getAvatarColor(u.name), fontWeight: 'bold', color: '#fff' }}>
                    {u.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
            {team.length === 1 && (
              <Typography variant="body2" fontSize="0.75rem">{team[0].name}</Typography>
            )}
          </Box>
        );
      }
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
      headerName: 'Workflow',
      width: 95,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={getStatusColor(params.value)} variant="outlined" sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 20 }} />
      )
    },
    {
      field: 'workStatus',
      headerName: 'Work Status',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={getWorkflowColor(params.value)} variant="filled" sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 20 }} />
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
          <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
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
                  {enabledStages.map(stg => (
                    <MenuItem key={stg.id} value={stg.name}>{stg.name}</MenuItem>
                  ))}
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
                  <Typography variant="caption" color="text.secondary">Workflow</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedRow.status} size="small" color={getStatusColor(selectedRow.status)} variant="outlined" sx={{ fontWeight: 'bold' }} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Work Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedRow.workStatus} size="small" color={getWorkflowColor(selectedRow.workStatus)} variant="filled" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} />
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
