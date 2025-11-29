from app.db.mongo import get_database
from datetime import datetime

async def seed_schools():
    db = get_database()
    
    # Check if schools already exist
    existing_count = await db.schools.count_documents({})
    if existing_count > 0:
        print("Schools already seeded")
        return
    
    schools = [
        {
            "name": "DriveMaster Academy",
            "address": "123 Main Street, City Center",
            "phone": "555-0123",
            "email": "info@drivemaster.com",
            "license_number": "SCH001",
            "established_date": datetime(2015, 3, 1),
            "services": ["manual_transmission", "automatic_transmission", "highway_driving", "parking"],
            "operating_hours": {
                "monday": "08:00-18:00",
                "tuesday": "08:00-18:00", 
                "wednesday": "08:00-18:00",
                "thursday": "08:00-18:00",
                "friday": "08:00-18:00",
                "saturday": "09:00-16:00",
                "sunday": "closed"
            },
            "pricing": {
                "standard_lesson": 45.0,
                "highway_lesson": 55.0,
                "test_preparation": 60.0
            },
            "active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.schools.insert_many(schools)
    print(f"Seeded {len(schools)} schools")