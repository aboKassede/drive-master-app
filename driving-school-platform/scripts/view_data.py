import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import json
from datetime import datetime

def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

async def view_all_data():
    client = AsyncIOMotorClient("mongodb://admin:password@54.157.242.59:27017/driving_school?authSource=admin")
    db = client.driving_school
    
    collections = ['students', 'instructors', 'schools', 'lessons', 'bookings', 'messages', 'notifications']
    
    for collection_name in collections:
        print(f"\n{'='*50}")
        print(f"COLLECTION: {collection_name.upper()}")
        print(f"{'='*50}")
        
        collection = db[collection_name]
        count = await collection.count_documents({})
        print(f"Total documents: {count}")
        
        if count > 0:
            print("\nDocuments:")
            async for doc in collection.find().limit(10):
                doc['_id'] = str(doc['_id'])
                print(json.dumps(doc, indent=2, default=json_serial))
                print("-" * 30)
        else:
            print("No documents found.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(view_all_data())