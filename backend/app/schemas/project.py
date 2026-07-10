from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    company: str

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    description: Optional[str] = None
    company: str
    owner_id: str
    p_seq: int
    custom_id: str
    created_at: datetime
    
    # Aggregation fields
    story_count: int = 0
    task_count: int = 0
    pending_tasks: int = 0
    progress_tasks: int = 0
    completed_tasks: int = 0
    total_estimate_hours: float = 0.0
