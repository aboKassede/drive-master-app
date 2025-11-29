from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/lessons/{lesson_id}/notes")
async def add_lesson_notes(
    lesson_id: str,
    notes_data: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can add notes")
    
    db = get_database()
    
    progress_entry = {
        "lesson_id": ObjectId(lesson_id),
        "instructor_email": current_user["email"],
        "notes": notes_data.get("notes", ""),
        "performance_rating": notes_data.get("rating", 0),
        "skills_practiced": notes_data.get("skills", []),
        "areas_to_improve": notes_data.get("improvements", []),
        "created_at": datetime.utcnow()
    }
    
    await db.progress.insert_one(progress_entry)
    
    # Update lesson with notes
    await db.lessons.update_one(
        {"_id": ObjectId(lesson_id)},
        {"$set": {"notes": notes_data.get("notes", ""), "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Progress notes added successfully"}

@router.get("/student/{student_id}")
async def get_student_progress(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Get all lessons for student
    lessons = []
    async for lesson in db.lessons.find({"student_id": ObjectId(student_id)}):
        lesson["id"] = str(lesson["_id"])
        lessons.append(lesson)
    
    # Get progress entries
    progress = []
    async for entry in db.progress.find({"lesson_id": {"$in": [ObjectId(l["id"]) for l in lessons]}}):
        entry["id"] = str(entry["_id"])
        progress.append(entry)
    
    return {
        "total_lessons": len(lessons),
        "completed_lessons": len([l for l in lessons if l["status"] == "completed"]),
        "average_rating": sum([p.get("performance_rating", 0) for p in progress]) / len(progress) if progress else 0,
        "progress_entries": progress
    }