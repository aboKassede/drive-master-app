import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def view_all_data():
    client = AsyncIOMotorClient("mongodb://admin:password@54.157.242.59:27017/driving_school?authSource=admin")
    db = client.driving_school
    
    print("=== STUDENTS ===")
    async for doc in db.students.find():
        print(f"Email: {doc.get('email')}, Name: {doc.get('first_name')} {doc.get('last_name')}")
    
    print("\n=== INSTRUCTORS ===")
    async for doc in db.instructors.find():
        print(f"Email: {doc.get('email')}, Name: {doc.get('first_name')} {doc.get('last_name')}, Rate: ${doc.get('hourly_rate')}")
    
    print("\n=== SCHOOLS ===")
    async for doc in db.schools.find():
        print(f"Name: {doc.get('name')}, Address: {doc.get('address')}")
    
    print("\n=== LESSONS ===")
    async for doc in db.lessons.find():
        print(f"Type: {doc.get('lesson_type')}, Date: {doc.get('scheduled_date')}, Status: {doc.get('status')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(view_all_data())