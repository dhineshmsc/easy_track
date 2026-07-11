import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, ThemeProvider, createTheme, CssBaseline, Typography, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Paper, Grid, Divider, FormControl, InputLabel, Select, MenuItem, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { toast } from 'react-hot-toast';

import appleTheme from '../theme';

const ConnectorArrow = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.2)', mx: 1 }}>
    <Box sx={{ width: 30, height: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
    <ArrowRightAltIcon sx={{ ml: -1 }} />
  </Box>
);

const Projects = () => {
  const { company } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '';

  const [projects, setProjects] = useState([]);
  const [storiesByProject, setStoriesByProject] = useState({});
  const [tasksByStory, setTasksByStory] = useState({});
  const [users, setUsers] = useState([]);

  // Project Modal
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });

  // Story Modal
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyModalIsEdit, setStoryModalIsEdit] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [storyForm, setStoryForm] = useState({ name: '', description: '', estimate_hours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium' });

  // Task Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalIsEdit, setTaskModalIsEdit] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({ type: 'Task', status: 'To Do', name: '', description: '', estimateHours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium' });

  const fetchAllData = async () => {
    try {
      const pRes = await fetch(`${import.meta.env.VITE_API_URL}/projects?company=${company}`);
      if (!pRes.ok) return;
      const projectsData = await pRes.json();
      setProjects(projectsData);

      const uRes = await fetch(`${import.meta.env.VITE_API_URL}/users?company_name=${company}`);
      if (uRes.ok) {
        setUsers(await uRes.json());
      }

      const sMap = {};
      const tMap = {};

      for (const p of projectsData) {
        const sRes = await fetch(`${import.meta.env.VITE_API_URL}/stories?project_id=${p._id}`);
        if (sRes.ok) {
          const storiesData = await sRes.json();
          sMap[p._id] = storiesData;

          for (const s of storiesData) {
            const tRes = await fetch(`${import.meta.env.VITE_API_URL}/tasks?story_id=${s._id}`);
            if (tRes.ok) {
              tMap[s._id] = await tRes.json();
            }
          }
        }
      }
      setStoriesByProject(sMap);
      setTasksByStory(tMap);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [company]);

  // --- PROJECT HANDLERS ---
  const handleSaveProject = async () => {
    try {
      const url = editModal ? `${import.meta.env.VITE_API_URL}/projects/${editProjectId}` : `${import.meta.env.VITE_API_URL}/projects/`;
      const method = editModal ? 'PUT' : 'POST';
      const body = editModal ? { ...projectForm } : { ...projectForm, company };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editModal ? "Project updated" : "Project created");
        setOpenModal(false);
        setEditModal(false);
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error saving project");
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete project and ALL stories/tasks?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error deleting project");
    }
  };

  // --- STORY HANDLERS ---
  const handleSaveStory = async () => {
    try {
      const url = storyModalIsEdit ? `${import.meta.env.VITE_API_URL}/stories/${activeStoryId}` : `${import.meta.env.VITE_API_URL}/stories/`;
      const method = storyModalIsEdit ? 'PUT' : 'POST';
      const baseBody = {
        name: storyForm.name,
        description: storyForm.description,
        estimate_hours: parseFloat(storyForm.estimate_hours) || 0,
        assigned_user: storyForm.assigned_user || null,
        reporter: storyForm.reporter || null,
        end_date: storyForm.end_date || null,
        priority: storyForm.priority || 'Medium'
      };
      const body = storyModalIsEdit ? { ...baseBody } : { ...baseBody, project_id: activeProjectId };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(storyModalIsEdit ? "Story updated" : "Story created");
        setStoryModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error saving story");
    }
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm("Delete story and ALL tasks?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Story deleted");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error deleting story");
    }
  };

  // --- TASK HANDLERS ---
  const handleSaveTask = async () => {
    try {
      const url = taskModalIsEdit ? `${import.meta.env.VITE_API_URL}/tasks/${activeTaskId}` : `${import.meta.env.VITE_API_URL}/tasks/`;
      const method = taskModalIsEdit ? 'PUT' : 'POST';
      const baseBody = {
        name: taskForm.name,
        description: taskForm.description,
        type: taskForm.type,
        estimate_hours: parseFloat(taskForm.estimateHours) || 0,
        assigned_user: taskForm.assigned_user || null,
        reporter: taskForm.reporter || null,
        end_date: taskForm.end_date || null,
        priority: taskForm.priority || 'Medium'
      };
      if (taskModalIsEdit) baseBody.status = taskForm.status;

      const body = taskModalIsEdit
        ? { ...baseBody }
        : { ...baseBody, story_id: activeStoryId };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(taskModalIsEdit ? "Task updated" : "Task created");
        setTaskModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error saving task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete task?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error deleting task");
    }
  };

  // --- HELPERS ---
  const priorityColor = (p) => ({
    Critical: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
    High:     { bg: '#fff7ed', color: '#ea580c', border: '#fdba74' },
    Medium:   { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
    Low:      { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
  }[p] || { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' });

  const statusColor = (s) => ({
    'To Do':       { bg: '#f1f5f9', color: '#475569' },
    'In Progress': { bg: '#eff6ff', color: '#2563eb' },
    'Done':        { bg: '#f0fdf4', color: '#16a34a' },
  }[s] || { bg: '#f1f5f9', color: '#64748b' });

  const getUserInitials = (userId) => {
    const u = users.find(u => (u._id || u.user_id) === userId);
    if (!u) return '?';
    return u.name ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  const getAvatarColor = (str) => {
    const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

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
            <Box sx={{ px: 2, py: 1.5, borderBottom: '3px solid #3b82f6', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TaskAltOutlinedIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#3b82f6', letterSpacing: 1.5, fontSize: '0.75rem', lineHeight: 1 }}>TASK | BUG</Typography>
              <Box sx={{ bgcolor: '#dbeafe', color: '#2563eb', fontSize: '0.68rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 8 }}>{Object.values(tasksByStory).flat().length}</Box>
            </Box>
          </Box>

          {/* BOARD ROWS */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {projects.map((proj, projIdx) => {
              const stories = storiesByProject[proj._id] || [];
              // Build flat rows: each story is 1 row; project card spans first story's row (rowSpan via position)
              const rowCount = Math.max(stories.length, 1);
              return (
                <Box key={proj._id} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: projIdx < projects.length - 1 ? '2px solid #e2e8f0' : 'none' }}>

                  {/* PROJECT CARD — spans all story rows for this project */}
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
                          <IconButton size="small" sx={{ p: 0.3 }} onClick={() => { setProjectForm({ name: proj.name, description: proj.description || '' }); setEditProjectId(proj._id); setEditModal(true); }}>
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
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.68rem', mt: 1, display: 'block' }}>
                        {stories.length} {stories.length === 1 ? 'story' : 'stories'}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* STORY + TASK ROWS */}
                  {stories.length === 0 ? (
                    // Empty row placeholder when no stories — Add Story button in story column
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
                      return (
                        <React.Fragment key={story._id}>
                          {/* STORY CARD */}
                          <Box sx={{ borderRight: '1px solid #e2e8f0', borderTop: sIdx > 0 ? '1px solid #f1f5f9' : 'none', p: 1.5 }}>
                            <Paper elevation={0} sx={{
                              p: 1.5, borderRadius: '8px', border: '1px solid #e2e8f0', bgcolor: '#fff',
                              borderLeft: `3px solid ${pc.border}`,
                              transition: 'all 0.15s',
                              '&:hover': { boxShadow: '0 4px 12px rgba(16,185,129,0.1)', borderColor: '#6ee7b7' }
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.7rem', bgcolor: '#d1fae5', px: 0.8, py: 0.2, borderRadius: 4 }}>
                                  {story.custom_id}
                                </Typography>
                                <Box sx={{ display: 'flex' }}>
                                  <IconButton size="small" sx={{ p: 0.3 }} onClick={() => {
                                    setStoryForm({ name: story.name, description: story.description || '', estimate_hours: story.estimate_hours || 0, assigned_user: story.assigned_user || '', reporter: story.reporter || '', end_date: story.end_date ? story.end_date.substring(0, 10) : '', priority: story.priority || 'Medium' });
                                    setActiveStoryId(story._id);
                                    setStoryModalIsEdit(true);
                                    setStoryModalOpen(true);
                                  }}>
                                    <EditIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                                  </IconButton>
                                  <IconButton size="small" sx={{ p: 0.3 }} onClick={() => handleDeleteStory(story._id)}>
                                    <DeleteIcon sx={{ fontSize: 13, color: '#fca5a5' }} />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#0f172a', fontSize: '0.88rem', lineHeight: 1.3 }}>{story.name}</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1, flexWrap: 'wrap' }}>
                                <Box sx={{ bgcolor: pc.bg, color: pc.color, fontSize: '0.65rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 4, border: `1px solid ${pc.border}` }}>
                                  {story.priority || 'Medium'}
                                </Box>
                                {story.estimate_hours > 0 && (
                                  <Box sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontSize: '0.65rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 4 }}>
                                    {story.estimate_hours}h
                                  </Box>
                                )}
                                {story.assigned_user && (
                                  <Tooltip title={getUserInitials(story.assigned_user)}>
                                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: getAvatarColor(story.assigned_user), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: '#fff' }}>
                                      {getUserInitials(story.assigned_user)}
                                    </Box>
                                  </Tooltip>
                                )}
                              </Box>
                            </Paper>
                            {/* Add Story button — at bottom of each story card */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5, px: 0.3, py: 0.5, borderRadius: '6px', cursor: 'pointer', color: '#94a3b8', transition: '0.15s', '&:hover': { bgcolor: '#f0fdf4', color: '#10b981' } }} onClick={() => { setActiveProjectId(proj._id); setStoryForm({ name: '', description: '', estimate_hours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium' }); setStoryModalIsEdit(false); setStoryModalOpen(true); }}>
                              <AddIcon sx={{ fontSize: 13 }} />
                              <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.7rem' }}>Add Story</Typography>
                            </Box>
                          </Box>

                          {/* TASK CARDS for this story — in same row */}
                          <Box sx={{ borderTop: sIdx > 0 ? '1px solid #f1f5f9' : 'none', p: '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {tasks.map(task => {
                              const tpc = priorityColor(task.priority);
                              const sc = statusColor(task.status);
                              const isBug = task.type === 'Bug';
                              return (
                                <Paper key={task._id} elevation={0} sx={{
                                  px: '8px', py: '5px', borderRadius: '6px',
                                  border: '1px solid #e2e8f0', bgcolor: '#fff',
                                  borderLeft: `3px solid ${isBug ? '#fca5a5' : '#93c5fd'}`,
                                  transition: 'all 0.15s',
                                  '&:hover': { boxShadow: '0 2px 8px rgba(59,130,246,0.1)', borderColor: '#93c5fd' }
                                }}>
                                  {/* LINE 1: icon | ID | status | hours | edit/delete */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {isBug ? <BugReportOutlinedIcon sx={{ fontSize: 12, color: '#ef4444', flexShrink: 0 }} /> : <TaskAltOutlinedIcon sx={{ fontSize: 12, color: '#3b82f6', flexShrink: 0 }} />}
                                    <Typography sx={{ fontWeight: 700, color: isBug ? '#ef4444' : '#3b82f6', fontSize: '0.65rem', bgcolor: isBug ? '#fef2f2' : '#eff6ff', px: 0.6, py: 0.1, borderRadius: '3px', flexShrink: 0 }}>
                                      {task.custom_id}
                                    </Typography>
                                    <Box sx={{ bgcolor: sc.bg, color: sc.color, fontSize: '0.6rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', flexShrink: 0 }}>{task.status}</Box>
                                    {task.estimate_hours > 0 && (
                                      <Typography sx={{ color: '#94a3b8', fontSize: '0.6rem', fontWeight: 600, flexShrink: 0 }}>{task.estimate_hours}h</Typography>
                                    )}
                                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                      <IconButton size="small" sx={{ p: 0.2 }} onClick={() => {
                                        setTaskForm({ type: task.type, status: task.status, name: task.name, description: task.description || '', estimateHours: task.estimate_hours || 0, assigned_user: task.assigned_user || '', reporter: task.reporter || '', end_date: task.end_date ? task.end_date.substring(0, 10) : '', priority: task.priority || 'Medium' });
                                        setActiveTaskId(task._id);
                                        setTaskModalIsEdit(true);
                                        setTaskModalOpen(true);
                                      }}><EditIcon sx={{ fontSize: 11, color: '#cbd5e1' }} /></IconButton>
                                      <IconButton size="small" sx={{ p: 0.2 }} onClick={() => handleDeleteTask(task._id)}>
                                        <DeleteIcon sx={{ fontSize: 11, color: '#fca5a5' }} />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                  {/* LINE 2: title (left) | avatar (right) */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '2px' }}>
                                    <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 1 }}>{task.name}</Typography>
                                    {task.assigned_user && (
                                      <Tooltip title={getUserInitials(task.assigned_user)}>
                                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: getAvatarColor(task.assigned_user), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                          {getUserInitials(task.assigned_user)}
                                        </Box>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </Paper>
                              );
                            })}
                            {/* Add Task button — per story row */}
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

      {/* Project Modal */}
      <Dialog open={openModal || editModal} onClose={() => { setOpenModal(false); setEditModal(false); }}>
        <DialogTitle>{editModal ? 'Edit Project' : 'Create Project'}</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField autoFocus margin="dense" label="Project Name" fullWidth value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={3} value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenModal(false); setEditModal(false); }}>Cancel</Button>
          <Button onClick={handleSaveProject} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Story Modal */}
      <Dialog open={storyModalOpen} onClose={() => setStoryModalOpen(false)}>
        <DialogTitle>{storyModalIsEdit ? 'Edit Story' : 'Create Story'}</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <FormControl fullWidth margin="dense" sx={{ mb: 1 }}>
            <InputLabel>Parent Project</InputLabel>
            <Select value={activeProjectId || ''} label="Parent Project" onChange={e => setActiveProjectId(e.target.value)}>
              {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField autoFocus margin="dense" label="Story Name" fullWidth value={storyForm.name} onChange={e => setStoryForm({ ...storyForm, name: e.target.value })} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={3} value={storyForm.description} onChange={e => setStoryForm({ ...storyForm, description: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField margin="dense" label="Estimated Hours" type="number" fullWidth value={storyForm.estimate_hours} onChange={e => setStoryForm({ ...storyForm, estimate_hours: e.target.value })} />
            <TextField margin="dense" label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={storyForm.end_date} onChange={e => setStoryForm({ ...storyForm, end_date: e.target.value })} />
            <FormControl fullWidth margin="dense">
              <InputLabel>Priority</InputLabel>
              <Select value={storyForm.priority} label="Priority" onChange={e => setStoryForm({ ...storyForm, priority: e.target.value })}>
                <MenuItem value="Critical">Critical</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Assignee</InputLabel>
              <Select value={storyForm.assigned_user} label="Assignee" onChange={e => setStoryForm({ ...storyForm, assigned_user: e.target.value })}>
                <MenuItem value=""><em>None</em></MenuItem>
                {users.map(u => <MenuItem key={u._id} value={u._id || u.user_id}>{u.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Reporter</InputLabel>
              <Select value={storyForm.reporter} label="Reporter" onChange={e => setStoryForm({ ...storyForm, reporter: e.target.value })}>
                <MenuItem value=""><em>None</em></MenuItem>
                {users.map(u => <MenuItem key={u._id} value={u._id || u.user_id}>{u.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStoryModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStory} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Task Modal */}
      <Dialog open={taskModalOpen} onClose={() => setTaskModalOpen(false)}>
        <DialogTitle>{taskModalIsEdit ? 'Edit Task' : 'Create Task/Bug'}</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <FormControl fullWidth margin="dense" sx={{ mb: 1 }}>
            <InputLabel>Parent Story</InputLabel>
            <Select value={activeStoryId || ''} label="Parent Story" onChange={e => setActiveStoryId(e.target.value)}>
              {activeProjectId && (storiesByProject[activeProjectId] || []).map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Type</InputLabel>
              <Select value={taskForm.type} label="Type" onChange={e => setTaskForm({ ...taskForm, type: e.target.value })}>
                <MenuItem value="Task">Task</MenuItem>
                <MenuItem value="Bug">Bug</MenuItem>
              </Select>
            </FormControl>
            {taskModalIsEdit && (
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select value={taskForm.status} label="Status" onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
          <TextField margin="dense" label="Name" fullWidth value={taskForm.name} onChange={e => setTaskForm({ ...taskForm, name: e.target.value })} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={3} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField margin="dense" label="Estimated Hours" type="number" fullWidth value={taskForm.estimateHours} onChange={e => setTaskForm({ ...taskForm, estimateHours: e.target.value })} />
            <TextField margin="dense" label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={taskForm.end_date} onChange={e => setTaskForm({ ...taskForm, end_date: e.target.value })} />
            <FormControl fullWidth margin="dense">
              <InputLabel>Priority</InputLabel>
              <Select value={taskForm.priority} label="Priority" onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <MenuItem value="Critical">Critical</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Assignee</InputLabel>
              <Select value={taskForm.assigned_user} label="Assignee" onChange={e => setTaskForm({ ...taskForm, assigned_user: e.target.value })}>
                <MenuItem value=""><em>None</em></MenuItem>
                {users.map(u => <MenuItem key={u._id} value={u._id || u.user_id}>{u.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Reporter</InputLabel>
              <Select value={taskForm.reporter} label="Reporter" onChange={e => setTaskForm({ ...taskForm, reporter: e.target.value })}>
                <MenuItem value=""><em>None</em></MenuItem>
                {users.map(u => <MenuItem key={u._id} value={u._id || u.user_id}>{u.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default Projects;
