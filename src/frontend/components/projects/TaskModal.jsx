"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useParams } from 'next/navigation';
import {
  Dialog, DialogContent, Box, TextField, FormControl,
  InputLabel, Select, MenuItem, Button, Typography, Autocomplete,
  Chip, Fade, IconButton, Divider, Paper, useTheme, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CreateIcon from '@mui/icons-material/Create';
import { toast } from 'react-hot-toast';


const TASK_STATUS_WORK_MAP = {
  'To Do': ['Not Started', 'Ready', 'Planning', 'Waiting for Requirement', 'Waiting for Client'],
  'Todo': ['Not Started', 'Ready', 'Planning', 'Waiting for Requirement', 'Waiting for Client'],
  'Developing': ['Not Started', 'In Progress', 'On Hold', 'Blocked', 'Developed'],
  'Testing': ['Not Started', 'Testing', 'Failed', 'Passed'],
  'Code Review': ['Not Started', 'Reviewing', 'Failed', 'Passed'],
  'Deploy': ['Not Started', 'Deploying', 'Failed', 'Passed'],
  'Deploying': ['Not Started', 'Deploying', 'Failed', 'Passed'],
  'Done': ['Completed', 'Not Completed']
};

import RichTextEditor, { MOCK_USERS } from '../tasks/RichTextEditor';
import ChatBox from '../tasks/ChatBox';
import ImageLightbox from '../common/ImageLightbox';
import { setAttachments, clearAttachments } from '../../redux/taskSlice';
import { useWorkflow } from '../../context/WorkflowContext';

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
  activeTaskId = null,
  onPartialUpdateTask = null
}) => {
  const dispatch = useDispatch();
  const { company } = useParams();
  const { enabledStages, isStoryEnabled, isTaskEnabled, isBugEnabled, enabledTaskTypes, getWorkStatusesForStage, getDefaultWorkStatusForStage } = useWorkflow();


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
      image_path: '',
      work_status: 'Not Started',
      team_assignment: {
        developer: { user_id: '', user_name: '', estimate_hours: 0 },
        tester: { user_id: '', user_name: '', estimate_hours: 0 },
        code_reviewer: { user_id: '', user_name: '', estimate_hours: 0 },
        deployer: { user_id: '', user_name: '', estimate_hours: 0 }
      }
    }
  });

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [comments, setComments] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [workStatusHistory, setWorkStatusHistory] = useState({});
  const descriptionBackupRef = useRef('');

  const handleStartEditDescription = (val) => {
    descriptionBackupRef.current = val || '';
    setIsEditingDescription(true);
  };

  const handleCancelEditDescription = () => {
    setValue('description', descriptionBackupRef.current);
    setIsEditingDescription(false);
  };

  const resolvedTaskId = activeTaskId || taskForm?._id || taskForm?.id;

  const handleSaveDescriptionToDb = async (e) => {
    if (e) e.preventDefault();
    const currentDescription = getValues('description');
    setValue('description', currentDescription);
    if (setTaskForm) {
      setTaskForm((prev) => ({ ...prev, description: currentDescription }));
    }

    if (resolvedTaskId) {
      if (onPartialUpdateTask) {
        await onPartialUpdateTask(resolvedTaskId, { description: currentDescription });
      } else {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
          const res = await fetch(`${apiBase}/tasks/${resolvedTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: currentDescription })
          });
          if (res.ok) {
            toast.success('Description saved to database!');
          } else {
            toast.error('Failed to update description in database');
          }
        } catch (err) {
          console.error('Error saving description:', err);
          toast.error('Error saving description');
        }
      }
    } else {
      toast.success('Description saved to draft!');
    }

    // Switch back to normal option (preview mode)
    setIsEditingDescription(false);
  };

  const selectedProjectId = watch('project_id');
  const stories = selectedProjectId ? (storiesByProject[selectedProjectId] || []) : [];

  // Reset form values when modal opens or parent form changes
  useEffect(() => {
    if (open) {
      setIsEditingDescription(!taskModalIsEdit);
      setComments(taskForm.comments || []);
      const existingTeam = taskForm.team_assignment || {};
      const team_assignment = {
        developer: {
          user_id: existingTeam.developer?.user_id || '',
          user_name: existingTeam.developer?.user_name || '',
          estimate_hours: existingTeam.developer?.estimate_hours !== undefined ? existingTeam.developer.estimate_hours : 0
        },
        tester: {
          user_id: existingTeam.tester?.user_id || '',
          user_name: existingTeam.tester?.user_name || '',
          estimate_hours: existingTeam.tester?.estimate_hours !== undefined ? existingTeam.tester.estimate_hours : 0
        },
        code_reviewer: {
          user_id: existingTeam.code_reviewer?.user_id || '',
          user_name: existingTeam.code_reviewer?.user_name || '',
          estimate_hours: existingTeam.code_reviewer?.estimate_hours !== undefined ? existingTeam.code_reviewer.estimate_hours : 0
        },
        deployer: {
          user_id: existingTeam.deployer?.user_id || '',
          user_name: existingTeam.deployer?.user_name || '',
          estimate_hours: existingTeam.deployer?.estimate_hours !== undefined ? existingTeam.deployer.estimate_hours : 0
        }
      };

      const initialStatus = taskForm.status || enabledStages[0]?.name || 'Todo';
      let initialWork = taskForm.work_status;
      const validStatuses = (getWorkStatusesForStage(initialStatus) || []).map(ws => ws.name);
      if (!initialWork || (validStatuses.length > 0 && !validStatuses.includes(initialWork))) {
        initialWork = getDefaultWorkStatusForStage(initialStatus) || 'Not Started';
      }


      setWorkStatusHistory({
        [initialStatus]: initialWork
      });

      reset({
        type: taskForm.type || 'Task',
        status: initialStatus,
        work_status: initialWork,
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
        image_path: taskForm.image_path || '',
        team_assignment: team_assignment
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
    const devHours = Math.max(0, parseFloat(data.team_assignment?.developer?.estimate_hours) || 0);
    const testerHours = Math.max(0, parseFloat(data.team_assignment?.tester?.estimate_hours) || 0);
    const crHours = Math.max(0, parseFloat(data.team_assignment?.code_reviewer?.estimate_hours) || 0);
    const depHours = Math.max(0, parseFloat(data.team_assignment?.deployer?.estimate_hours) || 0);
    const totalHours = devHours + testerHours + crHours + depHours;

    // Map values back to the parent format
    const mappedForm = {
      ...taskForm,
      type: data.type,
      status: data.status,
      work_status: data.work_status,
      name: data.name,
      description: data.description,
      estimateHours: totalHours,
      assigned_user: data.team_assignment?.developer?.user_id || data.assigned_user, // Fallback/auto-populate assigned_user with developer user_id
      reporter: data.reporter,
      end_date: data.end_date,
      priority: data.priority,
      labels: data.labels,
      image_path: data.image_path,
      story_id: data.story_id,
      comments: comments,
      team_assignment: {
        developer: {
          user_id: data.team_assignment?.developer?.user_id || null,
          user_name: combinedUsers.find(u => (u._id || u.user_id || u.id) === data.team_assignment?.developer?.user_id)?.name || null,
          estimate_hours: Math.max(0, parseFloat(data.team_assignment?.developer?.estimate_hours) || 0)
        },
        tester: {
          user_id: data.team_assignment?.tester?.user_id || null,
          user_name: combinedUsers.find(u => (u._id || u.user_id || u.id) === data.team_assignment?.tester?.user_id)?.name || null,
          estimate_hours: Math.max(0, parseFloat(data.team_assignment?.tester?.estimate_hours) || 0)
        },
        code_reviewer: {
          user_id: data.team_assignment?.code_reviewer?.user_id || null,
          user_name: combinedUsers.find(u => (u._id || u.user_id || u.id) === data.team_assignment?.code_reviewer?.user_id)?.name || null,
          estimate_hours: Math.max(0, parseFloat(data.team_assignment?.code_reviewer?.estimate_hours) || 0)
        },
        deployer: {
          user_id: data.team_assignment?.deployer?.user_id || null,
          user_name: combinedUsers.find(u => (u._id || u.user_id || u.id) === data.team_assignment?.deployer?.user_id)?.name || null,
          estimate_hours: Math.max(0, parseFloat(data.team_assignment?.deployer?.estimate_hours) || 0)
        }
      }
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
      slots={{ transition: Fade }}
      transitionDuration={350}
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            borderRadius: '16px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 24px 48px rgba(0,0,0,0.6)' : '0 24px 48px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }
        }
      }}
    >
      {open && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'contents' }}>
          {/* HEADER */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c1c1e' : '#f5f5f7'
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

          <DialogContent sx={{ p: 3, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row' }, gap: 3 }}>
              {/* LEFT PANEL (70%) */}
              <Box sx={{ width: { xs: '100%', md: '70%' }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* TASK NAME */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: isDark ? '#ffffff' : '#1d1d1f', fontWeight: '700', mb: 1 }}>
                    Task Name
                  </Typography>
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
                            color: 'text.primary',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1a20' : '#ffffff',
                            borderRadius: '10px',
                            transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
                            '& fieldset': {
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: '10px',
                            },
                            '&:hover fieldset': {
                              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused': {
                              bgcolor: 'background.paper',
                              boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 0 2px rgba(10, 132, 255, 0.22)' : '0 0 0 2px rgba(0, 102, 204, 0.15)',
                            },
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'text.secondary',
                            opacity: 0.7,
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
                </Box>



                {/* TASK DESCRIPTION COLLAPSIBLE EDITOR */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: isDark ? '#ffffff' : '#1d1d1f', fontWeight: '700', mb: 1 }}>
                    Description
                  </Typography>
                  {!isEditingDescription ? (
                    <Box sx={{ position: 'relative', '&:hover .edit-icon-btn': { opacity: 1 } }}>
                      <Box
                        onClick={(e) => {
                          if (e.target && e.target.tagName === 'IMG') {
                            e.stopPropagation();
                            setLightboxImage(e.target.getAttribute('src'));
                          }
                        }}
                        sx={{
                          p: 2,
                          pr: 6,
                          minHeight: '100px',
                          maxHeight: '380px',
                          overflowY: 'auto',
                          borderRadius: '8px',
                          border: '1px solid transparent',
                          cursor: 'default',
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
                          },
                          transition: 'background-color 0.2s, border-color 0.2s',
                          '& .description-preview img': {
                            maxWidth: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            margin: '8px 0',
                            display: 'block',
                            cursor: 'pointer'
                          }
                        }}
                      >
                        {getValues('description') ? (
                          <div
                            className="description-preview"
                            dangerouslySetInnerHTML={{ __html: getValues('description') }}
                            style={{ fontSize: '0.9rem', lineHeight: 1.6 }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            No description provided. Click the edit icon in the top right to add one.
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        className="edit-icon-btn"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditDescription(getValues('description'));
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          opacity: 0.6,
                          transition: 'opacity 0.2s',
                          color: 'text.secondary',
                          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            color: 'text.primary',
                          }
                        }}
                      >
                        <CreateIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box>
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
                            minHeight="220px"
                            maxHeight="380px"
                          />
                        )}
                      />
                      {taskModalIsEdit && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                          <Button
                            type="button"
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={handleSaveDescriptionToDb}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleCancelEditDescription}
                          >
                            Cancel
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>


                {/* WHATSAPP DISCUSSION CHAT */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: isDark ? '#ffffff' : '#1d1d1f', fontWeight: '700', mb: 1 }}>
                    Activity
                  </Typography>
                  <ChatBox activeTaskId={resolvedTaskId} comments={comments} setComments={setComments} />
                </Box>
              </Box>

              {/* RIGHT PANEL (30%) */}
              <Box sx={{ width: { xs: '100%', md: '30%' } }}>
                <Paper
                  elevation={0}
                  sx={{
                    position: 'sticky',
                    top: '0px',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c1c1e' : 'background.paper',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
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

                  <Divider />

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

                  {/* STORY SELECTION — only show if Story level is enabled */}
                  {isStoryEnabled && (
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
                  )}

                  {/* TYPE SELECT — driven by WorkflowContext enabledTaskTypes */}
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
                          {enabledTaskTypes.map((t) => (
                            <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>


                  {/* STATUS SELECT */}
                  <FormControl fullWidth size="small">
                    <InputLabel id="status-select-label">Workflow</InputLabel>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          labelId="status-select-label"
                          label="Workflow"
                          value={field.value === 'Todo' ? 'To Do' : (field.value || 'To Do')}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            const prevStatus = field.value;
                            const currentWork = getValues('work_status');
                            
                            const currentHistory = { ...workStatusHistory, [prevStatus]: currentWork };
                            setWorkStatusHistory(currentHistory);
                            
                            field.onChange(newStatus);
                            
                            const newWork = currentHistory[newStatus] || getDefaultWorkStatusForStage(newStatus);
                            setValue('work_status', newWork);
                          }}
                        >
                          {enabledStages.map((stg) => (
                            <MenuItem key={stg.id} value={stg.name}>{stg.name}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>

                  {/* TASK WORK STATUS */}
                  <FormControl fullWidth size="small">
                    <InputLabel id="work-status-select-label">Work Status</InputLabel>
                    <Controller
                      name="work_status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          labelId="work-status-select-label"
                          label="Work Status"
                          value={field.value || ''}
                          onChange={(e) => {
                            const newWork = e.target.value;
                            field.onChange(newWork);
                            const currentStatus = getValues('status');
                            setWorkStatusHistory(prev => ({
                              ...prev,
                              [currentStatus]: newWork
                            }));
                          }}
                        >
                          {(getWorkStatusesForStage(watch('status') || enabledStages[0]?.name) || []).map((opt) => (
                            <MenuItem key={opt.id || opt.name} value={opt.name}>{opt.name}</MenuItem>
                          ))}
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

                  <Box
                    sx={{
                      p: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: '8px',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: '700', color: 'text.primary', mb: -0.5 }}>
                      Team Assignment
                    </Typography>
                    <Divider />

                    {/* DEVELOPER */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b' }}>
                          Developer
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b' }}>
                          Estimate Hours
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Controller
                          name="team_assignment.developer.user_id"
                          control={control}
                          render={({ field }) => (
                            <Autocomplete
                              options={combinedUsers}
                              size="small"
                              getOptionLabel={(option) => option.name || option.username || ''}
                              value={combinedUsers.find(u => (u._id || u.user_id || u.id) === field.value) || null}
                              onChange={(event, newValue) => {
                                field.onChange(newValue ? (newValue._id || newValue.user_id || newValue.id) : '');
                              }}
                              renderInput={(params) => <TextField {...params} placeholder="User" variant="outlined" />}
                              sx={{ flexGrow: 2, minWidth: 120 }}
                            />
                          )}
                        />
                        <Controller
                          name="team_assignment.developer.estimate_hours"
                          control={control}
                          rules={{ min: { value: 0, message: 'Non-negative' } }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              size="small"
                              placeholder="Hours"
                              type="number"
                              variant="outlined"
                              error={!!error}
                              slotProps={{ htmlInput: { min: 0 } }}
                              sx={{ width: 80 }}
                            />
                          )}
                        />
                      </Box>
                    </Box>

                    {/* TESTER */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b' }}>
                          Tester
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b' }}>
                          Estimate Hours
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Controller
                          name="team_assignment.tester.user_id"
                          control={control}
                          render={({ field }) => (
                            <Autocomplete
                              options={combinedUsers}
                              size="small"
                              getOptionLabel={(option) => option.name || option.username || ''}
                              value={combinedUsers.find(u => (u._id || u.user_id || u.id) === field.value) || null}
                              onChange={(event, newValue) => {
                                field.onChange(newValue ? (newValue._id || newValue.user_id || newValue.id) : '');
                              }}
                              renderInput={(params) => <TextField {...params} placeholder="User" variant="outlined" />}
                              sx={{ flexGrow: 2, minWidth: 120 }}
                            />
                          )}
                        />
                        <Controller
                          name="team_assignment.tester.estimate_hours"
                          control={control}
                          rules={{ min: { value: 0, message: 'Non-negative' } }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              size="small"
                              placeholder="Hours"
                              type="number"
                              variant="outlined"
                              error={!!error}
                              slotProps={{ htmlInput: { min: 0 } }}
                              sx={{ width: 80 }}
                            />
                          )}
                        />
                      </Box>
                    </Box>

                    {/* CODE REVIEWER */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b' }}>
                          Code Reviewer
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b' }}>
                          Estimate Hours
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Controller
                          name="team_assignment.code_reviewer.user_id"
                          control={control}
                          render={({ field }) => (
                            <Autocomplete
                              options={combinedUsers}
                              size="small"
                              getOptionLabel={(option) => option.name || option.username || ''}
                              value={combinedUsers.find(u => (u._id || u.user_id || u.id) === field.value) || null}
                              onChange={(event, newValue) => {
                                field.onChange(newValue ? (newValue._id || newValue.user_id || newValue.id) : '');
                              }}
                              renderInput={(params) => <TextField {...params} placeholder="User" variant="outlined" />}
                              sx={{ flexGrow: 2, minWidth: 120 }}
                            />
                          )}
                        />
                        <Controller
                          name="team_assignment.code_reviewer.estimate_hours"
                          control={control}
                          rules={{ min: { value: 0, message: 'Non-negative' } }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              size="small"
                              placeholder="Hours"
                              type="number"
                              variant="outlined"
                              error={!!error}
                              slotProps={{ htmlInput: { min: 0 } }}
                              sx={{ width: 80 }}
                            />
                          )}
                        />
                      </Box>
                    </Box>

                    {/* DEPLOYER */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b' }}>
                          Deployer
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b' }}>
                          Estimate Hours
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Controller
                          name="team_assignment.deployer.user_id"
                          control={control}
                          render={({ field }) => (
                            <Autocomplete
                              options={combinedUsers}
                              size="small"
                              getOptionLabel={(option) => option.name || option.username || ''}
                              value={combinedUsers.find(u => (u._id || u.user_id || u.id) === field.value) || null}
                              onChange={(event, newValue) => {
                                field.onChange(newValue ? (newValue._id || newValue.user_id || newValue.id) : '');
                              }}
                              renderInput={(params) => <TextField {...params} placeholder="User" variant="outlined" />}
                              sx={{ flexGrow: 2, minWidth: 120 }}
                            />
                          )}
                        />
                        <Controller
                          name="team_assignment.deployer.estimate_hours"
                          control={control}
                          rules={{ min: { value: 0, message: 'Non-negative' } }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              size="small"
                              placeholder="Hours"
                              type="number"
                              variant="outlined"
                              error={!!error}
                              slotProps={{ htmlInput: { min: 0 } }}
                              sx={{ width: 80 }}
                            />
                          )}
                        />
                      </Box>
                    </Box>
                  </Box>

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
                        slotProps={{ inputLabel: { shrink: true } }}
                        variant="outlined"
                      />
                    )}
                  />
                </Paper>
              </Box>
            </Box>
          </DialogContent>
        </form>
      )}
      <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
    </Dialog>
  );
};

export default TaskModal;
