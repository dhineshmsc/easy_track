import { NextResponse } from 'next/server';
import { getUsersCol } from '../../../backend/db';
import { verifyPassword, hashPassword } from '../../../backend/auth';

export async function POST(req) {
  try {
    const { email, old_password, new_password } = await req.json();

    const usersCol = await getUsersCol();
    const user = await usersCol.findOne({ email });

    if (!user) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    const storedPassword = user.password || "";
    const isValid = verifyPassword(old_password, storedPassword);

    if (!isValid) {
      return NextResponse.json({ detail: "Invalid current password" }, { status: 401 });
    }

    const hashedPw = hashPassword(new_password);
    await usersCol.updateOne(
      { email },
      { $set: { password: hashedPw, is_first_login: false } }
    );

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error('Update-First-Password POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
