from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database

router = APIRouter()

@router.get("/me")
async def get_current_instructor(current_user: dict = Depends(get_current_user)):
    try:
        if current_user["user_type"] != "instructor":
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = get_database()
        instructor = await db.instructors.find_one({"email": current_user["email"]})
        
        if not instructor:
            raise HTTPException(status_code=404, detail="Instructor not found")
        
        # Clean response - remove sensitive data and handle missing fields
        response = {
            "id": str(instructor["_id"]),
            "email": instructor.get("email", ""),
            "first_name": instructor.get("first_name", ""),
            "last_name": instructor.get("last_name", ""),
            "phone": instructor.get("phone", ""),
            "license_number": instructor.get("license_number", ""),
            "certification_date": instructor.get("certification_date"),
            "hourly_rate": instructor.get("hourly_rate", 0),
            "specializations": instructor.get("specializations", []),
            "availability": instructor.get("availability", []),
            "created_at": instructor.get("created_at")
        }
        
        return response
    except Exception as e:
        print(f"Error fetching instructor profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@router.get("/", response_model=List[dict])
async def get_all_instructors():
    try:
        db = get_database()
        instructors = []
        async for instructor in db.instructors.find():
            instructor["id"] = str(instructor["_id"])
            # Remove sensitive fields
            instructor.pop("password", None)
            instructor.pop("_id", None)
            instructors.append(instructor)
        
        return instructors
    except Exception as e:
        print(f"Error fetching instructors: {e}")
        return []