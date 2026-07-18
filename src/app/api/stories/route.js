import { NextResponse } from 'next/server';
import { getStoriesCol, getProjectsCol } from '../../../backend/db';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const project_id = searchParams.get('project_id');

    if (!project_id) {
      return NextResponse.json({ detail: "project_id is required" }, { status: 400 });
    }

    const storiesCol = await getStoriesCol();
    const cursor = storiesCol.find({ project_id }).sort({ s_seq: 1 });
    const docs = await cursor.toArray();

    const stories = [];
    for (const doc of docs) {
      const s = { ...doc };
      s._id = String(s._id);

      if (!s.status) {
        s.status = "Not Started";
      }

      if (!s.created_at) {
        s.created_at = new Date();
        await storiesCol.updateOne({ _id: doc._id }, { $set: { created_at: s.created_at } });
      } else if (s.created_at instanceof Date) {
        s.created_at = s.created_at.toISOString();
      }

      if (s.end_date && s.end_date instanceof Date) {
        s.end_date = s.end_date.toISOString();
      }

      stories.push(s);
    }

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Stories GET error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { project_id, name, description, estimate_hours, assigned_user, reporter, end_date, priority, status } = body;

    if (!project_id || !name) {
      return NextResponse.json({ detail: "project_id and name are required" }, { status: 400 });
    }

    const projectsCol = await getProjectsCol();
    const project = await projectsCol.findOne({ _id: new ObjectId(project_id) });

    if (!project) {
      return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    }

    const storiesCol = await getStoriesCol();
    const count = await storiesCol.countDocuments({ project_id });
    const s_seq = count + 1;
    const custom_id = `${project.custom_id}s${s_seq}`;

    const story_doc = {
      project_id,
      name,
      description: description || null,
      estimate_hours: estimate_hours !== undefined ? parseFloat(estimate_hours) : 0.0,
      assigned_user: assigned_user || null,
      reporter: reporter || null,
      end_date: end_date ? new Date(end_date) : null,
      priority: priority || 'Medium',
      status: status || 'Not Started',
      s_seq,
      custom_id,
      created_at: new Date()
    };

    const result = await storiesCol.insertOne(story_doc);
    story_doc._id = String(result.insertedId);
    story_doc.created_at = story_doc.created_at.toISOString();
    if (story_doc.end_date) {
      story_doc.end_date = story_doc.end_date.toISOString();
    }

    return NextResponse.json(story_doc);
  } catch (error) {
    console.error('Stories POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
