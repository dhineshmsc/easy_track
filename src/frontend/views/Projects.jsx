"use client";
import React, { useState } from 'react';
import {
  Box, CssBaseline, Typography, IconButton, Paper, Tooltip, TextField,
  FormControl, InputLabel, Select, MenuItem, Button, InputAdornment, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';

import { useProjectData } from '../hooks/useProjectData';
import { priorityColor, statusColor, getUserInitials, getAvatarColor } from '../utils/projectsHelper';

import ProjectModal from '../components/projects/ProjectModal';
import StoryModal from '../components/projects/StoryModal';
import TaskModal from '../components/projects/TaskModal';
import { useWorkflow } from '../context/WorkflowContext';

const Projects = () => {
  const { isStoryEnabled, enabledStages } = useWorkflow();
  const {
    company, username, projects, storiesByProject, tasksByStory, users,
    openModal, setOpenModal, editModal, setEditModal, editProjectId, setEditProjectId, projectForm, setProjectForm, handleSaveProject, handleDeleteProject, handlePartialUpdateProject,
    storyModalOpen, setStoryModalOpen, storyModalIsEdit, setStoryModalIsEdit, activeStoryId, setActiveStoryId, activeProjectId, setActiveProjectId, storyForm, setStoryForm, handleSaveStory, handleDeleteStory,
    taskModalOpen, setTaskModalOpen, taskModalIsEdit, setTaskModalIsEdit, activeTaskId, setActiveTaskId, taskForm, setTaskForm, handleSaveTask, handleDeleteTask, handlePartialUpdateTask, handlePartialUpdateStory
  } = useProjectData();


  // Filter states
  const [filterProject, setFilterProject] = useState('all');
  const [filterStory, setFilterStory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssignees, setFilterAssignees] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskValue, setEditingTaskValue] = useState("");
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [editingStoryValue, setEditingStoryValue] = useState("");
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectValue, setEditingProjectValue] = useState("");
  const [collapsedProjects, setCollapsedProjects] = useState({});
  const [collapsedStories, setCollapsedStories] = useState({});

  const toggleProjectCollapse = (id) => {
    setCollapsedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStoryCollapse = (id) => {
    setCollapsedStories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getFilteredTasksForStory = (storyId) => {
    const tasks = tasksByStory[storyId] || [];
    return tasks.filter(task => {
      if (filterAssignees.length > 0 && !filterAssignees.includes(task.assigned_user)) return false;
      if (filterStatus !== 'all') {
        const tStatus = (task.status || '').toLowerCase().trim();
        const targetStatus = filterStatus.toLowerCase().trim();
        if (targetStatus === 'todo' || targetStatus === 'to do') {
          if (tStatus !== 'todo' && tStatus !== 'to do') return false;
        } else if (tStatus !== targetStatus) {
          return false;
        }
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchT = (task.name || '').toLowerCase().includes(q) || (task.custom_id || '').toLowerCase().includes(q) || (task.description || '').toLowerCase().includes(q);
        if (!matchT) return false;
      }
      return true;
    });
  };

  const getFilteredStoriesForProject = (projId) => {
    const stories = storiesByProject[projId] || [];
    return stories.filter(story => {
      if (filterStory !== 'all' && story._id !== filterStory) return false;

      if (filterAssignees.length > 0) {
        const sAssignees = Array.isArray(story.assigned_user) ? story.assigned_user : (story.assigned_user ? [story.assigned_user] : []);
        const hasAssignee = sAssignees.some(id => filterAssignees.includes(id));
        if (!hasAssignee) {
          const tasks = getFilteredTasksForStory(story._id);
          if (tasks.length === 0) return false;
        }
      }

      if (filterStatus !== 'all') {
        const sStatus = (story.status || '').toLowerCase().trim();
        const matchS = sStatus === filterStatus.toLowerCase().trim();
        if (!matchS) {
          const tasks = getFilteredTasksForStory(story._id);
          if (tasks.length === 0) return false;
        }
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchS = (story.name || '').toLowerCase().includes(q) || (story.custom_id || '').toLowerCase().includes(q) || (story.description || '').toLowerCase().includes(q);
        if (!matchS) {
          const tasks = getFilteredTasksForStory(story._id);
          if (tasks.length === 0) return false;
        }
      }

      return true;
    });
  };

  const filteredProjects = projects.filter(proj => {
    if (filterProject !== 'all' && proj._id !== filterProject) return false;

    if (filterAssignees.length > 0) {
      const pAssignees = Array.isArray(proj.assigned_user) ? proj.assigned_user : (proj.assigned_user ? [proj.assigned_user] : []);
      if (!pAssignees.some(id => filterAssignees.includes(id))) {
        const stories = getFilteredStoriesForProject(proj._id);
        if (stories.length === 0) return false;
      }
    }

    if (filterStatus !== 'all') {
      const pStatus = (proj.status || '').toLowerCase().trim();
      const matchP = pStatus === filterStatus.toLowerCase().trim();
      if (!matchP) {
        const stories = getFilteredStoriesForProject(proj._id);
        if (stories.length === 0) return false;
      }
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchP = (proj.name || '').toLowerCase().includes(q) || (proj.custom_id || '').toLowerCase().includes(q) || (proj.description || '').toLowerCase().includes(q);
      if (!matchP) {
        const stories = getFilteredStoriesForProject(proj._id);
        if (stories.length === 0) return false;
      }
    }

    return true;
  });

  const filteredStoriesCount = filteredProjects.reduce((sum, proj) => {
    return sum + getFilteredStoriesForProject(proj._id).length;
  }, 0);

  const filteredTasksCount = filteredProjects.reduce((sum, proj) => {
    const stories = getFilteredStoriesForProject(proj._id);
    return sum + stories.reduce((sSum, story) => {
      return sSum + getFilteredTasksForStory(story._id).length;
    }, 0);
  }, 0);

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Sidebar company={company} activeMenu="Projects" />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />

          {/* PAGE HEADER + FILTER CONTROLS (Tasks-dashboard style) */}
          <Box sx={{
            p: '10px 16px',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            flexShrink: 0
          }}>
            {/* Left: title */}
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary', letterSpacing: -0.5 }}>Board</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>Project · Story · Task overview</Typography>
            </Box>

            {/* Right: filter controls */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>

              {/* Assignee avatar multi-select */}
              {users.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, borderRight: '1px solid', borderColor: 'divider', pr: 2, py: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mr: 0.5 }}>Assignee:</Typography>
                  {users.map(user => {
                    const userId = user._id || user.user_id;
                    const isSelected = filterAssignees.includes(userId);
                    return (
                      <Tooltip key={userId} title={user.name} arrow>
                        <Avatar
                          onClick={() => {
                            setFilterAssignees(prev =>
                              prev.includes(userId)
                                ? prev.filter(id => id !== userId)
                                : [...prev, userId]
                            );
                          }}
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: '0.75rem',
                            bgcolor: getAvatarColor(user.name),
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: isSelected ? '2px solid #6366f1' : '2px solid transparent',
                            boxShadow: isSelected ? '0 0 6px rgba(99,102,241,0.5)' : 'none',
                            opacity: filterAssignees.length > 0 && !isSelected ? 0.4 : 1,
                            '&:hover': { opacity: 1, transform: 'scale(1.12)' }
                          }}
                        >
                          {getUserInitials(userId, users)}
                        </Avatar>
                      </Tooltip>
                    );
                  })}
                </Box>
              )}

              {/* Search */}
              <TextField
                size="small"
                placeholder="Search by ID, name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  width: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc'
                  }
                }}
              />

              {/* Project Filter */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={filterProject}
                  label="Project"
                  onChange={e => { setFilterProject(e.target.value); setFilterStory('all'); }}
                  sx={{ borderRadius: '8px', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc' }}
                >
                  <MenuItem value="all">All Projects</MenuItem>
                  {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>

              {/* Story Filter — only visible when Story level is enabled */}
              {isStoryEnabled && (
                <FormControl size="small" sx={{ minWidth: 140 }} disabled={filterProject === 'all'}>
                  <InputLabel>Story</InputLabel>
                  <Select
                    value={filterStory}
                    label="Story"
                    onChange={e => setFilterStory(e.target.value)}
                    sx={{ borderRadius: '8px', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc' }}
                  >
                    <MenuItem value="all">All Stories</MenuItem>
                    {filterProject !== 'all' && (storiesByProject[filterProject] || []).map(s => (
                      <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}


              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={e => setFilterStatus(e.target.value)}
                  sx={{ borderRadius: '8px', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc' }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Code Review">Code Review</MenuItem>
                  <MenuItem value="Testing">Testing</MenuItem>
                  <MenuItem value="Deploy">Deploy</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>

              {/* Reset Filters button */}
              {(filterProject !== 'all' || filterStory !== 'all' || filterAssignees.length > 0 || filterStatus !== 'all' || searchTerm) && (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setFilterProject('all');
                    setFilterStory('all');
                    setFilterAssignees([]);
                    setFilterStatus('all');
                    setSearchTerm('');
                  }}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Reset Filters
                </Button>
              )}
            </Box>
          </Box>

          {/* BOARD HEADER */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            <Box sx={{ px: 2, py: 1.5, borderRight: '1px solid', borderColor: 'divider', borderBottom: '3px solid #6366f1', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FolderOutlinedIcon sx={{ fontSize: 16, color: '#6366f1' }} />
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#6366f1', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1 }}>PROJECT</Typography>
              <Box sx={{ bgcolor: '#ede9fe', color: '#6366f1', fontSize: '0.68rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 8 }}>{filteredProjects.length}</Box>
              <IconButton 
                size="small" 
                sx={{ 
                  ml: 'auto', p: '2px', color: '#6366f1', bgcolor: '#ede9fe', 
                  '&:hover': { bgcolor: '#ddd6fe' } 
                }}
                onClick={() => {
                  setProjectForm({
                    name: '',
                    description: '',
                    estimate_hours: 0,
                    end_date: '',
                    priority: 'Medium',
                    assigned_user: [],
                    reporter: '',
                    status: 'Not Started'
                  });
                  setEditModal(false);
                  setOpenModal(true);
                }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Box sx={{ px: 2, py: 1.5, borderRight: '1px solid', borderColor: 'divider', borderBottom: '3px solid #10b981', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookmarkBorderOutlinedIcon sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#10b981', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1 }}>STORY</Typography>
              <Box sx={{ bgcolor: '#d1fae5', color: '#059669', fontSize: '0.68rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 8 }}>{filteredStoriesCount}</Box>
              <IconButton 
                size="small" 
                sx={{ 
                  ml: 'auto', p: '2px', color: '#10b981', bgcolor: '#d1fae5', 
                  '&:hover': { bgcolor: '#a7f3d0' } 
                }}
                onClick={() => {
                  setActiveProjectId('');
                  setStoryForm({ name: '', description: '', estimate_hours: 0, assigned_user: [], reporter: '', end_date: '', priority: 'Medium', status: 'Not Started' });
                  setStoryModalIsEdit(false);
                  setStoryModalOpen(true);
                }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '3px solid', borderImage: 'linear-gradient(to right, #eab308 50%, #ef4444 50%) 1', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TaskAltOutlinedIcon sx={{ fontSize: 16, color: '#eab308' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#eab308', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1, textDecoration: 'underline' }}>TASK</Typography>
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#cbd5e1', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1 }}>|</Typography>
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#ef4444', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1, textDecoration: 'underline' }}>BUG</Typography>
              </Box>
              <Box sx={{ bgcolor: '#fef9c3', color: '#eab308', fontSize: '0.68rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 8 }}>{filteredTasksCount}</Box>
              <IconButton 
                size="small" 
                sx={{ 
                  ml: 'auto', p: '2px', color: '#eab308', bgcolor: '#fef9c3', 
                  '&:hover': { bgcolor: '#fef08a' } 
                }}
                onClick={() => {
                  setActiveProjectId('');
                  setActiveStoryId('');
                  setTaskForm({ type: 'Task', status: 'To Do', name: '', description: '', estimateHours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium', work_status: 'Not Started', team_assignment: null });
                  setTaskModalIsEdit(false);
                  setTaskModalOpen(true);
                }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Box>

          {/* BOARD ROWS */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {filteredProjects.length === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 1 }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>No results match your filters</Typography>
                <Typography sx={{ color: '#cbd5e1', fontSize: '0.78rem' }}>Try adjusting the search or filter options above.</Typography>
              </Box>
            )}
            {filteredProjects.map((proj, projIdx) => {
              const actualStories = getFilteredStoriesForProject(proj._id);
              const stories = collapsedProjects[proj._id] ? [] : actualStories;
              const rowCount = Math.max(stories.length, 1);
              const totalTasks = actualStories.reduce((sum, story) => sum + getFilteredTasksForStory(story._id).length, 0);
              const totalHours = actualStories.reduce((sum, story) => {
                const tasks = getFilteredTasksForStory(story._id);
                return sum + tasks.reduce((tSum, t) => tSum + (t.estimate_hours || 0), 0);
              }, 0);
              return (
                <Box key={proj._id} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: projIdx < filteredProjects.length - 1 ? '2px solid' : 'none', borderBottomColor: 'divider' }}>

                  {/* PROJECT CARD */}
                  <Box sx={{ gridRow: `1 / ${rowCount + 1}`, borderRight: '1px solid', borderColor: 'divider', p: 1.5, display: 'flex', flexDirection: 'column', alignSelf: 'start', position: 'sticky', top: 0 }}>
                    <Paper elevation={0} sx={{
                      pt: '10px', pb: '48px', px: '16px', borderRadius: '8px',
                      minHeight: '200px', position: 'relative',
                      border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
                      borderLeft: '4px solid #6366f1',
                      transition: 'all 0.15s',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)', borderColor: '#a5b4fc' }
                    }} onClick={() => {
                      setProjectForm({
                        name: proj.name,
                        description: proj.description || '',
                        estimate_hours: proj.estimate_hours || 0,
                        end_date: proj.end_date ? proj.end_date.substring(0, 10) : '',
                        priority: proj.priority || 'Medium',
                        assigned_user: Array.isArray(proj.assigned_user) ? proj.assigned_user : (proj.assigned_user ? [proj.assigned_user] : []),
                        reporter: proj.reporter || '',
                        status: proj.status || 'Not Started'
                      });
                      setEditProjectId(proj._id);
                      setEditModal(true);
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: 1.5 }}>
                        <Box 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleProjectCollapse(proj._id);
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            p: '2px 4px',
                            borderRadius: '4px',
                            bgcolor: '#ede9fe',
                            '&:hover': { bgcolor: '#ddd6fe' },
                            mr: 0.5
                          }}
                        >
                          {collapsedProjects[proj._id] ? <ChevronRightIcon sx={{ fontSize: 16, color: '#6366f1' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: '#6366f1' }} />}
                          <FolderOutlinedIcon sx={{ fontSize: 16, color: '#6366f1', ml: '2px', flexShrink: 0 }} />
                        </Box>
                        <Tooltip title={`Serial No: ${proj.custom_id}`} arrow placement="top">
                          <Typography sx={{ fontWeight: 700, color: '#6366f1', fontSize: '0.65rem', bgcolor: '#ede9fe', px: 0.6, py: 0.1, borderRadius: '3px', flexShrink: 0 }}>
                            {proj.custom_id}
                          </Typography>
                        </Tooltip>
                        {(() => {
                          const pc = priorityColor(proj.priority);
                          return (
                            <Tooltip title={`Priority: ${proj.priority || 'Medium'}`} arrow placement="top">
                              <Box sx={{ bgcolor: pc.bg, color: pc.color, fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: `1px solid ${pc.border}`, flexShrink: 0 }}>
                                {proj.priority || 'Medium'}
                              </Box>
                            </Tooltip>
                          );
                        })()}
                        {(() => {
                          const sc = statusColor(proj.status || 'Not Started');
                          return (
                            <Tooltip title={`Status: ${proj.status || 'Not Started'}`} arrow placement="top">
                              <Box sx={{ bgcolor: sc.bg, color: sc.color, fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: `1px solid ${sc.border}`, flexShrink: 0 }}>
                                {proj.status || 'Not Started'}
                              </Box>
                            </Tooltip>
                          );
                        })()}
                        {proj.estimate_hours > 0 && (
                          <Tooltip title={`Total Project Estimate: ${proj.estimate_hours} hours`} arrow placement="top">
                            <Box sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #bfdbfe', flexShrink: 0 }}>
                              {proj.estimate_hours}h
                            </Box>
                          </Tooltip>
                        )}
                        {proj.end_date && (
                          <Tooltip title={`Due Date: ${proj.end_date}`} arrow placement="top">
                            <Box sx={{ bgcolor: '#fff1f2', color: '#e11d48', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #fecdd3', flexShrink: 0 }}>
                              {proj.end_date}
                            </Box>
                          </Tooltip>
                        )}
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                          <IconButton size="small" sx={{ p: 0.2 }} onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(proj._id);
                          }}>
                            <DeleteIcon sx={{ fontSize: 16, color: '#fca5a5' }} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '4px' }}>
                        {editingProjectId === proj._id ? (
                          <Box 
                            onClick={(e) => e.stopPropagation()}
                            sx={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}
                          >
                            <TextField
                              value={editingProjectValue}
                              onChange={e => setEditingProjectValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  if (editingProjectValue.trim()) {
                                    handlePartialUpdateProject(proj._id, { name: editingProjectValue.trim() });
                                  }
                                  setEditingProjectId(null);
                                } else if (e.key === 'Escape') {
                                  setEditingProjectId(null);
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setEditingProjectId(null);
                                }, 200);
                              }}
                              autoFocus
                              inputProps={{ style: { fontSize: '1.15rem', fontWeight: 800, color: 'inherit', padding: 0 } }}
                              sx={{ width: '160px' }}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (editingProjectValue.trim()) {
                                  handlePartialUpdateProject(proj._id, { name: editingProjectValue.trim() });
                                }
                                setEditingProjectId(null);
                              }}
                              sx={{ p: '2px', color: '#10b981' }}
                            >
                              <CheckIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProjectId(null);
                              }}
                              sx={{ p: '2px', color: '#ef4444' }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              width: 'fit-content',
                              alignItems: 'center',
                              overflow: 'hidden',
                              '&:hover .project-title-edit-icon': { opacity: 1 }
                            }}
                          >
                            <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.15rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 0.5 }}>
                              {proj.name}
                            </Typography>
                            <IconButton
                              className="project-title-edit-icon"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProjectId(proj._id);
                                setEditingProjectValue(proj.name);
                              }}
                              sx={{
                                p: '2px',
                                color: '#6366f1',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                flexShrink: 0
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {proj.description && (
                        <Typography
                          sx={{
                            color: '#64748b',
                            fontSize: '0.75rem',
                            mt: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4
                          }}
                        >
                          {proj.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, position: 'absolute', bottom: '12px', left: '16px' }}>
                        <Tooltip title={`Total Stories: ${actualStories.length}`} arrow placement="top">
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', cursor: 'pointer' }}>
                            Stories : {actualStories.length}
                          </Typography>
                        </Tooltip>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>,</Typography>
                        <Tooltip title={`Total Tasks: ${totalTasks}`} arrow placement="top">
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', cursor: 'pointer' }}>
                            Tasks : {totalTasks}
                          </Typography>
                        </Tooltip>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>,</Typography>
                        <Tooltip title={`Total Project Hours: ${totalHours} hours`} arrow placement="top">
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', cursor: 'pointer' }}>
                            Hours : {totalHours}
                          </Typography>
                        </Tooltip>
                      </Box>
                      {/* Project Assignees */}
                      {(() => {
                        const assignees = proj.assigned_user 
                          ? (Array.isArray(proj.assigned_user) ? proj.assigned_user : [proj.assigned_user]) 
                          : [];
                        if (assignees.length === 0) return null;
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, position: 'absolute', bottom: '10px', right: '16px' }}>
                            {assignees.map((id, aIdx) => {
                              const userObj = users.find(u => (u._id || u.user_id) === id);
                              if (!userObj) return null;
                              return (
                                <Tooltip key={id || aIdx} title={userObj.name || 'Unassigned'}>
                                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: getAvatarColor(userObj.name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                    {userObj.name ? userObj.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                                  </Box>
                                </Tooltip>
                              );
                            })}
                          </Box>
                        );
                      })()}
                    </Paper>
                  </Box>

                  {/* STORY + TASK ROWS */}
                  {collapsedProjects[proj._id] ? (
                    <>
                      <Box 
                        onClick={() => toggleProjectCollapse(proj._id)}
                        sx={{ 
                          borderRight: '1px solid #e2e8f0', p: 1.5, minHeight: 64, 
                          display: 'flex', alignItems: 'center', bgcolor: '#f8fafc',
                          cursor: 'pointer', transition: '0.15s',
                          '&:hover': { bgcolor: '#f1f5f9' },
                          borderBottom: '1px dashed #cbd5e1'
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ChevronRightIcon sx={{ fontSize: 14 }} /> Stories collapsed ({actualStories.length})
                        </Typography>
                      </Box>
                      <Box 
                        onClick={() => toggleProjectCollapse(proj._id)}
                        sx={{ 
                          p: 1.5, minHeight: 64, bgcolor: '#f8fafc',
                          cursor: 'pointer', transition: '0.15s',
                          '&:hover': { bgcolor: '#f1f5f9' },
                          borderBottom: '1px dashed #cbd5e1'
                        }} 
                      />
                    </>
                  ) : stories.length === 0 ? (
                    <>
                      <Box sx={{ borderRight: '1px solid #e2e8f0', p: 1.5, minHeight: 64, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 0.5, py: 0.6, borderRadius: '6px', cursor: 'pointer', color: '#94a3b8', transition: '0.15s', '&:hover': { bgcolor: '#f0fdf4', color: '#10b981' } }} onClick={() => { setActiveProjectId(proj._id); setStoryForm({ name: '', description: '', estimate_hours: 0, assigned_user: [], reporter: '', end_date: '', priority: 'Medium', status: 'Not Started' }); setStoryModalIsEdit(false); setStoryModalOpen(true); }}>
                          <AddIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.73rem' }}>Add Story</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ p: 1.5, minHeight: 64 }} />
                    </>
                  ) : (
                    stories.map((story, sIdx) => {
                      const pc = priorityColor(story.priority);
                      const tasks = getFilteredTasksForStory(story._id);
                      const totalTaskHours = tasks.reduce((sum, t) => sum + (t.estimate_hours || 0), 0);
                      return (
                        <React.Fragment key={story._id}>
                          {/* STORY CARD */}
                          <Box sx={{ borderRight: '1px solid', borderRightColor: 'divider', borderTop: sIdx > 0 ? '1px solid' : 'none', borderTopColor: 'divider', p: 1.5 }}>
                            <Paper elevation={0} sx={{
                              pt: '10px', pb: '48px', px: '16px', borderRadius: '8px',
                              minHeight: '200px', position: 'relative',
                              border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
                              borderLeft: '4px solid #10b981',
                              transition: 'all 0.15s',
                              cursor: 'pointer',
                              '&:hover': { boxShadow: '0 4px 12px rgba(16,185,129,0.15)', borderColor: '#6ee7b7' }
                            }} onClick={() => {
                              setStoryForm({ name: story.name, description: story.description || '', estimate_hours: story.estimate_hours || 0, assigned_user: Array.isArray(story.assigned_user) ? story.assigned_user : (story.assigned_user ? [story.assigned_user] : []), reporter: story.reporter || '', end_date: story.end_date ? story.end_date.substring(0, 10) : '', priority: story.priority || 'Medium', status: story.status || 'Not Started' });
                              setActiveStoryId(story._id);
                              setStoryModalIsEdit(true);
                              setStoryModalOpen(true);
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: 1.5 }}>
                                <Box 
                                   onClick={(e) => {
                                     e.preventDefault();
                                     e.stopPropagation();
                                     toggleStoryCollapse(story._id);
                                   }}
                                   sx={{
                                     display: 'flex',
                                     alignItems: 'center',
                                     cursor: 'pointer',
                                     p: '2px 4px',
                                     borderRadius: '4px',
                                     bgcolor: '#f1f5f9',
                                     '&:hover': { bgcolor: '#e2e8f0' },
                                     mr: 0.5
                                   }}
                                 >
                                   {collapsedStories[story._id] ? <ChevronRightIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: '#10b981' }} />}
                                   <BookmarkBorderOutlinedIcon sx={{ fontSize: 16, color: '#10b981', ml: '2px', flexShrink: 0 }} />
                                 </Box>
                                <Tooltip title={`Serial No: ${story.custom_id}`} arrow placement="top">
                                  <Typography sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.65rem', bgcolor: '#d1fae5', px: 0.6, py: 0.1, borderRadius: '3px', flexShrink: 0 }}>
                                    {story.custom_id}
                                  </Typography>
                                </Tooltip>
                                <Tooltip title={`Priority: ${story.priority || 'Medium'}`} arrow placement="top">
                                  <Box sx={{ bgcolor: pc.bg, color: pc.color, fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: `1px solid ${pc.border}`, flexShrink: 0 }}>
                                    {story.priority || 'Medium'}
                                  </Box>
                                </Tooltip>
                                {(() => {
                                   const sc = statusColor(story.status || 'Not Started');
                                   return (
                                     <Tooltip title={`Status: ${story.status || 'Not Started'}`} arrow placement="top">
                                       <Box sx={{ bgcolor: sc.bg, color: sc.color, fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: `1px solid ${sc.border}`, flexShrink: 0 }}>
                                         {story.status || 'Not Started'}
                                       </Box>
                                     </Tooltip>
                                   );
                                 })()}
                                {story.estimate_hours > 0 && (
                                  <Tooltip title={`Total Story Estimate: ${story.estimate_hours} hours`} arrow placement="top">
                                    <Box sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #bfdbfe', flexShrink: 0 }}>
                                      {story.estimate_hours}h
                                    </Box>
                                  </Tooltip>
                                )}
                                {story.end_date && (
                                  <Tooltip title={`Due Date: ${typeof story.end_date === 'string' ? story.end_date.substring(0, 10) : new Date(story.end_date).toISOString().substring(0, 10)}`} arrow placement="top">
                                    <Box sx={{ bgcolor: '#fff1f2', color: '#e11d48', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #fecdd3', flexShrink: 0 }}>
                                      {typeof story.end_date === 'string' ? story.end_date.substring(0, 10) : new Date(story.end_date).toISOString().substring(0, 10)}
                                    </Box>
                                  </Tooltip>
                                )}
                                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                  <IconButton size="small" sx={{ p: 0.2 }} onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStory(story._id);
                                  }}>
                                    <DeleteIcon sx={{ fontSize: 16, color: '#fca5a5' }} />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '4px' }}>
                                {editingStoryId === story._id ? (
                                  <Box 
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}
                                  >
                                    <TextField
                                      value={editingStoryValue}
                                      onChange={e => setEditingStoryValue(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          if (editingStoryValue.trim()) {
                                            handlePartialUpdateStory(story._id, { name: editingStoryValue.trim() });
                                          }
                                          setEditingStoryId(null);
                                        } else if (e.key === 'Escape') {
                                          setEditingStoryId(null);
                                        }
                                      }}
                                      onBlur={() => {
                                        setTimeout(() => {
                                          setEditingStoryId(null);
                                        }, 200);
                                      }}
                                      autoFocus
                                      inputProps={{ style: { fontSize: '1.15rem', fontWeight: 800, color: 'inherit', padding: 0 } }}
                                      sx={{ width: '160px' }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (editingStoryValue.trim()) {
                                          handlePartialUpdateStory(story._id, { name: editingStoryValue.trim() });
                                        }
                                        setEditingStoryId(null);
                                      }}
                                      sx={{ p: '2px', color: '#10b981' }}
                                    >
                                      <CheckIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingStoryId(null);
                                      }}
                                      sx={{ p: '2px', color: '#ef4444' }}
                                    >
                                      <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      width: 'fit-content',
                                      alignItems: 'center',
                                      overflow: 'hidden',
                                      '&:hover .story-title-edit-icon': { opacity: 1 }
                                    }}
                                  >
                                    <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.15rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 0.5 }}>
                                      {story.name}
                                    </Typography>
                                    <IconButton
                                      className="story-title-edit-icon"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingStoryId(story._id);
                                        setEditingStoryValue(story.name);
                                      }}
                                      sx={{
                                        p: '2px',
                                        color: '#6366f1',
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        flexShrink: 0
                                      }}
                                    >
                                      <EditIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Box>
                                )}

                              </Box>
                              {story.description && (
                                <Typography
                                  sx={{
                                    color: '#64748b',
                                    fontSize: '0.75rem',
                                    mt: 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: 1.4
                                  }}
                                >
                                  {story.description}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, position: 'absolute', bottom: '12px', left: '16px' }}>
                                <Tooltip title={`Total Tasks in Story: ${tasks.length}`} arrow placement="top">
                                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', cursor: 'pointer' }}>
                                    Task : {tasks.length}
                                  </Typography>
                                </Tooltip>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>,</Typography>
                                <Tooltip title={`Total Task Estimate Hours: ${totalTaskHours} hours`} arrow placement="top">
                                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', cursor: 'pointer' }}>
                                    Hours : {totalTaskHours}
                                  </Typography>
                                </Tooltip>
                              </Box>
                              {/* Story Assignees */}
                              {(() => {
                                const assignees = story.assigned_user 
                                  ? (Array.isArray(story.assigned_user) ? story.assigned_user : [story.assigned_user]) 
                                  : [];
                                if (assignees.length === 0) return null;
                                return (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, position: 'absolute', bottom: '10px', right: '16px' }}>
                                    {assignees.map((id, aIdx) => {
                                      const userObj = users.find(u => (u._id || u.user_id) === id);
                                      if (!userObj) return null;
                                      return (
                                        <Tooltip key={id || aIdx} title={userObj.name || 'Unassigned'}>
                                          <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: getAvatarColor(userObj.name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                            {userObj.name ? userObj.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                                          </Box>
                                        </Tooltip>
                                      );
                                    })}
                                  </Box>
                                );
                              })()}
                            </Paper>
                            {/* Add Story button */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5, px: 0.3, py: 0.5, borderRadius: '6px', cursor: 'pointer', color: '#94a3b8', transition: '0.15s', '&:hover': { bgcolor: '#f0fdf4', color: '#10b981' } }} onClick={() => { setActiveProjectId(proj._id); setStoryForm({ name: '', description: '', estimate_hours: 0, assigned_user: [], reporter: '', end_date: '', priority: 'Medium', status: 'Not Started' }); setStoryModalIsEdit(false); setStoryModalOpen(true); }}>
                              <AddIcon sx={{ fontSize: 13 }} />
                              <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.7rem' }}>Add Story</Typography>
                            </Box>
                          </Box>

                          {/* TASK CARDS */}
                          <Box sx={{ borderTop: sIdx > 0 ? '1px solid #f1f5f9' : 'none', p: '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {collapsedStories[story._id] ? (
                              <Box 
                                onClick={() => toggleStoryCollapse(story._id)}
                                sx={{
                                  py: 1.5, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  bgcolor: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1',
                                  cursor: 'pointer', transition: '0.15s',
                                  '&:hover': { bgcolor: '#f1f5f9' }
                                }}
                              >
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ChevronRightIcon sx={{ fontSize: 14 }} /> Tasks collapsed ({tasks.length})
                                </Typography>
                              </Box>
                            ) : (
                              <>
                                {tasks.map(task => {
                                  const sc = statusColor(task.status);
                                  const isBug = task.type === 'Bug';
                                  return (
                                    <Paper key={task._id} elevation={0} sx={{
                                      px: '8px', py: '7px', borderRadius: '6px',
                                      border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
                                      borderLeft: `3px solid ${sc.color}`,
                                      transition: 'all 0.15s',
                                      cursor: 'pointer',
                                      '&:hover': { boxShadow: `0 3px 10px ${sc.color}33`, borderColor: sc.color }
                                    }} onClick={() => {
                                      setTaskForm({ type: task.type, status: task.status, name: task.name, description: task.description || '', estimateHours: task.estimate_hours || 0, assigned_user: task.assigned_user || '', reporter: task.reporter || '', end_date: task.end_date ? task.end_date.substring(0, 10) : '', priority: task.priority || 'Medium', comments: task.comments || [], work_status: task.work_status || 'Not Started', team_assignment: task.team_assignment || null });
                                      setActiveTaskId(task._id);
                                      setTaskModalIsEdit(true);
                                      setTaskModalOpen(true);
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Tooltip title={isBug ? 'Type: Bug' : 'Type: Task'} arrow placement="top">
                                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                            {isBug ? <BugReportOutlinedIcon sx={{ fontSize: 16, color: '#ef4444', flexShrink: 0 }} /> : <TaskAltOutlinedIcon sx={{ fontSize: 16, color: '#eab308', flexShrink: 0 }} />}
                                          </Box>
                                        </Tooltip>
                                        <Tooltip title={`Serial No: ${task.custom_id}`} arrow placement="top">
                                          <Typography sx={{ fontWeight: 700, color: isBug ? '#ef4444' : '#eab308', fontSize: '0.65rem', bgcolor: isBug ? '#fef2f2' : '#fef9c3', px: 0.6, py: 0.1, borderRadius: '3px', flexShrink: 0 }}>
                                            {task.custom_id}
                                          </Typography>
                                        </Tooltip>
                                        <Tooltip title={`Status: ${task.status}`} arrow placement="top">
                                          <Box sx={{ bgcolor: sc.bg, color: sc.color, fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', flexShrink: 0 }}>{task.status}</Box>
                                        </Tooltip>
                                        {task.estimate_hours > 0 && (
                                          <Tooltip title={`Estimate: ${task.estimate_hours} hours`} arrow placement="top">
                                            <Box sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #bfdbfe', flexShrink: 0 }}>
                                              {task.estimate_hours}h
                                            </Box>
                                          </Tooltip>
                                        )}
                                        {task.end_date && (
                                          <Tooltip title={`Due Date: ${typeof task.end_date === 'string' ? task.end_date.substring(0, 10) : new Date(task.end_date).toISOString().substring(0, 10)}`} arrow placement="top">
                                            <Box sx={{ bgcolor: '#fff1f2', color: '#e11d48', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #fecdd3', flexShrink: 0 }}>
                                              {typeof task.end_date === 'string' ? task.end_date.substring(0, 10) : new Date(task.end_date).toISOString().substring(0, 10)}
                                            </Box>
                                          </Tooltip>
                                        )}
                                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                          <Tooltip title="Delete Task" arrow placement="top">
                                            <IconButton size="small" sx={{ p: 0.2 }} onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteTask(task._id);
                                            }}>
                                              <DeleteIcon sx={{ fontSize: 16, color: '#fca5a5' }} />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '2px' }}>
                                        {editingTaskId === task._id ? (
                                          <Box 
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}
                                          >
                                            <TextField
                                              value={editingTaskValue}
                                              onChange={e => setEditingTaskValue(e.target.value)}
                                              onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                  if (editingTaskValue.trim()) {
                                                    handlePartialUpdateTask(task._id, { name: editingTaskValue.trim() });
                                                  }
                                                  setEditingTaskId(null);
                                                } else if (e.key === 'Escape') {
                                                  setEditingTaskId(null);
                                                }
                                              }}
                                              onBlur={() => {
                                                setTimeout(() => {
                                                  setEditingTaskId(null);
                                                }, 200);
                                              }}
                                              autoFocus
                                              size="small"
                                              variant="standard"
                                              inputProps={{ style: { fontSize: '0.88rem', fontWeight: 600, color: 'inherit', padding: 0 } }}
                                              sx={{ width: '150px' }}
                                            />
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (editingTaskValue.trim()) {
                                                  handlePartialUpdateTask(task._id, { name: editingTaskValue.trim() });
                                                }
                                                setEditingTaskId(null);
                                              }}
                                              sx={{ p: '2px', color: '#10b981' }}
                                            >
                                              <CheckIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingTaskId(null);
                                              }}
                                              sx={{ p: '2px', color: '#ef4444' }}
                                            >
                                              <CloseIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                          </Box>
                                        ) : (
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              width: 'fit-content',
                                              alignItems: 'center',
                                              overflow: 'hidden',
                                              '&:hover .task-title-edit-icon': { opacity: 1 }
                                            }}
                                          >
                                            <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.88rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 0.5 }}>
                                              {task.name}
                                            </Typography>
                                            <IconButton
                                              className="task-title-edit-icon"
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingTaskId(task._id);
                                                setEditingTaskValue(task.name);
                                              }}
                                              sx={{
                                                p: '2px',
                                                color: '#6366f1',
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                flexShrink: 0
                                              }}
                                            >
                                              <EditIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                          </Box>
                                        )}
                                        {task.assigned_user && (
                                          <Tooltip title={users.find(u => (u._id || u.user_id) === task.assigned_user)?.name || 'Unassigned'}>
                                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: getAvatarColor(users.find(u => (u._id || u.user_id) === task.assigned_user)?.name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                              {getUserInitials(task.assigned_user, users)}
                                            </Box>
                                          </Tooltip>
                                        )}
                                      </Box>
                                    </Paper>
                                  );
                                })}
                                {/* Add Task button */}
                                <Box sx={{
                                  display: 'flex', alignItems: 'center', gap: 0.6, px: 0.5, py: 0.8, borderRadius: '6px',
                                  cursor: 'pointer', color: '#94a3b8', transition: '0.15s',
                                  '&:hover': { bgcolor: '#eff6ff', color: '#3b82f6' }
                                }} onClick={() => {
                                  setActiveProjectId(proj._id);
                                  setActiveStoryId(story._id);
                                  setTaskForm({ type: 'Task', status: 'To Do', name: '', description: '', estimateHours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium', work_status: 'Not Started', team_assignment: null });
                                  setTaskModalIsEdit(false);
                                  setTaskModalOpen(true);
                                }}>
                                  <AddIcon sx={{ fontSize: 14 }} />
                                  <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.75rem' }}>Add Task / Bug</Typography>
                                </Box>
                              </>
                            )}
                          </Box>
                        </React.Fragment>
                      );
                    })
                  )}
                </Box>
              );
            })}

            {/* CREATE PROJECT ROW */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #e2e8f0' }}>
              <Box sx={{ borderRight: '1px solid #e2e8f0', p: 1.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.8, px: 1, py: 1, borderRadius: '8px',
                  cursor: 'pointer', color: '#94a3b8', transition: '0.15s',
                  '&:hover': { bgcolor: '#f1f5f9', color: '#6366f1' }
                }} onClick={() => { setProjectForm({ name: '', description: '', estimate_hours: 0, end_date: '', priority: 'Medium', assigned_user: [], reporter: '', status: 'Not Started' }); setEditModal(false); setOpenModal(true); }}>
                  <AddIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8rem' }}>Create Project</Typography>
                </Box>
              </Box>
              <Box sx={{ borderRight: '1px solid #e2e8f0' }} />
              <Box />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* --- MODALS --- */}
      <ProjectModal
        open={openModal || editModal}
        onClose={() => { setOpenModal(false); setEditModal(false); }}
        editModal={editModal}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        onSave={handleSaveProject}
        users={users}
      />

      <StoryModal
        open={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        storyModalIsEdit={storyModalIsEdit}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        storyForm={storyForm}
        setStoryForm={setStoryForm}
        projects={projects}
        users={users}
        onSave={handleSaveStory}
      />

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskModalIsEdit={taskModalIsEdit}
        activeStoryId={activeStoryId}
        setActiveStoryId={setActiveStoryId}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        storiesByProject={storiesByProject}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        users={users}
        onSave={handleSaveTask}
        projects={projects}
        showProjectSelect={!activeStoryId && !taskModalIsEdit}
        activeTaskId={activeTaskId}
        onPartialUpdateTask={handlePartialUpdateTask}
      />
    </>
  );
};

export default Projects;
