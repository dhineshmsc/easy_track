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
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { toast } from 'react-hot-toast';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#6366f1' }, background: { default: '#0f172a', paper: '#1e293b' } },
  typography: { fontFamily: '"Outfit", "Inter", sans-serif' },
});

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
  const [storyForm, setStoryForm] = useState({ name: '', description: '' });

  // Task Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalIsEdit, setTaskModalIsEdit] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({ type: 'Task', status: 'To Do', name: '', description: '', estimateHours: 0 });

  const fetchAllData = async () => {
    try {
      const pRes = await fetch(`${import.meta.env.VITE_API_URL}/projects?company=${company}`);
      if (!pRes.ok) return;
      const projectsData = await pRes.json();
      setProjects(projectsData);

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
      const body = storyModalIsEdit ? { ...storyForm } : { ...storyForm, project_id: activeProjectId };

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
      const body = taskModalIsEdit 
        ? { name: taskForm.name, description: taskForm.description, type: taskForm.type, status: taskForm.status, estimate_hours: parseFloat(taskForm.estimateHours) || 0 }
        : { story_id: activeStoryId, type: taskForm.type, name: taskForm.name, description: taskForm.description, estimate_hours: parseFloat(taskForm.estimateHours) || 0 };

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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar company={company} activeMenu="Projects" />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <TopNav company={company} username={username} />
          <Box sx={{ p: 4, overflowY: 'auto', flexGrow: 1, overflowX: 'auto' }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, minWidth: 1000 }}>
              <Typography variant="h4" fontWeight="bold">Jira Hierarchy Dashboard</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
                setProjectForm({ name: '', description: '' });
                setEditModal(false);
                setOpenModal(true);
              }}>
                Create Project
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 1200, pb: 10 }}>
              {projects.length === 0 && (
                <Typography color="text.secondary">No projects found. Create one to get started.</Typography>
              )}
              
              {projects.map((proj) => (
                <Box key={proj._id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, bgcolor: 'rgba(99, 102, 241, 0.05)', p: 2.5, borderRadius: 3, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  
                  {/* PROJECT NODE */}
                  <Paper elevation={4} sx={{ 
                    minWidth: 320, width: 320, p: 3, 
                    borderLeft: '4px solid #6366f1', bgcolor: 'background.paper', borderRadius: 2
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ bgcolor: 'rgba(99,102,241,0.2)', color: '#a5b4fc', px: 1, borderRadius: 1 }}>
                        {proj.custom_id}
                      </Typography>
                      <Box>
                        <IconButton size="small" onClick={() => {
                           setProjectForm({ name: proj.name, description: proj.description || '' });
                           setEditProjectId(proj._id);
                           setEditModal(true);
                        }}><EditIcon sx={{ fontSize: 16 }}/></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteProject(proj._id)}>
                           <DeleteIcon sx={{ fontSize: 16 }}/>
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{proj.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>{proj.description}</Typography>
                    <Button size="small" variant="outlined" startIcon={<AddIcon />} fullWidth onClick={() => {
                      setActiveProjectId(proj._id);
                      setStoryForm({ name: '', description: '' });
                      setStoryModalIsEdit(false);
                      setStoryModalOpen(true);
                    }}>Add Story</Button>
                  </Paper>

                  {/* STORIES COLUMN */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
                    {(storiesByProject[proj._id] || []).map(story => (
                      <Box key={story._id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, bgcolor: 'rgba(16, 185, 129, 0.05)', p: 2, borderRadius: 3, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        
                        {/* STORY NODE */}
                        <Paper elevation={3} sx={{ 
                          minWidth: 300, width: 300, p: 2, 
                          borderLeft: '4px solid #10b981', bgcolor: 'background.default', borderRadius: 2
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ bgcolor: 'rgba(16,185,129,0.2)', color: '#6ee7b7', px: 1, borderRadius: 1 }}>
                              {story.custom_id}
                            </Typography>
                            <Box>
                              <IconButton size="small" onClick={() => {
                                setStoryForm({ name: story.name, description: story.description || '' });
                                setActiveStoryId(story._id);
                                setStoryModalIsEdit(true);
                                setStoryModalOpen(true);
                              }}><EditIcon sx={{ fontSize: 16 }}/></IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteStory(story._id)}>
                                 <DeleteIcon sx={{ fontSize: 16 }}/>
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{story.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>{story.description}</Typography>
                          <Button size="small" variant="text" sx={{ color: '#10b981' }} startIcon={<AddIcon />} fullWidth onClick={() => {
                            setActiveStoryId(story._id);
                            setTaskForm({ type: 'Task', status: 'To Do', name: '', description: '', estimateHours: 0 });
                            setTaskModalIsEdit(false);
                            setTaskModalOpen(true);
                          }}>Add Task / Bug</Button>
                        </Paper>

                        {/* TASKS COLUMN */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'rgba(255, 255, 255, 0.02)', p: 2, borderRadius: 2, border: '1px dashed rgba(255,255,255,0.1)' }}>
                          {(tasksByStory[story._id] || []).map(task => (
                            <Paper key={task._id} elevation={2} sx={{ 
                              minWidth: 280, width: 280, p: 2, 
                              borderLeft: `4px solid ${task.type === 'Bug' ? '#ef4444' : '#3b82f6'}`, 
                              bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="caption" sx={{ bgcolor: task.type === 'Bug' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)', color: task.type === 'Bug' ? '#fca5a5' : '#93c5fd', px: 1, borderRadius: 1 }}>
                                    {task.custom_id}
                                  </Typography>
                                  <Typography variant="caption" sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 1, borderRadius: 1 }}>
                                    {task.status}
                                  </Typography>
                                </Box>
                                <Box>
                                  <IconButton size="small" onClick={() => {
                                    setTaskForm({ type: task.type, status: task.status, name: task.name, description: task.description || '', estimateHours: task.estimate_hours || 0 });
                                    setActiveTaskId(task._id);
                                    setTaskModalIsEdit(true);
                                    setTaskModalOpen(true);
                                  }}><EditIcon sx={{ fontSize: 14 }}/></IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleDeleteTask(task._id)}>
                                     <DeleteIcon sx={{ fontSize: 14 }}/>
                                 </IconButton>
                                </Box>
                              </Box>
                              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>{task.name}</Typography>
                              {task.estimate_hours > 0 && (
                                <Typography variant="caption" color="text.secondary" display="block">Estimate: {task.estimate_hours}h</Typography>
                              )}
                            </Paper>
                          ))}
                        </Box>
                        
                      </Box>
                    ))}
                  </Box>

                </Box>
              ))}
            </Box>

          </Box>
        </Box>
      </Box>

      {/* --- MODALS --- */}
      
      {/* Project Modal */}
      <Dialog open={openModal || editModal} onClose={() => { setOpenModal(false); setEditModal(false); }}>
        <DialogTitle>{editModal ? 'Edit Project' : 'Create Project'}</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField autoFocus margin="dense" label="Project Name" fullWidth value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={3} value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
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
          <TextField autoFocus margin="dense" label="Story Name" fullWidth value={storyForm.name} onChange={e => setStoryForm({...storyForm, name: e.target.value})} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={3} value={storyForm.description} onChange={e => setStoryForm({...storyForm, description: e.target.value})} />
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
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Type</InputLabel>
              <Select value={taskForm.type} label="Type" onChange={e => setTaskForm({...taskForm, type: e.target.value})}>
                <MenuItem value="Task">Task</MenuItem>
                <MenuItem value="Bug">Bug</MenuItem>
              </Select>
            </FormControl>
            {taskModalIsEdit && (
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select value={taskForm.status} label="Status" onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
          <TextField margin="dense" label="Name" fullWidth value={taskForm.name} onChange={e => setTaskForm({...taskForm, name: e.target.value})} />
          <TextField margin="dense" label="Estimated Hours" type="number" fullWidth value={taskForm.estimateHours} onChange={e => setTaskForm({...taskForm, estimateHours: e.target.value})} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={3} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
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
