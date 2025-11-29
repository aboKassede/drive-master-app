from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database

router = APIRouter()

@router.get("/me")
async def get_current_instructor(current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db = get_database()
    instructor = await db.instructors.find_one({"email": current_user["email"]})
    
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    
    instructor["id"] = str(instructor["_id"])
    return instructor

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