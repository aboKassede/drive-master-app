from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.db.models.lesson import LessonStatus, LessonType

class LessonCreate(BaseModel):
    instructor_id: str
    lesson_type: LessonType
    scheduled_date: datetime
    duration_minutes: int = 60

class LessonUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    status: Optional[LessonStatus] = None
    notes: Optional[str] = None
    rating: Optional[int] = None
    feedback: Optional[str] = None

class LessonResponse(BaseModel):
    id: str
    student_id: str
    instructor_id: str
    lesson_type: LessonType
    scheduled_date: datetime
    duration_minutes: int
    status: LessonStatus
    notes: Optional[str] = None
    rating: Optional[int] = None
    feedback: Optional[str] = None
    created_at: datetime