from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class StoryCreate(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None

class StoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class StoryResponse(BaseModel):
    id: str = Field(alias="_id")
    project_id: str
    s_seq: int
    custom_id: str
    name: str
    description: Optional[str] = None
    status: str
    created_at: datetime
