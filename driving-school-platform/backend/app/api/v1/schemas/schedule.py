from pydantic import BaseModel
from typing import List
from datetime import datetime

class AvailableSlot(BaseModel):
    datetime: datetime
    duration_minutes: int = 60

class ScheduleRequest(BaseModel):
    instructor_id: str
    date: str  # YYYY-MM-DD format

class ScheduleResponse(BaseModel):
    available_slots: List[str]  # ISO datetime strings