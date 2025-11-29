from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class SchoolStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class LessonPricing(BaseModel):
    lesson_type: str
    price: float
    duration_minutes: int

class OperatingHours(BaseModel):
    monday: Optional[str] = None
    tuesday: Optional[str] = None
    wednesday: Optional[str] = None
    thursday: Optional[str] = None
    friday: Optional[str] = None
    saturday: Optional[str] = None
    sunday: Optional[str] = None

class School(BaseModel):
    name: str
    address: str
    phone: str
    email: EmailStr
    
    # Legal and licensing
    license_number: str
    established_date: datetime
    
    # Services and pricing
    services: List[str] = []  # manual_transmission, automatic_transmission, highway_driving, etc.
    lesson_types: List[str] = []  # driving, theory, mock_test, simulator
    pricing: List[LessonPricing] = []
    
    # Operations
    operating_hours: OperatingHours
    
    # Staff and management
    main_instructor_id: Optional[str] = None
    instructor_ids: List[str] = []
    admin_emails: List[str] = []
    
    # Student management
    student_ids: List[str] = []
    pending_student_requests: List[str] = []
    
    # Media and branding
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    
    # Business details
    payment_details: Optional[Dict] = None
    bank_account: Optional[str] = None
    
    # Status and metrics
    status: SchoolStatus = SchoolStatus.ACTIVE
    total_students: int = 0
    total_instructors: int = 0
    average_rating: float = 0.0
    
    created_at: datetime
    updated_at: datetime