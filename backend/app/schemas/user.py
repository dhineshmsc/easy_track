from typing import Optional
from pydantic import BaseModel

class EmailRequest(BaseModel):
    email: str
    name: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class CreateUserRequest(BaseModel):
    name: str
    mobile: str
    email: str
    code: str
    password: str
    domain: str
    plan: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str
