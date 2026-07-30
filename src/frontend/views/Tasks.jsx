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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { useProjectData } from '../hooks/useProjectData';
import { getUserInitials, getAvatarColor } from '../utils/projectsHelper';
import TaskModal from '../components/projects/TaskModal';
import TaskColumn from '../components/tasks/TaskColumn';
import { useWorkflow } from '../context/WorkflowContext';

const Tasks = () => {
  const { company } = useParams();
  const searchParams = useSearchParams();
  const taskIdParam = searchParams.get('taskId');
  const { enabledStages, stageColors, getWorkStatusesForStage, getDefaultWorkStatusForStage, isStoryEnabled, isProjectEnabled, workflowSettings } = useWorkflow();

  const {
    username, projects, storiesByProject, tasksByStory, users,
    taskModalOpen, setTaskModalOpen, taskModalIsEdit, setTaskModalIsEdit,
    activeTaskId, setActiveTaskId, activeStoryId, setActiveStoryId,
    activeProjectId, setActiveProjectId, taskForm, setTaskForm,
    handleSaveTask, handleDeleteTask, handlePartialUpdateTask
  } = useProjectData();

  // Local filter states
  const [filterProject, setFilterProject] = useState('all');
  const [filterStory, setFilterStory] = useState('all');
  const [filterAssignees, setFilterAssignees] = useState([]);
  const [filterWorkflow, setFilterWorkflow] = useState('all');
  const [filterWorkStatus, setFilterWorkStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e, targetStatus) => {
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const backendStatus = targetStatus;
      const task = allTasks.find(t => t._id === taskId);
      const currentWorkStatus = task?.work_status || 'Not Started';

      const validWorkStatuses = (getWorkStatusesForStage(targetStatus) || []).map(ws => ws.name);
      const newWorkStatus = validWorkStatuses.includes(currentWorkStatus)
        ? currentWorkStatus
        : getDefaultWorkStatusForStage(targetStatus);

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

  const isTaskOverdue = (task) => {
    if (!task || !task.end_date) return false;
    const isDone = (task.status || '').trim().toLowerCase() === 'done' || (task.status || '').trim().toLowerCase() === 'completed';
    if (isDone) return false;
    const endDate = new Date(task.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate < today;
  };

  const overdueCount = React.useMemo(() => {
    return allTasks.filter(task => isTaskOverdue(task)).length;
  }, [allTasks]);

  const availableWorkStatuses = React.useMemo(() => {
    const map = workflowSettings?.task_work_status || {};
    let stagesToUse = enabledStages || [];
    if (filterWorkflow !== 'all') {
      stagesToUse = stagesToUse.filter(s => s.name.toLowerCase() === filterWorkflow.toLowerCase());
    }
    const statusesSet = new Set();
    stagesToUse.forEach(stg => {
      const list = map[stg.name] || [];
      list.filter(item => item.enabled !== false).forEach(item => statusesSet.add(item.name));
    });
    return Array.from(statusesSet);
  }, [workflowSettings, enabledStages, filterWorkflow]);

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

    // Workflow filter
    if (filterWorkflow !== 'all') {
      const tStatus = (task.status || '').toLowerCase().trim();
      const targetWorkflow = filterWorkflow.toLowerCase().trim();
      if (targetWorkflow === 'todo' || targetWorkflow === 'to do') {
        if (tStatus !== 'todo' && tStatus !== 'to do') return false;
      } else if (tStatus !== targetWorkflow) {
        return false;
      }
    }

    // Work Status filter
    if (filterWorkStatus !== 'all') {
      const tWork = (task.work_status || '').toLowerCase().trim();
      const targetWork = filterWorkStatus.toLowerCase().trim();
      if (tWork !== targetWork) return false;
    }

    // Priority filter
    if (filterPriority !== 'all') {
      const tPriority = (task.priority || '').toLowerCase().trim();
      const targetPriority = filterPriority.toLowerCase().trim();
      if (tPriority !== targetPriority) return false;
    }

    // Overdue filter
    if (filterOverdue && !isTaskOverdue(task)) {
      return false;
    }
    
    // Search keyword filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const nameMatch = (task.name || '').toLowerCase().includes(query);
      const descMatch = (task.description || '').toLowerCase().includes(query);
      const idMatch = (task.custom_id || '').toLowerCase().includes(query);
      
      const storyName = (parent?.story?.name || '').toLowerCase();
      const storyCustomId = (parent?.story?.custom_id || '').toLowerCase();
      const projName = (parent?.project?.name || '').toLowerCase();
      const projCustomId = (parent?.project?.custom_id || '').toLowerCase();

      const storyMatch = storyName.includes(query) || storyCustomId.includes(query);
      const projMatch = projName.includes(query) || projCustomId.includes(query);

      return nameMatch || descMatch || idMatch || storyMatch || projMatch;
    }
    
    return true;
  });

  // Normalise status grouping helper
  const normalizeStatus = (status) => {
    const s = (status || '').trim().toLowerCase();
    const match = (enabledStages || []).find(stg => stg.name.toLowerCase() === s || (stg.name === 'Todo' && (s === 'to do' || s === 'todo')));
    if (match) return match.name;
    return enabledStages[0]?.name || 'Todo';
  };

  // Pre-populate columns dynamically from enabled stages
  const columns = {};
  (enabledStages || []).forEach(stg => {
    columns[stg.name] = [];
  });

  // Group filtered tasks by status
  filteredTasks.forEach(task => {
    const norm = normalizeStatus(task.status);
    if (columns[norm]) {
      columns[norm].push(task);
    } else {
      const fallback = enabledStages[0]?.name || 'Todo';
      if (columns[fallback]) columns[fallback].push(task);
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
          
          {/* Page Header */}
          <Box sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary' }}>
                Tasks Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                Overview of all tasks grouped by status columns.
              </Typography>
            </Box>

            {/* Create Task Button on Title Right Side */}
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
                  comments: [],
                  work_status: 'Not Started',
                  team_assignment: null
                });
                setActiveTaskId(null);
                setTaskModalIsEdit(false);
                setActiveProjectId(filterProject !== 'all' ? filterProject : (projects[0]?._id || ''));
                setActiveStoryId(filterStory !== 'all' ? filterStory : '');
                setTaskModalOpen(true);
              }}
              sx={{ borderRadius: 2, fontWeight: 600, px: 2.5 }}
            >
              Create Task
            </Button>
          </Box>

          {/* Filter Controls Bar (Single Row Flex) */}
          <Box sx={{
            px: 2,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}>
            {/* User Avatar Filters */}
            {users.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, borderRight: '1px solid', borderColor: 'divider', pr: 1, py: 0.2, flexShrink: 0 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mr: 0.3, fontSize: '0.72rem' }}>
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
                          width: 26,
                          height: 26,
                          fontSize: '0.7rem',
                          bgcolor: getAvatarColor(user.name),
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: isSelected ? '2px solid #0066cc' : '1px solid transparent',
                          boxShadow: isSelected ? '0 0 5px rgba(0,102,204,0.4)' : 'none',
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

            {/* Search */}
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                    </InputAdornment>
                  )
                }
              }}
              sx={{
                flexShrink: 0,
                width: 140,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: 36,
                  fontSize: '0.8rem',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc'
                }
              }}
            />

            {/* Project Filter Selector — only show if Project level is enabled */}
            {isProjectEnabled && (
              <FormControl size="small" sx={{ flexShrink: 0, width: 125 }}>
                <InputLabel sx={{ fontSize: '0.8rem' }}>Project</InputLabel>
                <Select
                  value={filterProject}
                  label="Project"
                  onChange={e => {
                    setFilterProject(e.target.value);
                    setFilterStory('all');
                  }}
                  sx={{ borderRadius: '8px', height: 36, fontSize: '0.8rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc' }}
                >
                  <MenuItem value="all">All Projects</MenuItem>
                  {projects.map(p => (
                    <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Story Filter Selector — only show if Story level is enabled */}
            {isStoryEnabled && (
              <FormControl size="small" sx={{ flexShrink: 0, width: 125 }} disabled={filterProject === 'all'}>
                <InputLabel sx={{ fontSize: '0.8rem' }}>Story</InputLabel>
                <Select
                  value={filterStory}
                  label="Story"
                  onChange={e => setFilterStory(e.target.value)}
                  sx={{ borderRadius: '8px', height: 36, fontSize: '0.8rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc' }}
                >
                  <MenuItem value="all">All Stories</MenuItem>
                  {filterProject !== 'all' && (storiesByProject[filterProject] || []).map(s => (
                    <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Workflow Filter */}
            <FormControl size="small" sx={{ flexShrink: 0, width: 125 }}>
              <InputLabel sx={{ fontSize: '0.8rem' }}>Workflow</InputLabel>
              <Select
                value={filterWorkflow}
                label="Workflow"
                onChange={e => { setFilterWorkflow(e.target.value); setFilterWorkStatus('all'); }}
                sx={{ borderRadius: '8px', height: 36, fontSize: '0.8rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc' }}
              >
                <MenuItem value="all">All Workflows</MenuItem>
                {(enabledStages || []).map(stg => (
                  <MenuItem key={stg.id} value={stg.name}>{stg.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Work Status Filter */}
            <FormControl size="small" sx={{ flexShrink: 0, width: 135 }}>
              <InputLabel sx={{ fontSize: '0.8rem' }}>Work Status</InputLabel>
              <Select
                value={filterWorkStatus}
                label="Work Status"
                onChange={e => setFilterWorkStatus(e.target.value)}
                sx={{ borderRadius: '8px', height: 36, fontSize: '0.8rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc' }}
              >
                <MenuItem value="all">All Work Statuses</MenuItem>
                {availableWorkStatuses.map(ws => (
                  <MenuItem key={ws} value={ws}>{ws}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Priority Filter */}
            <FormControl size="small" sx={{ flexShrink: 0, width: 120 }}>
              <InputLabel sx={{ fontSize: '0.8rem' }}>Priority</InputLabel>
              <Select
                value={filterPriority}
                label="Priority"
                onChange={e => setFilterPriority(e.target.value)}
                sx={{ borderRadius: '8px', height: 36, fontSize: '0.8rem', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#f8fafc' }}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>

            {/* Separate Overdue Filter Button */}
            <Button
              size="small"
              variant={filterOverdue ? "contained" : "outlined"}
              startIcon={<WarningAmberIcon sx={{ fontSize: '1rem', color: filterOverdue ? '#ffffff' : '#d97706' }} />}
              onClick={() => setFilterOverdue(prev => !prev)}
              sx={{
                flexShrink: 0,
                height: 36,
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                px: 1.2,
                bgcolor: filterOverdue
                  ? '#d97706'
                  : (theme) => theme.palette.mode === 'dark' ? 'rgba(217, 119, 6, 0.16)' : '#fffbe8',
                color: filterOverdue ? '#ffffff' : '#b45309',
                borderColor: filterOverdue ? '#b45309' : '#f59e0b',
                boxShadow: filterOverdue ? '0 2px 8px rgba(217, 119, 6, 0.4)' : 'none',
                '&:hover': {
                  bgcolor: filterOverdue
                    ? '#b45309'
                    : (theme) => theme.palette.mode === 'dark' ? 'rgba(217, 119, 6, 0.28)' : '#fef3c7',
                  borderColor: '#d97706'
                }
              }}
            >
              Overdue {overdueCount > 0 && `(${overdueCount})`}
            </Button>

            {/* Reset Filters button */}
            {(filterProject !== 'all' || filterStory !== 'all' || filterAssignees.length > 0 || filterWorkflow !== 'all' || filterWorkStatus !== 'all' || filterPriority !== 'all' || filterOverdue || searchTerm) && (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setFilterProject('all');
                  setFilterStory('all');
                  setFilterWorkflow('all');
                  setFilterWorkStatus('all');
                  setFilterPriority('all');
                  setFilterOverdue(false);
                  setFilterAssignees([]);
                  setSearchTerm('');
                }}
                sx={{ flexShrink: 0, height: 36, borderRadius: '8px', fontSize: '0.78rem', px: 1.2 }}
              >
                Reset Filters
              </Button>
            )}

            {/* Scroll Controls (< >) - Replaced Create Task position in Filter Bar */}
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', ml: 'auto', flexShrink: 0 }}>
              <Tooltip title="Scroll Left">
                <IconButton size="small" onClick={handleScrollLeft} sx={{ width: 32, height: 32, color: 'text.secondary', border: '1px solid', borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#fff', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Scroll Right">
                <IconButton size="small" onClick={handleScrollRight} sx={{ width: 32, height: 32, color: 'text.secondary', border: '1px solid', borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0c0c0e' : '#fff', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
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
              const colHeaderColor = stageColors[status] || '#64748b';

              return (
                <TaskColumn
                  key={status}
                  status={status}
                  stageColor={colHeaderColor}
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
