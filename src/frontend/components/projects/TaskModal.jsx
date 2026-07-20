"use client";
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useParams } from 'next/navigation';
import {
  Dialog, DialogContent, Box, TextField, FormControl,
  InputLabel, Select, MenuItem, Button, Typography, Autocomplete,
  Chip, Fade, IconButton, Divider, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CreateIcon from '@mui/icons-material/Create';

import RichTextEditor, { MOCK_USERS } from '../tasks/RichTextEditor';
import ChatBox from '../tasks/ChatBox';
import { setAttachments, clearAttachments } from '../../redux/taskSlice';

const TaskModal = ({
  open,
  onClose,
  taskModalIsEdit,
  activeStoryId,
  setActiveStoryId,
  activeProjectId,
  setActiveProjectId,
  storiesByProject = {},
  taskForm,
  setTaskForm,
  users = [],
  onSave,
  projects = [],
  showProjectSelect = false,
  activeTaskId = null
}) => {
  const dispatch = useDispatch();
  const { company } = useParams();

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      type: 'Task',
      status: 'To Do',
      name: '',
      description: '',
      estimateHours: 0,
      assigned_user: '',
      reporter: '',
      end_date: '',
      priority: 'Medium',
      project_id: '',
      story_id: '',
      labels: [],
      image_path: ''
    }
  });

  const selectedProjectId = watch('project_id');
  const stories = selectedProjectId ? (storiesByProject[selectedProjectId] || []) : [];

  // Reset form values when modal opens or parent form changes
  useEffect(() => {
    if (open) {
      reset({
        type: taskForm.type || 'Task',
        status: taskForm.status || 'To Do',
        name: taskForm.name || '',
        description: taskForm.description || '',
        estimateHours: taskForm.estimateHours || 0,
        assigned_user: taskForm.assigned_user || '',
        reporter: taskForm.reporter || '',
        end_date: taskForm.end_date ? taskForm.end_date.substring(0, 10) : '',
        priority: taskForm.priority || 'Medium',
        project_id: activeProjectId || '',
        story_id: activeStoryId || '',
        labels: taskForm.labels || [],
        image_path: taskForm.image_path || ''
      });

      // Load initial attachments for edit or clear for create
      if (taskModalIsEdit) {
        dispatch(setAttachments([
          { id: 'att-1', name: 'requirements_doc.pdf', size: 1024 * 1250, type: 'application/pdf', url: '#' },
          { id: 'att-2', name: 'ui_mockups_v2.png', size: 1024 * 840, type: 'image/png', url: '#' }
        ]));
      } else {
        dispatch(clearAttachments());
      }
    }
  }, [open, taskForm, activeProjectId, activeStoryId, reset, taskModalIsEdit, dispatch]);

  // Handle Project Change to sync stories dropdown
  const handleProjectChange = (projId) => {
    setValue('project_id', projId);
    setValue('story_id', ''); // Reset story selection
    if (setActiveProjectId) {
      setActiveProjectId(projId);
    }
    if (setActiveStoryId) {
      setActiveStoryId('');
    }
  };

  // Submission handler
  const onSubmit = (data) => {
    // Map values back to the parent format
    const mappedForm = {
      ...taskForm,
      type: data.type,
      status: data.status,
      name: data.name,
      description: data.description,
      estimateHours: data.estimateHours,
      assigned_user: data.assigned_user,
      reporter: data.reporter,
      end_date: data.end_date,
      priority: data.priority,
      labels: data.labels,
      image_path: data.image_path,
      story_id: data.story_id
    };

    setTaskForm(mappedForm);

    if (setActiveStoryId && data.story_id) {
      setActiveStoryId(data.story_id);
    }
    if (setActiveProjectId && data.project_id) {
      setActiveProjectId(data.project_id);
    }

    // Trigger parent save callback immediately with the mapped form data
    if (onSave) {
      onSave(mappedForm);
    }
  };

  // Merge local static mock users with parent users list if needed
  const combinedUsers = users.length > 0 ? users : MOCK_USERS;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="body"
      TransitionComponent={Fade}
      transitionDuration={350}
      PaperProps={{
        sx: {
          bgcolor: '#141418',
          backgroundImage: 'none',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
          overflow: 'hidden'
        }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'contents' }}>
      {/* HEADER */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        bgcolor: '#1c1c1e'
      }}>
        <Typography variant="h6" sx={{ fontWeight: '700', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
          {taskModalIsEdit ? 'Edit Task' : 'Create Task / Bug'}
          <Chip
            label={watch('type') || 'Task'}
            size="small"
            color={watch('type') === 'Bug' ? 'error' : 'primary'}
            sx={{ fontWeight: 'bold' }}
          />
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            type="submit"
            variant="contained"
            size="small"
            color={watch('type') === 'Bug' ? 'error' : 'primary'}
            startIcon={taskModalIsEdit ? <SaveIcon /> : <CreateIcon />}
            sx={{ textTransform: 'none', height: '32px' }}
          >
            {taskModalIsEdit ? 'Save' : 'Create'}
          </Button>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#0c0c0e' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row' }, gap: 3 }}>
            {/* LEFT PANEL (70%) */}
            <Box sx={{ width: { xs: '100%', md: '70%' }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* TASK NAME */}
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Task Name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    placeholder="Task Name *"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    slotProps={{
                      htmlInput: {
                        style: {
                          padding: '14px 16px',
                        }
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#ffffff',
                        bgcolor: '#1a1a20',
                        borderRadius: '10px',
                        transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
                        '& fieldset': {
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0a84ff',
                        },
                        '&.Mui-focused': {
                          bgcolor: '#141418',
                          boxShadow: '0 0 0 2px rgba(10, 132, 255, 0.22)',
                        },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255,255,255,0.3)',
                        opacity: 1,
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'error.main',
                        mx: 1,
                        mt: 0.5,
                      }
                    }}
                  />
                )}
              />



              {/* TASK DESCRIPTION RICH TEXT EDITOR */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: '600', mb: 1 }}>
                  Description
                </Typography>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write task content here... Mention teammates using @name"
                      company={company}
                      onImageUpload={(path) => {
                        const cur = getValues('image_path');
                        setValue('image_path', cur ? cur + ',' + path : path);
                      }}
                    />
                  )}
                />
              </Box>

              {/* WHATSAPP DISCUSSION CHAT */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: '600', mb: 1 }}>
                  Activity
                </Typography>
                <ChatBox activeTaskId={activeTaskId} />
              </Box>
            </Box>

            {/* RIGHT PANEL (30%) */}
            <Box sx={{ width: { xs: '100%', md: '30%' } }}>
              <Paper
                elevation={0}
                sx={{
                  position: 'sticky',
                  top: '0px',
                  bgcolor: '#1c1c1e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                  height: 'fit-content'
                }}
              >


                <Typography variant="subtitle1" sx={{ fontWeight: '700', color: 'text.primary', mb: -0.5 }}>
                  Task Properties
                </Typography>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                {/* PROJECT SELECTION */}
                {showProjectSelect && (
                  <FormControl fullWidth size="small">
                    <InputLabel id="project-select-label">Project</InputLabel>
                    <Controller
                      name="project_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          labelId="project-select-label"
                          label="Project"
                          value={field.value}
                          onChange={(e) => handleProjectChange(e.target.value)}
                        >
                          <MenuItem value=""><em>None</em></MenuItem>
                          {projects.map((p) => (
                            <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                )}

                {/* STORY SELECTION */}
                <FormControl fullWidth size="small">
                  <InputLabel id="story-select-label">Parent Story</InputLabel>
                  <Controller
                    name="story_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        labelId="story-select-label"
                        label="Parent Story"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={!selectedProjectId}
                      >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {stories.map((s) => (
                          <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>

                {/* TYPE SELECT */}
                <FormControl fullWidth size="small">
                  <InputLabel id="type-select-label">Type</InputLabel>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        labelId="type-select-label"
                        label="Type"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <MenuItem value="Task">Task</MenuItem>
                        <MenuItem value="Bug">Bug</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>

                {/* STATUS SELECT */}
                <FormControl fullWidth size="small">
                  <InputLabel id="status-select-label">Task Status</InputLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        labelId="status-select-label"
                        label="Task Status"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <MenuItem value="Todo">Todo</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Testing">Testing</MenuItem>
                        <MenuItem value="Done">Done</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>

                {/* PRIORITY SELECT */}
                <FormControl fullWidth size="small">
                  <InputLabel id="priority-select-label">Priority</InputLabel>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select
                        labelId="priority-select-label"
                        label="Priority"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Critical">Critical</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>

                {/* ASSIGNEE SEARCHABLE DROP-DOWN */}
                <Controller
                  name="assigned_user"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={combinedUsers}
                      size="small"
                      getOptionLabel={(option) => option.name || option.username || ''}
                      value={combinedUsers.find(u => (u._id || u.user_id) === field.value) || null}
                      onChange={(event, newValue) => {
                        field.onChange(newValue ? (newValue._id || newValue.user_id) : '');
                      }}
                      renderInput={(params) => <TextField {...params} label="Assignee" variant="outlined" />}
                    />
                  )}
                />

                {/* REPORTER SEARCHABLE DROP-DOWN */}
                <Controller
                  name="reporter"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={combinedUsers}
                      size="small"
                      getOptionLabel={(option) => option.name || option.username || ''}
                      value={combinedUsers.find(u => (u._id || u.user_id) === field.value) || null}
                      onChange={(event, newValue) => {
                        field.onChange(newValue ? (newValue._id || newValue.user_id) : '');
                      }}
                      renderInput={(params) => <TextField {...params} label="Reporter" variant="outlined" />}
                    />
                  )}
                />

                {/* ESTIMATED HOURS */}
                <Controller
                  name="estimateHours"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Estimated Hours"
                      type="number"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />

                {/* DUE DATE */}
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Due Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  )}
                />
              </Paper>
            </Box>
          </Box>
      </DialogContent>
      </form>
    </Dialog>
  );
};

export default TaskModal;
