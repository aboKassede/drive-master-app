from fastapi import APIRouter
from app.db.mongo import get_database
from datetime import datetime

router = APIRouter()

@router.post("/create-school")
async def create_sample_school():
    """Create a sample school for testing"""
    try:
        db = get_database()
        
        school = {
            "name": "DriveMaster Academy",
            "address": "123 Main Street, City Center",
            "phone": "555-0123",
            "email": "info@drivemaster.com",
            "license_number": "SCH001",
            "established_date": datetime(2015, 3, 1),
            "services": ["manual_transmission", "automatic_transmission", "highway_driving", "parking"],
            "lesson_types": ["driving", "theory", "mock_test", "highway"],
            "pricing": [
                {"lesson_type": "driving", "price": 45.0, "duration_minutes": 60},
                {"lesson_type": "highway", "price": 55.0, "duration_minutes": 60},
                {"lesson_type": "theory", "price": 30.0, "duration_minutes": 45}
            ],
            "operating_hours": {
                "monday": "08:00-18:00",
                "tuesday": "08:00-18:00", 
                "wednesday": "08:00-18:00",
                "thursday": "08:00-18:00",
                "friday": "08:00-18:00",
                "saturday": "09:00-16:00",
                "sunday": "closed"
            },
            "instructor_ids": [],
            "student_ids": [],
            "pending_student_requests": [],
            "admin_emails": ["info@drivemaster.com"],
            "status": "active",
            "total_students": 0,
            "total_instructors": 0,
            "average_rating": 4.5,
            "description": "Professional driving school with experienced instructors",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.schools.insert_one(school)
        return {"message": "School created successfully", "school_id": str(result.inserted_id)}
    
    except Exception as e:
        print(f"Error creating school: {e}")
        return {"error": str(e)}