import { NextResponse } from 'next/server';
import { getStoriesCol, getTasksCol } from '../../../../backend/db';
import { ObjectId } from 'mongodb';

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const updateData = {};
    const allowedFields = ['name', 'description', 'estimate_hours', 'assigned_user', 'reporter', 'end_date', 'priority', 'status'];
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

    const storiesCol = await getStoriesCol();
    const result = await storiesCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const doc = await storiesCol.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ detail: "Story not found" }, { status: 404 });
    }

    doc._id = String(doc._id);
    if (!doc.status) {
      doc.status = "Not Started";
    }

    if (!doc.created_at) {
      doc.created_at = new Date();
      await storiesCol.updateOne({ _id: new ObjectId(id) }, { $set: { created_at: doc.created_at } });
    } else if (doc.created_at instanceof Date) {
      doc.created_at = doc.created_at.toISOString();
    }

    if (doc.end_date && doc.end_date instanceof Date) {
      doc.end_date = doc.end_date.toISOString();
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Stories PUT ID error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const storiesCol = await getStoriesCol();
    const tasksCol = await getTasksCol();

    const result = await storiesCol.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ detail: "Story not found" }, { status: 404 });
    }

    // Delete tasks of this story
    await tasksCol.deleteMany({ story_id: id });

    return NextResponse.json({ message: "Story and its tasks deleted successfully" });
  } catch (error) {
    console.error('Stories DELETE ID error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
