import React, { useState } from 'react';
import { Box, Typography, TextField, IconButton, Tooltip, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import TaskCard from './TaskCard';

// Color mappings for Light vs Dark modes
const getColumnColors = (status, isDark) => {
  const lightColors = {
    'Todo':         { bg: '#f0f4ff', header: '#e0e8ff', border: '#c7d7fd' },
    'In Progress':  { bg: '#f0f9ff', header: '#dbeeff', border: '#bae0fd' },
    'Code Review':  { bg: '#faf5ff', header: '#ede9fe', border: '#d8b4fe' },
    'Testing':      { bg: '#fff7ed', header: '#ffedd5', border: '#fed7aa' },
    'Deploy':       { bg: '#f0fdf4', header: '#dcfce7', border: '#a7f3d0' },
    'Done':         { bg: '#f0fdf4', header: '#d1fae5', border: '#6ee7b7' },
    'default':      { bg: '#f8fafc', header: '#f1f5f9', border: '#e2e8f0' }
  };

  const darkColors = {
    'Todo':         { bg: '#131924', header: '#1d273a', border: '#2f3f5c' },
    'In Progress':  { bg: '#101d28', header: '#172b3c', border: '#25445d' },
    'Code Review':  { bg: '#1b1429', header: '#291d3e', border: '#422f64' },
    'Testing':      { bg: '#251a10', header: '#382818', border: '#594026' },
    'Deploy':       { bg: '#102219', header: '#183426', border: '#26533d' },
    'Done':         { bg: '#0b1f17', header: '#122e23', border: '#1c4a38' },
    'default':      { bg: '#1c1c1e', header: '#2c2c2e', border: '#38383f' }
  };

  const set = isDark ? darkColors : lightColors;
  return set[status] || set['default'];
};

const TaskColumn = ({
  status,
  tasks,
  colHeaderColor,
  draggedOverColumn,
  setDraggedOverColumn,
  handleDrop,
  storyLookup,
  users,
  onTaskClick,
  onDeleteTask,
  onDragStart,
  onPartialUpdateTask,
  onCreateTaskInColumn
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getColumnColors(status, isDark);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(status === 'Todo' ? 'To Do' : status);

  const handleSaveTitle = () => {
    if (titleValue.trim()) setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleValue(status === 'Todo' ? 'To Do' : status);
    setIsEditingTitle(false);
  };

  return (
    <Box
      key={status}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.preventDefault();
        setDraggedOverColumn(status);
      }}
      onDragLeave={() => setDraggedOverColumn(null)}
      onDrop={(e) => {
        setDraggedOverColumn(null);
        handleDrop(e, status);
      }}
      sx={{
        width: 295,
        minWidth: 295,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: draggedOverColumn === status ? '#e2e8f0' : colors.bg,
        border: `1.5px solid ${colors.border}`,
        borderRadius: 1.5,
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 180px)',
        transition: 'background-color 0.2s, box-shadow 0.2s',
        boxShadow: draggedOverColumn === status ? '0 0 0 2px #6366f1' : 'none',
      }}
    >
      {/* Column Header with unique bg */}
      <Box sx={{
        px: 1.5,
        py: 1,
        bgcolor: colors.header,
        borderBottom: `1.5px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}>
        {isEditingTitle ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flex: 1 }}>
            <TextField
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelTitle();
              }}
              autoFocus
              size="small"
              variant="standard"
              inputProps={{ style: { fontSize: '0.9rem', fontWeight: 800, color: '#1d1d1f', padding: 0, textAlign: 'center' } }}
              sx={{ width: '120px' }}
            />
            <IconButton size="small" onClick={handleSaveTitle} sx={{ p: '2px', color: '#10b981' }}>
              <CheckIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <IconButton size="small" onClick={handleCancelTitle} sx={{ p: '2px', color: '#ef4444' }}>
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        ) : (
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flex: 1, cursor: 'pointer', '&:hover .col-edit-icon': { opacity: 1 } }}
            onClick={() => setIsEditingTitle(true)}
          >
            <Typography
              variant="subtitle2"
              fontWeight="800"
              sx={{ color: colHeaderColor || '#1d1d1f', fontSize: '0.88rem', userSelect: 'none' }}
            >
              {titleValue}
            </Typography>
            <EditIcon className="col-edit-icon" sx={{ fontSize: 13, color: colHeaderColor, opacity: 0, transition: 'opacity 0.2s' }} />

            {/* Task count badge centered with title */}
            <Box sx={{
              bgcolor: `${colHeaderColor}22`,
              color: colHeaderColor,
              fontSize: '0.72rem',
              fontWeight: 800,
              px: 1,
              py: 0.2,
              borderRadius: 4,
              minWidth: 22,
              textAlign: 'center',
              flexShrink: 0,
            }}>
              {tasks.length}
            </Box>

            {/* '+' Add Task Button right after total count badge */}
            {onCreateTaskInColumn && (
              <Tooltip title={`Create Task in ${titleValue}`}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateTaskInColumn(status);
                  }}
                  sx={{
                    ml: 'auto',
                    p: '3px',
                    color: colHeaderColor,
                    bgcolor: `${colHeaderColor}15`,
                    border: `1px solid ${colHeaderColor}40`,
                    '&:hover': {
                      bgcolor: `${colHeaderColor}35`,
                      transform: 'scale(1.1)'
                    },
                    transition: 'transform 0.15s, background-color 0.15s',
                    flexShrink: 0
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Vertical Scrollable Column Content */}
      <Box
        className="status-tasks-list"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflowY: 'auto',
          flexGrow: 1,
          p: 1,
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '10px'
          }
        }}
      >
        {tasks.map(task => {
          const parent = storyLookup[task.story_id];
          const projName = parent?.project?.name || 'No Project';
          const storyName = parent?.story?.name || 'No Story';

          return (
            <TaskCard
              key={task._id}
              task={task}
              projName={projName}
              storyName={storyName}
              users={users}
              onTaskClick={onTaskClick}
              onDeleteTask={onDeleteTask}
              onDragStart={onDragStart}
              onPartialUpdateTask={onPartialUpdateTask}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default TaskColumn;
