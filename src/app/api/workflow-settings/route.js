import { NextResponse } from 'next/server';
import { getWorkflowSettingsCol } from '../../../backend/db';

export const DEFAULT_WORKFLOW_SETTINGS = {
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

function ensureDeployingNotStarted(taskWorkStatus) {
  if (!taskWorkStatus) return taskWorkStatus;
  const key = Object.keys(taskWorkStatus).find(k => k.toLowerCase() === 'deploying') || 'Deploying';
  let list = taskWorkStatus[key];
  if (list && Array.isArray(list)) {
    let notStartedItem = list.find(item => item.id === 'not_started' || String(item.name).toLowerCase() === 'not started');
    if (!notStartedItem) {
      list = list.map(item => ({ ...item, is_default: false }));
      list.unshift({ id: 'not_started', name: 'Not Started', enabled: true, order: 1, is_default: true });
    } else {
      list = list.map(item => ({
        ...item,
        is_default: (item.id === 'not_started' || String(item.name).toLowerCase() === 'not started')
      }));
    }
    list.forEach((item, idx) => { item.order = idx + 1; });
    taskWorkStatus[key] = list;
  }
  return taskWorkStatus;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const company_id = searchParams.get('company_id') || searchParams.get('company') || 'default';

    const col = await getWorkflowSettingsCol();
    let doc = await col.findOne({ company_id: company_id.toLowerCase() });

    if (!doc) {
      // Fallback for general fallback query
      doc = await col.findOne({ company_id: 'default' });
    }

    if (!doc) {
      // Return fresh defaults cloned for this tenant
      return NextResponse.json({
        company_id: company_id.toLowerCase(),
        ...DEFAULT_WORKFLOW_SETTINGS
      });
    }

    doc._id = String(doc._id);
    if (doc.task_work_status) {
      ensureDeployingNotStarted(doc.task_work_status);
    }
    return NextResponse.json(doc);
  } catch (error) {
    console.error('Workflow settings GET error:', error);
    return NextResponse.json({ detail: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const company_id = (body.company_id || body.company || 'default').toLowerCase();

    if (!body.project_flow || !body.task_workflow || !body.task_work_status) {
      return NextResponse.json({ detail: 'Invalid workflow configuration data' }, { status: 400 });
    }

    const col = await getWorkflowSettingsCol();
    const updateDoc = {
      company_id,
      project_flow: body.project_flow,
      task_workflow: body.task_workflow,
      task_work_status: body.task_work_status,
      updated_at: new Date()
    };

    await col.updateOne(
      { company_id },
      { $set: updateDoc },
      { upsert: true }
    );

    const doc = await col.findOne({ company_id });
    if (doc) doc._id = String(doc._id);

    return NextResponse.json(doc || updateDoc);
  } catch (error) {
    console.error('Workflow settings POST error:', error);
    return NextResponse.json({ detail: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
