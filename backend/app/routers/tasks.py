from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId

from app.database import get_tasks_collection, get_stories_collection
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskResponse)
async def create_task(req: TaskCreate):
    tasks_col = get_tasks_collection()
    stories_col = get_stories_collection()
    
    story = stories_col.find_one({"_id": ObjectId(req.story_id)})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
        
    count = tasks_col.count_documents({"story_id": req.story_id})
    t_seq = count + 1
    
    prefix = "t" if req.type == "Task" else "b"
    custom_id = f"{story['custom_id']}{prefix}{t_seq}"
        
    doc = req.dict()
    doc["t_seq"] = t_seq
    doc["custom_id"] = custom_id
    doc["status"] = req.status or "To Do"
    doc["created_at"] = datetime.utcnow()
    
    result = tasks_col.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    
    return doc

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(story_id: str):
    tasks_col = get_tasks_collection()
    cursor = tasks_col.find({"story_id": story_id}).sort("t_seq", 1)
    
    tasks = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        tasks.append(doc)
    return tasks

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, req: TaskUpdate):
    tasks_col = get_tasks_collection()
    
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})
    
    doc = tasks_col.find_one({"_id": ObjectId(task_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")
        
    doc["_id"] = str(doc["_id"])
    return doc

@router.delete("/{task_id}")
async def delete_task(task_id: str):
    tasks_col = get_tasks_collection()
    result = tasks_col.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
        
    return {"message": "Task deleted successfully"}
