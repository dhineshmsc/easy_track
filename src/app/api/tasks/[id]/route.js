import { NextResponse } from 'next/server';
import { getTasksCol } from '../../../../backend/db';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const tasksCol = await getTasksCol();
    const doc = await tasksCol.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ detail: "Task not found" }, { status: 404 });
    }
    doc._id = String(doc._id);
    if (doc.created_at && doc.created_at instanceof Date) {
      doc.created_at = doc.created_at.toISOString();
    }
    if (doc.end_date && doc.end_date instanceof Date) {
      doc.end_date = doc.end_date.toISOString();
    }
    return NextResponse.json(doc);
  } catch (error) {
    console.error('Tasks GET ID error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const updateData = {};
    const allowedFields = ['name', 'description', 'type', 'status', 'estimate_hours', 'assigned_user', 'reporter', 'end_date', 'priority', 'image_path', 'comments', 'work_status', 'team_assignment'];
    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== null) {
        if (field === 'end_date' && body[field]) {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ detail: "No fields to update" }, { status: 400 });
    }

    const tasksCol = await getTasksCol();
    await tasksCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const doc = await tasksCol.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ detail: "Task not found" }, { status: 404 });
    }

    doc._id = String(doc._id);
    if (!doc.created_at) {
      doc.created_at = new Date();
      await tasksCol.updateOne({ _id: new ObjectId(id) }, { $set: { created_at: doc.created_at } });
    } else if (doc.created_at instanceof Date) {
      doc.created_at = doc.created_at.toISOString();
    }

    if (doc.end_date && doc.end_date instanceof Date) {
      doc.end_date = doc.end_date.toISOString();
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Tasks PUT ID error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const tasksCol = await getTasksCol();
    const result = await tasksCol.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ detail: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error('Tasks DELETE ID error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
