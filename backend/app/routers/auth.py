import datetime
from fastapi import APIRouter, HTTPException

from app.schemas.user import EmailRequest, VerifyOTPRequest, CreateUserRequest, LoginRequest, ResetPasswordRequest, UpdateFirstPasswordRequest
from app.database import get_users_collection, get_companies_collection
from app.utils import generate_otp, send_otp_email, verify_stored_otp
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/otp")
async def send_otp(req: EmailRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")

    users_collection = get_users_collection()
    user = users_collection.find_one({"email": req.email})
    
    if req.purpose == "register" and user:
        raise HTTPException(status_code=400, detail="this account already have")
    elif req.purpose == "reset" and not user:
        raise HTTPException(status_code=404, detail="Account not found. Please sign up.")

    otp = generate_otp(req.email)
    
    name = user.get("name", "there") if user else req.name
    success = send_otp_email(req.email, otp, name)
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
    last_user = users_collection.find_one(sort=[("user_id", -1)])
    user_id = last_user["user_id"] + 1 if last_user and "user_id" in last_user else 1
    created_at = datetime.datetime.utcnow()

    # Create the document
    user_data = req.dict()
    user_data["user_id"] = user_id
    user_data["created_at"] = created_at
    user_data["password"] = hash_password(req.password)
    user_data["role"] = "super admin"
    
    # Calculate expire_date
    plan_lower = req.plan.lower()
    days_to_add = 30
    if plan_lower == "silver" or plan_lower == "sliver":
        days_to_add = 60
    elif plan_lower == "gold":
        days_to_add = 90
    elif plan_lower == "platinum":
        days_to_add = 120
    expire_date = created_at + datetime.timedelta(days=days_to_add)
    
    # Do not save the code/OTP in DB
    if "code" in user_data:
        del user_data["code"]

    try:
        # Create company document
        companies_collection = get_companies_collection()
        company_data = {
            "company_name": req.company_name,
            "plan": req.plan,
            "expire_date": expire_date,
            "created_at": created_at,
            "email": req.email,
            "mobile":req.mobile,
            "user_id": user_id,
            "status":"active",
        }
        
        if companies_collection is not None:
            companies_collection.insert_one(company_data)
            
        # Insert user into global users collection
        users_collection.insert_one(user_data)
            
        if "_id" in user_data:
            del user_data["_id"]
        if "password" in user_data:
            del user_data["password"]
            
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
        
    access_token = create_access_token(data={"user_id": user.get("user_id")})
        
    return {
        "message": "Login success", 
        "user_id": user.get("user_id"),
        "name": user.get("name", ""),
        "company": user.get("company_name", "default"),
        "token": access_token,
        "is_first_login": user.get("is_first_login", False)
    }



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

@router.post("/update-first-password")
async def update_first_password(req: UpdateFirstPasswordRequest):
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": req.email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    stored_password = user.get("password", "")
    is_valid = verify_password(req.old_password, stored_password)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid current password")
        
    hashed_pw = hash_password(req.new_password)
    users_collection.update_one(
        {"email": req.email}, 
        {"$set": {"password": hashed_pw, "is_first_login": False}}
    )
    
    return {"message": "Password updated successfully"}
