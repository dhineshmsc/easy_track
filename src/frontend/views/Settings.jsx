"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, CssBaseline, Typography, Card, CardContent, Button, TextField,
  FormControl, RadioGroup, FormControlLabel, Radio, Divider, Grid, Switch,
  Tabs, Tab, IconButton, Tooltip, Chip, Paper, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';

import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircle';
import CodeIcon from '@mui/icons-material/Code';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BugReportIcon from '@mui/icons-material/BugReport';

import { toast } from 'react-hot-toast';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { useThemeMode } from '../context/ThemeContext';
import { useWorkflow, DEFAULT_WORKFLOW } from '../context/WorkflowContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#64748b', '#0284c7', '#7c3aed', '#db2777', '#059669',
  '#16a34a', '#d97706', '#ea580c', '#dc2626', '#4f46e5'
];

const ICON_MAP = {
  PlayCircle: PlayCircleOutlineIcon,
  Code: CodeIcon,
  RateReview: RateReviewIcon,
  BugReport: BugReportIcon,
  CloudUpload: CloudUploadOutlinedIcon,
  CheckCircle: CheckCircleOutlineIcon,
  Speed: SpeedIcon,
  Build: BuildOutlinedIcon,
  HourglassEmpty: HourglassEmptyIcon,
  FactCheck: FactCheckOutlinedIcon,
  Assignment: AssignmentOutlinedIcon,
};

// ── Inline Edit ───────────────────────────────────────────────────────────────
const InlineEdit = ({ value, onChange, sx = {}, inputWidth = 120 }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const commit = () => { setEditing(false); if (draft.trim()) onChange(draft.trim()); else setDraft(value); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <TextField
          autoFocus size="small" variant="outlined"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
          sx={{
            width: inputWidth,
            '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.85rem', fontWeight: 600, height: 30 },
            '& .MuiOutlinedInput-input': { py: 0.5, px: 1 }
          }}
        />
        <IconButton size="small" onClick={commit} sx={{ bgcolor: 'success.main', color: '#fff', p: 0.3, borderRadius: 1, '&:hover': { bgcolor: 'success.dark' } }}>
          <CheckRoundedIcon sx={{ fontSize: 13 }} />
        </IconButton>
        <IconButton size="small" onClick={cancel} sx={{ bgcolor: 'action.hover', p: 0.3, borderRadius: 1 }}>
          <CloseRoundedIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Box>
    );
  }
  return (
    <Box
      onClick={() => { setDraft(value); setEditing(true); }}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'text', borderRadius: 1, px: 0.5, py: 0.2, '&:hover': { bgcolor: 'action.hover' }, ...sx }}
    >
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3 }}>{value}</Typography>
      <DriveFileRenameOutlineIcon sx={{ fontSize: 12, color: 'text.disabled', opacity: 0 }} className="edit-icon" />
    </Box>
  );
};

