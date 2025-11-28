from app.db.mongo import get_database
from bson import ObjectId
from datetime import datetime, timedelta

class ScheduleService:
    @staticmethod
    async def get_available_slots(instructor_id: str, date: str):
        db = get_database()
        
        # Parse date
        target_date = datetime.strptime(date, "%Y-%m-%d")
        start_of_day = target_date.replace(hour=0, minute=0, second=0)
        end_of_day = target_date.replace(hour=23, minute=59, second=59)
        
        # Get booked slots
        booked_slots = []
        async for lesson in db.lessons.find({
            "instructor_id": ObjectId(instructor_id),
            "scheduled_date": {"$gte": start_of_day, "$lte": end_of_day},
            "status": {"$ne": "cancelled"}
        }):
            booked_slots.append(lesson["scheduled_date"])
        
        # Generate available slots (9 AM to 5 PM)
        available_slots = []
        for hour in range(9, 17):
            slot_time = target_date.replace(hour=hour, minute=0, second=0)
            if slot_time not in booked_slots:
                available_slots.append(slot_time.isoformat())
        
        return available_slots