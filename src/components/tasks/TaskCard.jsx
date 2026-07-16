import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Tooltip, IconButton, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { priorityColor, getUserInitials, getAvatarColor } from '../../utils/projectsHelper';

const TaskCard = ({
  task,
  projName,
  storyName,
  users,
  onTaskClick,
  onDeleteTask,
  onDragStart,
  onPartialUpdateTask
}) => {
  const isBug = task.type === 'Bug';
  const assignee = users.find(u => (u._id || u.user_id) === task.assigned_user);
  const pColor = priorityColor(task.priority);

  // Local state for inline title editing
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.name);

  const handleSaveTitle = () => {
    if (editValue.trim() && editValue.trim() !== task.name) {
      onPartialUpdateTask(task._id, { name: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelTitle = () => {
    setEditValue(task.name);
    setIsEditing(false);
  };

  return (
    <Paper
      elevation={0}
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      sx={{
        p: 1.5,
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        bgcolor: '#fff',
        borderLeft: `4px solid ${isBug ? '#ef4444' : '#eab308'}`,
        transition: 'all 0.15s',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: '#e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          transform: 'translateY(-1px)',
          borderColor: isBug ? '#ef4444' : '#eab308'
        }
      }}
      onClick={() => onTaskClick(task)}
    >
      {/* Card Header Row: Icon, Custom ID, Priority, Estimate, Delete */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: 1, flexWrap: 'wrap' }}>
        {isBug ? (
          <BugReportOutlinedIcon sx={{ fontSize: 16, color: '#ef4444', flexShrink: 0 }} />
        ) : (
          <TaskAltOutlinedIcon sx={{ fontSize: 16, color: '#eab308', flexShrink: 0 }} />
        )}
        
        <Typography sx={{
          fontWeight: 700,
          color: isBug ? '#ef4444' : '#eab308',
          fontSize: '0.62rem',
          bgcolor: isBug ? '#fef2f2' : '#fef9c3',
          px: 0.6,
          py: 0.1,
          borderRadius: '3px',
          flexShrink: 0
        }}>
          {task.custom_id}
        </Typography>
        
        <Box sx={{
          bgcolor: pColor.bg,
          color: pColor.color,
          fontSize: '0.62rem',
          fontWeight: 700,
          px: 0.6,
          py: 0.1,
          borderRadius: '3px',
          border: `1px solid ${pColor.border}`,
          flexShrink: 0
        }}>
          {task.priority || 'Medium'}
        </Box>
        
        {task.estimate_hours > 0 && (
          <Box sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #bfdbfe', flexShrink: 0 }}>
            {task.estimate_hours}h
          </Box>
        )}
        {task.end_date && (
          <Box sx={{ bgcolor: '#fff1f2', color: '#e11d48', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #fecdd3', flexShrink: 0 }}>
            {typeof task.end_date === 'string' ? task.end_date.substring(0, 10) : new Date(task.end_date).toISOString().substring(0, 10)}
          </Box>
        )}

        {/* Delete button (aligned right) */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" sx={{ p: 0.2 }} onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task._id);
          }}>
            <DeleteIcon sx={{ fontSize: 14, color: '#fca5a5' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Task Name Inline Editing */}
      {isEditing ? (
        <Box 
          onClick={(e) => e.stopPropagation()}
          sx={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', mb: 1 }}
        >
          <TextField
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSaveTitle();
              } else if (e.key === 'Escape') {
                handleCancelTitle();
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                handleSaveTitle();
              }, 200);
            }}
            autoFocus
            size="small"
            variant="standard"
            inputProps={{ style: { fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', padding: 0 } }}
            sx={{ width: '150px' }}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveTitle();
            }}
            sx={{ p: '2px', color: '#10b981' }}
          >
            <CheckIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelTitle();
            }}
            sx={{ p: '2px', color: '#ef4444' }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ) : (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setEditValue(task.name);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            mb: 1,
            '&:hover .task-title-edit-icon': { opacity: 1 }
          }}
        >
          <Typography sx={{
            fontWeight: 600,
            color: '#0f172a',
            fontSize: '0.85rem',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mr: 0.5,
            maxWidth: '200px'
          }}>
            {task.name}
          </Typography>
          <EditIcon className="task-title-edit-icon" sx={{ fontSize: 14, color: '#6366f1', opacity: 0, transition: 'opacity 0.2s', flexShrink: 0 }} />
        </Box>
      )}

      {/* Card Footer: Assignee & Parent story info */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
        {/* Project / Story Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '75%' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {projName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {storyName}
          </Typography>
        </Box>

        {/* Assignee Avatar */}
        {assignee ? (
          <Tooltip title={assignee.name} arrow>
            <Avatar sx={{
              width: 20,
              height: 20,
              fontSize: '0.6rem',
              bgcolor: getAvatarColor(assignee.name),
              fontWeight: 'bold',
              color: '#fff'
            }}>
              {getUserInitials(task.assigned_user, users)}
            </Avatar>
          </Tooltip>
        ) : (
          <Box sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '1px dashed #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            color: '#94a3b8'
          }}>
            -
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TaskCard;
