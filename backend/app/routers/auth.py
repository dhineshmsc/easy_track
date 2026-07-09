import datetime
from fastapi import APIRouter, HTTPException

from app.schemas.user import EmailRequest, VerifyOTPRequest, CreateUserRequest, LoginRequest, ResetPasswordRequest
from app.database import get_users_collection
from app.utils import generate_otp, send_otp_email, verify_stored_otp
from app.auth import hash_password, verify_password

router = APIRouter()

@router.post("/otp")
async def send_otp(req: EmailRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")

    users_collection = get_users_collection()
    
    # Check if user already exists in DB before sending OTP
    if users_collection.find_one({"email": req.email}):
        raise HTTPException(status_code=400, detail="this account already have")

    otp = generate_otp(req.email)
    
    success = send_otp_email(req.email, otp, req.name)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
        
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    if not req.email or not req.otp:
        raise HTTPException(status_code=400, detail="Email and OTP are required")
    
    if verify_stored_otp(req.email, req.otp):
        return {"message": "OTP verified successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP")

@router.post("/register")
async def register(req: CreateUserRequest):
    if not verify_stored_otp(req.email, req.code):
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    users_collection = get_users_collection()
    
    # Check if user already exists in DB
    if users_collection.find_one({"email": req.email}):
        raise HTTPException(status_code=400, detail="this account already have")

    # Generate sequential user ID (s.no) and Timestamp
    last_user = users_collection.find_one(sort=[("id", -1)])
    user_id = last_user["id"] + 1 if last_user and "id" in last_user else 1
    created_at = datetime.datetime.utcnow()

    # Create the document
    user_data = req.dict()
    user_data["id"] = user_id
    user_data["created_at"] = created_at
    user_data["password"] = hash_password(req.password)
    
    # Do not save the code/OTP in DB
    if "code" in user_data:
        del user_data["code"]

    try:
        users_collection.insert_one(user_data)
        if "_id" in user_data:
            del user_data["_id"]
            
        print(f"\n[USER REGISTRATION] User created successfully: {user_data}\n")
        return {"message": "User created successfully", "user": user_data}
    except Exception as e:
        print(f"[USER REGISTRATION ERROR]: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user in database")

@router.post("/login")
async def login(req: LoginRequest):
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": req.email})
    
    if not user:
        raise HTTPException(status_code=404, detail="Please signup")
    
    stored_password = user.get("password", "")
    is_valid = verify_password(req.password, stored_password)

    if not is_valid:
        raise HTTPException(status_code=401, detail="Unable to login")
        
    return {"message": "Login success", "name": user.get("name", "")}

@router.post("/reset-password-otp")
async def send_reset_otp(req: EmailRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")

    users_collection = get_users_collection()
    user = users_collection.find_one({"email": req.email})
    
    if not user:
        raise HTTPException(status_code=404, detail="Account not found. Please sign up.")

    otp = generate_otp(req.email)
    
    success = send_otp_email(req.email, otp, user.get("name", "there"))
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
        
    return {"message": "OTP sent successfully"}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    if not verify_stored_otp(req.email, req.otp):
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": req.email})
    
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    hashed_pw = hash_password(req.new_password)
    users_collection.update_one({"email": req.email}, {"$set": {"password": hashed_pw}})
    
    return {"message": "Password reset successfully"}
