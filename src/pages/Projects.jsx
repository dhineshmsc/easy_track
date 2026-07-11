import React, { useState } from 'react';
import {
  Box, ThemeProvider, CssBaseline, Typography, IconButton, Paper, Tooltip, TextField
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

import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import appleTheme from '../theme';

import { useProjectData } from '../hooks/useProjectData';
import { priorityColor, statusColor, getUserInitials, getAvatarColor } from '../utils/projectsHelper';

import ProjectModal from '../components/projects/ProjectModal';
import StoryModal from '../components/projects/StoryModal';
import TaskModal from '../components/projects/TaskModal';

const Projects = () => {
  const {
    company, username, projects, storiesByProject, tasksByStory, users,
    openModal, setOpenModal, editModal, setEditModal, projectForm, setProjectForm, handleSaveProject, handleDeleteProject,
    storyModalOpen, setStoryModalOpen, storyModalIsEdit, setStoryModalIsEdit, activeStoryId, setActiveStoryId, activeProjectId, setActiveProjectId, storyForm, setStoryForm, handleSaveStory, handleDeleteStory,
    taskModalOpen, setTaskModalOpen, taskModalIsEdit, setTaskModalIsEdit, activeTaskId, setActiveTaskId, taskForm, setTaskForm, handleSaveTask, handleDeleteTask, handlePartialUpdateTask, handlePartialUpdateStory
  } = useProjectData();

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskValue, setEditingTaskValue] = useState("");
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [editingStoryValue, setEditingStoryValue] = useState("");

  return (
    <ThemeProvider theme={appleTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f8fafc' }}>
        <Sidebar company={company} activeMenu="Projects" />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />

          {/* PAGE HEADER */}
          <Box sx={{ px: 3, py: 2, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: -0.5 }}>Board</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>Project · Story · Task overview</Typography>
            </Box>
          </Box>

          {/* BOARD HEADER */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
            <Box sx={{ px: 2, py: 1.5, borderRight: '1px solid #e2e8f0', borderBottom: '3px solid #6366f1', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FolderOutlinedIcon sx={{ fontSize: 16, color: '#6366f1' }} />
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#6366f1', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1 }}>PROJECT</Typography>
              <Box sx={{ bgcolor: '#ede9fe', color: '#6366f1', fontSize: '0.68rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 8 }}>{projects.length}</Box>
            </Box>
            <Box sx={{ px: 2, py: 1.5, borderRight: '1px solid #e2e8f0', borderBottom: '3px solid #10b981', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookmarkBorderOutlinedIcon sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#10b981', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1 }}>STORY</Typography>
              <Box sx={{ bgcolor: '#d1fae5', color: '#059669', fontSize: '0.68rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 8 }}>{Object.values(storiesByProject).flat().length}</Box>
            </Box>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '3px solid', borderImage: 'linear-gradient(to right, #eab308 50%, #ef4444 50%) 1', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TaskAltOutlinedIcon sx={{ fontSize: 16, color: '#eab308' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#eab308', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1, textDecoration: 'underline' }}>TASK</Typography>
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#cbd5e1', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1 }}>|</Typography>
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#ef4444', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1, textDecoration: 'underline' }}>BUG</Typography>
              </Box>
              <Box sx={{ bgcolor: '#fef9c3', color: '#eab308', fontSize: '0.68rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 8 }}>{Object.values(tasksByStory).flat().length}</Box>
            </Box>
          </Box>

          {/* BOARD ROWS */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {projects.map((proj, projIdx) => {
              const stories = storiesByProject[proj._id] || [];
              const rowCount = Math.max(stories.length, 1);
              return (
                <Box key={proj._id} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: projIdx < projects.length - 1 ? '2px solid #e2e8f0' : 'none' }}>

                  {/* PROJECT CARD */}
                  <Box sx={{ gridRow: `1 / ${rowCount + 1}`, borderRight: '1px solid #e2e8f0', p: 1.5, display: 'flex', flexDirection: 'column', alignSelf: 'start', position: 'sticky', top: 0 }}>
                    <Paper elevation={0} sx={{
                      p: 1.5, borderRadius: '8px', border: '1px solid #e2e8f0', bgcolor: '#fff',
                      transition: 'all 0.15s',
                      '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.12)', borderColor: '#a5b4fc' }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#6366f1', fontSize: '0.7rem', bgcolor: '#ede9fe', px: 0.8, py: 0.2, borderRadius: 4 }}>
                          {proj.custom_id}
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                          <IconButton size="small" sx={{ p: 0.3 }} onClick={() => { setProjectForm({ name: proj.name, description: proj.description || '' }); setEditModal(true); }}>
                            <EditIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                          </IconButton>
                          <IconButton size="small" sx={{ p: 0.3 }} onClick={() => handleDeleteProject(proj._id)}>
                            <DeleteIcon sx={{ fontSize: 13, color: '#fca5a5' }} />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.3 }}>{proj.name}</Typography>
                      {proj.description && (
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                          {proj.description.length > 90 ? proj.description.slice(0, 90) + '…' : proj.description}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', mt: 1, display: 'block' }}>
                        {stories.length} {stories.length === 1 ? 'story' : 'stories'}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* STORY + TASK ROWS */}
                  {stories.length === 0 ? (
                    <>
                      <Box sx={{ borderRight: '1px solid #e2e8f0', p: 1.5, minHeight: 64, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 0.5, py: 0.6, borderRadius: '6px', cursor: 'pointer', color: '#94a3b8', transition: '0.15s', '&:hover': { bgcolor: '#f0fdf4', color: '#10b981' } }} onClick={() => { setActiveProjectId(proj._id); setStoryForm({ name: '', description: '', estimate_hours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium' }); setStoryModalIsEdit(false); setStoryModalOpen(true); }}>
                          <AddIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.73rem' }}>Add Story</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ p: 1.5, minHeight: 64 }} />
                    </>
                  ) : (
                    stories.map((story, sIdx) => {
                      const pc = priorityColor(story.priority);
                      const tasks = tasksByStory[story._id] || [];
                      const totalTaskHours = tasks.reduce((sum, t) => sum + (t.estimate_hours || 0), 0);
                      return (
                        <React.Fragment key={story._id}>
                          {/* STORY CARD */}
                          <Box sx={{ borderRight: '1px solid #e2e8f0', borderTop: sIdx > 0 ? '1px solid #f1f5f9' : 'none', p: 1.5 }}>
                            <Paper elevation={0} sx={{
                              pt: '10px', pb: '48px', px: '16px', borderRadius: '8px',
                              minHeight: '200px',
                              border: '1px solid #e2e8f0', bgcolor: '#fff',
                              borderLeft: '4px solid #10b981',
                              transition: 'all 0.15s',
                              cursor: 'pointer',
                              '&:hover': { boxShadow: '0 4px 12px rgba(16,185,129,0.15)', borderColor: '#6ee7b7' }
                            }} onClick={() => {
                              setStoryForm({ name: story.name, description: story.description || '', estimate_hours: story.estimate_hours || 0, assigned_user: story.assigned_user || '', reporter: story.reporter || '', end_date: story.end_date ? story.end_date.substring(0, 10) : '', priority: story.priority || 'Medium' });
                              setActiveStoryId(story._id);
                              setStoryModalIsEdit(true);
                              setStoryModalOpen(true);
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: 1.5 }}>
                                <BookmarkBorderOutlinedIcon sx={{ fontSize: 16, color: '#10b981', flexShrink: 0 }} />
                                <Typography sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.65rem', bgcolor: '#d1fae5', px: 0.6, py: 0.1, borderRadius: '3px', flexShrink: 0 }}>
                                  {story.custom_id}
                                </Typography>
                                <Box sx={{ bgcolor: pc.bg, color: pc.color, fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', border: `1px solid ${pc.border}`, flexShrink: 0 }}>
                                  {story.priority || 'Medium'}
                                </Box>
                                {story.estimate_hours > 0 && (
                                  <Typography sx={{ color: '#94a3b8', fontSize: '0.6rem', fontWeight: 600, flexShrink: 0 }}>{story.estimate_hours}h</Typography>
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
                                      size="small"
                                      variant="standard"
                                      inputProps={{ style: { fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', padding: 0 } }}
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingStoryId(story._id);
                                      setEditingStoryValue(story.name);
                                    }}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                      overflow: 'hidden',
                                      '&:hover .story-title-edit-icon': { opacity: 1 }
                                    }}
                                  >
                                    <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 0.5, flexGrow: 1 }}>
                                      {story.name}
                                    </Typography>
                                    <EditIcon className="story-title-edit-icon" sx={{ fontSize: 16, color: '#6366f1', opacity: 0, transition: 'opacity 0.2s', flexShrink: 0 }} />
                                  </Box>
                                )}
                                {story.assigned_user && (
                                  <Tooltip title={users.find(u => (u._id || u.user_id) === story.assigned_user)?.name || 'Unassigned'}>
                                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: getAvatarColor(story.assigned_user), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                      {getUserInitials(story.assigned_user, users)}
                                    </Box>
                                  </Tooltip>
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
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', mt: 2, display: 'block' }}>
                                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} · {totalTaskHours}h total
                              </Typography>
                            </Paper>
                            {/* Add Story button */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5, px: 0.3, py: 0.5, borderRadius: '6px', cursor: 'pointer', color: '#94a3b8', transition: '0.15s', '&:hover': { bgcolor: '#f0fdf4', color: '#10b981' } }} onClick={() => { setActiveProjectId(proj._id); setStoryForm({ name: '', description: '', estimate_hours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium' }); setStoryModalIsEdit(false); setStoryModalOpen(true); }}>
                              <AddIcon sx={{ fontSize: 13 }} />
                              <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.7rem' }}>Add Story</Typography>
                            </Box>
                          </Box>

                          {/* TASK CARDS */}
                          <Box sx={{ borderTop: sIdx > 0 ? '1px solid #f1f5f9' : 'none', p: '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {tasks.map(task => {
                              const sc = statusColor(task.status);
                              const isBug = task.type === 'Bug';
                              return (
                                <Paper key={task._id} elevation={0} sx={{
                                  px: '8px', py: '7px', borderRadius: '6px',
                                  border: '1px solid #e2e8f0', bgcolor: '#fff',
                                  borderLeft: `3px solid ${isBug ? '#fca5a5' : '#facc15'}`,
                                  transition: 'all 0.15s',
                                  cursor: 'pointer',
                                  '&:hover': { boxShadow: '0 2px 8px rgba(234,179,8,0.1)', borderColor: isBug ? '#fca5a5' : '#facc15' }
                                }} onClick={() => {
                                  setTaskForm({ type: task.type, status: task.status, name: task.name, description: task.description || '', estimateHours: task.estimate_hours || 0, assigned_user: task.assigned_user || '', reporter: task.reporter || '', end_date: task.end_date ? task.end_date.substring(0, 10) : '', priority: task.priority || 'Medium' });
                                  setActiveTaskId(task._id);
                                  setTaskModalIsEdit(true);
                                  setTaskModalOpen(true);
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {isBug ? <BugReportOutlinedIcon sx={{ fontSize: 16, color: '#ef4444', flexShrink: 0 }} /> : <TaskAltOutlinedIcon sx={{ fontSize: 16, color: '#eab308', flexShrink: 0 }} />}
                                    <Typography sx={{ fontWeight: 700, color: isBug ? '#ef4444' : '#eab308', fontSize: '0.65rem', bgcolor: isBug ? '#fef2f2' : '#fef9c3', px: 0.6, py: 0.1, borderRadius: '3px', flexShrink: 0 }}>
                                      {task.custom_id}
                                    </Typography>
                                    <Box sx={{ bgcolor: sc.bg, color: sc.color, fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', flexShrink: 0 }}>{task.status}</Box>
                                    {task.estimate_hours > 0 && (
                                      <Typography sx={{ color: '#94a3b8', fontSize: '0.6rem', fontWeight: 600, flexShrink: 0 }}>{task.estimate_hours}h</Typography>
                                    )}
                                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                      <IconButton size="small" sx={{ p: 0.2 }} onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task._id);
                                      }}>
                                        <DeleteIcon sx={{ fontSize: 16, color: '#fca5a5' }} />
                                      </IconButton>
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
                                          inputProps={{ style: { fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', padding: 0 } }}
                                          sx={{ width: '120px' }}
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
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingTaskId(task._id);
                                          setEditingTaskValue(task.name);
                                        }}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          cursor: 'pointer',
                                          overflow: 'hidden',
                                          '&:hover .task-title-edit-icon': { opacity: 1 }
                                        }}
                                      >
                                        <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 0.5 }}>
                                          {task.name}
                                        </Typography>
                                        <EditIcon className="task-title-edit-icon" sx={{ fontSize: 16, color: '#6366f1', opacity: 0, transition: 'opacity 0.2s', flexShrink: 0 }} />
                                      </Box>
                                    )}
                                    {task.assigned_user && (
                                      <Tooltip title={users.find(u => (u._id || u.user_id) === task.assigned_user)?.name || 'Unassigned'}>
                                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: getAvatarColor(task.assigned_user), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
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
                              setTaskForm({ type: 'Task', status: 'To Do', name: '', description: '', estimateHours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium' });
                              setTaskModalIsEdit(false);
                              setTaskModalOpen(true);
                            }}>
                              <AddIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.75rem' }}>Add Task / Bug</Typography>
                            </Box>
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
                }} onClick={() => { setProjectForm({ name: '', description: '' }); setEditModal(false); setOpenModal(true); }}>
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
        storiesByProject={storiesByProject}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        users={users}
        onSave={handleSaveTask}
      />
    </ThemeProvider>
  );
};

export default Projects;
