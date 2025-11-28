from app.db.mongo import get_database
from app.core.security import get_password_hash
from bson import ObjectId
from datetime import datetime

class StudentService:
    @staticmethod
    async def create_student(student_data: dict):
        db = get_database()
        student_data["password_hash"] = get_password_hash(student_data.pop("password"))
        student_data["created_at"] = datetime.utcnow()
        student_data["updated_at"] = datetime.utcnow()
        
        result = await db.students.insert_one(student_data)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_student_by_email(email: str):
        db = get_database()
        return await db.students.find_one({"email": email})
    
    @staticmethod
    async def update_student(student_id: str, update_data: dict):
        db = get_database()
        update_data["updated_at"] = datetime.utcnow()
        
        await db.students.update_one(
            {"_id": ObjectId(student_id)},
            {"$set": update_data}
        )
        return await db.students.find_one({"_id": ObjectId(student_id)})