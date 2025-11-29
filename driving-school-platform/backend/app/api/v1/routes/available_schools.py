from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from bson import ObjectId
from datetime import datetime

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

@router.post("/seed")
async def seed_schools():
    """Create sample schools for testing"""
    try:
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
                "lesson_types": ["Basic", "Advanced", "Highway"],
                "pricing": [{"type": "Basic", "price": 50}, {"type": "Advanced", "price": 70}],
                "operating_hours": {"monday": "9:00-17:00", "tuesday": "9:00-17:00"},
                "total_students": 0,
                "total_instructors": 0,
                "average_rating": 4.8,
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
                "lesson_types": ["Beginner", "Intermediate", "Expert"],
                "pricing": [{"type": "Beginner", "price": 45}, {"type": "Expert", "price": 80}],
                "operating_hours": {"monday": "8:00-18:00", "tuesday": "8:00-18:00"},
                "total_students": 0,
                "total_instructors": 0,
                "average_rating": 4.6,
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
                "lesson_types": ["City", "Highway", "Night"],
                "pricing": [{"type": "City", "price": 55}, {"type": "Night", "price": 65}],
                "operating_hours": {"monday": "10:00-20:00", "tuesday": "10:00-20:00"},
                "total_students": 0,
                "total_instructors": 0,
                "average_rating": 4.4,
                "instructors": [],
                "students": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        result = await db.schools.insert_many(schools)
        return {"message": f"Created {len(result.inserted_ids)} schools successfully"}
    
    except Exception as e:
        print(f"Error seeding schools: {e}")
        return {"message": f"Error: {str(e)}"}