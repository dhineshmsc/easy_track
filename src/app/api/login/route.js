import { NextResponse } from 'next/server';
import { getUsersCol, getCompaniesCol } from '../../../backend/db';
import { verifyPassword, createAccessToken } from '../../../backend/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const usersCol = await getUsersCol();
    const user = await usersCol.findOne({ email });

    if (!user) {
      return NextResponse.json({ detail: "create signup" }, { status: 404 });
    }

    const storedPassword = user.password || "";
    const isValid = verifyPassword(password, storedPassword);

    if (!isValid) {
      return NextResponse.json({ detail: "unable to login" }, { status: 401 });
    }

    const companyName = user.company_name;
    if (companyName) {
      const companiesCol = await getCompaniesCol();
      const company = await companiesCol.findOne({ company_name: companyName });
      if (company && company.expire_date) {
        const expireDate = new Date(company.expire_date);
        if (new Date() > expireDate) {
          return NextResponse.json({ detail: "your plan is completed, please purchase" }, { status: 403 });
        }
      }
    }

    const status = user.status || "Active";
    if (status.toLowerCase() === "inactive") {
      return NextResponse.json({ detail: "your account is block please ask to admin" }, { status: 403 });
    }

    const token = createAccessToken({ user_id: user.user_id });

    return NextResponse.json({
      message: "Login success",
      user_id: user.user_id,
      name: user.name || "",
      role: user.role || "Developer",
      company: user.company_name || "default",
      token: token,
      is_first_login: !!user.is_first_login
    });
  } catch (error) {
    console.error('Login POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
