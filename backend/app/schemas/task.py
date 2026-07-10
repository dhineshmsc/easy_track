from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    story_id: str
    type: str # 'Task' or 'Bug'
    name: str
    description: Optional[str] = None
    estimate_hours: float = 0.0

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    estimate_hours: Optional[float] = None

class TaskResponse(BaseModel):
    id: str = Field(alias="_id")
    story_id: str
    t_seq: int
    custom_id: str
    type: str
    name: str
    description: Optional[str] = None
    status: str
    estimate_hours: float
    created_at: datetime
