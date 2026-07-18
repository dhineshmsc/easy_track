import { NextResponse } from 'next/server';
import { getUsersCol } from '../../../../backend/db';
import { ObjectId } from 'mongodb';

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const updateData = {};
    const allowedFields = ['name', 'email', 'mobile', 'designation', 'role', 'status', 'profile_image'];
    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== null) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ detail: "No fields to update" }, { status: 400 });
    }

    updateData.updated_at = new Date();

    const usersCol = await getUsersCol();
    const result = await usersCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    const doc = await usersCol.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    doc.id = String(doc._id);
    doc._id = String(doc._id);

    if (doc.created_at && doc.created_at instanceof Date) {
      doc.created_at = doc.created_at.toISOString();
    } else {
      doc.created_at = String(doc.created_at || "");
    }

    if (doc.updated_at && doc.updated_at instanceof Date) {
      doc.updated_at = doc.updated_at.toISOString();
    } else {
      doc.updated_at = String(doc.updated_at || "");
    }

    delete doc.password;

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Users PUT ID error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const usersCol = await getUsersCol();
    const result = await usersCol.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Users DELETE ID error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
