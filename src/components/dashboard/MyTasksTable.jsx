import React from 'react';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const tasks = [
  { id: 1, title: 'Implement Dashboard UI', priority: 'High', status: 'In Progress', due: 'Today' },
  { id: 2, title: 'Fix Login Bug', priority: 'Critical', status: 'Pending', due: 'Tomorrow' },
  { id: 3, title: 'Update User Schema', priority: 'Medium', status: 'Completed', due: 'Oct 12' },
  { id: 4, title: 'Write API Docs', priority: 'Low', status: 'Pending', due: 'Oct 15' },
];

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Critical': return 'error';
    case 'High': return 'warning';
    case 'Medium': return 'info';
    case 'Low': return 'success';
    default: return 'default';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'In Progress': return 'primary';
    case 'Pending': return 'default';
    default: return 'default';
  }
};

const MyTasksTable = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, overflow: 'hidden' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        My Tasks
      </Typography>
      <TableContainer>
        <Table sx={{ minWidth: 500 }} aria-label="tasks table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Task</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Priority</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" sx={{ fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {task.title}
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Chip label={task.priority} color={getPriorityColor(task.priority)} size="small" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} />
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Chip label={task.status} color={getStatusColor(task.status)} variant="outlined" size="small" />
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'text.secondary' }}>
                  {task.due}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MyTasksTable;
