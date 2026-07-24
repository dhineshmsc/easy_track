"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Box, CssBaseline, Typography, TextField,
  FormControl, InputLabel, Select, MenuItem, Button, Tooltip, IconButton,
  InputAdornment, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { useProjectData } from '../hooks/useProjectData';
import { getUserInitials, getAvatarColor } from '../utils/projectsHelper';
import TaskModal from '../components/projects/TaskModal';
import TaskColumn from '../components/tasks/TaskColumn';

const Tasks = () => {
  const { company } = useParams();
  const searchParams = useSearchParams();
  const taskIdParam = searchParams.get('taskId');
  const {
    username, projects, storiesByProject, tasksByStory, users,
    taskModalOpen, setTaskModalOpen, taskModalIsEdit, setTaskModalIsEdit,
    activeTaskId, setActiveTaskId, activeStoryId, setActiveStoryId,
    activeProjectId, setActiveProjectId, taskForm, setTaskForm,
    handleSaveTask, handleDeleteTask, handlePartialUpdateTask
  } = useProjectData();

  // Local filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStory, setFilterStory] = useState('all');
  const [filterAssignees, setFilterAssignees] = useState([]);

  // Drag and drop states
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e, targetStatus) => {
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const backendStatus = targetStatus === 'Todo' ? 'To Do' : targetStatus;
      const task = allTasks.find(t => t._id === taskId);
      const currentWorkStatus = task?.work_status || 'Not Started';

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

      const opts = TASK_STATUS_WORK_MAP[backendStatus] || [];
      const newWorkStatus = opts.includes(currentWorkStatus) ? currentWorkStatus : (opts[0] || 'Not Started');

      handlePartialUpdateTask(taskId, { status: backendStatus, work_status: newWorkStatus });
    }
  };

  // Ref for horizontal scroll container
  const scrollContainerRef = useRef(null);

  // Lookup structures for fast lookup of project & story from story_id
  const storyLookup = {};
  const projectLookup = {};

  projects.forEach(p => {
    projectLookup[p._id] = p;
    const stories = storiesByProject[p._id] || [];
    stories.forEach(s => {
      storyLookup[s._id] = { story: s, project: p };
    });
  });

  // Flatten all tasks across all projects/stories
  const allTasks = Object.values(tasksByStory).flat();

  // Apply filters and searches
  const filteredTasks = allTasks.filter(task => {
    const parent = storyLookup[task.story_id];
    
    // Project filter
    if (filterProject !== 'all' && parent?.project?._id !== filterProject) {
      return false;
    }
    
    // Story filter
    if (filterStory !== 'all' && task.story_id !== filterStory) {
      return false;
    }

    // Assignee filter
    if (filterAssignees.length > 0 && !filterAssignees.includes(task.assigned_user)) {
      return false;
    }
    
    // Search keyword filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const nameMatch = (task.name || '').toLowerCase().includes(query);
      const descMatch = (task.description || '').toLowerCase().includes(query);
      const idMatch = (task.custom_id || '').toLowerCase().includes(query);
      return nameMatch || descMatch || idMatch;
    }
    
    return true;
  });

  // Normalise status grouping helper
  const normalizeStatus = (status) => {
    const s = (status || '').trim().toLowerCase();
    if (s === 'to do' || s === 'todo') return 'Todo';
    if (s === 'developing' || s === 'in progress') return 'Developing';
    if (s === 'code review') return 'Code Review';
    if (s === 'testing') return 'Testing';
    if (s === 'deploy') return 'Deploy';
    if (s === 'done') return 'Done';
    return 'Todo'; // Default fallback
  };

  // Pre-populate columns
  const columns = {
    'Todo': [],
    'Developing': [],
    'Code Review': [],
    'Testing': [],
    'Deploy': [],
    'Done': []
  };

  // Group filtered tasks by status
  filteredTasks.forEach(task => {
    const norm = normalizeStatus(task.status);
    if (columns[norm]) {
      columns[norm].push(task);
    } else {
      columns['Todo'].push(task);
    }
  });

  // Horizontal scroll action handlers
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Convert vertical scroll on empty/header spaces to horizontal scroll
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        // If the scroll target is not inside a vertically scrollable task list
        const isInsideTaskList = e.target.closest('.status-tasks-list');
        if (!isInsideTaskList) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleTaskClick = (task) => {
    setTaskForm({
      type: task.type,
      status: task.status,
      name: task.name,
      description: task.description || '',
      estimateHours: task.estimate_hours || 0,
      assigned_user: task.assigned_user || '',
      reporter: task.reporter || '',
      end_date: task.end_date ? task.end_date.substring(0, 10) : '',
      priority: task.priority || 'Medium',
      image_path: task.image_path || '',
      comments: task.comments || [],
      work_status: task.work_status || 'Not Started',
      team_assignment: task.team_assignment || null
    });
    setActiveTaskId(task._id);
    const parentProjId = storyLookup[task.story_id]?.project?._id;
    setActiveProjectId(parentProjId || '');
    setActiveStoryId(task.story_id);
    setTaskModalIsEdit(true);
    setTaskModalOpen(true);
  };

  useEffect(() => {
    if (taskIdParam && allTasks.length > 0 && Object.keys(storyLookup).length > 0) {
      const task = allTasks.find(t => t._id === taskIdParam);
      if (task) {
        handleTaskClick(task);
      }
    }
  }, [taskIdParam, allTasks.length, Object.keys(storyLookup).length]);

  const handleCreateTaskInColumn = (columnStatus) => {
    const backendStatus = columnStatus === 'Todo' ? 'To Do' : columnStatus;
    setTaskForm({
      type: 'Task',
      status: backendStatus,
      name: '',
      description: '',
      estimateHours: 0,
      assigned_user: '',
      reporter: '',
      end_date: '',
      priority: 'Medium',
      image_path: '',
      comments: [],
      work_status: 'Not Started',
      team_assignment: null
    });
    setActiveTaskId(null);
    setTaskModalIsEdit(false);
    setActiveProjectId(filterProject !== 'all' ? filterProject : (projects[0]?._id || ''));
    setActiveStoryId(filterStory !== 'all' ? filterStory : '');
    setTaskModalOpen(true);
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        
        {/* Left Sidebar */}
        <Sidebar activeMenu="Tasks" />

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />
          
          {/* Page Header and Controls */}
          <Box sx={{
            p: '10px',
            borderBottom: '1px solid #e2e8f0',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary' }}>
                Tasks Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
                Overview of all tasks grouped by status columns.
              </Typography>
            </Box>

            {/* Filter and Action Controls */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* User Avatar Filters */}
              {users.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, borderRight: '1px solid #e2e8f0', pr: 2, py: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mr: 0.5 }}>
                    Assignee:
                  </Typography>
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
                            border: isSelected ? '2px solid #0066cc' : '1px solid transparent',
                            boxShadow: isSelected ? '0 0 6px rgba(0,102,204,0.4)' : 'none',
                            opacity: filterAssignees.length > 0 && !isSelected ? 0.4 : 1,
                            '&:hover': {
                              opacity: 1,
                              transform: 'scale(1.08)'
                            }
                          }}
                        >
                          {getUserInitials(userId, users)}
                        </Avatar>
                      </Tooltip>
                    );
                  })}
                </Box>
              )}

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

              {/* Project Filter Selector */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={filterProject}
                  label="Project"
                  onChange={e => {
                    setFilterProject(e.target.value);
                    setFilterStory('all'); // Reset story filter when project changes
                  }}
                  sx={{ borderRadius: '8px', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc' }}
                >
                  <MenuItem value="all">All Projects</MenuItem>
                  {projects.map(p => (
                    <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Story Filter Selector */}
              <FormControl size="small" sx={{ minWidth: 150 }} disabled={filterProject === 'all'}>
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

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setTaskForm({
                    type: 'Task',
                    status: 'To Do',
                    name: '',
                    description: '',
                    estimateHours: 0,
                    assigned_user: '',
                    reporter: '',
                    end_date: '',
                    priority: 'Medium',
                    image_path: '',
                    work_status: 'Not Started',
                    team_assignment: null
                  });
                  setActiveTaskId(null);
                  setTaskModalIsEdit(false);
                  setActiveProjectId(filterProject !== 'all' ? filterProject : (projects[0]?._id || ''));
                  setActiveStoryId(filterStory !== 'all' ? filterStory : '');
                  setTaskModalOpen(true);
                }}
                sx={{ borderRadius: 2 }}
              >
                Create Task
              </Button>

              {/* Scroll Controls */}
              <Box sx={{ display: 'flex', gap: 0.5, borderLeft: '1px solid #e2e8f0', pl: 2, py: 0.5 }}>
                <Tooltip title="Scroll Left">
                  <IconButton size="small" onClick={handleScrollLeft} sx={{ color: '#475569', border: '1px solid #cbd5e1', bgcolor: '#fff', '&:hover': { bgcolor: '#f1f5f9', color: '#1d1d1f' } }}>
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Scroll Right">
                  <IconButton size="small" onClick={handleScrollRight} sx={{ color: '#475569', border: '1px solid #cbd5e1', bgcolor: '#fff', '&:hover': { bgcolor: '#f1f5f9', color: '#1d1d1f' } }}>
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Kanban columns scroll container */}
          <Box
            ref={scrollContainerRef}
            sx={{
              p: '10px',
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              flexGrow: 1,
              scrollBehavior: 'smooth',
              alignItems: 'stretch',
              bgcolor: 'background.default',
              '&::-webkit-scrollbar': { height: '8px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.12)',
                borderRadius: '10px',
                border: '2px solid transparent',
                backgroundClip: 'padding-box'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(0, 0, 0, 0.45)',
                border: '2px solid transparent',
                backgroundClip: 'padding-box'
              }
            }}
          >
            {Object.entries(columns).map(([status, statusTasks]) => {
              const colHeaderColor = {
                'Todo': '#64748b',
                'Developing': '#0066cc',
                'Code Review': '#7c3aed',
                'Testing': '#ea580c',
                'Deploy': '#059669',
                'Done': '#16a34a'
              }[status];

              return (
                <TaskColumn
                  key={status}
                  status={status}
                  tasks={statusTasks}
                  colHeaderColor={colHeaderColor}
                  draggedOverColumn={draggedOverColumn}
                  setDraggedOverColumn={setDraggedOverColumn}
                  handleDrop={handleDrop}
                  storyLookup={storyLookup}
                  users={users}
                  onTaskClick={handleTaskClick}
                  onDeleteTask={handleDeleteTask}
                  onDragStart={handleDragStart}
                  onPartialUpdateTask={handlePartialUpdateTask}
                  onCreateTaskInColumn={handleCreateTaskInColumn}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Task Modal for creation and editing */}
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
        showProjectSelect={true}
        activeTaskId={activeTaskId}
        onPartialUpdateTask={handlePartialUpdateTask}
      />
    </>
  );
};

export default Tasks;
