import { NextResponse } from 'next/server';
import { getUsersCol } from '../../../backend/db';
import { verifyStoredOtp } from '../../../backend/utils';
import { hashPassword } from '../../../backend/auth';

export async function POST(req) {
  try {
    const { email, otp, new_password } = await req.json();

    if (!verifyStoredOtp(email, otp)) {
      return NextResponse.json({ detail: "Invalid verification code" }, { status: 400 });
    }

    const usersCol = await getUsersCol();
    const user = await usersCol.findOne({ email });

    if (!user) {
      return NextResponse.json({ detail: "Account not found." }, { status: 404 });
    }

    const hashedPw = hashPassword(new_password);
    await usersCol.updateOne({ email }, { $set: { password: hashedPw } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error('Reset-Password POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
