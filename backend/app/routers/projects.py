from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId

from app.database import get_projects_collection, get_stories_collection, get_tasks_collection
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectResponse)
async def create_project(req: ProjectCreate):
    projects_col = get_projects_collection()
    
    count = projects_col.count_documents({"company": req.company})
    p_seq = count + 1
    custom_id = f"p{p_seq}"
        
    project_doc = req.dict()
    project_doc["p_seq"] = p_seq
    project_doc["custom_id"] = custom_id
    project_doc["created_at"] = datetime.utcnow()
    project_doc["owner_id"] = "system"
    
    result = projects_col.insert_one(project_doc)
    project_doc["_id"] = str(result.inserted_id)
    
    return project_doc

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(company: str):
    projects_col = get_projects_collection()
    stories_col = get_stories_collection()
    tasks_col = get_tasks_collection()
    
    cursor = projects_col.find({"company": company}).sort("p_seq", 1)
    
    projects = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        
        project_id = doc["_id"]
        stories = list(stories_col.find({"project_id": project_id}))
        story_ids = [str(s["_id"]) for s in stories]
        
        doc["story_count"] = len(stories)
        
        if story_ids:
            tasks = list(tasks_col.find({"story_id": {"$in": story_ids}}))
            doc["task_count"] = len(tasks)
            
            pending = 0
            progress = 0
            completed = 0
            total_est = 0.0
            
            for t in tasks:
                status = t.get("status", "To Do")
                if status == "To Do":
                    pending += 1
                elif status == "In Progress":
                    progress += 1
                elif status == "Done":
                    completed += 1
                total_est += float(t.get("estimate_hours", 0))
                
            doc["pending_tasks"] = pending
            doc["progress_tasks"] = progress
            doc["completed_tasks"] = completed
            doc["total_estimate_hours"] = total_est
        else:
            doc["task_count"] = 0
            doc["pending_tasks"] = 0
            doc["progress_tasks"] = 0
            doc["completed_tasks"] = 0
            doc["total_estimate_hours"] = 0.0
            
        projects.append(doc)
        
    return projects

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, req: ProjectUpdate):
    projects_col = get_projects_collection()
    
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    projects_col.update_one({"_id": ObjectId(project_id)}, {"$set": update_data})
    
    doc = projects_col.find_one({"_id": ObjectId(project_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
        
    doc["_id"] = str(doc["_id"])
    return doc

@router.delete("/{project_id}")
async def delete_project(project_id: str):
    projects_col = get_projects_collection()
    stories_col = get_stories_collection()
    tasks_col = get_tasks_collection()
    
    result = projects_col.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Delete children (stories)
    stories = stories_col.find({"project_id": project_id})
    for story in stories:
        tasks_col.delete_many({"story_id": str(story["_id"])})
        
    stories_col.delete_many({"project_id": project_id})
    
    return {"message": "Project and its stories/tasks deleted successfully"}
