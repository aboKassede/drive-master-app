from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.schemas.lesson import LessonCreate, LessonResponse
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from app.db.models.lesson import Lesson
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=LessonResponse)
async def create_lesson(
    lesson_data: LessonCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "student":
        raise HTTPException(status_code=403, detail="Only students can book lessons")
    
    db = get_database()
    student = await db.students.find_one({"email": current_user["email"]})
    
    lesson_dict = {
        "student_id": ObjectId(str(student["_id"])),
        "instructor_id": ObjectId(lesson_data.instructor_id),
        "lesson_type": lesson_data.lesson_type,
        "scheduled_date": lesson_data.scheduled_date,
        "duration_minutes": lesson_data.duration_minutes,
        "status": "scheduled",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.lessons.insert_one(lesson_dict)
    lesson_dict["id"] = str(result.inserted_id)
    lesson_dict["student_id"] = str(lesson_dict["student_id"])
    lesson_dict["instructor_id"] = str(lesson_dict["instructor_id"])
    
    # Create notifications
    notifications = [
        {
            "user_email": current_user["email"],
            "title": "Lesson Booked",
            "message": f"Your lesson is scheduled for {lesson_data.scheduled_date}",
            "type": "lesson_booked",
            "lesson_id": str(result.inserted_id),
            "read": False,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Get instructor for notification
    instructor = await db.instructors.find_one({"_id": ObjectId(lesson_data.instructor_id)})
    if instructor:
        notifications.append({
            "user_email": instructor["email"],
            "title": "New Lesson Request",
            "message": f"New lesson request for {lesson_data.scheduled_date}",
            "type": "lesson_request",
            "lesson_id": str(result.inserted_id),
            "read": False,
            "created_at": datetime.utcnow()
        })
    
    try:
        await db.notifications.insert_many(notifications)
    except Exception as e:
        print(f"Failed to create notifications: {e}")
    
    return lesson_dict

@router.get("/upcoming", response_model=List[LessonResponse])
async def get_upcoming_lessons(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    if current_user["user_type"] == "student":
        student = await db.students.find_one({"email": current_user["email"]})
        query = {
            "student_id": student["_id"],
            "scheduled_date": {"$gte": datetime.utcnow()},
            "status": {"$in": ["scheduled", "confirmed"]}
        }
    else:
        instructor = await db.instructors.find_one({"email": current_user["email"]})
        query = {
            "instructor_id": instructor["_id"],
            "scheduled_date": {"$gte": datetime.utcnow()},
            "status": {"$in": ["scheduled", "confirmed"]}
        }
    
    lessons = []
    async for lesson in db.lessons.find(query).sort("scheduled_date", 1).limit(5):
        lesson["id"] = str(lesson["_id"])
        lesson["student_id"] = str(lesson["student_id"])
        lesson["instructor_id"] = str(lesson["instructor_id"])
        
        # Add instructor/student name for display
        if current_user["user_type"] == "student":
            instructor = await db.instructors.find_one({"_id": lesson["instructor_id"]})
            if instructor:
                lesson["instructor_name"] = f"{instructor.get('first_name', '')} {instructor.get('last_name', '')}"
        else:
            student = await db.students.find_one({"_id": lesson["student_id"]})
            if student:
                lesson["student_name"] = f"{student.get('first_name', '')} {student.get('last_name', '')}"
        
        lessons.append(lesson)
    
    return lessons

@router.get("/my-lessons", response_model=List[LessonResponse])
async def get_my_lessons(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    if current_user["user_type"] == "student":
        student = await db.students.find_one({"email": current_user["email"]})
        query = {"student_id": student["_id"]}
    else:
        instructor = await db.instructors.find_one({"email": current_user["email"]})
        query = {"instructor_id": instructor["_id"]}
    
    lessons = []
    async for lesson in db.lessons.find(query):
        lesson["id"] = str(lesson["_id"])
        lesson["student_id"] = str(lesson["student_id"])
        lesson["instructor_id"] = str(lesson["instructor_id"])
        lessons.append(lesson)
    
    return lessons