from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from bson import ObjectId
from .student import PyObjectId

class Schedule(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    instructor_id: PyObjectId
    date: datetime
    available_slots: List[datetime] = []
    booked_slots: List[datetime] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}