from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class BookingStatus(str, Enum):
    REQUESTED = "requested"
    PENDING_INSTRUCTOR = "pending_instructor"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class BookingType(str, Enum):
    LESSON = "lesson"
    SCHOOL_JOIN = "school_join"

class Booking(BaseModel):
    # Core booking info
    booking_type: BookingType
    student_id: str
    
    # For lesson bookings
    instructor_id: Optional[str] = None
    lesson_id: Optional[str] = None
    preferred_date: Optional[datetime] = None
    preferred_time_slots: List[str] = []
    
    # For school join requests
    school_id: Optional[str] = None
    
    # Status and workflow
    status: BookingStatus = BookingStatus.REQUESTED
    
    # Approval workflow
    requested_at: datetime
    instructor_response_at: Optional[datetime] = None
    school_response_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    
    # Messages and reasons
    student_message: Optional[str] = None
    instructor_response: Optional[str] = None
    school_response: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    # Preferences
    preferred_instructor_gender: Optional[str] = None
    special_requirements: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime