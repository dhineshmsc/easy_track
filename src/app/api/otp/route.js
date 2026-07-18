import { NextResponse } from 'next/server';
import { getUsersCol } from '../../../backend/db';
import { generateOtp, sendOtpEmail } from '../../../backend/utils';

export async function POST(req) {
  try {
    const { email, name, purpose } = await req.json();

    if (!email) {
      return NextResponse.json({ detail: "Email is required" }, { status: 400 });
    }

    const usersCol = await getUsersCol();
    const user = await usersCol.findOne({ email });

    if (purpose === "register" && user) {
      return NextResponse.json({ detail: "this account already have" }, { status: 400 });
    } else if (purpose === "reset" && !user) {
      return NextResponse.json({ detail: "Account not found. Please sign up." }, { status: 404 });
    }

    const otp = generateOtp(email);
    const greetingName = user ? (user.name || "there") : name;
    
    const success = await sendOtpEmail(email, otp, greetingName);
    if (!success) {
      return NextResponse.json({ detail: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error('OTP POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
