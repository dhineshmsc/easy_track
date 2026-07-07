from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global store for OTPs in-memory (email -> otp)
otp_store = {}

class EmailRequest(BaseModel):
    email: str
    name: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

@app.post("/otp")
def send_otp(req: EmailRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")

    # Generate 6-digit random OTP
    otp = str(random.randint(100000, 999999))
    otp_store[req.email] = otp
    print(f"\n[OTP DEBUG] Generated OTP for {req.email}: {otp}\n")
    
    # SMTP Configuration from .env
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    sender_email = os.getenv("SENDER_EMAIL")

    if not all([smtp_user, smtp_pass, sender_email]):
        print(f"\n==================================================")
        print(f" MOCK OTP SENT TO: {req.email}")
        print(f" OTP CODE: {otp}")
        print(f"==================================================\n")
        return {"message": "OTP sent successfully (console mode)", "otp": otp}

    # Construct the email
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = req.email
    msg['Subject'] = "Your Easy Track Verification Code"

    greeting_name = req.name if req.name else "there"
    body = f"Hello {greeting_name},\n\nYour 6-digit verification code is: {otp}\n\nPlease enter this code to verify your email.\n\nThanks,\nEasy Track Team"
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        return {"message": "OTP sent successfully"}
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

@app.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    if not req.email or not req.otp:
        raise HTTPException(status_code=400, detail="Email and OTP are required")
    
    submitted_otp = req.otp.strip()
    stored_otp = otp_store.get(req.email)
    
    if stored_otp and stored_otp == submitted_otp:
        return {"message": "OTP verified successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP")

class CreateUserRequest(BaseModel):
    name: str
    mobile: str
    email: str
    code: str
    password: str
    domain: str
    plan: str

@app.post("/create_user")
def create_user(req: CreateUserRequest):
    stored_otp = otp_store.get(req.email)
    if not stored_otp or stored_otp != req.code.strip():
        raise HTTPException(status_code=400, detail="Invalid verification code")
    print(f"\n[USER REGISTRATION] User created successfully: {req.dict()}\n")
    return {"message": "User created successfully", "user": req.dict()}


