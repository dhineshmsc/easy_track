import React from 'react';
import { Box, Typography } from '@mui/material';
import TaskCard from './TaskCard';

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
  onPartialUpdateTask
}) => {
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
        bgcolor: draggedOverColumn === status ? '#e2e8f0' : '#f1f5f9',
        borderRadius: 3,
        p: 1.5,
        maxHeight: 'calc(100vh - 180px)',
        transition: 'background-color 0.2s'
      }}
    >
      {/* Status Column Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
        <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#1d1d1f', display: 'flex', alignItems: 'center', gap: 1 }}>
          {status === 'Todo' ? 'To Do' : status}
          <Box component="span" sx={{
            bgcolor: `${colHeaderColor}12`,
            color: colHeaderColor,
            fontSize: '0.72rem',
            fontWeight: '800',
            px: 1.2,
            py: 0.2,
            borderRadius: 4
          }}>
            {tasks.length}
          </Box>
        </Typography>
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
          pr: 0.5,
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
