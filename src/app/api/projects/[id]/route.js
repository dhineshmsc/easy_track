import { NextResponse } from 'next/server';
import { getProjectsCol, getStoriesCol, getTasksCol } from '../../../../backend/db';
import { ObjectId } from 'mongodb';

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const updateData = {};
    const allowedFields = ['name', 'description', 'estimate_hours', 'end_date', 'priority', 'assigned_user', 'reporter', 'status'];
    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== null) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ detail: "No fields to update" }, { status: 400 });
    }

    const projectsCol = await getProjectsCol();
    const result = await projectsCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const doc = await projectsCol.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    }

    doc._id = String(doc._id);
    if (!doc.status) {
      doc.status = "Not Started";
    }

    if (!doc.created_at) {
      doc.created_at = new Date();
      await projectsCol.updateOne({ _id: new ObjectId(id) }, { $set: { created_at: doc.created_at } });
    } else if (doc.created_at instanceof Date) {
      doc.created_at = doc.created_at.toISOString();
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Projects PUT ID error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const projectsCol = await getProjectsCol();
    const storiesCol = await getStoriesCol();
    const tasksCol = await getTasksCol();

    const result = await projectsCol.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    }

    // Delete children (stories & tasks)
    const stories = await storiesCol.find({ project_id: id }).toArray();
    for (const story of stories) {
      const storyId = String(story._id);
      await tasksCol.deleteMany({ story_id: storyId });
    }
    await storiesCol.deleteMany({ project_id: id });

    return NextResponse.json({ message: "Project and its stories/tasks deleted successfully" });
  } catch (error) {
    console.error('Projects DELETE ID error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
