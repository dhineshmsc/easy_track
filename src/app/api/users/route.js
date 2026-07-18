import { NextResponse } from 'next/server';
import { getUsersCol, getCompaniesCol } from '../../../backend/db';
import { hashPassword } from '../../../backend/auth';
import { sendWelcomeEmail } from '../../../backend/utils';
import crypto from 'crypto';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const company_name = searchParams.get('company_name');

    if (!company_name) {
      return NextResponse.json({ detail: "company_name is required" }, { status: 400 });
    }

    const usersCol = await getUsersCol();
    const cursor = usersCol.find({ company_name }).sort({ created_at: -1 });
    const docs = await cursor.toArray();

    const users = docs.map(doc => {
      const u = { ...doc };
      u.id = String(u._id);
      u._id = String(u._id);

      if (u.created_at && u.created_at instanceof Date) {
        u.created_at = u.created_at.toISOString();
      } else {
        u.created_at = String(u.created_at || "");
      }

      if (u.updated_at && u.updated_at instanceof Date) {
        u.updated_at = u.updated_at.toISOString();
      } else {
        u.updated_at = String(u.updated_at || "");
      }

      u.user_id = u.user_id !== undefined ? u.user_id : String(u._id);
      return u;
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const company_name = searchParams.get('company_name');

    if (!company_name) {
      return NextResponse.json({ detail: "company_name query parameter is required" }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, mobile, designation, role, status, profile_image, created_by } = body;

    const usersCol = await getUsersCol();
    const existing = await usersCol.findOne({ email });
    if (existing) {
      return NextResponse.json({ detail: "Email already registered" }, { status: 400 });
    }

    // Generate user_id
    const lastUser = await usersCol.findOne({}, { sort: { user_id: -1 } });
    let user_id;
    if (lastUser && typeof lastUser.user_id === 'number') {
      user_id = lastUser.user_id + 1;
    } else {
      user_id = Math.floor(Date.now() / 1000);
    }

    // Auto-generate password
    const generated_password = crypto.randomBytes(8).toString('base64url');
    const hashed_pw = hashPassword(generated_password);

    const now = new Date();

    const companiesCol = await getCompaniesCol();
    const company = await companiesCol.findOne({ company_name });
    const company_id = company ? company.company_id : null;

    const user_doc = {
      company_id,
      company_name,
      user_id,
      name,
      email,
      mobile: mobile || "",
      password: hashed_pw,
      designation: designation || "",
      role: role || "Developer",
      status: status || "Active",
      profile_image: profile_image || "",
      created_by: created_by || { id: "system", name: "System" },
      created_at: now,
      updated_at: now,
      is_first_login: true
    };

    const result = await usersCol.insertOne(user_doc);
    user_doc.id = String(result.insertedId);
    user_doc._id = String(result.insertedId);

    // Send welcome email in background
    sendWelcomeEmail(email, generated_password, name).catch(err => {
      console.error("Failed to send welcome email in background:", err);
    });

    user_doc.created_at = user_doc.created_at.toISOString();
    user_doc.updated_at = user_doc.updated_at.toISOString();

    delete user_doc.password;
    user_doc.generated_password = generated_password;

    return NextResponse.json(user_doc);
  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
