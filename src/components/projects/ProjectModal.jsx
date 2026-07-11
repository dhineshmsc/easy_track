import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const ProjectModal = ({ open, onClose, editModal, projectForm, setProjectForm, onSave }) => {
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectModal;
