from app.db.mongo import get_database
from app.core.security import get_password_hash
from datetime import datetime

async def seed_students():
    db = get_database()
    
    # Check if students already exist
    existing_count = await db.students.count_documents({})
    if existing_count > 0:
        print("Students already seeded")
        return
    
    students = [
        {
            "email": "john.doe@example.com",
            "password_hash": get_password_hash("password123"),
            "first_name": "John",
            "last_name": "Doe",
            "phone": "1234567890",
            "date_of_birth": datetime(1995, 5, 15),
            "emergency_contact": "Jane Doe - 0987654321",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "email": "alice.smith@example.com",
            "password_hash": get_password_hash("password123"),
            "first_name": "Alice",
            "last_name": "Smith",
            "phone": "2345678901",
            "date_of_birth": datetime(1998, 8, 22),
            "emergency_contact": "Bob Smith - 1987654321",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.students.insert_many(students)
    print(f"Seeded {len(students)} students")