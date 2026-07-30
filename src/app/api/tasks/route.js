import { NextResponse } from 'next/server';
import { getTasksCol, getStoriesCol, getProjectsCol } from '../../../backend/db';
import { ObjectId } from 'mongodb';


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const story_id = searchParams.get('story_id');
    const story_ids_param = searchParams.get('story_ids');
    const project_id = searchParams.get('project_id');
    const project_ids_param = searchParams.get('project_ids');

    const tasksCol = await getTasksCol();
    let query = {};

    if (story_id) {
      query.story_id = story_id;
    } else if (story_ids_param) {
      query.story_id = { $in: story_ids_param.split(',') };
    } else if (project_id) {
      query.project_id = project_id;
    } else if (project_ids_param) {
      query.project_id = { $in: project_ids_param.split(',') };
    } else {
      // If no parameter provided, fetch all tasks
      query = {};
    }

    const cursor = tasksCol.find(query).sort({ created_at: -1 });
    const docs = await cursor.toArray();

    const tasks = docs.map(doc => {
      const t = { ...doc };
      t._id = String(t._id);

      if (!t.created_at) {
        t.created_at = new Date();
      } else if (t.created_at instanceof Date) {
        t.created_at = t.created_at.toISOString();
      }

      if (t.updated_at && t.updated_at instanceof Date) {
        t.updated_at = t.updated_at.toISOString();
      }

      if (t.end_date && t.end_date instanceof Date) {
        t.end_date = t.end_date.toISOString();
      }

      return t;
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { story_id, project_id, type, name, description, estimate_hours, assigned_user, reporter, end_date, priority, status, work_status, image_path, comments, team_assignment } = body;

    if ((!story_id && !project_id) || !type || !name) {
      return NextResponse.json({ detail: "story_id or project_id, type, and name are required" }, { status: 400 });
    }

    const tasksCol = await getTasksCol();
    let custom_id = '';
    let resolvedStoryId = story_id || null;
    let resolvedProjectId = project_id || null;

    if (story_id) {
      const storiesCol = await getStoriesCol();
      let storyDoc = null;
      try { storyDoc = await storiesCol.findOne({ _id: new ObjectId(story_id) }); } catch(e) {}
      if (!storyDoc) {
        storyDoc = await storiesCol.findOne({ id: story_id });
      }
      if (storyDoc) {
        resolvedProjectId = storyDoc.project_id || resolvedProjectId;
        const count = await tasksCol.countDocuments({ story_id });
        const t_seq = count + 1;
        const prefix = type === "Task" ? "t" : "b";
        custom_id = `${storyDoc.custom_id || 'S'}${prefix}${t_seq}`;
      }
    }

    if (!custom_id && project_id) {
      const projectsCol = await getProjectsCol();
      let projDoc = null;
      try { projDoc = await projectsCol.findOne({ _id: new ObjectId(project_id) }); } catch(e) {}
      if (!projDoc) {
        projDoc = await projectsCol.findOne({ id: project_id });
      }
      const count = await tasksCol.countDocuments({ project_id });
      const t_seq = count + 1;
      const prefix = type === "Task" ? "t" : "b";
      const pCode = projDoc?.key || projDoc?.name?.substring(0, 3)?.toUpperCase() || 'PRJ';
      custom_id = `${pCode}-${prefix}${t_seq}`;
    }

    const task_doc = {
      story_id: resolvedStoryId,
      project_id: resolvedProjectId,
      type,
      name,
      description: description || null,
      estimate_hours: estimate_hours !== undefined ? parseFloat(estimate_hours) : 0.0,
      assigned_user: assigned_user || null,
      reporter: reporter || null,
      end_date: end_date ? new Date(end_date) : null,
      priority: priority || 'Medium',
      status: status || 'Todo',
      work_status: work_status || 'Not Started',
      image_path: image_path || null,
      comments: comments || [],
      team_assignment: team_assignment || {
        developer: { user_id: null, user_name: null, estimate_hours: 0 },
        tester: { user_id: null, user_name: null, estimate_hours: 0 },
        code_reviewer: { user_id: null, user_name: null, estimate_hours: 0 },
        deployer: { user_id: null, user_name: null, estimate_hours: 0 }
      },
      custom_id,
      created_at: new Date()
    };

    const result = await tasksCol.insertOne(task_doc);
    task_doc._id = String(result.insertedId);
    task_doc.created_at = task_doc.created_at.toISOString();
    if (task_doc.end_date) {
      task_doc.end_date = task_doc.end_date.toISOString();
    }

    return NextResponse.json(task_doc);
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

