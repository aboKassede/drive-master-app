from fastapi import APIRouter, Depends
from typing import List
from app.api.v1.dependencies import get_current_user
from app.db.mongo import get_database
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/available-slots")
async def get_available_slots(
    instructor_id: str,
    date: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Parse date
    target_date = datetime.strptime(date, "%Y-%m-%d")
    
    # Get existing bookings for the day
    start_of_day = target_date.replace(hour=0, minute=0, second=0)
    end_of_day = target_date.replace(hour=23, minute=59, second=59)
    
    booked_slots = []
    async for lesson in db.lessons.find({
        "instructor_id": instructor_id,
        "scheduled_date": {
            "$gte": start_of_day,
            "$lte": end_of_day
        },
        "status": {"$ne": "cancelled"}
    }):
        booked_slots.append(lesson["scheduled_date"])
    
    # Generate available slots (9 AM to 5 PM, 1-hour slots)
    available_slots = []
    for hour in range(9, 17):
        slot_time = target_date.replace(hour=hour, minute=0, second=0)
        if slot_time not in booked_slots:
            available_slots.append(slot_time.isoformat())
    
    return {"available_slots": available_slots}