import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Tooltip, IconButton, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { priorityColor, getUserInitials, getAvatarColor } from '../../utils/projectsHelper';

const getStatusColor = (status) => {
  const s = (status || '').trim().toLowerCase();
  if (s === 'todo' || s === 'to do') return '#64748b';
  if (s === 'developing' || s === 'in progress') return '#0066cc';
  if (s === 'code review') return '#7c3aed';
  if (s === 'testing') return '#ea580c';
  if (s === 'deploy') return '#059669';
  if (s === 'done') return '#16a34a';
  return '#64748b';
};

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
  const statusColor = getStatusColor(task.status);

  const isTodoMode = (task.status || '').trim().toLowerCase() === 'todo' || (task.status || '').trim().toLowerCase() === 'to do';
  const isDevelopingMode = (task.status || '').trim().toLowerCase() === 'developing';
  const isTestingMode = (task.status || '').trim().toLowerCase() === 'testing';
  const isCodeReviewMode = (task.status || '').trim().toLowerCase() === 'code review';
  const isDeployMode = (task.status || '').trim().toLowerCase() === 'deploy' || (task.status || '').trim().toLowerCase() === 'deploying';
  
  const devUser = task.team_assignment?.developer?.user_id
    ? users.find(u => (u._id || u.user_id || u.id) === task.team_assignment.developer.user_id)
    : null;

  const testerUser = task.team_assignment?.tester?.user_id
    ? users.find(u => (u._id || u.user_id || u.id) === task.team_assignment.tester.user_id)
    : null;

  const reviewerUser = task.team_assignment?.code_reviewer?.user_id
    ? users.find(u => (u._id || u.user_id || u.id) === task.team_assignment.code_reviewer.user_id)
    : null;

  const deployerUser = task.team_assignment?.deployer?.user_id
    ? users.find(u => (u._id || u.user_id || u.id) === task.team_assignment.deployer.user_id)
    : null;

  const teamUsers = [];
  const addTeamUser = (userId, role) => {
    if (!userId) return;
    const u = users.find(x => (x._id || x.user_id || x.id) === userId);
    if (!u) return;
    const id = u._id || u.user_id || u.id;
    const existing = teamUsers.find(x => (x._id || x.user_id || x.id) === id);
    if (existing) {
      if (!existing.roles.includes(role)) {
        existing.roles.push(role);
      }
    } else {
      teamUsers.push({ ...u, roles: [role] });
    }
  };

  if (task.team_assignment) {
    addTeamUser(task.team_assignment.developer?.user_id, 'Developer');
    addTeamUser(task.team_assignment.tester?.user_id, 'Tester');
    addTeamUser(task.team_assignment.code_reviewer?.user_id, 'Code Reviewer');
    addTeamUser(task.team_assignment.deployer?.user_id, 'Deployer');
  }

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
        p: 1.2,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderLeft: `4px solid ${statusColor}`,
        transition: 'all 0.15s',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2c2c2e' : '#f1f5f9',
          boxShadow: `0 4px 14px ${statusColor}33`,
          transform: 'translateY(-1.5px)',
          borderColor: statusColor
        }
      }}
      onClick={() => onTaskClick(task)}
    >
      {/* Card Header Row: Icon, Custom ID, Priority, Estimate, Date | Delete always visible */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', mb: 0.8 }}>
        {/* Badges — clip when overflow, never push delete off screen */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <Tooltip title={isBug ? 'Bug' : 'Task'} arrow placement="top">
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {isBug ? (
                <BugReportOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} />
              ) : (
                <TaskAltOutlinedIcon sx={{ fontSize: 16, color: '#eab308' }} />
              )}
            </Box>
          </Tooltip>

          <Tooltip title={`Serial No: ${task.custom_id}`} arrow placement="top">
            <Typography sx={{
              fontWeight: 700,
              color: isBug ? '#ef4444' : '#eab308',
              fontSize: '0.62rem',
              bgcolor: isBug ? '#fef2f2' : '#fef9c3',
              px: 0.6,
              py: 0.1,
              borderRadius: '3px',
              flexShrink: 0,
              cursor: 'default'
            }}>
              {task.custom_id}
            </Typography>
          </Tooltip>

          <Tooltip title={`Priority: ${task.priority || 'Medium'}`} arrow placement="top">
            <Box sx={{
              bgcolor: pColor.bg,
              color: pColor.color,
              fontSize: '0.62rem',
              fontWeight: 700,
              px: 0.6,
              py: 0.1,
              borderRadius: '3px',
              border: `1px solid ${pColor.border}`,
              flexShrink: 0,
              cursor: 'default'
            }}>
              {task.priority || 'Medium'}
            </Box>
          </Tooltip>

          {task.work_status && (
            <Tooltip title={`Work Status: ${task.work_status}`} arrow placement="top">
              <Box sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.15)' : '#eff6ff',
                color: (theme) => theme.palette.mode === 'dark' ? '#a5b4fc' : '#1e40af',
                fontSize: '0.62rem',
                fontWeight: 700,
                px: 0.6,
                py: 0.1,
                borderRadius: '3px',
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.3)' : '#bfdbfe',
                flexShrink: 0,
                cursor: 'default'
              }}>
                {task.work_status}
              </Box>
            </Tooltip>
          )}

          {(() => {
            const displayHours = (() => {
              if (isDevelopingMode) return task.team_assignment?.developer?.estimate_hours || 0;
              if (isTestingMode) return task.team_assignment?.tester?.estimate_hours || 0;
              if (isCodeReviewMode) return task.team_assignment?.code_reviewer?.estimate_hours || 0;
              if (isDeployMode) return task.team_assignment?.deployer?.estimate_hours || 0;
              return task.estimate_hours || 0;
            })();

            const tooltipTitle = (() => {
              if (isDevelopingMode) return `Developer Estimate: ${displayHours}h`;
              if (isTestingMode) return `Tester Estimate: ${displayHours}h`;
              if (isCodeReviewMode) return `Code Reviewer Estimate: ${displayHours}h`;
              if (isDeployMode) return `Deployer Estimate: ${displayHours}h`;
              return `Estimate Hours: ${displayHours}h`;
            })();

            return displayHours > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flexShrink: 0 }}>
                <Tooltip title={tooltipTitle} arrow placement="top">
                  <Box sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #bfdbfe', flexShrink: 0, cursor: 'default' }}>
                    {displayHours}h
                  </Box>
                </Tooltip>
                {task.team_assignment && (
                  <Tooltip
                    title={
                      <Box sx={{ p: 0.5, maxWidth: 260 }}>
                        <Typography variant="caption" sx={{ color: '#fff', display: 'block', textAlign: 'center', lineHeight: 1.4 }}>
                          <strong>Developer:</strong> {task.team_assignment.developer?.estimate_hours || 0}h,{' '}
                          <strong>Tester:</strong> {task.team_assignment.tester?.estimate_hours || 0}h,{' '}
                          <strong>Code Reviewer:</strong> {task.team_assignment.code_reviewer?.estimate_hours || 0}h,{' '}
                          <strong>Deployer:</strong> {task.team_assignment.deployer?.estimate_hours || 0}h
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#1e40af', cursor: 'pointer' }}>
                      <InfoOutlinedIcon sx={{ fontSize: 13 }} />
                    </Box>
                  </Tooltip>
                )}
              </Box>
            ) : null;
          })()}

          {task.end_date && (
            <Tooltip title={`Due Date: ${typeof task.end_date === 'string' ? task.end_date.substring(0, 10) : new Date(task.end_date).toISOString().substring(0, 10)}`} arrow placement="top">
              <Box sx={{ bgcolor: '#fff1f2', color: '#e11d48', fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: '1px solid #fecdd3', flexShrink: 0, cursor: 'default' }}>
                {typeof task.end_date === 'string' ? task.end_date.substring(0, 10) : new Date(task.end_date).toISOString().substring(0, 10)}
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Delete button — always visible, never pushed off */}
        <Tooltip title="Delete Task" arrow placement="top">
          <IconButton size="small" sx={{ p: 0.2, flexShrink: 0 }} onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task._id);
          }}>
            <DeleteIcon sx={{ fontSize: 14, color: '#fca5a5' }} />
          </IconButton>
        </Tooltip>
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
            inputProps={{ style: { fontSize: '1.15rem', fontWeight: 600, color: 'inherit', padding: 0 } }}
            sx={{ width: '200px' }}
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
          sx={{
            display: 'flex',
            width: 'fit-content',
            alignItems: 'center',
            overflow: 'hidden',
            mb: 1,
            '&:hover .task-title-edit-icon': { opacity: 1 }
          }}
        >
          <Typography sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '1.15rem',
            lineHeight: 1.2,
            mr: 0.5,
            wordBreak: 'break-word',
          }}>
            {task.name}
          </Typography>
          <IconButton
            className="task-title-edit-icon"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setEditValue(task.name);
            }}
            sx={{
              p: '2px',
              color: '#6366f1',
              opacity: 0,
              transition: 'opacity 0.2s',
              flexShrink: 0
            }}
          >
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}

      {/* Card Footer: Assignee & Parent story info */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
        {/* Project / Story Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '75%' }}>
          <Tooltip title={`Project: ${projName}`} arrow placement="bottom-start">
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default' }}>
              {projName}
            </Typography>
          </Tooltip>
          <Tooltip title={`Story: ${storyName}`} arrow placement="bottom-start">
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default' }}>
              {storyName}
            </Typography>
          </Tooltip>
        </Box>

        {/* Assignee Avatar */}
        {isTodoMode && teamUsers.length > 0 ? (
          <Box sx={{ display: 'flex', gap: -0.5, alignItems: 'center' }}>
            {teamUsers.map((tu) => {
              const id = tu._id || tu.user_id || tu.id;
              const initials = (tu.name || tu.username || '?').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();
              return (
                <Tooltip key={id} title={`${tu.name || tu.username} (${tu.roles.join(', ')})`} arrow>
                  <Avatar sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: getAvatarColor(tu.name || tu.username || ''),
                    fontWeight: 700,
                    color: '#fff',
                    border: '1.5px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    lineHeight: '24px',
                    userSelect: 'none',
                    marginLeft: teamUsers.indexOf(tu) > 0 ? '-6px' : 0
                  }}>
                    <Box component="span" sx={{ display: 'block', textAlign: 'center', lineHeight: 1 }}>
                      {initials}
                    </Box>
                  </Avatar>
                </Tooltip>
              );
            })}
          </Box>
        ) : isDevelopingMode && devUser ? (
          <Tooltip title={`${devUser.name || devUser.username} (Developer)`} arrow>
            <Avatar sx={{
              width: 24,
              height: 24,
              fontSize: '0.85rem',
              bgcolor: getAvatarColor(devUser.name || devUser.username || ''),
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              letterSpacing: 0,
              lineHeight: '24px',
              userSelect: 'none',
            }}>
              <Box component="span" sx={{ display: 'block', textAlign: 'center', lineHeight: 1, mt: '1px' }}>
                {(devUser.name || devUser.username || '?').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </Box>
            </Avatar>
          </Tooltip>
        ) : isTestingMode && testerUser ? (
          <Tooltip title={`${testerUser.name || testerUser.username} (Tester)`} arrow>
            <Avatar sx={{
              width: 24,
              height: 24,
              fontSize: '0.85rem',
              bgcolor: getAvatarColor(testerUser.name || testerUser.username || ''),
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              letterSpacing: 0,
              lineHeight: '24px',
              userSelect: 'none',
            }}>
              <Box component="span" sx={{ display: 'block', textAlign: 'center', lineHeight: 1, mt: '1px' }}>
                {(testerUser.name || testerUser.username || '?').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </Box>
            </Avatar>
          </Tooltip>
        ) : isCodeReviewMode && reviewerUser ? (
          <Tooltip title={`${reviewerUser.name || reviewerUser.username} (Code Reviewer)`} arrow>
            <Avatar sx={{
              width: 24,
              height: 24,
              fontSize: '0.85rem',
              bgcolor: getAvatarColor(reviewerUser.name || reviewerUser.username || ''),
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              letterSpacing: 0,
              lineHeight: '24px',
              userSelect: 'none',
            }}>
              <Box component="span" sx={{ display: 'block', textAlign: 'center', lineHeight: 1, mt: '1px' }}>
                {(reviewerUser.name || reviewerUser.username || '?').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </Box>
            </Avatar>
          </Tooltip>
        ) : isDeployMode && deployerUser ? (
          <Tooltip title={`${deployerUser.name || deployerUser.username} (Deployer)`} arrow>
            <Avatar sx={{
              width: 24,
              height: 24,
              fontSize: '0.85rem',
              bgcolor: getAvatarColor(deployerUser.name || deployerUser.username || ''),
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              letterSpacing: 0,
              lineHeight: '24px',
              userSelect: 'none',
            }}>
              <Box component="span" sx={{ display: 'block', textAlign: 'center', lineHeight: 1, mt: '1px' }}>
                {(deployerUser.name || deployerUser.username || '?').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </Box>
            </Avatar>
          </Tooltip>
        ) : assignee ? (
          <Tooltip title={assignee.name} arrow>
            <Avatar sx={{
              width: 24,
              height: 24,
              fontSize: '0.85rem',
              bgcolor: getAvatarColor(assignee.name),
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              letterSpacing: 0,
              lineHeight: '24px',
              userSelect: 'none',
            }}>
              <Box component="span" sx={{ display: 'block', textAlign: 'center', lineHeight: 1, mt: '1px' }}>
                {getUserInitials(task.assigned_user, users)}
              </Box>
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
