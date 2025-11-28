from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from bson import ObjectId
from .student import PyObjectId

class LessonStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    IN_PROGRESS = "in_progress"

class LessonType(str, Enum):
    THEORY = "theory"
    PRACTICAL = "practical"
    ROAD_TEST = "road_test"

class Lesson(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    student_id: PyObjectId
    instructor_id: PyObjectId
    lesson_type: LessonType
    scheduled_date: datetime
    duration_minutes: int = 60
    status: LessonStatus = LessonStatus.SCHEDULED
    notes: Optional[str] = None
    rating: Optional[int] = None
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}