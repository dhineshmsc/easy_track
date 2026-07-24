import { NextResponse } from 'next/server';
import { getTasksCol, getStoriesCol } from '../../../backend/db';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const story_id = searchParams.get('story_id');
    const story_ids_param = searchParams.get('story_ids');

    if (!story_id && !story_ids_param) {
      return NextResponse.json({ detail: "story_id or story_ids is required" }, { status: 400 });
    }

    const tasksCol = await getTasksCol();
    let query = {};
    if (story_id) {
      query = { story_id };
    } else {
      query = { story_id: { $in: story_ids_param.split(',') } };
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
    const { story_id, type, name, description, estimate_hours, assigned_user, reporter, end_date, priority, status, work_status, image_path, comments, team_assignment } = body;

    if (!story_id || !type || !name) {
      return NextResponse.json({ detail: "story_id, type, and name are required" }, { status: 400 });
    }

    const storiesCol = await getStoriesCol();
    const story = await storiesCol.findOne({ _id: new ObjectId(story_id) });

    if (!story) {
      return NextResponse.json({ detail: "Story not found" }, { status: 404 });
    }

    const tasksCol = await getTasksCol();
    const count = await tasksCol.countDocuments({ story_id });
    const t_seq = count + 1;

    const prefix = type === "Task" ? "t" : "b";
    const custom_id = `${story.custom_id}${prefix}${t_seq}`;

    const task_doc = {
      story_id,
      type,
      name,
      description: description || null,
      estimate_hours: estimate_hours !== undefined ? parseFloat(estimate_hours) : 0.0,
      assigned_user: assigned_user || null,
      reporter: reporter || null,
      end_date: end_date ? new Date(end_date) : null,
      priority: priority || 'Medium',
      status: status || 'To Do',
      work_status: work_status || 'Not Started',
      image_path: image_path || null,
      comments: comments || [],
      team_assignment: team_assignment || {
        developer: { user_id: null, user_name: null, estimate_hours: 0 },
        tester: { user_id: null, user_name: null, estimate_hours: 0 },
        code_reviewer: { user_id: null, user_name: null, estimate_hours: 0 },
        deployer: { user_id: null, user_name: null, estimate_hours: 0 }
      },
      t_seq,
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
