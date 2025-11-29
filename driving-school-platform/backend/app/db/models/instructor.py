from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, time
from enum import Enum

class VehicleType(str, Enum):
    MANUAL = "manual"
    AUTOMATIC = "automatic"
    BOTH = "both"

class InstructorStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class WorkingDay(BaseModel):
    day: str  # monday, tuesday, etc.
    start_time: time
    end_time: time
    available: bool = True

class Instructor(BaseModel):
    email: EmailStr
    password_hash: str
    first_name: str
    last_name: str
    phone: str
    
    # Professional details
    license_number: str
    certification_date: datetime
    experience_years: Optional[int] = None
    hourly_rate: float
    
    # Specializations and vehicle types
    specializations: List[str] = []  # manual, automatic, highway, parking, etc.
    vehicle_types: List[VehicleType] = []
    
    # School relationship
    school_id: Optional[str] = None
    
    # Availability and schedule
    work_hours: List[WorkingDay] = []
    availability: List[dict] = []  # Available time slots
    
    # Performance metrics
    total_students: int = 0
    average_rating: float = 0.0
    total_ratings: int = 0
    
    # Status and profile
    status: InstructorStatus = InstructorStatus.ACTIVE
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    
    # Blocked students
    blocked_students: List[str] = []
    
    created_at: datetime
    updated_at: datetime