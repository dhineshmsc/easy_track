from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List
from datetime import datetime
from bson import ObjectId
import secrets

from app.database import get_users_collection
from app.schemas.user_management import UserCreate, UserUpdate, UserResponse
from app.auth import hash_password
from app.utils import send_welcome_email

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[dict])
async def get_users(company_name: str = Query(...)):
    users_col = get_users_collection()
    cursor = users_col.find({"company_name": company_name}).sort("created_at", -1)
    
    users = []
    for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["_id"] = str(doc["_id"])
        
        # Format dates if they exist
        if "created_at" in doc and isinstance(doc["created_at"], datetime):
            doc["created_at"] = doc["created_at"].isoformat()
        else:
            doc["created_at"] = str(doc.get("created_at", ""))
            
        if "updated_at" in doc and isinstance(doc["updated_at"], datetime):
            doc["updated_at"] = doc["updated_at"].isoformat()
        else:
            doc["updated_at"] = str(doc.get("updated_at", ""))
            
        # Make sure user_id exists for frontend Datagrid
        doc["user_id"] = doc.get("user_id", str(doc["_id"]))
        
        users.append(doc)
        
    return users

@router.post("/", response_model=dict)
async def create_user(company_name: str, req: UserCreate, background_tasks: BackgroundTasks):
    users_col = get_users_collection()
    
    # Check if email is unique within the company
    existing = users_col.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Generate user_id
    last_user = users_col.find_one(sort=[("user_id", -1)])
    user_id = (last_user.get("user_id", 0) + 1) if last_user and isinstance(last_user.get("user_id"), int) else int(datetime.utcnow().timestamp())
    
    # Auto-generate password
    generated_password = secrets.token_urlsafe(8)
    hashed_pw = hash_password(generated_password)
    
    now = datetime.utcnow()
    
    user_doc = {
        "company_name": company_name,
        "user_id": user_id,
        "name": req.name,
        "email": req.email,
        "mobile": req.mobile,
        "password": hashed_pw,
        "designation": req.designation,
        "role": req.role,
        "status": req.status,
        "profile_image": req.profile_image,
        "created_by": req.created_by,
        "created_at": now,
        "updated_at": now,
        "is_first_login": True
    }
    
    result = users_col.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    user_doc["_id"] = str(result.inserted_id)
    
    # Send email with password
    background_tasks.add_task(send_welcome_email, req.email, generated_password, req.name)
    
    # Format dates for response
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    user_doc["updated_at"] = user_doc["updated_at"].isoformat()
    
    # Do not return the hashed password
    if "password" in user_doc:
        del user_doc["password"]
        
    # Provide the plain password in the response just for debugging/demonstration
    user_doc["generated_password"] = generated_password
        
    return user_doc

@router.put("/{user_obj_id}", response_model=dict)
async def update_user(user_obj_id: str, req: UserUpdate):
    users_col = get_users_collection()
    
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    update_data["updated_at"] = datetime.utcnow()
        
    result = users_col.update_one({"_id": ObjectId(user_obj_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    doc = users_col.find_one({"_id": ObjectId(user_obj_id)})
    doc["id"] = str(doc["_id"])
    doc["_id"] = str(doc["_id"])
    doc["created_at"] = doc.get("created_at").isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", ""))
    doc["updated_at"] = doc.get("updated_at").isoformat() if isinstance(doc.get("updated_at"), datetime) else str(doc.get("updated_at", ""))
    
    if "password" in doc:
        del doc["password"]
        
    return doc

@router.delete("/{user_obj_id}")
async def soft_delete_user(user_obj_id: str):
    users_col = get_users_collection()
    
    result = users_col.update_one(
        {"_id": ObjectId(user_obj_id)}, 
        {"$set": {"status": "Inactive", "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "User soft deleted (set to Inactive)"}
