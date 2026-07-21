"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const useProjectData = () => {
  const { company } = useParams();
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const username = typeof window !== 'undefined' ? (localStorage.getItem('username') || '') : '';

  const [projects, setProjects] = useState([]);
  const [storiesByProject, setStoriesByProject] = useState({});
  const [tasksByStory, setTasksByStory] = useState({});
  const [users, setUsers] = useState([]);

  // Project Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    estimate_hours: 0,
    end_date: '',
    priority: 'Medium',
    assigned_user: [],
    reporter: '',
    status: 'Not Started'
  });

  // Story Modal State
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyModalIsEdit, setStoryModalIsEdit] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [storyForm, setStoryForm] = useState({ name: '', description: '', estimate_hours: 0, assigned_user: [], reporter: '', end_date: '', priority: 'Medium', status: 'Not Started' });

  // Task Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalIsEdit, setTaskModalIsEdit] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({ type: 'Task', status: 'To Do', name: '', description: '', estimateHours: 0, assigned_user: '', reporter: '', end_date: '', priority: 'Medium', image_path: '' });

  const fetchAllData = async () => {
    try {
      const treeRes = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/projects?company=${company}&tree=true`);
      if (!treeRes.ok) return;
      const { projects: projectsData, stories: storiesData, tasks: tasksData } = await treeRes.json();

      const uRes = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/users?company_name=${company}`);
      if (uRes.ok) {
        setUsers(await uRes.json());
      }

      const sMap = {};
      const tMap = {};

      for (const p of projectsData) {
        sMap[p._id] = [];
      }
      for (const s of storiesData) {
        tMap[s._id] = [];
        if (sMap[s.project_id]) {
          sMap[s.project_id].push(s);
        }
      }
      for (const t of tasksData) {
        if (tMap[t.story_id]) {
          tMap[t.story_id].push(t);
        }
      }

      setProjects(projectsData.map(p => {
        const projStories = sMap[p._id] || [];
        const storyIds = projStories.map(s => s._id);
        const projTasks = tasksData.filter(t => storyIds.includes(t.story_id));

        let pending = 0;
        let progress = 0;
        let completed = 0;
        let total_est = 0.0;

        for (const t of projTasks) {
          const status = t.status || "To Do";
          if (status === "To Do") pending++;
          else if (status === "In Progress") progress++;
          else if (status === "Done") completed++;
          total_est += parseFloat(t.estimate_hours || 0);
        }

        return {
          ...p,
          story_count: projStories.length,
          task_count: projTasks.length,
          pending_tasks: pending,
          progress_tasks: progress,
          completed_tasks: completed,
          total_estimate_hours: total_est
        };
      }));

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
      const url = editModal ? `${(process.env.NEXT_PUBLIC_API_URL || '')}/projects/${editProjectId}` : `${(process.env.NEXT_PUBLIC_API_URL || '')}/projects/`;
      const method = editModal ? 'PUT' : 'POST';
      const baseBody = {
        name: projectForm.name,
        description: projectForm.description,
        estimate_hours: parseFloat(projectForm.estimate_hours) || 0,
        end_date: projectForm.end_date || null,
        priority: projectForm.priority || 'Medium',
        assigned_user: projectForm.assigned_user || null,
        reporter: projectForm.reporter || null,
        status: projectForm.status || 'Not Started'
      };
      const body = editModal ? { ...baseBody } : { ...baseBody, company };

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
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/projects/${id}`, { method: "DELETE" });
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
      const url = storyModalIsEdit ? `${(process.env.NEXT_PUBLIC_API_URL || '')}/stories/${activeStoryId}` : `${(process.env.NEXT_PUBLIC_API_URL || '')}/stories/`;
      const method = storyModalIsEdit ? 'PUT' : 'POST';
      const baseBody = {
        name: storyForm.name,
        description: storyForm.description,
        estimate_hours: parseFloat(storyForm.estimate_hours) || 0,
        assigned_user: storyForm.assigned_user || null,
        reporter: storyForm.reporter || null,
        end_date: storyForm.end_date || null,
        priority: storyForm.priority || 'Medium',
        status: storyForm.status || 'Not Started'
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
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/stories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Story deleted");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error deleting story");
    }
  };

  // --- TASK HANDLERS ---
  const handleSaveTask = async (submittedData) => {
    try {
      const dataToSave = submittedData || taskForm;
      const url = taskModalIsEdit ? `${(process.env.NEXT_PUBLIC_API_URL || '')}/tasks/${activeTaskId}` : `${(process.env.NEXT_PUBLIC_API_URL || '')}/tasks/`;
      const method = taskModalIsEdit ? 'PUT' : 'POST';
      const baseBody = {
        name: dataToSave.name,
        description: dataToSave.description,
        type: dataToSave.type,
        estimate_hours: parseFloat(dataToSave.estimateHours) || 0,
        assigned_user: dataToSave.assigned_user || null,
        reporter: dataToSave.reporter || null,
        end_date: dataToSave.end_date || null,
        priority: dataToSave.priority || 'Medium',
        status: dataToSave.status || 'To Do',
        image_path: dataToSave.image_path || null
      };

      const body = taskModalIsEdit
        ? { ...baseBody }
        : { ...baseBody, story_id: dataToSave.story_id || activeStoryId, comments: dataToSave.comments || [] };

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
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/tasks/${id}`, { method: "DELETE" });
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
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/tasks/${id}`, {
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
  const handlePartialUpdateStory = async (id, fields) => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/stories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        toast.success("Story updated");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error updating story");
    }
  };

  const handlePartialUpdateProject = async (id, fields) => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || '')}/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        toast.success("Project updated");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Error updating project");
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
    handlePartialUpdateStory,
    handlePartialUpdateProject,
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
