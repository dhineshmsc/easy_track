"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getAuthCookie } from '../utils/auth';

const WorkflowContext = createContext(null);

export const DEFAULT_WORKFLOW = {
  project_flow: {
    levels: [
      { id: 'project', name: 'Project', enabled: true, order: 1, is_system: true },
      { id: 'story', name: 'Story', enabled: true, order: 2 },
      { id: 'task', name: 'Task', enabled: true, order: 3 },
      { id: 'bug', name: 'Bug', enabled: true, order: 4 }
    ]
  },
  task_workflow: {
    stages: [
      { id: 'todo', name: 'Todo', color: '#64748b', order: 1, enabled: true },
      { id: 'developing', name: 'Developing', color: '#0284c7', order: 2, enabled: true },
      { id: 'code_review', name: 'Code Review', color: '#7c3aed', order: 3, enabled: true },
      { id: 'testing', name: 'Testing', color: '#db2777', order: 4, enabled: true },
      { id: 'deploying', name: 'Deploying', color: '#059669', order: 5, enabled: true },
      { id: 'done', name: 'Done', color: '#16a34a', order: 6, enabled: true }
    ]
  },
  task_work_status: {
    'Todo': [
      { id: 'not_started', name: 'Not Started', enabled: true, order: 1, is_default: true },
      { id: 'ready', name: 'Ready', enabled: true, order: 2 },
      { id: 'planning', name: 'Planning', enabled: true, order: 3 },
      { id: 'waiting_req', name: 'Waiting for Requirement', enabled: true, order: 4 },
      { id: 'waiting_client', name: 'Waiting for Client', enabled: true, order: 5 }
    ],
    'Developing': [
      { id: 'not_started', name: 'Not Started', enabled: true, order: 1 },
      { id: 'in_progress', name: 'In Progress', enabled: true, order: 2, is_default: true },
      { id: 'on_hold', name: 'On Hold', enabled: true, order: 3 },
      { id: 'blocked', name: 'Blocked', enabled: true, order: 4 },
      { id: 'developed', name: 'Developed', enabled: true, order: 5 }
    ],
    'Code Review': [
      { id: 'not_started', name: 'Not Started', enabled: true, order: 1, is_default: true },
      { id: 'reviewing', name: 'Reviewing', enabled: true, order: 2 },
      { id: 'failed', name: 'Failed', enabled: true, order: 3 },
      { id: 'passed', name: 'Passed', enabled: true, order: 4 }
    ],
    'Testing': [
      { id: 'not_started', name: 'Not Started', enabled: true, order: 1, is_default: true },
      { id: 'testing', name: 'Testing', enabled: true, order: 2 },
      { id: 'failed', name: 'Failed', enabled: true, order: 3 },
      { id: 'passed', name: 'Passed', enabled: true, order: 4 }
    ],
    'Deploying': [
      { id: 'deploying', name: 'Deploying', enabled: true, order: 1, is_default: true },
      { id: 'failed', name: 'Failed', enabled: true, order: 2 },
      { id: 'passed', name: 'Passed', enabled: true, order: 3 }
    ],
    'Done': [
      { id: 'completed', name: 'Completed', enabled: true, order: 1, is_default: true },
      { id: 'not_completed', name: 'Not Completed', enabled: true, order: 2 }
    ]
  }
};

