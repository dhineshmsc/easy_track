import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';

const getStatusColor = (status) => {
  const norm = String(status || '').trim().toLowerCase();
  if (norm === 'done' || norm === 'completed') return 'success';
  if (norm === 'developing' || norm === 'in progress') return 'primary';
  if (norm === 'testing' || norm === 'code review' || norm === 'deploy') return 'warning';
  return 'default';
};

const RunningStatusTable = ({ tasks = [], users = [], stories = [] }) => {
  const router = useRouter();
  const { company } = useParams();

  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aHasDate = !!a.end_date;
      const bHasDate = !!b.end_date;
      if (aHasDate && bHasDate) {
        return new Date(b.end_date) - new Date(a.end_date);
      }
      if (aHasDate) return -1;
      if (bHasDate) return 1;
      return 0;
    });
  }, [tasks]);

  // Filter tasks with running/active work statuses: In progress, Reviewing/Code Review, Testing, Deploying/Deploy
  const runningTasks = React.useMemo(() => {
    return sortedTasks.filter(task => {
      const wStatus = String(task.work_status || '').trim().toLowerCase();
      return wStatus === 'in progress' ||
             wStatus === 'reviewing' ||
             wStatus === 'code review' ||
             wStatus === 'testing' ||
             wStatus === 'deploying' ||
             wStatus === 'deploy';
    });
  }, [sortedTasks]);

  const getAssigneeName = (assignedUserId) => {
    if (!assignedUserId) return 'Unassigned';
    const u = users.find(x => String(x._id || x.user_id || x.id) === String(assignedUserId));
    return u ? u.name : 'Unknown';
  };

  const getReporterName = (reporterId) => {
    if (!reporterId) return 'System';
    const u = users.find(x => String(x._id || x.user_id || x.id) === String(reporterId));
    return u ? u.name : reporterId;
  };

  const getStoryDetails = (storyId, priority) => {
    const s = stories.find(x => x._id === storyId);
    const storyName = s ? s.name : 'No Story';
    return `${storyName} | ${priority || 'Medium'}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isOverdue = (task) => {
    const isDone = String(task.status || '').trim().toLowerCase() === 'done';
    if (isDone) return false;
    if (!task.end_date) return false;
    return new Date(task.end_date) < new Date();
  };


  const cellStyle = {
    padding: '6px 12px',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    '&:last-child': { borderRight: 'none' }
  };

  const headerCellStyle = {
    ...cellStyle,
    color: 'text.secondary',
    fontWeight: 'bold',
    bgcolor: 'background.paper',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 3, overflow: 'hidden' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
        Running Status
      </Typography>
      <TableContainer sx={{ 
        maxHeight: 330, 
        overflowY: 'auto',
        overflowX: 'auto',
        /* High-visibility grey scrollbar visible on both light/dark themes */
        '&::-webkit-scrollbar': { width: '8px', height: '8px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { 
          background: 'rgba(128, 128, 128, 0.4)', 
          borderRadius: '10px'
        },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(128, 128, 128, 0.6)' }
      }}>
        <Table sx={{ minWidth: 1100, borderCollapse: 'collapse' }} aria-label="running status table" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellStyle}>Task_ID</TableCell>
              <TableCell sx={headerCellStyle}>User</TableCell>
              <TableCell sx={headerCellStyle}>Task</TableCell>
              <TableCell sx={headerCellStyle}>Story | Priority</TableCell>
              <TableCell sx={headerCellStyle}>Status</TableCell>
              <TableCell sx={headerCellStyle}>Start Date | Due Date</TableCell>
              <TableCell sx={headerCellStyle}>Est.Hours</TableCell>
              <TableCell sx={headerCellStyle}>Reporter</TableCell>
              <TableCell align="right" sx={headerCellStyle}>Overdue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runningTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  No active/running tasks in progress
                </TableCell>
              </TableRow>
            ) : (
              runningTasks.map((task, index) => (
                <TableRow 
                  hover
                  key={task._id || task.id} 
                  onClick={() => router.push(`/${company}/tasks?taskId=${task._id}`)}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&.MuiTableRow-hover:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ 
                    ...cellStyle, 
                    fontWeight: 'bold'
                  }}>
                    {task.custom_id ? String(task.custom_id).toUpperCase() : (task.t_seq !== undefined && task.t_seq !== null ? `T${task.t_seq}` : index + 1)}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {getAssigneeName(task.assigned_user)}
                  </TableCell>
                  <TableCell sx={{ ...cellStyle, fontWeight: 500 }}>
                    {task.name}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {getStoryDetails(task.story_id, task.priority)}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    <Chip label={task.work_status || 'Not Started'} color={getStatusColor(task.work_status)} variant="outlined" size="small" />
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {formatDate(task.created_at)} | {formatDate(task.end_date)}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {task.estimate_hours !== undefined ? task.estimate_hours : 0} hrs
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {getReporterName(task.reporter)}
                  </TableCell>
                  <TableCell align="right" sx={cellStyle}>
                    {isOverdue(task) ? (
                      <Chip label="Yes" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                    ) : (
                      <Chip label="No" size="small" variant="outlined" sx={{ color: 'text.secondary' }} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RunningStatusTable;
