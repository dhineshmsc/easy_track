import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField,
  FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';

const TaskModal = ({
  open, onClose, taskModalIsEdit, activeStoryId, setActiveStoryId,
  activeProjectId, setActiveProjectId, storiesByProject = {}, taskForm, setTaskForm,
  users = [], onSave, projects = [], showProjectSelect = false
}) => {
  const stories = activeProjectId ? (storiesByProject[activeProjectId] || []) : [];

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{taskModalIsEdit ? 'Edit Task' : 'Create Task/Bug'}</DialogTitle>
      <DialogContent sx={{ minWidth: 400 }}>
        {showProjectSelect && (
          <FormControl fullWidth margin="dense" sx={{ mb: 1 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={activeProjectId || ''}
              label="Project"
              onChange={e => {
                setActiveProjectId(e.target.value);
                setActiveStoryId(''); // Reset story selection
              }}
            >
              {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        <FormControl fullWidth margin="dense" sx={{ mb: 1 }}>
          <InputLabel>Parent Story</InputLabel>
          <Select
            value={activeStoryId || ''}
            label="Parent Story"
            onChange={e => setActiveStoryId(e.target.value)}
          >
            {stories.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={taskForm.type}
              label="Type"
              onChange={e => setTaskForm({ ...taskForm, type: e.target.value })}
            >
              <MenuItem value="Task">Task</MenuItem>
              <MenuItem value="Bug">Bug</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={taskForm.status || 'To Do'}
              label="Status"
              onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Code Review">Code Review</MenuItem>
              <MenuItem value="Testing">Testing</MenuItem>
              <MenuItem value="Deploy">Deploy</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TextField
          margin="dense"
          label="Name"
          fullWidth
          value={taskForm.name}
          onChange={e => setTaskForm({ ...taskForm, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={taskForm.description}
          onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <TextField
            margin="dense"
            label="Estimated Hours"
            type="number"
            fullWidth
            value={taskForm.estimateHours}
            onChange={e => setTaskForm({ ...taskForm, estimateHours: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={taskForm.end_date}
            onChange={e => setTaskForm({ ...taskForm, end_date: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={taskForm.priority}
              label="Priority"
              onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Assignee</InputLabel>
            <Select
              value={taskForm.assigned_user}
              label="Assignee"
              onChange={e => setTaskForm({ ...taskForm, assigned_user: e.target.value })}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {users.map(u => <MenuItem key={u._id} value={u._id || u.user_id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Reporter</InputLabel>
            <Select
              value={taskForm.reporter}
              label="Reporter"
              onChange={e => setTaskForm({ ...taskForm, reporter: e.target.value })}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {users.map(u => <MenuItem key={u._id} value={u._id || u.user_id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;
