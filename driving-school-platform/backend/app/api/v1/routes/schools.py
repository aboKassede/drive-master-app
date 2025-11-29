from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from app.utils.validation import validate_object_id, validate_required_fields
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
    
    async for school in db.schools.find({"status": "active"}):
        school["id"] = str(school["_id"])
        del school["_id"]  # Remove _id to avoid serialization issues
        schools.append(school)
    
    return schools

@router.post("/{school_id}/join")
async def join_school(
    school_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_type"] != "student":
        raise HTTPException(status_code=403, detail="Only students can join schools")
    
    # Validate school_id
    school_obj_id = validate_object_id(school_id, "school_id")
    
    db = get_database()
    
    # Verify school exists
    school = await db.schools.find_one({"_id": school_obj_id})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Get student
    student = await db.students.find_one({"email": current_user["email"]})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if request already exists
    existing = await db.school_requests.find_one({
        "student_id": student["_id"],
        "school_id": school_obj_id,
        "status": "pending"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Join request already pending")
    
    # Create join request
    request_dict = {
        "student_id": student["_id"],
        "school_id": school_obj_id,
        "status": "pending",
        "student_name": f"{student.get('first_name', '')} {student.get('last_name', '')}".strip(),
        "student_email": student.get("email"),
        "student_phone": student.get("phone", ""),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.school_requests.insert_one(request_dict)
    
    return {"message": "Join request sent successfully"}

@router.get("/{school_id}/requests")
async def get_school_requests(
    school_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Validate school_id
    school_obj_id = validate_object_id(school_id, "school_id")
    
    db = get_database()
    
    # Verify user is school admin or instructor
    school = await db.schools.find_one({"_id": school_obj_id})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Check if user has permission to view school requests
    if current_user["user_type"] == "instructor":
        instructor = await db.instructors.find_one({"email": current_user["email"]})
        if not instructor or str(instructor["_id"]) not in school.get("instructor_ids", []):
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user["user_type"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    requests = []
    async for request in db.school_requests.find({
        "school_id": school_obj_id,
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
    # Validate request_id
    request_obj_id = validate_object_id(request_id, "request_id")
    
    db = get_database()
    
    # Get request details first
    request = await db.school_requests.find_one({"_id": request_obj_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Request is not pending")
    
    # Verify user can approve requests for this school
    school = await db.schools.find_one({"_id": request["school_id"]})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    if current_user["user_type"] == "instructor":
        instructor = await db.instructors.find_one({"email": current_user["email"]})
        if not instructor or str(instructor["_id"]) not in school.get("instructor_ids", []):
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user["user_type"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update request status
    await db.school_requests.update_one(
        {"_id": request_obj_id},
        {"$set": {"status": "approved", "updated_at": datetime.utcnow()}}
    )
    
    # Add student to school
    await db.schools.update_one(
        {"_id": request["school_id"]},
        {"$addToSet": {"students": request["student_id"]}}
    )
    
    # Update student with school info
    await db.students.update_one(
        {"_id": request["student_id"]},
        {"$set": {"school_id": request["school_id"], "school_status": "approved"}}
    )
    
    return {"message": "Student approved successfully"}

@router.post("/seed")
async def seed_schools():
    db = get_database()
    
    # Check if schools already exist
    existing_count = await db.schools.count_documents({})
    if existing_count > 0:
        return {"message": f"Already have {existing_count} schools"}
    
    # Create sample schools
    schools = [
        {
            "name": "DriveRight Academy",
            "address": "123 Main Street, New York, NY 10001",
            "phone": "+1-555-0101",
            "email": "info@driveright.com",
            "description": "Premier driving school with experienced instructors",
            "status": "active",
            "rating": 4.8,
            "established": "2015",
            "services": ["Manual Transmission", "Automatic Transmission", "Defensive Driving"],
            "instructors": [],
            "students": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "SafeDrive Institute",
            "address": "456 Oak Avenue, Los Angeles, CA 90210",
            "phone": "+1-555-0202",
            "email": "contact@safedrive.com",
            "description": "Safety-focused driving education since 2010",
            "status": "active",
            "rating": 4.6,
            "established": "2010",
            "services": ["Beginner Lessons", "Advanced Driving", "Highway Training"],
            "instructors": [],
            "students": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "City Driving School",
            "address": "789 Pine Road, Chicago, IL 60601",
            "phone": "+1-555-0303",
            "email": "admin@citydriving.com",
            "description": "Urban driving specialists",
            "status": "active",
            "rating": 4.4,
            "established": "2018",
            "services": ["City Driving", "Parallel Parking", "Night Driving"],
            "instructors": [],
            "students": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    result = await db.schools.insert_many(schools)
    return {"message": f"Created {len(result.inserted_ids)} schools successfully"}