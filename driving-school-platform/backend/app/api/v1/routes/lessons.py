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
    
    return lesson_dict

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