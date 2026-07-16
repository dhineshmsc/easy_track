from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId

from app.database import get_stories_collection, get_projects_collection, get_tasks_collection
from app.schemas.story import StoryCreate, StoryUpdate, StoryResponse

router = APIRouter(prefix="/stories", tags=["Stories"])

@router.post("/", response_model=StoryResponse)
async def create_story(req: StoryCreate):
    stories_col = get_stories_collection()
    projects_col = get_projects_collection()
    
    project = projects_col.find_one({"_id": ObjectId(req.project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    count = stories_col.count_documents({"project_id": req.project_id})
    s_seq = count + 1
    custom_id = f"{project['custom_id']}s{s_seq}"
        
    doc = req.dict()
    doc["s_seq"] = s_seq
    doc["custom_id"] = custom_id
    if "status" not in doc or not doc["status"]:
        doc["status"] = "Not Started"
    doc["created_at"] = datetime.utcnow()
    
    result = stories_col.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    
    return doc

@router.get("/", response_model=List[StoryResponse])
async def get_stories(project_id: str):
    stories_col = get_stories_collection()
    cursor = stories_col.find({"project_id": project_id}).sort("s_seq", 1)
    
    stories = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if "status" not in doc or not doc["status"]:
            doc["status"] = "Not Started"
        if "created_at" not in doc or not doc["created_at"]:
            doc["created_at"] = datetime.utcnow()
            stories_col.update_one({"_id": doc["_id"]}, {"$set": {"created_at": doc["created_at"]}})
        stories.append(doc)
    return stories

@router.put("/{story_id}", response_model=StoryResponse)
async def update_story(story_id: str, req: StoryUpdate):
    stories_col = get_stories_collection()
    
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    stories_col.update_one({"_id": ObjectId(story_id)}, {"$set": update_data})
    
    doc = stories_col.find_one({"_id": ObjectId(story_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Story not found")
        
    doc["_id"] = str(doc["_id"])
    if "status" not in doc or not doc["status"]:
        doc["status"] = "Not Started"
    if "created_at" not in doc or not doc["created_at"]:
        doc["created_at"] = datetime.utcnow()
        stories_col.update_one({"_id": ObjectId(story_id)}, {"$set": {"created_at": doc["created_at"]}})
    return doc

@router.delete("/{story_id}")
async def delete_story(story_id: str):
    stories_col = get_stories_collection()
    tasks_col = get_tasks_collection()
    
    result = stories_col.delete_one({"_id": ObjectId(story_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
        
    tasks_col.delete_many({"story_id": story_id})
    
    return {"message": "Story and its tasks deleted successfully"}
