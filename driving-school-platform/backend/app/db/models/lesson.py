from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class LessonType(str, Enum):
    DRIVING = "driving"
    THEORY = "theory"
    MOCK_TEST = "mock_test"
    SIMULATOR = "simulator"
    HIGHWAY = "highway"
    PARKING = "parking"

class LessonStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

class VehicleType(str, Enum):
    MANUAL = "manual"
    AUTOMATIC = "automatic"

class GPSLocation(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None

class Lesson(BaseModel):
    student_id: str
    instructor_id: str
    school_id: Optional[str] = None
    
    # Lesson details
    lesson_type: LessonType
    vehicle_type: Optional[VehicleType] = None
    scheduled_date: datetime
    duration_minutes: int = 60
    
    # Status and workflow
    status: LessonStatus = LessonStatus.PENDING
    instructor_accepted: bool = False
    student_confirmed: bool = False
    
    # Location and GPS
    pickup_location: Optional[GPSLocation] = None
    dropoff_location: Optional[GPSLocation] = None
    start_location: Optional[GPSLocation] = None
    end_location: Optional[GPSLocation] = None
    
    # Lesson execution
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    actual_duration_minutes: Optional[int] = None
    
    # Progress and notes
    instructor_notes: Optional[str] = None
    student_performance: Optional[Dict] = None
    skills_practiced: List[str] = []
    areas_to_improve: List[str] = []
    performance_rating: Optional[int] = None  # 1-5 scale
    
    # Attendance
    student_attended: bool = False
    instructor_attended: bool = False
    attendance_marked_at: Optional[datetime] = None
    
    # Payment
    price: Optional[float] = None
    payment_status: str = "pending"  # pending, paid, refunded
    payment_id: Optional[str] = None
    
    # Cancellation and rescheduling
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[str] = None  # student, instructor, school
    cancelled_at: Optional[datetime] = None
    
    rescheduled_from: Optional[str] = None  # Original lesson ID
    rescheduled_to: Optional[str] = None    # New lesson ID
    
    # Notifications
    reminder_sent: bool = False
    confirmation_sent: bool = False
    
    created_at: datetime
    updated_at: datetime