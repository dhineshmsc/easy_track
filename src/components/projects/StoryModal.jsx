import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField,
  FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';

const StoryModal = ({
  open, onClose, storyModalIsEdit, activeProjectId, setActiveProjectId,
  storyForm, setStoryForm, projects = [], users = [], onSave
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{storyModalIsEdit ? 'Edit Story' : 'Create Story'}</DialogTitle>
      <DialogContent sx={{ minWidth: 400 }}>
        <FormControl fullWidth margin="dense" sx={{ mb: 1 }}>
          <InputLabel>Parent Project</InputLabel>
          <Select
            value={activeProjectId || ''}
            label="Parent Project"
            onChange={e => setActiveProjectId(e.target.value)}
          >
            {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          autoFocus
          margin="dense"
          label="Story Name"
          fullWidth
          value={storyForm.name}
          onChange={e => setStoryForm({ ...storyForm, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={storyForm.description}
          onChange={e => setStoryForm({ ...storyForm, description: e.target.value })}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <TextField
            margin="dense"
            label="Estimated Hours"
            type="number"
            fullWidth
            value={storyForm.estimate_hours}
            onChange={e => setStoryForm({ ...storyForm, estimate_hours: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={storyForm.end_date}
            onChange={e => setStoryForm({ ...storyForm, end_date: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={storyForm.priority}
              label="Priority"
              onChange={e => setStoryForm({ ...storyForm, priority: e.target.value })}
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
              value={storyForm.assigned_user}
              label="Assignee"
              onChange={e => setStoryForm({ ...storyForm, assigned_user: e.target.value })}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {users.map(u => <MenuItem key={u._id} value={u._id || u.user_id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Reporter</InputLabel>
            <Select
              value={storyForm.reporter}
              label="Reporter"
              onChange={e => setStoryForm({ ...storyForm, reporter: e.target.value })}
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

export default StoryModal;
