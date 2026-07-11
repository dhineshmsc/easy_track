from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    mobile: Optional[str] = ""
    designation: Optional[str] = ""
    role: str = Field(..., pattern="^(Owner|Admin|Project Manager|Developer|Tester|Viewer)$")
    status: str = Field(default="Active", pattern="^(Active|Inactive)$")
    profile_image: Optional[str] = ""
    created_by: Dict[str, Any] = Field(default_factory=lambda: {"id": "system", "name": "System"})

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    designation: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(Owner|Admin|Project Manager|Developer|Tester|Viewer)$")
    status: Optional[str] = Field(None, pattern="^(Active|Inactive)$")
    profile_image: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    company_name: str
    user_id: int
    name: str
    email: str
    mobile: str
    designation: str
    role: str
    status: str
    profile_image: str
    created_by: Dict[str, Any]
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True
