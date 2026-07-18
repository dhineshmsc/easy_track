import { NextResponse } from 'next/server';
import { getUsersCol, getCompaniesCol } from '../../../backend/db';
import { verifyStoredOtp } from '../../../backend/utils';
import { hashPassword } from '../../../backend/auth';

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, mobile, email, code, password, company_name, plan } = data;

    if (!verifyStoredOtp(email, code)) {
      return NextResponse.json({ detail: "Invalid verification code" }, { status: 400 });
    }

    const usersCol = await getUsersCol();
    const existingUser = await usersCol.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ detail: "this account already have" }, { status: 400 });
    }

    // Generate sequential user ID
    const lastUser = await usersCol.findOne({}, { sort: { user_id: -1 } });
    const user_id = (lastUser && typeof lastUser.user_id === 'number') ? (lastUser.user_id + 1) : 1;
    const created_at = new Date();

    const plan_lower = String(plan || "").toLowerCase();
    let days_to_add = 30;
    if (plan_lower === "silver" || plan_lower === "sliver") {
      days_to_add = 60;
    } else if (plan_lower === "gold") {
      days_to_add = 90;
    } else if (plan_lower === "platinum") {
      days_to_add = 120;
    }
    const expire_date = new Date(created_at.getTime() + days_to_add * 24 * 60 * 60 * 1000);

    const companiesCol = await getCompaniesCol();
    let company_id = 1;
    const lastCompany = await companiesCol.findOne({}, { sort: { company_id: -1 } });
    if (lastCompany && typeof lastCompany.company_id === 'number') {
      company_id = lastCompany.company_id + 1;
    }

    const company_data = {
      company_id,
      company_name,
      plan,
      expire_date,
      created_at,
      email,
      mobile,
      user_id,
      status: "active",
    };
    await companiesCol.insertOne(company_data);

    const user_doc = {
      name,
      mobile,
      email,
      password: hashPassword(password),
      company_name,
      plan,
      user_id,
      company_id,
      created_at,
      role: "super admin",
    };
    await usersCol.insertOne(user_doc);

    // Format output
    const userResponse = { ...user_doc };
    delete userResponse._id;
    delete userResponse.password;

    console.log(`\n[USER REGISTRATION] User created successfully:`, userResponse);
    return NextResponse.json({ message: "User created successfully", user: userResponse });
  } catch (error) {
    console.error('Register POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
