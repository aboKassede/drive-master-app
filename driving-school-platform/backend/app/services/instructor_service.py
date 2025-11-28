from app.db.mongo import get_database
from app.core.security import get_password_hash
from bson import ObjectId
from datetime import datetime

class InstructorService:
    @staticmethod
    async def create_instructor(instructor_data: dict):
        db = get_database()
        instructor_data["password_hash"] = get_password_hash(instructor_data.pop("password"))
        instructor_data["created_at"] = datetime.utcnow()
        instructor_data["updated_at"] = datetime.utcnow()
        
        result = await db.instructors.insert_one(instructor_data)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_instructor_by_email(email: str):
        db = get_database()
        return await db.instructors.find_one({"email": email})
    
    @staticmethod
    async def get_all_instructors():
        db = get_database()
        instructors = []
        async for instructor in db.instructors.find():
            instructor["id"] = str(instructor["_id"])
            instructors.append(instructor)
        return instructors