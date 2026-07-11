from typing import Optional
from pydantic import BaseModel

class EmailRequest(BaseModel):
    email: str
    name: Optional[str] = None
    purpose: Optional[str] = "register"

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class CreateUserRequest(BaseModel):
    name: str
    mobile: str
    email: str
    code: str
    password: str
    company_name: str
    plan: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class UpdateFirstPasswordRequest(BaseModel):
    email: str
    old_password: str
    new_password: str
