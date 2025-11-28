from app.db.mongo import get_database
from app.core.security import get_password_hash
from datetime import datetime

async def seed_instructors():
    db = get_database()
    
    # Check if instructors already exist
    existing_count = await db.instructors.count_documents({})
    if existing_count > 0:
        print("Instructors already seeded")
        return
    
    instructors = [
        {
            "email": "mike.instructor@example.com",
            "password_hash": get_password_hash("password123"),
            "first_name": "Mike",
            "last_name": "Johnson",
            "phone": "3456789012",
            "license_number": "INS123456",
            "certification_date": datetime(2020, 1, 15),
            "specializations": ["manual", "automatic"],
            "hourly_rate": 45.0,
            "availability": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "email": "sarah.instructor@example.com",
            "password_hash": get_password_hash("password123"),
            "first_name": "Sarah",
            "last_name": "Wilson",
            "phone": "4567890123",
            "license_number": "INS789012",
            "certification_date": datetime(2019, 6, 10),
            "specializations": ["automatic", "highway"],
            "hourly_rate": 50.0,
            "availability": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.instructors.insert_many(instructors)
    print(f"Seeded {len(instructors)} instructors")