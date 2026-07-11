import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const useProjectData = () => {
  const { company } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '';

  const [projects, setProjects] = useState([]);
  const [storiesByProject, setStoriesByProject] = useState({});
  const [tasksByStory, setTasksByStory] = useState({});
  const [users, setUsers] = useState([]);

  // Project Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });

  // Story Modal State
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyModalIsEdit, setStoryModalIsEdit] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [storyForm, setStoryForm] = useState({ name: '', description: '', estimate_hours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium' });

  // Task Modal State
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

  const handlePartialUpdateTask = async (id, fields) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        toast.success("Task updated");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error updating task");
    }
  };

  return {
    company,
    username,
    projects,
    storiesByProject,
    tasksByStory,
    users,
    handlePartialUpdateTask,
    // Project Modal State & Handlers
    openModal,
    setOpenModal,
    editModal,
    setEditModal,
    editProjectId,
    setEditProjectId,
    projectForm,
    setProjectForm,
    handleSaveProject,
    handleDeleteProject,
    // Story Modal State & Handlers
    storyModalOpen,
    setStoryModalOpen,
    storyModalIsEdit,
    setStoryModalIsEdit,
    activeStoryId,
    setActiveStoryId,
    activeProjectId,
    setActiveProjectId,
    storyForm,
    setStoryForm,
    handleSaveStory,
    handleDeleteStory,
    // Task Modal State & Handlers
    taskModalOpen,
    setTaskModalOpen,
    taskModalIsEdit,
    setTaskModalIsEdit,
    activeTaskId,
    setActiveTaskId,
    taskForm,
    setTaskForm,
    handleSaveTask,
    handleDeleteTask,
    fetchAllData
  };
};
