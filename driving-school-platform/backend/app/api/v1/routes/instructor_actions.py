from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.put("/lessons/{lesson_id}/accept")
async def accept_lesson(
    lesson_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can accept lessons")
    
    db = get_database()
    
    # Verify instructor owns this lesson
    instructor_id = await get_instructor_id(current_user["email"], db)
    lesson = await db.lessons.find_one({
        "_id": ObjectId(lesson_id),
        "instructor_id": instructor_id
    })
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Update lesson status
    await db.lessons.update_one(
        {"_id": ObjectId(lesson_id)},
        {"$set": {"status": "confirmed", "updated_at": datetime.utcnow()}}
    )
    
    # Create notification for student
    student = await db.students.find_one({"_id": lesson["student_id"]})
    notification = {
        "user_email": student["email"],
        "title": "Lesson Confirmed",
        "message": f"Your lesson for {lesson['scheduled_date']} has been confirmed by your instructor",
        "type": "lesson_confirmed",
        "lesson_id": lesson_id,
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    await db.notifications.insert_one(notification)
    
    return {"message": "Lesson accepted successfully"}

@router.put("/lessons/{lesson_id}/reject")
async def reject_lesson(
    lesson_id: str,
    reason: str = "No reason provided",
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can reject lessons")
    
    db = get_database()
    
    # Update lesson status
    await db.lessons.update_one(
        {"_id": ObjectId(lesson_id)},
        {"$set": {"status": "cancelled", "notes": f"Rejected: {reason}", "updated_at": datetime.utcnow()}}
    )
    
    # Get lesson and student details
    lesson = await db.lessons.find_one({"_id": ObjectId(lesson_id)})
    student = await db.students.find_one({"_id": lesson["student_id"]})
    
    # Create notification for student
    notification = {
        "user_email": student["email"],
        "title": "Lesson Cancelled",
        "message": f"Your lesson for {lesson['scheduled_date']} has been cancelled. Reason: {reason}",
        "type": "lesson_cancelled",
        "lesson_id": lesson_id,
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    await db.notifications.insert_one(notification)
    
    return {"message": "Lesson rejected successfully"}

@router.get("/pending-lessons")
async def get_pending_lessons(current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can view pending lessons")
    
    db = get_database()
    instructor_id = await get_instructor_id(current_user["email"], db)
    
    lessons = []
    async for lesson in db.lessons.find({
        "instructor_id": instructor_id,
        "status": "scheduled"
    }).sort("scheduled_date", 1):
        # Get student details
        student = await db.students.find_one({"_id": lesson["student_id"]})
        
        lesson["id"] = str(lesson["_id"])
        lesson["student_id"] = str(lesson["student_id"])
        lesson["instructor_id"] = str(lesson["instructor_id"])
        lesson["student_name"] = f"{student['first_name']} {student['last_name']}"
        lesson["student_phone"] = student["phone"]
        
        lessons.append(lesson)
    
    return lessons

async def get_instructor_id(email: str, db):
    instructor = await db.instructors.find_one({"email": email})
    return instructor["_id"] if instructor else None