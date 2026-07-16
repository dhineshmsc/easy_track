from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    company: str
    estimate_hours: Optional[float] = 0.0
    end_date: Optional[str] = None
    priority: Optional[str] = 'Medium'
    assigned_user: Optional[Union[List[str], str]] = None
    reporter: Optional[str] = None
    status: Optional[str] = 'Not Started'

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    estimate_hours: Optional[float] = None
    end_date: Optional[str] = None
    priority: Optional[str] = None
    assigned_user: Optional[Union[List[str], str]] = None
    reporter: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    description: Optional[str] = None
    company: str
    owner_id: str
    p_seq: int
    custom_id: str
    created_at: datetime
    estimate_hours: Optional[float] = 0.0
    end_date: Optional[str] = None
    priority: Optional[str] = 'Medium'
    assigned_user: Optional[Union[List[str], str]] = None
    reporter: Optional[str] = None
    status: Optional[str] = 'Not Started'
    
    # Aggregation fields
    story_count: int = 0
    task_count: int = 0
    pending_tasks: int = 0
    progress_tasks: int = 0
    completed_tasks: int = 0
    total_estimate_hours: float = 0.0