export const WorkflowProvider = ({ children }) => {
  const params = useParams();
  const [workflowSettings, setWorkflowSettings] = useState(DEFAULT_WORKFLOW);
  const [isLoading, setIsLoading] = useState(true);

  const getCompanySlug = useCallback(() => {
    if (params?.company) return params.company;
    const session = getAuthCookie();
    if (session?.company) return session.company;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('company');
      if (stored) return stored;
    }
    return 'default';
  }, [params]);

  const fetchWorkflowSettings = useCallback(async () => {
    const company = getCompanySlug();
    try {
      setIsLoading(true);
      const res = await fetch(`/api/workflow-settings?company_id=${encodeURIComponent(company)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.project_flow) {
          setWorkflowSettings(data);
        }
      }
    } catch (err) {
      console.error('Failed to load workflow settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getCompanySlug]);

  useEffect(() => {
    fetchWorkflowSettings();
  }, [fetchWorkflowSettings]);

  const updateWorkflowSettings = async (newSettings) => {
    const company = getCompanySlug();
    const payload = {
      company_id: company,
      ...newSettings
    };
    try {
      const res = await fetch('/api/workflow-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setWorkflowSettings(data);
        return { success: true, data };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.detail || 'Failed to save workflow settings' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Helper selectors
  const isProjectEnabled = React.useMemo(() => {
    const levels = workflowSettings?.project_flow?.levels || [];
    const lvl = levels.find(l => l.id === 'project');
    return lvl ? Boolean(lvl.enabled) : true;
  }, [workflowSettings]);

  const isStoryEnabled = React.useMemo(() => {
    const levels = workflowSettings?.project_flow?.levels || [];
    const lvl = levels.find(l => l.id === 'story');
    return lvl ? Boolean(lvl.enabled) : true;
  }, [workflowSettings]);

  const isTaskEnabled = React.useMemo(() => {
    const levels = workflowSettings?.project_flow?.levels || [];
    const lvl = levels.find(l => l.id === 'task');
    return lvl ? Boolean(lvl.enabled) : true;
  }, [workflowSettings]);

  const isBugEnabled = React.useMemo(() => {
    const levels = workflowSettings?.project_flow?.levels || [];
    const lvl = levels.find(l => l.id === 'bug');
    return lvl ? Boolean(lvl.enabled) : true;
  }, [workflowSettings]);

  // All enabled task types (Task, Bug, and any custom types) — sorted by order
  const enabledTaskTypes = React.useMemo(() => {
    const levels = workflowSettings?.project_flow?.levels || [];
    return levels
      .filter(l => l.id !== 'project' && l.id !== 'story' && l.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [workflowSettings]);

  const enabledLevels = React.useMemo(() => {
    const levels = workflowSettings?.project_flow?.levels || [];
    return [...levels].filter(l => l.enabled).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [workflowSettings]);


  const enabledStages = React.useMemo(() => {
    const stages = workflowSettings?.task_workflow?.stages || [];
    return [...stages].filter(s => s.enabled).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [workflowSettings]);

  const stageColors = React.useMemo(() => {
    const colors = {};
    const stages = workflowSettings?.task_workflow?.stages || [];
    stages.forEach(s => {
      colors[s.name] = s.color || '#64748b';
    });
    return colors;
  }, [workflowSettings]);

  const getWorkStatusesForStage = useCallback((stageName) => {
    if (!stageName) return [];
    const workStatusMap = workflowSettings?.task_work_status || {};
    // Direct lookup or sanitized case-insensitive match
    const cleanTarget = String(stageName).toLowerCase().replace(/[^a-z0-9]/g, '');
    let key = Object.keys(workStatusMap).find(k => String(k).toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget);
    if (!key) key = stageName;
    const list = workStatusMap[key] || [];
    return list.filter(item => item.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [workflowSettings]);


  const getDefaultWorkStatusForStage = useCallback((stageName) => {
    const statuses = getWorkStatusesForStage(stageName);
    const def = statuses.find(s => s.is_default);
    return def ? def.name : (statuses[0]?.name || 'Not Started');
  }, [getWorkStatusesForStage]);

  return (
    <WorkflowContext.Provider
      value={{
        workflowSettings,
        isLoading,
        isProjectEnabled,
        isStoryEnabled,
        isTaskEnabled,
        isBugEnabled,
        enabledTaskTypes,
        enabledLevels,
        enabledStages,
        stageColors,
        getWorkStatusesForStage,
        getDefaultWorkStatusForStage,
        refreshWorkflowSettings: fetchWorkflowSettings,
        updateWorkflowSettings
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) {
    // Return graceful fallback if consumed outside provider
    return {
      workflowSettings: DEFAULT_WORKFLOW,
      isLoading: false,
      isProjectEnabled: true,
      isStoryEnabled: true,
      isTaskEnabled: true,
      isBugEnabled: true,
      enabledTaskTypes: DEFAULT_WORKFLOW.project_flow.levels.filter(
        l => l.id !== 'project' && l.id !== 'story' && l.enabled !== false
      ).sort((a, b) => (a.order || 0) - (b.order || 0)),
      enabledLevels: DEFAULT_WORKFLOW.project_flow.levels,
      enabledStages: DEFAULT_WORKFLOW.task_workflow.stages,

      stageColors: {
        'Todo': '#64748b',
        'Developing': '#0284c7',
        'Code Review': '#7c3aed',
        'Testing': '#db2777',
        'Deploying': '#059669',
        'Done': '#16a34a'
      },
      getWorkStatusesForStage: (stageName) => {
        const map = DEFAULT_WORKFLOW.task_work_status;
        const key = Object.keys(map).find(k => k.toLowerCase() === (stageName || '').toLowerCase()) || stageName;
        return map[key] || [];
      },
      getDefaultWorkStatusForStage: (stageName) => {
        const map = DEFAULT_WORKFLOW.task_work_status;
        const key = Object.keys(map).find(k => k.toLowerCase() === (stageName || '').toLowerCase()) || stageName;
        const list = map[key] || [];
        const def = list.find(s => s.is_default);
        return def ? def.name : (list[0]?.name || 'Not Started');
      },
      refreshWorkflowSettings: async () => {},
      updateWorkflowSettings: async () => ({ success: false })
    };
  }
  return ctx;
};