// ── Status Row ────────────────────────────────────────────────────────────────
const StatusRow = ({ item, stageColor, wsIdx, totalCount, onDefault, onNameChange, onToggle, onMove }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex', alignItems: 'center', px: 1.5, py: 0.65,
        borderTop: wsIdx === 0 ? 'none' : '1px solid', borderColor: 'divider',
        borderLeft: `3px solid ${item.is_default ? stageColor : 'transparent'}`,
        bgcolor: item.is_default ? stageColor + '0c' : hovered ? 'action.hover' : 'transparent',
        opacity: item.enabled ? 1 : 0.45, transition: 'all 0.15s ease', gap: 1, minHeight: 36,
      }}
    >
      <Tooltip title={item.is_default ? 'Default status' : 'Set as default'} placement="left">
        <IconButton size="small" onClick={onDefault} sx={{ p: 0.3, color: item.is_default ? stageColor : 'transparent', '&:hover': { color: stageColor } }}>
          {item.is_default ? <StarRoundedIcon sx={{ fontSize: 14 }} /> : <StarOutlineRoundedIcon sx={{ fontSize: 14 }} />}
        </IconButton>
      </Tooltip>
      <InlineEdit value={item.name} onChange={onNameChange} inputWidth={100} sx={{ flexGrow: 1, color: item.is_default ? stageColor : 'text.primary' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
        <Switch size="small" checked={item.enabled !== false} onChange={onToggle} sx={{ transform: 'scale(0.7)' }} />
        <IconButton size="small" disabled={wsIdx === 0} onClick={() => onMove('up')} sx={{ p: 0.2 }}>
          <KeyboardArrowUpIcon sx={{ fontSize: 13 }} />
        </IconButton>
        <IconButton size="small" disabled={wsIdx === totalCount - 1} onClick={() => onMove('down')} sx={{ p: 0.2 }}>
          <KeyboardArrowDownIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Settings = ({ initialTab = 0 }) => {
  const { company } = useParams();
  const currentCompany = company || 'default';
  const username = typeof window !== 'undefined' ? (localStorage.getItem('username') || '') : '';
  const initialEmail = typeof window !== 'undefined' ? (localStorage.getItem('email') || `${username.toLowerCase().replace(/\s+/g, '')}@company.com`) : '';

  const { mode, toggleColorMode } = useThemeMode();
  const { workflowSettings, updateWorkflowSettings } = useWorkflow();

  const [activeTab, setActiveTab] = useState(initialTab);

  // ── General Settings state ─────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: username,
    email: initialEmail,
    notifications: true,
    theme: mode,
    autoRefresh: true
  });

  useEffect(() => { setFormData(prev => ({ ...prev, theme: mode })); }, [mode]);

  const handleSaveGeneral = (e) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('username', formData.name);
      localStorage.setItem('email', formData.email);
    }
    toggleColorMode(formData.theme);
    toast.success('General settings saved successfully!');
  };

  // ── Project Flow Settings state ────────────────────────────────────────────
  const [projectFlow, setProjectFlow] = useState(DEFAULT_WORKFLOW.project_flow);
  const [taskWorkflow, setTaskWorkflow] = useState(DEFAULT_WORKFLOW.task_workflow);
  const [taskWorkStatus, setTaskWorkStatus] = useState(DEFAULT_WORKFLOW.task_work_status);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [newTypeModal, setNewTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newStageModal, setNewStageModal] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#0284c7');
  const [newStatusModal, setNewStatusModal] = useState(false);
  const [targetStageName, setTargetStageName] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState(null);

  useEffect(() => {
    if (workflowSettings) {
      if (workflowSettings.project_flow) setProjectFlow(JSON.parse(JSON.stringify(workflowSettings.project_flow)));
      if (workflowSettings.task_workflow) setTaskWorkflow(JSON.parse(JSON.stringify(workflowSettings.task_workflow)));
      if (workflowSettings.task_work_status) setTaskWorkStatus(JSON.parse(JSON.stringify(workflowSettings.task_work_status)));
    }
  }, [workflowSettings]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const updateProjectName = n => setProjectFlow(p => ({ ...p, levels: p.levels.map(l => l.id === 'project' ? { ...l, name: n } : l) }));
  const updateStoryName = n => setProjectFlow(p => ({ ...p, levels: p.levels.map(l => l.id === 'story' ? { ...l, name: n } : l) }));
  const toggleStoryEnabled = () => setProjectFlow(p => ({ ...p, levels: p.levels.map(l => l.id === 'story' ? { ...l, enabled: !l.enabled } : l) }));
  const toggleTypeEnabled = id => setProjectFlow(p => ({ ...p, levels: p.levels.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l) }));
  const updateTypeName = (id, n) => setProjectFlow(p => ({ ...p, levels: p.levels.map(l => l.id === id ? { ...l, name: n } : l) }));
  const moveTaskType = (idx, dir) => setProjectFlow(p => {
    const fixed = p.levels.filter(l => l.id === 'project' || l.id === 'story');
    const types = p.levels.filter(l => l.id !== 'project' && l.id !== 'story');
    const ti = dir === 'up' ? idx - 1 : idx + 1;
    if (ti < 0 || ti >= types.length) return p;
    [types[idx], types[ti]] = [types[ti], types[idx]];
    return { ...p, levels: [...fixed, ...types] };
  });
  const handleAddType = () => {
    if (!newTypeName.trim()) { toast.error('Name required'); return; }
    const id = newTypeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (projectFlow.levels.some(l => l.id === id)) { toast.error('Already exists'); return; }
    setProjectFlow(p => ({ ...p, levels: [...p.levels, { id, name: newTypeName.trim(), enabled: true, order: p.levels.length + 1, is_custom: true }] }));
    setNewTypeName(''); setNewTypeModal(false); toast.success('Task type added');
  };
  const handleDeleteType = (id, name) => {
    setProjectFlow(p => ({ ...p, levels: p.levels.filter(l => l.id !== id) }));
    toast.success(`"${name}" deleted`);
  };

  const toggleStageEnabled = id => setTaskWorkflow(p => ({ ...p, stages: p.stages.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s) }));
  const updateStageName = (id, n) => {
    const old = taskWorkflow.stages.find(s => s.id === id)?.name;
    setTaskWorkflow(p => ({ ...p, stages: p.stages.map(s => s.id === id ? { ...s, name: n } : s) }));
    if (old && old !== n) setTaskWorkStatus(p => { const m = { ...p }; if (m[old]) { m[n] = m[old]; delete m[old]; } return m; });
  };
  const updateStageColor = (id, c) => setTaskWorkflow(p => ({ ...p, stages: p.stages.map(s => s.id === id ? { ...s, color: c } : s) }));
  const updateStageIcon = (id, icon) => { setTaskWorkflow(p => ({ ...p, stages: p.stages.map(s => s.id === id ? { ...s, icon } : s) })); setIconPickerOpen(false); };
  const moveStage = (idx, dir) => setTaskWorkflow(p => {
    const stages = [...p.stages];
    const ti = dir === 'left' ? idx - 1 : idx + 1;
    if (ti < 0 || ti >= stages.length) return p;
    [stages[idx], stages[ti]] = [stages[ti], stages[idx]];
    stages.forEach((s, i) => { s.order = i + 1; });
    return { ...p, stages };
  });
  const handleAddStage = () => {
    if (!newStageName.trim()) { toast.error('Name required'); return; }
    const id = newStageName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (taskWorkflow.stages.some(s => s.id === id)) { toast.error('Stage exists'); return; }
    const ns = { id, name: newStageName.trim(), color: newStageColor, icon: 'Code', order: taskWorkflow.stages.length + 1, enabled: true };
    setTaskWorkflow(p => ({ ...p, stages: [...p.stages, ns] }));
    setTaskWorkStatus(p => ({ ...p, [ns.name]: [{ id: 'not_started', name: 'Not Started', enabled: true, order: 1, is_default: true }] }));
    setNewStageName(''); setNewStageModal(false); toast.success(`"${ns.name}" added`);
  };

  const toggleWSEnabled = (stage, sid) => setTaskWorkStatus(p => ({ ...p, [stage]: (p[stage] || []).map(i => i.id === sid ? { ...i, enabled: !i.enabled } : i) }));
  const updateWSName = (stage, sid, n) => setTaskWorkStatus(p => ({ ...p, [stage]: (p[stage] || []).map(i => i.id === sid ? { ...i, name: n } : i) }));
  const setWSDefault = (stage, sid) => setTaskWorkStatus(p => ({ ...p, [stage]: (p[stage] || []).map(i => ({ ...i, is_default: i.id === sid })) }));
  const moveWS = (stage, idx, dir) => setTaskWorkStatus(p => {
    const list = [...(p[stage] || [])];
    const ti = dir === 'up' ? idx - 1 : idx + 1;
    if (ti < 0 || ti >= list.length) return p;
    [list[idx], list[ti]] = [list[ti], list[idx]];
    list.forEach((i, x) => { i.order = x + 1; });
    return { ...p, [stage]: list };
  });
  const handleAddWS = () => {
    if (!newStatusName.trim()) { toast.error('Name required'); return; }
    const id = newStatusName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const list = taskWorkStatus[targetStageName] || [];
    if (list.some(s => s.id === id)) { toast.error('Status exists'); return; }
    setTaskWorkStatus(p => ({ ...p, [targetStageName]: [...list, { id, name: newStatusName.trim(), enabled: true, order: list.length + 1, is_default: list.length === 0 }] }));
    setNewStatusName(''); setNewStatusModal(false); toast.success('Status added');
  };

  const handleReset = () => {
    setProjectFlow(JSON.parse(JSON.stringify(DEFAULT_WORKFLOW.project_flow)));
    setTaskWorkflow(JSON.parse(JSON.stringify(DEFAULT_WORKFLOW.task_workflow)));
    setTaskWorkStatus(JSON.parse(JSON.stringify(DEFAULT_WORKFLOW.task_work_status)));
    toast.success('Reset to defaults');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateWorkflowSettings({ project_flow: projectFlow, task_workflow: taskWorkflow, task_work_status: taskWorkStatus });
    setIsSaving(false);
    if (res.success) toast.success('Workflow saved successfully!');
    else toast.error(res.error || 'Save failed');
  };

  const projectLevel = projectFlow.levels.find(l => l.id === 'project') || { name: 'Project' };
  const storyLevel = projectFlow.levels.find(l => l.id === 'story') || { name: 'Story', enabled: true };
  const taskTypes = (projectFlow.levels || []).filter(l => l.id !== 'project' && l.id !== 'story');
  const stages = taskWorkflow.stages || [];

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Sidebar company={currentCompany} activeMenu="Settings" />

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={currentCompany} username={username} />

          {/* Header */}
          <Box sx={{ px: 3, py: 2, pb: 0, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SettingsIcon color="primary" /> Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage user preferences and project workflow configuration.
                </Typography>
              </Box>
              {activeTab === 1 && (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button variant="outlined" color="warning" startIcon={<RestoreIcon />} onClick={handleReset} size="small">
                    Reset Defaults
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} disabled={isSaving} size="small" sx={{ px: 3 }}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>

            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mt: 1 }}>
              <Tab icon={<PersonOutlinedIcon />} iconPosition="start" label="General Settings" />
              <Tab icon={<TuneIcon />} iconPosition="start" label="Project Flow Settings" />
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
            <Box sx={{ maxWidth: activeTab === 1 ? 1300 : 960, mx: 'auto' }}>

              {/* ── TAB 0: GENERAL SETTINGS ── */}
              {activeTab === 0 && (
                <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <form onSubmit={handleSaveGeneral}>
                      <Grid container spacing={4}>

                        <Grid xs={12}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>User Profile</Typography>
                          <Typography variant="caption" color="text.secondary">Update your public profile details.</Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <TextField label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth size="small" />
                            <TextField label="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth size="small" />
                          </Box>
                        </Grid>

                        <Grid xs={12}><Divider /></Grid>

                        <Grid xs={12}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>System Settings</Typography>
                          <Typography variant="caption" color="text.secondary">Configure notifications and refresh rates.</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body2" fontWeight="600">Email Notifications</Typography>
                                <Typography variant="caption" color="text.secondary">Receive performance summaries and task assignments.</Typography>
                              </Box>
                              <Switch checked={formData.notifications} onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })} />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body2" fontWeight="600">Real-Time Refresh</Typography>
                                <Typography variant="caption" color="text.secondary">Automatically sync task board every 30 seconds.</Typography>
                              </Box>
                              <Switch checked={formData.autoRefresh} onChange={(e) => setFormData({ ...formData, autoRefresh: e.target.checked })} />
                            </Box>
                          </Box>
                        </Grid>

                        <Grid xs={12}><Divider /></Grid>

                        <Grid xs={12}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Workspace Theme</Typography>
                          <FormControl>
                            <RadioGroup row value={formData.theme} onChange={(e) => setFormData({ ...formData, theme: e.target.value })}>
                              <FormControlLabel value="dark" control={<Radio />} label="Dark Mode (Default)" />
                              <FormControlLabel value="light" control={<Radio />} label="Light Mode" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ px: 4, py: 1 }}>
                            Save Settings
                          </Button>
                        </Grid>

                      </Grid>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* ── TAB 1: PROJECT FLOW SETTINGS (WorkflowSettings content) ── */}
              {activeTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                  {/* SECTION A — PROJECT HIERARCHY */}
                  <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ px: 3, py: 1.8, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AccountTreeIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                      <Box>
                        <Typography fontWeight={700} fontSize="0.85rem">Project Hierarchy</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          Define the structure of your project, stories, and task types.
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }} />
                      <Chip
                        size="small"
                        label={storyLevel.enabled ? 'Project → Story → Task Types' : 'Project → Task Types'}
                        sx={{ fontSize: '0.68rem', fontWeight: 600, borderRadius: 1.5 }}
                        color={storyLevel.enabled ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {/* Project node */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#0284c7', borderRadius: 1.5 }}>
                          <FolderOpenIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <InlineEdit value={projectLevel.name} onChange={updateProjectName} inputWidth={140} />
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1 }}>Root — edit name only</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ ml: 2.1, pl: 2.6, borderLeft: '2px dashed', borderColor: 'divider', my: 0.5, py: 0.5 }}>
                        {/* Story node */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: storyLevel.enabled ? '#7c3aed44' : 'divider', bgcolor: (t) => storyLevel.enabled ? (t.palette.mode === 'dark' ? '#7c3aed12' : '#7c3aed08') : (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fafafa'), mb: 1 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: storyLevel.enabled ? '#7c3aed' : '#94a3b8', borderRadius: 1.5 }}>
                            <AutoStoriesIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <InlineEdit value={storyLevel.name} onChange={updateStoryName} inputWidth={120} />
                            <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1, display: 'block' }}>
                              {storyLevel.enabled ? 'Enabled — appears between Project and Tasks' : 'Disabled — Tasks go directly under Project'}
                            </Typography>
                          </Box>
                          <Tooltip title={storyLevel.enabled ? 'Disable Story level' : 'Enable Story level'}>
                            <Switch size="small" checked={storyLevel.enabled} onChange={toggleStoryEnabled} color="secondary" />
                          </Tooltip>
                        </Box>

                        <Box sx={{ ml: 1.9, pl: 2.4, borderLeft: '2px dashed', borderColor: 'divider', py: 0.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          {/* Task Types */}
                          {taskTypes.map((t, idx) => (
                            <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: 1.5, border: '1px solid', borderColor: t.enabled ? '#05996922' : 'divider', bgcolor: 'background.paper', '&:hover .type-actions': { opacity: 1 } }}>
                              <Avatar sx={{ width: 26, height: 26, bgcolor: t.enabled ? '#059669' : '#94a3b8', borderRadius: 1, fontSize: 13 }}>
                                {t.id === 'bug' ? <BugReportOutlinedIcon sx={{ fontSize: 14 }} /> : <TaskAltIcon sx={{ fontSize: 14 }} />}
                              </Avatar>
                              <InlineEdit value={t.name} onChange={n => updateTypeName(t.id, n)} inputWidth={110} />
                              <Chip label={t.is_custom ? 'Custom' : 'Built-in'} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, borderRadius: 1 }} variant="outlined" />
                              <Box className="type-actions" sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0, transition: 'opacity 0.15s' }}>
                                <Switch size="small" checked={t.enabled !== false} onChange={() => toggleTypeEnabled(t.id)} color="success" />
                                <IconButton size="small" disabled={idx === 0} onClick={() => moveTaskType(idx, 'up')} sx={{ p: 0.3 }}><KeyboardArrowUpIcon sx={{ fontSize: 14 }} /></IconButton>
                                <IconButton size="small" disabled={idx === taskTypes.length - 1} onClick={() => moveTaskType(idx, 'down')} sx={{ p: 0.3 }}><KeyboardArrowDownIcon sx={{ fontSize: 14 }} /></IconButton>
                                {t.is_custom && (
                                  <Tooltip title="Delete type">
                                    <IconButton size="small" onClick={() => handleDeleteType(t.id, t.name)} sx={{ p: 0.3, color: 'error.main' }}>
                                      <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </Box>
                          ))}
                          <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={() => setNewTypeModal(true)} variant="outlined" color="success" sx={{ alignSelf: 'flex-start', borderRadius: 1.5, fontSize: '0.75rem', borderStyle: 'dashed', mt: 0.5 }}>
                            Add Task Type
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>

                  {/* SECTION B — WORKFLOW STAGES */}
                  <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ px: 3, py: 1.8, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TuneIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                      <Box>
                        <Typography fontWeight={700} fontSize="0.85rem">Workflow Stages</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          Shared across all task types. Each stage has its own work statuses.
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }} />
                      <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setNewStageModal(true)} sx={{ borderRadius: 2, fontSize: '0.75rem', fontWeight: 600, px: 2 }}>
                        Add Stage
                      </Button>
                    </Box>

                    <Box sx={{ p: 2.5, overflowX: 'auto' }}>
                      <Box sx={{ display: 'flex', gap: 2, minWidth: 'max-content', pb: 0.5 }}>
                        {stages.map((stage, sIdx) => {
                          const stageColor = stage.color || '#64748b';
                          const IconComp = ICON_MAP[stage.icon] || CodeIcon;
                          const statuses = taskWorkStatus[stage.name] || [];
                          return (
                            <Paper key={stage.id} elevation={0} sx={{ width: 220, flexShrink: 0, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden', opacity: stage.enabled ? 1 : 0.5, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: `0 2px 16px ${stageColor}22` } }}>
                              <Box sx={{ px: 2, pt: 2, pb: 1.5, borderTop: `3px solid ${stageColor}`, bgcolor: (t) => t.palette.mode === 'dark' ? stageColor + '14' : stageColor + '09' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                  <Tooltip title="Change icon">
                                    <IconButton size="small" onClick={() => { setEditingStageId(stage.id); setIconPickerOpen(true); }} sx={{ p: 0.6, color: stageColor, bgcolor: stageColor + '18', borderRadius: 1.5, '&:hover': { bgcolor: stageColor + '28' } }}>
                                      <IconComp sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <InlineEdit value={stage.name} onChange={n => updateStageName(stage.id, n)} sx={{ color: stageColor }} inputWidth={100} />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Tooltip title="Change color">
                                    <Box component="label" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 0.4, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                                      <PaletteOutlinedIcon sx={{ fontSize: 14, color: stageColor, mr: 0.3 }} />
                                      <input type="color" value={stageColor} onChange={e => updateStageColor(stage.id, e.target.value)} style={{ width: 0, height: 0, opacity: 0, border: 'none', padding: 0 }} />
                                    </Box>
                                  </Tooltip>
                                  <Tooltip title="Move left"><span>
                                    <IconButton size="small" disabled={sIdx === 0} onClick={() => moveStage(sIdx, 'left')} sx={{ p: 0.3 }}><ChevronLeftIcon sx={{ fontSize: 14 }} /></IconButton>
                                  </span></Tooltip>
                                  <Tooltip title="Move right"><span>
                                    <IconButton size="small" disabled={sIdx === stages.length - 1} onClick={() => moveStage(sIdx, 'right')} sx={{ p: 0.3 }}><ChevronRightIcon sx={{ fontSize: 14 }} /></IconButton>
                                  </span></Tooltip>
                                  <Box sx={{ flexGrow: 1 }} />
                                  <Tooltip title={stage.enabled ? 'Disable stage' : 'Enable stage'}>
                                    <Switch size="small" checked={stage.enabled} onChange={() => toggleStageEnabled(stage.id)} sx={{ transform: 'scale(0.75)' }} />
                                  </Tooltip>
                                </Box>
                              </Box>

                              <Box sx={{ bgcolor: 'background.paper' }}>
                                {statuses.map((item, wsIdx) => (
                                  <StatusRow key={item.id} item={item} stageColor={stageColor} wsIdx={wsIdx} totalCount={statuses.length}
                                    onDefault={() => setWSDefault(stage.name, item.id)}
                                    onNameChange={n => updateWSName(stage.name, item.id, n)}
                                    onToggle={() => toggleWSEnabled(stage.name, item.id)}
                                    onMove={dir => moveWS(stage.name, wsIdx, dir)}
                                  />
                                ))}
                                {statuses.length === 0 && (
                                  <Box sx={{ py: 2.5, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>No statuses yet</Typography>
                                  </Box>
                                )}
                              </Box>

                              <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Button fullWidth size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />} onClick={() => { setTargetStageName(stage.name); setNewStatusModal(true); }}
                                  sx={{ fontSize: '0.72rem', fontWeight: 500, color: stageColor, borderRadius: 1.5, justifyContent: 'flex-start', '&:hover': { bgcolor: stageColor + '12' } }}>
                                  Add work status
                                </Button>
                              </Box>
                            </Paper>
                          );
                        })}
                        {/* Add Stage placeholder */}
                        <Box onClick={() => setNewStageModal(true)} sx={{ width: 180, flexShrink: 0, borderRadius: 2.5, border: '1.5px dashed', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.8, py: 4, px: 2, cursor: 'pointer', color: 'text.disabled', transition: 'all 0.15s', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}>
                          <AddIcon sx={{ fontSize: 24 }} />
                          <Typography variant="caption" fontWeight={600} sx={{ textAlign: 'center' }}>New Stage</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>

                </Box>
              )}

            </Box>
          </Box>
        </Box>
      </Box>

      {/* MODAL: Add Task Type */}
      <Dialog open={newTypeModal} onClose={() => setNewTypeModal(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add Task Type</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth size="small" label="Type Name" placeholder="e.g. Feature, Incident, Sub-task"
            value={newTypeName} onChange={e => setNewTypeName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddType()}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewTypeModal(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddType} sx={{ borderRadius: 2 }}>Add Type</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Add Stage */}
      <Dialog open={newStageModal} onClose={() => setNewStageModal(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add Workflow Stage</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField autoFocus fullWidth size="small" label="Stage Name" placeholder="e.g. QA, UAT, Code Review"
            value={newStageName} onChange={e => setNewStageName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddStage()}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>Stage Color</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <Tooltip key={c} title={c}>
                  <Box onClick={() => setNewStageColor(c)} sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: c, cursor: 'pointer', border: newStageColor === c ? '3px solid #000' : '2px solid transparent', transition: 'transform 0.1s', '&:hover': { transform: 'scale(1.15)' } }} />
                </Tooltip>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewStageModal(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStage} sx={{ borderRadius: 2 }}>Add Stage</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Add Work Status */}
      <Dialog open={newStatusModal} onClose={() => setNewStatusModal(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
          Add Work Status
          <Typography component="span" color="primary" fontWeight={600} sx={{ ml: 1, fontSize: '0.9rem' }}>
            — {targetStageName}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth size="small" label="Status Name" placeholder="e.g. In Review, Approved, Escalated"
            value={newStatusName} onChange={e => setNewStatusName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddWS()}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewStatusModal(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddWS} sx={{ borderRadius: 2 }}>Add Status</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Icon Picker */}
      <Dialog open={iconPickerOpen} onClose={() => setIconPickerOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Select Stage Icon</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', pt: 1 }}>
            {Object.entries(ICON_MAP).map(([name, Comp]) => (
              <Tooltip key={name} title={name}>
                <IconButton onClick={() => updateStageIcon(editingStageId, name)} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { bgcolor: 'primary.light', opacity: 0.7 } }}>
                  <Comp sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIconPickerOpen(false)} sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Settings;
