from app.db.mongo import get_database
from bson import ObjectId
from datetime import datetime

class LessonService:
    @staticmethod
    async def create_lesson(lesson_data: dict):
        db = get_database()
        lesson_data["created_at"] = datetime.utcnow()
        lesson_data["updated_at"] = datetime.utcnow()
        lesson_data["status"] = "scheduled"
        
        result = await db.lessons.insert_one(lesson_data)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_lessons_by_student(student_id: str):
        db = get_database()
        lessons = []
        async for lesson in db.lessons.find({"student_id": ObjectId(student_id)}):
            lesson["id"] = str(lesson["_id"])
            lesson["student_id"] = str(lesson["student_id"])
            lesson["instructor_id"] = str(lesson["instructor_id"])
            lessons.append(lesson)
        return lessons
    
    @staticmethod
    async def get_lessons_by_instructor(instructor_id: str):
        db = get_database()
        lessons = []
        async for lesson in db.lessons.find({"instructor_id": ObjectId(instructor_id)}):
            lesson["id"] = str(lesson["_id"])
            lesson["student_id"] = str(lesson["student_id"])
            lesson["instructor_id"] = str(lesson["instructor_id"])
            lessons.append(lesson)
        return lessons