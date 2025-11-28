from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.schemas.student import StudentResponse, StudentUpdate
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=StudentResponse)
async def get_current_student(current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db = get_database()
    student = await db.students.find_one({"email": current_user["email"]})
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student["id"] = str(student["_id"])
    return student

@router.put("/me", response_model=StudentResponse)
async def update_current_student(
    student_update: StudentUpdate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db = get_database()
    update_data = {k: v for k, v in student_update.dict().items() if v is not None}
    
    if update_data:
        await db.students.update_one(
            {"email": current_user["email"]},
            {"$set": update_data}
        )
    
    student = await db.students.find_one({"email": current_user["email"]})
    student["id"] = str(student["_id"])
    return student

@router.get("/", response_model=List[StudentResponse])
async def get_all_students(current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db = get_database()
    students = []
    async for student in db.students.find():
        student["id"] = str(student["_id"])
        students.append(student)
    
    return students