"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, createTheme, CssBaseline, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Paper, Divider, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { toast } from 'react-hot-toast';
import TaskModal from '../components/projects/TaskModal';

const Board = () => {
  const { company, projectId } = useParams();
  const username = typeof window !== 'undefined' ? (localStorage.getItem('username') || '') : '';
  
  const [project, setProject] = useState(null);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Modals
  const [storyModal, setStoryModal] = useState({ open: false, isEdit: false, id: null, name: '', description: '' });
  const [taskModal, setTaskModal] = useState({
    open: false,
    isEdit: false,
    id: null,
    storyId: null,
    type: 'Task',
    status: 'Todo',
    name: '',
    description: '',
    estimateHours: 0,
    assigned_user: '',
    reporter: '',
    end_date: '',
    priority: 'Medium',
    labels: []
  });

  const fetchBoardData = async () => {
    try {
      const [projectsRes, storiesRes] = await Promise.all([
        fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/projects?company=${company}`),
        fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/stories?project_id=${projectId}`)
      ]);
      
      if (projectsRes.ok && storiesRes.ok) {
        const allProjects = await projectsRes.json();
        const curProj = allProjects.find(p => p._id === projectId);
        setProject(curProj);
        
        const fetchedStories = await storiesRes.json();
        setStories(fetchedStories);
        
        // Fetch tasks for all stories in a single optimized request
        if (fetchedStories.length > 0) {
          const storyIds = fetchedStories.map(s => s._id).join(',');
          const tRes = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/tasks?story_ids=${storyIds}`);
          if (tRes.ok) {
            setTasks(await tRes.json());
          }
        } else {
          setTasks([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [projectId]);

  // --- Story Handlers ---
  const handleSaveStory = async () => {
    try {
      let res;
      if (storyModal.isEdit) {
        res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/stories/${storyModal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: storyModal.name, description: storyModal.description })
        });
      } else {
        res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/stories/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: projectId, name: storyModal.name, description: storyModal.description })
        });
      }
      
      if (res.ok) {
        toast.success(storyModal.isEdit ? "Story updated" : "Story created");
        setStoryModal({ open: false, isEdit: false, id: null, name: '', description: '' });
        fetchBoardData();
      }
    } catch (err) {
      toast.error("Error saving story");
    }
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm("Delete Story and ALL its tasks?")) return;
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/stories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Story deleted");
        fetchBoardData();
      }
    } catch (err) {
      toast.error("Error deleting story");
    }
  };

  // --- Task Handlers ---
  const handleSaveTask = async (submittedData) => {
    try {
      const dataToSave = submittedData || taskModal;
      let res;
      if (taskModal.isEdit) {
        res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/tasks/${taskModal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToSave.name,
            description: dataToSave.description,
            type: dataToSave.type,
            status: dataToSave.status === 'Todo' ? 'To Do' : dataToSave.status,
            estimate_hours: parseFloat(dataToSave.estimateHours) || 0,
            assigned_user: dataToSave.assigned_user || null,
            reporter: dataToSave.reporter || null,
            end_date: dataToSave.end_date || null,
            priority: dataToSave.priority || 'Medium',
            labels: dataToSave.labels || [],
            image_path: dataToSave.image_path || null
          })
        });
      } else {
        res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/tasks/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            story_id: dataToSave.story_id || dataToSave.storyId || taskModal.storyId,
            type: dataToSave.type,
            name: dataToSave.name,
            description: dataToSave.description,
            estimate_hours: parseFloat(dataToSave.estimateHours) || 0,
            assigned_user: dataToSave.assigned_user || null,
            reporter: dataToSave.reporter || null,
            end_date: dataToSave.end_date || null,
            priority: dataToSave.priority || 'Medium',
            status: dataToSave.status === 'Todo' ? 'To Do' : (dataToSave.status || 'To Do'),
            labels: dataToSave.labels || [],
            image_path: dataToSave.image_path || null,
            comments: dataToSave.comments || []
          })
        });
      }
      
      if (res.ok) {
        toast.success(taskModal.isEdit ? "Task updated" : "Task created");
        setTaskModal({
          open: false,
          isEdit: false,
          id: null,
          storyId: null,
          type: 'Task',
          status: 'Todo',
          name: '',
          description: '',
          estimateHours: 0,
          assigned_user: '',
          reporter: '',
          end_date: '',
          priority: 'Medium',
          labels: []
        });
        fetchBoardData();
      }
    } catch (err) {
      toast.error("Error saving task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this?")) return;
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted");
        fetchBoardData();
      }
    } catch (err) {
      toast.error("Error deleting task");
    }
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Sidebar company={company} activeMenu="Projects" />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <TopNav company={company} username={username} />
          
          <Box sx={{ p: '10px', overflowY: 'auto', flexGrow: 1 }}>
            {project && (
              <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, borderLeft: '6px solid', borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Typography variant="h4" fontWeight="bold">
                  {project.custom_id} : {project.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {project.description || "No project description provided."}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">Project Dashboard</Typography>
              <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setStoryModal({ open: true, isEdit: false, id: null, name: '', description: '' })}>
                Create Story
              </Button>
            </Box>
            
            <Box sx={{ maxWidth: '100%' }}>
              <Grid container spacing={3}>
                {stories.map(story => (
                  <Grid xs={12} key={story._id}>
                    <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, borderLeft: '4px solid #4caf50' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ width: '60%' }}>
                          <Typography variant="h6" fontWeight="bold">
                            {story.custom_id} : {story.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {story.description || "No description"}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={() => setStoryModal({ open: true, isEdit: true, id: story._id, name: story.name, description: story.description || '' })}><EditIcon fontSize="small"/></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteStory(story._id)}><DeleteIcon fontSize="small"/></IconButton>
                          <Button size="small" variant="outlined" sx={{ ml: 2 }} onClick={() => setTaskModal({ open: true, isEdit: false, id: null, storyId: story._id, type: 'Task', status: 'Todo', name: '', description: '', estimateHours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium', labels: [] })}>
                            + Add Task/Bug
                          </Button>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {tasks.filter(t => t.story_id === story._id).map(task => (
                          <Paper key={task._id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default', borderLeft: `3px solid ${task.type === 'Bug' ? '#f44336' : '#2196f3'}` }}>
                            <Box>
                              <Typography variant="body1">
                                <strong>{task.custom_id}</strong> : {task.name}
                                <Box component="span" sx={{ ml: 2, fontSize: '0.75rem', px: 1, py: 0.5, borderRadius: 1, bgcolor: task.type === 'Bug' ? 'rgba(244,67,54,0.1)' : 'rgba(33,150,243,0.1)', color: task.type === 'Bug' ? '#f44336' : '#2196f3' }}>
                                  {task.type}
                                </Box>
                                <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', px: 1, py: 0.5, borderRadius: 1, bgcolor: task.status === 'Done' ? 'rgba(76,175,80,0.1)' : task.status === 'In Progress' ? 'rgba(255,152,0,0.1)' : 'rgba(158,158,158,0.1)', color: task.status === 'Done' ? '#4caf50' : task.status === 'In Progress' ? '#ff9800' : '#9e9e9e' }}>
                                  {task.status}
                                </Box>
                                {task.estimate_hours > 0 && (
                                  <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                                    ({task.estimate_hours}h)
                                  </Box>
                                )}
                              </Typography>
                              {task.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{task.description}</Typography>}
                            </Box>
                            <Box>
                              <IconButton size="small" onClick={() => setTaskModal({ open: true, isEdit: true, id: task._id, storyId: story._id, type: task.type, status: task.status === 'To Do' || task.status === 'Todo' ? 'Todo' : task.status, name: task.name, description: task.description || '', estimateHours: task.estimate_hours || 0, assigned_user: task.assigned_user || '', reporter: task.reporter || '', end_date: task.end_date ? task.end_date.substring(0, 10) : '', priority: task.priority || 'Medium', labels: task.labels || [] })}><EditIcon fontSize="small"/></IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteTask(task._id)}><DeleteIcon fontSize="small"/></IconButton>
                            </Box>
                          </Paper>
                        ))}
                        {tasks.filter(t => t.story_id === story._id).length === 0 && (
                          <Typography variant="body2" color="text.secondary">No tasks or bugs assigned to this story.</Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Story Modal */}
      <Dialog open={storyModal.open} onClose={() => setStoryModal({...storyModal, open: false})}>
        <DialogTitle>{storyModal.isEdit ? 'Edit Story' : 'Create Story'}</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField autoFocus margin="dense" label="Story Name" fullWidth value={storyModal.name} onChange={e => setStoryModal({...storyModal, name: e.target.value})} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={3} value={storyModal.description} onChange={e => setStoryModal({...storyModal, description: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStoryModal({...storyModal, open: false})}>Cancel</Button>
          <Button onClick={handleSaveStory} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Task/Bug Modal */}
      <TaskModal
        open={taskModal.open}
        onClose={() => setTaskModal(prev => ({ ...prev, open: false }))}
        taskModalIsEdit={taskModal.isEdit}
        activeStoryId={taskModal.storyId}
        setActiveStoryId={(sId) => setTaskModal(prev => ({ ...prev, storyId: sId }))}
        activeProjectId={projectId}
        setActiveProjectId={() => {}}
        storiesByProject={{ [projectId]: stories }}
        taskForm={taskModal}
        setTaskForm={setTaskModal}
        users={[]} // Defaults to standard mock list inside TaskModal
        onSave={handleSaveTask}
        projects={project ? [project] : []}
        showProjectSelect={false}
        activeTaskId={taskModal.id}
      />
    </>
  );
};

export default Board;
