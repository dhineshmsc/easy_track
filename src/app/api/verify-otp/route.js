import { NextResponse } from 'next/server';
import { verifyStoredOtp } from '../../../backend/utils';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ detail: "Email and OTP are required" }, { status: 400 });
    }

    if (verifyStoredOtp(email, otp)) {
      return NextResponse.json({ message: "OTP verified successfully" });
    } else {
      return NextResponse.json({ detail: "Invalid OTP" }, { status: 400 });
    }
  } catch (error) {
    console.error('Verify-OTP POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
