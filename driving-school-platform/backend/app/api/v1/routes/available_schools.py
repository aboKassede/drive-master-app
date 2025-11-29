from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from bson import ObjectId

router = APIRouter()

@router.get("/available")
async def get_available_schools(current_user: dict = Depends(get_current_user)):
    """Get list of available schools for students to join"""
    try:
        db = get_database()
        schools = []
        
        async for school in db.schools.find({"status": "active"}):
            school_data = {
                "id": str(school["_id"]),
                "name": school.get("name", ""),
                "address": school.get("address", ""),
                "phone": school.get("phone", ""),
                "services": school.get("services", []),
                "lesson_types": school.get("lesson_types", []),
                "pricing": school.get("pricing", []),
                "operating_hours": school.get("operating_hours", {}),
                "total_students": school.get("total_students", 0),
                "total_instructors": school.get("total_instructors", 0),
                "average_rating": school.get("average_rating", 0.0),
                "description": school.get("description", "")
            }
            schools.append(school_data)
        
        return {"schools": schools}
    
    except Exception as e:
        print(f"Error fetching available schools: {e}")
        return {"schools": []}

@router.get("/my-school")
async def get_my_school(current_user: dict = Depends(get_current_user)):
    """Get current user's school information"""
    try:
        if current_user["user_type"] != "student":
            raise HTTPException(status_code=403, detail="Only students can view their school")
        
        db = get_database()
        student = await db.students.find_one({"email": current_user["email"]})
        
        if not student or not student.get("school_id"):
            return {"school": None, "status": "no_school"}
        
        school = await db.schools.find_one({"_id": ObjectId(student["school_id"])})
        
        if not school:
            return {"school": None, "status": "school_not_found"}
        
        school_data = {
            "id": str(school["_id"]),
            "name": school.get("name", ""),
            "address": school.get("address", ""),
            "phone": school.get("phone", ""),
            "email": school.get("email", ""),
            "services": school.get("services", []),
            "operating_hours": school.get("operating_hours", {}),
            "status": student.get("school_status", "pending")
        }
        
        return {"school": school_data, "status": student.get("school_status", "pending")}
    
    except Exception as e:
        print(f"Error fetching student school: {e}")
        return {"school": None, "status": "error"}