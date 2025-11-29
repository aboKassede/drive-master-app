from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_school(
    school_data: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create schools")
    
    db = get_database()
    
    school_dict = {
        **school_data,
        "status": "pending",
        "instructors": [],
        "students": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.schools.insert_one(school_dict)
    school_dict["id"] = str(result.inserted_id)
    
    return school_dict

@router.get("/")
async def get_schools():
    db = get_database()
    schools = []
    
    async for school in db.schools.find({"status": "approved"}):
        school["id"] = str(school["_id"])
        schools.append(school)
    
    return schools

@router.post("/{school_id}/join")
async def join_school(
    school_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "student":
        raise HTTPException(status_code=403, detail="Only students can join schools")
    
    db = get_database()
    
    # Get student
    student = await db.students.find_one({"email": current_user["email"]})
    
    # Create join request
    request_dict = {
        "student_id": student["_id"],
        "school_id": ObjectId(school_id),
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    await db.school_requests.insert_one(request_dict)
    
    return {"message": "Join request sent successfully"}

@router.get("/{school_id}/requests")
async def get_school_requests(
    school_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Verify user is school admin or instructor
    school = await db.schools.find_one({"_id": ObjectId(school_id)})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    requests = []
    async for request in db.school_requests.find({
        "school_id": ObjectId(school_id),
        "status": "pending"
    }):
        # Get student details
        student = await db.students.find_one({"_id": request["student_id"]})
        request["id"] = str(request["_id"])
        request["student"] = {
            "id": str(student["_id"]),
            "name": f"{student['first_name']} {student['last_name']}",
            "email": student["email"],
            "phone": student["phone"]
        }
        requests.append(request)
    
    return requests

@router.put("/requests/{request_id}/approve")
async def approve_student_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Update request status
    await db.school_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "approved", "updated_at": datetime.utcnow()}}
    )
    
    # Get request details
    request = await db.school_requests.find_one({"_id": ObjectId(request_id)})
    
    # Add student to school
    await db.schools.update_one(
        {"_id": request["school_id"]},
        {"$push": {"students": request["student_id"]}}
    )
    
    # Update student with school info
    await db.students.update_one(
        {"_id": request["student_id"]},
        {"$set": {"school_id": request["school_id"], "school_status": "approved"}}
    )
    
    return {"message": "Student approved successfully"}