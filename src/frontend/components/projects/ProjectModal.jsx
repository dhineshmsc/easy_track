"use client";
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField,
  FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';

const ProjectModal = ({ open, onClose, editModal, projectForm, setProjectForm, onSave, users = [] }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editModal ? 'Edit Project' : 'Create Project'}</DialogTitle>
      <DialogContent sx={{ minWidth: 400 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          fullWidth
          value={projectForm.name}
          onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={projectForm.description}
          onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <TextField
            margin="dense"
            label="Estimated Hours"
            type="number"
            fullWidth
            value={projectForm.estimate_hours}
            onChange={e => setProjectForm({ ...projectForm, estimate_hours: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            className={projectForm.end_date ? "" : "empty-date-input"}
            onFocus={(e) => {
              if (typeof e.target.showPicker === "function") {
                try {
                  e.target.showPicker();
                } catch (err) {}
              }
            }}
            onClick={(e) => {
              if (typeof e.target.showPicker === "function") {
                try {
                  e.target.showPicker();
                } catch (err) {}
              }
            }}
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={projectForm.end_date || ''}
            onChange={e => setProjectForm({ ...projectForm, end_date: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={projectForm.priority}
              label="Priority"
              onChange={e => setProjectForm({ ...projectForm, priority: e.target.value })}
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
            <InputLabel>Assignees</InputLabel>
            <Select
              multiple
              value={projectForm.assigned_user || []}
              label="Assignees"
              onChange={e => setProjectForm({ ...projectForm, assigned_user: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
              renderValue={(selected) => selected.map(id => users.find(u => (u._id || u.user_id) === id)?.name || id).join(', ')}
            >
              {users.map(u => <MenuItem key={u._id || u.user_id} value={u._id || u.user_id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Reporter</InputLabel>
            <Select
              value={projectForm.reporter}
              label="Reporter"
              onChange={e => setProjectForm({ ...projectForm, reporter: e.target.value })}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {users.map(u => <MenuItem key={u._id} value={u._id || u.user_id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={projectForm.status || 'Not Started'}
              label="Status"
              onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
            >
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="Planning">Planning</MenuItem>
              <MenuItem value="Developing">Developing</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="Testing">Testing</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
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

export default ProjectModal;
