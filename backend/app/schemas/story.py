from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import datetime

class StoryCreate(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None
    estimate_hours: float = 0.0
    assigned_user: Optional[Union[List[str], str]] = None
    reporter: Optional[str] = None
    end_date: Optional[datetime] = None
    priority: str = "Medium"
    status: Optional[str] = 'Not Started'

class StoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    estimate_hours: Optional[float] = None
    assigned_user: Optional[Union[List[str], str]] = None
    reporter: Optional[str] = None
    end_date: Optional[datetime] = None
    priority: Optional[str] = None

class StoryResponse(BaseModel):
    id: str = Field(alias="_id")
    project_id: str
    s_seq: int
    custom_id: str
    name: str
    description: Optional[str] = None
    status: str
    estimate_hours: float = 0.0
    assigned_user: Optional[Union[List[str], str]] = None
    reporter: Optional[str] = None
    end_date: Optional[datetime] = None
    priority: str = "Medium"
    created_at: datetime
